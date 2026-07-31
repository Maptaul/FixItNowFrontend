import { Metadata } from "next";
import { getAdminCategories } from "../../../_actions/adminActions";
import { CategoryManager } from "../../../_components/CategoryManager";
import { PageHeader } from "../../../_components/PageHeader";

export const metadata: Metadata = { title: "Service categories" };

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <>
      <PageHeader
        title="Service categories"
        description="The trades technicians can list under, and the filters customers browse by."
      />

      <CategoryManager categories={categories} />
    </>
  );
}
