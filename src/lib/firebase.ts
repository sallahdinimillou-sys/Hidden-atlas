import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { ListingItem, Region, ItemType, ActivityCategory, ContactInquiry, SiteSettings } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  processActivityImage, 
  compressImageToBudget, 
  calculateObjectByteSize 
} from '../utils/imageCompressor';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId and auto-detect long polling for guaranteed mobile 4G reliability
let dbInstance: any;
try {
  dbInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
      experimentalForceLongPolling: false
    },
    firebaseConfig.firestoreDatabaseId || '(default)'
  );
} catch (e) {
  dbInstance = firebaseConfig.firestoreDatabaseId 
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}
export const db = dbInstance;

// Safe Firebase Auth initialization
let authInstance: any = null;
try {
  authInstance = getAuth(app);
} catch (e) {
  // Auth component is optional and not active for guest booking
  authInstance = null;
}
export const auth = authInstance;

// Initialize Firebase Storage with short retry timeouts to avoid 10-minute silent hangs
export const storage = getStorage(app);
try {
  storage.maxUploadRetryTime = 3000;
  storage.maxOperationRetryTime = 3000;
} catch (e) {
  console.warn('Storage timeout setup warning:', e);
}

export const ACTIVITIES_COLLECTION = 'activities';

// Enum and error handler for Firestore operations
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export type SaveProgressCallback = (progressPercent: number, statusText: string) => void;

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo: currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validates connection to Firestore
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore connection warning: client appears offline.');
      return false;
    }
    return true;
  }
}

// Automatically test connection on boot
testFirestoreConnection().catch(() => {});

/**
 * WebP support detector with memoized result
 */
let isWebpSupportedCache: boolean | null = null;
function checkWebpSupport(): boolean {
  if (isWebpSupportedCache !== null) return isWebpSupportedCache;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const dataUrl = canvas.toDataURL('image/webp');
    isWebpSupportedCache = dataUrl.indexOf('data:image/webp') === 0;
  } catch {
    isWebpSupportedCache = false;
  }
  return isWebpSupportedCache;
}

/**
 * Ultra-fast client-side image compression:
 * - Uses URL.createObjectURL for instantaneous zero-copy memory allocation
 * - Converts to WebP format if supported (saving 30-40% more data vs JPEG)
 * - Constrains max dimension to 1080px (ideal balance of retina sharpness and tiny ~25-45KB payload)
 * - Quality set to 0.68 for ultra-fast mobile upload and storage efficiency
 */
export async function compressImageFile(
  file: File, 
  maxWidth = 1080, 
  maxHeight = 1080, 
  quality = 0.68
): Promise<{ blob: Blob; mimeType: string }> {
  // If SVG or already under 40KB, return original file directly
  if (file.type === 'image/svg+xml' || file.size < 40 * 1024) {
    return { blob: file, mimeType: file.type || 'image/jpeg' };
  }

  return new Promise((resolve) => {
    let objectUrl = '';
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      resolve({ blob: file, mimeType: file.type || 'image/jpeg' });
      return;
    }

    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        resolve({ blob: file, mimeType: file.type || 'image/jpeg' });
        return;
      }

      // Draw background and image
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const supportsWebp = checkWebpSupport();
      const targetMime = supportsWebp ? 'image/webp' : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve({ blob, mimeType: targetMime });
          } else {
            resolve({ blob: file, mimeType: file.type || 'image/jpeg' });
          }
        },
        targetMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ blob: file, mimeType: file.type || 'image/jpeg' });
    };

    img.src = objectUrl;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const SUBCOLLECTION_IMAGES = 'images';

export interface StoredImagesPackage {
  thumbnailUrl: string;
  cleanGalleryUrls: string[];
  hasSubcollectionImages: boolean;
  totalImagesCount: number;
}

/**
 * Checks whether an image URL is a stock / placeholder / unsplash image
 */
export function isStockPhoto(url?: string): boolean {
  if (!url) return false;
  return (
    url.includes('images.unsplash.com') ||
    url.includes('picsum.photos') ||
    url.includes('placeholder.com') ||
    url.includes('via.placeholder')
  );
}

const activityImagesCache = new Map<string, string[]>();

/**
 * Stores activity images safely according to the strict byte budget:
 * - Resizes full image to max 1280px, <= 150 KB
 * - Resizes thumbnail to max 400px, <= 30 KB
 * - Tries Firebase Storage first; if unavailable, stores in subcollection `activities/{activityId}/images/{imageId}`
 * - The main activity document NEVER stores large base64 images, only the small <= 30 KB thumbnail!
 */
