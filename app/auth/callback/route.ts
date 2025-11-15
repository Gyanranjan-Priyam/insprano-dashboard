import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return redirect("/login");
    }

    // If user is admin, redirect to admin dashboard
    if (session.user.role === "admin") {
        return redirect("/admin/events");
    }

    // Otherwise, redirect to user dashboard
    return redirect("/dashboard");
}