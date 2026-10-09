/**
 * Custom image loader for Next.js Image component
 * Based on CLOUDINARY_OPTIMIZATION_GUIDE.md patterns
 *
 * This loader intercepts all next/image requests and automatically applies
 * Cloudinary transformations for optimal delivery (WebP/AVIF, quality, width)
 *
 * @see https://nextjs.org/docs/api-reference/next/image#loader
 */

interface CloudinaryLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: CloudinaryLoaderProps): string {
  // Pass through non-Cloudinary URLs unchanged
  if (!src.includes('res.cloudinary.com') || !src.includes('/upload/')) {
    return src;
  }

  // Build quality parameter (default to auto)
  const q = quality ? `q_${quality}` : 'q_auto';

  // Insert transformations into the Cloudinary URL
  // f_auto: Auto-detect best format (WebP, AVIF, etc.)
  // q_auto or q_XX: Quality optimization
  // w_XXX: Width requested by Next.js based on device/viewport
  // c_limit: Don't enlarge images beyond original size
  const transformations = `f_auto,${q},w_${width},c_limit`;

  return src.replace('/upload/', `/upload/${transformations}/`);
}
