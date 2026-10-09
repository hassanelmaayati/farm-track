import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import ErrorMessage from "../ui/ErrorMessage";
import { Input, Select, Textarea } from "../ui/Field";
import { STRUCTURE_TYPES } from "../../lib/constants";
import { useSaveStructure } from "../../hooks/queries";
import { useToast } from "../../context/ToastContext";

export default function StructureFormModal({ open, onClose, structure }) {
  return (
    <Modal open={open} onClose={onClose} title={structure ? "Edit structure" : "New structure"}>
      <Form structure={structure} onClose={onClose} />
    </Modal>
  );
}

function Form({ structure, onClose }) {
  const save = useSaveStructure();
  const toast = useToast();
  const [form, setForm] = useState({
    name: structure?.name ?? "",
    type: structure?.type ?? "Barn",
    notes: structure?.notes ?? "",
  });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    save.mutate(
      { id: structure?._id, ...form },
      {
        onSuccess: () => {
          toast(structure ? "Structure updated." : "Structure created.");
          onClose();
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorMessage error={save.error} />
      <Input label="Name" value={form.name} onChange={set("name")} required autoFocus placeholder="e.g. Red Barn" />
      <Select label="Type" value={form.type} onChange={set("type")} options={STRUCTURE_TYPES} />
      <Textarea label="Notes" value={form.notes} onChange={set("notes")} />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
