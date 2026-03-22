import type { Suggestion, SuggestionStore, SuggestionsConfig, RateLimitResult } from './types';
export declare class SuggestionServiceError extends Error {
    code: string;
    data?: Record<string, unknown> | undefined;
    constructor(code: string, message: string, data?: Record<string, unknown> | undefined);
}
export declare const ERROR_CODES: {
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
    readonly INVALID_TYPE: "INVALID_TYPE";
    readonly TITLE_REQUIRED: "TITLE_REQUIRED";
    readonly TITLE_TOO_LONG: "TITLE_TOO_LONG";
    readonly DESCRIPTION_REQUIRED: "DESCRIPTION_REQUIRED";
    readonly DESCRIPTION_TOO_SHORT: "DESCRIPTION_TOO_SHORT";
    readonly DESCRIPTION_TOO_LONG: "DESCRIPTION_TOO_LONG";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly PERMISSION_DENIED: "PERMISSION_DENIED";
    readonly INVALID_STATUS: "INVALID_STATUS";
};
export declare class SuggestionService {
    private store;
    private config;
    constructor(store: SuggestionStore, config?: SuggestionsConfig);
    canSubmit(userId: string): Promise<RateLimitResult>;
    createSuggestion(userId: string, type: string, title: string, description: string, opts?: {
        skipRateLimit?: boolean;
        userEmail?: string;
        entityType?: string | null;
        entityId?: string | null;
        entityLabel?: string | null;
        category?: string | null;
        screenshot?: string | null;
    }): Promise<Suggestion>;
    getUserSuggestions(userId: string): Promise<Suggestion[]>;
    getSuggestionById(id: number, userId?: string): Promise<Suggestion>;
    updateStatus(id: number, status: string): Promise<Suggestion>;
    addReply(id: number, replyText: string): Promise<Suggestion>;
    replaceReplies(id: number, rawReplyText: string): Promise<Suggestion>;
    adminList(opts: {
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        suggestions: import("./types").SuggestionWithEmail[];
        pagination: {
            page: number;
            limit: number;
            totalCount: number;
            totalPages: number;
        };
    }>;
}
