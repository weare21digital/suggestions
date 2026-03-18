import { SuggestionService, SuggestionServiceError, ERROR_CODES } from '../lib/suggestion-service';
import { validateScreenshot } from '../lib/screenshot-validation';

/**
 * Helper to create Next.js App Router handlers for user-facing suggestions API.
 * Usage:
 *   import { createSuggestionsHandler } from '@21digital/suggestions/server/suggestions-handler';
 *   const handler = createSuggestionsHandler(service, { getUser });
 *   export const GET = handler.GET;
 *   export const POST = handler.POST;
 */
export function createSuggestionsHandler(
  service: SuggestionService,
  opts: {
    /** Extract user from request. Return null if not authenticated. */
    getUser: (request: Request) => Promise<{
      id: string;
      email?: string;
      isAdmin?: boolean;
    } | null>;
  }
) {
  const { getUser } = opts;

  async function GET(request: Request): Promise<Response> {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      const suggestions = await service.getUserSuggestions(user.id);
      return Response.json(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return Response.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }
  }

  async function POST(request: Request): Promise<Response> {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      const { type, title, description, entityType, entityId, entityLabel, category, screenshot } = await request.json();
      if (!type || !title || !description) {
        return Response.json({ error: 'Type, title, and description are required' }, { status: 400 });
      }

      // Validate screenshot if provided
      if (screenshot) {
        const validation = validateScreenshot(screenshot);
        if (!validation.valid) {
          return Response.json({ error: validation.error }, { status: 400 });
        }
      }

      const suggestion = await service.createSuggestion(
        user.id,
        type,
        title,
        description,
        {
          skipRateLimit: user.isAdmin,
          userEmail: user.email,
          entityType,
          entityId,
          entityLabel,
          category,
          screenshot,
        }
      );

      return Response.json(suggestion, { status: 201 });
    } catch (error) {
      if (error instanceof SuggestionServiceError) {
        let statusCode = 400;
        if (error.code === ERROR_CODES.RATE_LIMIT_EXCEEDED) statusCode = 429;
        else if (error.code === ERROR_CODES.PERMISSION_DENIED) statusCode = 403;
        else if (error.code === ERROR_CODES.NOT_FOUND) statusCode = 404;

        return Response.json({ error: error.code, data: error.data }, { status: statusCode });
      }
      console.error('Error creating suggestion:', error);
      return Response.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
    }
  }

  return { GET, POST };
}
