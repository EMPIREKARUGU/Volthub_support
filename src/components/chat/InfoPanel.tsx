import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InfoPanelProps {
  recommendations?: unknown[];
  onEndChat?: () => void;
}

const InfoPanel = ({ onEndChat }: InfoPanelProps) => {
  const [showTicketForm, setShowTicketForm] = useState(true);
  const [orderId, setOrderId] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [issueType, setIssueType] = useState("general");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [ticketSent, setTicketSent] = useState(false);

  const supportEmail = "volthublimited@gmail.com";

  const handleTicketSubmit = () => {
    const email = customerEmail.trim();
    const summaryText = summary.trim();
    if (!email || !summaryText) return;

    const subject = `Volthub Support Ticket: ${issueType} - ${summaryText}`;
    const body = `Hello Volthub team,%0D%0A%0D%0AI need assistance with the following:%0D%0A%0D%0AOrder ID: ${encodeURIComponent(orderId.trim())}%0D%0AEmail: ${encodeURIComponent(email)}%0D%0AIssue Type: ${issueType}%0D%0ASummary: ${encodeURIComponent(summaryText)}%0D%0ADetails:%0D%0A${encodeURIComponent(details.trim())}%0D%0A%0D%0ARegards,%0D%0A`;

    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${body}`;
    setTicketSent(true);
    setOrderId("");
    setCustomerEmail("");
    setIssueType("general");
    setSummary("");
    setDetails("");
  };

  return (
    <aside className="w-72 border-l bg-card hidden lg:flex flex-col shrink-0">
      <div className="p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Open Ticket
        </h3>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => {
            setShowTicketForm((current) => !current);
            setTicketSent(false);
          }}
        >
          <MessageSquare className="w-4 h-4" /> Open ticket
        </Button>

        {showTicketForm && (
          <div className="mt-3 space-y-3 rounded-2xl border border-border bg-background p-4">
            <p className="text-sm font-medium text-foreground">
              Create a ticket for refund, callback, or support.
            </p>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Order ID (optional)"
              className="w-full rounded-xl border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Your email"
              className="w-full rounded-xl border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full rounded-xl border border-input bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="general">General support</option>
              <option value="refund">Refund request</option>
              <option value="callback">Request callback</option>
              <option value="payment">Payment issue</option>
            </select>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short issue summary"
              className="w-full rounded-xl border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Details"
              rows={3}
              className="w-full rounded-xl border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            {/* ✅ Fixed button alignment */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="flex-1"
                onClick={handleTicketSubmit}
              >
                Send ticket email
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-20 shrink-0"
                onClick={() => setShowTicketForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {ticketSent && (
          <div className="mt-3 rounded-2xl border border-border bg-background p-4 text-sm text-foreground">
            ✅ Ticket draft opened in your mail client. Send the email to complete the request.
          </div>
        )}
      </div>
    </aside>
  );
};

export default InfoPanel;