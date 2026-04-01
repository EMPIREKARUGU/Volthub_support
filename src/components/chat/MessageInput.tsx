import { useState } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const QUICK_REPLIES = [
  "I'll look into that for you",
  "Could you share a screenshot?",
  "Let me transfer you to a specialist",
];

interface MessageInputProps {
  onSend: (text: string) => void;
}

const MessageInput = ({ onSend }: MessageInputProps) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-card px-6 py-3 shrink-0 space-y-2">
      {/* Quick replies */}
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => onSend(reply)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full border bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9 shrink-0">
          <Paperclip className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9 shrink-0">
          <Smile className="w-4 h-4" />
        </Button>
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="w-full resize-none rounded-xl border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 scrollbar-thin"
          />
        </div>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!text.trim()}
            className="h-10 w-10 rounded-xl shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default MessageInput;
