import type { SuggestionWithEmail } from '../../lib/types';
export interface SuggestionReplyModalProps {
    suggestion: SuggestionWithEmail;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updated: SuggestionWithEmail) => void;
    /** Admin API base path. Default: '/api/admin/suggestions' */
    adminApiPath?: string;
    /** Primary accent color. Default: '#0d9488' */
    primaryColor?: string;
}
export declare function SuggestionReplyModal({ suggestion, isOpen, onClose, onSave, adminApiPath, primaryColor, }: SuggestionReplyModalProps): import("react/jsx-runtime").JSX.Element | null;
