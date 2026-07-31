"use client";

import { PencilIcon, PlusIcon, ShapesIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ICategory, IFormState } from "@/lib/types";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../_actions/adminActions";

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
            broad — &ldquo;Plumbing&rdquo;, not &ldquo;Tap washer replacement&rdquo;.
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
          variant="destructive"
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

export function CategoryManager({ categories }: { categories: ICategory[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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
          description="Add the trades your marketplace covers so technicians can list against them."
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    {category.icon ? (
                      <Badge variant="secondary">{category.icon}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
