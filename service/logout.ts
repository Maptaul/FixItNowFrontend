"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** Drop the session cookie and send the user back to the home page. */
export const logout = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");

  redirect("/");
};
