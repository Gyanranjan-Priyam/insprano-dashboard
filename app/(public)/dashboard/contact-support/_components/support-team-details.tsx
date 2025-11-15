import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export default function SupportTeamDetails() {
  return (
    <>
      <Card>
         <CardHeader>
            <span className="text-lg font-semibold">Support Team Details</span>
            <CardDescription>
               Our support team is dedicated to assisting you with any issues or questions you may have. We strive to provide timely and effective solutions to ensure your satisfaction.
            </CardDescription>
         </CardHeader>
         <CardContent>
            <div className="space-y-4">
               <div>
                  <h3 className="font-medium mb-2">Contact Information</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                     <li>• Email: insprano.gcekbhawanipatna@gmail.com</li>
                  </ul>
               </div>
               
               <div>
                  <h3 className="font-medium mb-2">Support Team</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                     <li>
                        <strong>Technical Support:</strong><br />
                        • XYZ - +91 97654 32109<br />
                        • Email: insprano.gcekbhawanipatna@gmail.com
                     </li>
                     <li>
                        <strong>Event Coordinator:</strong><br />
                        • Nukesh - +91 9556 92291<br />
                        • Yuvraj - +91 99052 39937<br />
                        • Email: insprano.gcekbhawanipatna@gmail.com
                     </li>
                     <li>
                        <strong>General Inquiries:</strong><br />
                        • Madhusmitha - +91 99389 62004<br />
                        • Email: insprano.gcekbhawanipatna@gmail.com
                     </li>
                  </ul>
               </div>
            </div>
         </CardContent>
      </Card>
    </>
  );
}
