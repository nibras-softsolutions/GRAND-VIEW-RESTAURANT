import React from 'react';
import Link from 'next/link';

interface HotelLogoProps {
  variant?: 'light' | 'dark' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export default function HotelLogo({
  variant = 'dark',
  size = 'md',
  showTagline = false,
  className = '',
}: HotelLogoProps) {
  const isLight = variant === 'light';

  // SVG Lotus / Crown mark
  const iconSize = size === 'sm' ? 22 : size === 'lg' ? 40 : 28;

  return (
    <Link
      href="/"
      className={`inline-flex flex-col items-center select-none group transition-opacity hover:opacity-90 ${className}`}
      aria-label="Grand View Restaurant Home"
    >
      <div className="flex items-center gap-2">
        {/* Luxury Lotus / Crown Emblem */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform group-hover:scale-105 duration-300"
        >
          {/* Outer elegant lotus petals */}
          <path
            d="M24 6C24 6 29 17 38 20C29 23 27 34 24 40C21 34 19 23 10 20C19 17 24 6 24 6Z"
            fill={isLight ? '#E8C782' : '#C99A4A'}
            opacity="0.95"
          />
          {/* Inner core petal */}
          <path
            d="M24 13C24 13 27 21 33 23C27 25 26 33 24 37C22 33 21 25 15 23C21 21 24 13 24 13Z"
            fill={isLight ? '#FFFFFF' : '#E5C07B'}
          />
          {/* Apex crown jewel */}
          <circle cx="24" cy="9" r="2" fill={isLight ? '#FFFFFF' : '#C99A4A'} />
          {/* Base pedestal arc */}
          <path
            d="M14 41C18 43 30 43 34 41"
            stroke={isLight ? '#E8C782' : '#C99A4A'}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <div className="flex flex-col text-left">
          <span
            className={`font-serif tracking-[0.16em] uppercase font-bold leading-tight ${
              size === 'sm'
                ? 'text-[11px]'
                : size === 'lg'
                ? 'text-lg md:text-xl'
                : 'text-sm md:text-[15px]'
            } ${isLight ? 'text-white' : 'text-[#1A1814]'}`}
          >
            Grand View
          </span>
          <span
            className={`font-sans tracking-[0.3em] uppercase text-[8px] font-semibold leading-none ${
              isLight ? 'text-[#E5C07B]' : 'text-[#C99A4A]'
            }`}
          >
            Restaurant
          </span>
        </div>
      </div>

      {showTagline && (
        <span
          className={`text-[11px] font-normal tracking-wider mt-1 ${
            isLight ? 'text-[#E5C07B]/90' : 'text-[#77736C]'
          }`}
        >
          Good Food. Great Moments.
        </span>
      )}
    </Link>
  );
}
