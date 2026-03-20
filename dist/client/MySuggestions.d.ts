import type { SuggestionsLabels } from '../lib/types';
export interface MySuggestionsProps {
    isAuthenticated: boolean;
    userId?: string;
    apiBasePath?: string;
    primaryColor?: string;
    labels?: SuggestionsLabels;
    authHeader?: string;
}
export declare function MySuggestions({ isAuthenticated, apiBasePath, primaryColor, labels: labelOverrides, authHeader, }: MySuggestionsProps): import("react/jsx-runtime").JSX.Element;
