import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Sprout } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import ErrorMessage from "../components/ui/ErrorMessage";
import { Input } from "../components/ui/Field";
import ThemeToggle from "../components/layout/ThemeToggle";

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await (isSignup ? signup : login)(form);
      navigate(location.state?.from?.pathname ?? "/", { replace: true });
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-soft via-bg to-bg p-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 rounded-2xl bg-brand p-3 text-brand-ink">
            <Sprout className="size-8" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{isSignup ? "Create your farm account" : "Welcome back to FarmTrack"}</h1>
          <p className="mt-1 text-sm text-muted">Structures, animals and health logs in one place.</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-line bg-card p-6 shadow-sm">
          <ErrorMessage error={error} />
          <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength={isSignup ? 3 : undefined} autoComplete="username" autoFocus />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={isSignup ? 6 : undefined}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          {isSignup ? "Already have an account?" : "New to FarmTrack?"}{" "}
          <Link to={isSignup ? "/login" : "/signup"} className="font-medium text-brand hover:underline">
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
