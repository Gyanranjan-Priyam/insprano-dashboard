"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Loader, Loader2, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


export function LoginForm() {
    const router = useRouter();
    const [githubPending, startGithubTransition] = useTransition();
    const [googlePending, startGoogleTransition] = useTransition();
    const [emailPending, startEmailTransition] = useTransition();

    const [email, setEmail] = useState("");

    async function signInWithGithub() {
        startGithubTransition(async() => {
            await authClient.signIn.social({
                provider: "github",
                callbackURL: "/auth/callback",
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Successfully signed in with Github!");
                    },
                    onError: () => {
                        toast.error("Internal Server Error");
                    },
                },
            });
        })
    }
    async function signInWithGoogle() {
        startGoogleTransition(async() => {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "/auth/callback",
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Successfully signed in with Google!");
                    },
                    onError: () => {
                        toast.error("Internal Server Error");
                    },
                },
            });
        })
    }
    function signInWithEmail() {
        startEmailTransition(async() => {
            await authClient.emailOtp.sendVerificationOtp({
                email: email,
                type: "sign-in",
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Verification email sent!");
                        router.push(`/verify-request?email=${email}`);
                    },
                    onError: () => {
                        toast.error("Error sending verification email");
                    }
                }
            })
        })
    }

        return (
        <Card>
            <CardHeader>
                <CardTitle>Welcome to INSPRANO Registration Portal</CardTitle>
                <CardDescription>Login to your account to complete the full registration.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Button disabled={githubPending} onClick={signInWithGithub} variant="outline">
                    {githubPending ? (
                        <>
                            <Loader className="size-4 animate-spin"/>
                            <span>Signing In...</span>
                        </>
                    ) : (
                        <>
                            <FaGithub className="size-4" />
                            Sign In with Github
                        </>
                    )}
                </Button>
                <Button disabled={googlePending} onClick={signInWithGoogle} variant="outline">
                    {googlePending ? (
                        <>
                            <Loader className="size-4 animate-spin"/>
                            <span>Signing In...</span>
                        </>
                    ) : (
                        <>
                            <FaGoogle className="size-4" />
                            Sign In with Google
                        </>
                    )}
                </Button>

                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-card px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>

                <div className="grid gap-3">
                    <div className="grid gap-2">
                        <Label htmlFor="email"> Email address</Label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" required />
                    </div>

                    <Button onClick={signInWithEmail} disabled={emailPending}>
                        {emailPending ? (
                            <>
                                <Loader2 className="size-4 animate-spin"/>
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <Send className="size-4" />
                                <span>Continue With Email</span>
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}