"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySuggestions = MySuggestions;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const parse_replies_1 = require("../lib/parse-replies");
const types_1 = require("../lib/types");
function interpolate(template, vars) {
    return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}
const STATUS_BADGE = {
    open: 'bg-green-900/30 text-green-400 border border-green-700',
    pending: 'bg-gray-800/30 text-gray-400 border border-gray-600',
    reviewing: 'bg-blue-900/30 text-blue-400 border border-blue-700',
    planned: 'bg-purple-900/30 text-purple-400 border border-purple-700',
    implemented: 'bg-green-900/30 text-green-400 border border-green-700',
    declined: 'bg-red-900/30 text-red-400 border border-red-700',
};
const TYPE_BADGE = {
    bug: 'bg-red-900/30 text-red-400 border border-red-700',
    suggestion: 'bg-blue-900/30 text-blue-400 border border-blue-700',
    feature: 'bg-blue-900/30 text-blue-400 border border-blue-700',
    improvement: 'bg-orange-900/30 text-orange-400 border border-orange-700',
};
const DEFAULT_BADGE = 'bg-gray-800/30 text-gray-400 border border-gray-600';
function MySuggestions({ isAuthenticated, apiBasePath = '/api/suggestions', primaryColor = '#0d9488', labels: labelOverrides, authHeader, }) {
    const labels = { ...types_1.DEFAULT_LABELS, ...labelOverrides };
    const [suggestions, setSuggestions] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)('');
    const [currentPage, setCurrentPage] = (0, react_1.useState)(1);
    const loadingStartTime = (0, react_1.useRef)(0);
    const ITEMS_PER_PAGE = 10;
    (0, react_1.useEffect)(() => {
        if (isAuthenticated) {
            fetchSuggestions();
        }
        else {
            setLoading(false);
        }
    }, [isAuthenticated]);
    const fetchSuggestions = async () => {
        setLoading(true);
        setError('');
        loadingStartTime.current = Date.now();
        try {
            const headers = {};
            if (authHeader)
                headers['Authorization'] = authHeader;
            const response = await fetch(apiBasePath, { headers });
            if (!response.ok)
                throw new Error('Failed to fetch');
            const data = await response.json();
            const elapsed = Date.now() - loadingStartTime.current;
            const remaining = Math.max(0, 300 - elapsed);
            if (remaining > 0)
                await new Promise((r) => setTimeout(r, remaining));
            setSuggestions(data || []);
        }
        catch {
            setError(labels.loadFailed || '');
        }
        finally {
            setLoading(false);
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    if (!isAuthenticated) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: (0, jsx_runtime_1.jsx)("p", { children: labels.loginToView }) }));
    }
    if (loading) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4", "aria-busy": "true", children: [1, 2, 3].map((i) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" }), (0, jsx_runtime_1.jsx)("div", { className: "h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-md" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" }), (0, jsx_runtime_1.jsx)("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" })] })] }, i))) }));
    }
    if (error) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8 text-red-600", role: "alert", children: (0, jsx_runtime_1.jsx)("p", { children: error }) }));
    }
    if (suggestions.length === 0) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: [(0, jsx_runtime_1.jsx)("p", { className: "mb-2", children: labels.noSuggestions }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm opacity-75", children: labels.noSuggestionsSubtext })] }));
    }
    const totalPages = Math.ceil(suggestions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentSuggestions = suggestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "space-y-4", role: "list", children: currentSuggestions.map((suggestion) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4", role: "listitem", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-3 flex-wrap", children: [(0, jsx_runtime_1.jsx)("span", { className: `px-2 py-1 rounded-md text-xs font-medium ${TYPE_BADGE[suggestion.type] || DEFAULT_BADGE}`, children: suggestion.type }), (0, jsx_runtime_1.jsx)("span", { className: `px-2 py-1 rounded-md text-xs font-medium ${STATUS_BADGE[suggestion.status] || DEFAULT_BADGE}`, children: suggestion.status })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-3", children: [suggestion.title && ((0, jsx_runtime_1.jsx)("h4", { className: "text-gray-900 dark:text-gray-100 font-semibold mb-1", children: suggestion.title })), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-900 dark:text-gray-100 text-sm", children: suggestion.description })] }), suggestion.adminReply && ((0, jsx_runtime_1.jsxs)("div", { className: "border-l-4 pl-3 py-2 mt-3 rounded-r bg-gray-100 dark:bg-gray-700/30", style: { borderLeftColor: primaryColor }, children: [(0, jsx_runtime_1.jsx)("strong", { className: "text-sm", style: { color: primaryColor }, children: interpolate(labels.adminReplies || '', { count: (0, parse_replies_1.parseReplies)(suggestion.adminReply).length }) }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 mt-2", children: (0, parse_replies_1.parseReplies)(suggestion.adminReply).map((reply, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 mb-1", children: reply.timestamp }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-900 dark:text-gray-100 text-sm whitespace-pre-wrap", children: reply.content })] }, index))) })] })), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500", children: (0, jsx_runtime_1.jsx)("span", { children: interpolate(labels.submittedOn || '', { date: formatDate(suggestion.createdAt) }) }) })] }, suggestion.id))) }), totalPages > 1 && ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setCurrentPage((p) => Math.max(p - 1, 1)), disabled: currentPage === 1, className: "px-4 py-2 rounded-lg font-medium transition-colors text-white disabled:bg-gray-300 disabled:cursor-not-allowed", style: currentPage === 1 ? undefined : { backgroundColor: primaryColor }, children: labels.previous }), (0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-500 font-medium", children: interpolate(labels.page || '', { current: currentPage, total: totalPages }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setCurrentPage((p) => Math.min(p + 1, totalPages)), disabled: currentPage === totalPages, className: "px-4 py-2 rounded-lg font-medium transition-colors text-white disabled:bg-gray-300 disabled:cursor-not-allowed", style: currentPage === totalPages ? undefined : { backgroundColor: primaryColor }, children: labels.next })] }))] }));
}
