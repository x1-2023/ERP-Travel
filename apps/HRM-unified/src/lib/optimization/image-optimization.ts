// src/lib/optimization/image-optimization.ts

/**
 * LAC VIET HR - Image Optimization
 * Utilities for optimizing images with Next.js Image component
 */

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export interface ResponsiveImageConfig extends ImageConfig {
  sizes?: string;
  srcSet?: string[];
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png' | 'gif';

export interface OptimizationOptions {
  format?: ImageFormat;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

// ════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Default image sizes for different use cases
 */
export const ImageSizes = {
  // Avatars
  avatar: {
    xs: { width: 24, height: 24 },
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 64, height: 64 },
    xl: { width: 96, height: 96 },
    '2xl': { width: 128, height: 128 },
  },

  // Thumbnails
  thumbnail: {
    sm: { width: 80, height: 80 },
    md: { width: 120, height: 120 },
    lg: { width: 200, height: 200 },
  },

  // Cards
  card: {
    sm: { width: 300, height: 200 },
    md: { width: 400, height: 267 },
    lg: { width: 600, height: 400 },
  },

  // Banner/Hero
  banner: {
    sm: { width: 640, height: 360 },
    md: { width: 1024, height: 576 },
    lg: { width: 1920, height: 1080 },
  },

  // Document preview
  document: {
    preview: { width: 200, height: 280 },
    full: { width: 800, height: 1120 },
  },
} as const;

/**
 * Quality presets
 */
export const QualityPresets = {
  low: 60,
  medium: 75,
  high: 85,
  max: 95,
} as const;

/**
 * Responsive breakpoints
 */
export const ImageBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ════════════════════════════════════════════════════════════════════════════════
// BLUR PLACEHOLDER GENERATION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Generate a simple color-based blur placeholder
 */
export function generateColorPlaceholder(
  color: string = '#e5e7eb'
): string {
  // Create a tiny 1x1 pixel image with the given color
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1" height="1">
      <rect width="1" height="1" fill="${color}"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate a gradient placeholder
 */
export function generateGradientPlaceholder(
  colors: [string, string] = ['#e5e7eb', '#d1d5db']
): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]}"/>
          <stop offset="100%" style="stop-color:${colors[1]}"/>
        </linearGradient>
      </defs>
      <rect width="8" height="8" fill="url(#g)"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate a shimmer placeholder
 */
export function generateShimmerPlaceholder(
  width: number,
  height: number
): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f3f4f6">
            <animate attributeName="offset" values="-2; 1" dur="1.5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" style="stop-color:#e5e7eb">
            <animate attributeName="offset" values="-1; 2" dur="1.5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style="stop-color:#f3f4f6">
            <animate attributeName="offset" values="0; 3" dur="1.5s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#shimmer)"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ════════════════════════════════════════════════════════════════════════════════
// RESPONSIVE IMAGE HELPERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizesAttribute(
  config: {
    default: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  }
): string {
  const sizes: string[] = [];

  if (config.sm) sizes.push(`(max-width: ${ImageBreakpoints.sm}px) ${config.sm}`);
  if (config.md) sizes.push(`(max-width: ${ImageBreakpoints.md}px) ${config.md}`);
  if (config.lg) sizes.push(`(max-width: ${ImageBreakpoints.lg}px) ${config.lg}`);
  if (config.xl) sizes.push(`(max-width: ${ImageBreakpoints.xl}px) ${config.xl}`);
  sizes.push(config.default);

  return sizes.join(', ');
}

/**
 * Common responsive size configurations
 */
export const ResponsiveSizes = {
  // Full width container
  fullWidth: generateSizesAttribute({
    default: '100vw',
  }),

  // Contained width with padding
  contained: generateSizesAttribute({
    sm: '100vw',
    md: '90vw',
    lg: '80vw',
    xl: '1280px',
    default: '1280px',
  }),

  // Half width on larger screens
  halfWidth: generateSizesAttribute({
    sm: '100vw',
    md: '50vw',
    default: '50vw',
  }),

  // Third width on larger screens
  thirdWidth: generateSizesAttribute({
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
    default: '33vw',
  }),

  // Quarter width on larger screens
  quarterWidth: generateSizesAttribute({
    sm: '50vw',
    md: '33vw',
    lg: '25vw',
    default: '25vw',
  }),

  // Card in grid
  cardGrid: generateSizesAttribute({
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
    xl: '25vw',
    default: '25vw',
  }),

  // Avatar
  avatar: '64px',

  // Thumbnail
  thumbnail: '120px',
} as const;

// ════════════════════════════════════════════════════════════════════════════════
// URL HELPERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Build optimized image URL with query parameters
 */
