import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { getSupportTicketByNumber } from "../actions";
import SupportTicketDetails from "../_components/support-ticket-details";
import { Separator } from "@/components/ui/separator";

interface SupportTicketPageProps {
  params: Promise<{
    ticketNumber: string;
  }>;
}

export async function generateMetadata({ params }: SupportTicketPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const ticketNumber = decodeURIComponent(resolvedParams.ticketNumber);
  const result = await getSupportTicketByNumber(ticketNumber);
  
  if (result.status === "error" || !result.data) {
    return {
      title: "Ticket Not Found | Admin Panel",
      description: "The requested support ticket could not be found.",
    };
  }

  return {
    title: `Ticket #${result.data.ticketNumber} | Admin Panel`,
    description: `Support ticket: ${result.data.subject}`,
  };
}

export default async function SupportTicketPage({ params }: SupportTicketPageProps) {
  const resolvedParams = await params;
  const ticketNumber = decodeURIComponent(resolvedParams.ticketNumber);
  const result = await getSupportTicketByNumber(ticketNumber);

  if (result.status === "error" || !result.data) {
    notFound();
  }

  const ticket = result.data;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-6xl">
      <PageHeader
        title={`Ticket #${ticket.ticketNumber}`}
        description={ticket.subject}
        showBackButton={false}
      />
      <Separator className="my-4" />
      <div className="mt-6 sm:mt-8">
        <SupportTicketDetails ticket={ticket} />
      </div>
    </div>
  );
}