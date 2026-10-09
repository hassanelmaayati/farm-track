import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PawPrint, Pencil, Plus, Trash2 } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import AnimalTable from "../components/animals/AnimalTable";
import AnimalFormModal from "../components/animals/AnimalFormModal";
import StructureFormModal from "../components/structures/StructureFormModal";
import { useDeleteStructure, useStructure } from "../hooks/queries";
import { useToast } from "../context/ToastContext";

export default function StructureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, isLoading, error } = useStructure(id);
  const remove = useDeleteStructure();
  const [dialog, setDialog] = useState(null); // "edit" | "animal" | "delete"
  const close = () => setDialog(null);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  const { structure, animals } = data;
  const withStructure = animals.map((a) => ({ ...a, structure }));

  return (
    <>
      <Link to="/structures" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> All structures
      </Link>
      <PageHeader
        title={structure.name}
        subtitle={`${structure.type} · ${animals.length} animal${animals.length === 1 ? "" : "s"}${structure.notes ? ` · ${structure.notes}` : ""}`}
        actions={
          <>
            <Button onClick={() => setDialog("animal")}>
              <Plus className="size-4" aria-hidden="true" /> Add animal
            </Button>
            <Button variant="secondary" onClick={() => setDialog("edit")}>
              <Pencil className="size-4" aria-hidden="true" /> Edit
            </Button>
            <Button variant="secondary" className="text-red-600 dark:text-red-400" onClick={() => setDialog("delete")}>
              <Trash2 className="size-4" aria-hidden="true" /> Delete
            </Button>
          </>
        }
      />
      <Card>
        {animals.length === 0 ? (
          <EmptyState icon={PawPrint} title="Nobody lives here yet">
            Add an animal to this structure.
          </EmptyState>
        ) : (
          <AnimalTable animals={withStructure} showStructure={false} />
        )}
      </Card>

      <StructureFormModal open={dialog === "edit"} onClose={close} structure={structure} />
      <AnimalFormModal open={dialog === "animal"} onClose={close} defaultStructure={structure._id} />
      <ConfirmDialog
        open={dialog === "delete"}
        onClose={close}
        title={`Delete ${structure.name}?`}
        message={`This also deletes its ${animals.length} animal${animals.length === 1 ? "" : "s"} and all their log entries.`}
        busy={remove.isPending}
        onConfirm={() =>
          remove.mutate(id, {
            onSuccess: () => {
              toast("Structure deleted.");
              navigate("/structures", { replace: true });
            },
            onError: (err) => toast(err.message, "error"),
          })
        }
      />
    </>
  );
}
