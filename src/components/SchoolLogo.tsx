import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

export const SchoolEmblem: React.FC<{ className?: string }> = ({
  className = 'w-9 h-9',
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M32 4L56 12V31C56 45.2 45.6 56.4 32 60C18.4 56.4 8 45.2 8 31V12L32 4Z"
      fill="#1E3A8A"
    />
    <path
      d="M32 8L52 14.8V31C52 42.9 43.3 52.3 32 55.6C20.7 52.3 12 42.9 12 31V14.8L32 8Z"
      fill="#1D4ED8"
    />
    <path
      d="M19 25C23.5 23.2 28.2 23.6 32 26.2C35.8 23.6 40.5 23.2 45 25V41C40.5 39.4 35.8 39.8 32 42.2C28.2 39.8 23.5 39.4 19 41V25Z"
      fill="#FFFFFF"
    />
    <path d="M32 26.2V42.2" stroke="#1E3A8A" strokeWidth="2.2" />
    <circle cx="32" cy="18" r="4" fill="#FBBF24" />
    <path d="M22 46H42" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 text-slate-500 p-4 text-center ${className}`}
      >
        <ImageOff className="w-7 h-7 mb-2 text-blue-700/60" />
        <span className="text-xs font-medium text-slate-600 line-clamp-2">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
