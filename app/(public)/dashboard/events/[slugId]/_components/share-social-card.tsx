"use client";

import { useState } from "react";
import { MessageCircle, Mail, Twitter, Instagram, Facebook, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ShareSocialCardProps {
  title: string;
  description: string;
  url: string;
}

export function ShareSocialCard({ title, description, url }: ShareSocialCardProps) {
  const [copied, setCopied] = useState(false);

  // Social sharing functions
  const shareToWhatsApp = () => {
    const message = `🎉 Check out this event: ${title}\n\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToEmail = () => {
    const subject = `Event Invitation: ${title}`;
    const body = `Hi,\n\nI wanted to share this exciting event with you:\n\n${title}\n${description}\n\nEvent Details: ${url}\n\nHope to see you there!\n\nBest regards`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl);
  };

  const shareToTwitter = () => {
    const message = `🎉 Excited to share: ${title}\n\n${url}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareToInstagram = () => {
    // Instagram doesn't have direct URL sharing, so we copy to clipboard with instructions
    copyToClipboard();
    toast.info("Link copied! You can paste this in your Instagram story or bio.");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Event link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
      console.error('Failed to copy: ', err);
    }
  };

  const openInNewTab = () => {
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Social Media Buttons */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Share this event</Label>
          <div className="grid grid-cols-2 gap-3">
            {/* WhatsApp */}
            <Button
              variant="outline"
              size="sm"
              onClick={shareToWhatsApp}
              className="flex items-center gap-2 justify-start text-left h-10 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">WhatsApp</span>
            </Button>

            {/* Email */}
            <Button
              variant="outline"
              size="sm"
              onClick={shareToEmail}
              className="flex items-center gap-2 justify-start text-left h-10 cursor-pointer"
            >
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Email</span>
            </Button>

            {/* Twitter/X */}
            <Button
              variant="outline"
              size="sm"
              onClick={shareToTwitter}
              className="flex items-center gap-2 justify-start text-left h-10 cursor-pointer"
            >
              <Twitter className="h-4 w-4 text-sky-500" />
              <span className="text-sm">X (Twitter)</span>
            </Button>

            {/* Facebook */}
            <Button
              variant="outline"
              size="sm"
              onClick={shareToFacebook}
              className="flex items-center gap-2 justify-start text-left h-10 cursor-pointer"
            >
              <Facebook className="h-4 w-4 text-blue-700" />
              <span className="text-sm">Facebook</span>
            </Button>

            {/* Instagram */}
            <Button
              variant="outline"
              size="sm"
              onClick={shareToInstagram}
              className="flex items-center gap-2 justify-start text-left h-10 cursor-pointer"
            >
              <Instagram className="h-4 w-4 text-pink-600" />
              <span className="text-sm">Instagram</span>
            </Button>

            {/* Open in new tab */}
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              className="flex items-center gap-2 justify-start text-left h-10 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4 text-gray-600" />
              <span className="text-sm">Open Link</span>
            </Button>
          </div>
        </div>

        {/* Link Display and Copy */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Event link</Label>
          <div className="flex gap-2">
            <Input
              value={url}
              readOnly
              className="text-xs font-mono bg-muted"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Click the link to select all, or use the copy button
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="default"
            size="sm"
            onClick={shareToWhatsApp}
            className="flex-1 cursor-pointer"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Share via WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="flex-1 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}