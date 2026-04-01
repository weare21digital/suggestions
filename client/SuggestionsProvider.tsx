'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SuggestionsModal } from './SuggestionsModal';
import type { SuggestionsLabels, ModalComponentType } from '../lib/types';
import { DEFAULT_LABELS } from '../lib/types';

export interface ModalOpenOptions {
  mode?: 'suggestion' | 'bug';
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
}

export interface SuggestionsContextValue {
  openModal: (options?: ModalOpenOptions) => void;
  closeModal: () => void;
  isOpen: boolean;
}

const SuggestionsContext = createContext<SuggestionsContextValue | null>(null);

export interface SuggestionsProviderProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  userId?: string;
  isAdmin?: boolean;
  apiBasePath?: string;
  primaryColor?: string;
  glowColor?: string;
  labels?: Partial<SuggestionsLabels>;
  loginComponent?: React.ReactNode;
  authHeader?: string;
  /** Optional host-provided modal wrapper. When provided, replaces the built-in backdrop + modal chrome. */
  ModalComponent?: ModalComponentType;
}

export function SuggestionsProvider({
  children,
  isAuthenticated,
  userId,
  isAdmin,
  apiBasePath = '/api/suggestions',
  primaryColor = '#0d9488',
  glowColor,
  labels: labelOverrides,
  loginComponent,
  authHeader,
  ModalComponent,
}: SuggestionsProviderProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<ModalOpenOptions>({});

  const openModal = useCallback((options?: ModalOpenOptions) => {
    setModalOptions(options || {});
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalOptions({});
  }, []);

  return (
    <SuggestionsContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}
      <SuggestionsModal
        isOpen={isOpen}
        onClose={closeModal}
        isAuthenticated={isAuthenticated}
        userId={userId}
        isAdmin={isAdmin}
        apiBasePath={apiBasePath}
        primaryColor={primaryColor}
        glowColor={glowColor}
        labels={labels}
        loginComponent={loginComponent}
        authHeader={authHeader}
        mode={modalOptions.mode || 'suggestion'}
        entityType={modalOptions.entityType}
        entityId={modalOptions.entityId}
        entityLabel={modalOptions.entityLabel}
        ModalComponent={ModalComponent}
      />
    </SuggestionsContext.Provider>
  );
}

export function useSuggestionsModal(): SuggestionsContextValue {
  const context = useContext(SuggestionsContext);
  if (!context) {
    throw new Error('useSuggestionsModal must be used within a <SuggestionsProvider>');
  }
  return context;
}
