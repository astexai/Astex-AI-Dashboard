import { useState } from "react";
import { LayoutDashboard, FolderKanban, CheckSquare, CreditCard, FileText, Settings, Menu, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Overview" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/todos", icon: CheckSquare, label: "Todos" },
  { to: "/payments", icon: CreditCard, label: "Payments & Dues" },
  { to: "/invoice", icon: FileText, label: "Varnix Invoice" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center border-b border-border px-4">
                <h1 className="text-sm font-bold">Business Dashboard</h1>
              </div>

              <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-secondary text-foreground"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="border-t border-border p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="text-sm font-bold truncate max-w-[200px]">
          {profile?.company_name || "Business"} | Dashboard
        </h1>

        <ThemeToggle />
      </div>
    </div>
  );
};
