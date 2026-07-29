import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Gamepad2, Library, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const navItems = [
  { to: "/groups", label: "Grupos", icon: Users },
  { to: "/games", label: "Jogos", icon: Library },
] as const;

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated)
      navigate({ to: "/login", replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  function handleLogout() {
    logout();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="app-page min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-card p-4 md:flex">
        <Link
          to="/groups"
          className="flex items-center gap-3 px-2 py-2 text-lg font-semibold"
        >
          <span className="brand-mark h-9 w-9">
            <Gamepad2 className="h-5 w-5" />
          </span>
          Fillobby
        </Link>

        <nav className="mt-8 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-semibold">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Users className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Conta ativa</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Link
              to="/groups"
              className="flex items-center gap-2.5 font-semibold"
            >
              <span className="brand-mark h-9 w-9">
                <Gamepad2 className="h-5 w-5" />
              </span>
              Fillobby
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => {
                const active = pathname === to || pathname.startsWith(`${to}/`);
                return (
                  <Link
                    key={to}
                    to={to}
                    title={label}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </header>

        <main className="page-enter mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
