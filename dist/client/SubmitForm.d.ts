import React from 'react';
import type { SuggestionsLabels } from '../lib/types';
export interface SubmitFormProps {
    onSuccess: () => void;
    isAuthenticated: boolean;
    userId?: string;
    isAdmin?: boolean;
    apiBasePath?: string;
    primaryColor?: string;
    labels?: SuggestionsLabels;
    loginComponent?: React.ReactNode;
    authHeader?: string;
    mode?: 'suggestion' | 'bug';
    entityType?: string;
    entityId?: string;
    entityLabel?: string;
}
export declare function SubmitForm({ onSuccess, isAuthenticated, apiBasePath, primaryColor, labels: labelOverrides, loginComponent, authHeader, mode, entityType, entityId, entityLabel, }: SubmitFormProps): import("react/jsx-runtime").JSX.Element;
