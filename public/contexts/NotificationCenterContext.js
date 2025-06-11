import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { InAppNotificationType } from '../types';
import { IN_APP_NOTIFICATIONS_STORAGE_KEY, MAX_IN_APP_NOTIFICATIONS, NEW_IN_APP_NOTIFICATION_EVENT } from '../constants';
const NotificationCenterContext = createContext(undefined);
const getIconNameForType = (type) => {
    switch (type) {
        case InAppNotificationType.BADGE_EARNED: return 'TrophyAwardIcon'; // Updated from CupIcon
        case InAppNotificationType.GEMINI_CURATED_NEW: return 'LightBulbIcon';
        case InAppNotificationType.NEW_CONTENT_DAILY:
        case InAppNotificationType.NEW_CONTENT_WEEKLY: return 'TvIcon';
        case InAppNotificationType.STREAK_UPDATE: return 'SparklesIcon';
        case InAppNotificationType.INACTIVITY_REMINDER: return 'ClockIcon';
        case InAppNotificationType.HUMOROUS_SURPRISE: return 'SparklesIcon';
        case InAppNotificationType.FEATURE_ANNOUNCEMENT: return 'InformationCircleIcon';
        case InAppNotificationType.GENERIC:
        default: return 'NotificationBellIcon';
    }
};
export const NotificationCenterProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const loadNotifications = useCallback(() => {
        try {
            const storedNotifications = localStorage.getItem(IN_APP_NOTIFICATIONS_STORAGE_KEY);
            const parsedNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];
            // Ensure iconName is present if missing (migration for older notifications if any)
            const processedNotifications = parsedNotifications.map(n => ({
                ...n,
                iconName: n.iconName || getIconNameForType(n.type)
            }));
            setNotifications(processedNotifications);
            setUnreadCount(processedNotifications.filter(n => !n.read).length);
        }
        catch (error) {
            console.error("Error loading in-app notifications from localStorage", error);
            setNotifications([]);
            setUnreadCount(0);
        }
    }, []);
    useEffect(() => {
        loadNotifications(); // Initial load
        // Listen for the custom event dispatched by notificationService.ts
        const handleNewNotification = () => {
            loadNotifications(); // Reload notifications from localStorage
        };
        window.addEventListener(NEW_IN_APP_NOTIFICATION_EVENT, handleNewNotification);
        return () => {
            window.removeEventListener(NEW_IN_APP_NOTIFICATION_EVENT, handleNewNotification);
        };
    }, [loadNotifications]);
    const saveNotifications = useCallback((updatedNotifications) => {
        try {
            localStorage.setItem(IN_APP_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
            setNotifications(updatedNotifications);
            setUnreadCount(updatedNotifications.filter(n => !n.read).length);
        }
        catch (error) {
            console.error("Error saving in-app notifications to localStorage", error);
        }
    }, []);
    const markAsRead = useCallback((notificationId) => {
        const updatedNotifications = notifications.map(n => n.id === notificationId ? { ...n, read: true } : n);
        saveNotifications(updatedNotifications);
    }, [notifications, saveNotifications]);
    const markAllAsRead = useCallback(() => {
        const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
        saveNotifications(updatedNotifications);
    }, [notifications, saveNotifications]);
    const clearNotification = useCallback((notificationId) => {
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);
        saveNotifications(updatedNotifications);
    }, [notifications, saveNotifications]);
    const clearAllNotifications = useCallback(() => {
        saveNotifications([]);
    }, [saveNotifications]);
    const addNotificationManual = useCallback((data) => {
        // This is a context-internal way to add, primarily for testing or direct UI actions
        // Prefer using addInAppNotificationToStore from notificationService for consistency
        const newNotification = {
            ...data,
            id: `inappctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            read: false,
            iconName: getIconNameForType(data.type),
        };
        let updatedNotifications = [newNotification, ...notifications];
        if (updatedNotifications.length > MAX_IN_APP_NOTIFICATIONS) {
            updatedNotifications = updatedNotifications.slice(0, MAX_IN_APP_NOTIFICATIONS);
        }
        saveNotifications(updatedNotifications);
    }, [notifications, saveNotifications]);
    const contextValue = useMemo(() => ({
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        addNotificationManual,
    }), [notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAllNotifications, addNotificationManual]);
    return (_jsx(NotificationCenterContext.Provider, { value: contextValue, children: children }));
};
export const useNotificationCenter = () => {
    const context = useContext(NotificationCenterContext);
    if (!context) {
        throw new Error('useNotificationCenter must be used within a NotificationCenterProvider');
    }
    return context;
};
