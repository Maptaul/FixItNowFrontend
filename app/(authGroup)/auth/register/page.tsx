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
import { RegisterForm } from "../../_components/RegisterForm";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Join FixItNow as a customer to book home services, or as a technician to sell them.",
};

const RegisterPage = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Pick how you&apos;ll use FixItNow — you can only choose once.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <RegisterForm />
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default RegisterPage;
