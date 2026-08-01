import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMe } from "@/service/getMe";
import { PageHeader } from "../../../_components/PageHeader";
import { ProfileTabs } from "../../../_components/ProfileTabs";

export const metadata: Metadata = { title: "Profile & settings" };

const CustomerProfilePage = async () => {
  const user = await getMe();
  if (!user) redirect("/auth/login");

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Profile & settings"
        description="The name technicians see, and your password."
      />

      <ProfileTabs user={user} />
    </div>
  );
};

export default CustomerProfilePage;
