import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, GraduationCap, Building2, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const { school, primaryRole, signOut, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const navItems: { to: string; label: string; icon: any; show: boolean }[] = [
    { to: "/", label: "Home", icon: GraduationCap, show: true },
    { to: "/super-admin", label: "Super Admin", icon: ShieldCheck, show: isSuperAdmin },
    { to: "/school", label: "My School", icon: Building2, show: !!school },
    { to: "/people", label: "People", icon: Users, show: primaryRole === "principal" || primaryRole === "admin" },
  ].filter((i) => i.show);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            {school?.logo_url ? (
              <img src={school.logo_url} alt={school.name} className="h-7 w-7 rounded object-cover" />
            ) : (
              <div className="h-7 w-7 rounded bg-gradient-primary grid place-items-center text-primary-foreground text-xs font-bold">
                S
              </div>
            )}
            <span className="hidden sm:inline">{school?.name ?? "SHARP"}</span>
          </Link>
          <nav className="flex-1 flex items-center gap-1 overflow-x-auto">
            {navItems.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )
                }
              >
                {it.label}
              </NavLink>
            ))}
          </nav>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
