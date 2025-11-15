import { getPaymentById } from "../../actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarIcon, 
  MapPinIcon, 
  TagIcon, 
  UserIcon, 
  PhoneIcon, 
  MailIcon, 
  IdCardIcon, 
  MapIcon, 
  SchoolIcon, 
  FileImageIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  Crown,
  Users,
  ArrowDown
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { PaymentStatusUpdateForm } from "../../_components/payment-status-update-form";
import { PaymentImage } from "../../_components/payment-image";

interface TeamPaymentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamPaymentDetailPage({ params }: TeamPaymentDetailPageProps) {
  const { id } = await params;
  const result = await getPaymentById(id);

  if (result.status === "error") {
    return (
      <div className="container mx-auto py-4 md:py-6 px-4">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Team Payment Details</h1>
          <div className="text-red-600 text-sm md:text-base">{result.message || "An error occurred"}</div>
          <Link href="/admin/payments" className="inline-block mt-4">
            <Button variant="outline">Back to Payments</Button>
          </Link>
        </div>
      </div>
    );
  }

  const payment = result.data;
  
  if (!payment) {
    return (
      <div className="container mx-auto py-4 md:py-6 px-4">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Team Payment Details</h1>
          <div className="text-red-600 text-sm md:text-base">Payment record not found</div>
          <Link href="/admin/payments" className="inline-block mt-4">
            <Button variant="outline">Back to Payments</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PAYMENT_SUBMITTED': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING_PAYMENT': return 'bg-orange-100 text-orange-800';
      case 'REGISTERED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getS3Url = (key: string) => {
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES || 'registration';
    return `https://${bucketName}.t3.storage.dev/${key}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Team Payment Details</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Complete team payment information for {payment.fullName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
        {/* Main Details */}
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                Participant Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-4">
                <Avatar className="w-16 h-16 md:w-20 md:h-20 mx-auto sm:mx-0">
                  <AvatarImage src={payment.user.image || ""} />
                  <AvatarFallback className="text-lg md:text-xl">
                    {payment.user.name?.charAt(0) || payment.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg md:text-xl font-semibold">{payment.fullName}</h3>
                  <p className="text-sm md:text-base text-muted-foreground break-all">{payment.user.email}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    User since {format(new Date(payment.user.createdAt || new Date()), "MMMM yyyy")}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <MailIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm md:text-base break-all">{payment.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm md:text-base">{payment.mobileNumber}</span>
                </div>
                {payment.whatsappNumber && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm md:text-base">WhatsApp: {payment.whatsappNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 min-w-0">
                  <IdCardIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm md:text-base truncate">Aadhaar: {payment.aadhaarNumber}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <MapIcon className="w-4 h-4 md:w-5 md:h-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="text-sm md:text-base font-medium">State</label>
                  <p className="text-sm md:text-base text-muted-foreground">{payment.state}</p>
                </div>
                <div>
                  <label className="text-sm md:text-base font-medium">District</label>
                  <p className="text-sm md:text-base text-muted-foreground">{payment.district}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* College Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <SchoolIcon className="w-4 h-4 md:w-5 md:h-5" />
                College Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm md:text-base font-medium">College Name</label>
                  <p className="text-sm md:text-base text-muted-foreground wrap-break-word">{payment.collegeName}</p>
                </div>
                <div>
                  <label className="text-sm md:text-base font-medium">College Address</label>
                  <p className="text-sm md:text-base text-muted-foreground wrap-break-word">{payment.collegeAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
                Event Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="font-semibold text-base md:text-lg">{payment.event.title}</h3>
                  <Badge variant="secondary" className="text-xs md:text-sm w-fit">
                    <TagIcon className="w-3 h-3 mr-1" />
                    {payment.event.category}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm md:text-base">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{format(new Date(payment.event.date), "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPinIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="wrap-break-word">{payment.event.venue}</span>
                  </div>
                </div>
                <div className="text-lg md:text-xl font-semibold">
                  Registration Fee: {formatCurrency(payment.event.price)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Payment Information */}
          {(payment.isTeamLeader || payment.paidByTeamLeader) && (
            <Card className="border-2 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  Team Payment Details
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  {payment.isTeamLeader 
                    ? "This participant is a team leader who paid for team members"
                    : "This participant's payment was covered by their team leader"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payment.isTeamLeader && payment.teamMembers && payment.teamMembers.length > 0 && (
                  <div className="space-y-4">
                    {/* Team Leader Summary */}
                    <div className="border border-blue-200 p-3 md:p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Crown className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                        <span className="font-semibold text-sm md:text-base">Team Leader Payment Summary</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 text-sm md:text-base">
                        <div className="space-y-1 flex items-center justify-between">
                          <span className="font-medium">Payment Amount:</span> 
                          <div className="text-green-600 font-semibold">{formatCurrency(payment.paymentAmount || payment.event.price)}</div>
                        </div>
                        <div className="space-y-1 flex items-center justify-between">
                          <span className="font-medium">Members Covered:</span> 
                          <div className="text-blue-600 font-semibold">{payment.teamMembers.length}</div>
                        </div>
                        <div className="space-y-1 flex items-center justify-between">
                          <span className="font-medium">Total Participants:</span> 
                          <div className="text-purple-600 font-semibold">{payment.teamMembers.length} + 1</div>
                        </div>
                      </div>
                    </div>

                    {/* Team Members Table */}
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
                          {payment.teamMembers.map((member: any) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback>
                                      {member.fullName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="space-y-1 min-w-0">
                                    <div className="font-medium flex items-center gap-2 text-sm">
                                      <span className="truncate">{member.fullName}</span>
                                      <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300 shrink-0">
                                        Paid by Leader
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">{member.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm space-y-1">
                                  <div className="flex items-center gap-1">
                                    <PhoneIcon className="w-3 h-3" />
                                    <span>{member.mobileNumber}</span>
                                  </div>
                                  {member.whatsappNumber && (
                                    <div className="text-xs text-muted-foreground">
                                      WA: {member.whatsappNumber}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div className="wrap-break-word">{member.collegeName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {member.state}, {member.district}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{format(new Date(member.joinedAt), "PPP")}</div>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                  Confirmed (Team Payment)
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Status and Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                <CreditCardIcon className="w-4 h-4 md:w-5 md:h-5" />
                Payment Status & Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm md:text-base font-medium">Current Status</label>
                <Badge className={`${getStatusColor(payment.status)} block w-fit mt-1 text-xs md:text-sm`}>
                  {payment.status.replace('_', ' ')}
                </Badge>
              </div>

              <Separator />

              <PaymentStatusUpdateForm 
                participationId={payment.id} 
                currentStatus={payment.status}
              />
            </CardContent>
          </Card>

          {/* Registration Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg lg:text-xl">Payment Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm md:text-base">
                <div>
                  <label className="font-medium">Registered At:</label>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {format(new Date(payment.registeredAt), "PPP 'at' p")}
                  </p>
                </div>
                {payment.paymentSubmittedAt && (
                  <div>
                    <label className="font-medium">Payment Submitted:</label>
                    <p className="text-muted-foreground text-xs md:text-sm">
                      {format(new Date(payment.paymentSubmittedAt), "PPP 'at' p")}
                    </p>
                  </div>
                )}
                {payment.paymentVerifiedAt && (
                  <div>
                    <label className="font-medium">Payment Verified:</label>
                    <p className="text-green-600 text-xs md:text-sm">
                      {format(new Date(payment.paymentVerifiedAt), "PPP 'at' p")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg lg:text-xl">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm md:text-base font-medium">Amount Paid</label>
                <p className="text-lg md:text-xl font-semibold text-green-600">
                  {formatCurrency(payment.paymentAmount || payment.event.price)}
                </p>
              </div>
              {payment.transactionId && (
                <div>
                  <label className="text-sm md:text-base font-medium">Transaction ID</label>
                  <p className="text-xs md:text-sm text-muted-foreground font-mono break-all">
                    {payment.transactionId}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm md:text-base font-medium">Registration Fee</label>
                <p className="text-sm md:text-base text-muted-foreground">
                  {formatCurrency(payment.event.price)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Screenshot */}
          {payment.paymentScreenshotKey && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
                  <FileImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                  Payment Screenshot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentImage
                  src={getS3Url(payment.paymentScreenshotKey)}
                  alt="Payment Screenshot"
                  fileName={payment.paymentScreenshotKey}
                  className="w-full max-w-md rounded-lg border"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}