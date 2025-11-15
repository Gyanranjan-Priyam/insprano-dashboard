
import { auth } from "@/lib/auth";
import { LoginForm } from "./_components/LoginForm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if(session) {
        // If user is admin, redirect to admin dashboard
        if (session.user.role === "admin") {
            return redirect("/admin/events");
        }
        // Otherwise, redirect to user dashboard
        return redirect("/dashboard");
    }
    return (
        <LoginForm />
    )
}