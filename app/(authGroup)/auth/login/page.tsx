import { Metadata } from "next";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "../../_components/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your FixItNow account.",
};

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Log in to manage your bookings, jobs and payments.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* The form reads `redirectTo` from the URL, so it needs a boundary. */}
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
