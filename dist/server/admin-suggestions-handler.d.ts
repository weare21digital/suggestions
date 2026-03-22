import { SuggestionService } from '../lib/suggestion-service';
/**
 * Helper to create Next.js App Router handlers for admin suggestions API.
 * Usage:
 *   import { createAdminSuggestionsHandler } from '@21digital/suggestions/server/admin-suggestions-handler';
 *   const handler = createAdminSuggestionsHandler(service, { getAdmin });
 *   export const GET = handler.GET;
 *   export const PUT = handler.PUT;
 */
export declare function createAdminSuggestionsHandler(service: SuggestionService, opts: {
    /** Extract admin user from request. Return null if not admin. */
    getAdmin: (request: Request) => Promise<{
        id: string;
    } | null>;
}): {
    GET: (request: Request) => Promise<Response>;
    PUT: (request: Request) => Promise<Response>;
};
