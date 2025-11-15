"use client";

import { useNotification } from "./notification-context";
import { NotificationPanel } from "./notification-panel";

export function NotificationWrapper() {
  const { isNotificationOpen, setNotificationOpen } = useNotification();

  return (
    <NotificationPanel 
      isOpen={isNotificationOpen} 
      onClose={() => setNotificationOpen(false)} 
    />
  );
}