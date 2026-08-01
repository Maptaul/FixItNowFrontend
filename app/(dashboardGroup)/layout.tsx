import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardSidebar } from "./_components/DashboardSidebar";
import { DashboardBreadcrumb } from "./_components/DashboardBreadcrumb";
import { ROLE_LABEL } from "./_config/sidebarMenuItems";
import { getMe } from "@/service/getMe";

/**
 * Shell for every signed-in area — design handoff § Dashboard shell.
 *
 * Sidebar is 248px expanded / 68px collapsed (the handoff's icon rail), and
 * the header is a sticky 62px bar carrying the `Role / Page` breadcrumb and a
 * profile pill.
 *
 * `proxy.ts` already turned away anonymous visitors, but this layout fetches
 * the user anyway: it needs the real role from the database (not the token)
 * to pick the sidebar, and it's the last line of defence if the proxy is ever
 * bypassed.
 *
 * Not built: the handoff's ⌘K search affordance and notification drawer. The
 * API has no search or notification endpoints, and a control that does
 * nothing is worse than no control.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            "--sidebar-width": "248px",
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
}