export async function storeActivityImages(
  activityId: string,
  newFiles: File[] = [],
  existingUrls: string[] = [],
  onProgress?: SaveProgressCallback
): Promise<StoredImagesPackage> {
  // Purge any stock photo from existingUrls immediately so only user images are kept
  const cleanExisting = Array.from(
    new Set(existingUrls.filter((u) => Boolean(u) && !isStockPhoto(u)))
  ).slice(0, 10);
  const allowedNewFiles = newFiles.slice(0, Math.max(0, 10 - cleanExisting.length));
  const totalCount = cleanExisting.length + allowedNewFiles.length;

  let hasSubcollectionImages = false;
  const cleanGalleryUrls: string[] = [];
  let primaryThumbnail = '';

  // Process existing images
  for (let i = 0; i < cleanExisting.length; i++) {
    const url = cleanExisting[i];
    if (typeof url === 'string') {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        cleanGalleryUrls.push(url);
        if (!primaryThumbnail) primaryThumbnail = url;
      } else if (url.startsWith('data:')) {
        // Base64 existing image: compress to budget and store in subcollection
        try {
          const pkg = await processActivityImage(url);
          if (!primaryThumbnail) primaryThumbnail = pkg.thumbnail.dataUrl;

          const imgDocId = `img_exist_${i}_${Date.now().toString(36)}`;
          await setDoc(doc(db, ACTIVITIES_COLLECTION, activityId, SUBCOLLECTION_IMAGES, imgDocId), {
            id: imgDocId,
            activityId,
            dataUrl: pkg.full.dataUrl,
            index: i,
            createdAt: new Date().toISOString()
          });
          hasSubcollectionImages = true;
        } catch (err) {
          console.warn('Could not re-compress existing base64 image:', err);
        }
      }
    }
  }

  // Process new uploaded files
  if (allowedNewFiles.length > 0) {
    if (onProgress) {
      onProgress(20, `جاري ضغط ومعالجة ${allowedNewFiles.length} ${allowedNewFiles.length === 1 ? 'صورة' : 'صور'} بتقنية WebP...`);
    }

    for (let index = 0; index < allowedNewFiles.length; index++) {
      const file = allowedNewFiles[index];
      const overallIndex = cleanExisting.length + index;

      if (onProgress) {
        const pct = Math.round(20 + ((index + 1) / allowedNewFiles.length) * 55);
        onProgress(pct, `جاري تجهيز الصورة ${index + 1} من ${allowedNewFiles.length}...`);
      }

      // Step 1: Compress to budget: full <= 150KB, thumbnail <= 30KB
      const pkg = await processActivityImage(file);
      if (!primaryThumbnail) {
        primaryThumbnail = pkg.thumbnail.dataUrl;
      }

      // Step 2: Attempt Firebase Storage upload
      let storageUploaded = false;
      try {
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const extension = pkg.full.mimeType === 'image/webp' ? 'webp' : 'jpg';
        const storagePath = `activities/${activityId}/${Date.now()}_${index}_${cleanName}.${extension}`;
        const storageRef = ref(storage, storagePath);

        const uploadTask = uploadBytes(storageRef, pkg.full.blob, {
          contentType: pkg.full.mimeType,
          customMetadata: { format: pkg.full.mimeType }
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('STORAGE_TIMEOUT')), 3500)
        );

        const snapshot = await Promise.race([uploadTask, timeoutPromise]);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        cleanGalleryUrls.push(downloadUrl);
        storageUploaded = true;
      } catch (storageErr) {
        // Storage failed or timed out: use subcollection fallback
        storageUploaded = false;
      }

      // Step 3: If not stored in Storage, store in subcollection
      if (!storageUploaded) {
        const subDocId = `img_${overallIndex}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        await setDoc(doc(db, ACTIVITIES_COLLECTION, activityId, SUBCOLLECTION_IMAGES, subDocId), {
          id: subDocId,
          activityId,
          dataUrl: pkg.full.dataUrl, // <= 150 KB, well under 700KB and 1MB Firestore limit
          index: overallIndex,
          createdAt: new Date().toISOString()
        });
        hasSubcollectionImages = true;
      }
    }
  }

  // Cover image: first clean image or empty (NEVER a stock photo!)
  if (!primaryThumbnail) {
    primaryThumbnail = cleanGalleryUrls[0] || '';
  }

  // Invalidate cache so newly stored images are loaded immediately
  activityImagesCache.delete(activityId);

  return {
    thumbnailUrl: primaryThumbnail,
    cleanGalleryUrls,
    hasSubcollectionImages,
    totalImagesCount: totalCount
  };
}

/**
 * Fetch detail high-resolution gallery images from the subcollection lazily with in-memory caching
 */
export async function fetchActivityImages(activityId: string, bypassCache = false): Promise<string[]> {
  if (!activityId) return [];
  if (!bypassCache && activityImagesCache.has(activityId)) {
    return activityImagesCache.get(activityId)!;
  }

  let images: string[] = [];
  try {
    const imagesRef = collection(db, ACTIVITIES_COLLECTION, activityId, SUBCOLLECTION_IMAGES);
    const q = query(imagesRef, orderBy('index', 'asc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      images = snap.docs
        .map((d) => d.data().dataUrl)
        .filter((u) => Boolean(u) && !isStockPhoto(u));
    }
  } catch (err) {
    try {
      const snap = await getDocs(collection(db, ACTIVITIES_COLLECTION, activityId, SUBCOLLECTION_IMAGES));
      images = snap.docs
        .map((d) => d.data())
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
        .map((d) => d.dataUrl)
        .filter((u) => Boolean(u) && !isStockPhoto(u));
    } catch (e) {
      console.warn(`Could not fetch subcollection images for activity ${activityId}:`, e);
    }
  }

  activityImagesCache.set(activityId, images);
  return images;
}

/**
 * Clean up subcollection documents and storage references for an activity
 */
export async function deleteActivityImages(activityId: string, imageUrls: string[] = []): Promise<void> {
  activityImagesCache.delete(activityId);

  // 1. Delete all subcollection docs
  try {
    const subSnap = await getDocs(collection(db, ACTIVITIES_COLLECTION, activityId, SUBCOLLECTION_IMAGES));
    const deletePromises = subSnap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Subcollection cleanup notice:', err);
  }

  // 2. Delete any Storage images
  for (const url of imageUrls) {
    if (url && (url.includes('firebasestorage.googleapis.com') || url.includes('firebasestorage.app'))) {
      try {
        const imageRef = ref(storage, url);
        await deleteObject(imageRef);
      } catch (err) {
        console.warn('Could not delete image from Firebase Storage:', err);
      }
    }
  }
}

/**
 * One-time safe migration that scans existing activities:
 * If any activity has large base64 images inside its main document,
 * compresses them, moves them to the subcollection, and replaces the main image with a <= 30KB thumbnail.
 */
export async function migrateLargeActivityDocuments(): Promise<number> {
  let migratedCount = 0;
  try {
    const snap = await getDocs(collection(db, ACTIVITIES_COLLECTION));
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const rawGallery = Array.isArray(data.gallery) ? data.gallery : [];
      const rawImages = Array.isArray(data.images) ? data.images : [];
      const allUrls = Array.from(new Set([data.imageUrl, ...rawGallery, ...rawImages].filter(Boolean)));

      const hasLargeBase64 = allUrls.some(
        (u) => typeof u === 'string' && u.startsWith('data:') && u.length > 35000
      );

      if (hasLargeBase64) {
        console.log(`[Safe Migration] Migrating oversized activity doc: ${docSnap.id}`);
        let subIndex = 0;
        let smallCoverThumbnail = '';

        for (const imgStr of allUrls) {
          if (typeof imgStr === 'string' && imgStr.startsWith('data:')) {
            const pkg = await processActivityImage(imgStr);
            if (!smallCoverThumbnail) smallCoverThumbnail = pkg.thumbnail.dataUrl;

            const imgDocId = `migrated_${subIndex}_${Date.now().toString(36)}`;
            await setDoc(doc(db, ACTIVITIES_COLLECTION, docSnap.id, SUBCOLLECTION_IMAGES, imgDocId), {
              id: imgDocId,
              activityId: docSnap.id,
              dataUrl: pkg.full.dataUrl,
              index: subIndex++,
              createdAt: new Date().toISOString()
            });
          }
        }

        // Clean main document so its size drops from >1MB to < 40 KB (NO stock photo fallbacks!)
        const safeCover = (!isStockPhoto(smallCoverThumbnail) ? smallCoverThumbnail : '') || (!isStockPhoto(data.imageUrl) ? data.imageUrl : '');
        await updateDoc(docSnap.ref, {
          imageUrl: safeCover,
          gallery: (data.gallery || []).filter((u: string) => !u.startsWith('data:') && !isStockPhoto(u)),
          images: (data.images || []).filter((u: string) => !u.startsWith('data:') && !isStockPhoto(u)),
          hasSubcollectionImages: true,
          updatedAt: new Date().toISOString()
        });
        migratedCount++;
      }
    }
  } catch (err) {
    console.warn('Migration scan completed:', err);
  }
  return migratedCount;
}

/**
 * Convert a Firestore Document Data into a clean ListingItem (NO hardcoded default/stock photos!)
 */
export function formatDocToListing(id: string, data: any): ListingItem {
  const priceMAD = Number(data.priceMAD !== undefined ? data.priceMAD : (data.price || 0));
  
  let rawImages: string[] = [];
  if (Array.isArray(data.gallery) && data.gallery.length > 0) {
    rawImages = data.gallery;
  } else if (Array.isArray(data.images) && data.images.length > 0) {
    rawImages = data.images;
  } else if (data.imageUrl) {
    rawImages = [data.imageUrl];
  } else {
    rawImages = [];
  }

  // Filter out any stock photos completely
  const images = Array.from(new Set(rawImages.filter((u) => Boolean(u) && !isStockPhoto(u))));
  const primaryImageUrl = (!isStockPhoto(data.imageUrl) ? data.imageUrl : '') || images[0] || '';

  return {
    id: id,
    type: (data.type as ItemType) || 'trip',
    category: (data.category as ActivityCategory) || 'mountain-trekking',
    title: data.title || 'Toubkal Peak & Atlas Trek',
    arabicTitle: data.arabicTitle || data.title || '',
    tagline: data.tagline || data.description?.slice(0, 80) || data.overview?.slice(0, 80) || '',
    region: (data.region as Region) || 'atlas-mountains',
    location: data.location || (data.city ? `${data.city}, Morocco` : 'Imlil, Mount Toubkal, Morocco'),
    city: data.city || 'Imlil, High Atlas',
    duration: data.duration || '2 Days / 1 Night',
    groupSize: data.groupSize || 'Private / Small Group',
    difficulty: data.difficulty || 'Moderate',
    rating: typeof data.rating === 'number' ? data.rating : 5.0,
    reviewsCount: typeof data.reviewsCount === 'number' ? data.reviewsCount : 18,
    priceMAD: priceMAD,
    priceUSD: data.priceUSD || Math.round(priceMAD * 0.1),
    priceEUR: data.priceEUR || Math.round(priceMAD * 0.093),
    priceGBP: data.priceGBP || Math.round(priceMAD * 0.08),
    originalPriceMAD: data.originalPriceMAD || undefined,
    groupPricing: Array.isArray(data.groupPricing) && data.groupPricing.length > 0
      ? data.groupPricing
          .map((t: any) => ({
            min: Number(t.min) || 1,
            max: t.max !== undefined && t.max !== null && t.max !== '' ? Number(t.max) : undefined,
            pricePerPerson: Number(t.pricePerPerson) || 0
          }))
          .filter((t: any) => t.pricePerPerson > 0)
          .sort((a: any, b: any) => a.min - b.min)
      : undefined,
    groupPricingCurrency: data.groupPricingCurrency || 'EUR',
    featured: Boolean(data.featured),
    bestseller: Boolean(data.bestseller),
    promoBadge: data.promoBadge || '',
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 999,
    imageUrl: primaryImageUrl,
    gallery: images,
    overview: data.overview || data.description || '',
    highlights: Array.isArray(data.highlights) && data.highlights.length > 0 
      ? data.highlights 
      : ['Personal Certified Local Guide', 'Summit Mount Toubkal (4,167m)', 'Traditional Berber Village Hospitality'],
    included: Array.isArray(data.included) && data.included.length > 0 
      ? data.included 
      : ['Certified Local Guide', 'Imlil Transport & Mule Support', 'Mountain Meals & Mint Tea'],
    notIncluded: Array.isArray(data.notIncluded) && data.notIncluded.length > 0 
      ? data.notIncluded 
      : ['Personal purchases', 'Sleeping bag rental'],
    meetingPoint: data.meetingPoint || 'Imlil Village Center or Marrakech Pickup by Arrangement',
    cancellationPolicy: data.cancellationPolicy || 'Free cancellation up to 24 hours before start',
    hostName: data.hostName || 'Hossain Amalo',
    hostRole: data.hostRole || 'Your Local Moroccan Guide',
    hostAvatar: data.hostAvatar || '',
    hostLanguages: Array.isArray(data.hostLanguages) ? data.hostLanguages : ['Arabic', 'English', 'French', 'Berber'],
    availableAddons: Array.isArray(data.availableAddons) ? data.availableAddons : [],
    itinerary: data.itinerary || undefined
  };
}

// Known legacy mock activity IDs to delete permanently if ever found
const LEGACY_MOCK_ACTIVITY_IDS = new Set([
  'toubkal-summit-2days',
  'lake-ifni-alpine-trek',
  'sahara-desert-merzouga-tour',
  'sunset-camel-ride-sahara',
  'high-atlas-horseback-adventure',
  'berber-villages-imlil-daytrip',
  'essaouira-coastal-daytrip'
]);

/**
 * Subscribe in real-time to the "activities" collection across all devices.
 * The Firestore collection is the authoritative single source of truth.
 * NEVER auto-seeds or falls back to demo data. If empty, renders clean empty state.
 */
export function subscribeToActivities(
  onUpdate: (items: ListingItem[]) => void,
  onError?: (err: Error) => void
) {
  const activitiesRef = collection(db, ACTIVITIES_COLLECTION);

  return onSnapshot(
    activitiesRef,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }

      const items: ListingItem[] = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.id.startsWith('__')) return;
        // Permanently purge any legacy mock activity document if detected
        if (LEGACY_MOCK_ACTIVITY_IDS.has(docSnap.id)) {
          deleteDoc(doc(db, ACTIVITIES_COLLECTION, docSnap.id)).catch(() => {});
          return;
        }
        items.push(formatDocToListing(docSnap.id, docSnap.data()));
      });

      // Sort with custom sortOrder first, then featured, then rating
      items.sort((a, b) => {
        const orderA = typeof a.sortOrder === 'number' ? a.sortOrder : 999;
        const orderB = typeof b.sortOrder === 'number' ? b.sortOrder : 999;
        if (orderA !== orderB) return orderA - orderB;
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.rating || 0) - (a.rating || 0);
      });

      onUpdate(items);
    },
    (error) => {
      console.error('Real-time sync error on activities collection:', error);
      if (onError) {
        onError(error as Error);
      }
      try {
        handleFirestoreError(error, OperationType.GET, ACTIVITIES_COLLECTION);
      } catch (errInfo) {
        // Structured error logged
      }
    }
  );
}

/**
 * Reorder activities directly in Firestore
 */
export async function reorderActivitiesInFirestore(
  firstId: string,
  firstOrder: number,
  secondId: string,
  secondOrder: number
): Promise<void> {
  try {
    await updateDoc(doc(db, ACTIVITIES_COLLECTION, firstId), { sortOrder: firstOrder });
    await updateDoc(doc(db, ACTIVITIES_COLLECTION, secondId), { sortOrder: secondOrder });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ACTIVITIES_COLLECTION}/${firstId}`);
  }
}

