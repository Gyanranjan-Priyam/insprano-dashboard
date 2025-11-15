"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface NotificationContextType {
  isNotificationOpen: boolean;
  setNotificationOpen: (open: boolean) => void;
  toggleNotification: () => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  readAnnouncements: Set<string>;
  markAnnouncementAsRead: (announcementId: string) => void;
  allAnnouncements: any[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readAnnouncements, setReadAnnouncements] = useState<Set<string>>(new Set());
  const [allAnnouncements, setAllAnnouncements] = useState<any[]>([]);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    
    // Check for new announcements every 5 minutes
    const interval = setInterval(fetchUnreadCount, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Recalculate unread count when read announcements change
  useEffect(() => {
    if (allAnnouncements.length > 0) {
      const recentUnreadCount = allAnnouncements.filter((announcement: any) => {
        const createdDate = new Date(announcement.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate > weekAgo && !readAnnouncements.has(announcement.id);
      }).length;
      
      setUnreadCount(recentUnreadCount);
    }
  }, [readAnnouncements, allAnnouncements]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/announcements/public?limit=20');
      const data = await response.json();
      
      if (data.success) {
        const announcements = data.data.announcements;
        setAllAnnouncements(announcements);
        
        // Filter recent announcements (last 7 days) that are not read
        const recentAnnouncements = announcements.filter((announcement: any) => {
          const createdDate = new Date(announcement.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdDate > weekAgo && !readAnnouncements.has(announcement.id);
        });
        
        setUnreadCount(recentAnnouncements.length);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Silently fail to avoid disrupting user experience
    }
  };

  const setNotificationOpen = (open: boolean) => {
    setIsNotificationOpen(open);
  };

  const toggleNotification = () => {
    setNotificationOpen(!isNotificationOpen);
  };

  const markAnnouncementAsRead = (announcementId: string) => {
    setReadAnnouncements(prev => {
      const newReadSet = new Set([...prev, announcementId]);
      
      // Recalculate unread count immediately
      const recentUnreadCount = allAnnouncements.filter((announcement: any) => {
        const createdDate = new Date(announcement.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate > weekAgo && !newReadSet.has(announcement.id);
      }).length;
      
      setUnreadCount(recentUnreadCount);
      return newReadSet;
    });
  };

  const value = {
    isNotificationOpen,
    setNotificationOpen,
    toggleNotification,
    unreadCount,
    setUnreadCount,
    readAnnouncements,
    markAnnouncementAsRead,
    allAnnouncements,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  
  return context;
}