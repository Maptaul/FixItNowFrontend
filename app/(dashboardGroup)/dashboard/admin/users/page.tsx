import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMe } from "@/service/getMe";
import { getAllUsers } from "../../../_actions/adminActions";
import { PageHeader } from "../../../_components/PageHeader";
import { UsersTable } from "../../../_components/UsersTable";

export const metadata: Metadata = { title: "User management" };

export default async function AdminUsersPage() {
  const [users, me] = await Promise.all([getAllUsers(), getMe()]);

  if (!me) redirect("/auth/login");

  return (
    <>
      <PageHeader
        title="User management"
        description="Search the directory and ban anyone abusing the platform. A banned user can't sign in."
      />

      <UsersTable users={users} currentUserId={me.id} />
    </>
  );
}
