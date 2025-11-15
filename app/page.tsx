import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check if user is already authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    // If user is admin, redirect to admin dashboard
    if (session.user.role === "admin") {
      return redirect("/admin");
    }
    // Otherwise, redirect to user dashboard
    return redirect("/dashboard");
  }

  // For unauthenticated users, redirect to login page
  return redirect("/login");
}
