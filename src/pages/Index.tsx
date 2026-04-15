import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import TopBar from "@/components/chat/TopBar";
import ChatBubble, { type ChatMessage } from "@/components/chat/ChatBubble";
import TypingIndicator from "@/components/chat/TypingIndicator";
import MessageInput from "@/components/chat/MessageInput";
import InfoPanel from "@/components/chat/InfoPanel";
import AppSidebar from "@/components/chat/AppSidebar";
import { AnimatePresence } from "framer-motion";
import { askQuestion } from "@/lib/api";
import CryptoJS from "crypto-js";

const PRODUCT_RECOMMENDATION_RULES: {
  keywords: string[];
  recommendations: { title: string; subtitle: string; icon: "shopping" | "star" | "info" }[];
}[] = [
  {
    keywords: ["headphone", "headset", "audio", "earbud"],
    recommendations: [
      { title: "Volthub Wireless Headset", subtitle: "$49.99 · Fast shipping", icon: "shopping" },
      { title: "Noise-canceling Earbuds", subtitle: "$29.99 · Top rated", icon: "star" },
    ],
  },
  {
    keywords: ["charger", "battery", "power"],
    recommendations: [
      { title: "Volthub Smart Charger", subtitle: "$24.99 · 1-year warranty", icon: "shopping" },
      { title: "Fast Charging Cable", subtitle: "$14.99 · Durable braided", icon: "star" },
    ],
  },
  {
    keywords: ["order", "tracking", "shipping", "delivery", "pending"],
    recommendations: [
      { title: "Volthub Express Shipping", subtitle: "$9.99 · Same day prep", icon: "info" },
      { title: "Order Protection Plan", subtitle: "$4.99 · Covers returns", icon: "shopping" },
    ],
  },
  {
    keywords: ["return", "refund", "exchange"],
    recommendations: [
      { title: "Easy Returns Box", subtitle: "$6.99 · Prepaid label", icon: "shopping" },
      { title: "Volthub Gift Card", subtitle: "$25+ · Flexible credit", icon: "star" },
    ],
  },
  {
    keywords: ["payment", "billing", "portal", "invoice"],
    recommendations: [
      { title: "Volthub Secure Wallet", subtitle: "$0.99 · One-click checkout", icon: "info" },
      { title: "Billing Support Kit", subtitle: "Free · Guides and tools", icon: "shopping" },
    ],
  },
];

const DEFAULT_RECOMMENDATIONS = [
  { title: "Volthub Wireless Headset", subtitle: "$49.99 · Fast shipping", icon: "shopping" as const },
  { title: "Volthub Smart Charger", subtitle: "$24.99 · 1-year warranty", icon: "star" as const },
];

const getRecommendations = (messages: ChatMessage[]) => {
  const latestCustomer = [...messages].reverse().find((m) => m.sender === "customer");
  if (!latestCustomer) return DEFAULT_RECOMMENDATIONS;
  const text = latestCustomer.text.toLowerCase();
  const rule = PRODUCT_RECOMMENDATION_RULES.find((r) => r.keywords.some((k) => text.includes(k)));
  return rule?.recommendations ?? DEFAULT_RECOMMENDATIONS;
};

// --- Encryption Helpers ---
// Note: In production, store the secret key in your environment variables.
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_SECRET || "default-secure-key";

const encryptMessage = (text: string) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

const decryptMessage = (ciphertext: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || ciphertext; // Fallback to raw text if decryption fails
  } catch (error) {
    return ciphertext;
  }
};

const makeId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Subtle ping sound using Web Audio API
const playPing = () => {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.value = 880;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (_) {}
};

const Index = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [botStatus, setBotStatus] = useState<"online" | "typing" | "offline">("online");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping, scrollToBottom]);

  const sendQuestion = useCallback(async (text: string) => {
    setIsBotTyping(true);
    setBotStatus("typing");

    try {
      const response = await askQuestion({ question: text });

      // Mark previous customer messages as read
      setMessages((prev) =>
        prev.map((m) => (m.sender === "customer" ? { ...m, read: true } : m))
      );

      const agentMsg: ChatMessage = {
        id: makeId(),
        // Decrypt the backend's response (with a fallback to plain text)
        text: decryptMessage(response.answer),
        sender: "agent",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMsg]);
      playPing();
      setBotStatus("online");
    } catch (error) {
      const message = error instanceof Error ? error.message : "The bridge could not process that request right now.";
      setMessages((prev) => [
        ...prev,
        { id: makeId(), text: `Backend error: ${message}`, sender: "agent", timestamp: new Date() },
      ]);
      setBotStatus("offline");
    } finally {
      setIsBotTyping(false);
    }
  }, []);

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: makeId(), text, sender: "customer", timestamp: new Date(), read: false },
    ]);
    void sendQuestion(text);
  };

  const handleClearChat = () => {
    setMessages([]);
    setBotStatus("online");
    setIsBotTyping(false);
  };

  const recommendations = useMemo(() => getRecommendations(messages), [messages]);

  return (
    <div className="h-screen flex bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          customerName="Volthub Support"
          status={botStatus}
          connectionStatus="connected"
          phoneNumber="+254 713 695 300"
          onClearChat={handleClearChat}
        />

        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin py-6 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
          {isBotTyping && <TypingIndicator name="Rachel" />}
        </div>

        <MessageInput onSend={handleSend} />
      </div>

      <InfoPanel recommendations={recommendations} onEndChat={handleClearChat} />
    </div>
  );
};

export default Index;