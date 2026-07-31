import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMe } from "@/service/getMe";
import { AccountForm } from "../../../_components/AccountForm";
import { PageHeader } from "../../../_components/PageHeader";

export const metadata: Metadata = { title: "My profile" };

export default async function CustomerProfilePage() {
  const user = await getMe();
  if (!user) redirect("/auth/login");

  return (
    <div className="max-w-xl">
      <PageHeader
        title="My profile"
        description="Update the name technicians see and change your password."
      />

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
