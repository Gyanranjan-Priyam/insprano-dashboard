import { UserDetailsForm } from "../_components/user-details-form";
import { BookingDetailsView } from "../_components/booking-details-view";
import { getUserProfile, getUserAccommodationBooking } from "./actions";

interface AccommodationsUserPageProps {
  params: Promise<{ userId: string }>;
}

export default async function AccommodationsUserPage({ params }: AccommodationsUserPageProps) {
  const { userId } = await params;
  const userProfileResult = await getUserProfile();
  const existingBookingResult = await getUserAccommodationBooking();
  
  // If user has existing booking, show booking details
  if (existingBookingResult.status === "success" && existingBookingResult.data) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Accommodation Booking</h1>
            <p className="text-muted-foreground">
              View and manage your accommodation reservation
            </p>
          </div>
          
          <BookingDetailsView 
            booking={existingBookingResult.data}
            userProfile={userProfileResult.status === "success" ? userProfileResult.data : null}
          />
        </div>
      </div>
    );
  }
  
  // Otherwise, show booking form
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Book Accommodation</h1>
          <p className="text-muted-foreground">
            Fill in your details to start booking your stay and meals
          </p>
        </div>
        
        <UserDetailsForm 
          initialData={userProfileResult.status === "success" ? userProfileResult.data : null}
          userId={userId}
        />
      </div>
    </div>
  );
}