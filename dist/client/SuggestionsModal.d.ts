import React from 'react';
import type { SuggestionsLabels } from '../lib/types';
export interface SuggestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isAuthenticated: boolean;
    userId?: string;
    isAdmin?: boolean;
    apiBasePath?: string;
    primaryColor?: string;
    glowColor?: string;
    labels?: SuggestionsLabels;
    loginComponent?: React.ReactNode;
    authHeader?: string;
    mode?: 'suggestion' | 'bug';
    entityType?: string;
    entityId?: string;
    entityLabel?: string;
}
export declare function SuggestionsModal({ isOpen, onClose, isAuthenticated, userId, isAdmin, apiBasePath, primaryColor, labels: labelOverrides, loginComponent, authHeader, mode, entityType, entityId, entityLabel, }: SuggestionsModalProps): import("react/jsx-runtime").JSX.Element | null;
