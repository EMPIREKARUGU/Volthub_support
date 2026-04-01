import { motion } from "framer-motion";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "agent" | "customer";
  timestamp: Date;
}

const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isAgent = message.sender === "agent";
  const time = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-end gap-2 px-6 ${isAgent ? "flex-row-reverse" : ""}`}
    >
      {!isAgent && (
        <div className="w-8 h-8 rounded-full bg-chat-customer flex items-center justify-center text-xs font-semibold text-chat-customer-foreground shrink-0">
          S
        </div>
      )}
      <div className="flex flex-col gap-1 max-w-[70%]">
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed ${
            isAgent
              ? "bg-chat-agent text-chat-agent-foreground rounded-2xl rounded-br-md"
              : "bg-chat-customer text-chat-customer-foreground rounded-2xl rounded-bl-md"
          }`}
        >
          {message.text}
        </div>
        <span
          className={`text-[11px] text-muted-foreground ${
            isAgent ? "text-right" : "text-left"
          }`}
        >
          {time}
        </span>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
