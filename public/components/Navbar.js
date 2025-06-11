import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { APP_NAME, DEFAULT_LOGO_SVG_STRING } from '../constants'; // Import DEFAULT_LOGO_SVG_STRING
import { useSubscription } from '../contexts/SubscriptionContext';
import { SearchIcon, SparklesIcon, BellIcon as NotificationBellIconSrc, UserIcon } from './Icons';
// import { useLogo } from '../contexts/LogoContext'; // Removed
import { NotificationPanel } from './NotificationPanel';
import { useNotificationCenter } from '../contexts/NotificationCenterContext';
import { useNavigateToView } from '../hooks/useNavigateToView';
const LogoIcon = ({ className }) => {
    // const { customLogoUrl, defaultLogoSvgString } = useLogo(); // Removed useLogo
    const effectiveClassName = className || "h-8 w-8 sm:h-10 sm:w-10";
    // Always use the default SVG string
    return (_jsx("div", { className: effectiveClassName, dangerouslySetInnerHTML: { __html: DEFAULT_LOGO_SVG_STRING } }));
};
export const Navbar = ({ onOpenSearch, isForYouModeActive, onToggleForYouMode }) => {
    const { isSubscribed } = useSubscription();
    const { unreadCount } = useNotificationCenter();
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const notificationButtonRef = useRef(null);
    const panelRef = useRef(null);
    const { navigateToPath } = useNavigateToView();
    const toggleNotificationPanel = () => {
        setIsNotificationPanelOpen(prev => !prev);
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isNotificationPanelOpen &&
                notificationButtonRef.current && !notificationButtonRef.current.contains(event.target) &&
                (!panelRef.current || !panelRef.current.contains(event.target))) {
                setIsNotificationPanelOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isNotificationPanelOpen]);
    return (_jsx("nav", { className: "bg-primary-light dark:bg-secondary-dark shadow-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700", children: _jsx("div", { className: "container mx-auto px-2 sm:px-4 lg:px-8", children: _jsxs("div", { className: "flex items-center justify-between h-16", children: [_jsxs("div", { className: "flex items-center flex-shrink-0", children: [_jsx(LogoIcon, {}), _jsx("span", { className: "font-bold text-xl sm:text-2xl text-text-light dark:text-text-dark ml-2", children: APP_NAME })] }), _jsxs("div", { className: "flex items-center space-x-2 sm:space-x-3", children: [_jsx("button", { onClick: onToggleForYouMode, className: `p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 dark:focus:ring-offset-primary-dark transition-colors ${isForYouModeActive ? 'text-brand-orange dark:text-orange-400 bg-orange-100 dark:bg-orange-800/30' : 'text-gray-600 dark:text-gray-300'}`, "aria-label": "Toggle 'For You' personalized feed", "aria-pressed": isForYouModeActive, children: _jsx(UserIcon, { className: "h-6 w-6" }) }), _jsx("button", { onClick: onOpenSearch, className: "p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 dark:focus:ring-offset-primary-dark transition-colors", "aria-label": "Open search", children: _jsx(SearchIcon, { className: "h-6 w-6" }) }), _jsxs("div", { className: "relative", children: [_jsxs("button", { ref: notificationButtonRef, onClick: toggleNotificationPanel, className: "p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 dark:focus:ring-offset-primary-dark transition-colors", "aria-label": "Open notifications", "aria-haspopup": "true", "aria-expanded": isNotificationPanelOpen, children: [_jsx(NotificationBellIconSrc, { className: "h-6 w-6" }), unreadCount > 0 && (_jsx("span", { className: "absolute top-0 right-0 block h-2.5 w-2.5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800", children: _jsxs("span", { className: "sr-only", children: [unreadCount, " unread notifications"] }) }))] }), _jsx(NotificationPanel, { isOpen: isNotificationPanelOpen, onClose: () => setIsNotificationPanelOpen(false), onNavigate: navigateToPath })] }), isSubscribed && (_jsxs("div", { className: "flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-md bg-green-100 dark:bg-green-700 text-xs sm:text-sm font-medium text-green-700 dark:text-green-200", children: [_jsx(SparklesIcon, { className: "h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-1.5 text-yellow-500 dark:text-yellow-400" }), "Premium"] }))] })] }) }) }));
};
