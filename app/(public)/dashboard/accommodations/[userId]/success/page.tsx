import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home, Calendar } from "lucide-react";
import Link from "next/link";

interface BookingSuccessPageProps {
  params: {
    userId: string;
  };
}

export default function BookingSuccessPage({ params }: BookingSuccessPageProps) {
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Booking Confirmed!
            </CardTitle>
            <CardDescription>
              Your accommodation booking has been successfully confirmed.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                You will receive a confirmation email with your booking details shortly.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">What's Next?</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Check your email for booking confirmation</li>
                <li>• Save your booking reference for future use</li>
                <li>• Contact us if you need to make any changes</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              
              <Link href={`/dashboard/accommodations/${params.userId}`}>
                <Button className="w-full sm:w-auto">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Another Stay
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}