import React from 'react';

/**
 * Tasteful, lightweight SVG brand mark for Career Pilot.
 * Styled in warm daytime terracotta (#C95F48), mustard (#D8B35F), and deep ink (#293C3A).
 */

interface ArtIconProps {
  className?: string;
  size?: number;
}

export const PicassoCareerCompass: React.FC<ArtIconProps> = ({ className = 'w-9 h-9', size }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: `${size}px`, height: `${size}px` } : undefined}
    aria-hidden="true"
  >
    {/* Outer Ring */}
    <circle cx="50" cy="50" r="44" fill="#FFF7E8" stroke="#D9CFB9" strokeWidth="2.5" />
    <circle cx="50" cy="50" r="36" fill="#F5EBD6" stroke="#C5D5BE" strokeWidth="1.5" />

    {/* Mustard Center Sun */}
    <circle cx="50" cy="50" r="14" fill="#D8B35F" />

    {/* Compass Needle - Terracotta & Deep Ink */}
    <path d="M50 20 L58 44 L80 50 L58 56 L50 80 L42 56 L20 50 L42 44 Z" fill="#C95F48" />
    <path d="M50 20 L50 50 L58 44 Z" fill="#E58B70" />
    <path d="M80 50 L50 50 L58 56 Z" fill="#B54E38" />
    <path d="M50 80 L50 50 L42 56 Z" fill="#293C3A" />
    <path d="M20 50 L50 50 L42 44 Z" fill="#466E67" />

    {/* Center Pivot Point */}
    <circle cx="50" cy="50" r="4.5" fill="#FFF7E8" stroke="#293C3A" strokeWidth="1.5" />
  </svg>
);

// Fallback empty component in case any code still imports it
export const ModernistCareerLandscape: React.FC<{ className?: string }> = () => null;
export const CubistMentorPortrait: React.FC<ArtIconProps> = () => null;
export const ArtisanSectionHeader: React.FC<any> = () => null;
