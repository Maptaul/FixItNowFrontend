"use client";

import {
  ChevronDownIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import {
  GradientAvatar,
  IdentityKind,
} from "@/components/design/gradient-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_HOME } from "@/lib/constants";
import { IRole, IUser } from "@/lib/types";
import { logout } from "@/service/logout";

const KIND_BY_ROLE: Record<IRole, IdentityKind> = {
  CUSTOMER: "customer",
  TECHNICIAN: "technician",
  ADMIN: "admin",
};

/**
 * Account menu.
 *
 * `pill` is the dashboard-header treatment from the handoff: r999, 28px
 * avatar + name + chevron. `avatar` is the compact trigger used in the
 * public navbar and on narrow screens.
 */
export function UserMenu({
  user,
  variant = "avatar",
}: {
  user: IUser;
  variant?: "avatar" | "pill";
}) {
  const home = ROLE_HOME[user.role];
  const kind = KIND_BY_ROLE[user.role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "pill" ? (
          <button
            type="button"
            aria-label="Open account menu"
            className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pr-2.5 pl-1 transition-colors duration-120 hover:bg-surface2"
          >
            <GradientAvatar
              name={user.name}
              src={user.avatarUrl}
              kind={kind}
              size={28}
              radius={999}
            />
            <span className="max-w-32 truncate text-caption text-text">
              {user.name}
            </span>
            <ChevronDownIcon
              aria-hidden="true"
              className="size-3.5 text-text3"
            />
          </button>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open account menu"
            className="rounded-full"
          >
            <GradientAvatar
              name={user.name}
              src={user.avatarUrl}
              kind={kind}
              size={28}
              radius={999}
            />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="grid gap-0.5">
          <span className="truncate font-semibold">{user.name}</span>
          <span className="truncate text-caption font-normal text-text3">
            {user.email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={home}>
            <LayoutDashboardIcon />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`${home}/profile`}>
            <UserIcon />
            My profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* A server action keeps the httpOnly cookie deletion on the server. */}
        <DropdownMenuItem variant="destructive" onSelect={() => logout()}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
