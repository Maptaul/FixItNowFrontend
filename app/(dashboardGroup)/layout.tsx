import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getMe } from "@/service/getMe";
import { redirect } from "next/navigation";
import { CommandPalette } from "./_components/CommandPalette";
import { DashboardBreadcrumb } from "./_components/DashboardBreadcrumb";
import { DashboardSidebar } from "./_components/DashboardSidebar";
import { ROLE_LABEL } from "./_config/sidebarMenuItems";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getMe();

  if (!user) redirect("/auth/login");

  return (
    // SidebarMenuButton renders a Tooltip when collapsed, and this build of
    // the component doesn't bring its own provider — without this the whole
    // dashboard throws "`Tooltip` must be used within `TooltipProvider`".
    <TooltipProvider delayDuration={200}>
      <SidebarProvider
        style={
          {
            // The handoff draws 248px, but nothing here needs it: the
            // wordmark is 145px wide and the longest label ("Job requests")
            // is 12 characters. 216px still clears both and gives the
            // content area 32px back.
            "--sidebar-width": "216px",
            "--sidebar-width-icon": "68px",
          } as React.CSSProperties
        }
      >
        <DashboardSidebar user={user} />

        <SidebarInset className="bg-bg">
          <header className="fx-glass sticky top-0 z-30 flex h-[62px] items-center gap-3 border-b border-line px-5">
            <SidebarTrigger className="md:hidden" />

            <DashboardBreadcrumb role={ROLE_LABEL[user.role]} />

            <div className="ml-auto flex items-center gap-2">
              <CommandPalette role={user.role} />
              <ThemeToggle />

              <span className="hidden sm:block">
                <UserMenu user={user} variant="pill" />
              </span>
              <span className="sm:hidden">
                <UserMenu user={user} />
              </span>
            </div>
          </header>

          {/* Dashboard content area: 28px 26px 64px, per the handoff. */}
          <div className="flex-1 px-4 pt-6 pb-16 sm:px-[26px] sm:pt-7">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default DashboardLayout;
