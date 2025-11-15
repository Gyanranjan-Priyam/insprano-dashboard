"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  UserPlus, 
  KeyRound, 
  Search, 
  ArrowRight, 
  Loader2,
  Smartphone
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getTeamInfoByCode } from "../actions";

interface QuickJoinFABProps {
  className?: string;
}

export function QuickJoinFAB({ className = "" }: QuickJoinFABProps) {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [mobileTeamCode, setMobileTeamCode] = useState("");
  const [desktopTeamCode, setDesktopTeamCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleQuickJoin = async (e: React.FormEvent, isMobile = false) => {
    e.preventDefault();
    const code = isMobile ? mobileTeamCode : desktopTeamCode;
    
    if (!code.trim()) {
      toast.error("Please enter a team code");
      return;
    }

    setIsSearching(true);
    try {
      const result = await getTeamInfoByCode(code.trim().toUpperCase());
      
      if (result.status === "success") {
        toast.success("Team found! Redirecting to join...");
        router.push(`/dashboard/teams/join/${code.trim().toUpperCase()}`);
        
        if (isMobile) {
          setIsMobileOpen(false);
          setMobileTeamCode("");
        } else {
          setIsDesktopOpen(false);
          setDesktopTeamCode("");
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to find team");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      {/* Mobile FAB - Only visible on mobile */}
      <div className={`fixed bottom-6 right-6 z-50 block sm:hidden ${className}`}>
        <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Zap className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] mx-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="h-5 w-5 text-primary" />
                Quick Team Join
              </DialogTitle>
              <DialogDescription>
                Enter a team code to join instantly, or browse available teams
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-2">
              <form onSubmit={(e) => handleQuickJoin(e, true)} className="space-y-3">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter team code (e.g. ABC123)"
                    value={mobileTeamCode}
                    onChange={(e) => setMobileTeamCode(e.target.value.toUpperCase())}
                    className="pl-10 h-11 text-base"
                    autoFocus
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSearching || !mobileTeamCode.trim()}
                  className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Quick Join
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push("/dashboard/teams?tab=discover");
                    setIsMobileOpen(false);
                  }}
                  className="h-11 justify-start"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Browse Available Teams
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push("/dashboard/teams?tab=join-code");
                    setIsMobileOpen(false);
                  }}
                  className="h-11 justify-start"
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  Join with Team Code
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    💡 Tip
                  </Badge>
                  <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    Ask your team leader for their team code for instant joining!
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Quick Access - Only visible on desktop */}
      <div className={`fixed bottom-6 right-6 z-50 hidden sm:block ${className}`}>
        <Dialog open={isDesktopOpen} onOpenChange={setIsDesktopOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className="h-10 px-3 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Quick Join</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Team Join
              </DialogTitle>
              <DialogDescription>
                Enter a team code for instant access to join a team
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-2">
              <form onSubmit={(e) => handleQuickJoin(e, false)} className="space-y-3">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter team code (e.g. ABC123)"
                    value={desktopTeamCode}
                    onChange={(e) => setDesktopTeamCode(e.target.value.toUpperCase())}
                    className="pl-10"
                    autoFocus
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSearching || !desktopTeamCode.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Quick Join
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    router.push("/dashboard/teams");
                    setIsDesktopOpen(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Browse all teams instead →
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}