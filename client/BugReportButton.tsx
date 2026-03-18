'use client';

import React, { useState } from 'react';
import { SuggestionsModal } from './SuggestionsModal';

export interface BugReportButtonProps {
  entityType: string;
  entityId: string;
  entityLabel: string;
  isAuthenticated: boolean;
  userId?: string;
  apiBasePath?: string;
  primaryColor?: string;
  authHeader?: string;
  loginComponent?: React.ReactNode;
}

export function BugReportButton({
  entityType,
  entityId,
  entityLabel,
  isAuthenticated,
  userId,
  apiBasePath = '/api/suggestions',
  primaryColor = '#0d9488',
  authHeader,
  loginComponent,
}: BugReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-200 group"
        title="Докладвай бъг"
        aria-label="Докладвай бъг"
        type="button"
      >
        <span className="text-lg group-hover:scale-110 transition-transform">🐛</span>
      </button>

      <SuggestionsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isAuthenticated={isAuthenticated}
        userId={userId}
        apiBasePath={apiBasePath}
        primaryColor={primaryColor}
        authHeader={authHeader}
        loginComponent={loginComponent}
        mode="bug"
        entityType={entityType}
        entityId={entityId}
        entityLabel={entityLabel}
      />
    </>
  );
}
