"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionsModal = SuggestionsModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const SubmitForm_1 = require("./SubmitForm");
const MySuggestions_1 = require("./MySuggestions");
const types_1 = require("../lib/types");
function SuggestionsModal({ isOpen, onClose, isAuthenticated, userId, isAdmin, apiBasePath = '/api/suggestions', primaryColor = '#0d9488', labels: labelOverrides, loginComponent, authHeader, mode = 'suggestion', entityType, entityId, entityLabel, }) {
    const labels = { ...types_1.DEFAULT_LABELS, ...labelOverrides };
    const [activeTab, setActiveTab] = (0, react_1.useState)('submit');
    if (!isOpen)
        return null;
    const activeTabStyle = {
        color: primaryColor,
        borderBottomColor: primaryColor,
        borderBottomWidth: '2px',
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black/50 z-[1001]", onClick: onClose }), (0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-[1002] flex items-center justify-center p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden", onClick: (e) => e.stopPropagation(), onKeyDown: (e) => {
                        if (e.key === 'Escape')
                            onClose();
                    }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 rounded-lg z-10", "aria-label": labels.closeModal, type: "button", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { d: "M6 18L18 6M6 6l12 12" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex border-b border-gray-200 dark:border-gray-700", role: "tablist", children: [(0, jsx_runtime_1.jsx)("button", { className: [
                                                'flex-1 px-6 py-3 font-medium transition-all cursor-pointer',
                                                activeTab === 'submit'
                                                    ? '-mb-[2px]'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                                            ].join(' '), style: activeTab === 'submit' ? activeTabStyle : undefined, onClick: () => setActiveTab('submit'), role: "tab", "aria-selected": activeTab === 'submit', children: labels.submitNew }), (0, jsx_runtime_1.jsx)("button", { className: [
                                                'flex-1 px-6 py-3 font-medium transition-all cursor-pointer',
                                                activeTab === 'my-suggestions'
                                                    ? '-mb-[2px]'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                                            ].join(' '), style: activeTab === 'my-suggestions' ? activeTabStyle : undefined, onClick: () => setActiveTab('my-suggestions'), role: "tab", "aria-selected": activeTab === 'my-suggestions', children: labels.mySuggestions })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 overflow-y-auto p-6", children: [activeTab === 'submit' && ((0, jsx_runtime_1.jsx)(SubmitForm_1.SubmitForm, { onSuccess: () => setActiveTab('my-suggestions'), isAuthenticated: isAuthenticated, userId: userId, isAdmin: isAdmin, apiBasePath: apiBasePath, primaryColor: primaryColor, labels: labels, loginComponent: loginComponent, authHeader: authHeader, mode: mode, entityType: entityType, entityId: entityId, entityLabel: entityLabel })), activeTab === 'my-suggestions' && ((0, jsx_runtime_1.jsx)(MySuggestions_1.MySuggestions, { isAuthenticated: isAuthenticated, userId: userId, apiBasePath: apiBasePath, primaryColor: primaryColor, labels: labels, authHeader: authHeader }))] })] }) })] }));
}
