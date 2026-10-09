/**
 * Cloudinary helper functions for image optimization
 * Based on CLOUDINARY_OPTIMIZATION_GUIDE.md patterns
 */

/**
 * Optimizes a Cloudinary URL with proper transformations
 * Adds f_auto (format auto), q_auto (quality auto), and width limiting
 *
 * @param url - The Cloudinary image URL
 * @param width - Optional width to resize to (uses c_limit to prevent enlargement)
 * @returns Optimized Cloudinary URL with transformations
 */
export function optimizeCloudinaryUrl(url: string, width?: number): string {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  const transformation = width
    ? `f_auto,q_auto,w_${width},c_limit`
    : 'f_auto,q_auto';

  return url.replace('/upload/', `/upload/${transformation}/`);
}

/**
 * Generates srcSet for responsive images (1x and 2x densities)
 * For use with plain <img> tags (not next/image)
 *
 * @param url - The Cloudinary image URL
 * @param width - Base width for 1x display
 * @returns srcSet string with 1x and 2x variants
 *
 * @example
 * <img
 *   src={optimizeCloudinaryUrl(url, 800)}
 *   srcSet={cloudinarySrcSet(url, 800)}
 *   alt="Product"
 * />
 */
export function cloudinarySrcSet(url: string, width: number): string {
  return `${optimizeCloudinaryUrl(url, width)} 1x, ${optimizeCloudinaryUrl(url, width * 2)} 2x`;
}

/**
 * Extracts public_id from a Cloudinary URL
 * Useful for deletions and transformations via Cloudinary API
 *
 * @param url - The Cloudinary image URL
 * @returns The public_id or null if not a valid Cloudinary URL
 *
 * @example
 * Input: "https://res.cloudinary.com/demo/image/upload/v1234/products/sample.jpg"
 * Output: "products/sample"
 */
export function getCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes('res.cloudinary.com')) {
    return null;
  }

  // Match pattern: /upload/[optional version]/[public_id][optional extension]
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}

/**
 * Checks if a URL is a Cloudinary URL
 *
 * @param url - URL to check
 * @returns true if it's a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com') && url.includes('/upload/');
}

/**
 * Builds a Cloudinary URL from components
 *
 * @param cloudName - Your Cloudinary cloud name
 * @param publicId - The public_id of the image
 * @param transformations - Optional transformation string (e.g., "w_800,h_600,c_fill")
 * @returns Complete Cloudinary URL
 */
export function buildCloudinaryUrl(
  cloudName: string,
  publicId: string,
  transformations?: string
): string {
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

  if (transformations) {
    return `${baseUrl}/${transformations}/${publicId}`;
  }

  return `${baseUrl}/${publicId}`;
}
