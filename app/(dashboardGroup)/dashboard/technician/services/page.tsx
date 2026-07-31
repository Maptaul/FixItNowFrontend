import { PencilIcon, WrenchIcon } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { getMe } from "@/service/getMe";
import { getCategories } from "../../../../(publicGroup)/_actions/getCategories";
import { getTechnicianById } from "../../../../(publicGroup)/_actions/getTechnicians";
import { DeleteServiceDialog } from "../../../_components/DeleteServiceDialog";
import { PageHeader } from "../../../_components/PageHeader";
import { ServiceFormDialog } from "../../../_components/ServiceFormDialog";

export const metadata: Metadata = { title: "My services" };

export default async function TechnicianServicesPage() {
  const user = await getMe();
  if (!user) redirect("/auth/login");

  const profileId = user.technicianProfile?.id;

  // The API has no "my services" route — a technician's services come back on
  // their own public profile, so that's where the dashboard reads them from.
  const [profile, categories] = await Promise.all([
    profileId ? getTechnicianById(profileId) : Promise.resolve(null),
    getCategories(),
  ]);

  const services = profile?.services ?? [];

  return (
    <>
      <PageHeader
        title="My services"
        description="Everything you list here is bookable straight away."
        action={<ServiceFormDialog categories={categories} />}
      />

      {services.length === 0 ? (
        <EmptyState
          icon={WrenchIcon}
          title="No services listed"
          description="Add your first service so customers can find and book you."
          action={<ServiceFormDialog categories={categories} />}
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="font-medium">{service.title}</div>
                    {service.description && (
                      <div className="max-w-md truncate text-xs text-muted-foreground">
                        {service.description}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    {service.category ? (
                      <Badge variant="secondary">{service.category.name}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  <TableCell className="font-medium tabular-nums">
                    {formatCurrency(service.price)}
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <ServiceFormDialog
                        categories={categories}
                        service={service}
                      >
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label={`Edit ${service.title}`}
                        >
                          <PencilIcon />
                        </Button>
                      </ServiceFormDialog>

                      <DeleteServiceDialog service={service} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
