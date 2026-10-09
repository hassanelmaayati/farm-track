import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import { ageFrom, formatDate } from "../../lib/format";

// selected: Set of ids. Omit `onToggle` to render a read-only table (reports).
export default function AnimalTable({ animals, selected, onToggle, onToggleAll, onEdit, showStructure = true }) {
  const selectable = Boolean(onToggle);
  const allSelected = selectable && animals.length > 0 && animals.every((a) => selected.has(a._id));
  const someSelected = selectable && !allSelected && animals.some((a) => selected.has(a._id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="border-b border-line bg-soft/60 text-xs uppercase tracking-wide text-muted">
          <tr>
            {selectable && (
              <th className="no-print w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Select all animals"
                  checked={allSelected}
                  ref={(el) => el && (el.indeterminate = someSelected)}
                  onChange={onToggleAll}
                  className="size-4 accent-[var(--brand)]"
                />
              </th>
            )}
            <th className="px-3 py-2.5 font-medium">Name</th>
            <th className="px-3 py-2.5 font-medium">Tag</th>
            <th className="px-3 py-2.5 font-medium">Species</th>
            {showStructure && <th className="px-3 py-2.5 font-medium">Structure</th>}
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-3 py-2.5 font-medium">Born</th>
            <th className="px-3 py-2.5 font-medium">Age</th>
            {onEdit && <th className="no-print w-10 px-3 py-2.5" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {animals.map((a) => (
            <tr key={a._id} className={`hover:bg-soft/50 ${selected?.has(a._id) ? "bg-brand/10" : ""}`}>
              {selectable && (
                <td className="no-print px-3 py-2.5">
                  <input
                    type="checkbox"
                    aria-label={`Select ${a.name}`}
                    checked={selected.has(a._id)}
                    onChange={() => onToggle(a._id)}
                    className="size-4 accent-[var(--brand)]"
                  />
                </td>
              )}
              <td className="px-3 py-2.5 font-medium">
                <Link to={`/animals/${a._id}`} className="hover:text-brand hover:underline">
                  {a.name}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-muted">{a.tagId || "—"}</td>
              <td className="px-3 py-2.5">
                {a.species}
                {a.breed && <span className="text-muted"> · {a.breed}</span>}
              </td>
              {showStructure && <td className="px-3 py-2.5">{a.structure?.name ?? "—"}</td>}
              <td className="px-3 py-2.5">
                <StatusBadge status={a.status} />
              </td>
              <td className="px-3 py-2.5 text-muted">{formatDate(a.birthdate)}</td>
              <td className="px-3 py-2.5 text-muted">{ageFrom(a.birthdate)}</td>
              {onEdit && (
                <td className="no-print px-3 py-2.5">
                  <button onClick={() => onEdit(a)} aria-label={`Edit ${a.name}`} className="rounded p-1 text-muted hover:bg-soft hover:text-ink">
                    <Pencil className="size-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
