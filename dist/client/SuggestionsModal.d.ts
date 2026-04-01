import React from 'react';
import type { SuggestionsLabels, ModalComponentType } from '../lib/types';
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
    /** Optional host-provided modal wrapper. Replaces the built-in backdrop + modal chrome. */
    ModalComponent?: ModalComponentType;
}
export declare function SuggestionsModal({ isOpen, onClose, isAuthenticated, userId, isAdmin, apiBasePath, primaryColor, labels: labelOverrides, loginComponent, authHeader, mode, entityType, entityId, entityLabel, ModalComponent, }: SuggestionsModalProps): import("react/jsx-runtime").JSX.Element | null;
