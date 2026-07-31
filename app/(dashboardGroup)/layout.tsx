import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ROLE_LABEL } from "./_config/sidebarMenuItems";
import { DashboardSidebar } from "./_components/DashboardSidebar";
import { getMe } from "@/service/getMe";

/**
 * Shell for every signed-in area.
 *
 * `proxy.ts` already turned away anonymous visitors, but this layout fetches
 * the user anyway: it needs the real role from the database (not the token)
 * to pick the sidebar, and it's the last line of defence if the proxy is ever
 * bypassed.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMe();

  if (!user) redirect("/auth/login");

  return (
    <SidebarProvider>
      <DashboardSidebar user={user} />

      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-md">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 h-5" />

          <span className="text-sm font-medium">
            {ROLE_LABEL[user.role]} dashboard
          </span>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </header>

        {/* A div, not <main> — SidebarInset already renders the <main>. */}
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
