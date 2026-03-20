import { SuggestionService } from '../lib/suggestion-service';
/**
 * Helper to create Next.js App Router handlers for user-facing suggestions API.
 * Usage:
 *   import { createSuggestionsHandler } from '@21digital/suggestions/server/suggestions-handler';
 *   const handler = createSuggestionsHandler(service, { getUser });
 *   export const GET = handler.GET;
 *   export const POST = handler.POST;
 */
export declare function createSuggestionsHandler(service: SuggestionService, opts: {
    /** Extract user from request. Return null if not authenticated. */
    getUser: (request: Request) => Promise<{
        id: string;
        email?: string;
        isAdmin?: boolean;
    } | null>;
}): {
    GET: (request: Request) => Promise<Response>;
    POST: (request: Request) => Promise<Response>;
};
