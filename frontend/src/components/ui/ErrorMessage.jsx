export default function ErrorMessage({ error }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
      {error.message || String(error)}
    </p>
  );
}
