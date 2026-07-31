"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { IService } from "@/lib/types";
import { deleteService } from "../_actions/serviceActions";

export function DeleteServiceDialog({ service }: { service: IService }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteService(service.id);

      if (result?.success) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } else {
        // Usually a booking still references it — the API says so.
        toast.error(result?.message ?? "Could not delete this service.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon-sm"
          aria-label={`Delete ${service.title}`}
        >
          <Trash2Icon />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{service.title}&rdquo;?</DialogTitle>
          <DialogDescription>
            It will disappear from search and nobody will be able to book it.
            Existing bookings are unaffected.
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
            {isPending ? "Deleting…" : "Delete service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
