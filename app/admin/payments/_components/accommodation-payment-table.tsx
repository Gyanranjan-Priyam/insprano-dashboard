"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  BuildingIcon,
  Phone,
  MoreVertical,
  Eye,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccommodationPaymentData, sendAccommodationConfirmationEmail } from "../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AccommodationPaymentTableProps {
  payments: AccommodationPaymentData[];
  error?: string;
}

export function AccommodationPaymentTable({ payments, error }: AccommodationPaymentTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const router = useRouter();

  const handleViewDetails = (payment: AccommodationPaymentData) => {
    router.push(`/admin/payments/accommodation-payments/${payment.id}`);
  };

  const handleSendConfirmationEmail = async (payment: AccommodationPaymentData) => {
    setLoadingActions(prev => new Set(prev).add(payment.id));
    
    try {
      const result = await sendAccommodationConfirmationEmail(payment.id);
      
      if (result.success) {
        toast.success("Confirmation email sent successfully!");
      } else {
        toast.error(result.error || "Failed to send confirmation email");
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      toast.error("Failed to send confirmation email. Please try again.");
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(payment.id);
        return newSet;
      });
    }
  };

  // Filter and search payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = searchQuery === "" || 
        payment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.mobileNumber.includes(searchQuery) ||
        payment.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.collegeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || payment.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  // Consistent date formatting helper
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Confirmed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <BuildingIcon className="w-4 h-4 md:w-5 md:h-5" />
          Accommodation Payments ({filteredPayments.length})
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Manage accommodation booking payments and reservations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, phone, email, college, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <BuildingIcon className="w-8 h-8 md:w-12 md:h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2">
              {payments.length === 0 ? "No Accommodation Payments" : "No Matching Payments"}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              {payments.length === 0 
                ? "No accommodation bookings with payment submissions found."
                : "Try adjusting your search criteria."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Sl No</TableHead>
                  <TableHead className="w-[200px]">Guest Details</TableHead>
                  <TableHead className="w-[180px]">Contact Information</TableHead>
                  <TableHead className="w-[120px]">Booking Status</TableHead>
                  <TableHead className="w-[120px]">Payment Status</TableHead>
                  <TableHead className="w-[100px]">Amount</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment, index) => (
                  <TableRow key={payment.id}>
                    {/* Serial Number */}
                    <TableCell>
                      <div className="font-medium text-sm">
                        {index + 1}
                      </div>
                    </TableCell>

                    {/* Guest Details */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-xl">{payment.name}</span>
                        </div>
                        <div className="text-xs mt-2 text-muted-foreground truncate">
                          {payment.collegeName}
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact Information */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <Phone className="w-3 h-3" />
                          <span className="font-semibold text-sm">{payment.mobileNumber}</span>
                        </div>
                        {payment.whatsappNumber && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>WhatsApp: {payment.whatsappNumber}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Booking Status */}
                    <TableCell>
                      <div className="space-y-2">
                        {getBookingStatusBadge(payment.status)}
                        <div className="text-xs text-muted-foreground">
                          Booked: {formatDate(payment.createdAt)}
                        </div>
                      </div>
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell>
                      <div className="space-y-2">
                        {getStatusBadge(payment.paymentStatus)}
                        {payment.verifiedAt && (
                          <div className="text-xs text-muted-foreground">
                            Verified: {formatDate(payment.verifiedAt)}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Amount */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold text-xl flex items-center gap-1">
                          {formatCurrency(payment.totalPrice)}
                        </div>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {/* Dropdown Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              disabled={loadingActions.has(payment.id)}
                            >
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewDetails(payment)}>
                              <Eye className="w-3 h-3 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSendConfirmationEmail(payment)}
                              disabled={loadingActions.has(payment.id)}
                            >
                              <Send className="w-3 h-3 mr-2" />
                              {loadingActions.has(payment.id) ? "Sending..." : "Send Confirmation Email"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}