"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Users,
  Crown,
  ArrowDown,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { EventPaymentData, TeamMemberData } from "../actions";

interface TeamPaymentTableProps {
  payments: EventPaymentData[];
  error?: string;
}

export function TeamPaymentTable({ payments, error }: TeamPaymentTableProps) {
  // State to track which team cards are expanded
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  // Toggle expansion for a specific team
  const toggleTeamExpansion = (teamId: string) => {
    const newExpandedTeams = new Set(expandedTeams);
    if (newExpandedTeams.has(teamId)) {
      newExpandedTeams.delete(teamId);
    } else {
      newExpandedTeams.add(teamId);
    }
    setExpandedTeams(newExpandedTeams);
  };

  // Filter to only show team-related payments
  const teamPayments = useMemo(() => {
    return payments.filter(payment => 
      payment.isTeamLeader && payment.teamMembers && payment.teamMembers.length > 0
    );
  }, [payments]);

  // Get payments made by team leaders for their members
  const memberPayments = useMemo(() => {
    return payments.filter(payment => payment.paidByTeamLeader);
  }, [payments]);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error loading team payments</div>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (teamPayments.length === 0) {
    return (
      <div className="text-center py-8 md:py-12">
        <Users className="w-8 h-8 md:w-12 md:h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-base md:text-lg font-semibold mb-2">No Team Payments Found</h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          Team payments will appear here when team leaders pay for their members
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Leaders and Their Payments */}
      <div className="space-y-4">
        {teamPayments.map((teamLeader: EventPaymentData) => {
          const isExpanded = expandedTeams.has(teamLeader.id);
          
          return (
            <Card key={teamLeader.id} className="border-2 border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <div className="flex-1">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 text-left justify-start hover:bg-transparent"
                        onClick={() => toggleTeamExpansion(teamLeader.id)}
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <div>
                            <CardTitle className="text-lg hover:text-blue-600 transition-colors cursor-pointer">
                              {teamLeader.fullName}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              Team Leader - {teamLeader.event.title}
                            </CardDescription>
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {teamLeader.event.priceType === "free" 
                        ? "Free" 
                        : formatCurrency(teamLeader.paymentAmount || teamLeader.event.price)
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Covers {(teamLeader.teamMembers?.length || 0) + 1} members
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent>
                  {/* Team Leader Details */}
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Email:</span> {teamLeader.email}
                      </div>
                      <div>
                        <span className="font-medium">Mobile:</span> {teamLeader.mobileNumber}
                      </div>
                      <div>
                        <span className="font-medium">College:</span> {teamLeader.collegeName}
                      </div>
                    </div>
                    {teamLeader.transactionId && (
                      <div className="mt-2 text-xs">
                        <span className="font-medium">Transaction ID:</span> 
                        <span className="font-mono ml-1">{teamLeader.transactionId}</span>
                      </div>
                    )}
                    {teamLeader.paymentSubmittedAt && (
                      <div className="mt-1 text-xs text-green-600">
                        <span className="font-medium">Payment Date:</span> {formatDate(teamLeader.paymentSubmittedAt)}
                      </div>
                    )}
                  </div>

                  {/* Arrow indicating payment covers team members */}
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <ArrowDown className="h-4 w-4" />
                      <span className="text-sm">Payment covers team members below</span>
                      <ArrowDown className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Team Members Paid by This Leader */}
                  {teamLeader.teamMembers && teamLeader.teamMembers.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted">
                            <TableHead className="font-medium">Team Member</TableHead>
                            <TableHead className="font-medium">Contact</TableHead>
                            <TableHead className="font-medium">College</TableHead>
                            <TableHead className="font-medium">Joined Date</TableHead>
                            <TableHead className="font-medium">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamLeader.teamMembers.map((member: TeamMemberData) => (
                            <TableRow key={member.id} className="bg-gray">
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium flex items-center gap-2">
                                    {member.fullName}
                                    <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                                      Paid by Leader
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">{member.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm space-y-1">
                                  <div>{member.mobileNumber}</div>
                                  {member.whatsappNumber && (
                                    <div className="text-xs text-muted-foreground">
                                      WA: {member.whatsappNumber}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{member.collegeName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {member.state}, {member.district}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{formatDate(member.joinedAt)}</div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  Confirmed (Team Payment)
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-purple-600" />
            Team Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-2xl text-blue-600">
                {teamPayments.length}
              </div>
              <div className="text-sm text-muted-foreground">Team Leaders</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="font-semibold text-2xl text-green-600">
                {teamPayments.reduce((sum, team) => sum + (team.teamMembers?.length || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Members Paid For</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="font-semibold text-2xl text-purple-600">
                {teamPayments.reduce((sum, team) => sum + (team.teamMembers?.length || 0) + 1, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Participants</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="font-semibold text-2xl text-yellow-600">
                {formatCurrency(
                  teamPayments.reduce((sum, team) => {
                    const amount = team.event.priceType === "free" ? 0 : (team.paymentAmount || team.event.price);
                    return sum + amount;
                  }, 0)
                )}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}