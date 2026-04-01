import type React from 'react';
/** Props that a host-provided modal wrapper must accept. */
export interface ModalComponentProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}
/** A React component that wraps modal content with its own backdrop + chrome. */
export type ModalComponentType = React.ComponentType<ModalComponentProps>;
export type SuggestionType = 'suggestion' | 'bug';
export type SuggestionStatus = 'open' | 'reviewing' | 'planned' | 'implemented' | 'declined';
export interface Suggestion {
    id: number;
    userId: string;
    type: SuggestionType;
    title: string;
    description: string;
    status: SuggestionStatus;
    adminReply: string | null;
    repliedAt: Date | string | null;
    createdAt: Date | string;
    entityType?: string | null;
    entityId?: string | null;
    entityLabel?: string | null;
    category?: string | null;
    screenshot?: string | null;
}
export interface SuggestionWithEmail extends Suggestion {
    userEmail: string;
}
export interface ParsedReply {
    timestamp: string;
    content: string;
}
export interface RateLimitResult {
    canSubmit: boolean;
    cooldownEndsAt: Date | null;
    minutesRemaining: number;
}
export interface PaginationInfo {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
}
export interface AdminListResponse {
    suggestions: SuggestionWithEmail[];
    pagination: PaginationInfo;
}
/**
 * Store interface — host app implements this with their DB (Prisma, Drizzle, etc.)
 */
export interface SuggestionStore {
    /** Create a new suggestion. Returns the created record. */
    create(data: {
        userId: string;
        type: SuggestionType;
        title: string;
        description: string;
        status: SuggestionStatus;
        entityType?: string | null;
        entityId?: string | null;
        entityLabel?: string | null;
        category?: string | null;
        screenshot?: string | null;
    }): Promise<Suggestion>;
    /** Find the most recent open suggestion by user (for rate limiting). */
    findMostRecentOpen(userId: string): Promise<Suggestion | null>;
    /** Count submissions by user within a time window (for rolling window rate limiting). */
    countRecentSubmissions(userId: string, sinceDate: Date): Promise<number>;
    /** Get all suggestions for a user, ordered by createdAt desc. */
    findByUser(userId: string): Promise<Suggestion[]>;
    /** Find suggestion by ID. */
    findById(id: number): Promise<Suggestion | null>;
    /** Update a suggestion. Returns the updated record. */
    update(id: number, data: Partial<Pick<Suggestion, 'status' | 'adminReply' | 'repliedAt'>>): Promise<Suggestion>;
    /** Admin list with filtering, search, pagination. Returns suggestions with user email. */
    findAll(opts: {
        status?: string;
        search?: string;
        page: number;
        limit: number;
    }): Promise<{
        suggestions: SuggestionWithEmail[];
        totalCount: number;
    }>;
}
/**
 * Configuration for the suggestions system.
 */
export interface SuggestionsConfig {
    /** DEPRECATED: Use rateLimit.maxPerWindow + rateLimit.windowHours instead. Legacy rate limit cooldown in hours. Default: 1 */
    rateLimitHours?: number;
    /** Rate limit configuration (rolling window + minimum gap) */
    rateLimit?: {
        /** Max submissions per rolling window. Default: 5 */
        maxPerWindow?: number;
        /** Rolling window in hours. Default: 24 */
        windowHours?: number;
        /** Minimum gap between any two submissions in minutes. Default: 0 */
        minGapMinutes?: number;
    };
    /** Max title length. Default: 255 */
    maxTitleLength?: number;
    /** Max description length. Default: 5000 */
    maxDescriptionLength?: number;
    /** Min description length. Default: 100 */
    minDescriptionLength?: number;
    /** Valid suggestion types. Default: ['suggestion', 'bug'] */
    types?: SuggestionType[];
    /** Valid statuses. Default: all SuggestionStatus values */
    statuses?: SuggestionStatus[];
    /** Callback when a new suggestion is created */
    onNewSuggestion?: (suggestion: Suggestion, userEmail?: string) => void;
    /** Callback when status changes */
    onStatusChange?: (suggestion: Suggestion, oldStatus: SuggestionStatus, newStatus: SuggestionStatus) => void;
}
/**
 * Labels for i18n — host app provides these. Sensible defaults included.
 */
export interface SuggestionsLabels {
    fabAriaLabel?: string;
    fabTitle?: string;
    closeModal?: string;
    submitNew?: string;
    mySuggestions?: string;
    typeLabel?: string;
    typeSuggestion?: string;
    typeBug?: string;
    titleLabel?: string;
    titlePlaceholder?: string;
    descriptionLabel?: string;
    descriptionPlaceholder?: string;
    submit?: string;
    submitting?: string;
    submitted?: string;
    loginRequired?: string;
    titleRequired?: string;
    descriptionTooShort?: string;
    submitFailed?: string;
    loadFailed?: string;
    noSuggestions?: string;
    noSuggestionsSubtext?: string;
    loginToView?: string;
    previous?: string;
    next?: string;
    adminReplies?: string;
    charactersCount?: string;
    charactersMinimum?: string;
    submittedOn?: string;
    page?: string;
}
export declare const DEFAULT_LABELS: Required<SuggestionsLabels>;
export declare const DEFAULT_CONFIG: Required<Omit<SuggestionsConfig, 'rateLimitHours'>>;
