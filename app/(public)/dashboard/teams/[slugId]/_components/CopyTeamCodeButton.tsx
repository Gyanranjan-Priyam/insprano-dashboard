"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface CopyTeamCodeButtonProps {
  teamCode: string;
}

export function CopyTeamCodeButton({ teamCode }: CopyTeamCodeButtonProps) {
  const handleCopyTeamCode = async () => {
    try {
      await navigator.clipboard.writeText(teamCode);
      toast.success("Team code copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy team code");
      console.error("Failed to copy team code:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopyTeamCode}
      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
    >
      <Copy className="h-3 w-3" />
    </Button>
  );
}