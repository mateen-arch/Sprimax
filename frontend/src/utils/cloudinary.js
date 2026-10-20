/**
 * Cloudinary Delivery & Optimization Utility
 * Provides automatic format & quality (f_auto, q_auto), responsive sizing,
 * preset variants, and srcset generation.
 */

const PRESET_VARIANTS = {
  thumbnail: 'c_fill,g_auto,w_480,h_320,f_auto,q_auto',
  card: 'c_fill,g_auto,w_600,h_400,f_auto,q_auto',
  featured: 'c_fill,g_auto,w_1200,h_600,f_auto,q_auto',
  banner: 'c_fill,g_auto,w_1600,h_700,f_auto,q_auto',
  og: 'c_fill,g_auto,w_1200,h_630,f_auto,q_auto',
  mobile: 'c_fill,g_auto,w_750,h_1000,f_auto,q_auto',
  avatar: 'c_fill,g_face,w_240,h_240,f_auto,q_auto',
  facility: 'c_fill,g_auto,w_900,h_500,f_auto,q_auto',
};

/**
 * Check if a URL points to Cloudinary
 */
export function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
}

/**
 * Generate an optimized Cloudinary URL for a given variant or custom dimensions
 * @param {string} url - Source image URL
 * @param {string|Object} variantOrOptions - Preset variant key or options object
 * @returns {string} Transformed image URL
 */
export function getOptimizedImageUrl(url, variantOrOptions = 'card') {
  if (!url || typeof url !== 'string') return '';

  // If not a Cloudinary URL, return as-is
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  let transformString = '';

  if (typeof variantOrOptions === 'string' && PRESET_VARIANTS[variantOrOptions]) {
    transformString = PRESET_VARIANTS[variantOrOptions];
  } else if (typeof variantOrOptions === 'object') {
    const parts = ['f_auto', 'q_auto'];
    if (variantOrOptions.width) parts.push(`w_${variantOrOptions.width}`);
    if (variantOrOptions.height) parts.push(`h_${variantOrOptions.height}`);
    if (variantOrOptions.crop) parts.push(`c_${variantOrOptions.crop}`);
    else if (variantOrOptions.width && variantOrOptions.height) parts.push('c_fill');
    if (variantOrOptions.gravity) parts.push(`g_${variantOrOptions.gravity}`);
    else if (variantOrOptions.crop === 'fill' || (variantOrOptions.width && variantOrOptions.height)) parts.push('g_auto');
    transformString = parts.join(',');
  } else {
    transformString = 'f_auto,q_auto';
  }

  // Insert transformations into Cloudinary URL after /upload/
  // Format: https://res.cloudinary.com/<cloud>/image/upload/(v\d+/)?...
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const prefix = url.slice(0, uploadIndex + 8);
  const remainder = url.slice(uploadIndex + 8);

  // If the URL already has transformations, replace or prepend
  return `${prefix}${transformString}/${remainder}`;
}

/**
 * Build responsive srcset string for responsive images
 * @param {string} url - Cloudinary URL
 * @param {number[]} widths - Array of widths
 * @returns {string} srcset string
 */
export function getCloudinarySrcSet(url, widths = [480, 768, 1024, 1440]) {
  if (!isCloudinaryUrl(url)) return '';

  return widths
    .map((w) => {
      const transformed = getOptimizedImageUrl(url, { width: w });
      return `${transformed} ${w}w`;
    })
    .join(', ');
}

export default {
  isCloudinaryUrl,
  getOptimizedImageUrl,
  getCloudinarySrcSet,
};
