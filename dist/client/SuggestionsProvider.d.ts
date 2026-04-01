import React from 'react';
import type { SuggestionsLabels, ModalComponentType } from '../lib/types';
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
    /** Optional host-provided modal wrapper. When provided, replaces the built-in backdrop + modal chrome. */
    ModalComponent?: ModalComponentType;
}
export declare function SuggestionsProvider({ children, isAuthenticated, userId, isAdmin, apiBasePath, primaryColor, glowColor, labels: labelOverrides, loginComponent, authHeader, ModalComponent, }: SuggestionsProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useSuggestionsModal(): SuggestionsContextValue;
