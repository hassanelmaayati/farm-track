import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import ErrorMessage from "../ui/ErrorMessage";
import { Input, Select, Textarea } from "../ui/Field";
import { STATUSES } from "../../lib/constants";
import { toDateInput } from "../../lib/format";
import { useSaveAnimal, useSpecies, useStructures } from "../../hooks/queries";
import { useToast } from "../../context/ToastContext";

export default function AnimalFormModal({ open, onClose, animal, defaultStructure }) {
  return (
    <Modal open={open} onClose={onClose} title={animal ? `Edit ${animal.name}` : "New animal"}>
      <Form animal={animal} defaultStructure={defaultStructure} onClose={onClose} />
    </Modal>
  );
}

function Form({ animal, defaultStructure, onClose }) {
  const save = useSaveAnimal();
  const toast = useToast();
  const { data: structures = [] } = useStructures();
  const { data: species = [] } = useSpecies();
  const [form, setForm] = useState({
    name: animal?.name ?? "",
    tagId: animal?.tagId ?? "",
    species: animal?.species ?? "",
    breed: animal?.breed ?? "",
    birthdate: toDateInput(animal?.birthdate),
    status: animal?.status ?? "Healthy",
    structure: animal?.structure?._id ?? animal?.structure ?? defaultStructure ?? "",
    notes: animal?.notes ?? "",
  });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    save.mutate(
      { id: animal?._id, ...form },
      {
        onSuccess: () => {
          toast(animal ? "Animal updated." : "Animal added.");
          onClose();
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorMessage error={save.error} />
      {structures.length === 0 && <p className="text-sm text-muted">Create a structure first, animals live inside one.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" value={form.name} onChange={set("name")} required autoFocus />
        <Input label="Tag ID" value={form.tagId} onChange={set("tagId")} placeholder="Optional, unique" />
        <Input label="Species" value={form.species} onChange={set("species")} required placeholder="Cow, Goat, Chicken…" list="species-suggestions" />
        <Input label="Breed" value={form.breed} onChange={set("breed")} />
        <Input label="Birthdate" type="date" value={form.birthdate} onChange={set("birthdate")} />
        <Select label="Status" value={form.status} onChange={set("status")} options={STATUSES} />
      </div>
      <Select
        label="Structure"
        value={form.structure}
        onChange={set("structure")}
        required
        placeholder="Choose a structure"
        options={structures.map((s) => ({ value: s._id, label: `${s.name} (${s.type})` }))}
      />
      <datalist id="species-suggestions">
        {species.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <Textarea label="Notes" value={form.notes} onChange={set("notes")} />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending || structures.length === 0}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
