'use client';

import React, { useState } from 'react';
import type { SuggestionsLabels } from '../lib/types';
import { DEFAULT_LABELS } from '../lib/types';

export interface SubmitFormProps {
  onSuccess: () => void;
  isAuthenticated: boolean;
  userId?: string;
  isAdmin?: boolean;
  apiBasePath?: string;
  primaryColor?: string;
  labels?: SuggestionsLabels;
  loginComponent?: React.ReactNode;
  authHeader?: string;
  mode?: 'suggestion' | 'bug';
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
}

function interpolate(template: string, vars: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

export function SubmitForm({
  onSuccess,
  isAuthenticated,
  apiBasePath = '/api/suggestions',
  primaryColor = '#0d9488',
  labels: labelOverrides,
  loginComponent,
  authHeader,
  mode = 'suggestion',
  entityType,
  entityId,
  entityLabel,
}: SubmitFormProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'suggestion' | 'bug'>(mode);
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: string; message: string }>({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBugMode = mode === 'bug';

  if (!isAuthenticated) {
    return loginComponent ? <>{loginComponent}</> : (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>{labels.loginRequired}</p>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setStatus({ type: 'error', message: 'Invalid file type. Only PNG, JPEG, GIF, and WebP are allowed.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File too large. Max size: 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!isBugMode) return;

    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith('image/'));
    if (!imageItem) return;

    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File too large. Max size: 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setStatus({ type: 'error', message: labels.titleRequired || '' });
      return;
    }

    if (description.trim().length < 100) {
      setStatus({
        type: 'error',
        message: interpolate(labels.descriptionTooShort || '', { min: 100 }),
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authHeader) headers['Authorization'] = authHeader;

      const payload: any = { type, title, description };
      if (isBugMode && entityType && entityId && entityLabel) {
        payload.entity_type = entityType;
        payload.entity_id = entityId;
        payload.entity_label = entityLabel;
        payload.category = 'bug';
      }
      if (screenshot) {
        payload.screenshot = screenshot;
      }

      const response = await fetch(apiBasePath, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorCode = data.error;
        let errorMessage = labels.submitFailed || '';

        if (errorCode === 'RATE_LIMIT_EXCEEDED' && data.data) {
          errorMessage = `Rate limit exceeded. Try again in ${data.data.minutesRemaining} minutes.`;
        } else if (errorCode === 'TITLE_TOO_LONG') {
          errorMessage = `Title too long (max ${data.data?.maxLength || 255}).`;
        } else if (errorCode === 'DESCRIPTION_TOO_LONG') {
          errorMessage = `Description too long (max ${data.data?.maxLength || 5000}).`;
        }

        setStatus({ type: 'error', message: errorMessage });
        return;
      }

      setStatus({ type: 'success', message: labels.submitted || '' });
      setTitle('');
      setType('suggestion');
      setDescription('');
      setScreenshot(null);

      setTimeout(() => onSuccess(), 1500);
    } catch {
      setStatus({ type: 'error', message: labels.submitFailed || '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} onPaste={handlePaste}>
      {/* Entity Context (bug mode only) */}
      {isBugMode && entityLabel && (
        <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 text-sm">
          <span className="font-medium">🐛 {entityLabel}</span>
        </div>
      )}

      {/* Type Selection (not shown in bug mode) */}
      {!isBugMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {labels.typeLabel}
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType('suggestion')}
              className={[
                'flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors cursor-pointer',
                type === 'suggestion'
                  ? 'text-white'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800',
              ].join(' ')}
              style={type === 'suggestion' ? { backgroundColor: primaryColor } : undefined}
            >
              {labels.typeSuggestion}
            </button>
            <button
              type="button"
              onClick={() => setType('bug')}
              className={[
                'flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors cursor-pointer',
                type === 'bug'
                  ? 'text-white'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800',
              ].join(' ')}
              style={type === 'bug' ? { backgroundColor: primaryColor } : undefined}
            >
              {labels.typeBug}
            </button>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="suggestions-title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          {labels.titleLabel}
        </label>
        <input
          type="text"
          id="suggestions-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          required
          placeholder={labels.titlePlaceholder}
          disabled={isSubmitting}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:outline-none disabled:opacity-50"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
        <p className={`text-xs mt-2 ${title.length > 235 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          {interpolate(labels.charactersCount || '', { count: title.length, max: 255 })}
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="suggestions-description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          {labels.descriptionLabel}
        </label>
        <textarea
          id="suggestions-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={labels.descriptionPlaceholder}
          rows={6}
          minLength={100}
          maxLength={1000}
          disabled={isSubmitting}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:outline-none disabled:opacity-50 resize-y"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
        {description.length < 100 ? (
          <div className="mt-2 text-sm text-gray-400">
            {interpolate(labels.charactersMinimum || '', { count: description.length, min: 100 })}
          </div>
        ) : (
          <div className={`mt-2 text-sm ${description.length > 950 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            {interpolate(labels.charactersCount || '', { count: description.length, max: 1000 })}
          </div>
        )}
      </div>

      {/* Screenshot upload (bug mode only) */}
      {isBugMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Снимка на екрана (по избор)
          </label>
          {screenshot ? (
            <div className="relative">
              <img
                src={screenshot}
                alt="Screenshot preview"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={() => setScreenshot(null)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Натиснете тук за качване или поставете изображение (Ctrl+V)
                </p>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {/* Status message */}
      {status.message && (
        <div className={`p-3 rounded-lg ${
          status.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        }`}>
          {status.message}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        className="w-full text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        style={{ backgroundColor: isSubmitting || !title.trim() || description.trim().length < 100 ? undefined : primaryColor }}
        disabled={isSubmitting || !title.trim() || description.trim().length < 100}
      >
        {isSubmitting ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
