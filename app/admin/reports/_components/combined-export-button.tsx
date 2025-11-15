"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportMultipleSheetsToExcel, formatDateForExport, formatCurrencyForExport, type ExportColumn, type SheetData } from "@/lib/export-utils";
import { getParticipantsReportData, getTeamsReportData, getPaymentsReportData, getComprehensiveParticipantsData, type ParticipantReportData, type TeamReportData, type PaymentReportData, type ComprehensiveParticipantData } from "../actions";

export function CombinedExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleCombinedExport = async () => {
    setIsExporting(true);
    try {
      // Fetch all data simultaneously
      const [participantsResult, teamsResult, paymentsResult, comprehensiveResult] = await Promise.all([
        getParticipantsReportData(),
        getTeamsReportData(), 
        getPaymentsReportData(),
        getComprehensiveParticipantsData()
      ]);

      if (participantsResult.status === "error" || teamsResult.status === "error" || paymentsResult.status === "error") {
        toast.error("Failed to fetch some report data");
        return;
      }

      const participants = participantsResult.data || [];
      const teams = teamsResult.data || [];
      const payments = paymentsResult.data || [];
      const comprehensiveParticipants = comprehensiveResult.data || [];

      // Define columns for each report
      const participantColumns: ExportColumn<ParticipantReportData>[] = [
        { key: 'fullName', header: 'Full Name' },
        { key: 'email', header: 'Email' },
        { key: 'mobileNumber', header: 'Mobile Number' },
        { key: 'collegeName', header: 'College Name' },
        { key: 'state', header: 'State' },
        { key: 'district', header: 'District' },
        { key: 'eventsCount', header: 'Events Count' },
        { key: 'teamName', header: 'Team Name', formatter: (name) => name || 'No Team' },
        { key: 'registrationStatus', header: 'Registration Status' },
        { key: 'registeredAt', header: 'Registration Date', formatter: formatDateForExport },
        { key: 'lastActivity', header: 'Last Activity', formatter: formatDateForExport },
      ];

      const teamColumns: ExportColumn<TeamReportData>[] = [
        { key: 'teamName', header: 'Team Name' },
        { key: 'eventTitle', header: 'Event' },
        { key: 'eventCategory', header: 'Category' },
        { key: 'leaderName', header: 'Team Leader' },
        { key: 'leaderEmail', header: 'Leader Email' },
        { key: 'memberCount', header: 'Total Members' },
        { key: 'membersList', header: 'Team Members' },
        { key: 'totalAmount', header: 'Amount', formatter: formatCurrencyForExport },
        { key: 'paymentStatus', header: 'Payment Status', formatter: (status: string) => status.replace('_', ' ') },
        { key: 'createdAt', header: 'Created Date', formatter: formatDateForExport },
        { key: 'updatedAt', header: 'Updated Date', formatter: formatDateForExport },
      ];

      const paymentColumns: ExportColumn<PaymentReportData>[] = [
        { key: 'participantName', header: 'Participant Name' },
        { key: 'email', header: 'Email' },
        { key: 'eventTitle', header: 'Event' },
        { key: 'eventCategory', header: 'Category' },
        { key: 'paymentAmount', header: 'Amount', formatter: formatCurrencyForExport },
        { key: 'paymentType', header: 'Type' },
        { key: 'paymentStatus', header: 'Status', formatter: (status: string) => status.replace('_', ' ') },
        { key: 'transactionId', header: 'Transaction ID' },
        { key: 'submittedAt', header: 'Submitted Date', formatter: formatDateForExport },
        { key: 'verifiedAt', header: 'Verified Date', formatter: formatDateForExport },
      ];

      // Create comprehensive participant export data
      const comprehensiveExportData = comprehensiveParticipants.map(participant => {
        // Flatten events data
        const eventColumns: any = {};
        participant.events.forEach((event, index) => {
          eventColumns[`event_${index + 1}_title`] = event.eventTitle;
          eventColumns[`event_${index + 1}_category`] = event.eventCategory;
          eventColumns[`event_${index + 1}_price`] = `₹${event.eventPrice}`;
          eventColumns[`event_${index + 1}_status`] = event.registrationStatus;
          eventColumns[`event_${index + 1}_payment_amount`] = `₹${event.paymentAmount}`;
          eventColumns[`event_${index + 1}_transaction_id`] = event.transactionId || 'N/A';
          eventColumns[`event_${index + 1}_registered_date`] = formatDateForExport(event.registeredAt);
          eventColumns[`event_${index + 1}_payment_submitted`] = event.paymentSubmittedAt ? formatDateForExport(event.paymentSubmittedAt) : 'N/A';
          eventColumns[`event_${index + 1}_payment_verified`] = event.paymentVerifiedAt ? formatDateForExport(event.paymentVerifiedAt) : 'N/A';
        });

        // Flatten accommodation data
        const accommodationColumns: any = {};
        participant.accommodations.forEach((acc, index) => {
          accommodationColumns[`accommodation_${index + 1}_room_type`] = acc.roomType;
          accommodationColumns[`accommodation_${index + 1}_nights`] = acc.numberOfNights;
          accommodationColumns[`accommodation_${index + 1}_checkin`] = formatDateForExport(acc.checkInDate);
          accommodationColumns[`accommodation_${index + 1}_checkout`] = formatDateForExport(acc.checkOutDate);
          accommodationColumns[`accommodation_${index + 1}_price`] = `₹${acc.totalPrice}`;
          accommodationColumns[`accommodation_${index + 1}_payment_status`] = acc.paymentStatus;
          accommodationColumns[`accommodation_${index + 1}_transaction_id`] = acc.transactionId || 'N/A';
          accommodationColumns[`accommodation_${index + 1}_booked_date`] = formatDateForExport(acc.createdAt);
          accommodationColumns[`accommodation_${index + 1}_verified_date`] = acc.verifiedAt ? formatDateForExport(acc.verifiedAt) : 'N/A';
        });

        return {
          // Basic Information
          full_name: participant.fullName,
          email: participant.email,
          mobile_number: participant.mobileNumber,
          whatsapp_number: participant.whatsappNumber || 'N/A',
          aadhaar_number: participant.aadhaarNumber || 'N/A',
          
          // Location
          state: participant.state,
          district: participant.district,
          
          // Education
          college_name: participant.collegeName,
          college_address: participant.collegeAddress,
          
          // Account Information
          account_created: formatDateForExport(participant.userCreatedAt),
          
          // Team Information
          team_role: participant.teamRole,
          team_name: participant.teamName || 'N/A',
          team_members_count: participant.teamMembersCount,
          team_members_list: participant.teamMembers.join(', ') || 'N/A',
          
          // Payment Summary
          total_events: participant.eventsCount,
          total_accommodations: participant.accommodationsCount,
          total_event_payments: `₹${participant.totalEventPayments}`,
          total_payment_amount: `₹${participant.totalPaymentAmount}`,
          overall_payment_status: participant.paymentStatus,
          registration_status: participant.registrationStatus,
          last_activity: formatDateForExport(participant.lastActivity),
          
          // Dynamic event columns
          ...eventColumns,
          
          // Dynamic accommodation columns  
          ...accommodationColumns,
        };
      });

      // Generate dynamic comprehensive columns
      const maxEvents = Math.max(...comprehensiveParticipants.map(p => p.eventsCount));
      const maxAccommodations = Math.max(...comprehensiveParticipants.map(p => p.accommodationsCount));

      const comprehensiveColumns: ExportColumn<any>[] = [
        // Basic Information
        { key: 'full_name', header: 'Full Name' },
        { key: 'email', header: 'Email Address' },
        { key: 'mobile_number', header: 'Mobile Number' },
        { key: 'whatsapp_number', header: 'WhatsApp Number' },
        { key: 'aadhaar_number', header: 'Aadhaar Number' },
        
        // Location
        { key: 'state', header: 'State' },
        { key: 'district', header: 'District' },
        
        // Education
        { key: 'college_name', header: 'College Name' },
        { key: 'college_address', header: 'College Address' },
        
        // Account Information
        { key: 'account_created', header: 'Account Created' },
        
        // Team Information
        { key: 'team_role', header: 'Team Role' },
        { key: 'team_name', header: 'Team Name' },
        { key: 'team_members_count', header: 'Team Size' },
        { key: 'team_members_list', header: 'Team Members' },
        
        // Summary
        { key: 'total_events', header: 'Total Events' },
        { key: 'total_accommodations', header: 'Total Accommodations' },
        { key: 'total_event_payments', header: 'Total Event Payments' },
        { key: 'total_payment_amount', header: 'Total Payment Amount' },
        { key: 'overall_payment_status', header: 'Overall Payment Status' },
        { key: 'registration_status', header: 'Registration Status' },
        { key: 'last_activity', header: 'Last Activity' },
      ];

      // Add dynamic event columns
      for (let i = 1; i <= maxEvents; i++) {
        comprehensiveColumns.push(
          { key: `event_${i}_title`, header: `Event ${i} - Title` },
          { key: `event_${i}_category`, header: `Event ${i} - Category` },
          { key: `event_${i}_price`, header: `Event ${i} - Price` },
          { key: `event_${i}_status`, header: `Event ${i} - Status` },
          { key: `event_${i}_payment_amount`, header: `Event ${i} - Payment Amount` },
          { key: `event_${i}_transaction_id`, header: `Event ${i} - Transaction ID` },
          { key: `event_${i}_registered_date`, header: `Event ${i} - Registered Date` },
          { key: `event_${i}_payment_submitted`, header: `Event ${i} - Payment Submitted` },
          { key: `event_${i}_payment_verified`, header: `Event ${i} - Payment Verified` }
        );
      }

      // Add dynamic accommodation columns
      for (let i = 1; i <= maxAccommodations; i++) {
        comprehensiveColumns.push(
          { key: `accommodation_${i}_room_type`, header: `Accommodation ${i} - Room Type` },
          { key: `accommodation_${i}_nights`, header: `Accommodation ${i} - Nights` },
          { key: `accommodation_${i}_checkin`, header: `Accommodation ${i} - Check-in` },
          { key: `accommodation_${i}_checkout`, header: `Accommodation ${i} - Check-out` },
          { key: `accommodation_${i}_price`, header: `Accommodation ${i} - Price` },
          { key: `accommodation_${i}_payment_status`, header: `Accommodation ${i} - Payment Status` },
          { key: `accommodation_${i}_transaction_id`, header: `Accommodation ${i} - Transaction ID` },
          { key: `accommodation_${i}_booked_date`, header: `Accommodation ${i} - Booked Date` },
          { key: `accommodation_${i}_verified_date`, header: `Accommodation ${i} - Verified Date` }
        );
      }

      // Create sheets data
      const sheets: SheetData<any>[] = [
        {
          data: participants,
          columns: participantColumns,
          sheetName: 'Participants Summary'
        },
        {
          data: teams,
          columns: teamColumns,
          sheetName: 'Teams Report'
        },
        {
          data: payments,
          columns: paymentColumns,
          sheetName: 'Payments Report'
        },
        {
          data: comprehensiveExportData,
          columns: comprehensiveColumns,
          sheetName: 'Comprehensive Details'
        }
      ];

      const filename = `insprano-2025-complete-report-${new Date().toISOString().split('T')[0]}`;
      exportMultipleSheetsToExcel(sheets, filename);

      toast.success("Complete INSPRANO 2025 report exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export combined report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleCombinedExport}
      variant="default"
      size="sm"
      className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {isExporting ? "Generating..." : "Export Complete Report"}
    </Button>
  );
}