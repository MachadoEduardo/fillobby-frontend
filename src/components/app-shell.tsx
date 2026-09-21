import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Library, LogOut, UserRound, Users } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { resolveApiAssetUrl } from "@/lib/api";
import type { PublicUser } from "@/lib/api-types";
import { cn } from "@/lib/utils";

const navigationItems = [
  { to: "/groups", label: "Grupos", icon: Users },
  { to: "/games", label: "Jogos", icon: Library },
] as const;

const SIDEBAR_STORAGE_KEY = "fillobby-sidebar-collapsed";

type AppShellProps = {
  user: PublicUser | null;
  onLogout: () => void;
  children: ReactNode;
};

export function AppShell({ user, onLogout, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  }, []);

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <div className="app-page min-h-screen">
      <DesktopSidebar
        pathname={pathname}
        user={user}
        onLogout={onLogout}
        collapsed={collapsed}
        onToggle={toggleSidebar}
      />
      <MobileNavigation pathname={pathname} user={user} onLogout={onLogout} />

      <div className={cn("transition-[padding] duration-200", collapsed ? "md:pl-20" : "md:pl-64")}>
        <main className="page-enter mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 sm:py-10 sm:pb-24 md:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}

type NavigationProps = Omit<AppShellProps, "children"> & {
  pathname: string;
};

type DesktopSidebarProps = NavigationProps & {
  collapsed: boolean;
  onToggle: () => void;
};

function DesktopSidebar({ pathname, user, onLogout, collapsed, onToggle }: DesktopSidebarProps) {
  const profileActive = isRouteActive(pathname, "/profile");

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-20 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-3" : "justify-between px-6",
        )}
      >
        {!collapsed && (
          <Link
            to="/groups"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
          >
            <span className="brand-wordmark text-sidebar-foreground">Fillobby</span>
          </Link>
        )}
        <Tooltip content={collapsed ? "Expandir menu" : "Recolher menu"} enabled={collapsed}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={onToggle}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </Tooltip>
      </div>

      <nav className="flex-1 px-3 py-6" aria-label="Navegação principal">
        {!collapsed && (
          <p className="px-3 pb-3 text-xs font-medium text-sidebar-foreground/45">Seu lobby</p>
        )}
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <DesktopNavigationLink
              key={item.to}
              {...item}
              active={isRouteActive(pathname, item.to)}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Tooltip content="Alternar tema" enabled={collapsed} className="w-full">
          <ThemeToggle
            compact={collapsed}
            className={cn(
              "h-10 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "w-full",
            )}
          />
        </Tooltip>

        <div className={cn("mt-2 flex items-center", collapsed ? "flex-col gap-1" : "gap-1")}>
          <Tooltip
            content="Perfil"
            enabled={collapsed}
            className={collapsed ? "w-full" : "min-w-0 flex-1"}
          >
            <Link
              to="/profile"
              aria-current={profileActive ? "page" : undefined}
              className={cn(
                "flex min-w-0 items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                collapsed ? "h-11 w-full justify-center" : "flex-1 gap-3 px-3 py-2",
                profileActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <UserAvatar user={user} compact={collapsed} />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-sidebar-foreground/45">Editar perfil</p>
                </div>
              )}
            </Link>
          </Tooltip>

          <Tooltip content="Sair" enabled={collapsed} className={collapsed ? "w-full" : undefined}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-destructive",
                collapsed && "w-full",
              )}
              onClick={onLogout}
              aria-label="Sair da conta"
              title={collapsed ? undefined : "Sair"}
            >
              <LogOut />
            </Button>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}

function DesktopNavigationLink({
  to,
  label,
  icon: Icon,
  active,
  collapsed,
}: (typeof navigationItems)[number] & {
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Tooltip content={label} enabled={collapsed} className="w-full">
      <Link
        to={to}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-11 w-full items-center rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          collapsed ? "justify-center" : "gap-3 px-3",
          active
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        )}
      >
        <Icon />
        <span className={collapsed ? "sr-only" : undefined}>{label}</span>
      </Link>
    </Tooltip>
  );
}

function MobileNavigation({ pathname, user, onLogout }: NavigationProps) {
  const mobileItems = [
    ...navigationItems,
    { to: "/profile", label: "Perfil", icon: UserRound },
  ] as const;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <Link
            to="/groups"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <span className="brand-wordmark text-sidebar-foreground">Fillobby</span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle
              compact
              className="text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              onClick={onLogout}
              aria-label="Sair da conta"
              title="Sair"
            >
              <LogOut />
            </Button>
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-sidebar-border bg-sidebar text-sidebar-foreground md:hidden"
        aria-label="Navegação principal"
      >
        {mobileItems.map(({ to, label, icon: Icon }) => {
          const active = isRouteActive(pathname, to);

          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sidebar-ring",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/55 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              {to === "/profile" ? <UserAvatar user={user} compact /> : <Icon />}
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function UserAvatar({ user, compact = false }: { user: PublicUser | null; compact?: boolean }) {
  return (
    <Avatar className={compact ? "h-5 w-5" : "h-9 w-9"}>
      <AvatarImage src={resolveApiAssetUrl(user?.avatarUrl)} alt={user?.name ?? "Perfil"} />
      <AvatarFallback>
        <UserRound className={compact ? "h-3 w-3" : "h-4 w-4"} />
      </AvatarFallback>
    </Avatar>
  );
}

function isRouteActive(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}
