import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Image as ImageIcon, 
  MapPin, 
  Upload, 
  Loader2, 
  Clock, 
  Sparkles, 
  Check,
  Eye,
  EyeOff,
  MessageSquare,
  KeyRound,
  ShieldCheck,
  Layers,
  Phone,
  Mail,
  RefreshCw,
  ExternalLink,
  Languages,
  Calendar,
  Save,
  ArrowUp,
  ArrowDown,
  Star,
  Users,
  Mountain
} from 'lucide-react';
import { ListingItem, ItemType, Region, ActivityCategory, LanguageCode, ContactInquiry, SiteSettings, GroupPricingTier, Currency } from '../types';
import { 
  validateGroupPricingTiers, 
  formatGroupPricingRange, 
  formatGroupPricingPrice, 
  getCurrencySymbol, 
  getLowestTierPrice 
} from '../utils/groupPricing';
import { 
  subscribeToInquiries, 
  updateInquiryStatus, 
  deleteInquiry,
  ACTIVITIES_COLLECTION,
  updateSiteSettings,
  reorderActivitiesInFirestore,
  DEFAULT_SITE_SETTINGS,
  fetchActivityImages
} from '../lib/firebase';
import { WhatsAppIcon } from './Navbar';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: ListingItem[];
  isLoading: boolean;
  onAddListing: (
    itemData: Partial<ListingItem> & { title: string; priceMAD: number; duration: string; region: Region }, 
    files?: File[],
    onProgress?: (progress: number, text: string) => void
  ) => Promise<void>;
  onUpdateListing: (
    id: string, 
    updates: Partial<ListingItem>, 
    newFiles?: File[],
    onProgress?: (progress: number, text: string) => void
  ) => Promise<void>;
  onDeleteListing: (id: string, imageUrls?: string[]) => Promise<void>;
  currentLang: LanguageCode;
  settings?: SiteSettings;
  onUpdateSettings?: (settings: Partial<SiteSettings>) => Promise<void>;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  listings,
  isLoading,
  onAddListing,
  onUpdateListing,
  onDeleteListing,
  settings,
  onUpdateSettings
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'catalog' | 'inquiries' | 'settings' | 'security'>('catalog');

  // Site Settings Form State
  const [settingsWhatsapp, setSettingsWhatsapp] = useState(settings?.whatsappNumber || '+212662634926');
  const [settingsDisplay, setSettingsDisplay] = useState(settings?.whatsappDisplay || '0662634926');
  const [settingsFacebook, setSettingsFacebook] = useState(settings?.facebookUrl || 'https://www.facebook.com/share/18k4njmMaP/?mibextid=wwXIfr');
  const [settingsInstagram, setSettingsInstagram] = useState(settings?.instagramUrl || 'https://www.instagram.com/amalo_hossain?obrf=aDd4N2gwNTAyZTd5&utm_source=qr');
  const [settingsHeroImage, setSettingsHeroImage] = useState(settings?.heroImageUrl || '');
  const [settingsGuideName, setSettingsGuideName] = useState(settings?.guideName || 'Hossain Amalo');
  const [settingsGuideRole, setSettingsGuideRole] = useState(settings?.guideRole || 'Certified Toubkal Mountain Guide');
  const [settingsEmail, setSettingsEmail] = useState(settings?.email || 'houssainbaaki71@gmail.com');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setSettingsWhatsapp(settings.whatsappNumber);
      setSettingsDisplay(settings.whatsappDisplay);
      setSettingsFacebook(settings.facebookUrl);
      setSettingsInstagram(settings.instagramUrl);
      setSettingsHeroImage(settings.heroImageUrl);
      setSettingsGuideName(settings.guideName);
      setSettingsGuideRole(settings.guideRole);
      setSettingsEmail(settings.email);
    }
  }, [settings]);

  // Inquiries State
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);

  // Security Passkey State
  const [currentSavedCode, setCurrentSavedCode] = useState<string>(() => {
    return localStorage.getItem('hidden_atlas_admin_passkey') || '1231234';
  });
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterType, setSelectedFilterType] = useState<ItemType | 'all'>('all');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [activeItem, setActiveItem] = useState<Partial<ListingItem> | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Image Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading & Action states
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saveStatusText, setSaveStatusText] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inquiries Subscription
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      setInquiriesLoading(true);
      const unsubscribe = subscribeToInquiries(
        (items) => {
          setInquiries(items);
          setInquiriesLoading(false);
        },
        (err) => {
          console.warn('Could not fetch inquiries:', err);
          setInquiriesLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCode = localStorage.getItem('hidden_atlas_admin_passkey') || '1231234';
    if (accessCode.trim() === targetCode) {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const cleanupPreviews = () => {
    filePreviews.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    });
  };

  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscode.length < 4) {
      setPasscodeError('يجب أن يتكون رمز المرور من 4 أحرف أو أرقام على الأقل');
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setPasscodeError('رمز المرور الجديد غير متطابق مع التأكيد');
      return;
    }

    localStorage.setItem('hidden_atlas_admin_passkey', newPasscode.trim());
    setCurrentSavedCode(newPasscode.trim());
    setPasscodeSuccess(true);
    setPasscodeError(null);
    setNewPasscode('');
    setConfirmPasscode('');
    showToast('تم تحديث رمز الدخول السري بنجاح!');
    setTimeout(() => setPasscodeSuccess(false), 3000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updates: Partial<SiteSettings> = {
        whatsappNumber: settingsWhatsapp.trim(),
        whatsappDisplay: settingsDisplay.trim(),
        facebookUrl: settingsFacebook.trim(),
        instagramUrl: settingsInstagram.trim(),
        heroImageUrl: settingsHeroImage.trim(),
        guideName: settingsGuideName.trim(),
        guideRole: settingsGuideRole.trim(),
        email: settingsEmail.trim()
      };
      if (onUpdateSettings) {
        await onUpdateSettings(updates);
      } else {
        await updateSiteSettings(updates);
      }
      setSettingsSuccess(true);
      showToast('تم حفظ إعدادات الموقع وروابط التواصل الاجتماعي بنجاح في Firestore!');
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setErrorMessage('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const openAddForm = () => {
    cleanupPreviews();
    setActiveItem({
      type: 'trip',
      category: 'mountain-trekking',
      region: 'جبال الأطلس الكبير',
      title: '',
      arabicTitle: '',
      city: 'Imlil / Atlas',
      location: 'جبال الأطلس، المغرب',
      duration: 'يوم كامل',
      rating: 5.0,
      reviewsCount: 1,
      priceMAD: 600,
      imageUrl: '',
      gallery: [],
      overview: '',
      highlights: ['مرشد محلي معتمد ومرخص', 'إطلالات طبيعية خلابة', 'شاي مغربي وضيافة بربرية'],
      included: ['مرشد سياحي محلي', 'كافة معدات الجولة', 'شاي مغربي بالنعناع'],
      notIncluded: ['المشتريات الشخصية'],
      meetingPoint: 'نقطة الانطلاق أو التوصيل حسب الاتفاق',
      cancellationPolicy: 'إلغاء مجاني حتى 24 ساعة قبل الموعد',
      hostName: 'مرشد محلي',
      hostRole: 'مرشد سياحي معتمد',
      hostAvatar: '',
      hostLanguages: ['العربية', 'الإنجليزية', 'الفرنسية'],
      availableAddons: [],
      groupPricing: [],
      groupPricingCurrency: 'EUR'
    });
    setIsAvailable(true);
    setSelectedFiles([]);
    setFilePreviews([]);
    setExistingImages([]);
    setValidationErrors({});
    setErrorMessage(null);
    setUploadProgress(0);
    setSaveStatusText('');
    setIsEditing(true);
  };

  const openEditForm = (item: ListingItem) => {
    cleanupPreviews();
    setActiveItem({
      ...item,
      groupPricing: Array.isArray(item.groupPricing) ? JSON.parse(JSON.stringify(item.groupPricing)) : [],
      groupPricingCurrency: item.groupPricingCurrency || 'EUR'
    });
    setIsAvailable(true);
    setSelectedFiles([]);
    setFilePreviews([]);
    const baseImages = item.gallery && item.gallery.length > 0 ? [...item.gallery] : (item.imageUrl ? [item.imageUrl] : []);
    setExistingImages(baseImages);
    setValidationErrors({});
    setErrorMessage(null);
    setUploadProgress(0);
    setSaveStatusText('');
    setIsEditing(true);

    // Lazily load detail subcollection images so admin sees all gallery images
    if (item.id) {
      fetchActivityImages(item.id).then((subImgs) => {
        if (subImgs && subImgs.length > 0) {
          setExistingImages((prev) => Array.from(new Set([...prev, ...subImgs])));
        }
      });
    }
  };

  const handleAddTier = () => {
    if (!activeItem) return;
    const currentTiers: GroupPricingTier[] = activeItem.groupPricing ? [...activeItem.groupPricing] : [];
    
    let nextMin = 1;
    let defaultPrice = 100;
    if (currentTiers.length > 0) {
      const lastTier = currentTiers[currentTiers.length - 1];
      if (lastTier.max !== undefined && lastTier.max !== null && (lastTier.max as unknown) !== '') {
        nextMin = Number(lastTier.max) + 1;
      } else {
        nextMin = Number(lastTier.min) + 2;
      }
      defaultPrice = Math.max(10, Math.round((Number(lastTier.pricePerPerson) || 100) * 0.85));
    }

    const newTier: GroupPricingTier = {
      min: nextMin,
      max: null,
      pricePerPerson: defaultPrice
    };

    setActiveItem({ ...activeItem, groupPricing: [...currentTiers, newTier] });

    if (validationErrors.groupPricing) {
      setValidationErrors((prev) => ({ ...prev, groupPricing: '' }));
    }
  };

  const handleUpdateTier = (index: number, field: keyof GroupPricingTier, value: any) => {
    if (!activeItem || !activeItem.groupPricing) return;
    const updated = [...activeItem.groupPricing];
    if (!updated[index]) return;

    if (field === 'min') {
      const num = parseInt(value, 10);
      updated[index] = { ...updated[index], min: isNaN(num) ? 1 : Math.max(1, num) };
    } else if (field === 'max') {
      if (value === '' || value === null || value === undefined) {
        updated[index] = { ...updated[index], max: null };
      } else {
        const num = parseInt(value, 10);
        updated[index] = { ...updated[index], max: isNaN(num) ? null : Math.max(1, num) };
      }
    } else if (field === 'pricePerPerson') {
      const num = parseFloat(value);
      updated[index] = { ...updated[index], pricePerPerson: isNaN(num) ? 0 : Math.max(0, num) };
    }

    setActiveItem({ ...activeItem, groupPricing: updated });

    if (validationErrors.groupPricing) {
      setValidationErrors((prev) => ({ ...prev, groupPricing: '' }));
    }
  };

  const handleDeleteTier = (index: number) => {
    if (!activeItem || !activeItem.groupPricing) return;
    const updated = activeItem.groupPricing.filter((_, idx) => idx !== index);
    setActiveItem({ ...activeItem, groupPricing: updated });

    if (validationErrors.groupPricing) {
      setValidationErrors((prev) => ({ ...prev, groupPricing: '' }));
    }
  };

  const handleAutoTranslate = () => {
    if (!activeItem) return;
    const arabic = activeItem.arabicTitle || activeItem.title || '';
    const currentTitle = activeItem.title || '';
    
    // Fill English/Arabic titles symmetrically
    if (!activeItem.arabicTitle && currentTitle) {
      setActiveItem({ ...activeItem, arabicTitle: currentTitle });
      showToast('تمت مزامنة العنوان العربي والإنجليزي');
    } else if (!activeItem.title && arabic) {
      setActiveItem({ ...activeItem, title: arabic });
      showToast('تمت مزامنة العنوان العربي والإنجليزي');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileList = Array.from(e.target.files) as File[];
    const currentCount = existingImages.length + selectedFiles.length;
    const MAX_IMAGES = 10;

    if (currentCount >= MAX_IMAGES) {
      setErrorMessage('الحد الأقصى هو 10 صور لكل نشاط. يرجى حذف بعض الصور القديمة لإضافة صور جديدة.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const availableSlots = MAX_IMAGES - currentCount;
    let acceptedFiles = fileList;
    if (fileList.length > availableSlots) {
      setErrorMessage(`تم قبول ${availableSlots} ${availableSlots === 1 ? 'صورة فقط' : 'صور فقط'} للوصول للحد الأقصى المسموح (10 صور). تم ضغط وتجهيز الصور تلقائياً.`);
      acceptedFiles = fileList.slice(0, availableSlots);
    } else {
      setErrorMessage(null);
    }

    const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file));
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => {
      const url = prev[index];
      if (url) {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveExistingImage = (urlToRemove: string) => {
    setExistingImages((prev) => {
      const filtered = prev.filter((u) => u !== urlToRemove);
      if (activeItem && activeItem.imageUrl === urlToRemove) {
        setActiveItem({
          ...activeItem,
          imageUrl: filtered[0] || '',
          gallery: filtered
        });
      }
      return filtered;
    });
  };

  const handleMakeCover = (targetIdx: number) => {
    if (targetIdx <= 0 || targetIdx >= existingImages.length) return;
    const selectedUrl = existingImages[targetIdx];
    const reordered = [selectedUrl, ...existingImages.filter((_, idx) => idx !== targetIdx)];
    setExistingImages(reordered);
    if (activeItem) {
      setActiveItem({ ...activeItem, imageUrl: selectedUrl, gallery: reordered });
    }
  };

  const handleShiftImage = (targetIdx: number, direction: 'prev' | 'next') => {
    const swapIdx = direction === 'prev' ? targetIdx - 1 : targetIdx + 1;
    if (swapIdx < 0 || swapIdx >= existingImages.length) return;
    const reordered = [...existingImages];
    const temp = reordered[targetIdx];
    reordered[targetIdx] = reordered[swapIdx];
    reordered[swapIdx] = temp;
    setExistingImages(reordered);
    if (activeItem) {
      setActiveItem({ ...activeItem, imageUrl: reordered[0], gallery: reordered });
    }
  };

  const handleReorderActivity = async (itemIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredListings.length) return;

    const currentItem = filteredListings[itemIndex];
    const targetItem = filteredListings[targetIndex];

    const currentOrder = typeof currentItem.sortOrder === 'number' ? currentItem.sortOrder : itemIndex;
    const targetOrder = typeof targetItem.sortOrder === 'number' ? targetItem.sortOrder : targetIndex;

    try {
      await reorderActivitiesInFirestore(
        currentItem.id,
        targetOrder,
        targetItem.id,
        currentOrder
      );
      showToast('تم تحديث ترتيب الأنشطة بنجاح');
    } catch (err: any) {
      console.error('Error reordering activities:', err);
      showToast('تعذر تغيير الترتيب: ' + (err?.message || 'خطأ في الاتصال'));
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!activeItem?.title || !activeItem.title.trim()) {
      errors.title = 'يرجى كتابة عنوان النشاط';
    }
    const hasGroupPricing = Boolean(activeItem?.groupPricing && activeItem.groupPricing.length > 0);
    if (!hasGroupPricing && (!activeItem?.priceMAD || activeItem.priceMAD <= 0)) {
      errors.price = 'يرجى تحديد سعر صالح بالدرهم أو تحديد فئات تسعير المجموعات';
    }
    if (!activeItem?.region) {
      errors.region = 'يرجى اختيار المنطقة';
    }

    if (hasGroupPricing) {
      const gpValidation = validateGroupPricingTiers(activeItem.groupPricing!);
      if (!gpValidation.isValid) {
        errors.groupPricing = gpValidation.error || 'يرجى مراجعة فئات أسعار المجموعات والتأكد من عدم وجود تداخل وأن السعر أكبر من 0';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    if (!validateForm()) return;

    setIsSaving(true);
    setUploadProgress(selectedFiles.length > 0 ? 10 : 30);
    setSaveStatusText(selectedFiles.length > 0 ? 'جاري تجهيز وضغط الصور...' : 'جاري حفظ البيانات...');
    setErrorMessage(null);

    const progressCallback = (pct: number, text: string) => {
      setUploadProgress(pct);
      setSaveStatusText(text);
    };

    try {
      const lowestTier = getLowestTierPrice(activeItem.groupPricing);
      let priceMAD = Number(activeItem.priceMAD) || 0;
      if (lowestTier && lowestTier > 0) {
        const cur = activeItem.groupPricingCurrency || 'EUR';
        if (cur === 'EUR') priceMAD = Math.round(lowestTier * 10.8);
        else if (cur === 'USD') priceMAD = Math.round(lowestTier * 10);
        else if (cur === 'GBP') priceMAD = Math.round(lowestTier * 12.5);
        else priceMAD = Math.round(lowestTier);
      }
      if (priceMAD <= 0) {
        priceMAD = 450;
      }

      const primaryCover = existingImages.length > 0 
        ? existingImages[0] 
        : (activeItem.imageUrl || '');

      const regionPresets: Record<string, string> = {
        'all': 'أكادير',
        'taghazout': 'تغازوت',
        'paradise-valley': 'وادي الجنة',
        'agadir-beach': 'أكادير',
        'souss-valley': 'سهل سوس',
        'tifnit-massa': 'تيفنيت',
        'aourir': 'أورير'
      };

      const selectedRegion = activeItem.region?.trim() || 'جبال الأطلس الكبير';
      const cityName = regionPresets[selectedRegion] || selectedRegion || 'جبال الأطلس';
      const durationVal = activeItem.duration?.trim() || 'يوم كامل';

      const fullItemData = {
        ...activeItem,
        title: activeItem.title!.trim(),
        arabicTitle: activeItem.arabicTitle?.trim() || activeItem.title!.trim(),
        tagline: activeItem.tagline?.trim() || activeItem.overview?.slice(0, 80) || activeItem.title!.trim(),
        priceMAD: priceMAD,
        priceEUR: Math.round(priceMAD / 10.8),
        priceUSD: Math.round(priceMAD / 10),
        priceGBP: Math.round(priceMAD / 12.5),
        groupPricing: activeItem.groupPricing || [],
        groupPricingCurrency: activeItem.groupPricingCurrency || 'EUR',
        duration: durationVal,
        region: selectedRegion,
        type: (activeItem.type as ItemType) || 'trip',
        category: (activeItem.category as ActivityCategory) || 'mountain-trekking',
        city: cityName,
        location: `${cityName}، المغرب`,
        imageUrl: primaryCover,
        gallery: existingImages,
        highlights: activeItem.highlights && activeItem.highlights.length > 0 
          ? activeItem.highlights 
          : ['مرشد محلي معتمد ومرخص', 'إطلالات طبيعية خلابة', 'شاي مغربي أصيل'],
        included: activeItem.included && activeItem.included.length > 0 
          ? activeItem.included 
          : ['مرشد محلي معتمد', 'جميع المعدات اللازمة'],
        notIncluded: ['المشتريات الشخصية'],
        meetingPoint: activeItem.meetingPoint?.trim() || 'نقطة الانطلاق أو التوصيل حسب الاتفاق',
        overview: activeItem.overview?.trim() || 'استمتع بتجربة سياحية رائعة مع مرشدين محليين معتمدين في أجواء آمنة ومريحة.'
      };

      const isEdit = activeItem.id && listings.some((l) => l.id === activeItem.id);

      if (isEdit) {
        await onUpdateListing(activeItem.id!, fullItemData, selectedFiles, progressCallback);
        showToast('تم تحديث النشاط بنجاح!');
      } else {
        await onAddListing(fullItemData, selectedFiles, progressCallback);
        showToast('تمت إضافة النشاط الجديد بنجاح!');
      }

      cleanupPreviews();
      setIsEditing(false);
      setActiveItem(null);
    } catch (err: any) {
      console.error('Error saving activity:', err);
      let userMsg = 'حدث خطأ أثناء حفظ النشاط في قاعدة البيانات. يرجى التأكد من الاتصال بالموقع والمحاولة ثانية.';
      if (err) {
        const raw = typeof err === 'string' ? err : (err.message || String(err));
        if (raw.includes('{') && raw.includes('}')) {
          try {
            const start = raw.indexOf('{');
            const end = raw.lastIndexOf('}');
            const parsed = JSON.parse(raw.substring(start, end + 1));
            if (parsed && typeof parsed.error === 'string' && !parsed.error.includes('{')) {
              userMsg = parsed.error;
            }
          } catch {
            // Keep userMsg clean
          }
        } else if (raw && !raw.includes('FirebaseError') && !raw.includes('GrpcConnection')) {
          userMsg = raw;
        }
      }
      // Guarantee user never sees raw JSON or system technical objects
      if (userMsg.includes('{') || userMsg.includes('authInfo') || userMsg.includes('operationType') || userMsg.includes('path')) {
        userMsg = 'تعذر الحفظ في قاعدة البيانات بسبب بطء الاتصال بالشبكة، يرجى المحاولة ثانية.';
      }
      setErrorMessage(userMsg);
    } finally {
      setIsSaving(false);
      setSaveStatusText('');
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: string) => {
    const itemToDelete = listings.find((l) => l.id === id);
    const imagesToDelete = itemToDelete?.gallery || (itemToDelete?.imageUrl ? [itemToDelete.imageUrl] : []);

    setIsDeleting(true);
    try {
      await onDeleteListing(id, imagesToDelete);
      setDeletingId(null);
      showToast('تم حذف النشاط بنجاح من الموقع');
    } catch (err: any) {
      console.error('Error deleting activity:', err);
      showToast('حدث خطأ أثناء الحذف: ' + (err?.message || 'خطأ غير معروف'));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredListings = listings.filter((item) => {
    if (selectedFilterType !== 'all' && item.type !== selectedFilterType) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q) ||
        (item.arabicTitle && item.arabicTitle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const unreadInquiriesCount = inquiries.filter((i) => i.status === 'unread').length;

  const getTypeNameInArabic = (type: ItemType) => {
    switch (type) {
      case 'trip': return 'مسار ومغامرة جبلية';
      case 'activity': return 'نشاط وجولة ميدانية';
      default: return 'نشاط وجولة';
    }
  };

  const getRegionNameInArabic = (region: string) => {
    if (!region) return 'أكادير والمنطقة';
    switch (region) {
      case 'taghazout': return 'خليج تغازوت';
      case 'paradise-valley': return 'وادي الجنة';
      case 'agadir-beach': return 'شاطئ أكادير';
      case 'souss-valley': return 'سهل سوس';
      case 'tifnit-massa': return 'تيفنيت والساحل';
      case 'aourir': return 'أورير';
      case 'all': return 'أكادير والمنطقة';
      default: return region;
    }
  };

  return (
    <div 
      dir="rtl" 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 font-arabic-body"
    >
      <div className="bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] max-h-[95dvh]">
        
        {/* Header with Live Sync Indicator */}
        <div className="p-4 sm:p-6 bg-[#1c130c] text-white flex items-center justify-between border-b border-amber-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c2410c] to-[#7c2d12] border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base sm:text-lg">
                  لوحة الإدارة — هيدن أطلس المغرب
                </h3>
                {isAuthenticated && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>سحابي Firestore متزامن</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                إدارة العروض والأنشطة والرحلات الجبلية والصحراوية، والاطلاع على رسائل واستفسارات الزوار
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-amber-200/80 hover:text-white transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentication Gate */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-[#c2410c] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="font-heading font-bold text-xl text-[#1c130c] mb-2">
              تسجيل الدخول إلى لوحة التحكم
            </h4>
            <p className="text-xs text-stone-500 mb-6">
              أدخل رمز الدخول السري المخصص لإدارة الموقع والعروض.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    inputMode="numeric"
                    autoComplete="current-password"
                    dir="ltr"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      setAuthError(false);
                    }}
                    placeholder="••••••"
                    style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' }}
                    className="w-full text-center tracking-widest text-xl font-mono py-3 px-10 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent bg-stone-50/50"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                    title={showPassword ? 'إخفاء الرمز' : 'إظهار الرمز'}
                    aria-label={showPassword ? 'إخفاء الرمز' : 'إظهار الرمز'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {authError && (
                  <p className="text-xs font-semibold text-rose-600 mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>رمز الدخول غير صحيح</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#9a3412] hover:to-[#c2410c] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer glow-terracotta"
              >
                فتح لوحة التحكم
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard Navigation & Content */
          <div className="flex-1 overflow-y-auto flex flex-col">
            
            {/* Tabs Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 pt-3 sm:pt-4 border-b border-slate-200 bg-slate-50/80 overflow-x-auto no-scrollbar whitespace-nowrap">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`pb-2.5 sm:pb-3 px-2.5 sm:px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'catalog'
                    ? 'border-[#c2410c] text-[#c2410c]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>الأنشطة والجولات ({listings.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('inquiries')}
                className={`pb-2.5 sm:pb-3 px-2.5 sm:px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer relative shrink-0 ${
                  activeTab === 'inquiries'
                    ? 'border-[#9C4A2F] text-[#9C4A2F]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>رسائل واستفسارات الزوار</span>
                {unreadInquiriesCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                    {unreadInquiriesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`pb-2.5 sm:pb-3 px-2.5 sm:px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'settings'
                    ? 'border-[#9C4A2F] text-[#9C4A2F]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>إعدادات الموقع وواتساب</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`pb-2.5 sm:pb-3 px-2.5 sm:px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'security'
                    ? 'border-[#9C4A2F] text-[#9C4A2F]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>رمز الأمان والدخول</span>
              </button>
            </div>

            {/* Dashboard Body */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5">
              {/* Toast notice */}
              {successToast && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successToast}</span>
                </div>
              )}

              {/* TAB 1: CATALOG MANAGEMENT */}
              {activeTab === 'catalog' && (
                <>
                  {/* Top Action & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                    <div className="flex items-center gap-2 flex-1 flex-wrap sm:flex-nowrap">
                      {/* Search */}
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="بحث حسب العنوان أو المدينة..."
                          className="w-full pr-9 pl-3 py-2.5 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#c2410c]"
                        />
                      </div>

                      {/* Filter */}
                      <select
                        value={selectedFilterType}
                        onChange={(e) => setSelectedFilterType(e.target.value as any)}
                        className="py-2.5 px-3 text-xs rounded-xl border border-stone-200 bg-white font-bold text-stone-700 focus:outline-none"
                      >
                        <option value="all">كل الجولات والأنشطة ({listings.length})</option>
                        <option value="trip">مسارات المشي وتسلق الأطلس</option>
                        <option value="activity">أنشطة الصحراء، الخيل والكواد</option>
                      </select>
                    </div>

                    {/* Main Add Button */}
                    <button
                      onClick={openAddForm}
                      className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#9a3412] hover:to-[#c2410c] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 shrink-0 glow-terracotta cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة نشاط جديد</span>
                    </button>
                  </div>

                  {/* Loading Indicator */}
                  {isLoading ? (
                    <div className="py-16 text-center text-stone-500 space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c2410c]" />
                      <p className="text-xs font-medium">جاري تحميل البيانات من Firestore...</p>
                    </div>
                  ) : filteredListings.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 p-6">
                      <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <h4 className="font-heading font-bold text-sm text-slate-800">
                        لم يتم العثور على أي أنشطة
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        {searchTerm ? 'لا توجد نتائج مطابقة لبحثك الحالي.' : 'انقر على الزر أدناه لإضافة أول نشاط إلى الموقع.'}
                      </p>
                      <button
                        onClick={openAddForm}
                        className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#c2410c] inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة نشاط جديد</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Clean Table of Items */}
                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-right border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                                <th className="p-3.5">العنوان والصور</th>
                                <th className="p-3.5">النوع والمنطقة</th>
                                <th className="p-3.5">السعر (درهم)</th>
                                <th className="p-3.5">المدة</th>
                                <th className="p-3.5">الحالة</th>
                                <th className="p-3.5 text-center">الإجراءات</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {filteredListings.map((item, idx) => {
                                const imageCount = (item.gallery?.length) || (item.imageUrl ? 1 : 0);
                                return (
                                  <tr key={item.id} className="hover:bg-amber-50/40 transition-colors">
                                    {/* Title & Image */}
                                    <td className="p-3.5">
                                      <div className="flex items-center gap-3">
                                        <div className="relative">
                                          {item.imageUrl ? (
                                            <img
                                              src={item.imageUrl}
                                              alt={item.title}
                                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200 shadow-xs"
                                            />
                                          ) : (
                                            <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 text-[#C98B4B]">
                                              <Mountain className="w-6 h-6" />
                                            </div>
                                          )}
                                          {imageCount > 1 && (
                                            <span className="absolute -bottom-1 -left-1 bg-stone-900/80 text-white text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                                              +{imageCount - 1}
                                            </span>
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-heading font-bold text-stone-900 line-clamp-1">
                                            {item.arabicTitle || item.title}
                                          </p>
                                          <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-3 h-3 text-[#c2410c]" />
                                            <span>{item.city}</span>
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Type & Region */}
                                    <td className="p-3.5">
                                      <div className="flex flex-col gap-1">
                                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-[#9a3412] w-fit">
                                          {getTypeNameInArabic(item.type)}
                                        </span>
                                        <span className="text-[11px] text-stone-500">
                                          {getRegionNameInArabic(item.region)}
                                        </span>
                                      </div>
                                    </td>

                                    {/* Price */}
                                    <td className="p-3.5">
                                      <span className="font-heading font-extrabold text-sm text-[#1c130c]">
                                        {item.priceMAD} درهم
                                      </span>
                                    </td>

                                    {/* Duration */}
                                    <td className="p-3.5 text-stone-600 font-medium">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                                        <span>{item.duration}</span>
                                      </div>
                                    </td>

                                    {/* Status */}
                                    <td className="p-3.5">
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span>متوفر</span>
                                      </span>
                                    </td>

                                    {/* Actions & Reordering */}
                                    <td className="p-3.5 text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                        {/* Reorder Up */}
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={() => handleReorderActivity(idx, 'up')}
                                          className="p-1.5 rounded-lg text-stone-600 hover:text-[#c2410c] bg-stone-100 hover:bg-amber-100 disabled:opacity-20 transition-colors cursor-pointer"
                                          title="رفع النشاط للأعلى"
                                        >
                                          <ArrowUp className="w-3.5 h-3.5" />
                                        </button>
                                        {/* Reorder Down */}
                                        <button
                                          type="button"
                                          disabled={idx === filteredListings.length - 1}
                                          onClick={() => handleReorderActivity(idx, 'down')}
                                          className="p-1.5 rounded-lg text-stone-600 hover:text-[#c2410c] bg-stone-100 hover:bg-amber-100 disabled:opacity-20 transition-colors cursor-pointer"
                                          title="تنزيل النشاط للأسفل"
                                        >
                                          <ArrowDown className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => openEditForm(item)}
                                          className="px-2 py-1.5 rounded-lg text-xs font-bold text-[#c2410c] bg-amber-50 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                                          title="تعديل"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                          <span>تعديل</span>
                                        </button>
                                        <button
                                          onClick={() => setDeletingId(item.id)}
                                          className="px-2 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                                          title="حذف"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span>حذف</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Bottom utilities */}
                      <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                        <span>إجمالي الأنشطة المعروضة: {listings.length} تجربة</span>
                        <span className="text-emerald-700 font-medium">بيانات حية مباشرة من Firestore</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* TAB 2: INQUIRIES & MESSAGES */}
              {activeTab === 'inquiries' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-900">
                        استفسارات ورسائل نموذج التواصل
                      </h4>
                      <p className="text-xs text-slate-500">
                        الرسائل الواردة مباشرة من زوار الموقع عبر نموذج التواصل السريع
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                      إجمالي الرسائل: {inquiries.length}
                    </span>
                  </div>

                  {inquiriesLoading ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#c2410c]" />
                      <p className="text-xs">جاري جلب الرسائل من Firestore...</p>
                    </div>
                  ) : inquiries.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2">
                      <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="font-bold text-sm text-slate-700">لا توجد رسائل واردة حالياً</p>
                      <p className="text-xs text-slate-500">
                        عندما يملأ أحد الزوار نموذج التواصل في أسفل الموقع، ستظهر رسالته هنا فوراً مع إمكانية الرد عبر واتساب بنقرة واحدة.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inquiries.map((inq) => {
                        const cleanPhone = inq.phone ? inq.phone.replace(/[^0-9]/g, '') : '';
                        const waLink = cleanPhone 
                          ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`مرحباً ${inq.name}، تواصلنا معك بخصوص رسالتك على هيدن أطلس: "${inq.message.slice(0, 50)}..."`)}`
                          : null;

                        return (
                          <div 
                            key={inq.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              inq.status === 'unread' 
                                ? 'bg-amber-50/50 border-amber-200 shadow-xs' 
                                : 'bg-white border-stone-200'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-stone-100 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-heading font-bold text-sm text-[#1c130c]">
                                  {inq.name}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  inq.status === 'unread' 
                                    ? 'bg-rose-100 text-rose-800' 
                                    : inq.status === 'contacted'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {inq.status === 'unread' ? 'جديدة' : inq.status === 'contacted' ? 'تم التواصل' : 'مكتملة'}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-stone-400 text-[11px]">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{new Date(inq.createdAt).toLocaleString('ar-MA')}</span>
                                </span>
                              </div>
                            </div>

                            {/* Message Body */}
                            <div className="py-3 text-xs text-stone-700 leading-relaxed font-medium bg-stone-50/70 p-3 rounded-xl my-2 border border-stone-100">
                              "{inq.message}"
                            </div>

                            {/* Contact Details & Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                              <div className="flex items-center gap-3 flex-wrap">
                                {inq.phone && (
                                  <span className="flex items-center gap-1 text-stone-700 font-mono font-bold" dir="ltr">
                                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{inq.phone}</span>
                                  </span>
                                )}
                                {inq.email && (
                                  <a href={`mailto:${inq.email}`} className="flex items-center gap-1 text-[#c2410c] hover:underline">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>{inq.email}</span>
                                  </a>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {waLink && (
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                      if (inq.status === 'unread') {
                                        updateInquiryStatus(inq.id, 'contacted');
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center gap-1.5 glow-whatsapp transition-all shadow-xs"
                                  >
                                    <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                                    <span>محادثة واتساب فورية</span>
                                  </a>
                                )}

                                <select
                                  value={inq.status}
                                  onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                                  className="py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 cursor-pointer"
                                >
                                  <option value="unread">جديدة</option>
                                  <option value="contacted">تم التواصل</option>
                                  <option value="resolved">مكتملة</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
                                      await deleteInquiry(inq.id);
                                      showToast('تم حذف الرسالة بنجاح');
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="حذف الرسالة"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SITE SETTINGS & SOCIALS */}
              {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto py-2 space-y-6">
                  <div className="p-5 sm:p-7 rounded-[14px] bg-white border border-[#C98B4B]/30 shadow-sm space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                      <div className="w-10 h-10 rounded-[10px] bg-[#E5733A]/15 text-[#E5733A] border border-[#E5733A]/30 flex items-center justify-center">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm sm:text-base text-[#2E2118]">
                          إعدادات الموقع، الواتساب وروابط التواصل الاجتماعي
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          يتم حفظ هذه البيانات في قاعدة بيانات Firestore وتحديثها فورياً على هواتف جميع الزوار
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                      {settingsSuccess && (
                        <div className="p-3.5 rounded-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>تم حفظ وتحديث إعدادات الموقع بنجاح في Firestore!</span>
                        </div>
                      )}

                      {/* WhatsApp Section */}
                      <div className="p-4 rounded-[12px] bg-[#F8F5F0] border border-[#C98B4B]/25 space-y-3">
                        <h5 className="font-heading font-bold text-xs text-[#9C4A2F] flex items-center gap-1.5">
                          <WhatsAppIcon className="w-4 h-4 text-[#E5733A]" />
                          <span>بيانات الواتساب الموحد للمرشد</span>
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-[#2E2118] mb-1">
                              رقم الواتساب بالصيغة الدولية (wa.me)
                            </label>
                            <input
                              type="text"
                              required
                              dir="ltr"
                              value={settingsWhatsapp}
                              onChange={(e) => setSettingsWhatsapp(e.target.value)}
                              placeholder="+212662634926"
                              className="w-full p-2.5 rounded-[10px] border border-[#C98B4B]/40 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#9C4A2F]"
                            />
                            <span className="text-[10px] text-stone-400 mt-0.5 block">تفتح جميع أزرار الحجز مع هذا الرقم</span>
                          </div>

                          <div>
                            <label className="block font-bold text-[#2E2118] mb-1">
                              رقم الواتساب المعروض للزوار
                            </label>
                            <input
                              type="text"
                              required
                              dir="ltr"
                              value={settingsDisplay}
                              onChange={(e) => setSettingsDisplay(e.target.value)}
                              placeholder="0662634926"
                              className="w-full p-2.5 rounded-[10px] border border-[#C98B4B]/40 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#9C4A2F]"
                            />
                            <span className="text-[10px] text-stone-400 mt-0.5 block">الرقم الذي يظهر في أعلى وأسفل الصفحة</span>
                          </div>
                        </div>
                      </div>

                      {/* Social Media Links */}
                      <div className="p-4 rounded-[12px] bg-[#F8F5F0] border border-[#C98B4B]/25 space-y-3">
                        <h5 className="font-heading font-bold text-xs text-[#9C4A2F] flex items-center gap-1.5">
                          <ExternalLink className="w-4 h-4 text-[#C98B4B]" />
                          <span>روابط التواصل الاجتماعي (تفتح في تبويب جديد)</span>
                        </h5>
                        <div className="space-y-3">
                          <div>
                            <label className="block font-bold text-[#2E2118] mb-1 flex items-center gap-1.5">
                              <span>رابط صفحة فيسبوك (Facebook)</span>
                            </label>
                            <input
                              type="url"
                              required
                              dir="ltr"
                              value={settingsFacebook}
                              onChange={(e) => setSettingsFacebook(e.target.value)}
                              placeholder="https://www.facebook.com/share/..."
                              className="w-full p-2.5 rounded-[10px] border border-[#C98B4B]/40 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9C4A2F]"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-[#2E2118] mb-1 flex items-center gap-1.5">
                              <span>رابط حساب إنستغرام (Instagram)</span>
                            </label>
                            <input
                              type="url"
                              required
                              dir="ltr"
                              value={settingsInstagram}
                              onChange={(e) => setSettingsInstagram(e.target.value)}
                              placeholder="https://www.instagram.com/amalo_hossain?..."
                              className="w-full p-2.5 rounded-[10px] border border-[#C98B4B]/40 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9C4A2F]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Guide Profile & Hero Image */}
                      <div className="p-4 rounded-[12px] bg-[#F8F5F0] border border-[#C98B4B]/25 space-y-3">
                        <h5 className="font-heading font-bold text-xs text-[#9C4A2F]">
                          هوية المرشد وخلفية الصفحة الرئيسية
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-[#2E2118] mb-1">
                              اسم المرشد
                            </label>
                            <input
                              type="text"
                              value={settingsGuideName}
                              onChange={(e) => setSettingsGuideName(e.target.value)}
                              placeholder="Hossain Amalo / حسين أمالو"
                              className="w-full p-2.5 rounded-[10px] border border-[#C98B4B]/40 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9C4A2F]"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-[#2E2118] mb-1">
                              الصفة والاعتماد المهني
                            </label>
                            <input
                              type="text"
                              value={settingsGuideRole}
                              onChange={(e) => setSettingsGuideRole(e.target.value)}
                              placeholder="مرشد سياحي جبلي معتمد لتوبقال والأطلس"
                              className="w-full p-2.5 rounded-[10px] border border-[#C98B4B]/40 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9C4A2F]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-[#2E2118] mb-1">
                              البريد الإلكتروني للتواصل
                            </label>
                            <input
                              type="email"
                              dir="ltr"
                              value={settingsEmail}
                              onChange={(e) => setSettingsEmail(e.target.value)}
                              placeholder="houssainbaaki71@gmail.com"
                              className="w-full p-2.5 rounded-[10px] border border-[#C98B4B]/40 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9C4A2F]"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-[#2E2118] mb-1">
                              رابط صورة الواجهة الرئيسية (Toubkal Hero Image)
                            </label>
                            <input
                              type="url"
                              dir="ltr"
                              value={settingsHeroImage}
                              onChange={(e) => setSettingsHeroImage(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="w-full p-2.5 rounded-[10px] border border-[#C98B4B]/40 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#9C4A2F]"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSavingSettings}
                        className="w-full py-3.5 rounded-[10px] bg-[#E5733A] hover:bg-[#d46229] disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#E5733A]/25 transition-all active:scale-95 cursor-pointer"
                      >
                        {isSavingSettings ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>جاري الحفظ في Firestore...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>حفظ إعدادات الموقع وواتساب</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: SECURITY SETTINGS */}
              {activeTab === 'security' && (
                <div className="max-w-md mx-auto py-4 space-y-6">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-[#1c130c]">
                          تغيير رمز الدخول السري
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          يمكنك تعيين رمز دخول جديد خاص بك لإدارة الأنشطة
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdatePasscode} className="space-y-4 text-xs">
                      {passcodeSuccess && (
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>تم حفظ وتحديث رمز المرور الجديد بنجاح!</span>
                        </div>
                      )}

                      {passcodeError && (
                        <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span>{passcodeError}</span>
                        </div>
                      )}

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          رمز الدخول الجديد
                        </label>
                        <input
                          type="password"
                          required
                          value={newPasscode}
                          onChange={(e) => setNewPasscode(e.target.value)}
                          placeholder="اكتب رمز المرور الجديد..."
                          className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#c2410c]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          تأكيد رمز الدخول الجديد
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPasscode}
                          onChange={(e) => setConfirmPasscode(e.target.value)}
                          placeholder="أعد كتابة رمز المرور للتأكيد..."
                          className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c2410c]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#9a3412] hover:to-[#c2410c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer glow-terracotta"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>حفظ الرمز السري الجديد</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Simplified Add / Edit Modal */}
        {isEditing && activeItem && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-arabic-body">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
              
              {/* Form Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h4 className="font-heading font-bold text-base sm:text-lg text-[#1c130c]">
                    {activeItem.id && listings.some((l) => l.id === activeItem.id) 
                      ? 'تعديل بيانات النشاط' 
                      : 'إضافة نشاط جديد'}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoTranslate}
                    title="مزامنة وتنسيق العناوين"
                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-[#c2410c] hover:bg-amber-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>مزامنة العنوان</span>
                  </button>
                  <button
                    onClick={() => !isSaving && setIsEditing(false)}
                    disabled={isSaving}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
                    title="إلغاء"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
                
                {/* 1. Title */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    العنوان (اسم النشاط أو الجولة) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={activeItem.title || ''}
                    onChange={(e) => {
                      setActiveItem({ 
                        ...activeItem, 
                        title: e.target.value,
                        arabicTitle: e.target.value
                      });
                      if (validationErrors.title) setValidationErrors({ ...validationErrors, title: '' });
                    }}
                    placeholder="مثال: ركوب أمواج تغازوت مع مدرب محلي"
                    className={`w-full p-3 rounded-xl border ${validationErrors.title ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'} focus:ring-2 focus:ring-[#c2410c] text-sm`}
                  />
                  {validationErrors.title && (
                    <p className="text-[10px] text-rose-600 mt-1 font-semibold">{validationErrors.title}</p>
                  )}
                </div>

                {/* 2. Type, Category, Region, Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">النوع</label>
                    <select
                      value={activeItem.type || 'trip'}
                      onChange={(e) => setActiveItem({ ...activeItem, type: e.target.value as ItemType })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
                    >
                      <option value="trip">رحلات ومسارات المشي (Treks & Trips)</option>
                      <option value="activity">أنشطة ميدانية (Outdoor Adventures)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تصنيف النشاط</label>
                    <select
                      value={activeItem.category || 'mountain-trekking'}
                      onChange={(e) => setActiveItem({ ...activeItem, category: e.target.value as ActivityCategory })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 text-xs"
                    >
                      <option value="mountain-trekking">مسارات المشي وتسلق الجبال (Atlas, Toubkal, Iferouan, Lake Ifni)</option>
                      <option value="camel-riding">ركوب الجمال (Camel Rides)</option>
                      <option value="horseback">ركوب الخيل (Horse Riding)</option>
                      <option value="desert-tours">جولات الصحراء (Desert Tours)</option>
                      <option value="quad-buggy">دراجات الكواد (Quad Biking)</option>
                      <option value="cultural-day-trips">رحلات ثقافية نهارية (Essaouira Day Trips)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      المنطقة / الوجهة <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      list="admin-region-suggestions"
                      value={activeItem.region || ''}
                      onChange={(e) => {
                        setActiveItem({ ...activeItem, region: e.target.value });
                        if (validationErrors.region) setValidationErrors({ ...validationErrors, region: '' });
                      }}
                      placeholder="جبال الأطلس، توبقال، الصويرة..."
                      className={`w-full p-2.5 rounded-xl border ${validationErrors.region ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'} font-medium text-slate-800 focus:ring-2 focus:ring-[#c2410c]`}
                    />
                    <datalist id="admin-region-suggestions">
                      <option value="جبال الأطلس الكبير (High Atlas)" />
                      <option value="قمة توبقال (Mount Toubkal)" />
                      <option value="إفروان (Iferouan)" />
                      <option value="بحيرة إفني (Lake Ifni)" />
                      <option value="صحراء سوس والكثبان (Sahara Dunes)" />
                      <option value="الصويرة (Essaouira)" />
                      <option value="تغازوت (Taghazout)" />
                      <option value="وادي الجنة (Paradise Valley)" />
                      <option value="أكادير (Agadir)" />
                    </datalist>
                    {validationErrors.region && (
                      <p className="text-[10px] text-rose-600 mt-1 font-semibold">{validationErrors.region}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      السعر (بالدرهم) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={10}
                      value={activeItem.priceMAD || ''}
                      onChange={(e) => {
                        setActiveItem({ ...activeItem, priceMAD: Number(e.target.value) });
                        if (validationErrors.price) setValidationErrors({ ...validationErrors, price: '' });
                      }}
                      placeholder="مثال: 450"
                      className={`w-full p-2.5 rounded-xl border ${validationErrors.price ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'} font-bold text-[#c2410c]`}
                    />
                    {validationErrors.price && (
                      <p className="text-[10px] text-rose-600 mt-1 font-semibold">{validationErrors.price}</p>
                    )}
                  </div>
                </div>

                {/* 2.5 Group Pricing Section */}
                <div className="bg-[#F7F2EB]/80 border border-[#C98B4B]/30 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#C98B4B]/20">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#8C3A16]/10 flex items-center justify-center text-[#8C3A16]">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          <span>تسعير المجموعات (Group Pricing)</span>
                          {activeItem.groupPricing && activeItem.groupPricing.length > 0 && (
                            <span className="text-[10px] bg-[#8C3A16] text-white px-2 py-0.5 rounded-full font-bold">
                              {activeItem.groupPricing.length} {activeItem.groupPricing.length === 1 ? 'فئة' : 'فئات'}
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          حدد أسعاراً متدرجة حسب عدد الأفراد (مثل: 2 أشخاص، 3-6، 7-13، 14+). تُعرض في جدول وتُحسب تلقائياً.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <label className="text-xs font-bold text-slate-600">العملة:</label>
                      <select
                        value={activeItem.groupPricingCurrency || 'EUR'}
                        onChange={(e) => setActiveItem({ ...activeItem, groupPricingCurrency: e.target.value as Currency })}
                        className="bg-white border border-[#C98B4B]/40 rounded-xl px-3 py-1.5 text-xs font-bold text-[#8C3A16] shadow-sm focus:ring-2 focus:ring-[#8C3A16]/30 focus:border-[#8C3A16]"
                      >
                        <option value="EUR">يورو (€ EUR)</option>
                        <option value="MAD">درهم مغربي (MAD)</option>
                        <option value="USD">دولار أمريكي ($ USD)</option>
                        <option value="GBP">جنيه إسترليني (£ GBP)</option>
                      </select>
                    </div>
                  </div>

                  {validationErrors.groupPricing && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="font-medium">{validationErrors.groupPricing}</div>
                    </div>
                  )}

                  {/* Tiers List */}
                  {(!activeItem.groupPricing || activeItem.groupPricing.length === 0) ? (
                    <div className="text-center py-6 px-4 bg-white/70 border border-dashed border-[#C98B4B]/30 rounded-xl">
                      <Users className="w-8 h-8 text-[#C98B4B]/40 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">لم يتم إعداد فئات تسعير للمجموعات بعد</p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
                        إذا لم تضف فئات، سيتم استخدام السعر الفردي العادي. انقر أدناه لإضافة الفئة الأولى (مثال: 1 إلى 2 أشخاص).
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeItem.groupPricing.map((tier, index) => {
                        const curSymbol = getCurrencySymbol(activeItem.groupPricingCurrency || 'EUR');
                        const previewRange = formatGroupPricingRange(tier, 'en');
                        const previewPrice = formatGroupPricingPrice(tier.pricePerPerson, activeItem.groupPricingCurrency || 'EUR', 'en');

                        return (
                          <div 
                            key={index} 
                            className="bg-white border border-[#C98B4B]/20 rounded-xl p-3 sm:p-3.5 shadow-xs hover:border-[#C98B4B]/50 transition-all"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[#8C3A16]/10 text-[#8C3A16] font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {index + 1}
                                </span>
                                <span className="font-bold text-slate-700">الفئة #{index + 1}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-[#8C3A16] bg-[#8C3A16]/5 px-2.5 py-0.5 rounded-md border border-[#8C3A16]/10 whitespace-nowrap text-center">
                                  {previewRange} &rarr; {previewPrice}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTier(index)}
                                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                  title="حذف هذه الفئة"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                              {/* Min participants */}
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                  الحد الأدنى للأفراد <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={tier.min}
                                    onChange={(e) => handleUpdateTier(index, 'min', e.target.value)}
                                    placeholder="1"
                                    className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-[#8C3A16]/20 focus:border-[#8C3A16]"
                                  />
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">
                                    أشخاص
                                  </span>
                                </div>
                              </div>

                              {/* Max participants */}
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                  الحد الأقصى (اختياري)
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min={tier.min}
                                    step="1"
                                    value={tier.max === null || tier.max === undefined ? '' : tier.max}
                                    onChange={(e) => handleUpdateTier(index, 'max', e.target.value)}
                                    placeholder="فارغ = وأكثر +"
                                    className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#8C3A16]/20 focus:border-[#8C3A16]"
                                  />
                                  {tier.max && (
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">
                                      أشخاص
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Price per person */}
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                  السعر للشخص الواحد <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="1"
                                    step="any"
                                    value={tier.pricePerPerson || ''}
                                    onChange={(e) => handleUpdateTier(index, 'pricePerPerson', e.target.value)}
                                    placeholder="142"
                                    className="w-full p-2 rounded-lg border border-slate-300 font-bold text-[#8C3A16] focus:ring-2 focus:ring-[#8C3A16]/20 focus:border-[#8C3A16]"
                                  />
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 pointer-events-none">
                                    {curSymbol} / شخص
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Tier Action */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleAddTier}
                      className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-[#C98B4B]/40 hover:border-[#8C3A16] bg-white hover:bg-[#8C3A16]/5 text-[#8C3A16] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة فئة سعرية جديدة (Add Tier)</span>
                    </button>
                  </div>
                </div>

                {/* 3. Duration & Availability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      المدة <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={activeItem.duration || ''}
                      onChange={(e) => {
                        setActiveItem({ ...activeItem, duration: e.target.value });
                        if (validationErrors.duration) setValidationErrors({ ...validationErrors, duration: '' });
                      }}
                      placeholder="مثال: ساعتان، 3-4 ساعات، يوم كامل، يومان"
                      className={`w-full p-2.5 rounded-xl border ${validationErrors.duration ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'}`}
                    />
                    {validationErrors.duration && (
                      <p className="text-[10px] text-rose-600 mt-1 font-semibold">{validationErrors.duration}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">حالة التوفر</label>
                    <select
                      value={isAvailable ? 'available' : 'unavailable'}
                      onChange={(e) => setIsAvailable(e.target.value === 'available')}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
                    >
                      <option value="available">متوفر للحجز المباشر</option>
                      <option value="unavailable">غير متوفر حالياً</option>
                    </select>
                  </div>
                </div>

                {/* 4. Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الوصف والتفاصيل</label>
                  <textarea
                    rows={3}
                    value={activeItem.overview || ''}
                    onChange={(e) => setActiveItem({ ...activeItem, overview: e.target.value })}
                    placeholder="اكتب وصفاً مختصراً وجذاباً لما سيستمتع به الزائر في هذا النشاط..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 leading-relaxed text-xs"
                  />
                </div>

                {/* 5. Images Section */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-bold text-[#1c130c]">
                        صور النشاط
                      </label>
                      <p className="text-[11px] text-stone-500">
                        ارفع صوراً مباشرة من جهازك أو هاتفك لعرضها على الموقع
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>اختيار صور من جهازك</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isSaving}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* Previews of newly selected files */}
                  {filePreviews.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>الصور الجديدة المحددة للرفع ({filePreviews.length}) - سيتم ضغطها تلقائياً قبل الرفع:</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {filePreviews.map((previewUrl, idx) => (
                          <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm">
                            <img src={previewUrl} alt="New upload" className="w-full h-full object-cover" />
                            {!isSaving && (
                              <button
                                type="button"
                                onClick={() => handleRemoveNewFile(idx)}
                                className="absolute top-1 left-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                                title="حذف الصورة"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                            <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[9px] px-1 rounded font-bold">
                              جديدة
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-amber-200">
                      <p className="text-[11px] font-semibold text-stone-600">
                        الصور الحالية للنشاط ({existingImages.length}):
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {existingImages.map((imgUrl, idx) => (
                          <div 
                            key={idx} 
                            className={`relative rounded-xl overflow-hidden border-2 shadow-xs transition-all ${
                              idx === 0 ? 'border-[#c2410c] ring-2 ring-[#c2410c]/30' : 'border-stone-300'
                            }`}
                          >
                             <div className="w-full h-24 overflow-hidden bg-stone-100 flex items-center justify-center">
                               {imgUrl ? (
                                 <img 
                                   src={imgUrl} 
                                   alt={`Activity photo ${idx + 1}`} 
                                   className="w-full h-full object-cover" 
                                 />
                               ) : (
                                 <Mountain className="w-8 h-8 text-stone-400" />
                               )}
                             </div>

                            {/* Badge */}
                            {idx === 0 ? (
                              <span className="absolute top-1 right-1 bg-[#c2410c] text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-xs flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                <span>صورة الغلاف</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => handleMakeCover(idx)}
                                className="absolute top-1 right-1 bg-black/70 hover:bg-[#c2410c] text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-xs transition-colors cursor-pointer"
                                title="تعيين كصورة الغلاف الرئيسية"
                              >
                                ★ تعيين كغلاف
                              </button>
                            )}

                            {/* Controls Bar */}
                            {!isSaving && (
                              <div className="p-1 bg-stone-900/80 backdrop-blur-xs flex items-center justify-between text-white">
                                <div className="flex items-center gap-1">
                                  {/* Shift Left / Earlier */}
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleShiftImage(idx, 'prev')}
                                    className="p-1 rounded bg-white/20 hover:bg-white/40 disabled:opacity-30 transition-colors cursor-pointer"
                                    title="تقديم الترتيب"
                                  >
                                    ◀
                                  </button>
                                  {/* Shift Right / Later */}
                                  <button
                                    type="button"
                                    disabled={idx === existingImages.length - 1}
                                    onClick={() => handleShiftImage(idx, 'next')}
                                    className="p-1 rounded bg-white/20 hover:bg-white/40 disabled:opacity-30 transition-colors cursor-pointer"
                                    title="تأخير الترتيب"
                                  >
                                    ▶
                                  </button>
                                </div>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExistingImage(imgUrl)}
                                  className="p-1 rounded bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                                  title="حذف الصورة"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Image URL input */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      أو أدخل رابط صورة مباشرة (URL):
                    </label>
                    <input
                      type="url"
                      disabled={isSaving}
                      value={activeItem.imageUrl || ''}
                      onChange={(e) => setActiveItem({ ...activeItem, imageUrl: e.target.value })}
                      placeholder="https://example.com/photo.webp"
                      className="w-full p-2 rounded-lg border border-stone-300 text-xs font-mono bg-white text-left disabled:opacity-50"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="pt-4 border-t border-stone-100 space-y-3">
                  {/* Live Progress Bar Indicator */}
                  {isSaving && (
                    <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-[#1c130c] font-bold">
                          <Loader2 className="w-4 h-4 animate-spin text-[#c2410c]" />
                          <span>{saveStatusText || 'جاري معالجة البيانات...'}</span>
                        </div>
                        <span className="font-mono font-bold text-[#c2410c] text-xs bg-white px-2 py-0.5 rounded-md border border-amber-200 shadow-2xs">
                          {uploadProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden shadow-inner">
                        <div 
                          className="bg-linear-to-r from-[#c2410c] via-amber-500 to-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${Math.max(uploadProgress, 5)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] text-stone-400">
                      {isSaving ? 'يرجى الانتظار حتى اكتمال المعالجة والرفع...' : 'سيتم نشر التحديثات فوراً على الموقع'}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => {
                          cleanupPreviews();
                          setIsEditing(false);
                        }}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#c2410c] to-[#ea580c] hover:from-[#9a3412] hover:to-[#c2410c] shadow-md flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed glow-terracotta"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{uploadProgress > 0 ? `جاري الحفظ (${uploadProgress}%)` : 'جاري الحفظ...'}</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>حفظ ونشر التعديلات</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Simple Delete Confirmation Dialog */}
        {deletingId && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-arabic-body" dir="rtl">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-base text-slate-900">
                  هل أنت متأكد من حذف هذا النشاط؟
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  سيتم حذف النشاط نهائياً من الموقع وإزالته من قائمة العروض.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleDelete(deletingId)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>تأكيد الحذف</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
