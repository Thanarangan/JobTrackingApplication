import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, FileText, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { useState } from "react";
import { cn } from "@/lib/utils";
const sidebarLinks = [
    { label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard },
    { label: "Applications", to: "/app/applications", icon: Briefcase },
    { label: "Resumes", to: "/app/resumes", icon: FileText },
    { label: "Profile", to: "/app/profile", icon: User },
];
const AppShell = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (<div className="flex min-h-screen bg-background">
      {sidebarOpen && (<div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)}/>)}

      <aside className={cn("fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <Link
            to="/"
            className="inline-flex items-center text-2xl font-display font-extrabold tracking-tight transition-transform duration-200 hover:scale-[1.02]"
          >
            <span className="text-primary drop-shadow-sm">Job</span>
            <span className="ml-0.5 text-foreground">Trackr</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5"/>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarLinks.map((link) => {
            const active = location.pathname === link.to;
            return (<Link key={link.to} to={link.to} onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors", active
                    ? "gradient-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
                <link.icon className="h-4 w-4"/>
                {link.label}
              </Link>);
        })}
        </nav>

        <div className="border-t border-border p-3">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="h-4 w-4"/>
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-card/80 backdrop-blur-lg px-6 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5"/>
          </button>
          <Link
            to="/"
            className="inline-flex items-center text-xl font-display font-extrabold tracking-tight"
          >
            <span className="text-primary drop-shadow-sm">Job</span>
            <span className="ml-0.5 text-foreground">Trackr</span>
          </Link>
        </header>
        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>);
};
export default AppShell;
