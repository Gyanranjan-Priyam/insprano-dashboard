import { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import SupportStatistics from "./_components/support-statistics";
import SupportTicketsList from "./_components/support-tickets-list";

export const metadata: Metadata = {
  title: "Support Messages | Admin Panel",
  description: "Manage and respond to user support tickets and inquiries.",
};

export default function SupportMessagesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
      <PageHeader
        title="Support Messages"
        description="Manage and respond to user support tickets. View tickets, respond to inquiries, and track resolution status."
        showBackButton={false}
      />
      
      <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
        {/* Statistics Overview */}
        <SupportStatistics />
        
        {/* Support Tickets List */}
        <SupportTicketsList />
      </div>
    </div>
  );
}