import { useState } from "react";
import { ArrowRightLeft, HeartPulse, Trash2, X } from "lucide-react";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { inputClass } from "../ui/Field";
import { STATUSES } from "../../lib/constants";
import { useBulkDelete, useBulkMove, useBulkStatus, useStructures } from "../../hooks/queries";
import { useToast } from "../../context/ToastContext";

export default function BulkActionBar({ ids, onClear }) {
  const { data: structures = [] } = useStructures();
  const move = useBulkMove();
  const status = useBulkStatus();
  const remove = useBulkDelete();
  const toast = useToast();
  const [target, setTarget] = useState("");
  const [nextStatus, setNextStatus] = useState("");
  const [confirming, setConfirming] = useState(false);

  const done = (message) => ({
    onSuccess: () => {
      toast(message);
      onClear();
    },
    onError: (err) => toast(err.message, "error"),
  });
  const n = ids.length;
  const noun = `${n} animal${n === 1 ? "" : "s"}`;

  return (
    <div className="no-print sticky top-16 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-brand/40 bg-card p-3 shadow-lg" role="region" aria-label="Bulk actions">
      <span className="text-sm font-medium">{n} selected</span>

      <div className="flex items-center gap-2">
        <select value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Move to structure" className={`${inputClass} w-44`}>
          <option value="">Move to…</option>
          {structures.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <Button variant="secondary" disabled={!target || move.isPending} onClick={() => move.mutate({ ids, structure: target }, done(`Moved ${noun}.`))}>
          <ArrowRightLeft className="size-4" aria-hidden="true" /> Move
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} aria-label="Set health status" className={`${inputClass} w-36`}>
          <option value="">Set status…</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <Button variant="secondary" disabled={!nextStatus || status.isPending} onClick={() => status.mutate({ ids, status: nextStatus }, done(`Updated ${noun}.`))}>
          <HeartPulse className="size-4" aria-hidden="true" /> Apply
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" className="text-red-600 dark:text-red-400" onClick={() => setConfirming(true)}>
          <Trash2 className="size-4" aria-hidden="true" /> Delete
        </Button>
        <Button variant="ghost" onClick={onClear} aria-label="Clear selection">
          <X className="size-4" />
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`Delete ${noun}?`}
        message="This also deletes their log entries and cannot be undone."
        busy={remove.isPending}
        onConfirm={() => remove.mutate(ids, { ...done(`Deleted ${noun}.`), onSettled: () => setConfirming(false) })}
      />
    </div>
  );
}
