import React, { useState } from 'react';

interface AtlasImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackTitle?: string;
  aspectRatio?: '16/11' | '16/9' | '4/3' | '1/1' | 'auto';
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

/**
 * Builds responsive WebP srcSet for Unsplash or CDN images
 */
function getResponsiveSrcSet(originalUrl: string): string | undefined {
  if (!originalUrl || !originalUrl.includes('images.unsplash.com')) {
    return undefined;
  }
  const baseUrl = originalUrl.split('?')[0];
  return `
    ${baseUrl}?auto=format&fit=crop&w=360&q=75&fm=webp 360w,
    ${baseUrl}?auto=format&fit=crop&w=640&q=80&fm=webp 640w,
    ${baseUrl}?auto=format&fit=crop&w=960&q=85&fm=webp 960w
  `.trim();
}

/**
 * Optimized image source with WebP format and balanced quality
 */
function getOptimizedSrc(originalUrl: string, width = 640): string {
  if (!originalUrl) return '';
  if (originalUrl.includes('images.unsplash.com')) {
    const baseUrl = originalUrl.split('?')[0];
    return `${baseUrl}?auto=format&fit=crop&w=${width}&q=80&fm=webp`;
  }
  return originalUrl;
}

export const AtlasImage: React.FC<AtlasImageProps> = ({
  src,
  alt,
  fallbackTitle,
  aspectRatio = 'auto',
  className = '',
  containerClassName = '',
  priority = false,
  width,
  height,
  ...restProps
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Set explicit default dimensions to avoid Cumulative Layout Shift (CLS)
  let computedWidth = width;
  let computedHeight = height;
  if (!computedWidth || !computedHeight) {
    if (aspectRatio === '16/11') {
      computedWidth = computedWidth || 640;
      computedHeight = computedHeight || 440;
    } else if (aspectRatio === '16/9') {
      computedWidth = computedWidth || 640;
      computedHeight = computedHeight || 360;
    } else if (aspectRatio === '4/3') {
      computedWidth = computedWidth || 640;
      computedHeight = computedHeight || 480;
    } else if (aspectRatio === '1/1') {
      computedWidth = computedWidth || 400;
      computedHeight = computedHeight || 400;
    }
  }

  const optimizedSrc = getOptimizedSrc(src, typeof computedWidth === 'number' ? computedWidth : 640);
  const srcSet = getResponsiveSrcSet(src);

  const aspectClass =
    aspectRatio === '16/11'
      ? 'aspect-[16/11]'
      : aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : aspectRatio === '4/3'
      ? 'aspect-[4/3]'
      : aspectRatio === '1/1'
      ? 'aspect-square'
      : '';

  return (
    <div className={`relative overflow-hidden ${aspectClass} ${containerClassName}`}>
      {/* 1. Loading Skeleton Shimmer */}
      {!isLoaded && !hasError && src && src.trim() && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#F0ECE1] via-[#E4DDD0] to-[#F0ECE1] bg-[length:200%_100%] animate-shimmer" />
      )}

      {/* 2. Empty or Error Fallback: Elegant Moroccan Mountain Vector with Toubkal Palette */}
      {hasError || !src || !src.trim() ? (
        <div
          role="img"
          aria-label={alt || 'Hidden Atlas Morocco Tour'}
          className="w-full h-full min-h-[160px] bg-gradient-to-b from-[#2E2118] via-[#4A3426] to-[#9C4A2F] flex flex-col items-center justify-center p-4 text-center text-[#F8F5F0]"
        >
          {/* Subtle Berber geometric diamond pattern */}
          <svg className="w-12 h-12 text-[#C98B4B] mb-2 opacity-90" viewBox="0 0 64 64" fill="none">
            <path
              d="M32 4L4 32L32 60L60 32L32 4Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M32 16L16 32L32 48L48 32L32 16Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              opacity="0.6"
            />
            <path
              d="M14 42L28 24L38 34L44 26L52 38"
              stroke="#F8F5F0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="32" r="3" fill="#E5733A" />
          </svg>
          <span className="font-serif font-bold text-sm tracking-wide text-white drop-shadow-sm max-w-[85%] truncate">
            {fallbackTitle || alt || 'Hidden Atlas Morocco'}
          </span>
          <span className="text-[10px] text-[#C98B4B] font-semibold tracking-wider uppercase mt-0.5">
            Toubkal & High Atlas Experience
          </span>
        </div>
      ) : (
        /* 3. Real Image with responsive srcset and fast onload transition */
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          width={computedWidth}
          height={computedHeight}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...restProps}
        />
      )}
    </div>
  );
};
