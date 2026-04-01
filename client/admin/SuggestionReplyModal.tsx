'use client';

import React, { useState, useEffect, useRef } from 'react';
import { parseReplies } from '../../lib/parse-replies';
import type { SuggestionWithEmail, SuggestionStatus, ModalComponentType } from '../../lib/types';

const STATUS_OPTIONS: { value: SuggestionStatus; label: string; color: string }[] = [
  { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800' },
  { value: 'reviewing', label: 'Reviewing', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'planned', label: 'Planned', color: 'bg-purple-100 text-purple-800' },
  { value: 'implemented', label: 'Implemented', color: 'bg-green-100 text-green-800' },
  { value: 'declined', label: 'Declined', color: 'bg-red-100 text-red-800' },
];

export interface SuggestionReplyModalProps {
  suggestion: SuggestionWithEmail;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: SuggestionWithEmail) => void;
  /** Admin API base path. Default: '/api/admin/suggestions' */
  adminApiPath?: string;
  /** Primary accent color. Default: '#0d9488' */
  primaryColor?: string;
  /** Optional host-provided modal wrapper. Replaces the built-in backdrop + modal chrome. */
  ModalComponent?: ModalComponentType;
}

export function SuggestionReplyModal({
  suggestion,
  isOpen,
  onClose,
  onSave,
  adminApiPath = '/api/admin/suggestions',
  primaryColor = '#0d9488',
  ModalComponent,
}: SuggestionReplyModalProps) {
  const [status, setStatus] = useState<SuggestionStatus>(suggestion.status);
  const [adminReply, setAdminReply] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevReplyCountRef = useRef(0);
  const [animateNewReply, setAnimateNewReply] = useState(false);

  useEffect(() => {
    if (suggestion) {
      setStatus(suggestion.status);
      setAdminReply('');
      setError(null);
    }
  }, [suggestion]);

  useEffect(() => {
    const replies = parseReplies(suggestion.adminReply);
    if (replies.length > prevReplyCountRef.current && prevReplyCountRef.current > 0) {
      setAnimateNewReply(true);
      setTimeout(() => setAnimateNewReply(false), 600);
    }
    prevReplyCountRef.current = replies.length;
  }, [suggestion.adminReply]);

  if (!isOpen && !ModalComponent) return null;

  const handleStatusUpdate = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const response = await fetch(adminApiPath, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: suggestion.id, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update status');
      onSave(data.suggestion);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendReply = async () => {
    if (!adminReply.trim()) {
      setError('Reply cannot be empty');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const response = await fetch(adminApiPath, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: suggestion.id, adminReply: adminReply.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send reply');
      onSave({
        ...suggestion,
        adminReply: data.suggestion.adminReply,
        repliedAt: data.suggestion.repliedAt,
      });
      setAdminReply('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReply = async (indexToDelete: number) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;
    try {
      const replies = parseReplies(suggestion.adminReply);
      replies.splice(indexToDelete, 1);
      replies.reverse();
      const updatedText = replies.length > 0
        ? replies.map((r) => `[REPLY_DELIMITER]\n[${r.timestamp}] ${r.content}`).join('\n')
        : '';
      const response = await fetch(adminApiPath, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: suggestion.id, adminReply: updatedText, replaceMode: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete reply');
      onSave({
        ...suggestion,
        adminReply: data.suggestion.adminReply,
        repliedAt: data.suggestion.repliedAt,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete reply');
    }
  };

  const replyContent = (
    <>
      {/* Header — only when using built-in modal */}
      {!ModalComponent && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Review Suggestion</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="p-6">
            {/* Suggestion Details */}
            <div className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <span className="text-xs font-medium text-gray-500 uppercase">Suggestion #{suggestion.id}</span>
              <div className="mt-2 mb-2">
                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {suggestion.type}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{suggestion.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">{suggestion.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div><span className="font-medium">From:</span> {suggestion.userEmail}</div>
                <div><span className="font-medium">Submitted:</span> {new Date(suggestion.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Status Update */}
            <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Status Update</h3>
              <div className="flex items-center gap-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SuggestionStatus)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:outline-none"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={isSaving || status === suggestion.status}
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSaving ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>

            {/* Reply Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Admin Reply</h3>

              {suggestion.adminReply && (
                <div className="space-y-3 mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reply History ({parseReplies(suggestion.adminReply).length})
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {parseReplies(suggestion.adminReply).map((reply, index) => (
                      <div key={index} className={`bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 relative ${index === 0 && animateNewReply ? 'suggestions-slide-in' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">{reply.timestamp}</div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{reply.content}</div>
                          </div>
                          <button
                            onClick={() => handleDeleteReply(index)}
                            className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                            title="Delete reply"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {suggestion.adminReply ? 'Add New Reply' : 'Add Reply'}
              </label>
              <textarea
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                rows={6}
                placeholder="Type a new reply..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:outline-none resize-y mb-3"
              />
              <button
                onClick={handleSendReply}
                disabled={isSaving || !adminReply.trim()}
                className="w-full px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
              >
                {isSaving ? 'Sending...' : 'Send Reply'}
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>

          <style>{`
            @keyframes suggestions-slide-in {
              from { opacity: 0; transform: translateY(-20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .suggestions-slide-in { animation: suggestions-slide-in 0.6s ease-out; }
          `}</style>
    </>
  );

  // If host provided a ModalComponent, delegate backdrop + chrome to it
  if (ModalComponent) {
    return (
      <ModalComponent isOpen={isOpen} onClose={onClose}>
        {replyContent}
      </ModalComponent>
    );
  }

  // Built-in modal (backward compatible)
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[1001]" onClick={onClose} />
      <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {replyContent}
        </div>
      </div>
    </>
  );
}
