import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, Download, Pencil, Plus, Printer, Trash2 } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import StatusBadge from "../components/ui/StatusBadge";
import AnimalFormModal from "../components/animals/AnimalFormModal";
import LogFormModal from "../components/logs/LogFormModal";
import LogTimeline from "../components/logs/LogTimeline";
import { useAnimal, useAnimalLogs, useDeleteAnimal, useDeleteLog } from "../hooks/queries";
import { useToast } from "../context/ToastContext";
import { ageFrom, formatDate } from "../lib/format";

export default function AnimalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: animal, isLoading, error } = useAnimal(id);
  const { data: logs = [] } = useAnimalLogs(id);
  const deleteAnimal = useDeleteAnimal();
  const deleteLog = useDeleteLog();
  const [dialog, setDialog] = useState(null); // "edit" | "log" | "delete"
  const [logTarget, setLogTarget] = useState(null); // log being edited
  const [logToDelete, setLogToDelete] = useState(null);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  const details = [
    ["Species", animal.species],
    ["Breed", animal.breed || "—"],
    ["Tag ID", animal.tagId || "—"],
    ["Born", `${formatDate(animal.birthdate)} (${ageFrom(animal.birthdate)})`],
  ];

  return (
    <>
      <Link to={animal.structure ? `/structures/${animal.structure._id}` : "/animals"} className="no-print mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> {animal.structure?.name ?? "Animals"}
      </Link>
      <PageHeader
        title={animal.name}
        subtitle={animal.structure ? `${animal.structure.name} · ${animal.structure.type}` : undefined}
        actions={
          <>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden="true" /> Print
            </Button>
            <a href={`/api/export/logs.csv?animal=${id}`} download>
              <Button variant="secondary">
                <Download className="size-4" aria-hidden="true" /> Logs CSV
              </Button>
            </a>
            <Button variant="secondary" onClick={() => setDialog("edit")}>
              <Pencil className="size-4" aria-hidden="true" /> Edit
            </Button>
            <Button variant="secondary" className="text-red-600 dark:text-red-400" onClick={() => setDialog("delete")}>
              <Trash2 className="size-4" aria-hidden="true" /> Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="h-fit p-4">
          <div className="mb-3">
            <StatusBadge status={animal.status} />
          </div>
          <dl className="space-y-2 text-sm">
            {details.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-muted">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {animal.notes && <p className="mt-3 whitespace-pre-line border-t border-line pt-3 text-sm text-muted">{animal.notes}</p>}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="font-semibold">History log</h2>
            <Button
              className="no-print"
              onClick={() => {
                setLogTarget(null);
                setDialog("log");
              }}
            >
              <Plus className="size-4" aria-hidden="true" /> Add entry
            </Button>
          </div>
          {logs.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No log entries">
              Record vet visits, vaccinations, births or sales.
            </EmptyState>
          ) : (
            <LogTimeline
              logs={logs}
              onEdit={(log) => {
                setLogTarget(log);
                setDialog("log");
              }}
              onDelete={setLogToDelete}
            />
          )}
        </Card>
      </div>

      <AnimalFormModal open={dialog === "edit"} onClose={() => setDialog(null)} animal={animal} />
      <LogFormModal key={logTarget?._id ?? "new"} open={dialog === "log"} onClose={() => setDialog(null)} animalId={id} log={logTarget ?? undefined} />
      <ConfirmDialog
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        title={`Delete ${animal.name}?`}
        message="This also deletes all of its log entries."
        busy={deleteAnimal.isPending}
        onConfirm={() =>
          deleteAnimal.mutate(id, {
            onSuccess: () => {
              toast("Animal deleted.");
              navigate(animal.structure ? `/structures/${animal.structure._id}` : "/animals", { replace: true });
            },
            onError: (err) => toast(err.message, "error"),
          })
        }
      />
      <ConfirmDialog
        open={Boolean(logToDelete)}
        onClose={() => setLogToDelete(null)}
        title="Delete this log entry?"
        message="This cannot be undone."
        busy={deleteLog.isPending}
        onConfirm={() =>
          deleteLog.mutate(logToDelete._id, {
            onSuccess: () => {
              toast("Log entry deleted.");
              setLogToDelete(null);
            },
            onError: (err) => toast(err.message, "error"),
          })
        }
      />
    </>
  );
}
