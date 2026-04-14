import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ThumbsUp, ThumbsDown, Bot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "agent" | "customer";
  timestamp: Date;
  read?: boolean;
}

const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isAgent = message.sender === "agent";
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<"up" | "down" | null>(null);
  const [showActions, setShowActions] = useState(false);

  const timeAgo = formatDistanceToNow(message.timestamp, { addSuffix: true });
  const exactTime = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-end gap-2 px-6 ${isAgent ? "flex-row-reverse" : ""}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isAgent ? (
        <div className="w-8 h-8 rounded-full bg-chat-customer flex items-center justify-center text-xs font-semibold text-chat-customer-foreground shrink-0">
          S
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[70%] ${isAgent ? "items-end" : "items-start"}`}>
        <div className="relative group">
          <div
            className={`px-4 py-2.5 text-sm leading-relaxed ${
              isAgent
                ? "bg-chat-agent text-chat-agent-foreground rounded-2xl rounded-br-md"
                : "bg-chat-customer text-chat-customer-foreground rounded-2xl rounded-bl-md"
            }`}
          >
            {message.text}
          </div>

          {/* Action buttons on hover */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 ${
                  isAgent ? "right-full mr-2" : "left-full ml-2"
                }`}
              >
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-card border text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy message"
                >
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </button>
                {isAgent && (
                  <>
                    <button
                      onClick={() => setReaction(reaction === "up" ? null : "up")}
                      className={`p-1.5 rounded-lg bg-card border transition-colors ${
                        reaction === "up" ? "text-green-500 border-green-500" : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Helpful"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setReaction(reaction === "down" ? null : "down")}
                      className={`p-1.5 rounded-lg bg-card border transition-colors ${
                        reaction === "down" ? "text-red-500 border-red-500" : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reaction indicator */}
        {reaction && (
          <span className="text-xs">
            {reaction === "up" ? "👍 Helpful" : "👎 Not helpful"}
          </span>
        )}

        {/* Timestamp + read receipt */}
        <div className={`flex items-center gap-1 ${isAgent ? "flex-row-reverse" : ""}`}>
          <span className="text-[11px] text-muted-foreground" title={exactTime}>
            {timeAgo}
          </span>
          {!isAgent && (
            <span className="text-[11px] text-primary" title={message.read ? "Read" : "Delivered"}>
              {message.read ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
