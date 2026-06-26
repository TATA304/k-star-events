import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth, type Role } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — K-Star" },
      { name: "description", content: "Create a free K-Star account to discover Malaysia fan café events." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Full name cannot be empty");
    if (!email.trim()) return setError("Email cannot be empty");
    if (!password) return setError("Password cannot be empty");
    if (password !== confirm) return setError("Passwords do not match");
    if (!role) return setError("Please select a role");

    const res = signUp({ name: name.trim(), email: email.trim(), password, role });
    if (!res.ok) return setError(res.error);
    navigate({ to: role === "Organizer" ? "/organizer" : "/events" });
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
              CREATE YOUR ACCOUNT
            </h1>
            <p className="mt-2 text-sm text-[#777]">Join the K-pop fan café community.</p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Field label="Full Name" value={name} onChange={setName} />
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            <Field label="Password" type="password" value={password} onChange={setPassword} />
            <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} />

            <div>
              <span className="mb-2 block text-sm font-medium text-black">I am a...</span>
              <div className="grid grid-cols-2 gap-3">
                {(["Fan", "Organizer"] as Role[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-wide transition ${
                      role === r
                        ? "border-black bg-[#CAF5F7] text-black"
                        : "border-[#D9D9D9] bg-white text-black hover:border-black"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-[#E57373]/40 bg-[#E57373]/10 px-4 py-2.5 text-sm font-medium text-[#B14545]">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-black py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-[#333]"
            >
              CREATE ACCOUNT
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#777]">
            ALREADY HAVE AN ACCOUNT?{" "}
            <Link to="/signin" className="font-semibold text-black underline underline-offset-4">
              SIGN IN
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
