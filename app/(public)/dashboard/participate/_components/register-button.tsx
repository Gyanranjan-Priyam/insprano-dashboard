"use client";

import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { registerForEventAction } from "../action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserPlusIcon, Loader2 } from "lucide-react";
import { tryCatch } from "@/hooks/try-catch";

interface RegisterButtonProps {
   eventId: string;
}

export function RegisterButton({ eventId }: RegisterButtonProps) {
   const [pending, startTransition] = useTransition();
   const router = useRouter();

   const handleRegister = () => {
      startTransition(async () => {
         const { data: result, error } = await tryCatch(registerForEventAction(eventId));
         
         if (error) {
            toast.error("Error registering for event: " + error.message);
            return;
         }

         if (result.status === "success") {
            toast.success(result.message);
            router.refresh(); // Refresh to show updated registration status
         } else {
            toast.error(result.message);
         }
      });
   };

   return (
      <Button 
         onClick={handleRegister} 
         disabled={pending}
         className="w-full h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
         size="lg"
      >
         {pending ? (
            <>
               <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
               Registering...
            </>
         ) : (
            <>
               <UserPlusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
               Register for Event
            </>
         )}
      </Button>
   );
}