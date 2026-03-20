"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionsProvider = SuggestionsProvider;
exports.useSuggestionsModal = useSuggestionsModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const SuggestionsModal_1 = require("./SuggestionsModal");
const types_1 = require("../lib/types");
const SuggestionsContext = (0, react_1.createContext)(null);
function SuggestionsProvider({ children, isAuthenticated, userId, isAdmin, apiBasePath = '/api/suggestions', primaryColor = '#0d9488', glowColor, labels: labelOverrides, loginComponent, authHeader, }) {
    const labels = { ...types_1.DEFAULT_LABELS, ...labelOverrides };
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [modalOptions, setModalOptions] = (0, react_1.useState)({});
    const openModal = (0, react_1.useCallback)((options) => {
        setModalOptions(options || {});
        setIsOpen(true);
    }, []);
    const closeModal = (0, react_1.useCallback)(() => {
        setIsOpen(false);
        setModalOptions({});
    }, []);
    return ((0, jsx_runtime_1.jsxs)(SuggestionsContext.Provider, { value: { openModal, closeModal, isOpen }, children: [children, (0, jsx_runtime_1.jsx)(SuggestionsModal_1.SuggestionsModal, { isOpen: isOpen, onClose: closeModal, isAuthenticated: isAuthenticated, userId: userId, isAdmin: isAdmin, apiBasePath: apiBasePath, primaryColor: primaryColor, glowColor: glowColor, labels: labels, loginComponent: loginComponent, authHeader: authHeader, mode: modalOptions.mode || 'suggestion', entityType: modalOptions.entityType, entityId: modalOptions.entityId, entityLabel: modalOptions.entityLabel })] }));
}
function useSuggestionsModal() {
    const context = (0, react_1.useContext)(SuggestionsContext);
    if (!context) {
        throw new Error('useSuggestionsModal must be used within a <SuggestionsProvider>');
    }
    return context;
}
