"use client";

import { useState, useMemo } from "react";
import { PaymentReportData } from "../actions";
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
} from "lucide-react";
import { exportToExcel, formatDateForExport, formatCurrencyForExport, type ExportColumn } from "@/lib/export-utils";

interface PaymentsTableProps {
  payments: PaymentReportData[];
}

type SortField = keyof PaymentReportData;
type SortDirection = "asc" | "desc" | null;

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("submittedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Get unique values for filters
  const categories = useMemo(
    () => [...new Set(payments.map((payment) => payment.eventCategory))],
    [payments]
  );
  const statuses = useMemo(
    () => [...new Set(payments.map((payment) => payment.paymentStatus))],
    [payments]
  );
  const types = useMemo(
    () => [...new Set(payments.map((payment) => payment.paymentType))],
    [payments]
  );
  const years = useMemo(
    () => [...new Set(payments.map((payment) => payment.submittedAt ? new Date(payment.submittedAt).getFullYear() : null).filter(Boolean))].sort((a, b) => (b as number) - (a as number)),
    [payments]
  );

  // Filter and sort data
  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments.filter((payment) => {
      const matchesSearch =
        payment.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.transactionId && 
         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || payment.paymentStatus === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || payment.eventCategory === categoryFilter;

      const matchesType =
        typeFilter === "all" || payment.paymentType === typeFilter;

      const matchesYear =
        yearFilter === "all" || (payment.submittedAt && new Date(payment.submittedAt).getFullYear().toString() === yearFilter);

      return matchesSearch && matchesStatus && matchesCategory && matchesType && matchesYear;
    });

    if (sortDirection && sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return sortDirection === "asc" ? 1 : -1;
        if (bValue === null) return sortDirection === "asc" ? -1 : 1;

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [payments, searchTerm, statusFilter, categoryFilter, typeFilter, yearFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc"
      );
      if (sortDirection === "desc") {
        setSortField("submittedAt");
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

  const handleExport = () => {
    const exportColumns: ExportColumn<PaymentReportData>[] = [
      { key: 'participantName', header: 'Participant Name' },
      { key: 'email', header: 'Email' },
      { key: 'eventTitle', header: 'Event' },
      { key: 'eventCategory', header: 'Category' },
      { key: 'paymentAmount', header: 'Amount', formatter: formatCurrencyForExport },
      { key: 'paymentType', header: 'Type' },
      { key: 'paymentStatus', header: 'Status', formatter: (status) => status.replace('_', ' ') },
      { key: 'transactionId', header: 'Transaction ID' },
      { key: 'submittedAt', header: 'Submitted Date', formatter: formatDateForExport },
      { key: 'verifiedAt', header: 'Verified Date', formatter: formatDateForExport },
    ];

    const filename = `payments-report-${new Date().toISOString().split('T')[0]}`;
    exportToExcel(filteredAndSortedPayments, exportColumns, filename, 'Payments Report');
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      VERIFIED: "bg-green-100 text-green-800",
      CONFIRMED: "bg-green-100 text-green-800",
      PAYMENT_SUBMITTED: "bg-yellow-100 text-yellow-800",
      PENDING_PAYMENT: "bg-orange-100 text-orange-800",
      PENDING: "bg-orange-100 text-orange-800",
      REGISTERED: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-red-100 text-red-800",
      FAILED: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        variant="secondary"
        className={statusColors[status] || "bg-gray-100 text-gray-800"}
      >
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      TEAM: "bg-blue-100 text-blue-800",
      INDIVIDUAL: "bg-purple-100 text-purple-800",
    };

    return (
      <Badge
        variant="secondary"
        className={typeColors[type] || "bg-gray-100 text-gray-800"}
      >
        {type}
      </Badge>
    );
  };

  // Calculate totals
  const totalAmount = filteredAndSortedPayments.reduce((sum, payment) => sum + payment.paymentAmount, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search participants, events, or transaction IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
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
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
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
                <SelectItem key={year} value={year?.toString() || ""}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          Showing {filteredAndSortedPayments.length} of {payments.length} payments
        </span>
        <span className="font-semibold">
          Total Amount: ₹{totalAmount.toLocaleString()}
        </span>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("participantName")}
                  className="h-auto p-0 font-semibold"
                >
                  Participant
                  {getSortIcon("participantName")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("eventTitle")}
                  className="h-auto p-0 font-semibold"
                >
                  Event
                  {getSortIcon("eventTitle")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("paymentAmount")}
                  className="h-auto p-0 font-semibold"
                >
                  Amount
                  {getSortIcon("paymentAmount")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("paymentType")}
                  className="h-auto p-0 font-semibold"
                >
                  Type
                  {getSortIcon("paymentType")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("paymentStatus")}
                  className="h-auto p-0 font-semibold"
                >
                  Status
                  {getSortIcon("paymentStatus")}
                </Button>
              </TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("submittedAt")}
                  className="h-auto p-0 font-semibold"
                >
                  Submitted
                  {getSortIcon("submittedAt")}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{payment.participantName}</div>
                    <div className="text-sm text-muted-foreground">
                      {payment.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{payment.eventTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {payment.eventCategory}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  ₹{payment.paymentAmount.toLocaleString()}
                </TableCell>
                <TableCell>{getTypeBadge(payment.paymentType)}</TableCell>
                <TableCell>{getStatusBadge(payment.paymentStatus)}</TableCell>
                <TableCell>
                  {payment.transactionId && (
                    <code className="text-sm bg-muted px-1 py-0.5 rounded">
                      {payment.transactionId}
                    </code>
                  )}
                </TableCell>
                <TableCell>
                  {payment.submittedAt && (
                    <div>
                      <div className="text-sm">
                        {new Date(payment.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(payment.submittedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredAndSortedPayments.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No payments found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}