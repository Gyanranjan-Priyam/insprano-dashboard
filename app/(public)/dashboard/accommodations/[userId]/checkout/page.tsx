import { CheckoutForm } from "../../_components/checkout-form";
import { getAdminUpiId, getDefaultUpiId } from "@/app/data/admin/get-admin-upi";

interface CheckoutPageProps {
  params: {
    userId: string;
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  // Fetch UPI data server-side
  let upiId = "";
  try {
    const result = await getAdminUpiId();
    if (result.success && result.upiId) {
      upiId = result.upiId;
    } else {
      // Fallback to default UPI
      upiId = getDefaultUpiId();
    }
  } catch (error) {
    console.error("Error loading UPI data:", error);
    upiId = getDefaultUpiId();
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Review & Confirm</h1>
          <p className="text-muted-foreground">
            Review your booking details and confirm your accommodation reservation
          </p>
        </div>
        
        <CheckoutForm upiId={upiId} userId={params.userId} />
      </div>
    </div>
  );
}