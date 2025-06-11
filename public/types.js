export var SubscriptionTier;
(function (SubscriptionTier) {
    SubscriptionTier["NONE"] = "none";
    SubscriptionTier["MONTHLY"] = "monthly";
    SubscriptionTier["YEARLY"] = "yearly";
})(SubscriptionTier || (SubscriptionTier = {}));
// --- Gamification: Badges ---
export var BadgeId;
(function (BadgeId) {
    BadgeId["WATCH_10"] = "watch_10";
    BadgeId["FAVORITE_5_DISTINCT_CATEGORIES"] = "favorite_5_distinct_categories";
    BadgeId["AI_INSIGHTS_3"] = "ai_insights_3";
    // Add more badge IDs here
})(BadgeId || (BadgeId = {}));
// --- In-App Notification Center ---
export var InAppNotificationType;
(function (InAppNotificationType) {
    InAppNotificationType["GENERIC"] = "generic";
    InAppNotificationType["BADGE_EARNED"] = "badge_earned";
    InAppNotificationType["STREAK_UPDATE"] = "streak_update";
    InAppNotificationType["NEW_CONTENT_DAILY"] = "new_content_daily";
    InAppNotificationType["NEW_CONTENT_WEEKLY"] = "new_content_weekly";
    InAppNotificationType["INACTIVITY_REMINDER"] = "inactivity_reminder";
    InAppNotificationType["HUMOROUS_SURPRISE"] = "humorous_surprise";
    InAppNotificationType["GEMINI_CURATED_NEW"] = "gemini_curated_new";
    InAppNotificationType["FEATURE_ANNOUNCEMENT"] = "feature_announcement";
})(InAppNotificationType || (InAppNotificationType = {}));
