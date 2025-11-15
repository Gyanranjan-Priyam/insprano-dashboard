import { getAllStays, getAllFoods, getAccommodationStatistics } from "./actions";
import AccommodationPageClient from "./_components/accommodation-client";

export default async function AdminAccommodationsPage() {
  const [staysResult, foodsResult, statisticsResult] = await Promise.all([
    getAllStays(),
    getAllFoods(),
    getAccommodationStatistics()
  ]);

  if (staysResult.status === "error") {
    return <AccommodationPageClient 
      stays={[]} 
      foods={[]} 
      statistics={{
        totalStays: 0,
        totalFoodItems: 0,
        avgStayPrice: 0,
      }}
      error={staysResult.message} 
    />;
  }

  if (foodsResult.status === "error") {
    return <AccommodationPageClient 
      stays={staysResult.data || []} 
      foods={[]} 
      statistics={{
        totalStays: 0,
        totalFoodItems: 0,
        avgStayPrice: 0,
      }}
      error={foodsResult.message} 
    />;
  }

  if (statisticsResult.status === "error") {
    return <AccommodationPageClient 
      stays={staysResult.data || []} 
      foods={foodsResult.data || []} 
      statistics={{
        totalStays: 0,
        totalFoodItems: 0,
        avgStayPrice: 0,
      }}
      error={statisticsResult.message} 
    />;
  }

  return (
    <AccommodationPageClient 
      stays={staysResult.data || []} 
      foods={foodsResult.data || []}
      statistics={statisticsResult.data || {
        totalStays: 0,
        totalFoodItems: 0,
        avgStayPrice: 0,
      }}
    />
  );
}
