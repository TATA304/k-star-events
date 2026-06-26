import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "Fan" | "Organizer";
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthCtx {
  user: User | null;
  signIn: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  signUp: (user: Omit<User, "id"> & { password: string }) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const USERS_KEY = "kstar.users";
const SESSION_KEY = "kstar.session";

interface StoredUser extends User {
  password: string;
}

function loadUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
  };

  const signUp: AuthCtx["signUp"] = (data) => {
    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const newUser: StoredUser = { ...data, id: uid() };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    persist({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
    return { ok: true };
  };

  const signIn: AuthCtx["signIn"] = (email, password) => {
    const users = loadUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!found) return { ok: false, error: "Invalid email or password" };
    // Back-compat: assign id if missing
    if (!found.id) {
      found.id = uid();
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    persist({ id: found.id, name: found.name, email: found.email, role: found.role });
    return { ok: true };
  };

  const signOut = () => persist(null);

  return <Ctx.Provider value={{ user, signIn, signUp, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