/**
 * Create a new Activity in Firestore with strict image budgeting and subcollection storage
 */
export async function createFirestoreActivity(
  itemData: Partial<ListingItem> & { title: string; priceMAD: number; duration: string; region: Region },
  newImageFiles?: File[],
  onProgress?: SaveProgressCallback
): Promise<string> {
  const activitiesRef = collection(db, ACTIVITIES_COLLECTION);
  const docRef = doc(activitiesRef);
  const activityId = docRef.id;

  try {
    const existingImages = itemData.gallery && itemData.gallery.length > 0 
      ? itemData.gallery 
      : (itemData.imageUrl ? [itemData.imageUrl] : []);

    // Store images safely: full <= 150KB (Storage or subcollection), thumbnail <= 30KB
    const imagePackage = await storeActivityImages(
      activityId,
      newImageFiles || [],
      existingImages,
      onProgress
    );

    if (onProgress) {
      onProgress(88, 'جاري حفظ النشاط في قاعدة البيانات...');
    }

    // Parse and sanitize group pricing
    const parsedGroupPricing = Array.isArray(itemData.groupPricing)
      ? itemData.groupPricing
          .map((t) => {
            const minVal = Math.max(1, Math.round(Number(t.min) || 1));
            const hasMax = t.max !== undefined && t.max !== null && (t.max as unknown) !== '' && !isNaN(Number(t.max));
            const maxVal = hasMax ? Math.max(minVal, Math.round(Number(t.max))) : undefined;
            return {
              min: minVal,
              ...(maxVal !== undefined ? { max: maxVal } : {}),
              pricePerPerson: Math.max(0, Number(t.pricePerPerson) || 0)
            };
          })
          .filter((t) => t.pricePerPerson > 0)
          .sort((a, b) => a.min - b.min)
      : [];

    let price = Number(itemData.priceMAD || 0);
    if (price <= 0 && parsedGroupPricing.length > 0) {
      const firstTierPrice = parsedGroupPricing[0].pricePerPerson;
      const cur = itemData.groupPricingCurrency || 'EUR';
      if (cur === 'MAD') price = Math.round(firstTierPrice);
      else if (cur === 'USD') price = Math.round(firstTierPrice * 10);
      else if (cur === 'GBP') price = Math.round(firstTierPrice * 12.5);
      else price = Math.round(firstTierPrice * 10.8);
    }
    if (price <= 0) price = 450;

    const docData: any = {
      id: activityId,
      title: itemData.title.trim(),
      arabicTitle: itemData.arabicTitle?.trim() || itemData.title.trim(),
      description: itemData.overview?.trim() || itemData.tagline?.trim() || '',
      overview: itemData.overview?.trim() || '',
      tagline: itemData.tagline?.trim() || '',
      price: price,
      priceMAD: price,
      priceUSD: itemData.priceUSD || Math.round(price * 0.1),
      priceEUR: itemData.priceEUR || Math.round(price * 0.093),
      priceGBP: itemData.priceGBP || Math.round(price * 0.08),
      originalPriceMAD: itemData.originalPriceMAD || null,
      groupPricing: parsedGroupPricing,
      groupPricingCurrency: itemData.groupPricingCurrency || 'EUR',
      duration: (itemData.duration && itemData.duration.trim()) || 'يوم كامل (Full Day)',
      type: itemData.type || 'trip',
      category: itemData.category || 'mountain-trekking',
      region: itemData.region,
      city: itemData.city || 'Imlil, High Atlas',
      location: itemData.location || `${itemData.city || 'Imlil'}, Morocco`,
      groupSize: itemData.groupSize || 'Small Group',
      difficulty: itemData.difficulty || 'Moderate',
      rating: itemData.rating || 5.0,
      reviewsCount: itemData.reviewsCount || 1,
      featured: Boolean(itemData.featured),
      bestseller: Boolean(itemData.bestseller),
      promoBadge: itemData.promoBadge || '',
      // Main document only stores lightweight thumbnail and public URLs (NEVER large base64!)
      imageUrl: imagePackage.thumbnailUrl,
      gallery: imagePackage.cleanGalleryUrls,
      images: imagePackage.cleanGalleryUrls,
      hasSubcollectionImages: imagePackage.hasSubcollectionImages,
      totalImagesCount: imagePackage.totalImagesCount,
      highlights: itemData.highlights || [],
      included: itemData.included || [],
      notIncluded: itemData.notIncluded || [],
      meetingPoint: itemData.meetingPoint || 'Central Meeting Point or Pickup by Arrangement',
      cancellationPolicy: itemData.cancellationPolicy || 'Free cancellation up to 24 hours before start',
      hostName: itemData.hostName || 'Hossain Amalo',
      hostRole: itemData.hostRole || 'Certified Toubkal & Mountain Guide',
      hostAvatar: itemData.hostAvatar || '',
      hostLanguages: itemData.hostLanguages || ['Arabic', 'English', 'French', 'Berber'],
      availableAddons: itemData.availableAddons || [],
      availability: 'available',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdTimestamp: serverTimestamp()
    };

    // HARD SAFETY SIZE CHECK: Guarantee docData is well under the 1MB Firestore limit
    const byteSize = calculateObjectByteSize(docData);
    if (byteSize > 400000) {
      console.warn(`[Size Alert] Activity document size is ${byteSize} bytes. Pruning gallery data URLs...`);
      docData.gallery = (docData.gallery || []).filter((u: string) => !u.startsWith('data:'));
      docData.images = (docData.images || []).filter((u: string) => !u.startsWith('data:'));
    }

    // Write to Firestore with robust retry and 40s mobile guard
    let writeSuccess = false;
    let writeErr: any = null;

    for (let attempt = 1; attempt <= 2 && !writeSuccess; attempt++) {
      try {
        await Promise.race([
          setDoc(docRef, docData),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('TIMEOUT')), attempt === 1 ? 35000 : 45000)
          )
        ]);
        writeSuccess = true;
      } catch (err: any) {
        writeErr = err;
        console.warn(`Firestore setDoc attempt ${attempt} warning:`, err);
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    if (!writeSuccess) {
      if (writeErr?.message === 'TIMEOUT') {
        throw new Error('استغرق الحفظ في قاعدة البيانات وقتاً طويلاً بسبب ضعف الاتصال، يرجى المحاولة ثانية.');
      }
      throw writeErr;
    }

    if (onProgress) {
      onProgress(100, 'تم الحفظ والنشر بنجاح!');
    }

    return activityId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${ACTIVITIES_COLLECTION}/${activityId}`);
  }
}

/**
 * Update an existing Activity in Firestore with strict image budgeting and subcollection storage
 */
export async function updateFirestoreActivity(
  id: string,
  itemData: Partial<ListingItem>,
  newImageFiles?: File[],
  onProgress?: SaveProgressCallback
): Promise<void> {
  const docRef = doc(db, ACTIVITIES_COLLECTION, id);

  try {
    const existingImages = itemData.gallery || (itemData.imageUrl ? [itemData.imageUrl] : []);

    // Store images safely: full <= 150KB (Storage or subcollection), thumbnail <= 30KB
    const imagePackage = await storeActivityImages(
      id,
      newImageFiles || [],
      existingImages,
      onProgress
    );

    if (onProgress) {
      onProgress(88, 'جاري تحديث النشاط في قاعدة البيانات...');
    }

    const price = Number(itemData.priceMAD !== undefined ? itemData.priceMAD : (itemData as any).price || 0);

    const updates: any = {
      updatedAt: new Date().toISOString(),
      updatedTimestamp: serverTimestamp(),
      imageUrl: imagePackage.thumbnailUrl,
      gallery: imagePackage.cleanGalleryUrls,
      images: imagePackage.cleanGalleryUrls,
      hasSubcollectionImages: imagePackage.hasSubcollectionImages,
      totalImagesCount: imagePackage.totalImagesCount
    };

    if (itemData.title !== undefined) updates.title = itemData.title.trim();
    if (itemData.arabicTitle !== undefined) updates.arabicTitle = itemData.arabicTitle.trim();
    if (itemData.overview !== undefined) {
      updates.overview = itemData.overview.trim();
      updates.description = itemData.overview.trim();
    }
    if (itemData.tagline !== undefined) updates.tagline = itemData.tagline.trim();
    if (itemData.priceMAD !== undefined) {
      updates.price = price;
      updates.priceMAD = price;
      updates.priceUSD = itemData.priceUSD || Math.round(price * 0.1);
      updates.priceEUR = itemData.priceEUR || Math.round(price * 0.093);
      updates.priceGBP = itemData.priceGBP || Math.round(price * 0.08);
    }
    if (itemData.originalPriceMAD !== undefined) updates.originalPriceMAD = itemData.originalPriceMAD;
    if (itemData.duration !== undefined) updates.duration = itemData.duration.trim();
    if (itemData.type !== undefined) updates.type = itemData.type;
    if (itemData.category !== undefined) updates.category = itemData.category;
    if (itemData.region !== undefined) updates.region = itemData.region;
    if (itemData.city !== undefined) updates.city = itemData.city;
    if (itemData.location !== undefined) updates.location = itemData.location;
    if (itemData.groupSize !== undefined) updates.groupSize = itemData.groupSize;
    if (itemData.difficulty !== undefined) updates.difficulty = itemData.difficulty;
    if (itemData.rating !== undefined) updates.rating = itemData.rating;
    if (itemData.reviewsCount !== undefined) updates.reviewsCount = itemData.reviewsCount;
    if (itemData.featured !== undefined) updates.featured = itemData.featured;
    if (itemData.bestseller !== undefined) updates.bestseller = itemData.bestseller;
    if (itemData.promoBadge !== undefined) updates.promoBadge = itemData.promoBadge;
    if (itemData.highlights !== undefined) updates.highlights = itemData.highlights;
    if (itemData.included !== undefined) updates.included = itemData.included;
    if (itemData.notIncluded !== undefined) updates.notIncluded = itemData.notIncluded;
    if (itemData.meetingPoint !== undefined) updates.meetingPoint = itemData.meetingPoint;
    if (itemData.cancellationPolicy !== undefined) updates.cancellationPolicy = itemData.cancellationPolicy;
    if (itemData.hostName !== undefined) updates.hostName = itemData.hostName;
    if (itemData.hostRole !== undefined) updates.hostRole = itemData.hostRole;
    if (itemData.availableAddons !== undefined) updates.availableAddons = itemData.availableAddons;
    if (itemData.groupPricing !== undefined) {
      updates.groupPricing = Array.isArray(itemData.groupPricing)
        ? itemData.groupPricing
            .map((t) => {
              const minVal = Math.max(1, Math.round(Number(t.min) || 1));
              const hasMax = t.max !== undefined && t.max !== null && (t.max as unknown) !== '' && !isNaN(Number(t.max));
              const maxVal = hasMax ? Math.max(minVal, Math.round(Number(t.max))) : undefined;
              return {
                min: minVal,
                ...(maxVal !== undefined ? { max: maxVal } : {}),
                pricePerPerson: Math.max(0, Number(t.pricePerPerson) || 0)
              };
            })
            .filter((t) => t.pricePerPerson > 0)
            .sort((a, b) => a.min - b.min)
        : [];
    }
    if (itemData.groupPricingCurrency !== undefined) {
      updates.groupPricingCurrency = itemData.groupPricingCurrency || 'EUR';
    }

    // HARD SAFETY SIZE CHECK
    const byteSize = calculateObjectByteSize(updates);
    if (byteSize > 400000) {
      console.warn(`[Size Alert] Activity updates size is ${byteSize} bytes. Pruning data URLs...`);
      updates.gallery = (updates.gallery || []).filter((u: string) => !u.startsWith('data:'));
      updates.images = (updates.images || []).filter((u: string) => !u.startsWith('data:'));
    }

    // Write update to Firestore with robust retry and extended 40s timeout for mobile 4G
    let updateSuccess = false;
    let updateErr: any = null;

    for (let attempt = 1; attempt <= 2 && !updateSuccess; attempt++) {
      try {
        await Promise.race([
          updateDoc(docRef, updates),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('TIMEOUT')), attempt === 1 ? 35000 : 45000)
          )
        ]);
        updateSuccess = true;
      } catch (err: any) {
        updateErr = err;
        console.warn(`Firestore updateDoc attempt ${attempt} warning:`, err);
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    if (!updateSuccess) {
      if (updateErr?.message === 'TIMEOUT') {
        throw new Error('استغرق التحديث في قاعدة البيانات وقتاً طويلاً بسبب ضعف الاتصال، يرجى المحاولة ثانية.');
      }
      throw updateErr;
    }

    if (onProgress) {
      onProgress(100, 'تم التحديث بنجاح!');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ACTIVITIES_COLLECTION}/${id}`);
  }
}

