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

        {/*
         * min-w-0: the inset is a flex child, and a flex child's default
         * `min-width: auto` refuses to shrink below its content. One wide
         * descendant — a table, a chart, an unbreakable string — then pushes
         * the whole column past the viewport instead of scrolling inside it,
         * which is what clipped every card's right edge on a phone.
         */}
        <SidebarInset className="min-w-0 bg-bg">
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

          {/*
           * Dashboard content area: 28px 26px 64px, per the handoff.
           *
           * min-w-0 matters here as much as on the inset. This is a flex item
           * in a column container, so it stretches to the inset's width but
           * `min-width: auto` still refuses to go below its widest child's
           * min-content. One wide card then dragged this whole div past the
           * viewport while the header — a flex row whose children shrink —
           * stayed put, which is why the header looked fine and every card
           * below it was clipped on the right.
           */}
          <div className="fx-dash min-w-0 flex-1 px-4 pt-6 pb-16 sm:px-[26px] sm:pt-7">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default DashboardLayout;
