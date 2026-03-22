import React from 'react';
export interface BugReportButtonProps {
    entityType: string;
    entityId: string;
    entityLabel: string;
    /** @deprecated No longer used — auth is handled by SuggestionsProvider */
    isAuthenticated?: boolean;
    /** @deprecated No longer used — handled by SuggestionsProvider */
    userId?: string;
    /** @deprecated No longer used — handled by SuggestionsProvider */
    apiBasePath?: string;
    /** @deprecated No longer used — handled by SuggestionsProvider */
    primaryColor?: string;
    /** @deprecated No longer used — handled by SuggestionsProvider */
    authHeader?: string;
    /** @deprecated No longer used — handled by SuggestionsProvider */
    loginComponent?: React.ReactNode;
    /** Additional className for the button */
    className?: string;
    /** Override the button label/icon */
    children?: React.ReactNode;
}
export declare function BugReportButton({ entityType, entityId, entityLabel, className, children, }: BugReportButtonProps): import("react/jsx-runtime").JSX.Element;
