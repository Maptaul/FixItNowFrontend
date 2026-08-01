import { CheckCircle2Icon, ClockIcon, TriangleAlertIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { confirmPayment } from "../../_actions/paymentActions";

export const metadata: Metadata = { title: "Payment complete" };

const PaymentSuccessPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) => {
  const { session_id: sessionId } = await searchParams;

  const result = sessionId
    ? await confirmPayment(sessionId)
    : {
        paid: false,
        message:
          "We didn't get a checkout session back from Stripe, so we can't confirm this payment.",
      };

  const Icon = result.paid
    ? CheckCircle2Icon
    : sessionId
      ? ClockIcon
      : TriangleAlertIcon;

  return (
    <div className="mx-auto w-full max-w-lg py-8">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <Icon
            className={
              result.paid
                ? "size-14 text-green-600"
                : "size-14 text-muted-foreground"
            }
          />

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">
              {result.paid ? "Payment received" : "Payment not confirmed yet"}
            </h1>
            <p className="text-muted-foreground text-pretty">
              {result.message}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button className="flex-1" asChild>
              <Link href="/dashboard/customer/bookings">View my bookings</Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/dashboard/customer/payments">Payment history</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
