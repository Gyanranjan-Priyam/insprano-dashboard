import { MealSelectionForm } from "../../_components/meal-selection-form";
import { getUserProfile } from "../actions";
import { redirect } from "next/navigation";

interface MealSelectionPageProps {
  params: { userId: string };
}

export default async function MealSelectionPage({ params }: MealSelectionPageProps) {
  // Get user profile to verify the userId
  const userProfileResult = await getUserProfile();
  if (userProfileResult.status !== "success" || !userProfileResult.data) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Select Your Meals</h1>
          <p className="text-muted-foreground">
            Choose your preferred meals for each day of your stay
          </p>
        </div>
        
        <MealSelectionForm userId={userProfileResult.data.id} />
      </div>
    </div>
  );
}