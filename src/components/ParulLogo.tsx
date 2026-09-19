import React from 'react';

interface ParulLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'onImage';
  showTagline?: boolean;
}

export const ParulLogo: React.FC<ParulLogoProps> = ({
  size = 'md',
  variant = 'light',
  showTagline = true,
}) => {
  const isLight = variant === 'light';
  const isOnImage = variant === 'onImage';

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-black',
    xl: 'text-3xl font-black',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Parul University Shield / Emblem */}
      <div
        className={`${iconSizes[size]} relative rounded-2xl flex items-center justify-center p-1.5 shadow-md transition-transform hover:scale-105 ${
          isOnImage
            ? 'bg-gradient-to-br from-amber-500 via-rose-700 to-red-900 border border-white/30 text-white backdrop-blur-md'
            : isLight
            ? 'bg-gradient-to-br from-[#800020] via-[#990024] to-[#c41535] text-white shadow-red-900/20'
            : 'bg-white text-[#800020] shadow-black/20'
        }`}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Shield Outline */}
          <path
            d="M50 8L88 22V50C88 74 50 92 50 92C50 92 12 74 12 50V22L50 8Z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="4"
          />
          {/* Open Book of Knowledge */}
          <path
            d="M50 62C50 62 38 52 24 54V38C38 36 50 44 50 44C50 44 62 36 76 38V54C62 52 50 62 50 62Z"
            fill="#FEF08A"
            stroke="#CA8A04"
            strokeWidth="2.5"
          />
          {/* Central Torch / Flame */}
          <path
            d="M50 20C52 25 56 28 56 33C56 36.3 53.3 39 50 39C46.7 39 44 36.3 44 33C44 28 48 25 50 20Z"
            fill="#F97316"
          />
          <path
            d="M50 24C51 27 53 29 53 32C53 33.7 51.7 35 50 35C48.3 35 47 33.7 47 32C47 29 49 27 50 24Z"
            fill="#FDE047"
          />
          {/* Torch Handle */}
          <path
            d="M48 39H52V47H48V39Z"
            fill="#E2E8F0"
          />
          {/* Stars */}
          <circle cx="28" cy="30" r="2.5" fill="#FEF08A" />
          <circle cx="72" cy="30" r="2.5" fill="#FEF08A" />
        </svg>
      </div>

      {/* University Name & Accreditations */}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-2">
          <span
            className={`${titleSizes[size]} tracking-tight ${
              isOnImage
                ? 'text-white drop-shadow-md'
                : isLight
                ? 'text-slate-900'
                : 'text-white'
            }`}
          >
            Parul<span className="text-rose-600 font-extrabold">®</span> University
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-amber-950 uppercase tracking-wider shadow-xs">
            NAAC A++
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-xs font-medium tracking-wide ${
              isOnImage
                ? 'text-amber-200 drop-shadow-sm'
                : isLight
                ? 'text-slate-500'
                : 'text-slate-300'
            }`}
          >
            Vadodara, Gujarat • Student Events Portal
          </span>
        )}
      </div>
    </div>
  );
};
