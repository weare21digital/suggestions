"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.BugReportButton = BugReportButton;
const jsx_runtime_1 = require("react/jsx-runtime");
const SuggestionsProvider_1 = require("./SuggestionsProvider");
function BugReportButton({ entityType, entityId, entityLabel, className, children, }) {
    const { openModal } = (0, SuggestionsProvider_1.useSuggestionsModal)();
    return ((0, jsx_runtime_1.jsx)("button", { onClick: () => openModal({ mode: 'bug', entityType, entityId, entityLabel }), className: className || "inline-flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-200 group", title: "\u0414\u043E\u043A\u043B\u0430\u0434\u0432\u0430\u0439 \u0431\u044A\u0433", "aria-label": "\u0414\u043E\u043A\u043B\u0430\u0434\u0432\u0430\u0439 \u0431\u044A\u0433", type: "button", children: children || (0, jsx_runtime_1.jsx)("span", { className: "text-lg group-hover:scale-110 transition-transform", children: "\uD83D\uDC1B" }) }));
}
