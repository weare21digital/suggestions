"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionReplyModal = SuggestionReplyModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const parse_replies_1 = require("../../lib/parse-replies");
const STATUS_OPTIONS = [
    { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800' },
    { value: 'reviewing', label: 'Reviewing', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'planned', label: 'Planned', color: 'bg-purple-100 text-purple-800' },
    { value: 'implemented', label: 'Implemented', color: 'bg-green-100 text-green-800' },
    { value: 'declined', label: 'Declined', color: 'bg-red-100 text-red-800' },
];
function SuggestionReplyModal({ suggestion, isOpen, onClose, onSave, adminApiPath = '/api/admin/suggestions', primaryColor = '#0d9488', }) {
    const [status, setStatus] = (0, react_1.useState)(suggestion.status);
    const [adminReply, setAdminReply] = (0, react_1.useState)('');
    const [isSaving, setIsSaving] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const prevReplyCountRef = (0, react_1.useRef)(0);
    const [animateNewReply, setAnimateNewReply] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (suggestion) {
            setStatus(suggestion.status);
            setAdminReply('');
            setError(null);
        }
    }, [suggestion]);
    (0, react_1.useEffect)(() => {
        const replies = (0, parse_replies_1.parseReplies)(suggestion.adminReply);
        if (replies.length > prevReplyCountRef.current && prevReplyCountRef.current > 0) {
            setAnimateNewReply(true);
            setTimeout(() => setAnimateNewReply(false), 600);
        }
        prevReplyCountRef.current = replies.length;
    }, [suggestion.adminReply]);
    if (!isOpen)
        return null;
    const handleStatusUpdate = async () => {
        setError(null);
        setIsSaving(true);
        try {
            const response = await fetch(adminApiPath, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: suggestion.id, status }),
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || 'Failed to update status');
            onSave(data.suggestion);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update status');
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleSendReply = async () => {
        if (!adminReply.trim()) {
            setError('Reply cannot be empty');
            return;
        }
        setError(null);
        setIsSaving(true);
        try {
            const response = await fetch(adminApiPath, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: suggestion.id, adminReply: adminReply.trim() }),
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || 'Failed to send reply');
            onSave({
                ...suggestion,
                adminReply: data.suggestion.adminReply,
                repliedAt: data.suggestion.repliedAt,
            });
            setAdminReply('');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reply');
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleDeleteReply = async (indexToDelete) => {
        if (!confirm('Are you sure you want to delete this reply?'))
            return;
        try {
            const replies = (0, parse_replies_1.parseReplies)(suggestion.adminReply);
            replies.splice(indexToDelete, 1);
            replies.reverse();
            const updatedText = replies.length > 0
                ? replies.map((r) => `[REPLY_DELIMITER]\n[${r.timestamp}] ${r.content}`).join('\n')
                : '';
            const response = await fetch(adminApiPath, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: suggestion.id, adminReply: updatedText, replaceMode: true }),
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || 'Failed to delete reply');
            onSave({
                ...suggestion,
                adminReply: data.suggestion.adminReply,
                repliedAt: data.suggestion.repliedAt,
            });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete reply');
        }
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black/50 z-[1001]", onClick: onClose }), (0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-[1002] flex items-center justify-center p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Review Suggestion" }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { d: "M6 18L18 6M6 6l12 12" }) }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-xs font-medium text-gray-500 uppercase", children: ["Suggestion #", suggestion.id] }), (0, jsx_runtime_1.jsx)("div", { className: "mt-2 mb-2", children: (0, jsx_runtime_1.jsx)("span", { className: "inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", children: suggestion.type }) }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2", children: suggestion.title }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3", children: suggestion.description }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "From:" }), " ", suggestion.userEmail] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Submitted:" }), " ", new Date(suggestion.createdAt).toLocaleDateString()] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-8 border-b border-gray-200 dark:border-gray-700 pb-6", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Status Update" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:outline-none", children: STATUS_OPTIONS.map((opt) => ((0, jsx_runtime_1.jsx)("option", { value: opt.value, children: opt.label }, opt.value))) }), (0, jsx_runtime_1.jsx)("button", { onClick: handleStatusUpdate, disabled: isSaving || status === suggestion.status, className: "px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap", children: isSaving ? 'Updating...' : 'Update Status' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Admin Reply" }), suggestion.adminReply && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 mb-4", children: [(0, jsx_runtime_1.jsxs)("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300", children: ["Reply History (", (0, parse_replies_1.parseReplies)(suggestion.adminReply).length, ")"] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: (0, parse_replies_1.parseReplies)(suggestion.adminReply).map((reply, index) => ((0, jsx_runtime_1.jsx)("div", { className: `bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 relative ${index === 0 && animateNewReply ? 'suggestions-slide-in' : ''}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xs text-gray-500 mb-1", children: reply.timestamp }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap", children: reply.content })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDeleteReply(index), className: "ml-2 text-red-500 hover:text-red-700 transition-colors", title: "Delete reply", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }) }, index))) })] })), (0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: suggestion.adminReply ? 'Add New Reply' : 'Add Reply' }), (0, jsx_runtime_1.jsx)("textarea", { value: adminReply, onChange: (e) => setAdminReply(e.target.value), rows: 6, placeholder: "Type a new reply...", className: "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:outline-none resize-y mb-3" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSendReply, disabled: isSaving || !adminReply.trim(), className: "w-full px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed", style: { backgroundColor: primaryColor }, children: isSaving ? 'Sending...' : 'Send Reply' })] }), error && ((0, jsx_runtime_1.jsx)("div", { className: "mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-red-800 dark:text-red-400", children: error }) })), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700", children: (0, jsx_runtime_1.jsx)("button", { onClick: onClose, disabled: isSaving, className: "px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50", children: "Close" }) })] })] }) }), (0, jsx_runtime_1.jsx)("style", { children: `
        @keyframes suggestions-slide-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .suggestions-slide-in { animation: suggestions-slide-in 0.6s ease-out; }
      ` })] }));
}
