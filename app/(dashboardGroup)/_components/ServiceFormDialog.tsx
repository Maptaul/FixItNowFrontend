"use client";

import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useActionState, useState } from "react";
import { toast } from "sonner";
import { Field, FormAlert, SubmitButton } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toNumber } from "@/lib/format";
import { ICategory, IFormState, IService } from "@/lib/types";
import { createService, updateService } from "../_actions/serviceActions";

/**
 * Create or edit one of the technician's services.
 *
 * The same dialog covers both: passing a `service` switches it to edit mode
 * and binds the update action instead of the create one.
 */
export function ServiceFormDialog({
  categories,
  service,
  children,
}: {
  categories: ICategory[];
  service?: IService;
  children?: ReactNode;
}) {
  const router = useRouter();
  const isEdit = Boolean(service);
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(service?.categoryId ?? "");

  // Side effects live in the action, not an effect: closing the dialog is a
  // consequence of the submit, not of the state changing.
  const [state, formAction] = useActionState<IFormState, FormData>(
    async (prevState, formData) => {
      const result = isEdit
        ? await updateService(service!.id, prevState, formData)
        : await createService(prevState, formData);

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
      <DialogTrigger asChild>
        {children ?? (
          <Button>
            <PlusIcon />
            Add service
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit service" : "List a new service"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Changes go live immediately for anyone browsing."
              : "This appears in search straight away, so make the title specific."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <FormAlert
            message={state?.fieldErrors ? undefined : state?.message}
          />

          <Field
            label="Title"
            name="title"
            required
            error={state?.fieldErrors?.title}
          >
            <Input
              id="title"
              name="title"
              required
              minLength={3}
              defaultValue={service?.title}
              placeholder="Emergency leak repair"
            />
          </Field>

          <Field
            label="Category"
            name="categoryId"
            required
            error={state?.fieldErrors?.categoryId}
          >
            <input type="hidden" name="categoryId" value={categoryId} />
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="categoryId" className="w-full">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Price (USD)"
            name="price"
            required
            hint="What the customer pays for this job."
            error={state?.fieldErrors?.price}
          >
            <Input
              id="price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              required
              defaultValue={service ? toNumber(service.price) : ""}
              placeholder="120"
            />
          </Field>

          <Field
            label="Description"
            name="description"
            error={state?.fieldErrors?.description}
          >
            <Textarea
              id="description"
              name="description"
              rows={3}
              maxLength={1000}
              defaultValue={service?.description ?? ""}
              placeholder="Includes parts up to $20 and a 12-month guarantee."
            />
          </Field>

          <SubmitButton className="w-full" pendingLabel="Saving…">
            {isEdit ? "Save changes" : "Publish service"}
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
