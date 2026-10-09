import { Pencil, Trash2 } from "lucide-react";
import { EVENT_STYLES } from "../../lib/constants";
import { formatDate, formatMoney } from "../../lib/format";

export default function LogTimeline({ logs, onEdit, onDelete }) {
  return (
    <ol className="divide-y divide-line">
      {logs.map((log) => (
        <li key={log._id} className="flex items-start gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className={`font-medium ${EVENT_STYLES[log.eventType]}`}>{log.eventType}</span>
              <time className="text-xs text-muted">{formatDate(log.date)}</time>
              {log.amount > 0 && <span className="text-xs font-medium tabular-nums">{formatMoney(log.amount)}</span>}
            </div>
            {log.description && <p className="mt-0.5 whitespace-pre-line text-sm text-muted">{log.description}</p>}
          </div>
          <div className="no-print flex shrink-0 gap-1">
            <button onClick={() => onEdit(log)} aria-label="Edit log entry" className="rounded p-1.5 text-muted hover:bg-soft hover:text-ink">
              <Pencil className="size-4" />
            </button>
            <button onClick={() => onDelete(log)} aria-label="Delete log entry" className="rounded p-1.5 text-muted hover:bg-soft hover:text-red-600">
              <Trash2 className="size-4" />
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}
