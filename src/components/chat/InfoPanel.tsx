import { Mail, AlertCircle, CheckCircle, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const InfoPanel = () => {
  return (
    <aside className="w-72 border-l bg-card hidden lg:flex flex-col shrink-0">
      <div className="p-5 border-b">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Customer Info
        </h3>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary mb-3">
            S
          </div>
          <p className="text-sm font-semibold text-foreground">Sarah Mitchell</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Mail className="w-3 h-3" /> sarah.m@email.com
          </p>
        </div>
      </div>

      <div className="p-5 border-b flex-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Issue Summary
        </h3>
        <div className="flex items-start gap-2 text-sm text-foreground">
          <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            Unable to access billing portal after password reset. Getting "session expired" error.
          </p>
        </div>
      </div>

      <div className="p-5 space-y-2">
        <Button className="w-full gap-2" variant="default">
          <CheckCircle className="w-4 h-4" /> Resolve
        </Button>
        <Button className="w-full gap-2" variant="outline">
          <ArrowUpCircle className="w-4 h-4" /> Escalate
        </Button>
      </div>
    </aside>
  );
};

export default InfoPanel;
