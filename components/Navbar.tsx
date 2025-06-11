
import React, { useState, useEffect, useRef } from 'react';
import { APP_NAME, DEFAULT_LOGO_SVG_STRING } from '../constants'; // Import DEFAULT_LOGO_SVG_STRING
import { useSubscription } from '../contexts/SubscriptionContext';
import { SearchIcon, SparklesIcon, BellIcon as NotificationBellIconSrc, UserIcon } from './Icons';
// import { useLogo } from '../contexts/LogoContext'; // Removed
import { NotificationPanel } from './NotificationPanel';
import { useNotificationCenter } from '../contexts/NotificationCenterContext';
import { useNavigateToView } from '../hooks/useNavigateToView';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => {
  // const { customLogoUrl, defaultLogoSvgString } = useLogo(); // Removed useLogo
  const effectiveClassName = className || "h-8 w-8 sm:h-10 sm:w-10";

  // Always use the default SVG string
  return (
    <div
      className={effectiveClassName}
      dangerouslySetInnerHTML={{ __html: DEFAULT_LOGO_SVG_STRING }}
    />
  );
};

interface NavbarProps {
  onOpenSearch: () => void;
  isForYouModeActive: boolean;
  onToggleForYouMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, isForYouModeActive, onToggleForYouMode }) => {
  const { isSubscribed } = useSubscription();
  const { unreadCount } = useNotificationCenter();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null); 

  const { navigateToPath } = useNavigateToView(); 


  const toggleNotificationPanel = () => {
    setIsNotificationPanelOpen(prev => !prev);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isNotificationPanelOpen &&
        notificationButtonRef.current && !notificationButtonRef.current.contains(event.target as Node) &&
        (!panelRef.current || !panelRef.current.contains(event.target as Node)) 
      ) {
        setIsNotificationPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationPanelOpen]);


  return (
    <nav className="bg-primary-light dark:bg-secondary-dark shadow-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center flex-shrink-0">
            <LogoIcon />
            <span className="font-bold text-xl sm:text-2xl text-text-light dark:text-text-dark ml-2">{APP_NAME}</span>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onToggleForYouMode}
              className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 dark:focus:ring-offset-primary-dark transition-colors ${
                isForYouModeActive ? 'text-brand-orange dark:text-orange-400 bg-orange-100 dark:bg-orange-800/30' : 'text-gray-600 dark:text-gray-300'
              }`}
              aria-label="Toggle 'For You' personalized feed"
              aria-pressed={isForYouModeActive}
            >
              <UserIcon className="h-6 w-6" />
            </button>

            <button
              onClick={onOpenSearch}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 dark:focus:ring-offset-primary-dark transition-colors"
              aria-label="Open search"
            >
              <SearchIcon className="h-6 w-6" />
            </button>

            <div className="relative">
              <button
                ref={notificationButtonRef}
                onClick={toggleNotificationPanel}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 dark:focus:ring-offset-primary-dark transition-colors"
                aria-label="Open notifications"
                aria-haspopup="true"
                aria-expanded={isNotificationPanelOpen}
              >
                <NotificationBellIconSrc className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800">
                     <span className="sr-only">{unreadCount} unread notifications</span>
                  </span>
                )}
              </button>
              <NotificationPanel 
                isOpen={isNotificationPanelOpen} 
                onClose={() => setIsNotificationPanelOpen(false)}
                onNavigate={navigateToPath}
              />
            </div>


            {isSubscribed && (
              <div className="flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-md bg-green-100 dark:bg-green-700 text-xs sm:text-sm font-medium text-green-700 dark:text-green-200">
                <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-1.5 text-yellow-500 dark:text-yellow-400" />
                Premium
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};