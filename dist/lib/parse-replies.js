"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReplies = parseReplies;
/**
 * Parse the adminReply string (delimited format) into structured reply objects.
 * Returns newest-first order.
 */
function parseReplies(adminReply) {
    if (!adminReply)
        return [];
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
        .filter(Boolean);
    return replies.reverse();
}
