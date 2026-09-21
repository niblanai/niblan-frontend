import React, { useState, useRef, useEffect } from 'react';
import { getCurrentUser, type UserProfile } from '../../services/auth.service';
import { uploadAvatar, uploadCover, updateProfile, type ProfileUpdatePayload } from '../../services/users.service';
import PostList from '../posts/PostList';
import CreatePostModal from '../posts/CreatePostModal';
import { getMyPosts, type Post } from '../../services/posts.service';

// ==================== TYPES ====================
type ProfileTab = 'posts' | 'books' | 'articles' | 'audio' | 'podcast' | 'edits';

interface WorkItem {
  id: number;
  title: string;
  description: string;
  cover: string;
  category: string;
  date: string;
  reads?: number;
  listens?: number;
  duration?: string;
  episodes?: number;
}

// ==================== DATA ====================
// These tabs still carry placeholder content (books/articles/audio/...) — only
// the "المنشورات" tab is backed by the real posts module.
const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'posts',
    label: 'المنشورات',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>,
  },
  {
    id: 'books',
    label: 'كتب',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
  },
  {
    id: 'articles',
    label: 'مقالات',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  },
  {
    id: 'audio',
    label: 'صوتيات',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>,
  },
  {
    id: 'podcast',
    label: 'بودكاست',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>,
  },
  {
    id: 'edits',
    label: 'تعديلات',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
  },
];

// Placeholder content for non-posts tabs — not part of today's scope.
const books: WorkItem[] = [
  { id: 1, title: 'فن التفكير الواضح', description: 'دليل عملي لتحسين التفكير النقدي واتخاذ القرارات', cover: '📕', category: 'تطوير ذاتي', date: '2024', reads: 12400 },
  { id: 2, title: 'خريطة العقل', description: 'كيف يعمل الدماغ وكيف تستغل قدراته الكاملة', cover: '🧠', category: 'علوم', date: '2023', reads: 8900 },
  { id: 3, title: 'رحلة الألف ميل', description: 'قصص واقعية عن الأشخاص الذين غيّروا حياتهم', cover: '🗺️', category: 'إلهام', date: '2023', reads: 15200 },
  { id: 4, title: 'لغة الأرقام', description: 'فهم الإحصاءات والبيانات في حياتنا اليومية', cover: '📊', category: 'علوم', date: '2022', reads: 6700 },
];

const articles: WorkItem[] = [
  { id: 1, title: 'مستقبل الذكاء الاصطناعي في التعليم', description: 'تحليل شامل لتأثير AI على المنظومة التعليمية', cover: '🤖', category: 'تقنية', date: 'ديسمبر 2024', reads: 4500 },
  { id: 2, title: 'علم النفس المعرفي والقراءة', description: 'ماذا يحدث في دماغك وأنت تقرأ؟', cover: '🔬', category: 'علوم', date: 'نوفمبر 2024', reads: 3200 },
  { id: 3, title: 'اقتصاد الانتباه في عصر التشتت', description: 'كيف تسرق التطبيقات انتباهك وماذا تفعل', cover: '📱', category: 'مجتمع', date: 'أكتوبر 2024', reads: 6800 },
  { id: 4, title: 'فن الكتابة الإبداعية', description: 'تقنيات عملية لتطوير مهاراتك في الكتابة', cover: '✍️', category: 'أدب', date: 'سبتمبر 2024', reads: 2900 },
  { id: 5, title: 'التنوع البيولوجي وأهميته', description: 'لماذا يجب أن نهتم بتنوع الحياة على كوكبنا', cover: '🌿', category: 'بيئة', date: 'أغسطس 2024', reads: 4100 },
];

const audioItems: WorkItem[] = [
  { id: 1, title: 'مدخل إلى الفلسفة الإسلامية', description: 'سلسلة محاضرات تمهيدية', cover: '🎙️', category: 'فلسفة', date: '2024', listens: 3200, duration: '2س 15د' },
  { id: 2, title: 'قراءة حية: العادات الذرية', description: 'قراءة مختارة من فصول الكتاب', cover: '📖', category: 'كتب صوتية', date: '2024', listens: 5100, duration: '1س 45د' },
  { id: 3, title: 'تأملات صباحية', description: 'تأملات قصيرة لبدء اليوم بإيجابية', cover: '🌅', category: 'تأمل', date: '2024', listens: 8400, duration: '15د' },
  { id: 4, title: 'شرح كتاب "Thinking Fast"', description: 'ملخص وشرح مفصل للكتاب', cover: '💭', category: 'ملخصات', date: '2023', listens: 2800, duration: '3س 20د' },
];

