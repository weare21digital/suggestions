'use client';

import React, { useState } from 'react';
import { SubmitForm } from './SubmitForm';
import { MySuggestions } from './MySuggestions';
import type { SuggestionsLabels } from '../lib/types';
import { DEFAULT_LABELS } from '../lib/types';

export interface SuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  userId?: string;
  isAdmin?: boolean;
  apiBasePath?: string;
  primaryColor?: string;
  glowColor?: string;
  labels?: SuggestionsLabels;
  loginComponent?: React.ReactNode;
  authHeader?: string;
  mode?: 'suggestion' | 'bug';
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
}

export function SuggestionsModal({
  isOpen,
  onClose,
  isAuthenticated,
  userId,
  isAdmin,
  apiBasePath = '/api/suggestions',
  primaryColor = '#0d9488',
  labels: labelOverrides,
  loginComponent,
  authHeader,
  mode = 'suggestion',
  entityType,
  entityId,
  entityLabel,
}: SuggestionsModalProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const [activeTab, setActiveTab] = useState<'submit' | 'my-suggestions'>('submit');

  if (!isOpen) return null;

  const activeTabStyle = {
    color: primaryColor,
    borderBottomColor: primaryColor,
    borderBottomWidth: '2px',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[1001]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose();
          }}
        >
          {/* Header with tabs */}
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 rounded-lg z-10"
              aria-label={labels.closeModal}
              type="button"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex border-b border-gray-200 dark:border-gray-700" role="tablist">
              <button
                className={[
                  'flex-1 px-6 py-3 font-medium transition-all cursor-pointer',
                  activeTab === 'submit'
                    ? '-mb-[2px]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                ].join(' ')}
                style={activeTab === 'submit' ? activeTabStyle : undefined}
                onClick={() => setActiveTab('submit')}
                role="tab"
                aria-selected={activeTab === 'submit'}
              >
                {labels.submitNew}
              </button>
              <button
                className={[
                  'flex-1 px-6 py-3 font-medium transition-all cursor-pointer',
                  activeTab === 'my-suggestions'
                    ? '-mb-[2px]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                ].join(' ')}
                style={activeTab === 'my-suggestions' ? activeTabStyle : undefined}
                onClick={() => setActiveTab('my-suggestions')}
                role="tab"
                aria-selected={activeTab === 'my-suggestions'}
              >
                {labels.mySuggestions}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'submit' && (
              <SubmitForm
                onSuccess={() => setActiveTab('my-suggestions')}
                isAuthenticated={isAuthenticated}
                userId={userId}
                isAdmin={isAdmin}
                apiBasePath={apiBasePath}
                primaryColor={primaryColor}
                labels={labels}
                loginComponent={loginComponent}
                authHeader={authHeader}
                mode={mode}
                entityType={entityType}
                entityId={entityId}
                entityLabel={entityLabel}
              />
            )}
            {activeTab === 'my-suggestions' && (
              <MySuggestions
                isAuthenticated={isAuthenticated}
                userId={userId}
                apiBasePath={apiBasePath}
                primaryColor={primaryColor}
                labels={labels}
                authHeader={authHeader}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
