import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactPlayer from 'react-player/youtube'; // Only import YouTube for bundle size
export const VideoPlayer = React.memo(({ url, isPlaying, onReady, onEnded, onPlay, onPause, width = '100%', height = '100%' }) => {
    return (_jsxs("div", { className: "relative aspect-video bg-black rounded-t-lg overflow-hidden group", children: [_jsx(ReactPlayer, { url: url, playing: isPlaying, controls: true, width: width, height: height, className: "absolute top-0 left-0", onReady: onReady, onEnded: onEnded, onPlay: onPlay, onPause: onPause, config: {
                    playerVars: {
                        showinfo: 0,
                        modestbranding: 1,
                        rel: 0,
                    }
                } }), !isPlaying && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 group-hover:bg-opacity-20 dark:bg-opacity-60 dark:group-hover:bg-opacity-40 transition-opacity duration-300 pointer-events-none", children: _jsx("svg", { className: "w-16 h-16 text-white opacity-80 group-hover:opacity-100 transform group-hover:scale-110 transition-transform duration-300", viewBox: "0 0 24 24", fill: "currentColor", children: _jsx("path", { d: "M8 5v14l11-7z" }) }) }))] }));
});