const podcastItems: WorkItem[] = [
  { id: 1, title: 'حوارات عميقة', description: 'حوار مع د. سارة عن علم النفس الإيجابي', cover: '🎙️', category: 'حوار', date: '2024', listens: 12000, episodes: 24, duration: '45د' },
  { id: 2, title: 'قصص من الواقع', description: 'حكايات أشخاص عاديين صنعوا فرقاً', cover: '🎤', category: 'قصص', date: '2024', listens: 8700, episodes: 18, duration: '30د' },
  { id: 3, title: 'عالم التقنية', description: 'آخر أخبار التكنولوجيا بشكل مبسط', cover: '💻', category: 'تقنية', date: '2023', listens: 15400, episodes: 42, duration: '25د' },
];

const editItems: WorkItem[] = [
  { id: 1, title: 'تحرير: دليل الكتابة العلمية', description: 'مراجعة وتحرير علمي لـ 12 فصل', cover: '📝', category: 'تحرير علمي', date: '2024', reads: 3400 },
  { id: 2, title: 'إعادة صياغة: مقالات مجلة المعرفة', description: 'إعادة صياغة وتحسين 8 مقالات', cover: '✏️', category: 'إعادة صياغة', date: '2024', reads: 2100 },
  { id: 3, title: 'مراجعة: رواية "ظلال المدينة"', description: 'مراجعة نقدية وتحرير أدبي', cover: '📕', category: 'تحرير أدبي', date: '2023', reads: 1800 },
  { id: 4, title: 'تصحيح: سلسلة كتب الأطفال', description: 'تصحيح لغوي وإملائي لـ 6 كتب', cover: '🎨', category: 'تصحيح', date: '2023', reads: 4200 },
];

// ==================== HELPERS ====================

