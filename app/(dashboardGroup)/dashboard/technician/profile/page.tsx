import { ExternalLinkIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMe } from "@/service/getMe";
import { AccountForm } from "../../../_components/AccountForm";
import { PageHeader } from "../../../_components/PageHeader";
import { TechnicianProfileForm } from "../../../_components/TechnicianProfileForm";

export const metadata: Metadata = { title: "My profile" };

export default async function TechnicianProfilePage() {
  const user = await getMe();
  if (!user) redirect("/auth/login");

  const profile = user.technicianProfile;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="My profile"
        description="This is what customers see before they book you."
        action={
          profile && (
            <Button variant="outline" asChild>
              <Link href={`/technicians/${profile.id}`}>
                <ExternalLinkIcon />
                View public profile
              </Link>
            </Button>
          )
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Trade profile</CardTitle>
          </CardHeader>
          <CardContent>
            {profile ? (
              <TechnicianProfileForm profile={profile} />
            ) : (
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t load your technician profile. Try reloading the
                page — if it keeps happening, log out and back in.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountForm user={user} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
