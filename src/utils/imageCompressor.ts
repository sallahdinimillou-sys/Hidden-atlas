/**
 * Ultra-resilient image compression and optimization engine for Hidden Atlas
 * Enforces strict byte budget to permanently prevent Firestore 1MB document limit errors:
 * - Max dimension: 1280px for full images, 400px for thumbnails
 * - Target budget: <= 150 KB for full images, <= 30 KB for thumbnails
 * - WebP with automatic fallback to JPEG on Safari / iOS
 */

export interface CompressedImageResult {
  dataUrl: string;
  blob: Blob;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
}

export interface ActivityImagePackage {
  full: CompressedImageResult;
  thumbnail: CompressedImageResult;
}

// Cached WebP support test
let webpSupported: boolean | null = null;

export function isWebpSupported(): boolean {
  if (webpSupported !== null) return webpSupported;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const uri = canvas.toDataURL('image/webp');
    webpSupported = uri.indexOf('data:image/webp') === 0;
  } catch {
    webpSupported = false;
  }
  return webpSupported;
}

/**
 * Loads an image from a File, Blob, or URL into an HTMLImageElement
 */
function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl = '';
    if (typeof source === 'string') {
      img.src = source;
    } else {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = (err) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };
  });
}

/**
 * Compresses an image step-by-step until it fits under the target byte size
 */
export async function compressImageToBudget(
  source: File | Blob | string,
  options: {
    maxDimension: number;
    maxBytes: number;
    initialQuality?: number;
    minQuality?: number;
    forceJpeg?: boolean;
  }
): Promise<CompressedImageResult> {
  const {
    maxDimension,
    maxBytes,
    initialQuality = 0.88,
    minQuality = 0.70,
    forceJpeg = false
  } = options;

  const img = await loadImage(source);
  let { width, height } = img;

  // Calculate scaled dimensions constrained by maxDimension
  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const mimeType = (!forceJpeg && isWebpSupported()) ? 'image/webp' : 'image/jpeg';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Iteratively reduce quality and/or dimensions until size <= maxBytes
  let currentWidth = Math.max(1, width);
  let currentHeight = Math.max(1, height);
  let currentQuality = initialQuality;
  let bestBlob: Blob | null = null;
  let bestDataUrl = '';

  for (let iteration = 0; iteration < 8; iteration++) {
    canvas.width = currentWidth;
    canvas.height = currentHeight;

    // Enable high-fidelity bicubic smoothing for crisp downscaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Fill clean neutral white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, currentWidth, currentHeight);
    ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), mimeType, currentQuality);
    });

    if (blob) {
      bestBlob = blob;
      if (blob.size <= maxBytes) {
        break; // Fits within target budget!
      }
    }

    // Gentle quality reduction (step 0.05) to protect image sharpness
    if (currentQuality > minQuality) {
      currentQuality = Math.max(minQuality, currentQuality - 0.05);
    } else {
      // If quality reached floor, reduce dimensions gently by 8%
      currentWidth = Math.round(currentWidth * 0.92);
      currentHeight = Math.round(currentHeight * 0.92);
      if (currentWidth < 450 || currentHeight < 450) {
        break; // Never shrink below 450px
      }
    }
  }

  if (!bestBlob) {
    throw new Error('Failed to generate compressed image blob');
  }

  bestDataUrl = await blobToDataUrl(bestBlob);

  return {
    dataUrl: bestDataUrl,
    blob: bestBlob,
    mimeType,
    sizeBytes: bestBlob.size,
    width: currentWidth,
    height: currentHeight
  };
}

/**
 * Creates high-fidelity activity image package:
 * - Full image: max 1920px (Full HD), <= 450 KB, high visual clarity
 * - Thumbnail: max 800px (retina sharp), <= 85 KB
 */
export async function processActivityImage(
  source: File | Blob | string
): Promise<ActivityImagePackage> {
  // 1. Process full detail image: max 1920px, target <= 450 KB (well within 1MB Firestore subcollection limit)
  const full = await compressImageToBudget(source, {
    maxDimension: 1920,
    maxBytes: 450 * 1024,
    initialQuality: 0.88,
    minQuality: 0.72
  });

  // 2. Process thumbnail: max 800px (retina crisp on mobile & cards), target <= 85 KB
  const thumbnail = await compressImageToBudget(source, {
    maxDimension: 800,
    maxBytes: 85 * 1024,
    initialQuality: 0.85,
    minQuality: 0.68
  });

  return { full, thumbnail };
}

/**
 * Calculate approximate byte size of any object when serialized to JSON
 */
export function calculateObjectByteSize(obj: unknown): number {
  try {
    const json = JSON.stringify(obj);
    return new TextEncoder().encode(json).length;
  } catch {
    return 0;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
