import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileNav } from "./MobileNav";
import { useProfile } from "@/hooks/useProfile";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  headerActions?: ReactNode;
}

export const DashboardLayout = ({ children, title, description, headerActions }: DashboardLayoutProps) => {
  const { data: profile } = useProfile();
  const companyName = profile?.company_name || "Astex AI";

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileNav />
      <main className="lg:pl-64 pt-16 lg:pt-0">
        {/* Top Header with Company Name */}
        <div className="hidden lg:flex h-16 items-center justify-between border-b border-border px-6 bg-card">
          <h2 className="text-xl font-semibold">Business Dashboard</h2>
        </div>
        
        <div className="p-4 md:p-6 lg:p-8">
          {(title || headerActions) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
                {description && <p className="text-muted-foreground mt-1">{description}</p>}
              </div>
              {headerActions && <div className="flex gap-2">{headerActions}</div>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};
