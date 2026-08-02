"use client";

import { ShieldBanIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  DataTableBulkBar,
  DataTableCard,
  DataTableCell,
  DataTableFilterBar,
  DataTableFilterButton,
  DataTableHead,
  DataTablePagination,
  DataTableRow,
  DataTableTh,
} from "@/components/design/data-table";
import { GradientAvatar } from "@/components/design/gradient-avatar";
import { Mono } from "@/components/design/money";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/format";
import { IActiveStatus, IRole, IUser } from "@/lib/types";
import { updateUserStatus } from "../_actions/adminActions";

const PER_PAGE = 10;

const ROLE_CYCLE: (IRole | "ALL")[] = [
  "ALL",
  "CUSTOMER",
  "TECHNICIAN",
  "ADMIN",
];

const STATUS_CYCLE: (IActiveStatus | "ALL")[] = ["ALL", "ACTIVE", "BLOCKED"];

/** ALL → "All", TECHNICIAN → "Technician". */
const label = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

/**
 * Admin user directory — design handoff § Data table, including the
 * conditional bulk-action bar.
 *
 * The API returns the whole directory in one call, so search, filtering and
 * paging all happen here. Ban/unban is the only thing that goes back to the
 * server; bulk simply fans the same call out across the selection, because
 * the API has no bulk endpoint and inventing one client-side would hide
 * partial failures.
 */
export function UsersTable({
  users,
  currentUserId,
}: {
  users: IUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<IRole | "ALL">("ALL");
  const [status, setStatus] = useState<IActiveStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      if (role !== "ALL" && user.role !== role) return false;
      if (status !== "ALL" && user.activeStatus !== status) return false;
      if (!query) return true;

      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });
  }, [users, search, role, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  const selectableOnPage = visible.filter((user) => user.id !== currentUserId);
  const allOnPageSelected =
    selectableOnPage.length > 0 &&
    selectableOnPage.every((user) => selected.has(user.id));

  const toggleOne = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelected((current) => {
      const next = new Set(current);
      if (allOnPageSelected) {
        selectableOnPage.forEach((user) => next.delete(user.id));
      } else {
        selectableOnPage.forEach((user) => next.add(user.id));
      }
      return next;
    });
  };

  const applyStatus = (nextStatus: IActiveStatus, ids: string[]) => {
    startTransition(async () => {
      const results = await Promise.all(
        ids.map((id) => updateUserStatus(id, nextStatus)),
      );

      const failed = results.filter((result) => !result?.success).length;

      if (failed === 0) {
        toast.success(
          ids.length === 1
            ? (results[0]?.message ?? "User updated.")
            : `${ids.length} users updated.`,
        );
      } else {
        toast.error(
          `${failed} of ${ids.length} could not be updated — the rest went through.`,
        );
      }

      setSelected(new Set());
      router.refresh();
    });
  };

  return (
    <DataTableCard template="auto 1.6fr .8fr .7fr .9fr auto">
      <DataTableFilterBar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by name or email…"
      >
        <DataTableFilterButton
          label="Role"
          value={label(role)}
          isApplied={role !== "ALL"}
          onClear={() => {
            setRole("ALL");
            setPage(1);
          }}
          onClick={() => {
            const index = ROLE_CYCLE.indexOf(role);
            setRole(ROLE_CYCLE[(index + 1) % ROLE_CYCLE.length]);
            setPage(1);
          }}
        />

        <DataTableFilterButton
          label="Status"
          value={label(status)}
          isApplied={status !== "ALL"}
          onClear={() => {
            setStatus("ALL");
            setPage(1);
          }}
          onClick={() => {
            const index = STATUS_CYCLE.indexOf(status);
            setStatus(STATUS_CYCLE[(index + 1) % STATUS_CYCLE.length]);
            setPage(1);
          }}
        />
      </DataTableFilterBar>

      <DataTableBulkBar count={selected.size}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => applyStatus("ACTIVE", [...selected])}
        >
          Reinstate
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          className="text-red hover:text-red"
          onClick={() => applyStatus("BLOCKED", [...selected])}
        >
          Ban users
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setSelected(new Set())}
        >
          Clear
        </Button>
      </DataTableBulkBar>

      <DataTableHead>
        <DataTableTh>
          <Checkbox
            checked={allOnPageSelected}
            onCheckedChange={toggleAllOnPage}
            aria-label="Select all users on this page"
          />
        </DataTableTh>
        <DataTableTh>User</DataTableTh>
        <DataTableTh>Role</DataTableTh>
        <DataTableTh>Status</DataTableTh>
        <DataTableTh>Joined</DataTableTh>
        <DataTableTh className="text-right">Actions</DataTableTh>
      </DataTableHead>

      {visible.length === 0 ? (
        <div className="border-t border-line p-6">
          <EmptyState
            icon={UsersIcon}
            title="No users match"
            description="Nothing fits that combination. Clearing the role or status filter usually brings the list back."
          />
        </div>
      ) : (
        visible.map((user) => {
          const isBlocked = user.activeStatus === "BLOCKED";
          const isSelf = user.id === currentUserId;

          return (
            <DataTableRow key={user.id}>
              <DataTableCell>
                <Checkbox
                  checked={selected.has(user.id)}
                  disabled={isSelf}
                  onCheckedChange={() => toggleOne(user.id)}
                  aria-label={`Select ${user.name}`}
                />
              </DataTableCell>

              <DataTableCell label="User">
                <span className="flex min-w-0 items-center gap-2.5">
                  <GradientAvatar
                    name={user.name}
                    src={user.avatarUrl}
                    kind={
                      user.role === "ADMIN"
                        ? "admin"
                        : user.role === "TECHNICIAN"
                          ? "technician"
                          : "customer"
                    }
                    size={32}
                    radius={999}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-text">
                      {user.name}
                    </span>
                    <span className="block truncate text-[12px] text-text3">
                      {user.email}
                    </span>
                  </span>
                </span>
              </DataTableCell>

              <DataTableCell label="Role">
                <Badge variant="neutral">{user.role}</Badge>
              </DataTableCell>

              <DataTableCell label="Status">
                <Badge variant={isBlocked ? "red" : "emerald"}>
                  {isBlocked ? "Banned" : "Active"}
                </Badge>
              </DataTableCell>

              <DataTableCell label="Joined">
                <Mono className="text-[12.5px] text-text2">
                  {formatDate(user.createdAt)}
                </Mono>
              </DataTableCell>

              <DataTableCell className="md:text-right">
                {isSelf ? (
                  <span className="text-[12px] text-text3">
                    That&apos;s you
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant={isBlocked ? "outline" : "destructive-soft"}
                    disabled={isPending}
                    onClick={() =>
                      applyStatus(isBlocked ? "ACTIVE" : "BLOCKED", [user.id])
                    }
                  >
                    {isBlocked ? <ShieldCheckIcon /> : <ShieldBanIcon />}
                    {isBlocked ? "Unban" : "Ban"}
                  </Button>
                )}
              </DataTableCell>
            </DataTableRow>
          );
        })
      )}

      <DataTablePagination
        page={safePage}
        pageSize={PER_PAGE}
        total={filtered.length}
        onPageChange={setPage}
      />
    </DataTableCard>
  );
}
