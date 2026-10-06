import React from 'react';

/**
 * UserAvatar — renders a circular avatar with an optional status ring.
 *
 * Ring colours:
 *  • open_to_work  → green  (#16a34a)
 *  • hiring / hired → blue  (#0284c7)
 *  • anything else → no ring
 */

interface UserAvatarProps {
  /** URL of the profile picture. If absent, a coloured initial-circle is shown. */
  src?: string | null;
  /** Display name – used to derive the initials fallback and alt text. */
  name?: string | null;
  /** Career status that controls the ring colour. */
  status?: string | null;
  /** Diameter of the avatar in px. Defaults to 36. */
  size?: number;
  /** Extra inline styles applied to the outermost wrapper. */
  style?: React.CSSProperties;
  /** Background colour for the initials fallback circle. Defaults to '#233167'. */
  bgColor?: string;
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  open_to_work: '#16a34a',
  hiring: '#0284c7',
  hired: '#0284c7',
};

const RING_WIDTH = 2.5; // px – the coloured ring itself
const GAP = 2;          // px – transparent gap between avatar and ring

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  status,
  size = 36,
  style,
  bgColor = '#233167',
  className,
}) => {
  const ringColor = status ? STATUS_COLORS[status] ?? null : null;
  const initial = name?.trim().charAt(0).toUpperCase() || '?';

  /* When there is a ring we use an outline trick:
     avatar gets a white border (gap) + coloured outline (ring)           */
  const ringStyle: React.CSSProperties = ringColor
    ? {
        outline: `${RING_WIDTH}px solid ${ringColor}`,
        outlineOffset: `${GAP}px`,
      }
    : {};

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    objectFit: 'cover',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: Math.round(size * 0.38),
    color: '#fff',
    background: bgColor,
    userSelect: 'none',
    ...ringStyle,
  };

  const renderAvatar = () => {
    if (src) {
      return (
        <img
          src={src}
          alt={name || 'User'}
          style={{ ...baseStyle, background: 'transparent' }}
        />
      );
    }
    return <div style={baseStyle}>{initial}</div>;
  };

  // Render pill badge if status is open_to_work or hiring
  const hasPillBadge = status === 'open_to_work' || status === 'hiring';

  if (hasPillBadge) {
    const isSmall = size < 50;
    const pillText = status === 'open_to_work' ? 'OPEN TO WORK' : 'HIRING';
    const pillBg = status === 'open_to_work' ? '#16a34a' : '#0284c7';

    const containerStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      padding: `${RING_WIDTH + GAP}px`,
      ...style,
    };

    const pillStyle: React.CSSProperties = {
      position: 'absolute',
      bottom: isSmall ? '-1px' : '-3px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: pillBg,
      color: '#ffffff',
      fontSize: isSmall ? '5px' : '7.5px',
      fontWeight: 900,
      fontFamily: '"Inter", "Montserrat", sans-serif',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      padding: isSmall ? '1px 4px' : '2px 8px',
      borderRadius: '999px',
      border: isSmall ? '1px solid #ffffff' : '1.5px solid #ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
      whiteSpace: 'nowrap',
      zIndex: 10,
      lineHeight: 1,
    };

    return (
      <div className={className} style={containerStyle}>
        {renderAvatar()}
        <div style={pillStyle}>{pillText}</div>
      </div>
    );
  }

  // Default single-element render (no badge overlay needed)
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User'}
        className={className}
        style={{ ...baseStyle, background: 'transparent', ...style }}
      />
    );
  }

  return (
    <div className={className} style={{ ...baseStyle, ...style }}>
      {initial}
    </div>
  );
};

export default UserAvatar;
