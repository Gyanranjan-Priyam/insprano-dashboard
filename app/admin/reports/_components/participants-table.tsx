"use client";

import { useState, useMemo } from "react";
import { ParticipantReportData, getComprehensiveParticipantsData, type ComprehensiveParticipantData } from "../actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Download,
  Loader2,
} from "lucide-react";
import { exportToExcel, formatDateForExport, type ExportColumn } from "@/lib/export-utils";
import { toast } from "sonner";

interface ParticipantsTableProps {
  participants: ParticipantReportData[];
}

type SortField = keyof ParticipantReportData;
type SortDirection = "asc" | "desc" | null;

export function ParticipantsTable({ participants }: ParticipantsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("registeredAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isExporting, setIsExporting] = useState(false);

  // Get unique values for filters
  const statuses = useMemo(
    () => [...new Set(participants.map((p) => p.registrationStatus))],
    [participants]
  );
  const states = useMemo(
    () => [...new Set(participants.map((p) => p.state).filter(Boolean))],
    [participants]
  );
  const years = useMemo(
    () => [...new Set(participants.map((p) => new Date(p.registeredAt).getFullYear()))].sort((a, b) => b - a),
    [participants]
  );

  // Filter and sort data
  const filteredAndSortedParticipants = useMemo(() => {
    let filtered = participants.filter((participant) => {
      const matchesSearch =
        participant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.mobileNumber.includes(searchTerm) ||
        participant.collegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (participant.teamName && participant.teamName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || participant.registrationStatus === statusFilter;

      const matchesState =
        stateFilter === "all" || participant.state === stateFilter;

      const matchesYear =
        yearFilter === "all" || new Date(participant.registeredAt).getFullYear().toString() === yearFilter;

      return matchesSearch && matchesStatus && matchesState && matchesYear;
    });

    if (sortDirection && sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        // Handle null values
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return sortDirection === "asc" ? 1 : -1;
        if (bValue === null) return sortDirection === "asc" ? -1 : 1;

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [participants, searchTerm, statusFilter, stateFilter, yearFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc"
      );
      if (sortDirection === "desc") {
        setSortField("registeredAt");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === "asc") return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === "desc") return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch comprehensive participant data
      const result = await getComprehensiveParticipantsData();
      
      if (result.status === "error") {
        toast.error(result.message || "Failed to fetch comprehensive data");
        return;
      }

      const comprehensiveData = result.data || [];

      // Create flattened export data with all information
      const exportData = comprehensiveData.map(participant => {
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

      // Filter export data based on current filters
      const filteredExportData = exportData.filter(item => {
        const matchesSearch = 
          item.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.mobile_number.includes(searchTerm) ||
          item.college_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.team_name !== 'N/A' && item.team_name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === "all" || item.registration_status === statusFilter;
        const matchesState = stateFilter === "all" || item.state === stateFilter;
        const matchesYear = yearFilter === "all" || new Date(item.account_created).getFullYear().toString() === yearFilter;

        return matchesSearch && matchesStatus && matchesState && matchesYear;
      });

      // Generate dynamic columns based on max events/accommodations
      const maxEvents = Math.max(...comprehensiveData.map(p => p.eventsCount));
      const maxAccommodations = Math.max(...comprehensiveData.map(p => p.accommodationsCount));

      const exportColumns: ExportColumn<any>[] = [
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
        exportColumns.push(
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
        exportColumns.push(
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

      const filename = `comprehensive-participants-report-${new Date().toISOString().split('T')[0]}`;
      await exportToExcel(
        filteredExportData, 
        exportColumns, 
        filename, 
        'Participants Report'
      );

      toast.success("Comprehensive participants report exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export participants report");
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      REGISTERED: "bg-blue-100 text-blue-800",
      INACTIVE: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge
        variant="secondary"
        className={statusColors[status] || "bg-gray-100 text-gray-800"}
      >
        {status}
      </Badge>
    );
  };

  // Calculate totals
  const totalParticipants = filteredAndSortedParticipants.length;
  const totalEvents = filteredAndSortedParticipants.reduce((sum, p) => sum + p.eventsCount, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search participants, email, phone, college, or team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? "Exporting..." : "Export Comprehensive Excel"}
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-muted/50 p-3 rounded-lg text-center">
          <div className="font-semibold text-lg">{totalParticipants}</div>
          <div className="text-muted-foreground">Participants</div>
        </div>
        <div className="bg-muted/50 p-3 rounded-lg text-center">
          <div className="font-semibold text-lg">{totalEvents}</div>
          <div className="text-muted-foreground">Total Events</div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("fullName")}
                  className="h-auto p-0 font-semibold"
                >
                  Participant
                  {getSortIcon("fullName")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("collegeName")}
                  className="h-auto p-0 font-semibold"
                >
                  College
                  {getSortIcon("collegeName")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("state")}
                  className="h-auto p-0 font-semibold"
                >
                  Location
                  {getSortIcon("state")}
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("eventsCount")}
                  className="h-auto p-0 font-semibold"
                >
                  Events
                  {getSortIcon("eventsCount")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("teamName")}
                  className="h-auto p-0 font-semibold"
                >
                  Team Name
                  {getSortIcon("teamName")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("registrationStatus")}
                  className="h-auto p-0 font-semibold"
                >
                  Status
                  {getSortIcon("registrationStatus")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("registeredAt")}
                  className="h-auto p-0 font-semibold"
                >
                  Registered
                  {getSortIcon("registeredAt")}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedParticipants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{participant.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {participant.email}
                    </div>
                    {participant.mobileNumber && (
                      <div className="text-xs text-muted-foreground">
                        {participant.mobileNumber}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {participant.collegeName || "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{participant.state || "N/A"}</div>
                    {participant.district && (
                      <div className="text-xs text-muted-foreground">
                        {participant.district}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{participant.eventsCount}</Badge>
                </TableCell>
                <TableCell>
                  {participant.teamName ? (
                    <span className="text-sm font-medium">{participant.teamName}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">No Team</span>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(participant.registrationStatus)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(participant.registeredAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last activity: {new Date(participant.lastActivity).toLocaleDateString()}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredAndSortedParticipants.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No participants found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}