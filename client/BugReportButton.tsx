'use client';

import React from 'react';
import { useSuggestionsModal } from './SuggestionsProvider';

export interface BugReportButtonProps {
  entityType: string;
  entityId: string;
  entityLabel: string;
  /** @deprecated No longer used — auth is handled by SuggestionsProvider */
  isAuthenticated?: boolean;
  /** @deprecated No longer used — handled by SuggestionsProvider */
  userId?: string;
  /** @deprecated No longer used — handled by SuggestionsProvider */
  apiBasePath?: string;
  /** @deprecated No longer used — handled by SuggestionsProvider */
  primaryColor?: string;
  /** @deprecated No longer used — handled by SuggestionsProvider */
  authHeader?: string;
  /** @deprecated No longer used — handled by SuggestionsProvider */
  loginComponent?: React.ReactNode;
  /** Additional className for the button */
  className?: string;
  /** Override the button label/icon */
  children?: React.ReactNode;
}

export function BugReportButton({
  entityType,
  entityId,
  entityLabel,
  className,
  children,
}: BugReportButtonProps) {
  const { openModal } = useSuggestionsModal();

  return (
    <button
      onClick={() => openModal({ mode: 'bug', entityType, entityId, entityLabel })}
      className={className || "inline-flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-200 group"}
      title="Докладвай бъг"
      aria-label="Докладвай бъг"
      type="button"
    >
      {children || <span className="text-lg group-hover:scale-110 transition-transform">🐛</span>}
    </button>
  );
}
