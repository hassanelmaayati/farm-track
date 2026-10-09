import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Building2, FileDown, LogOut, Menu, PawPrint, Sprout, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const links = [
  { to: "/", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/structures", label: "Structures", icon: Building2 },
  { to: "/animals", label: "Animals", icon: PawPrint },
  { to: "/reports", label: "Reports & Export", icon: FileDown },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-brand text-brand-ink" : "text-muted hover:bg-soft hover:text-ink"
            }`
          }
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* desktop sidebar */}
      <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-card lg:flex">
        <Brand />
        {nav}
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="no-print fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded p-1 text-muted hover:bg-soft">
                <X className="size-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-card/90 px-4 py-2.5 backdrop-blur">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-muted hover:bg-soft lg:hidden">
            <Menu className="size-5" />
          </button>
          <div className="ml-auto flex items-center gap-1">
            <span className="mr-2 hidden text-sm text-muted sm:inline">
              Signed in as <strong className="text-ink">{user.username}</strong>
            </span>
            <ThemeToggle />
            <button onClick={logout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-soft hover:text-ink">
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </button>
          </div>
        </header>
        <main className="print-full mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-5 py-4 text-lg font-semibold tracking-tight">
      <Sprout className="size-6 text-brand" aria-hidden="true" />
      FarmTrack
    </div>
  );
}
