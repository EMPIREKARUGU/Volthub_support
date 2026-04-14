import { useRef, useState } from "react";
import { Send, Smile, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const QUICK_REPLIES = [
  "What phones do you have?",
  "Show me solar panels",
  "Cheapest laptop?",
  "Do you have inverters?",
  "What's your return policy?",
];

const EMOJIS = ["😀", "😄", "😉", "😍", "🤔", "👍", "🎉", "📎", "📞"];

interface MessageInputProps {
  onSend: (text: string) => void;
}

const MessageInput = ({ onSend }: MessageInputProps) => {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = text.trim().length > 0 || !!attachedFile;

  const handleSend = () => {
    if (!canSend) return;
    const messageText = [text.trim(), attachedFile ? `Attached file: ${attachedFile}` : ""]
      .filter(Boolean)
      .join(" ");
    onSend(messageText);
    setText("");
    setAttachedFile(null);
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAttachedFile(file.name);
    event.target.value = "";
  };

  const insertEmoji = (emoji: string) => {
    setText((current) => `${current}${emoji}`);
    setShowEmojiPicker(false);
  };

  return (
    <div className="border-t bg-card px-6 py-3 shrink-0 space-y-2">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

      {/* Quick replies */}
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => onSend(reply)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full border bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="text-muted-foreground hover:text-foreground h-9 w-9 shrink-0"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-muted-foreground hover:text-foreground h-9 w-9 shrink-0"
          >
            <Smile className="w-4 h-4" />
          </Button>
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 left-0 z-10 w-44 rounded-2xl border border-border bg-popover p-3 shadow-lg">
              <div className="flex items-center justify-between px-1 pb-2">
                <span className="text-xs font-medium text-muted-foreground">Choose an emoji</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => setShowEmojiPicker(false)} className="h-7 w-7">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {EMOJIS.map((emoji) => (
                  <button key={emoji} type="button" onClick={() => insertEmoji(emoji)}
                    className="rounded-2xl border border-input bg-background p-2 text-lg hover:bg-secondary">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="w-full resize-none rounded-xl border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 scrollbar-thin"
          />
          {attachedFile && (
            <div className="mt-2 flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs">
              <span className="text-muted-foreground">Attached:</span>
              <span className="font-medium">{attachedFile}</span>
              <button type="button" onClick={() => setAttachedFile(null)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <motion.div whileTap={{ scale: 0.9 }}>
          <Button type="button" size="icon" onClick={handleSend} disabled={!canSend}
            className="h-10 w-10 rounded-xl shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default MessageInput;