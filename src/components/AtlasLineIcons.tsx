import React from 'react';

interface AtlasIconProps {
  className?: string;
}

/**
 * Thin line icons inspired by Mount Toubkal & the High Atlas Mountains:
 * mountain, boot, compass, sun, camel
 */

export const MountainLineIcon: React.FC<AtlasIconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 20L10.5 6L14 12L17.5 7L21 20H3Z" />
    <path d="M9 9L10.5 6L12 9" />
    <path d="M16 10L17.5 7L19 10" />
    <path d="M7 15L10.5 12L14 16" />
  </svg>
);

export const BootLineIcon: React.FC<AtlasIconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Hiking boot outline */}
    <path d="M6 3H11V8L13 10L19 12C20.5 12.5 21 14 21 16V19C21 20 20 21 19 21H4C3.5 21 3 20.5 3 20V8C3 6.5 4.5 5 6 3Z" />
    <path d="M3 17H21" />
    <path d="M8 8H11" />
    <path d="M8 11H12" />
    <path d="M6 21V17" />
    <path d="M10 21V17" />
    <path d="M15 21V17" />
    <path d="M18 21V17" />
  </svg>
);

export const CompassLineIcon: React.FC<AtlasIconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5 15.5 8.5" />
    <line x1="12" y1="3" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="21" />
    <line x1="3" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="21" y2="12" />
  </svg>
);

export const SunLineIcon: React.FC<AtlasIconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4.5" />
    <line x1="12" y1="2" x2="12" y2="4.5" />
    <line x1="12" y1="19.5" x2="12" y2="22" />
    <line x1="2" y1="12" x2="4.5" y2="12" />
    <line x1="19.5" y1="12" x2="22" y2="12" />
    <line x1="4.9" y1="4.9" x2="6.7" y2="6.7" />
    <line x1="17.3" y1="17.3" x2="19.1" y2="19.1" />
    <line x1="4.9" y1="19.1" x2="6.7" y2="17.3" />
    <line x1="17.3" y1="6.7" x2="19.1" y2="4.9" />
  </svg>
);

export const CamelLineIcon: React.FC<AtlasIconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Camel head, neck, two humps and legs */}
    <path d="M3 7C3 6.5 3.5 6 4 6H5.5L7 9L8 12C9 10 10.5 9 12 10C13 8.5 15 8.5 16.5 10C18 9 19.5 9.5 20.5 11C21 12 21 14 20 15L19 16V21H17.5V17H14.5V21H13V15.5L10 15V21H8.5V17L6.5 16L5 21H3.5L5 14L4 10Z" />
    <circle cx="4" cy="7" r="0.5" fill="currentColor" />
  </svg>
);
