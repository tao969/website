import Image from 'next/image';
import React from 'react';
import styles from './badge.module.scss';

interface AnimatedBrandIconProps {
  className?: string;
}

export const AnimatedBrandIcon: React.FC<AnimatedBrandIconProps> = ({
  className,
}) => {
  // Render complex badge with professional animated strokes and glow effects
  return (
    <div className={`${styles.animatedBadgeContainer} ${className || ''}`}>
      {/* Profile Image */}
      <div className={styles.profileImageContainer}>
        <Image
          src="/profile.png"
          alt="Profile"
          width={100}
          height={100}
          className={styles.profileImage}
          priority
        />
      </div>

      <svg
        className={styles.animatedBadgeSvg}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Mask for creating "path" to keep animation neat within the frame */}
          <mask id="badgeMask">
            {/* Visible outer area (white) */}
            <rect width="100" height="100" rx="16" fill="white" />
            {/* Invisible inner hole (black), creating donut shape */}
            <rect x="3" y="3" width="94" height="94" rx="14" fill="black" />
          </mask>

          {/* Gradient for professional coloring */}
          <linearGradient id="geminiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A7C7FF" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#A7C7FF" />
          </linearGradient>

          {/* Filter for glowing "lightning" effect */}
          <filter id="geminiGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Badge background */}
        <rect width="100" height="100" rx="16" className={styles.badgeBackground} />
        {/* Static border stroke to be under animation */}
        <rect
          x="0.5"
          y="0.5"
          width="99"
          height="99"
          rx="15.5"
          className={styles.badgeBorderStatic}
        />

        {/* Group to apply mask to animated elements */}
        <g mask="url(#badgeMask)">
          {/* Animated "Lightning" stroke, now covered to be neat inside and outside */}
          <rect
            x="1"
            y="1"
            width="98"
            height="98"
            rx="15"
            className={styles.badgeBorderAnimated}
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="0.25 0.75" // longer "snake" (25% of path)
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-1"
              dur="4s"
              repeatCount="indefinite"
            />
            <animate // Pulsing lightning effect
              attributeName="opacity"
              values="1;0.6;1"
              dur="0.7s"
              repeatCount="indefinite"
            />
          </rect>
        </g>
      </svg>
    </div>
  );
};