export function buildImageUrl(
  baseUrl: string,
  options: OptimizationOptions = {}
): string {
  const {
    format,
    quality,
    maxWidth,
    maxHeight,
    fit,
  } = options;

  const url = new URL(baseUrl, 'https://placeholder.local');
  const params = new URLSearchParams();

  if (format) params.set('f', format);
  if (quality) params.set('q', String(quality));
  if (maxWidth) params.set('w', String(maxWidth));
  if (maxHeight) params.set('h', String(maxHeight));
  if (fit) params.set('fit', fit);

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[],
  options: OptimizationOptions = {}
): string {
  return widths
    .map((width) => {
      const url = buildImageUrl(baseUrl, { ...options, maxWidth: width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Default srcSet widths
 */
export const DefaultSrcSetWidths = [320, 640, 768, 1024, 1280, 1536, 1920];

// ════════════════════════════════════════════════════════════════════════════════
// AVATAR HELPERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  if (!name) return '?';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a color from a string (for avatar backgrounds)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Generate avatar placeholder SVG
 */
export function generateAvatarPlaceholder(
  name: string,
  size: number = 64
): string {
  const initials = getInitials(name);
  const bgColor = stringToColor(name);
  const fontSize = Math.round(size * 0.4);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="${bgColor}" rx="${size / 2}"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="${fontSize}px">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ════════════════════════════════════════════════════════════════════════════════
// IMAGE CONFIG BUILDERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Build avatar image config
 */
export function buildAvatarConfig(
  src: string | null | undefined,
  name: string,
  size: keyof typeof ImageSizes.avatar = 'md'
): ImageConfig {
  const dimensions = ImageSizes.avatar[size];

  return {
    src: src || generateAvatarPlaceholder(name, dimensions.width),
    alt: name,
    ...dimensions,
    quality: QualityPresets.high,
    placeholder: 'blur',
    blurDataURL: generateAvatarPlaceholder(name, 8),
  };
}

/**
 * Build thumbnail image config
 */
export function buildThumbnailConfig(
  src: string,
  alt: string,
  size: keyof typeof ImageSizes.thumbnail = 'md'
): ImageConfig {
  const dimensions = ImageSizes.thumbnail[size];

  return {
    src,
    alt,
    ...dimensions,
    quality: QualityPresets.medium,
    placeholder: 'blur',
    blurDataURL: generateShimmerPlaceholder(dimensions.width, dimensions.height),
  };
}

/**
 * Build card image config
 */
export function buildCardImageConfig(
  src: string,
  alt: string,
  size: keyof typeof ImageSizes.card = 'md'
): ResponsiveImageConfig {
  const dimensions = ImageSizes.card[size];

  return {
    src,
    alt,
    ...dimensions,
    quality: QualityPresets.high,
    placeholder: 'blur',
    blurDataURL: generateShimmerPlaceholder(dimensions.width, dimensions.height),
    sizes: ResponsiveSizes.cardGrid,
  };
}

/**
 * Build banner/hero image config
 */
export function buildBannerConfig(
  src: string,
  alt: string,
  size: keyof typeof ImageSizes.banner = 'lg'
): ResponsiveImageConfig {
  const dimensions = ImageSizes.banner[size];

  return {
    src,
    alt,
    ...dimensions,
    quality: QualityPresets.high,
    priority: true,
    placeholder: 'blur',
    blurDataURL: generateGradientPlaceholder(),
    sizes: ResponsiveSizes.fullWidth,
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// FORMAT DETECTION
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Get best supported image format
 */
export function getBestSupportedFormat(): ImageFormat {
  if (typeof window === 'undefined') return 'webp';

  // Check AVIF support
  const canvas = document.createElement('canvas');
  if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
    return 'avif';
  }

  // Check WebP support
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'webp';
  }

  return 'jpeg';
}

/**
 * Check if browser supports a specific format
 */
export function supportsFormat(format: ImageFormat): boolean {
  if (typeof window === 'undefined') {
    return format === 'webp' || format === 'jpeg' || format === 'png';
  }

  const canvas = document.createElement('canvas');
  return canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0;
}

// ════════════════════════════════════════════════════════════════════════════════
// PRELOADING
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Preload an image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload multiple images
 */
export async function preloadImages(
  sources: string[],
  options: { parallel?: boolean; maxConcurrent?: number } = {}
): Promise<void> {
  const { parallel = true, maxConcurrent = 5 } = options;

  if (parallel) {
    // Batch loading with concurrency limit
    const batches: string[][] = [];
    for (let i = 0; i < sources.length; i += maxConcurrent) {
      batches.push(sources.slice(i, i + maxConcurrent));
    }

    for (const batch of batches) {
      await Promise.all(batch.map(preloadImage));
    }
  } else {
    // Sequential loading
    for (const src of sources) {
      await preloadImage(src);
    }
  }
}

/**
 * Preload critical images (above the fold)
 */
export function preloadCriticalImages(images: ImageConfig[]): void {
  if (typeof window === 'undefined') return;

  images.forEach((img) => {
    if (img.priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src;
      document.head.appendChild(link);
    }
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// ASPECT RATIO HELPERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Common aspect ratios
 */
export const AspectRatios = {
  square: 1,
  video: 16 / 9,
  widescreen: 21 / 9,
  portrait: 3 / 4,
  landscape: 4 / 3,
  golden: 1.618,
  a4: 1.414,
} as const;

/**
 * Calculate dimensions while maintaining aspect ratio
 */
export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth?: number,
  maxHeight?: number
): ImageDimensions {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (maxWidth && width > maxWidth) {
    width = maxWidth;
    height = Math.round(width / aspectRatio);
  }

  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }

  return { width, height, aspectRatio };
}

/**
 * Get dimensions for a specific aspect ratio
 */
export function getDimensionsForAspectRatio(
  targetWidth: number,
  aspectRatio: number
): ImageDimensions {
  const height = Math.round(targetWidth / aspectRatio);
  return { width: targetWidth, height, aspectRatio };
}
