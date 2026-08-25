/**
 * Standard Wikimedia thumbnail sizes (widths in pixels) based on MediaWiki production standards.
 * @see https://www.mediawiki.org/wiki/Manual:Common_thumbnail_sizes
 */
export const WIKIMEDIA_STANDARD_SIZES = [
  20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840
] as const;

export type WikimediaStandardSize = typeof WIKIMEDIA_STANDARD_SIZES[number];

/**
 * Snaps a requested size to the next largest standard Wikimedia bucket.
 * 
 * @param requestedWidth The desired width in pixels.
 * @returns The closest standard width that is >= the requested width.
 */
export function getStandardWikimediaSize(requestedWidth: number): number {
  const size = WIKIMEDIA_STANDARD_SIZES.find(s => s >= requestedWidth);
  return size || WIKIMEDIA_STANDARD_SIZES[WIKIMEDIA_STANDARD_SIZES.length - 1];
}
