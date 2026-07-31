import { XCircleIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Payment cancelled" };

/**
 * Where Stripe sends the customer if they back out of checkout.
 * Nothing was charged and the booking stays ACCEPTED, so they can retry.
 */
export default function PaymentCancelPage() {
  return (
    <div className="mx-auto w-full max-w-lg py-8">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <XCircleIcon className="size-14 text-muted-foreground" />

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">
              Payment cancelled
            </h1>
            <p className="text-muted-foreground text-pretty">
              You weren&apos;t charged. Your booking is still accepted — you can
              pay whenever you&apos;re ready.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button className="flex-1" asChild>
              <Link href="/dashboard/customer/bookings">
                Back to my bookings
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/services">Browse services</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
