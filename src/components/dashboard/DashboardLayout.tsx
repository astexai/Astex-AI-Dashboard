import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileNav } from "./MobileNav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <MobileNav />
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
