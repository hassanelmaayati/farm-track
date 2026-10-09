import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Plus } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import EmptyState from "../components/ui/EmptyState";
import StructureFormModal from "../components/structures/StructureFormModal";
import { useStructures } from "../hooks/queries";

export default function Structures() {
  const { data: structures, isLoading, error } = useStructures();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader
        title="Structures"
        subtitle="Barns, stables, coops and pastures where your animals live."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" aria-hidden="true" /> New structure
          </Button>
        }
      />
      <ErrorMessage error={error} />
      {isLoading ? (
        <Spinner />
      ) : structures.length === 0 ? (
        <Card>
          <EmptyState icon={Building2} title="No structures yet">
            Add your first barn, coop or pasture to start tracking animals.
          </EmptyState>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {structures.map((s) => (
            <Link key={s._id} to={`/structures/${s._id}`} className="group">
              <Card className="h-full p-4 transition-shadow group-hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div className="rounded-lg bg-soft p-2 text-brand">
                    <Building2 className="size-5" aria-hidden="true" />
                  </div>
                  <span className="rounded-full bg-soft px-2.5 py-0.5 text-xs text-muted">{s.type}</span>
                </div>
                <h2 className="mt-3 font-semibold group-hover:text-brand">{s.name}</h2>
                <p className="mt-0.5 text-sm text-muted">
                  {s.animalCount} animal{s.animalCount === 1 ? "" : "s"}
                </p>
                {s.notes && <p className="mt-2 line-clamp-2 text-sm text-muted">{s.notes}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
      <StructureFormModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
