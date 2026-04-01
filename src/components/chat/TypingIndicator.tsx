import { motion } from "framer-motion";

const TypingIndicator = ({ name = "Customer" }: { name?: string }) => {
  return (
    <div className="flex items-end gap-2 px-6">
      <div className="w-8 h-8 rounded-full bg-chat-customer flex items-center justify-center text-xs font-semibold text-chat-customer-foreground shrink-0">
        {name.charAt(0)}
      </div>
      <div className="bg-chat-customer rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TypingIndicator;
