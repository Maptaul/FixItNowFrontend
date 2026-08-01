import { Metadata } from "next";
import { getAdminCategoryStats } from "../../../_actions/adminActions";
import { CategoryManager } from "../../../_components/CategoryManager";
import { PageHeader } from "../../../_components/PageHeader";

export const metadata: Metadata = { title: "Service categories" };

const AdminCategoriesPage = async () => {
  const categories = await getAdminCategoryStats();

  return (
    <>
      <PageHeader
        title="Service categories"
        description="The trades technicians can list under, and the filters customers browse by."
      />

      <CategoryManager categories={categories} />
    </>
  );
};

export default AdminCategoriesPage;
