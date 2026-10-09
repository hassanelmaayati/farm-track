export default function Card({ className = "", children, ...props }) {
  return (
    <div className={`print-card rounded-xl border border-line bg-card shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
