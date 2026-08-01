import { ExternalLinkIcon, WrenchIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GradientAvatar } from "@/components/design/gradient-avatar";
import { Money, Mono } from "@/components/design/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRating } from "@/lib/format";
import { getMe } from "@/service/getMe";
import { getTechnicianById } from "../../../../(publicGroup)/_actions/getTechnicians";
import { getMyAvailability } from "../../../_actions/technicianActions";
import { AccountForm } from "../../../_components/AccountForm";
import { PageHeader } from "../../../_components/PageHeader";
import { ProfileCompletion } from "../../../_components/ProfileCompletion";
import { TechnicianProfileForm } from "../../../_components/TechnicianProfileForm";

export const metadata: Metadata = { title: "My profile" };

export default async function TechnicianProfilePage() {
  const user = await getMe();
  if (!user) redirect("/auth/login");

  const profile = user.technicianProfile;

  // Services come back on the technician's own public profile — the API has
  // no "my services" route.
  const [publicProfile, slots] = await Promise.all([
    profile ? getTechnicianById(profile.id) : Promise.resolve(null),
    getMyAvailability(),
  ]);

  const services = publicProfile?.services ?? [];
  const reviews = publicProfile?.reviews ?? [];

  const trades = [
    ...new Set(services.map((service) => service.category?.name).filter(Boolean)),
  ] as string[];

  return (
    <div className="max-w-3xl">
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
        <ProfileCompletion
          profile={profile}
          services={services}
          slots={slots}
        />

        {/* Identity card */}
        <section className="rounded-panel border border-line bg-surface p-6 shadow-sh2">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <GradientAvatar
              name={user.name}
              kind="technician"
              size={72}
              radius={22}
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-panel text-text">{user.name}</h2>
                {profile?.isVerified && (
                  <Badge variant="emerald">Verified</Badge>
                )}
              </div>
              <p className="mt-0.5 truncate text-body2 text-text2">
                {user.email}
              </p>
            </div>

            {profile && (
              <div className="flex gap-6 sm:gap-8">
                <div>
                  <Mono className="block text-[19px] font-bold text-text">
                    {formatRating(profile.avgRating)}
                  </Mono>
                  <span className="text-[11.5px] font-medium text-text3">
                    Rating
                  </span>
                </div>
                <div>
                  <Mono className="block text-[19px] font-bold text-text">
                    {reviews.length}
                  </Mono>
                  <span className="text-[11.5px] font-medium text-text3">
                    Reviews
                  </span>
                </div>
                <div>
                  <Money
                    value={profile.hourlyRate}
                    className="block text-[19px] font-bold text-text"
                  />
                  <span className="text-[11.5px] font-medium text-text3">
                    Per hour
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Trade profile */}
        <section
          id="trade-profile"
          className="scroll-mt-24 rounded-panel border border-line bg-surface p-6 shadow-sh2"
        >
          <h2 className="mb-5 text-panel text-text">Trade profile</h2>

          {profile ? (
            <TechnicianProfileForm profile={profile} />
          ) : (
            <p className="text-body2 text-text2">
              We couldn&apos;t load your technician profile. Try reloading — if
              it keeps happening, log out and back in.
            </p>
          )}
        </section>

        {/* Trades covered */}
        <section className="rounded-panel border border-line bg-surface p-6 shadow-sh2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-panel text-text">Trades you cover</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/technician/services">
                <WrenchIcon />
                Manage services
              </Link>
            </Button>
          </div>

          {/*
           * The handoff draws editable skill chips with "+ Add skill". There
           * is no skills field on the API's technician profile — what a
           * technician covers is defined by the categories of the services
           * they list. So these are derived and read-only, and the button
           * goes where you actually change them.
           */}
          {trades.length === 0 ? (
            <p className="text-body2 text-text2">
              Nothing yet. The trades shown on your public profile come from the
              categories of the services you list.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {trades.map((trade) => (
                <Badge key={trade} variant="neutral">
                  {trade}
                </Badge>
              ))}
            </div>
          )}
        </section>

        {/* Account */}
        <section className="rounded-panel border border-line bg-surface p-6 shadow-sh2">
          <h2 className="mb-5 text-panel text-text">Account details</h2>
          <AccountForm user={user} />
        </section>

        {/*
         * Not built: the handoff's documents list (NID, trade licence,
         * certificate, police clearance) with Verified/Expiring chips and an
         * upload button. The API has no document model and no upload
         * endpoint, so every row would be decoration.
         */}
      </div>
    </div>
  );
}
