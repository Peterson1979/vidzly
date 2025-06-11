import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { APP_NAME } from '../constants';
export const CopyrightFooter = () => {
    const currentYear = new Date().getFullYear();
    return (_jsxs("footer", { className: "py-6 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-auto", children: [_jsxs("p", { children: ["\u00A9 ", currentYear, " ", APP_NAME, ". All rights reserved."] }), _jsxs("p", { className: "mt-1", children: ["Video content is sourced from YouTube. ", APP_NAME, " is not affiliated with YouTube."] }), _jsx("p", { className: "mt-1", children: "Please respect copyright laws. All trademarks and copyrights belong to their respective owners." })] }));
};
