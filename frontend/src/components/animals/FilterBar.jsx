import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import useDebounce from "../../hooks/useDebounce";
import { STATUSES } from "../../lib/constants";
import { inputClass } from "../ui/Field";
import { useSpecies, useStructures } from "../../hooks/queries";

export const EMPTY_FILTERS = { q: "", status: "", species: "", structure: "", from: "", to: "" };

const hasFilters = (filters) => Object.values(filters).some(Boolean);

// Controlled filter bar. Typing in the search box applies after a short pause; selects apply instantly.
export default function FilterBar({ filters, onChange }) {
  const { data: structures = [] } = useStructures();
  const { data: species = [] } = useSpecies();

  const [search, setSearch] = useState(filters.q);
  const debounced = useDebounce(search);
  useEffect(() => {
    if (debounced !== filters.q) onChange({ ...filters, q: debounced });
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  const clear = () => {
    setSearch("");
    onChange(EMPTY_FILTERS);
  };

  return (
    <div className="no-print rounded-xl border border-line bg-card p-3 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, tag, species, breed…"
            aria-label="Search animals"
            className={`${inputClass} pl-9`}
          />
        </div>
        <select value={filters.status} onChange={set("status")} aria-label="Filter by health status" className={inputClass}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={filters.species} onChange={set("species")} aria-label="Filter by species" className={inputClass}>
          <option value="">All species</option>
          {species.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={filters.structure} onChange={set("structure")} aria-label="Filter by structure" className={`${inputClass} sm:col-span-2 lg:col-span-2`}>
          <option value="">All structures</option>
          {structures.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-xs text-muted">
          Born from
          <input type="date" value={filters.from} onChange={set("from")} className={`${inputClass} mt-1 block`} />
        </label>
        <label className="text-xs text-muted">
          Born to
          <input type="date" value={filters.to} onChange={set("to")} min={filters.from || undefined} className={`${inputClass} mt-1 block`} />
        </label>
        {hasFilters(filters) && (
          <button onClick={clear} className="mb-1 ml-auto inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
            <X className="size-4" aria-hidden="true" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

export { hasFilters };
