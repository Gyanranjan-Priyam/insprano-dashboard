import { StaySelectionForm } from "../../_components/stay-selection-form";
import { getAvailableStays, getUserProfile } from "../actions";
import { redirect } from "next/navigation";

interface StaySelectionPageProps {
  params: { userId: string };
}

export default async function StaySelectionPage({ params }: StaySelectionPageProps) {
  // Get user profile to verify the userId
  const userProfileResult = await getUserProfile();
  if (userProfileResult.status !== "success" || !userProfileResult.data) {
    redirect("/login");
  }

  const staysResult = await getAvailableStays();
  
  if (staysResult.status === "error") {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Stays</h1>
          <p className="text-muted-foreground">{staysResult.message}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Select Your Stay</h1>
          <p className="text-muted-foreground">
            Choose your accommodation and select your check-in and check-out dates
          </p>
        </div>
        
        <StaySelectionForm stays={staysResult.data} userId={userProfileResult.data.id} />
      </div>
    </div>
  );
}