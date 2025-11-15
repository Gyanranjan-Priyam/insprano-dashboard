import { EditBookingForm } from "../../_components/edit-booking-form";
import { getUserProfile, getUserAccommodationBooking, getAvailableStays } from "../actions";
import { PageHeader } from "@/components/ui/page-header";
import { redirect } from "next/navigation";

interface EditAccommodationPageProps {
  params: Promise<{ userId: string }>;
}

export default async function EditAccommodationPage({ params }: EditAccommodationPageProps) {
  const { userId } = await params;
  
  const userProfileResult = await getUserProfile();
  const existingBookingResult = await getUserAccommodationBooking();
  const staysResult = await getAvailableStays();

  // Redirect if no existing booking
  if (existingBookingResult.status !== "success" || !existingBookingResult.data) {
    redirect(`/dashboard/accommodations/${userId}`);
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Edit Accommodation Booking"
          description="Modify your accommodation reservation. Additional charges may apply for upgrades."
          showBreadcrumbs={true}
          backButtonProps={{
            fallbackUrl: `/dashboard/accommodations/${userId}`,
            label: "Back to Booking"
          }}
        />
        
        <div className="mt-8">
          <EditBookingForm 
            existingBooking={existingBookingResult.data}
            userProfile={userProfileResult.status === "success" ? userProfileResult.data : null}
            availableStays={staysResult.status === "success" ? staysResult.data : []}
            userId={userId}
          />
        </div>
      </div>
    </div>
  );
}