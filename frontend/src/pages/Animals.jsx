import { useEffect, useState } from "react";
import { PawPrint, Plus } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import EmptyState from "../components/ui/EmptyState";
import FilterBar, { EMPTY_FILTERS, hasFilters } from "../components/animals/FilterBar";
import AnimalTable from "../components/animals/AnimalTable";
import AnimalFormModal from "../components/animals/AnimalFormModal";
import BulkActionBar from "../components/animals/BulkActionBar";
import { useAnimals } from "../hooks/queries";

export default function Animals() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selected, setSelected] = useState(new Set());
  const [editing, setEditing] = useState(null); // animal | "new" | null
  const { data: animals = [], isLoading, error, isFetching } = useAnimals(filters);

  // Drop selections that no longer match the current filter or were deleted.
  useEffect(() => {
    const visible = new Set(animals.map((a) => a._id));
    setSelected((prev) => {
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [animals]);

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected((prev) => (animals.every((a) => prev.has(a._id)) ? new Set() : new Set(animals.map((a) => a._id))));

  return (
    <>
      <PageHeader
        title="Animals"
        subtitle={`${animals.length} animal${animals.length === 1 ? "" : "s"}${hasFilters(filters) ? " match your filters" : " across all structures"}`}
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" aria-hidden="true" /> New animal
          </Button>
        }
      />
      <div className="space-y-4">
        <FilterBar filters={filters} onChange={setFilters} />
        {selected.size > 0 && <BulkActionBar ids={[...selected]} onClear={() => setSelected(new Set())} />}
        <ErrorMessage error={error} />
        <Card className={isFetching && !isLoading ? "opacity-70 transition-opacity" : "transition-opacity"}>
          {isLoading ? (
            <Spinner />
          ) : animals.length === 0 ? (
            <EmptyState icon={PawPrint} title={hasFilters(filters) ? "No animals match these filters" : "No animals yet"}>
              {hasFilters(filters) ? "Try loosening a filter." : "Add an animal to one of your structures."}
            </EmptyState>
          ) : (
            <AnimalTable animals={animals} selected={selected} onToggle={toggle} onToggleAll={toggleAll} onEdit={setEditing} />
          )}
        </Card>
      </div>
      <AnimalFormModal
        key={editing?._id ?? editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        animal={editing && editing !== "new" ? editing : undefined}
      />
    </>
  );
}
