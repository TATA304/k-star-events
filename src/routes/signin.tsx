import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign In — K-Star" },
      { name: "description", content: "Sign in to your K-Star account to browse Malaysia fan café events." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Email cannot be empty");
    if (!password) return setError("Password cannot be empty");
    const res = signIn(email.trim(), password);
    if (!res.ok) return setError(res.error);
    try {
      const raw = localStorage.getItem("kstar.session");
      const u = raw ? JSON.parse(raw) : null;
      navigate({ to: u?.role === "Organizer" ? "/organizer" : "/events" });
    } catch {
      navigate({ to: "/events" });
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Link to="/" className="mb-10 flex items-center justify-center">
          <Logo className="h-16 w-auto sm:h-20" />
        </Link>
        <div className="rounded-3xl border border-black bg-white p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] sm:p-12">
          <div className="text-center">
            <h1 className="font-display text-3xl tracking-tight text-black sm:text-4xl">
              WELCOME BACK
            </h1>
            <p className="mt-2 text-sm text-[#777]">
              Sign in to keep exploring fan café events.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            <Field label="Password" type="password" value={password} onChange={setPassword} />

            {error && (
              <div className="rounded-xl border border-[#E57373]/40 bg-[#E57373]/10 px-4 py-2.5 text-sm font-medium text-[#B14545]">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-black py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-[#333]"
            >
              SIGN IN
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#777]">
            DON'T HAVE AN ACCOUNT?{" "}
            <Link to="/signup" className="font-semibold text-black underline underline-offset-4">
              CREATE ACCOUNT
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-black">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 text-base text-black outline-none transition focus:border-black"
      />
    </label>
  );
}
