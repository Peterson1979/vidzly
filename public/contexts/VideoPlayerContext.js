import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useContext, useCallback, useMemo } from 'react';
const VideoPlayerContext = createContext(undefined);
export const VideoPlayerProvider = ({ children }) => {
    const [playingVideoId, setPlayingVideoId] = useState(null);
    const playVideo = useCallback((videoId) => {
        setPlayingVideoId(videoId);
    }, []);
    const pauseVideo = useCallback((videoId) => {
        // Only pause if the video requesting pause is the one currently playing.
        // This prevents a video that's not in focus from trying to pause the active one.
        setPlayingVideoId(currentId => (currentId === videoId ? null : currentId));
    }, []);
    const contextValue = useMemo(() => ({
        playingVideoId,
        playVideo,
        pauseVideo
    }), [playingVideoId, playVideo, pauseVideo]);
    return (_jsx(VideoPlayerContext.Provider, { value: contextValue, children: children }));
};
export const useVideoPlayer = () => {
    const context = useContext(VideoPlayerContext);
    if (!context) {
        throw new Error('useVideoPlayer must be used within a VideoPlayerProvider');
    }
    return context;
};
