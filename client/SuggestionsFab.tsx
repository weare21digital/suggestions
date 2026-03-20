'use client';

import React, { useState, useEffect } from 'react';
import { useSuggestionsModal } from './SuggestionsProvider';
import type { SuggestionsLabels } from '../lib/types';
import { DEFAULT_LABELS } from '../lib/types';

export interface SuggestionsFabProps {
  /** @deprecated No longer used — auth is handled by SuggestionsProvider */
  isAuthenticated?: boolean;
  /** @deprecated No longer used — handled by SuggestionsProvider */
  userId?: string;
  /** @deprecated No longer used — handled by SuggestionsProvider */
  isAdmin?: boolean;
  /** @deprecated No longer used — handled by SuggestionsProvider */
  apiBasePath?: string;
  /** Primary color for the FAB gradient (from). Default: '#0d9488' (teal) */
  primaryColor?: string;
  /** Secondary color for the FAB gradient (to). Default: '#0f766e' */
  secondaryColor?: string;
  /** Glow color rgba. Default: 'rgba(13, 148, 136, 0.4)' */
  glowColor?: string;
  /** Custom labels for i18n */
  labels?: Partial<SuggestionsLabels>;
  /** Jiggle interval in ms. Default: 30000 */
  jiggleInterval?: number;
  /** @deprecated No longer used — handled by SuggestionsProvider */
  loginComponent?: React.ReactNode;
  /** @deprecated No longer used — handled by SuggestionsProvider */
  authHeader?: string;
  /** Additional className for the FAB button */
  className?: string;
  /** Z-index for the FAB. Default: 1000 */
  zIndex?: number;
}

export function SuggestionsFab({
  primaryColor = '#0d9488',
  secondaryColor = '#0f766e',
  glowColor = 'rgba(13, 148, 136, 0.4)',
  labels: labelOverrides,
  jiggleInterval = 30000,
  className = '',
  zIndex = 1000,
}: SuggestionsFabProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const { openModal } = useSuggestionsModal();
  const [shouldJiggle, setShouldJiggle] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShouldJiggle(true);
      setTimeout(() => setShouldJiggle(false), 800);
    }, jiggleInterval);
    return () => clearInterval(interval);
  }, [jiggleInterval]);

  const fabId = 'suggestions-fab';

  return (
    <>
      <button
        id={fabId}
        onClick={() => openModal()}
        className={[
          'fixed bottom-[30px] right-[30px]',
          'max-sm:bottom-[20px] max-sm:right-[20px]',
          'w-[60px] h-[60px] max-sm:w-[50px] max-sm:h-[50px]',
          'text-[24px] max-sm:text-[20px]',
          'text-white rounded-full',
          'flex items-center justify-center',
          'cursor-pointer transition-all duration-300 ease-in-out',
          'hover:scale-110 overflow-visible',
          className,
        ].join(' ')}
        style={{
          background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`,
          boxShadow: `0 4px 12px ${glowColor}`,
          zIndex,
        }}
        aria-label={labels.fabAriaLabel}
        title={labels.fabTitle}
      >
        <span
          className={`inline-block ${shouldJiggle ? 'suggestions-jiggle' : ''}`}
          style={{ animation: 'suggestions-pulse 2.5s ease-in-out infinite' }}
        >
          💡
        </span>
      </button>

      <style>{`
        @keyframes suggestions-float-glow {
          0%, 100% { box-shadow: 0 4px 12px ${glowColor}; }
          50% { box-shadow: 0 4px 20px ${glowColor.replace(/[\d.]+\)$/, '0.7)')}, 0 0 30px ${glowColor.replace(/[\d.]+\)$/, '0.3)')}; }
        }
        @keyframes suggestions-pulse {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1.0; }
        }
        @keyframes suggestions-jiggle {
          0% { transform: scale(1) rotate(0deg) translateY(0); }
          8% { transform: scale(1.56) rotate(-12deg) translateY(-9px); }
          16% { transform: scale(1.56) rotate(12deg) translateY(-9px); }
          24% { transform: scale(1.56) rotate(-12deg) translateY(-9px); }
          32% { transform: scale(1.56) rotate(12deg) translateY(-9px); }
          40% { transform: scale(1.56) rotate(-10deg) translateY(-9px); }
          48% { transform: scale(1.56) rotate(10deg) translateY(-9px); }
          56% { transform: scale(1.512) rotate(-8deg) translateY(-8px); }
          64% { transform: scale(1.512) rotate(8deg) translateY(-8px); }
          72% { transform: scale(1.456) rotate(-5deg) translateY(-7px); }
          80% { transform: scale(1.456) rotate(5deg) translateY(-7px); }
          88% { transform: scale(1.352) rotate(-3deg) translateY(-5px); }
          94% { transform: scale(1.352) rotate(3deg) translateY(-5px); }
          100% { transform: scale(1) rotate(0deg) translateY(0); }
        }
        .suggestions-jiggle {
          animation: suggestions-jiggle 0.8s ease-in-out, suggestions-pulse 2.5s ease-in-out infinite !important;
        }
        #${fabId} {
          animation: suggestions-float-glow 3s ease-in-out infinite;
        }
        #${fabId}:hover {
          box-shadow: 0 6px 20px ${glowColor.replace(/[\d.]+\)$/, '0.6)')} !important;
        }
      `}</style>
    </>
  );
}
