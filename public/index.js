import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { VideoPlayerProvider } from './contexts/VideoPlayerContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
// import { LogoProvider } from './contexts/LogoContext'; // Removed
import { SavedProvider } from './contexts/SavedContext'; // Renamed from WatchLaterProvider
import { BadgesProvider } from './contexts/BadgesContext';
import { NotificationCenterProvider } from './contexts/NotificationCenterContext';
import { ViewHistoryProvider } from './contexts/ViewHistoryContext';
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(_jsx(React.StrictMode, { children: _jsxs(ThemeProvider, { children: [" ", _jsx(SubscriptionProvider, { children: _jsx(VideoPlayerProvider, { children: _jsx(BadgesProvider, { children: _jsxs(FavoritesProvider, { children: [_jsxs(SavedProvider, { children: [" ", _jsx(NotificationCenterProvider, { children: _jsx(ViewHistoryProvider, { children: _jsx(App, {}) }) })] }), " "] }) }) }) }), " "] }) }));
