import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useBadges } from '../contexts/BadgesContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { BadgeCard } from '../components/BadgeCard';
import { BadgeId } from '../types';
import { TrophyAwardIcon } from '../components/Icons'; // Changed CupIcon to TrophyAwardIcon
export const AchievementsView = () => {
    const { getAllBadgeDetails, isBadgeEarned, progress } = useBadges();
    const { favorites } = useFavorites(); // For category-based badge progress
    const allBadges = getAllBadgeDetails();
    const getProgressForBadge = (badgeId, currentProgress, currentFavorites) => {
        switch (badgeId) {
            case BadgeId.WATCH_10:
                return currentProgress.watchedVideosCount;
            case BadgeId.AI_INSIGHTS_3:
                return currentProgress.aiInsightsUsedCount;
            case BadgeId.FAVORITE_5_DISTINCT_CATEGORIES:
                const distinctCategories = new Set(currentFavorites
                    .map(fav => fav.categoryId)
                    .filter(catId => catId !== null && catId !== undefined));
                return distinctCategories.size;
            default:
                return undefined;
        }
    };
    return (_jsxs("div", { className: "pb-20 min-h-[calc(100vh-10rem)]", children: [_jsxs("div", { className: "text-center my-6", children: [_jsx(TrophyAwardIcon, { className: "w-12 h-12 sm:w-16 sm:h-16 mx-auto text-brand-orange dark:text-orange-400 mb-3" }), " ", _jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-text-light dark:text-text-dark", children: "Your Achievements" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: "Track your progress and unlock all badges!" })] }), allBadges.length === 0 ? (_jsx("p", { className: "text-center text-gray-500 dark:text-gray-400", children: "No badges defined yet." })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-4", children: allBadges.map(badge => {
                    const earned = isBadgeEarned(badge.id);
                    const currentVal = getProgressForBadge(badge.id, progress, favorites);
                    return (_jsx(BadgeCard, { badge: badge, isEarned: earned, currentProgress: currentVal }, badge.id));
                }) }))] }));
};
