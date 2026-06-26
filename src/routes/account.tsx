import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogOut, Mail, User as UserIcon, BadgeCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — K-Star" },
      { name: "description", content: "Your K-Star account information." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      const t = setTimeout(() => {
        if (!localStorage.getItem("kstar.session")) navigate({ to: "/signin" });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [user, navigate]);

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/signin" });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">My Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your K-Star profile details.</p>

        <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[color:var(--color-accent)] font-display text-2xl font-bold text-foreground ring-1 ring-border">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-bold text-foreground">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Row icon={<UserIcon className="h-4 w-4" />} label="Name" value={user.name} />
            <Row icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
            <Row icon={<BadgeCheck className="h-4 w-4" />} label="Role" value={user.role} />
          </div>

          <button
            onClick={handleSignOut}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-[var(--color-primary-hover)] sm:w-auto"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary px-4 py-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card text-foreground ring-1 ring-border">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-light-foreground)]">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
