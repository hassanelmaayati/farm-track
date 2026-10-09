import { Link } from "react-router-dom";
import EmptyState from "../components/ui/EmptyState";

export default function NotFound() {
  return (
    <EmptyState title="Page not found">
      <Link to="/" className="text-brand hover:underline">
        Back to the dashboard
      </Link>
    </EmptyState>
  );
}
