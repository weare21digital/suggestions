import type { ParsedReply } from './types';

/**
 * Parse the adminReply string (delimited format) into structured reply objects.
 * Returns newest-first order.
 */
export function parseReplies(adminReply: string | null): ParsedReply[] {
  if (!adminReply) return [];

  const replies = adminReply
    .split('[REPLY_DELIMITER]')
    .filter((r) => r.trim())
    .map((reply) => {
      const match = reply.match(/\[(.+?)\]\s*([\s\S]*)/);
      if (match) {
        return {
          timestamp: match[1],
          content: match[2].trim(),
        };
      }
      return null;
    })
    .filter(Boolean) as ParsedReply[];

  return replies.reverse();
}
