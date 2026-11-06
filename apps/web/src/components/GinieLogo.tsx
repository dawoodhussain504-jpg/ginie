'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface GinieLogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textSize?: number;
  textColor?: string;
  style?: React.CSSProperties;
  className?: string;
  href?: string;
  isDark?: boolean;
}

export default function GinieLogo({
  size = 36,
  showText = false,
  textSize,
  textColor,
  style,
  className,
  href,
  isDark = false,
}: GinieLogoProps) {
  let pixelSize = 36;
  if (typeof size === 'number') {
    pixelSize = size;
  } else {
    switch (size) {
      case 'sm':
        pixelSize = 28;
        break;
      case 'md':
        pixelSize = 36;
        break;
      case 'lg':
        pixelSize = 44;
        break;
      case 'xl':
        pixelSize = 56;
        break;
      default:
        pixelSize = 36;
    }
  }

  const computedTextSize = textSize || Math.round(pixelSize * 0.52);
  const defaultTextColor = isDark ? '#ffffff' : '#0f172a';
  const resolvedTextColor = textColor || defaultTextColor;

  const content = (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.max(8, Math.round(pixelSize * 0.25)),
        textDecoration: 'none',
        verticalAlign: 'middle',
        ...style,
      }}
    >
      <div
        style={{
          width: pixelSize,
          height: pixelSize,
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          src="/logo.png"
          alt="GINIE Logo"
          width={pixelSize}
          height={pixelSize}
          priority
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      {showText && (
        <span
          style={{
            fontSize: computedTextSize,
            fontWeight: 900,
            color: resolvedTextColor,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          GINIE
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }

  return content;
}
