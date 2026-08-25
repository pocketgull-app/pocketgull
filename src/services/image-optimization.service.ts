import { Injectable } from '@angular/core';
import { getStandardWikimediaSize } from '../constants/image-sizes';

/**
 * Service to handle image URL standardization and optimization.
 */
@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {

  /**
   * Standardizes a Wikipedia thumbnail URL to use recommended production sizes.
   * Example: https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/File.jpg/640px-File.jpg
   * becomes: https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/File.jpg/960px-File.jpg
   * 
   * @param url The Wikipedia thumbnail URL to standardize.
   * @param targetWidth Optional target width. If not provided, it snaps current size to the next standard bucket.
   * @returns The standardized URL.
   */
  standardizeWikipediaUrl(url: string, targetWidth?: number): string {
    try {
      const parsed = new URL(url);
      if (parsed.hostname !== 'upload.wikimedia.org') {
        return url;
      }
    } catch (e) {
      return url;
    }

    // Match the size part of the URL, e.g., /640px-
    const sizeMatch = url.match(/\/(\d+)px-/);
    if (sizeMatch) {
      const currentWidth = parseInt(sizeMatch[1], 10);
      const widthToUse = targetWidth !== undefined ? targetWidth : currentWidth;
      const standardWidth = getStandardWikimediaSize(widthToUse);

      // Replace the size in the URL
      return url.replace(`/${currentWidth}px-`, `/${standardWidth}px-`);
    }

    // If it's an original image (doesn't contain '/thumb/'), rewrite it to a thumbnail URL
    if (!url.includes('/thumb/')) {
      const match = url.match(/(https:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+)\/(.+)\/([^/]+)$/);
      if (match) {
        const widthToUse = targetWidth !== undefined ? targetWidth : 640;
        const standardWidth = getStandardWikimediaSize(widthToUse);
        return `${match[1]}/thumb/${match[2]}/${match[3]}/${standardWidth}px-${match[3]}`;
      }
    }

    return url;
  }
}
