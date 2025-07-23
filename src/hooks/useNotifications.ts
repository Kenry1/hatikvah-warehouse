import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification.id;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Helper functions for common notification types
  const notifySuccess = useCallback((title: string, message: string, actionUrl?: string, actionLabel?: string) => {
    return addNotification({ title, message, type: 'success', actionUrl, actionLabel });
  }, [addNotification]);

  const notifyError = useCallback((title: string, message: string, actionUrl?: string, actionLabel?: string) => {
    return addNotification({ title, message, type: 'error', actionUrl, actionLabel });
  }, [addNotification]);

  const notifyWarning = useCallback((title: string, message: string, actionUrl?: string, actionLabel?: string) => {
    return addNotification({ title, message, type: 'warning', actionUrl, actionLabel });
  }, [addNotification]);

  const notifyInfo = useCallback((title: string, message: string, actionUrl?: string, actionLabel?: string) => {
    return addNotification({ title, message, type: 'info', actionUrl, actionLabel });
  }, [addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo
  };
}