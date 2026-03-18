import { SuggestionService, SuggestionServiceError, ERROR_CODES } from '../lib/suggestion-service';

/**
 * Helper to create Next.js App Router handlers for admin suggestions API.
 * Usage:
 *   import { createAdminSuggestionsHandler } from '@21digital/suggestions/server/admin-suggestions-handler';
 *   const handler = createAdminSuggestionsHandler(service, { getAdmin });
 *   export const GET = handler.GET;
 *   export const PUT = handler.PUT;
 */
export function createAdminSuggestionsHandler(
  service: SuggestionService,
  opts: {
    /** Extract admin user from request. Return null if not admin. */
    getAdmin: (request: Request) => Promise<{ id: string } | null>;
  }
) {
  const { getAdmin } = opts;

  async function GET(request: Request): Promise<Response> {
    const admin = await getAdmin(request);
    if (!admin) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    try {
      const url = new URL(request.url);
      const status = url.searchParams.get('status') || undefined;
      const search = url.searchParams.get('search') || undefined;
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);

      const result = await service.adminList({
        status: status === 'all' ? undefined : status,
        search,
        page,
        limit,
      });

      return Response.json(result);
    } catch (error) {
      console.error('Error fetching admin suggestions:', error);
      return Response.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }
  }

  async function PUT(request: Request): Promise<Response> {
    const admin = await getAdmin(request);
    if (!admin) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const { id, status, adminReply, replaceMode } = body;

      if (!id || typeof id !== 'number') {
        return Response.json({ error: 'Valid suggestion ID is required' }, { status: 400 });
      }

      const hasStatus = status !== undefined && status !== null;
      const hasReply = adminReply !== undefined && adminReply !== null && adminReply.trim() !== '';

      if (!hasStatus && !hasReply) {
        return Response.json({ error: 'Either status or adminReply must be provided' }, { status: 400 });
      }

      let updated;

      if (hasStatus) {
        updated = await service.updateStatus(id, status);
      }

      if (hasReply) {
        if (replaceMode) {
          updated = await service.replaceReplies(id, adminReply);
        } else {
          updated = await service.addReply(id, adminReply.trim());
        }
      }

      return Response.json({ success: true, suggestion: updated });
    } catch (error) {
      if (error instanceof SuggestionServiceError) {
        let statusCode = 400;
        if (error.code === ERROR_CODES.NOT_FOUND) statusCode = 404;
        else if (error.code === ERROR_CODES.INVALID_STATUS) statusCode = 400;
        return Response.json({ error: error.code, data: error.data }, { status: statusCode });
      }
      console.error('Error updating suggestion:', error);
      return Response.json({ error: 'Failed to update suggestion' }, { status: 500 });
    }
  }

  return { GET, PUT };
}
