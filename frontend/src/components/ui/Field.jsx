import { useId } from "react";

const inputClass =
  "w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

export function Field({ label, error, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}

export function Input({ label, error, ...props }) {
  const id = useId();
  return (
    <Field label={label} error={error}>
      <input id={id} className={inputClass} {...props} />
    </Field>
  );
}

export function Select({ label, error, options, placeholder, ...props }) {
  return (
    <Field label={label} error={error}>
      <select className={inputClass} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
    </Field>
  );
}

export function Textarea({ label, error, ...props }) {
  return (
    <Field label={label} error={error}>
      <textarea rows={3} className={inputClass} {...props} />
    </Field>
  );
}

export { inputClass };
