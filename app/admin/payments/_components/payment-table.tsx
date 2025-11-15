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
  CreditCardIcon,
  ChevronDown,
  ChevronRight,
  Users,
  Crown
} from "lucide-react";
import { PaymentActions } from "./payment-actions";
import { PaymentSearch } from "./payment-search";
import { Button } from "@/components/ui/button";
import { EventPaymentData, TeamMemberData } from "../actions";

interface PaymentTableProps {
  payments: EventPaymentData[];
  error?: string;
}

export function PaymentTable({ payments, error }: PaymentTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{ status?: string; category?: string }>({});
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const toggleTeamExpansion = (paymentId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(paymentId)) {
      newExpanded.delete(paymentId);
    } else {
      newExpanded.add(paymentId);
    }
    setExpandedTeams(newExpanded);
  };

  // Consistent date formatting helper
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PAYMENT_SUBMITTED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PENDING_PAYMENT': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'REGISTERED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Extract unique categories and statuses for filters
  const categories = useMemo(() => {
    const cats = payments.map(p => p.event.category);
    return [...new Set(cats)].sort();
  }, [payments]);

  const statuses = useMemo(() => {
    const stats = payments.map(p => p.status);
    return [...new Set(stats)].sort();
  }, [payments]);

  // Filter payments based on search and filters
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(payment => {
        // Search in main payment data
        const mainMatch = payment.fullName.toLowerCase().includes(query) ||
          payment.user.email.toLowerCase().includes(query) ||
          payment.event.title.toLowerCase().includes(query) ||
          payment.collegeName.toLowerCase().includes(query) ||
          payment.mobileNumber.includes(query);

        // Search in team members if applicable
        const teamMemberMatch = payment.teamMembers?.some(member =>
          member.fullName.toLowerCase().includes(query) ||
          member.user.email.toLowerCase().includes(query) ||
          member.collegeName.toLowerCase().includes(query) ||
          member.mobileNumber.includes(query)
        );

        return mainMatch || teamMemberMatch;
      });
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(payment => payment.event.category === filters.category);
    }

    return filtered;
  }, [payments, searchQuery, filters]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5" />
            Events Payments
          </CardTitle>
          <CardDescription>
            Monitor and manage payment status for event registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">Error loading payments</div>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <CreditCardIcon className="w-4 h-4 md:w-5 md:h-5" />
          Events Payments
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Monitor and manage payment status for event registrations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <PaymentSearch
          onSearch={setSearchQuery}
          onFilter={setFilters}
          categories={categories}
          statuses={statuses}
        />

        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <CreditCardIcon className="w-8 h-8 md:w-12 md:h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2">
              {payments.length === 0 ? "No payments found" : "No matching payments"}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              {payments.length === 0 
                ? "Payments will appear here once participants submit their payment details"
                : "Try adjusting your search criteria or filters"
              }
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="block md:hidden space-y-4">
              {filteredPayments.map((payment: EventPaymentData, index: number) => (
                <div key={payment.id}>
                  {/* Main Payment Card */}
                  <Card className="p-4">
                    <div className="space-y-3">
                      {/* Header with participant name and status */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                          <div className="font-medium text-sm flex items-center gap-1">
                            {payment.fullName}
                            {payment.isTeamLeader && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(payment.status)} text-xs`}>
                          {payment.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Event info */}
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{payment.event.title}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {payment.event.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(payment.event.date)}
                          </span>
                        </div>
                      </div>

                      {/* Contact and college */}
                      <div className="space-y-1 text-xs">
                        <div className="text-muted-foreground truncate">{payment.user.email}</div>
                        <div className="text-muted-foreground truncate">{payment.collegeName}</div>
                        <div className="text-muted-foreground">{payment.mobileNumber}</div>
                        <div className="text-muted-foreground">{payment.state}, {payment.district}</div>
                      </div>

                      {/* Payment info */}
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm">
                          {payment.event.priceType === "free" 
                            ? "Free" 
                            : formatCurrency(payment.paymentAmount || payment.event.price)
                          }
                        </div>
                        {payment.transactionId && (
                          <div className="text-xs text-muted-foreground font-mono truncate max-w-[100px]">
                            {payment.transactionId}
                          </div>
                        )}
                      </div>

                      {/* Team members info */}
                      {payment.teamMembers && payment.teamMembers.length > 0 && (
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTeamExpansion(payment.id)}
                            className="h-6 p-1 text-xs"
                          >
                            <Users className="h-3 w-3 mr-1" />
                            {payment.teamMembers.length} team member{payment.teamMembers.length !== 1 ? 's' : ''}
                            {expandedTeams.has(payment.id) ? (
                              <ChevronDown className="h-3 w-3 ml-1" />
                            ) : (
                              <ChevronRight className="h-3 w-3 ml-1" />
                            )}
                          </Button>

                          {/* Team members list */}
                          {expandedTeams.has(payment.id) && (
                            <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                              {payment.teamMembers.map((member: TeamMemberData, memberIndex: number) => (
                                <div key={member.id} className="bg-black p-2 rounded text-xs space-y-1">
                                  <div className="font-medium flex items-center gap-1">
                                    <span>↳</span> {member.fullName}
                                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                                      Team Member
                                    </Badge>
                                    {member.paidByTeamLeader && (
                                      <Badge variant="outline" className="text-[10px] px-1 py-0 bg-green-50 text-green-700">
                                        Paid by Leader
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-muted-foreground truncate">{member.user.email}</div>
                                  <div className="text-muted-foreground truncate">{member.collegeName}</div>
                                  <div className="text-blue-600">
                                    Joined: {formatDate(member.joinedAt)}
                                  </div>
                                  {member.paidByTeamLeader && (
                                    <div className="text-green-600 text-[10px]">
                                      Payment covered by team leader
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2 border-t">
                        <PaymentActions payment={payment} />
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-20">S.No.</TableHead>
                    <TableHead>Participant Details</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Contact Information</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment: EventPaymentData, index: number) => (
                    <>
                      {/* Main Payment Row */}
                      <TableRow key={payment.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        
                        {/* Participant Details */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              {payment.fullName}
                              {payment.isTeamLeader && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                              {payment.teamMembers && payment.teamMembers.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTeamExpansion(payment.id)}
                                  className="h-6 w-6 p-0 ml-2"
                                >
                                  {expandedTeams.has(payment.id) ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.user.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {payment.collegeName}
                            </div>
                            {payment.teamMembers && payment.teamMembers.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-blue-600">
                                <Users className="h-3 w-3" />
                                <span>{payment.teamMembers.length} team member{payment.teamMembers.length !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Event Details */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{payment.event.title}</div>
                            <Badge variant="secondary" className="text-xs">
                              {payment.event.category}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(payment.event.date)}
                            </div>
                          </div>
                        </TableCell>

                        {/* Contact Information */}
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Mobile:</span>
                              <span>{payment.mobileNumber}</span>
                            </div>
                            {payment.whatsappNumber && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">WhatsApp:</span>
                                <span>{payment.whatsappNumber}</span>
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {payment.state}, {payment.district}
                            </div>
                          </div>
                        </TableCell>

                        {/* Payment Status */}
                        <TableCell>
                          <div className="space-y-2">
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status.replace('_', ' ')}
                            </Badge>
                            {payment.paymentSubmittedAt && (
                              <div className="text-xs text-muted-foreground">
                                Submitted: {formatDate(payment.paymentSubmittedAt)}
                              </div>
                            )}
                            {payment.paymentVerifiedAt && (
                              <div className="text-xs text-green-600">
                                Verified: {formatDate(payment.paymentVerifiedAt)}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Payment Amount */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold">
                              {payment.event.priceType === "free" 
                                ? "Free" 
                                : formatCurrency(payment.paymentAmount || payment.event.price)
                              }
                            </div>
                            {payment.transactionId && (
                              <div className="text-xs text-muted-foreground font-mono">
                                TXN: {payment.transactionId}
                              </div>
                            )}
                            {payment.teamMembers && payment.teamMembers.length > 0 && (
                              <div className="text-xs text-blue-600 font-medium">
                                Covers team ({payment.teamMembers.length} members + 1 leader)
                              </div>
                            )}
                            {payment.paidByTeamLeader && (
                              <div className="text-xs text-green-600 font-medium">
                                Paid by: {payment.paidByTeamLeader.fullName}
                              </div>
                            )}
                            {payment.paidByTeamLeader && (
                              <div className="text-xs text-green-600 font-medium">
                                Paid by: {payment.paidByTeamLeader.fullName}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <PaymentActions payment={payment} />
                        </TableCell>
                      </TableRow>

                      {/* Team Members Rows */}
                      {payment.teamMembers && 
                       payment.teamMembers.length > 0 && 
                       expandedTeams.has(payment.id) && 
                       payment.teamMembers.map((member: TeamMemberData, memberIndex: number) => (
                        <TableRow 
                          key={`${payment.id}-member-${member.id}`} 
                          className=" hover:bg-gray-50/10 border-l-4 border-l-blue-200"
                        >
                          <TableCell className="text-muted-foreground">
                            {index + 1}.{memberIndex + 1}
                          </TableCell>
                          
                          {/* Team Member Details */}
                          <TableCell>
                            <div className="space-y-1 pl-6">
                              <div className="font-medium text-sm flex items-center gap-2">
                                <span>↳</span> {member.fullName}
                                <Badge variant="outline" className="text-xs">
                                  Team Member
                                </Badge>
                                {member.paidByTeamLeader && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    Paid by Leader
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {member.user.email}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {member.collegeName}
                              </div>
                              <div className="text-xs text-blue-600">
                                Joined: {formatDate(member.joinedAt)}
                              </div>
                              {member.paidByTeamLeader && (
                                <div className="text-xs text-green-600">
                                  Payment covered by: {member.paidByTeamLeader.fullName}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Event Details (same as leader) */}
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              Same as team leader
                            </div>
                          </TableCell>

                          {/* Member Contact Information */}
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Mobile:</span>
                                <span>{member.mobileNumber}</span>
                              </div>
                              {member.whatsappNumber && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">WhatsApp:</span>
                                  <span>{member.whatsappNumber}</span>
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {member.state}, {member.district}
                              </div>
                            </div>
                          </TableCell>

                          {/* Status (inherited from team leader) */}
                          <TableCell>
                            <div className="space-y-1">
                              {member.paidByTeamLeader ? (
                                <div className="text-sm">
                                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                    Paid by Leader
                                  </Badge>
                                  <div className="text-xs text-green-600 mt-1">
                                    Covered by team leader
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">
                                  {member.status === "CONFIRMED" ? "Individually confirmed" : "Covered by team leader"}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Amount (covered by leader) */}
                          <TableCell>
                            {member.paidByTeamLeader ? (
                              <div className="space-y-1">
                                <div className="text-sm text-green-600 font-medium">
                                  Included in team payment
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  By: {member.paidByTeamLeader.fullName}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                {member.status === "CONFIRMED" ? "Individual payment" : "Included in team payment"}
                              </div>
                            )}
                          </TableCell>

                          {/* No actions for team members */}
                          <TableCell></TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}