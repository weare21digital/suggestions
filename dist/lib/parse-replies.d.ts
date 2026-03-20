import type { ParsedReply } from './types';
/**
 * Parse the adminReply string (delimited format) into structured reply objects.
 * Returns newest-first order.
 */
export declare function parseReplies(adminReply: string | null): ParsedReply[];
