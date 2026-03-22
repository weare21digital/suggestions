import React from 'react';
import type { SuggestionsLabels } from '../lib/types';
export interface ModalOpenOptions {
    mode?: 'suggestion' | 'bug';
    entityType?: string;
    entityId?: string;
    entityLabel?: string;
}
export interface SuggestionsContextValue {
    openModal: (options?: ModalOpenOptions) => void;
    closeModal: () => void;
    isOpen: boolean;
}
export interface SuggestionsProviderProps {
    children: React.ReactNode;
    isAuthenticated: boolean;
    userId?: string;
    isAdmin?: boolean;
    apiBasePath?: string;
    primaryColor?: string;
    glowColor?: string;
    labels?: Partial<SuggestionsLabels>;
    loginComponent?: React.ReactNode;
    authHeader?: string;
}
export declare function SuggestionsProvider({ children, isAuthenticated, userId, isAdmin, apiBasePath, primaryColor, glowColor, labels: labelOverrides, loginComponent, authHeader, }: SuggestionsProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useSuggestionsModal(): SuggestionsContextValue;
