import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import ContactSupportForm from "./_components/contact-support-form";
import SupportTicketsList from "./_components/support-tickets-list";
import SupportTeamDetails from "./_components/support-team-details";

export const metadata: Metadata = {
  title: "Contact Support | Support Center",
  description: "Get help with your account, events, and any technical issues. Submit a support request and track your tickets.",
};

export default function ContactSupportPage() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col">
        <span className="text-4xl font-semibold">
          Contact Support
        </span>
        <span className="text-sm font-semibold text-muted-foreground mt-2">
          Need help? Submit a support request and we'll get back to you as soon as possible.
        </span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Support Form */}
        <div className="space-y-6">
          <ContactSupportForm />
        </div>

        {/* Support Tickets List */}
        <div className="space-y-6">
          <SupportTicketsList />
          <SupportTeamDetails />
        </div>
      </div>

      <Separator className="my-8" />

      {/* Support Information */}
      <div className="bg-muted/50 rounded-lg p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4">Support Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-medium mb-2">Response Times</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Urgent issues: Within 2 hours</li>
              <li>• High priority: Within 4 hours</li>
              <li>• Medium priority: Within 1 business day</li>
              <li>• Low priority: Within 2 business days</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">What to Include</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Clear description of the issue</li>
              <li>• Steps to reproduce the problem</li>
              <li>• Screenshots or error messages</li>
              <li>• Your device and browser information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
