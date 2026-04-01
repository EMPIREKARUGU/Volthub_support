import { useState, useRef, useEffect, useCallback } from "react";
import TopBar from "@/components/chat/TopBar";
import ChatBubble, { type ChatMessage } from "@/components/chat/ChatBubble";
import TypingIndicator from "@/components/chat/TypingIndicator";
import MessageInput from "@/components/chat/MessageInput";
import InfoPanel from "@/components/chat/InfoPanel";
import AppSidebar from "@/components/chat/AppSidebar";
import { AnimatePresence } from "framer-motion";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    text: "Hi, I'm having trouble accessing my billing portal. It keeps showing a 'session expired' error after I reset my password.",
    sender: "customer",
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: "2",
    text: "Hi Sarah! I'm sorry to hear that. Let me look into your account right away. Can you confirm the email address you used for the password reset?",
    sender: "agent",
    timestamp: new Date(Date.now() - 90000),
  },
  {
    id: "3",
    text: "Sure, it's sarah.m@email.com",
    sender: "customer",
    timestamp: new Date(Date.now() - 60000),
  },
];

const CUSTOMER_RESPONSES = [
  "Thank you, I'll try that now.",
  "Yes, that's correct.",
  "I see, is there anything else I need to do?",
  "Great, that seems to be working now!",
  "Could you also help me update my payment method?",
];

const Index = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const [customerStatus, setCustomerStatus] = useState<"online" | "typing" | "offline">("online");
  const scrollRef = useRef<HTMLDivElement>(null);
  const responseIndex = useRef(0);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isCustomerTyping, scrollToBottom]);

  const simulateCustomerReply = useCallback(() => {
    setIsCustomerTyping(true);
    setCustomerStatus("typing");

    const delay = 1500 + Math.random() * 2000;
    setTimeout(() => {
      const text = CUSTOMER_RESPONSES[responseIndex.current % CUSTOMER_RESPONSES.length];
      responseIndex.current++;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text,
          sender: "customer",
          timestamp: new Date(),
        },
      ]);
      setIsCustomerTyping(false);
      setCustomerStatus("online");
    }, delay);
  }, []);

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        sender: "agent",
        timestamp: new Date(),
      },
    ]);
    setTimeout(simulateCustomerReply, 800);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          customerName="Sarah Mitchell"
          status={customerStatus}
          connectionStatus="connected"
        />

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-thin py-6 space-y-4"
        >
          <AnimatePresence>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
          {isCustomerTyping && <TypingIndicator name="Sarah" />}
        </div>

        <MessageInput onSend={handleSend} />
      </div>

      {/* Right info panel */}
      <InfoPanel />
    </div>
  );
};

export default Index;
