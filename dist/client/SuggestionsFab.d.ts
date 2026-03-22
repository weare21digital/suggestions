import React from 'react';
import type { SuggestionsLabels } from '../lib/types';
export interface SuggestionsFabProps {
    /** @deprecated No longer used — auth is handled by SuggestionsProvider */
    isAuthenticated?: boolean;
    /** @deprecated No longer used — handled by SuggestionsProvider */
    userId?: string;
    /** @deprecated No longer used — handled by SuggestionsProvider */
    isAdmin?: boolean;
    /** @deprecated No longer used — handled by SuggestionsProvider */
    apiBasePath?: string;
    /** Primary color for the FAB gradient (from). Default: '#0d9488' (teal) */
    primaryColor?: string;
    /** Secondary color for the FAB gradient (to). Default: '#0f766e' */
    secondaryColor?: string;
    /** Glow color rgba. Default: 'rgba(13, 148, 136, 0.4)' */
    glowColor?: string;
    /** Custom labels for i18n */
    labels?: Partial<SuggestionsLabels>;
    /** Jiggle interval in ms. Default: 30000 */
    jiggleInterval?: number;
    /** @deprecated No longer used — handled by SuggestionsProvider */
    loginComponent?: React.ReactNode;
    /** @deprecated No longer used — handled by SuggestionsProvider */
    authHeader?: string;
    /** Additional className for the FAB button */
    className?: string;
    /** Z-index for the FAB. Default: 1000 */
    zIndex?: number;
}
export declare function SuggestionsFab({ primaryColor, secondaryColor, glowColor, labels: labelOverrides, jiggleInterval, className, zIndex, }: SuggestionsFabProps): import("react/jsx-runtime").JSX.Element;
