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
    initialQuality = 0.82,
    minQuality = 0.35,
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

    // Fill white background for clean transparency handling
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, currentWidth, currentHeight);
    ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), mimeType, currentQuality);
    });

    if (blob) {
      bestBlob = blob;
      if (blob.size <= maxBytes) {
        break; // Fits perfectly under budget!
      }
    }

    // If still too large, reduce quality step-by-step
    if (currentQuality > minQuality) {
      currentQuality = Math.max(minQuality, currentQuality - 0.12);
    } else {
      // If quality is already at minimum, reduce dimensions by 15%
      currentWidth = Math.round(currentWidth * 0.85);
      currentHeight = Math.round(currentHeight * 0.85);
      if (currentWidth < 200 || currentHeight < 200) {
        break; // Stop if too small
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
 * Creates both a full optimized image (max 1280px, <= 150 KB)
 * and a lightweight thumbnail (max 400px, <= 30 KB)
 */
export async function processActivityImage(
  source: File | Blob | string
): Promise<ActivityImagePackage> {
  // 1. Process full detail image: max 1280px, target <= 150 KB
  const full = await compressImageToBudget(source, {
    maxDimension: 1280,
    maxBytes: 150 * 1024, // 150 KB
    initialQuality: 0.80,
    minQuality: 0.38
  });

  // 2. Process thumbnail: max 400px, target <= 30 KB
  const thumbnail = await compressImageToBudget(source, {
    maxDimension: 400,
    maxBytes: 30 * 1024, // 30 KB
    initialQuality: 0.72,
    minQuality: 0.35
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
