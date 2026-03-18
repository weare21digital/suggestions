'use client';

import React, { useState, useEffect, useRef } from 'react';
import { parseReplies } from '../lib/parse-replies';
import type { Suggestion, SuggestionsLabels } from '../lib/types';
import { DEFAULT_LABELS } from '../lib/types';

export interface MySuggestionsProps {
  isAuthenticated: boolean;
  userId?: string;
  apiBasePath?: string;
  primaryColor?: string;
  labels?: SuggestionsLabels;
  authHeader?: string;
}

function interpolate(template: string, vars: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-green-900/30 text-green-400 border border-green-700',
  pending: 'bg-gray-800/30 text-gray-400 border border-gray-600',
  reviewing: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  planned: 'bg-purple-900/30 text-purple-400 border border-purple-700',
  implemented: 'bg-green-900/30 text-green-400 border border-green-700',
  declined: 'bg-red-900/30 text-red-400 border border-red-700',
};

const TYPE_BADGE: Record<string, string> = {
  bug: 'bg-red-900/30 text-red-400 border border-red-700',
  suggestion: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  feature: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  improvement: 'bg-orange-900/30 text-orange-400 border border-orange-700',
};

const DEFAULT_BADGE = 'bg-gray-800/30 text-gray-400 border border-gray-600';

export function MySuggestions({
  isAuthenticated,
  apiBasePath = '/api/suggestions',
  primaryColor = '#0d9488',
  labels: labelOverrides,
  authHeader,
}: MySuggestionsProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const loadingStartTime = useRef<number>(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (isAuthenticated) {
      fetchSuggestions();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError('');
    loadingStartTime.current = Date.now();

    try {
      const headers: Record<string, string> = {};
      if (authHeader) headers['Authorization'] = authHeader;

      const response = await fetch(apiBasePath, { headers });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();

      const elapsed = Date.now() - loadingStartTime.current;
      const remaining = Math.max(0, 300 - elapsed);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));

      setSuggestions(data || []);
    } catch {
      setError(labels.loadFailed || '');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>{labels.loginToView}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="mb-2">{labels.noSuggestions}</p>
        <p className="text-sm opacity-75">{labels.noSuggestionsSubtext}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(suggestions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentSuggestions = suggestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="space-y-4" role="list">
        {currentSuggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            role="listitem"
          >
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${TYPE_BADGE[suggestion.type] || DEFAULT_BADGE}`}>
                {suggestion.type}
              </span>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${STATUS_BADGE[suggestion.status] || DEFAULT_BADGE}`}>
                {suggestion.status}
              </span>
            </div>

            <div className="mb-3">
              {suggestion.title && (
                <h4 className="text-gray-900 dark:text-gray-100 font-semibold mb-1">{suggestion.title}</h4>
              )}
              <p className="text-gray-900 dark:text-gray-100 text-sm">{suggestion.description}</p>
            </div>

            {suggestion.adminReply && (
              <div className="border-l-4 pl-3 py-2 mt-3 rounded-r bg-gray-100 dark:bg-gray-700/30"
                style={{ borderLeftColor: primaryColor }}>
                <strong className="text-sm" style={{ color: primaryColor }}>
                  {interpolate(labels.adminReplies || '', { count: parseReplies(suggestion.adminReply).length })}
                </strong>
                <div className="space-y-2 mt-2">
                  {parseReplies(suggestion.adminReply).map((reply, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600">
                      <div className="text-xs text-gray-500 mb-1">{reply.timestamp}</div>
                      <p className="text-gray-900 dark:text-gray-100 text-sm whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500">
              <span>{interpolate(labels.submittedOn || '', { date: formatDate(suggestion.createdAt) })}</span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg font-medium transition-colors text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
            style={currentPage === 1 ? undefined : { backgroundColor: primaryColor }}
          >
            {labels.previous}
          </button>
          <span className="text-sm text-gray-500 font-medium">
            {interpolate(labels.page || '', { current: currentPage, total: totalPages })}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg font-medium transition-colors text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
            style={currentPage === totalPages ? undefined : { backgroundColor: primaryColor }}
          >
            {labels.next}
          </button>
        </div>
      )}
    </div>
  );
}
