"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionService = exports.ERROR_CODES = exports.SuggestionServiceError = void 0;
class SuggestionServiceError extends Error {
    constructor(code, message, data) {
        super(message);
        this.code = code;
        this.data = data;
        this.name = 'SuggestionServiceError';
    }
}
exports.SuggestionServiceError = SuggestionServiceError;
exports.ERROR_CODES = {
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INVALID_TYPE: 'INVALID_TYPE',
    TITLE_REQUIRED: 'TITLE_REQUIRED',
    TITLE_TOO_LONG: 'TITLE_TOO_LONG',
    DESCRIPTION_REQUIRED: 'DESCRIPTION_REQUIRED',
    DESCRIPTION_TOO_SHORT: 'DESCRIPTION_TOO_SHORT',
    DESCRIPTION_TOO_LONG: 'DESCRIPTION_TOO_LONG',
    NOT_FOUND: 'NOT_FOUND',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    INVALID_STATUS: 'INVALID_STATUS',
};
class SuggestionService {
    constructor(store, config) {
        this.store = store;
        // Handle legacy rateLimitHours config (backwards compat)
        let rateLimit;
        if (config?.rateLimit) {
            rateLimit = {
                maxPerWindow: config.rateLimit.maxPerWindow ?? 5,
                windowHours: config.rateLimit.windowHours ?? 24,
                minGapMinutes: config.rateLimit.minGapMinutes ?? 0,
            };
        }
        else if (config?.rateLimitHours) {
            // Legacy rateLimitHours: convert to new format
            rateLimit = {
                maxPerWindow: 1,
                windowHours: config.rateLimitHours,
                minGapMinutes: 0,
            };
        }
        else {
            // Default
            rateLimit = {
                maxPerWindow: 5,
                windowHours: 24,
                minGapMinutes: 0,
            };
        }
        this.config = {
            rateLimit,
            maxTitleLength: config?.maxTitleLength ?? 255,
            maxDescriptionLength: config?.maxDescriptionLength ?? 5000,
            minDescriptionLength: config?.minDescriptionLength ?? 100,
            types: config?.types ?? ['suggestion', 'bug'],
            statuses: config?.statuses ?? [
                'open',
                'reviewing',
                'planned',
                'implemented',
                'declined',
            ],
            onNewSuggestion: config?.onNewSuggestion ?? (() => { }),
            onStatusChange: config?.onStatusChange ?? (() => { }),
        };
    }
    async canSubmit(userId) {
        const { maxPerWindow, windowHours, minGapMinutes } = this.config.rateLimit;
        // Check 1: Minimum gap between submissions (if configured)
        if (minGapMinutes > 0) {
            const recent = await this.store.findMostRecentOpen(userId);
            if (recent) {
                const createdAt = typeof recent.createdAt === 'string'
                    ? new Date(recent.createdAt)
                    : recent.createdAt;
                const minutesSince = (Date.now() - createdAt.getTime()) / (1000 * 60);
                if (minutesSince < minGapMinutes) {
                    const cooldownEndsAt = new Date(createdAt.getTime() + minGapMinutes * 60 * 1000);
                    const minutesRemaining = Math.ceil((cooldownEndsAt.getTime() - Date.now()) / (1000 * 60));
                    return { canSubmit: false, cooldownEndsAt, minutesRemaining };
                }
            }
        }
        // Check 2: Rolling window limit (maxPerWindow per windowHours)
        const windowStart = new Date(Date.now() - windowHours * 60 * 60 * 1000);
        const countInWindow = await this.store.countRecentSubmissions(userId, windowStart);
        if (countInWindow >= maxPerWindow) {
            // Find the oldest submission in the window to calculate when the limit resets
            // We'll estimate based on the window — the limit resets when the oldest submission falls out
            const cooldownEndsAt = new Date(Date.now() + 60 * 60 * 1000); // Estimate: 1 hour from now
            const minutesRemaining = Math.ceil((cooldownEndsAt.getTime() - Date.now()) / (1000 * 60));
            return { canSubmit: false, cooldownEndsAt, minutesRemaining };
        }
        return { canSubmit: true, cooldownEndsAt: null, minutesRemaining: 0 };
    }
    async createSuggestion(userId, type, title, description, opts) {
        // Validate type
        if (!this.config.types.includes(type)) {
            throw new SuggestionServiceError(exports.ERROR_CODES.INVALID_TYPE, `Invalid type: ${type}`);
        }
        // Validate title
        if (!title || title.trim().length === 0) {
            throw new SuggestionServiceError(exports.ERROR_CODES.TITLE_REQUIRED, 'Title is required');
        }
        if (title.length > this.config.maxTitleLength) {
            throw new SuggestionServiceError(exports.ERROR_CODES.TITLE_TOO_LONG, 'Title too long', { maxLength: this.config.maxTitleLength });
        }
        // Validate description
        if (!description || description.trim().length === 0) {
            throw new SuggestionServiceError(exports.ERROR_CODES.DESCRIPTION_REQUIRED, 'Description is required');
        }
        if (description.trim().length < this.config.minDescriptionLength) {
            throw new SuggestionServiceError(exports.ERROR_CODES.DESCRIPTION_TOO_SHORT, 'Description too short', { minLength: this.config.minDescriptionLength });
        }
        if (description.length > this.config.maxDescriptionLength) {
            throw new SuggestionServiceError(exports.ERROR_CODES.DESCRIPTION_TOO_LONG, 'Description too long', { maxLength: this.config.maxDescriptionLength });
        }
        // Rate limit check
        if (!opts?.skipRateLimit) {
            const rateCheck = await this.canSubmit(userId);
            if (!rateCheck.canSubmit) {
                throw new SuggestionServiceError(exports.ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Rate limit exceeded', { minutesRemaining: rateCheck.minutesRemaining });
            }
        }
        const suggestion = await this.store.create({
            userId,
            type: type,
            title: title.trim(),
            description: description.trim(),
            status: 'open',
            entityType: opts?.entityType,
            entityId: opts?.entityId,
            entityLabel: opts?.entityLabel,
            category: opts?.category,
            screenshot: opts?.screenshot,
        });
        // Fire callback (non-blocking)
        try {
            this.config.onNewSuggestion(suggestion, opts?.userEmail);
        }
        catch (e) {
            console.error('[SuggestionService] onNewSuggestion callback error:', e);
        }
        return suggestion;
    }
    async getUserSuggestions(userId) {
        return this.store.findByUser(userId);
    }
    async getSuggestionById(id, userId) {
        const suggestion = await this.store.findById(id);
        if (!suggestion) {
            throw new SuggestionServiceError(exports.ERROR_CODES.NOT_FOUND, 'Suggestion not found');
        }
        if (userId && suggestion.userId !== userId) {
            throw new SuggestionServiceError(exports.ERROR_CODES.PERMISSION_DENIED, 'Permission denied');
        }
        return suggestion;
    }
    async updateStatus(id, status) {
        if (!this.config.statuses.includes(status)) {
            throw new SuggestionServiceError(exports.ERROR_CODES.INVALID_STATUS, `Invalid status: ${status}`);
        }
        const existing = await this.store.findById(id);
        if (!existing) {
            throw new SuggestionServiceError(exports.ERROR_CODES.NOT_FOUND, 'Suggestion not found');
        }
        const oldStatus = existing.status;
        const updated = await this.store.update(id, {
            status: status,
        });
        // Fire callback (non-blocking)
        try {
            this.config.onStatusChange(updated, oldStatus, status);
        }
        catch (e) {
            console.error('[SuggestionService] onStatusChange callback error:', e);
        }
        return updated;
    }
    async addReply(id, replyText) {
        if (!replyText || !replyText.trim()) {
            throw new SuggestionServiceError(exports.ERROR_CODES.DESCRIPTION_REQUIRED, 'Reply cannot be empty');
        }
        const existing = await this.store.findById(id);
        if (!existing) {
            throw new SuggestionServiceError(exports.ERROR_CODES.NOT_FOUND, 'Suggestion not found');
        }
        const now = new Date();
        const timestamp = now.toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        const formattedReply = `[REPLY_DELIMITER]\n[${timestamp}] ${replyText.trim()}`;
        const newAdminReply = existing.adminReply
            ? existing.adminReply + '\n' + formattedReply
            : formattedReply;
        return this.store.update(id, {
            adminReply: newAdminReply,
            repliedAt: now,
        });
    }
    async replaceReplies(id, rawReplyText) {
        const existing = await this.store.findById(id);
        if (!existing) {
            throw new SuggestionServiceError(exports.ERROR_CODES.NOT_FOUND, 'Suggestion not found');
        }
        return this.store.update(id, {
            adminReply: rawReplyText.trim() || null,
            repliedAt: rawReplyText.trim() ? new Date() : null,
        });
    }
    async adminList(opts) {
        const page = opts.page ?? 1;
        const limit = opts.limit ?? 20;
        const { suggestions, totalCount } = await this.store.findAll({
            status: opts.status,
            search: opts.search,
            page,
            limit,
        });
        return {
            suggestions,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        };
    }
}
exports.SuggestionService = SuggestionService;
