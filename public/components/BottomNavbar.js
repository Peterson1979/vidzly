import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HeartIcon, SettingsIcon, TvIcon, ClockIcon, HistoryIcon } from './Icons';
const NavItem = ({ label, icon, isActive, onClick, ariaLabel }) => (_jsxs("button", { onClick: onClick, className: `flex flex-col items-center justify-center flex-1 px-2 py-2.5 text-xs font-medium transition-colors duration-150 ease-in-out focus:outline-none
                ${isActive ? 'text-brand-orange dark:text-orange-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`, "aria-current": isActive ? 'page' : undefined, "aria-label": ariaLabel || label, children: [icon, _jsx("span", { className: "mt-1", children: label })] }));
export const BottomNavbar = ({ currentView, onViewChange }) => {
    const navItems = [
        { view: 'home', label: 'Home', icon: _jsx(TvIcon, { className: "w-6 h-6" }) },
        { view: 'saved', label: 'Saved', icon: _jsx(ClockIcon, { className: "w-6 h-6" }) }, // Changed from 'watchlater' to 'saved', label to 'Saved'
        { view: 'favorites', label: 'Favorites', icon: _jsx(HeartIcon, { className: "w-6 h-6" }) },
        { view: 'history', label: 'History', icon: _jsx(HistoryIcon, { className: "w-6 h-6" }) },
        { view: 'settings', label: 'Settings', icon: _jsx(SettingsIcon, { className: "w-6 h-6" }) },
    ];
    return (_jsx("nav", { className: "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-60", children: _jsx("div", { className: "container mx-auto max-w-screen-md", children: _jsx("div", { className: "flex justify-around items-center h-16", children: navItems.map(item => (_jsx(NavItem, { label: item.label, icon: item.icon, isActive: currentView === item.view, onClick: () => onViewChange(item.view), ariaLabel: item.ariaLabel }, item.view))) }) }) }));
};
