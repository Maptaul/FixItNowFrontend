"use client";

import { useState } from "react";
import { GradientAvatar } from "@/components/design/gradient-avatar";
import { Mono } from "@/components/design/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { IRole, IUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AccountForm } from "./AccountForm";

const KIND_BY_ROLE = {
  CUSTOMER: "customer",
  TECHNICIAN: "technician",
  ADMIN: "admin",
} as const;

/**
 * Profile & settings — design handoff § Customer › Profile & settings.
 *
 * Identity card with a 72px avatar, then tabs.
 *
 * The handoff has four tabs: Profile, Security, Notifications and Addresses.
 * Only the first two are real here — the API exposes name and password on
 * `PUT /api/auth/my-profile` and nothing else. There is no notification
 * preference model, no address model, and no delete-account endpoint for the
 * danger zone, so those tabs are absent rather than present-and-inert.
 */
const TABS = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProfileTabs({ user }: { user: IUser }) {
  const [tab, setTab] = useState<TabId>("profile");

  return (
    <div className="space-y-6">
      {/* Identity card */}
      <section className="rounded-panel border border-line bg-surface p-6 shadow-sh2">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <GradientAvatar
            name={user.name}
            kind={KIND_BY_ROLE[user.role as IRole]}
            size={72}
            radius={22}
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-panel text-text">{user.name}</h2>
              <Badge
                variant={user.activeStatus === "BLOCKED" ? "red" : "emerald"}
              >
                {user.activeStatus === "BLOCKED" ? "Banned" : "Active"}
              </Badge>
            </div>

            <p className="mt-0.5 truncate text-body2 text-text2">
              {user.email}
            </p>
            <p className="mt-1 text-caption text-text3">
              Member since <Mono>{formatDate(user.createdAt)}</Mono>
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Profile sections"
        className="flex flex-wrap gap-1.5"
      >
        {TABS.map((entry) => {
          const isActive = entry.id === tab;

          return (
            <Button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              variant={isActive ? "soft" : "outline"}
              size="sm"
              onClick={() => setTab(entry.id)}
            >
              {entry.label}
            </Button>
          );
        })}
      </div>

      <section
        role="tabpanel"
        className={cn(
          "rounded-panel border border-line bg-surface p-6 shadow-sh2",
        )}
      >
        {tab === "profile" ? (
          <>
            <h2 className="mb-1.5 text-panel text-text">Your details</h2>
            <p className="mb-5 text-body2 text-text2">
              The name technicians see on your bookings.
            </p>
          </>
        ) : (
          <>
            <h2 className="mb-1.5 text-panel text-text">Security</h2>
            <p className="mb-5 text-body2 text-text2">
              Change your password. Leave it blank to keep the current one.
            </p>
          </>
        )}

        {/*
         * One form serves both tabs: the API updates name and password
         * through a single endpoint, so splitting it into two forms would
         * mean two requests for what is one change.
         */}
        <AccountForm user={user} />
      </section>
    </div>
  );
}
