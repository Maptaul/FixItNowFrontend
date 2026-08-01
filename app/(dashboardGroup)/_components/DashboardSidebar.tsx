"use client";

import { Logo } from "@/components/shared/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { IUser } from "@/lib/types";
import { logout } from "@/service/logout";
import { HomeIcon, LogOutIcon, PanelLeftIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROLE_LABEL, SIDEBAR_ITEMS } from "../_config/sidebarMenuItems";

/**
 * Dashboard sidebar — design handoff § Dashboard shell.
 *
 * 248px expanded / 68px icon rail, sticky full height, 1px right border on
 * --surface. The brand block carries a 32px r10 primary tile plus the role
 * label; nav items are 9px/11px at r10 with an 18px centred icon slot. When
 * collapsed only the icon renders, and each item keeps its label as a
 * tooltip. Width transitions over 180ms.
 */
export function DashboardSidebar({ user }: { user: IUser }) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();

  const items = SIDEBAR_ITEMS[user.role];
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-line">
      <SidebarHeader className="border-b border-line px-3 py-4">
        {/*
         * A div, not a Link — <Logo> already renders its own anchor to "/",
         * and nesting one <a> inside another is invalid HTML that React
         * reports as a hydration error.
         */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Logo />
          <span className="min-w-0 truncate text-[11.5px] font-medium text-text3 group-data-[collapsible=icon]:hidden">
            {ROLE_LABEL[user.role]}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                // Only the overview link is an exact match; the rest are
                // prefixes so nested pages keep their parent highlighted.
                const isOverview = item.href.split("/").length === 3;
                const isActive = isOverview
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className="h-auto gap-3 rounded-md px-[11px] py-[9px] text-body2 font-semibold data-[active=true]:bg-primary-soft data-[active=true]:text-primary"
                    >
                      <Link href={item.href}>
                        <item.icon className="size-[18px]" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-line">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Back to site"
              className="h-auto gap-3 rounded-md px-[11px] py-[9px] text-body2 font-semibold"
            >
              <Link href="/">
                <HomeIcon className="size-[18px]" />
                <span>Back to site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout()}
              tooltip="Log out"
              className="h-auto gap-3 rounded-md px-[11px] py-[9px] text-body2 font-semibold text-text2 hover:text-red"
            >
              <LogOutIcon className="size-[18px]" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Collapse control sits above the border, per the handoff. */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip="Expand sidebar"
              className="h-auto gap-3 rounded-md px-[11px] py-[9px] text-body2 font-semibold text-text3"
            >
              <PanelLeftIcon className="size-[18px]" />
              <span>{isCollapsed ? "Expand" : "Collapse"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
