import { FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_STYLES = {
  verified: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-500/10", label: "Verified" },
  pending: { icon: Clock, color: "text-amia-600", bg: "bg-amia-500/10", label: "Pending review" },
  processing: { icon: Clock, color: "text-blue-600", bg: "bg-blue-500/10", label: "Processing" },
  failed: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Failed" }
};

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RecentActivity({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-ink-muted">No documents uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const style = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
        const Icon = style.icon;
        return (
          <Link
            key={item.id}
            to="/verification"
            className="flex items-center justify-between rounded-claySm p-3 transition-colors hover:bg-base-surface"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.bg}`}>
                <Icon className={`h-4 w-4 ${style.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-primary">
                  {item.landowner_name || item.filename}
                </p>
                <p className={`text-xs ${style.color}`}>
                  {style.label}
                  {item.survey_number ? ` · Survey ${item.survey_number}` : ""}
                </p>
              </div>
            </div>
            <span className="text-xs text-ink-muted">{timeAgo(item.uploaded_at)}</span>
          </Link>
        );
      })}
    </div>
  );
}