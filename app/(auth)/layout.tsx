
import { Button } from "@/components/ui/button";
import { ArrowLeft, School } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center">

            <Link href="/">
                <Button variant="outline" className="absolute left-4 top-4">
                    <ArrowLeft className="mr-2" />
                    Back
                </Button>
            </Link>

            <div className="flex w-full max-w-lg flex-col gap-6">

            <Link href="/" className="flex items-center gap-2 self-center font-medium">
                {/* <Image src="/logo.png" alt="Logo" width={32} height={32} /> */}
                <span className="text-3xl text-center flex items-center"><School className="size-8 mr-4"/>INSPRANO</span>
            </Link>    
                {children}
                <div className="text-balance text-center text-xs text-muted-foreground">
                    By clicking continue, you agree to our{" "}
                    <Link href="/terms" className="text-blue-700 hover:text-primary">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-700 hover:text-primary">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </div>
    );
}