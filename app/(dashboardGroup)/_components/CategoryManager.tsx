"use client";

import { PencilIcon, PlusIcon, ShapesIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  DataTableCard,
  DataTableCell,
  DataTableFilterBar,
  DataTableHead,
  DataTablePagination,
  DataTableRow,
  DataTableTh,
} from "@/components/design/data-table";
import { Money, Mono } from "@/components/design/money";
import { EmptyState } from "@/components/shared/empty-state";
import { Field, FormAlert, SubmitButton } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ICategory, IFormState } from "@/lib/types";
import {
  createCategory,
  deleteCategory,
  IAdminCategoryStat,
  updateCategory,
} from "../_actions/adminActions";

const PER_PAGE = 10;

const SUPPLY_META = {
  live: { label: "Live", variant: "emerald" as const },
  low: { label: "Low supply", variant: "amber" as const },
  empty: { label: "No technicians", variant: "neutral" as const },
};

/** Create/edit dialog — one component for both, keyed off `category`. */
function CategoryDialog({
  category,
  children,
}: {
  category?: ICategory;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isEdit = Boolean(category);
  const [open, setOpen] = useState(false);

  // Side effects live in the action, not an effect: closing the dialog is a
  // consequence of the submit, not of the state changing.
  const [state, formAction] = useActionState<IFormState, FormData>(
    async (prevState, formData) => {
      const result = isEdit
        ? await updateCategory(category!.id, prevState, formData)
        : await createCategory(prevState, formData);

      if (result?.success) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } else if (result) {
        toast.error(result.message);
      }

      return result;
    },
    null,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit category" : "New service category"}
          </DialogTitle>
          <DialogDescription>
            Categories are how customers filter the marketplace, so keep names
            broad — &ldquo;Plumbing&rdquo;, not &ldquo;Tap washer
            replacement&rdquo;.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <FormAlert message={state?.fieldErrors ? undefined : state?.message} />

          <Field
            label="Name"
            name="name"
            required
            error={state?.fieldErrors?.name}
          >
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              defaultValue={category?.name}
              placeholder="Plumbing"
            />
          </Field>

          <Field
            label="Icon"
            name="icon"
            hint="Optional keyword used for the category artwork, e.g. faucet."
            error={state?.fieldErrors?.icon}
          >
            <Input
              id="icon"
              name="icon"
              defaultValue={category?.icon ?? ""}
              placeholder="faucet"
            />
          </Field>

          <SubmitButton className="w-full" pendingLabel="Saving…">
            {isEdit ? "Save changes" : "Create category"}
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryDialog({ category }: { category: ICategory }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCategory(category.id);

      if (result?.success) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } else {
        // The API blocks deletion while services still reference it.
        toast.error(result?.message ?? "Could not delete this category.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive-soft"
          size="icon-sm"
          aria-label={`Delete ${category.name}`}
        >
          <Trash2Icon />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{category.name}&rdquo;?</DialogTitle>
          <DialogDescription>
            Categories still attached to a service can&apos;t be deleted —
            you&apos;ll get an error if any remain.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Keep it
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting…" : "Delete category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Category table — design handoff § Admin › Services, on the data-table
 * pattern.
 *
 * The handoff's "base price" and Live/Draft status don't exist on the API's
 * category (`{ id, name, icon }`), so the entry price, counts and supply
 * state are all derived — see `getAdminCategoryStats`. The header copy says
 * so, because a number that looks stored but isn't will eventually mislead
 * whoever reads it.
 */
export function CategoryManager({
  categories,
}: {
  categories: IAdminCategoryStat[];
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(query),
    );
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body2 text-text2">
          Counts, entry price and supply are derived from live services and
          bookings — the category itself stores only its name and icon.
        </p>

        <CategoryDialog>
          <Button>
            <PlusIcon />
            New category
          </Button>
        </CategoryDialog>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={ShapesIcon}
          title="No categories yet"
          description="Add the trades your marketplace covers so technicians have something to list against."
          action={
            <CategoryDialog>
              <Button>
                <PlusIcon />
                New category
              </Button>
            </CategoryDialog>
          }
        />
      ) : (
        <DataTableCard template="1.5fr .7fr .7fr .7fr .9fr auto">
          <DataTableFilterBar
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search categories…"
          />

          <DataTableHead>
            <DataTableTh>Category</DataTableTh>
            <DataTableTh>Technicians</DataTableTh>
            <DataTableTh>Services</DataTableTh>
            <DataTableTh>Bookings</DataTableTh>
            <DataTableTh>Supply</DataTableTh>
            <DataTableTh className="text-right">Actions</DataTableTh>
          </DataTableHead>

          {visible.length === 0 ? (
            <p className="border-t border-line px-5 py-10 text-center text-body2 text-text2">
              No category matches that search.
            </p>
          ) : (
            visible.map((category) => {
              const supply = SUPPLY_META[category.supply];

              return (
                <DataTableRow key={category.id}>
                  <DataTableCell label="Category">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="grid size-9 shrink-0 place-items-center rounded-md bg-primary-soft text-[15px] text-primary"
                      >
                        {category.icon ? category.icon.charAt(0).toUpperCase() : "•"}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-text">
                          {category.name}
                        </span>
                        <span className="block truncate text-[12px] text-text3">
                          {category.fromPrice !== null ? (
                            <>
                              from <Money value={category.fromPrice} />
                            </>
                          ) : (
                            "No services listed"
                          )}
                        </span>
                      </span>
                    </span>
                  </DataTableCell>

                  <DataTableCell label="Technicians">
                    <Mono className="text-text2">
                      {category.technicianCount}
                    </Mono>
                  </DataTableCell>

                  <DataTableCell label="Services">
                    <Mono className="text-text2">{category.serviceCount}</Mono>
                  </DataTableCell>

                  <DataTableCell label="Bookings">
                    <Mono className="text-text2">{category.bookingCount}</Mono>
                  </DataTableCell>

                  <DataTableCell label="Supply">
                    <Badge variant={supply.variant}>{supply.label}</Badge>
                  </DataTableCell>

                  <DataTableCell className="md:text-right">
                    <span className="flex justify-end gap-2">
                      <CategoryDialog category={category}>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label={`Edit ${category.name}`}
                        >
                          <PencilIcon />
                        </Button>
                      </CategoryDialog>

                      <DeleteCategoryDialog category={category} />
                    </span>
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
      )}
    </div>
  );
}
