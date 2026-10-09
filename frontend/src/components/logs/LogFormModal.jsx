import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import ErrorMessage from "../ui/ErrorMessage";
import { Input, Select, Textarea } from "../ui/Field";
import { EVENT_TYPES } from "../../lib/constants";
import { todayInput, toDateInput } from "../../lib/format";
import { useSaveLog } from "../../hooks/queries";
import { useToast } from "../../context/ToastContext";

export default function LogFormModal({ open, onClose, animalId, log }) {
  return (
    <Modal open={open} onClose={onClose} title={log ? "Edit log entry" : "New log entry"}>
      <Form animalId={animalId} log={log} onClose={onClose} />
    </Modal>
  );
}

function Form({ animalId, log, onClose }) {
  const save = useSaveLog();
  const toast = useToast();
  const [form, setForm] = useState({
    date: log ? toDateInput(log.date) : todayInput(),
    eventType: log?.eventType ?? "Vet Visit",
    amount: log?.amount ?? "",
    description: log?.description ?? "",
  });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const hasMoney = ["Sold", "Vet Visit", "Vaccination", "Fed"].includes(form.eventType);

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form, amount: hasMoney && form.amount !== "" ? Number(form.amount) : null };
    save.mutate(
      { id: log?._id, animalId, ...payload },
      {
        onSuccess: () => {
          toast(log ? "Log entry updated." : "Log entry added.");
          onClose();
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorMessage error={save.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Date" type="date" value={form.date} onChange={set("date")} required />
        <Select label="Event" value={form.eventType} onChange={set("eventType")} options={EVENT_TYPES} />
      </div>
      {hasMoney && (
        <Input
          label={form.eventType === "Sold" ? "Sale price ($)" : "Cost ($)"}
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={set("amount")}
          placeholder="Optional"
        />
      )}
      {(form.eventType === "Sold" || form.eventType === "Died") && (
        <p className="text-xs text-muted">Saving this will also mark the animal as {form.eventType === "Sold" ? "Sold" : "Deceased"}.</p>
      )}
      <Textarea label="Description" value={form.description} onChange={set("description")} />
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