function CoverPlaceholder({ emoji, size = 'md' }: { emoji: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-12 h-16', md: 'w-28 h-40', lg: 'w-36 h-52' };
  return (
    <div className={`${sizes[size]} rounded-xl bg-[#F8F3E7] border border-[#E8DFCB] flex items-center justify-center text-4xl select-none`}>
      {emoji}
    </div>
  );
}

function formatJoinDate(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('ar', { year: 'numeric', month: 'long' }).format(d);
}

function getInitial(name?: string | null) {
  const trimmed = (name ?? '').trim();
  return trimmed ? trimmed[0] : '؟';
}

// Maps an ISO country code to an Arabic country name + flag. Falls back to
// the raw code so we never show "null".
const COUNTRY_NAMES: Record<string, string> = {
  SA: 'المملكة العربية السعودية 🇸🇦', EG: 'مصر 🇪🇬', AE: 'الإمارات 🇦🇪', KW: 'الكويت 🇰🇼',
  QA: 'قطر 🇶🇦', BH: 'البحرين 🇧🇭', OM: 'عُمان 🇴🇲', JO: 'الأردن 🇯🇴', IQ: 'العراق 🇮🇶',
  MA: 'المغرب 🇲🇦', DZ: 'الجزائر 🇩🇿', TN: 'تونس 🇹🇳', LY: 'ليبيا 🇱🇾', SD: 'السودان 🇸🇩',
  YE: 'اليمن 🇾🇪', SY: 'سوريا 🇸🇾', LB: 'لبنان 🇱🇧', PS: 'فلسطين 🇵🇸', MR: 'موريتانيا 🇲🇷',
};
function countryLabel(code?: string | null) {
  if (!code) return 'غير محدد';
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}

// ==================== MAIN ====================
export default function ProfileHeader() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ---- Real user data from the database (via /api/v1/users/me) ----
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('niblan_token');
    if (!token) {
      setProfileLoading(false);
      setProfileError('لا يوجد تسجيل دخول');
      return;
    }

    let cancelled = false;
    setProfileLoading(true);
    getCurrentUser(token)
      .then((data) => {
        if (!cancelled) {
          setUser(data);
          setProfileError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setProfileError(err instanceof Error ? err.message : 'تعذر تحميل بيانات الملف الشخصي');
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ---- منشورات (real data from the posts module) ----
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('niblan_token');
    if (!token) {
      setPostsLoading(false);
      return;
    }

    let cancelled = false;
    setPostsLoading(true);
    getMyPosts(token)
      .then((data) => {
        if (!cancelled) {
          setMyPosts(data);
          setPostsError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setPostsError(err instanceof Error ? err.message : 'تعذر تحميل المنشورات');
      })
      .finally(() => {
        if (!cancelled) setPostsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePostCreated = (post: Post) => setMyPosts((prev) => [post, ...prev]);
  const handlePostUpdated = (updated: Post) => setMyPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  const handlePostDeleted = (id: string) => setMyPosts((prev) => prev.filter((p) => p.id !== id));

  // ---- Create post modal (replaces the always-visible inline composer) ----
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const [avatarError, setAvatarError] = useState<string | null>(null);

  const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB — must match the backend's business rule
  const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('نوع الملف غير مدعوم — استخدم PNG, JPEG, WEBP أو GIF');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('حجم الصورة أكبر من 5 ميجابايت');
      e.target.value = '';
      return;
    }

    const token = localStorage.getItem('niblan_token');
    if (!token) return;

    setAvatarError(null);
    setIsUploading(true);
    try {
      const updated = await uploadAvatar(token, file);
      setUser(updated);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'فشل رفع الصورة');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setCoverError('نوع الملف غير مدعوم — استخدم PNG, JPEG, WEBP أو GIF');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setCoverError('حجم الصورة أكبر من 5 ميجابايت');
      e.target.value = '';
      return;
    }

    const token = localStorage.getItem('niblan_token');
    if (!token) return;

    setCoverError(null);
    setIsCoverUploading(true);
    try {
      const updated = await uploadCover(token, file);
      setUser(updated);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : 'فشل رفع صورة الغلاف');
    } finally {
      setIsCoverUploading(false);
      e.target.value = '';
    }
  };

  // ---- Edit profile modal ----
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileUpdatePayload>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEditModal = () => {
    setEditForm({
      username: user?.username ?? '',
      display_name: user?.display_name ?? '',
      bio: user?.bio ?? '',
      country_code: user?.country_code ?? '',
      timezone: user?.timezone ?? '',
      gender: user?.gender ?? 'unspecified',
      birth_date: user?.birth_date ?? '',
      is_profile_public: user?.is_profile_public ?? true,
      account_type: user?.account_type ?? '',
      specialization: user?.specialization ?? '',
      languages: user?.languages ?? [],
      qualifications: user?.qualifications ?? [],
    });
    setEditError(null);
    setIsEditing(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('niblan_token');
    if (!token) return;

    setEditSubmitting(true);
    setEditError(null);
    try {
      const payload: ProfileUpdatePayload = { ...editForm };
      if (!payload.country_code) delete payload.country_code;
      if (!payload.timezone) delete payload.timezone;
      if (!payload.birth_date) delete payload.birth_date;

      const updated = await updateProfile(token, payload);
      setUser(updated);
      setIsEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'فشل حفظ التعديلات');
    } finally {
      setEditSubmitting(false);
    }
  };

  // ---- Qualifications list editing helpers ----
  const addQualification = () => {
    const current = editForm.qualifications ?? [];
    setEditForm({
      ...editForm,
      qualifications: [...current, { title: '', institution: '', year: '', position: current.length }],
    });
  };
  const updateQualification = (index: number, field: 'title' | 'institution' | 'year', value: string) => {
    const current = [...(editForm.qualifications ?? [])];
    current[index] = { ...current[index], [field]: value };
    setEditForm({ ...editForm, qualifications: current });
  };
  const removeQualification = (index: number) => {
    const current = [...(editForm.qualifications ?? [])];
    current.splice(index, 1);
    // Re-index positions so the saved order is stable.
    setEditForm({ ...editForm, qualifications: current.map((q, i) => ({ ...q, position: i })) });
  };

  const getActiveData = (): { type: 'works'; items: WorkItem[] } => {
    switch (activeTab) {
      case 'books': return { type: 'works', items: books };
      case 'articles': return { type: 'works', items: articles };
      case 'audio': return { type: 'works', items: audioItems };
      case 'podcast': return { type: 'works', items: podcastItems };
      case 'edits': return { type: 'works', items: editItems };
      default: return { type: 'works', items: [] };
    }
  };

  const activeData = getActiveData();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-[#E8DFCB]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C69A3E] animate-spin" />
        </div>
      </div>
    );
  }

  if (profileError || !user) {
    return (
      <div className="flex items-center justify-center text-center py-24 px-6">
        <p className="text-[#8A8172] text-sm">{profileError ?? 'تعذر تحميل بيانات الملف الشخصي'}</p>
      </div>
    );
  }

  // Basic info comes straight from the profile response now (stage 3).
  const accountType = user.account_type || 'غير محدد';
  const specialization = user.specialization || 'غير محدد';
  const languages = user.languages?.length ? user.languages.join('، ') : 'غير محدد';
  const qualifications = user.qualifications ?? [];

  return (
    <div dir="rtl">

      {/* ===== COVER + HEADER CARD ===== */}
      <div className="bg-white border border-[#E8DFCB] rounded-2xl overflow-hidden">
        {/* Cover photo */}
        <div className="relative h-40 sm:h-52 lg:h-60 overflow-hidden">
          {user.cover_url ? (
            <img src={user.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#C69A3E]/25 via-[#15130D] to-[#C69A3E]/10" />
          )}

          {/* Cover edit */}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={isCoverUploading}
            className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-[#E8DFCB] text-xs text-[#4A4436] hover:bg-white transition-all duration-200 disabled:opacity-60"
          >
            {isCoverUploading ? (
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
            )}
            تغيير الغلاف
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFileChange} />
          {coverError && (
            <p className="absolute top-14 left-4 text-xs text-[#C0392B] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5">{coverError}</p>
          )}
        </div>

        {/* Avatar + name row */}
        <div className="px-5 sm:px-8 pb-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6 -mt-16 sm:-mt-20">

            {/* Avatar */}
            <div className="relative" onClick={handleAvatarClick}>
              <div
                className={`w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-[#F8F3E7] border-4 border-white shadow-sm flex items-center justify-center text-5xl sm:text-6xl cursor-pointer transition-all duration-300 ${avatarHover ? 'scale-105' : ''} ${isUploading ? 'animate-pulse' : ''}`}
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
              >
                {isUploading ? (
                  <svg className="w-10 h-10 text-[#C69A3E] animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <span className="font-bold text-[#15130D]">{getInitial(user.display_name)}</span>
                )}
              </div>

              <div className={`absolute inset-0 rounded-2xl bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-2 transition-opacity duration-300 cursor-pointer ${avatarHover || isUploading ? 'opacity-100' : 'opacity-0'}`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                <span className="text-xs text-white font-medium">{isUploading ? 'جاري الرفع...' : 'تغيير الصورة'}</span>
              </div>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {avatarError && <p className="text-xs text-[#C0392B] mt-2 text-center">{avatarError}</p>}

            {/* Name + actions */}
            <div className="flex-1 text-center sm:text-right sm:pb-2 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#15130D]">{user.display_name}</h1>
                  <p className="text-sm text-[#8A8172] mt-1" dir="ltr">@{user.username}</p>
                </div>
                <div className="flex items-center gap-2.5 justify-center sm:justify-end">
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 bg-[#C69A3E] hover:bg-[#B78D34] text-[#15130D]"
                  >
                    متابعة
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-[#F8F3E7] border border-[#E8DFCB] flex items-center justify-center text-[#4A4436] hover:bg-[#EFE8D8] transition-all duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                  </button>
                  <button
                    onClick={openEditModal}
                    className="w-10 h-10 rounded-xl bg-[#F8F3E7] border border-[#E8DFCB] flex items-center justify-center text-[#4A4436] hover:bg-[#EFE8D8] transition-all duration-200"
                    title="تعديل البروفايل"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm sm:text-base text-[#4A4436] leading-relaxed max-w-2xl mb-6 mt-4">
            {user.bio || 'لا يوجد نبذة تعريفية بعد.'}
          </p>

          {/* Join date (the only stat the DB actually stores today) */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6 pb-6 border-b border-[#E8DFCB]">
            {formatJoinDate(user.created_at) && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#8A8172]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                <span className="text-sm text-[#8A8172]">انضم في {formatJoinDate(user.created_at)}</span>
              </div>
            )}
          </div>

          {/* User details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
            {/* Basic info */}
            <div className="p-4 rounded-xl bg-[#FBF7EC] border border-[#E8DFCB] space-y-3">
              <p className="text-[10px] text-[#8A8172] uppercase tracking-wider font-semibold">معلومات أساسية</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8A8172]">نوع الحساب</span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#C69A3E]/10 text-[#B78D34] border border-[#C69A3E]/20">{accountType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8A8172]">التخصص</span>
                  <span className="text-xs font-medium text-[#211B12]">{specialization}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8A8172]">البلد</span>
                  <span className="text-xs font-medium text-[#211B12]">{countryLabel(user.country_code)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8A8172]">اللغة</span>
                  <span className="text-xs font-medium text-[#211B12]">{languages}</span>
                </div>
              </div>
            </div>

            {/* Qualifications — backed by users.profile_qualifications (stage 3) */}
            <div className="p-4 rounded-xl bg-[#FBF7EC] border border-[#E8DFCB] space-y-3">
              <p className="text-[10px] text-[#8A8172] uppercase tracking-wider font-semibold">المؤهلات والشهادات</p>
              <div className="space-y-2.5">
                {qualifications.length === 0 ? (
                  <p className="text-xs text-[#8A8172]">لا توجد مؤهلات مضافة بعد.</p>
                ) : (
                  qualifications.map((q) => (
                    <div key={q.id ?? q.position}>
                      <p className="text-xs font-medium text-[#211B12]">{q.title}</p>
                      <p className="text-[11px] text-[#8A8172]">{[q.institution, q.year].filter(Boolean).join(' • ')}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="bg-white border border-[#E8DFCB] rounded-2xl mt-4 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-[#15130D] border-[#C69A3E]'
                  : 'text-[#8A8172] border-transparent hover:text-[#4A4436]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="py-6">

        {/* ===== POSTS TAB ===== */}
        {activeTab === 'posts' && (
          <div className="space-y-5">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="w-full flex items-center gap-3 bg-white border border-[#E8DFCB] rounded-2xl px-5 py-4 text-right hover:border-[#C69A3E]/40 hover:bg-[#FBF7EC] transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-[#C69A3E]/10 flex items-center justify-center text-[#C69A3E] shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-[#15130D]">إنشاء منشور</p>
                <p className="text-xs text-[#8A8172]">شارك أفكارك، مقالاتك، أو اقتباساتك...</p>
              </div>
            </button>
            <PostList
              posts={myPosts}
              loading={postsLoading}
              error={postsError}
              currentAccountId={user.id}
              onUpdated={handlePostUpdated}
              onDeleted={handlePostDeleted}
            />
          </div>
        )}

        {/* ===== WORKS TABS (Books, Articles, Audio, Podcast, Edits) ===== */}
        {activeData.type === 'works' && (
          <div>
            {(activeTab === 'audio' || activeTab === 'podcast') ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(activeData.items as WorkItem[]).map((item) => (
                  <div key={item.id} className="group bg-white border border-[#E8DFCB] rounded-2xl p-5 hover:bg-[#FBF7EC] transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-[#F8F3E7] border border-[#E8DFCB] flex items-center justify-center text-2xl flex-shrink-0">
                        {item.cover}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold group-hover:text-[#C69A3E] transition-colors truncate text-[#15130D]">{item.title}</h4>
                        <p className="text-xs text-[#8A8172] mt-0.5">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {item.duration && (
                          <span className="flex items-center gap-1 text-[11px] text-[#8A8172]">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {item.duration}
                          </span>
                        )}
                        {item.episodes && (
                          <span className="flex items-center gap-1 text-[11px] text-[#8A8172]">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125M18 10.875c0-.621.504-1.125 1.125-1.125" /></svg>
                            {item.episodes} حلقة
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#B3AB98]">{item.date}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C69A3E]/10 border border-[#C69A3E]/20 text-[#B78D34] text-xs font-medium hover:bg-[#C69A3E]/20 transition-all">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                        استمع
                      </button>
                      {item.listens && (
                        <span className="flex items-center gap-1 text-[11px] text-[#8A8172]">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
                          {(item.listens / 1000).toFixed(1)}K
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(activeData.items as WorkItem[]).map((item) => (
                  <div key={item.id} className="group bg-white border border-[#E8DFCB] rounded-2xl overflow-hidden hover:bg-[#FBF7EC] hover:border-[#C69A3E]/30 transition-all duration-300 hover:-translate-y-1">
                    <div className="relative p-6 pb-4 flex justify-center bg-gradient-to-b from-[#FBF7EC] to-transparent">
                      <div className="group-hover:scale-105 transition-transform duration-500">
                        <CoverPlaceholder emoji={item.cover} size={activeTab === 'books' ? 'lg' : 'md'} />
                      </div>
                      <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-[#F8F3E7] border border-[#E8DFCB] text-[#8A8172]">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-5 pt-2">
                      <h4 className="text-sm font-semibold group-hover:text-[#C69A3E] transition-colors duration-200 mb-1.5 line-clamp-1 text-[#15130D]">{item.title}</h4>
                      <p className="text-xs text-[#8A8172] leading-relaxed line-clamp-2 mb-4">{item.description}</p>

                      <div className="flex items-center justify-between pt-3 border-t border-[#E8DFCB]">
                        <div className="flex items-center gap-3">
                          {item.reads && (
                            <span className="flex items-center gap-1 text-[11px] text-[#8A8172]">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {(item.reads / 1000).toFixed(1)}K
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#B3AB98]">{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ===== CREATE POST MODAL ===== */}
      <CreatePostModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onCreated={handlePostCreated} />

      {/* ===== EDIT PROFILE MODAL ===== */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsEditing(false)}>
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white border border-[#E8DFCB] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#15130D]">تعديل البروفايل</h2>
              <button onClick={() => setIsEditing(false)} className="text-[#8A8172] hover:text-[#15130D] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {editError && (
              <div className="mb-4 rounded-xl border border-[#C0392B]/30 bg-[#C0392B]/10 p-3 text-sm text-[#C0392B]">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[#8A8172] mb-1.5">اسم المستخدم</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editForm.username ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full bg-[#FBF7EC] border border-[#E8DFCB] rounded-xl py-3 px-4 text-sm text-[#211B12] outline-none focus:border-[#C69A3E] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8A8172] mb-1.5">الاسم الكامل</label>
                <input
                  type="text"
                  value={editForm.display_name ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                  className="w-full bg-[#FBF7EC] border border-[#E8DFCB] rounded-xl py-3 px-4 text-sm text-[#211B12] outline-none focus:border-[#C69A3E] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8A8172] mb-1.5">نبذة تعريفية</label>
                <textarea
                  value={editForm.bio ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  maxLength={500}
                  className="w-full bg-[#FBF7EC] border border-[#E8DFCB] rounded-xl py-3 px-4 text-sm text-[#211B12] outline-none focus:border-[#C69A3E] transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8A8172] mb-1.5">كود البلد (مثال: EG)</label>
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={2}
                    value={editForm.country_code ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, country_code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#FBF7EC] border border-[#E8DFCB] rounded-xl py-3 px-4 text-sm text-[#211B12] outline-none focus:border-[#C69A3E] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8A8172] mb-1.5">الجنس</label>
                  <select
                    value={editForm.gender ?? 'unspecified'}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as ProfileUpdatePayload['gender'] })}
                    className="w-full bg-[#FBF7EC] border border-[#E8DFCB] rounded-xl py-3 px-4 text-sm text-[#211B12] outline-none focus:border-[#C69A3E] transition-colors"
                  >
                    <option value="unspecified">غير محدد</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8A8172] mb-1.5">تاريخ الميلاد</label>
                  <input
                    type="date"
                    dir="ltr"
                    value={editForm.birth_date ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                    className="w-full bg-[#FBF7EC] border border-[#E8DFCB] rounded-xl py-3 px-4 text-sm text-[#211B12] outline-none focus:border-[#C69A3E] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8A8172] mb-1.5">المنطقة الزمنية</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="Africa/Cairo"
                    value={editForm.timezone ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
                    className="w-full bg-[#FBF7EC] border border-[#E8DFCB] rounded-xl py-3 px-4 text-sm text-[#211B12] outline-none focus:border-[#C69A3E] transition-colors"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.is_profile_public ?? true}
                  onChange={(e) => setEditForm({ ...editForm, is_profile_public: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#C69A3E]"
                />
                <span className="text-sm text-[#4A4436]">البروفايل عام (يظهر لباقي المستخدمين)</span>
              </label>

              {/* ===== Basic info extras ===== */}
              <div className="pt-4 mt-2 border-t border-[#E8DFCB]">
                <p className="text-xs font-semibold text-[#15130D] mb-3">معلومات أساسية</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#8A8172] mb-1.5">نوع الحساب</label>
                    <input
                      type="text"
                      placeholder="مثال: كاتب وباحث"
                      value={editForm.account_type ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, account_type: e.target.value })}
                      className="w-full bg-[#FBF7EC] border border-[#E8DFCB] rounded-xl py-3 px-4 text-sm text-[#211B12] outline-none focus:border-[#C69A3E] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8A8172] mb-1.5">التخصص</label>
                    <input
                      type="text"
                      placeholder="مثال: الفلسفة وعلم النفس"
                      value={editForm.specialization ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                      className="w-full bg-[#FBF7EC] border border-[#E8DFCB] rounded-xl py-3 px-4 text-sm text-[#211B12] outline-none focus:border-[#C69A3E] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#8A8172] mb-1.5">اللغات (افصل بفاصلة)</label>
                    <input
                      type="text"
                      placeholder="مثال: العربية، الإنجليزية"
                      value={(editForm.languages ?? []).join('، ')}
                      onChange={(e) => setEditForm({ ...editForm, languages: e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean) })}
                      className="w-full bg-[#FBF7EC] border border-[#E8DFCB] rounded-xl py-3 px-4 text-sm text-[#211B12] outline-none focus:border-[#C69A3E] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* ===== Qualifications ===== */}
              <div className="pt-4 border-t border-[#E8DFCB]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-[#15130D]">المؤهلات والشهادات</p>
                  <button
                    type="button"
                    onClick={addQualification}
                    className="flex items-center gap-1 text-xs text-[#C69A3E] hover:text-[#B78D34] font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    إضافة
                  </button>
                </div>
                <div className="space-y-3">
                  {(editForm.qualifications ?? []).length === 0 && (
                    <p className="text-xs text-[#8A8172]">لم تُضف مؤهلات بعد.</p>
                  )}
                  {(editForm.qualifications ?? []).map((q, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="العنوان"
                          value={q.title}
                          onChange={(e) => updateQualification(i, 'title', e.target.value)}
                          className="bg-[#FBF7EC] border border-[#E8DFCB] rounded-lg py-2 px-3 text-xs text-[#211B12] outline-none focus:border-[#C69A3E] transition-colors"
                        />
                        <input
                          type="text"
                          placeholder="الجهة"
                          value={q.institution ?? ''}
                          onChange={(e) => updateQualification(i, 'institution', e.target.value)}
                          className="bg-[#FBF7EC] border border-[#E8DFCB] rounded-lg py-2 px-3 text-xs text-[#211B12] outline-none focus:border-[#C69A3E] transition-colors"
                        />
                        <input
                          type="text"
                          placeholder="السنة"
                          value={q.year ?? ''}
                          onChange={(e) => updateQualification(i, 'year', e.target.value)}
                          className="bg-[#FBF7EC] border border-[#E8DFCB] rounded-lg py-2 px-3 text-xs text-[#211B12] outline-none focus:border-[#C69A3E] transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQualification(i)}
                        className="w-8 h-8 shrink-0 rounded-lg bg-[#F8F3E7] border border-[#E8DFCB] flex items-center justify-center text-[#8A8172] hover:text-[#C0392B] hover:bg-[#C0392B]/5 transition-colors"
                        aria-label="حذف المؤهل"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 rounded-xl bg-[#F8F3E7] border border-[#E8DFCB] text-sm text-[#4A4436] hover:bg-[#EFE8D8] transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 py-3 rounded-xl bg-[#C69A3E] hover:bg-[#B78D34] text-[#15130D] text-sm font-semibold disabled:opacity-60 transition-all"
                >
                  {editSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
