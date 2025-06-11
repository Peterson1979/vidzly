import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { VideoCard } from '../components/VideoCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { allMockVideos as globalAllMockVideos } from '../services/youtubeService';
import { HeartIcon, TrashIcon, EditIcon, FolderPlusIcon, FolderIcon, CheckCircleIcon, XIcon } from '../components/Icons';
import { UNCATEGORIZED_CATEGORY_ID, UNCATEGORIZED_CATEGORY_NAME } from '../constants';
export const FavoritesView = () => {
    const { favorites: favoriteItems, categories, addCategory, removeCategory, updateCategoryName, assignVideoToCategory } = useFavorites();
    const [detailedFavoriteVideos, setDetailedFavoriteVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [timeFilter, setTimeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState(null); // null means 'All'
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingCategoryNameInput, setEditingCategoryNameInput] = useState('');
    // Fetch details for all favorited videos once
    useEffect(() => {
        const fetchFavoriteVideoDetails = async () => {
            if (favoriteItems.length === 0) {
                setDetailedFavoriteVideos([]);
                return;
            }
            setIsLoading(true);
            const favoriteVideoIds = favoriteItems.map(item => item.videoId);
            const detailed = globalAllMockVideos.filter(video => favoriteVideoIds.includes(video.id));
            // Sort by favoritedAt date, newest first for initial view
            const sortedDetailed = detailed.sort((a, b) => {
                const favA = favoriteItems.find(f => f.videoId === a.id);
                const favB = favoriteItems.find(f => f.videoId === b.id);
                return (favB?.favoritedAt || 0) - (favA?.favoritedAt || 0);
            });
            setDetailedFavoriteVideos(sortedDetailed);
            setIsLoading(false);
        };
        fetchFavoriteVideoDetails();
    }, [favoriteItems]); // Re-fetch if favoriteItems array reference changes
    const handleAddCategory = (e) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            addCategory(newCategoryName.trim());
            setNewCategoryName('');
        }
    };
    const handleStartEditCategory = (category) => {
        setEditingCategory(category);
        setEditingCategoryNameInput(category.name);
    };
    const handleSaveEditCategory = () => {
        if (editingCategory && editingCategoryNameInput.trim()) {
            updateCategoryName(editingCategory.id, editingCategoryNameInput.trim());
        }
        setEditingCategory(null);
        setEditingCategoryNameInput('');
    };
    const handleDeleteCategory = (categoryId) => {
        if (window.confirm("Are you sure you want to delete this category? Videos in it will become uncategorized.")) {
            removeCategory(categoryId);
        }
    };
    const filteredAndSortedVideos = useMemo(() => {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;
        let videosToDisplay = detailedFavoriteVideos.map(video => {
            const favItem = favoriteItems.find(f => f.videoId === video.id);
            return { ...video, favoritedAt: favItem?.favoritedAt || 0, categoryId: favItem?.categoryId || null };
        });
        // 1. Filter by Category
        if (categoryFilter === UNCATEGORIZED_CATEGORY_ID) {
            videosToDisplay = videosToDisplay.filter(video => !video.categoryId);
        }
        else if (categoryFilter) { // Specific category ID
            videosToDisplay = videosToDisplay.filter(video => video.categoryId === categoryFilter);
        }
        // If categoryFilter is null, all videos are considered (no category filtering step)
        // 2. Filter by Time
        videosToDisplay = videosToDisplay.filter(video => {
            if (!video.favoritedAt)
                return false; // Should not happen if data is consistent
            switch (timeFilter) {
                case 'today': return now - video.favoritedAt < oneDay;
                case 'week': return now - video.favoritedAt < oneWeek;
                case 'month': return now - video.favoritedAt < oneMonth;
                case 'all':
                default: return true;
            }
        });
        // Sort by favoritedAt again after filtering, as category filter might change order
        return videosToDisplay.sort((a, b) => b.favoritedAt - a.favoritedAt);
    }, [detailedFavoriteVideos, favoriteItems, categoryFilter, timeFilter]);
    const TimeFilterButton = ({ filterType, label }) => (_jsx("button", { onClick: () => setTimeFilter(filterType), className: `px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-150
                  ${timeFilter === filterType
            ? 'bg-brand-orange text-white shadow-md'
            : 'bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark hover:bg-gray-300 dark:hover:bg-gray-600'}`, children: label }));
    const CategoryFilterButton = ({ filterId, label, icon }) => (_jsxs("button", { onClick: () => setCategoryFilter(filterId), className: `flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-150 mr-2 mb-2
                  ${categoryFilter === filterId
            ? 'bg-brand-orange text-white shadow-md'
            : 'bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark hover:bg-gray-300 dark:hover:bg-gray-600'}`, children: [icon && _jsx("span", { className: "mr-2", children: icon }), label] }));
    if (isLoading && favoriteItems.length > 0) {
        return _jsx("div", { className: "flex justify-center items-center h-64", children: _jsx(LoadingSpinner, {}) });
    }
    return (_jsxs("div", { className: "pb-20 min-h-[calc(100vh-10rem)]", children: [_jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-text-light dark:text-text-dark text-center my-6", children: "Your Favorites" }), _jsx("div", { className: "mb-8 px-2 max-w-xl mx-auto", children: _jsxs("form", { onSubmit: handleAddCategory, className: "flex items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow", children: [_jsx(FolderPlusIcon, { className: "w-6 h-6 text-brand-orange flex-shrink-0" }), _jsx("input", { type: "text", value: newCategoryName, onChange: (e) => setNewCategoryName(e.target.value), placeholder: "New category name...", className: "flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-text-light dark:text-text-dark focus:ring-brand-orange focus:border-brand-orange" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-brand-orange text-white font-semibold rounded-md hover:bg-orange-600 transition-colors", children: "Add" })] }) }), _jsxs("div", { className: "flex flex-wrap justify-center mb-6 px-2", children: [_jsx(CategoryFilterButton, { filterId: null, label: "All Favorites", icon: _jsx(HeartIcon, { className: "w-4 h-4" }) }), _jsx(CategoryFilterButton, { filterId: UNCATEGORIZED_CATEGORY_ID, label: UNCATEGORIZED_CATEGORY_NAME, icon: _jsx(FolderIcon, { className: "w-4 h-4" }) }), categories.map(cat => (editingCategory?.id === cat.id ? (_jsxs("div", { className: "flex items-center p-1.5 mr-2 mb-2 bg-gray-200 dark:bg-gray-700 rounded-md", children: [_jsx("input", { type: "text", value: editingCategoryNameInput, onChange: (e) => setEditingCategoryNameInput(e.target.value), className: "px-2 py-1 text-xs sm:text-sm border border-brand-orange rounded-l-md bg-white dark:bg-gray-600 text-text-light dark:text-text-dark focus:outline-none" }), _jsx("button", { onClick: handleSaveEditCategory, className: "p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-r-md", children: _jsx(CheckCircleIcon, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setEditingCategory(null), className: "p-1.5 ml-1 bg-gray-400 hover:bg-gray-500 text-white rounded-md", children: _jsx(XIcon, { className: "w-4 h-4" }) })] }, cat.id)) : (_jsxs("div", { className: "relative group mr-2 mb-2", children: [_jsx(CategoryFilterButton, { filterId: cat.id, label: cat.name, icon: _jsx(FolderIcon, { className: "w-4 h-4" }) }), _jsxs("div", { className: "absolute top-0 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity duration-150", children: [_jsx("button", { onClick: () => handleStartEditCategory(cat), className: "p-1 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full text-xs -mt-1 -mr-1 shadow", children: _jsx(EditIcon, { className: "w-3 h-3" }) }), _jsx("button", { onClick: () => handleDeleteCategory(cat.id), className: "p-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs -mt-1 ml-0.5 shadow", children: _jsx(TrashIcon, { className: "w-3 h-3" }) })] })] }, cat.id))))] }), _jsxs("div", { className: "flex justify-center space-x-2 sm:space-x-3 mb-8 px-2", children: [_jsx(TimeFilterButton, { filterType: "all", label: "All Time" }), _jsx(TimeFilterButton, { filterType: "today", label: "Today" }), _jsx(TimeFilterButton, { filterType: "week", label: "This Week" }), _jsx(TimeFilterButton, { filterType: "month", label: "This Month" })] }), favoriteItems.length === 0 ? (_jsxs("div", { className: "text-center py-12 px-4 text-text-light dark:text-text-dark", children: [_jsx(HeartIcon, { className: "w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" }), _jsx("h2", { className: "text-xl sm:text-2xl font-semibold mb-2", children: "No Favorites Yet" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Tap the heart icon on videos to save them here." })] })) : filteredAndSortedVideos.length === 0 ? (_jsxs("div", { className: "text-center py-12 px-4 text-text-light dark:text-text-dark", children: [_jsx(HeartIcon, { className: "w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" }), _jsx("h2", { className: "text-xl sm:text-2xl font-semibold mb-2", children: "No Favorites Found" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "No videos match the current filters. Try different filters or add more favorites!" })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6", children: filteredAndSortedVideos.map(videoWithMeta => (_jsxs("div", { className: "relative", children: [_jsx(VideoCard, { video: videoWithMeta }), _jsx("div", { className: "absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-sm rounded-md p-1", children: _jsxs("select", { value: videoWithMeta.categoryId || UNCATEGORIZED_CATEGORY_ID, onChange: (e) => assignVideoToCategory(videoWithMeta.id, e.target.value === UNCATEGORIZED_CATEGORY_ID ? null : e.target.value), className: "text-xs bg-transparent text-white dark:text-gray-200 border-none focus:ring-0 cursor-pointer appearance-none pr-4", style: { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 20 20'%3E%3Cpath d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.1rem center', backgroundSize: '1em' }, children: [_jsx("option", { value: UNCATEGORIZED_CATEGORY_ID, className: "text-black dark:text-white bg-gray-100 dark:bg-gray-700", children: UNCATEGORIZED_CATEGORY_NAME }), categories.map(cat => (_jsx("option", { value: cat.id, className: "text-black dark:text-white bg-gray-100 dark:bg-gray-700", children: cat.name }, cat.id)))] }) })] }, videoWithMeta.id))) }))] }));
};
