import { Phone, ArrowRightLeft, BellOff, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  customerName: string;
  status: "online" | "typing" | "offline";
  connectionStatus: "connected" | "reconnecting";
  phoneNumber?: string;
  onClearChat?: () => void;
}

const TopBar = ({ customerName, status, connectionStatus, phoneNumber, onClearChat }: TopBarProps) => {
  const statusLabel = status === "typing" ? "Typing…" : status === "online" ? "Online" : "Offline";
  const statusColor = status === "offline" ? "bg-muted-foreground" : "bg-success";

  return (
    <div className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {customerName.charAt(0)}
          </div>
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${statusColor}`} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground leading-none">{customerName}</h2>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            {statusLabel}
            {phoneNumber && <span className="ml-1">• {phoneNumber}</span>}
            {connectionStatus === "reconnecting" && (
              <span className="text-warning text-[10px]">• Reconnecting</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Clear chat button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearChat}
          className="text-muted-foreground hover:text-destructive h-9 w-9"
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        {phoneNumber ? (
          <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
            <a href={`tel:${phoneNumber}`}><Phone className="w-4 h-4" /></a>
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
            <Phone className="w-4 h-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
          <ArrowRightLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
          <BellOff className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-9 w-9">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default TopBar;