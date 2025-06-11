import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useContext, useMemo } from 'react';
import { SubscriptionTier } from '../types';
const SubscriptionContext = createContext(undefined);
export const SubscriptionProvider = ({ children }) => {
    const [tier, setTier] = useState(SubscriptionTier.NONE);
    const isSubscribed = useMemo(() => tier !== SubscriptionTier.NONE, [tier]);
    const contextValue = useMemo(() => ({
        tier,
        setTier,
        isSubscribed
    }), [tier, isSubscribed]);
    return (_jsx(SubscriptionContext.Provider, { value: contextValue, children: children }));
};
export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};
