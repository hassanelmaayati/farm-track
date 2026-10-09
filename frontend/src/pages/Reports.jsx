import { useState } from "react";
import { Download, FileText, Printer } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import EmptyState from "../components/ui/EmptyState";
import FilterBar, { EMPTY_FILTERS } from "../components/animals/FilterBar";
import AnimalTable from "../components/animals/AnimalTable";
import { useAnimals } from "../hooks/queries";
import { toQuery } from "../lib/api";
import { formatDate } from "../lib/format";

export default function Reports() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const { data: animals = [], isLoading, error } = useAnimals(filters);
  const query = toQuery(filters);

  const exports = [
    { href: `/api/export/animals.csv${query}`, label: "Animal roster (CSV)" },
    { href: `/api/export/health-report.csv${query}`, label: "Health report (CSV)" },
    { href: "/api/export/logs.csv", label: "All history logs (CSV)" },
  ];

  const counts = animals.reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status] ?? 0) + 1 }), {});

  return (
    <>
      <PageHeader
        title="Reports & Export"
        subtitle="Filter the herd, then download a CSV or print a clean copy."
        actions={
          <Button onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" /> Print report
          </Button>
        }
      />

      <div className="space-y-4">
        <FilterBar filters={filters} onChange={setFilters} />

        <Card className="no-print p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Download className="size-4 text-brand" aria-hidden="true" /> Downloads
          </h2>
          <div className="flex flex-wrap gap-2">
            {exports.map((e) => (
              <a key={e.label} href={e.href} download>
                <Button variant="secondary">
                  <FileText className="size-4" aria-hidden="true" /> {e.label}
                </Button>
              </a>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Roster and health report respect the filters above.</p>
        </Card>

        <ErrorMessage error={error} />
        <Card>
          <div className="border-b border-line px-4 py-3">
            <h2 className="font-semibold">Herd health report</h2>
            <p className="text-sm text-muted">
              Generated {formatDate(new Date())} · {animals.length} animal{animals.length === 1 ? "" : "s"}
              {Object.keys(counts).length > 0 && " · " + Object.entries(counts).map(([s, n]) => `${n} ${s.toLowerCase()}`).join(", ")}
            </p>
          </div>
          {isLoading ? <Spinner /> : animals.length === 0 ? <EmptyState title="No animals match these filters" /> : <AnimalTable animals={animals} />}
        </Card>
      </div>
    </>
  );
}
