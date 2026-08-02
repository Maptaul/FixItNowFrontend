import { PencilIcon, WrenchIcon } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  DataTableCard,
  DataTableCell,
  DataTableHead,
  DataTableRow,
  DataTableTh,
} from "@/components/design/data-table";
import { Money } from "@/components/design/money";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMe } from "@/service/getMe";
import { getCategories } from "../../../../(publicGroup)/_actions/getCategories";
import { getTechnicianById } from "../../../../(publicGroup)/_actions/getTechnicians";
import { DeleteServiceDialog } from "../../../_components/DeleteServiceDialog";
import { PageHeader } from "../../../_components/PageHeader";
import { ServiceFormDialog } from "../../../_components/ServiceFormDialog";

export const metadata: Metadata = { title: "My services" };

const TechnicianServicesPage = async () => {
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
        /*
         * The app's own data table, not the raw shadcn one this page used to
         * carry. Four columns never fit a phone, and the old table answered
         * that with a sideways scrollbar that hid the edit and delete buttons.
         * This one collapses each row into a labelled card below 768px, which
         * is what every other table in the dashboard already does.
         */
        <DataTableCard template="1.9fr 1fr .8fr auto">
          <DataTableHead>
            <DataTableTh>Service</DataTableTh>
            <DataTableTh>Category</DataTableTh>
            <DataTableTh>Price</DataTableTh>
            <DataTableTh className="text-right">Actions</DataTableTh>
          </DataTableHead>

          {services.map((service) => (
            <DataTableRow key={service.id}>
              <DataTableCell label="Service">
                <p className="truncate font-semibold text-text">
                  {service.title}
                </p>
                {service.description && (
                  <p className="truncate text-[12px] text-text3">
                    {service.description}
                  </p>
                )}
              </DataTableCell>

              <DataTableCell label="Category">
                {service.category ? (
                  <Badge variant="secondary">{service.category.name}</Badge>
                ) : (
                  <span className="text-text3">—</span>
                )}
              </DataTableCell>

              <DataTableCell label="Price">
                <Money value={service.price} className="font-semibold" />
              </DataTableCell>

              <DataTableCell className="md:text-right">
                <div className="flex justify-end gap-2">
                  <ServiceFormDialog categories={categories} service={service}>
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
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableCard>
      )}
    </>
  );
};

export default TechnicianServicesPage;
