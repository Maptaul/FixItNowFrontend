"use client";

import { SearchIcon, ShieldBanIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { IRole, IUser } from "@/lib/types";
import { updateUserStatus } from "../_actions/adminActions";

const ROLE_FILTERS: { value: IRole | "ALL"; label: string }[] = [
  { value: "ALL", label: "All roles" },
  { value: "CUSTOMER", label: "Customers" },
  { value: "TECHNICIAN", label: "Technicians" },
  { value: "ADMIN", label: "Admins" },
];

const PER_PAGE = 10;

/**
 * Admin user directory.
 *
 * The API hands back the full list, so search, role filtering and paging all
 * happen here — instant, and no round-trip per keystroke. Ban/unban is the
 * one thing that goes back to the server.
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
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = role === "ALL" || user.role === role;
      const matchesQuery =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      return matchesRole && matchesQuery;
    });
  }, [users, search, role]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const toggleBan = (user: IUser) => {
    const nextStatus = user.activeStatus === "BLOCKED" ? "ACTIVE" : "BLOCKED";

    startTransition(async () => {
      const result = await updateUserStatus(user.id, nextStatus);

      if (result?.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result?.message ?? "Could not update this user.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or email…"
            aria-label="Search users"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={role}
          onValueChange={(value) => {
            setRole(value as IRole | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-44" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users match"
          description="Try a different search term or clear the role filter."
        />
      ) : (
        <>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {visible.map((user) => {
                  const isBlocked = user.activeStatus === "BLOCKED";
                  const isSelf = user.id === currentUserId;

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            isBlocked
                              ? "border-red-500/30 bg-red-500/12 text-red-700 dark:text-red-300"
                              : "border-green-500/30 bg-green-500/12 text-green-700 dark:text-green-300"
                          }
                        >
                          {isBlocked ? "Banned" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isSelf ? (
                          <span className="text-xs text-muted-foreground">
                            That&apos;s you
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant={isBlocked ? "outline" : "destructive"}
                            disabled={isPending}
                            onClick={() => toggleBan(user)}
                          >
                            {isBlocked ? <ShieldCheckIcon /> : <ShieldBanIcon />}
                            {isBlocked ? "Unban" : "Ban"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filtered.length} user{filtered.length === 1 ? "" : "s"} · page{" "}
              {safePage} of {totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