/**
 * Delete an Activity from Firestore and its associated subcollection documents & Storage images
 */
export async function deleteFirestoreActivity(id: string, imagesToDelete: string[] = []): Promise<void> {
  const docRef = doc(db, ACTIVITIES_COLLECTION, id);
  try {
    await deleteDoc(docRef);
    await deleteActivityImages(id, imagesToDelete);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ACTIVITIES_COLLECTION}/${id}`);
  }
}

export const INQUIRIES_COLLECTION = 'inquiries';

/**
 * Submit a customer inquiry / message from the Contact Form into Firestore
 */
export async function submitContactInquiry(inquiryData: {
  name: string;
  phone?: string;
  email?: string;
  subject?: string;
  message: string;
}): Promise<string> {
  const inquiriesRef = collection(db, INQUIRIES_COLLECTION);
  const docRef = doc(inquiriesRef);
  const id = docRef.id;

  const newInquiry: Omit<ContactInquiry, 'id'> & { createdTimestamp: any } = {
    name: inquiryData.name.trim(),
    phone: inquiryData.phone?.trim() || '',
    email: inquiryData.email?.trim() || '',
    subject: inquiryData.subject?.trim() || 'General Inquiry',
    message: inquiryData.message.trim(),
    status: 'unread',
    createdAt: new Date().toISOString(),
    createdTimestamp: serverTimestamp()
  };

  await setDoc(docRef, newInquiry);
  return id;
}

/**
 * Subscribe in real-time to customer inquiries for the Admin Dashboard
 */
export function subscribeToInquiries(
  onUpdate: (items: ContactInquiry[]) => void,
  onError?: (err: Error) => void
) {
  const inquiriesRef = collection(db, INQUIRIES_COLLECTION);

  return onSnapshot(
    inquiriesRef,
    (snapshot) => {
      const items: ContactInquiry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || 'Visitor',
          phone: data.phone || '',
          email: data.email || '',
          subject: data.subject || 'General Inquiry',
          message: data.message || '',
          status: data.status || 'unread',
          createdAt: data.createdAt || new Date().toISOString()
        });
      });

      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    },
    (err) => {
      console.warn('Inquiries subscription warning:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Update the status of an inquiry (e.g. 'unread' -> 'contacted' -> 'resolved')
 */
export async function updateInquiryStatus(
  id: string,
  status: 'unread' | 'contacted' | 'resolved'
): Promise<void> {
  const docRef = doc(db, INQUIRIES_COLLECTION, id);
  await updateDoc(docRef, { status });
}

/**
 * Delete an inquiry from Firestore
 */
export async function deleteInquiry(id: string): Promise<void> {
  const docRef = doc(db, INQUIRIES_COLLECTION, id);
  await deleteDoc(docRef);
}

export const SETTINGS_COLLECTION = 'settings';
export const SETTINGS_DOC_ID = 'general';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  whatsappNumber: '+212662634926',
  whatsappDisplay: '0662634926',
  facebookUrl: 'https://www.facebook.com/share/18k4njmMaP/?mibextid=wwXIfr',
  instagramUrl: 'https://www.instagram.com/amalo_hossain?obrf=aDd4N2gwNTAyZTd5&utm_source=qr',
  heroImageUrl: '',
  guideName: 'Hossain Amalo',
  guideRole: 'Your Local Tour Guide in Morocco',
  guideBio: 'Born and raised in the High Atlas Mountains at the foot of Mount Toubkal, with over 12 years of mountain trekking, desert guiding, and sharing genuine Berber hospitality.',
  email: 'houssainbaaki71@gmail.com'
};

/**
 * Subscribe in real-time to site settings (WhatsApp, social media, hero banner, guide info)
 */
export function subscribeToSiteSettings(
  onUpdate: (settings: SiteSettings) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const safeHero = !isStockPhoto(data.heroImageUrl) ? (data.heroImageUrl || '') : '';
        onUpdate({
          ...DEFAULT_SITE_SETTINGS,
          ...data,
          heroImageUrl: safeHero
        });
      } else {
        onUpdate(DEFAULT_SITE_SETTINGS);
      }
    },
    (err) => {
      console.warn('Settings subscription notice, falling back to defaults:', err);
      onUpdate(DEFAULT_SITE_SETTINGS);
      if (onError) onError(err as Error);
    }
  );
}

/**
 * Update site settings in Firestore with image budgeting and size check
 */
export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  try {
    const sanitized = { ...updates };

    // Compress hero image if base64 to max 1280px and <= 140 KB
    if (sanitized.heroImageUrl && sanitized.heroImageUrl.startsWith('data:')) {
      try {
        const compressed = await compressImageToBudget(sanitized.heroImageUrl, {
          maxDimension: 1280,
          maxBytes: 140 * 1024,
          initialQuality: 0.78
        });
        sanitized.heroImageUrl = compressed.dataUrl;
      } catch (e) {
        console.warn('Could not compress hero image, retaining original:', e);
      }
    }

    // Safety size check: settings document must not exceed 500 KB
    const byteSize = calculateObjectByteSize(sanitized);
    if (byteSize > 500000) {
      console.warn(`[Settings Size Alert] Document size ${byteSize} exceeds limit, stripping large hero media.`);
      delete sanitized.heroImageUrl;
    }

    await setDoc(docRef, {
      ...sanitized,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`);
  }
}


