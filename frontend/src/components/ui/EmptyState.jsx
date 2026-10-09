export default function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      {Icon && <Icon className="mb-3 size-10 text-muted/60" aria-hidden="true" />}
      <p className="font-medium">{title}</p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}
