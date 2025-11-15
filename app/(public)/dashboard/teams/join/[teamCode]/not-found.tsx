import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Team Not Found</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
            The team code you entered doesn't exist or is invalid.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="text-sm text-muted-foreground text-center bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
            Please check the team code and try again, or search for teams in the teams page.
          </div>
          
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full h-11 bg-primary hover:bg-primary/90">
              <Link href="/dashboard/teams">
                <Search className="h-4 w-4 mr-2" />
                Browse Teams
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full h-11 border-gray-300 dark:border-gray-600">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}