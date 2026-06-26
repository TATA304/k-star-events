import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, User as UserIcon, Plus, LayoutGrid } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/signin" });
  };

  const linkClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition ${
      active ? "bg-[#CAF5F7] text-black" : "text-[#777] hover:text-black"
    }`;

  return (
    <header className="sticky top-0 z-30 border-b-2 border-black bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link to="/" className="flex items-center">
          <Logo className="h-10 w-auto sm:h-12" />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              <Link to="/events" className={`${linkClass(pathname.startsWith("/events"))} hidden sm:inline-block`}>
                Events
              </Link>
              {user.role === "Organizer" && (
                <>
                  <Link
                    to="/organizer"
                    className={`${linkClass(pathname === "/organizer")} hidden items-center gap-1 sm:inline-flex`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" /> Dashboard
                  </Link>
                  <Link
                    to="/organizer/new"
                    className="hidden items-center gap-1 rounded-full border border-black bg-[#CAF5F7] px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-[#B0EEF1] sm:inline-flex"
                  >
                    <Plus className="h-3.5 w-3.5" /> Create
                  </Link>
                </>
              )}
              <Link
                to="/account"
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  pathname === "/account" ? "bg-[#CAF5F7] text-black" : "text-[#777] hover:text-black"
                }`}
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#333] sm:px-4"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="rounded-full px-4 py-1.5 text-sm font-medium text-[#777] hover:text-black">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-black px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#333]"
              >
                Create Account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
