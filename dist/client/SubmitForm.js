"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitForm = SubmitForm;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const types_1 = require("../lib/types");
function interpolate(template, vars) {
    return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}
function SubmitForm({ onSuccess, isAuthenticated, apiBasePath = '/api/suggestions', primaryColor = '#0d9488', labels: labelOverrides, loginComponent, authHeader, mode = 'suggestion', entityType, entityId, entityLabel, }) {
    const labels = { ...types_1.DEFAULT_LABELS, ...labelOverrides };
    const [title, setTitle] = (0, react_1.useState)('');
    const [type, setType] = (0, react_1.useState)(mode);
    const [description, setDescription] = (0, react_1.useState)('');
    const [screenshot, setScreenshot] = (0, react_1.useState)(null);
    const [status, setStatus] = (0, react_1.useState)({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const isBugMode = mode === 'bug';
    if (!isAuthenticated) {
        return loginComponent ? (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: loginComponent }) : ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8 text-gray-500 dark:text-gray-400", children: (0, jsx_runtime_1.jsx)("p", { children: labels.loginRequired }) }));
    }
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setStatus({ type: 'error', message: 'Invalid file type. Only PNG, JPEG, GIF, and WebP are allowed.' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setStatus({ type: 'error', message: 'File too large. Max size: 5MB.' });
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setScreenshot(reader.result);
        };
        reader.readAsDataURL(file);
    };
    const handlePaste = (e) => {
        if (!isBugMode)
            return;
        const items = Array.from(e.clipboardData.items);
        const imageItem = items.find((item) => item.type.startsWith('image/'));
        if (!imageItem)
            return;
        e.preventDefault();
        const file = imageItem.getAsFile();
        if (!file)
            return;
        if (file.size > 5 * 1024 * 1024) {
            setStatus({ type: 'error', message: 'File too large. Max size: 5MB.' });
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setScreenshot(reader.result);
        };
        reader.readAsDataURL(file);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setStatus({ type: 'error', message: labels.titleRequired || '' });
            return;
        }
        if (description.trim().length < 100) {
            setStatus({
                type: 'error',
                message: interpolate(labels.descriptionTooShort || '', { min: 100 }),
            });
            return;
        }
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (authHeader)
                headers['Authorization'] = authHeader;
            const payload = { type, title, description };
            if (isBugMode && entityType && entityId && entityLabel) {
                payload.entity_type = entityType;
                payload.entity_id = entityId;
                payload.entity_label = entityLabel;
                payload.category = 'bug';
            }
            if (screenshot) {
                payload.screenshot = screenshot;
            }
            const response = await fetch(apiBasePath, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorCode = data.error;
                let errorMessage = labels.submitFailed || '';
                if (errorCode === 'RATE_LIMIT_EXCEEDED' && data.data) {
                    errorMessage = `Rate limit exceeded. Try again in ${data.data.minutesRemaining} minutes.`;
                }
                else if (errorCode === 'TITLE_TOO_LONG') {
                    errorMessage = `Title too long (max ${data.data?.maxLength || 255}).`;
                }
                else if (errorCode === 'DESCRIPTION_TOO_LONG') {
                    errorMessage = `Description too long (max ${data.data?.maxLength || 5000}).`;
                }
                setStatus({ type: 'error', message: errorMessage });
                return;
            }
            setStatus({ type: 'success', message: labels.submitted || '' });
            setTitle('');
            setType('suggestion');
            setDescription('');
            setScreenshot(null);
            setTimeout(() => onSuccess(), 1500);
        }
        catch {
            setStatus({ type: 'error', message: labels.submitFailed || '' });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("form", { className: "space-y-4", onSubmit: handleSubmit, onPaste: handlePaste, children: [isBugMode && entityLabel && ((0, jsx_runtime_1.jsx)("div", { className: "p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 text-sm", children: (0, jsx_runtime_1.jsxs)("span", { className: "font-medium", children: ["\uD83D\uDC1B ", entityLabel] }) })), !isBugMode && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2", children: labels.typeLabel }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setType('suggestion'), className: [
                                    'flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors cursor-pointer',
                                    type === 'suggestion'
                                        ? 'text-white'
                                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800',
                                ].join(' '), style: type === 'suggestion' ? { backgroundColor: primaryColor } : undefined, children: labels.typeSuggestion }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setType('bug'), className: [
                                    'flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors cursor-pointer',
                                    type === 'bug'
                                        ? 'text-white'
                                        : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800',
                                ].join(' '), style: type === 'bug' ? { backgroundColor: primaryColor } : undefined, children: labels.typeBug })] })] })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "suggestions-title", className: "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2", children: labels.titleLabel }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "suggestions-title", value: title, onChange: (e) => setTitle(e.target.value), maxLength: 255, required: true, placeholder: labels.titlePlaceholder, disabled: isSubmitting, className: "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:outline-none disabled:opacity-50", style: { '--tw-ring-color': primaryColor } }), (0, jsx_runtime_1.jsx)("p", { className: `text-xs mt-2 ${title.length > 235 ? 'text-red-500 font-medium' : 'text-gray-400'}`, children: interpolate(labels.charactersCount || '', { count: title.length, max: 255 }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "suggestions-description", className: "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2", children: labels.descriptionLabel }), (0, jsx_runtime_1.jsx)("textarea", { id: "suggestions-description", value: description, onChange: (e) => setDescription(e.target.value), placeholder: labels.descriptionPlaceholder, rows: 6, minLength: 100, maxLength: 1000, disabled: isSubmitting, required: true, className: "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:outline-none disabled:opacity-50 resize-y", style: { '--tw-ring-color': primaryColor } }), description.length < 100 ? ((0, jsx_runtime_1.jsx)("div", { className: "mt-2 text-sm text-gray-400", children: interpolate(labels.charactersMinimum || '', { count: description.length, min: 100 }) })) : ((0, jsx_runtime_1.jsx)("div", { className: `mt-2 text-sm ${description.length > 950 ? 'text-red-500 font-medium' : 'text-gray-400'}`, children: interpolate(labels.charactersCount || '', { count: description.length, max: 1000 }) }))] }), isBugMode && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2", children: "\u0421\u043D\u0438\u043C\u043A\u0430 \u043D\u0430 \u0435\u043A\u0440\u0430\u043D\u0430 (\u043F\u043E \u0438\u0437\u0431\u043E\u0440)" }), screenshot ? ((0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("img", { src: screenshot, alt: "Screenshot preview", className: "w-full rounded-lg border border-gray-300 dark:border-gray-600" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setScreenshot(null), className: "absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", viewBox: "0 0 24 24", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { d: "M6 18L18 6M6 6l12 12" }) }) })] })) : ((0, jsx_runtime_1.jsxs)("label", { className: "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex flex-col items-center justify-center pt-5 pb-6", children: (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "\u041D\u0430\u0442\u0438\u0441\u043D\u0435\u0442\u0435 \u0442\u0443\u043A \u0437\u0430 \u043A\u0430\u0447\u0432\u0430\u043D\u0435 \u0438\u043B\u0438 \u043F\u043E\u0441\u0442\u0430\u0432\u0435\u0442\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 (Ctrl+V)" }) }), (0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/png,image/jpeg,image/gif,image/webp", onChange: handleFileUpload, className: "hidden" })] }))] })), status.message && ((0, jsx_runtime_1.jsx)("div", { className: `p-3 rounded-lg ${status.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                    : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`, children: status.message })), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "w-full text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed", style: { backgroundColor: isSubmitting || !title.trim() || description.trim().length < 100 ? undefined : primaryColor }, disabled: isSubmitting || !title.trim() || description.trim().length < 100, children: isSubmitting ? labels.submitting : labels.submit })] }));
}
