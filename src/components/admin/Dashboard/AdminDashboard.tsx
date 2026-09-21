'use client';

import React, { useState } from 'react';

// ==================== TYPES ====================
type ServerStatus = 'healthy' | 'warning' | 'critical';
type AlertSeverity = 'critical' | 'warning' | 'info';
type UserRole = 'admin' | 'editor' | 'viewer' | 'suspended';
type TabId = 'overview' | 'users' | 'moderation' | 'system' | 'logs' | 'settings';

interface ServerNode {
  id: string;
  name: string;
  region: string;
  status: ServerStatus;
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  requests: number;
}

interface AlertItem {
  id: number;
  severity: AlertSeverity;
  title: string;
  description: string;
  time: string;
  resolved: boolean;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  lastActive: string;
  status: 'online' | 'offline' | 'away';
}

interface ModItem {
  id: number;
  type: 'report' | 'review' | 'content';
  title: string;
  reporter: string;
  reason: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
}

interface LogEntry {
  id: number;
  action: string;
  admin: string;
  target: string;
  ip: string;
  time: string;
  type: 'create' | 'update' | 'delete' | 'login' | 'security';
}

// ==================== DATA ====================
const navItems: { id: TabId; label: string; icon: React.ReactNode; badge?: number }[] = [
  {
    id: 'overview',
    label: 'نظرة عامة',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  },
  {
    id: 'users',
    label: 'إدارة المستخدمين',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    badge: 28,
  },
  {
    id: 'moderation',
    label: 'المراجعة',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" /></svg>,
    badge: 7,
  },
  {
    id: 'system',
    label: 'الخوادم',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" /></svg>,
  },
  {
    id: 'logs',
    label: 'سجل العمليات',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    id: 'settings',
    label: 'إعدادات النظام',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
];

const systemStats = [
  { label: 'الخوادم النشطة', value: '8 / 10', sub: 'خادمان في الصيانة', status: 'warning' as const },
  { label: 'وقت التشغيل', value: '99.97%', sub: 'آخر تعطل منذ 45 يوم', status: 'healthy' as const },
  { label: 'وقت الاستجابة', value: '42ms', sub: 'المعدل خلال 24 ساعة', status: 'healthy' as const },
  { label: 'التنبيهات النشطة', value: '3', sub: 'حالتان حرجتان', status: 'critical' as const },
];

const servers: ServerNode[] = [
  { id: 'srv-01', name: 'API Gateway', region: 'الرياض', status: 'healthy', cpu: 34, memory: 62, disk: 45, uptime: '45 يوم', requests: 12400 },
  { id: 'srv-02', name: 'Web Frontend', region: 'جدة', status: 'healthy', cpu: 22, memory: 48, disk: 31, uptime: '45 يوم', requests: 8900 },
  { id: 'srv-03', name: 'Database Primary', region: 'الرياض', status: 'warning', cpu: 78, memory: 85, disk: 72, uptime: '12 يوم', requests: 34200 },
  { id: 'srv-04', name: 'Database Replica', region: 'الرياض', status: 'healthy', cpu: 45, memory: 68, disk: 71, uptime: '45 يوم', requests: 18900 },
  { id: 'srv-05', name: 'Worker Queue', region: 'جدة', status: 'critical', cpu: 95, memory: 92, disk: 88, uptime: '3 يوم', requests: 5600 },
  { id: 'srv-06', name: 'Cache Layer', region: 'الرياض', status: 'healthy', cpu: 18, memory: 56, disk: 22, uptime: '45 يوم', requests: 45200 },
];

const alerts: AlertItem[] = [
  { id: 1, severity: 'critical', title: 'استهلاك عالي للمعالج', description: 'خادم Worker Queue يستهلك 95% من المعالج', time: 'منذ 3 دقائق', resolved: false },
  { id: 2, severity: 'critical', title: 'ذاكرة مكدسة', description: 'خادم Worker Queue يستخدم 92% من الذاكرة', time: 'منذ 5 دقائق', resolved: false },
  { id: 3, severity: 'warning', title: 'تحذير مساحة القرص', description: 'خادم Worker Queue وصل لـ 88% من سعة القرص', time: 'منذ 15 دقيقة', resolved: false },
  { id: 4, severity: 'warning', title: 'بطء الاستجابة', description: 'قاعدة البيانات الأساسية تستغرق 200ms+', time: 'منذ ساعة', resolved: false },
  { id: 5, severity: 'info', title: 'تحديث تلقائي مكتمل', description: 'تم تحديث خادم Cache Layer للإصدار 3.2.1', time: 'منذ 3 ساعات', resolved: true },
  { id: 6, severity: 'info', title: 'نسخة احتياطية', description: 'تم إنشاء نسخة احتياطية لقاعدة البيانات بنجاح', time: 'منذ 6 ساعات', resolved: true },
];

const users: UserItem[] = [
  { id: 1, name: 'سارة الأحمد', email: 'sara@niblan.com', role: 'admin', avatar: 'س.أ', lastActive: 'الآن', status: 'online' },
  { id: 2, name: 'محمد الخالدي', email: 'mohammed@niblan.com', role: 'editor', avatar: 'م.خ', lastActive: 'منذ 5 د', status: 'online' },
  { id: 3, name: 'نورة العتيبي', email: 'noura@niblan.com', role: 'editor', avatar: 'ن.ع', lastActive: 'منذ 23 د', status: 'away' },
  { id: 4, name: 'خالد الشمري', email: 'khaled@niblan.com', role: 'viewer', avatar: 'خ.ش', lastActive: 'منذ ساعة', status: 'offline' },
  { id: 5, name: 'فاطمة القحطاني', email: 'fatima@niblan.com', role: 'admin', avatar: 'ف.ق', lastActive: 'منذ 3 س', status: 'offline' },
  { id: 6, name: 'عبدالله المالكي', email: 'abdullah@niblan.com', role: 'suspended', avatar: 'ع.م', lastActive: 'منذ 5 أيام', status: 'offline' },
];

const modQueue: ModItem[] = [
  { id: 1, type: 'report', title: 'إبلاغ عن حساب مزيف', reporter: 'خالد الشمري', reason: 'محتوى مضلل وانتحال هوية', time: 'منذ 10 د', priority: 'high' },
  { id: 2, type: 'content', title: 'تعليق مخالف', reporter: 'النظام التلقائي', reason: 'يتضمن روابط خارجية مشبوهة', time: 'منذ 25 د', priority: 'high' },
  { id: 3, type: 'review', title: 'مراجعة منتج جديد', reporter: 'نورة العتيبي', reason: 'بانتظار موافقة الإدارة', time: 'منذ ساعة', priority: 'medium' },
  { id: 4, type: 'report', title: 'إبلاغ عن صورة غير لائقة', reporter: 'محمد الخالدي', reason: 'صورة ملف شخصي مخالفة', time: 'منذ ساعتين', priority: 'medium' },
  { id: 5, type: 'content', title: 'مقال بانتظار النشر', reporter: 'سارة الأحمد', reason: 'يحتاج مراجعة المحتوى', time: 'منذ 3 س', priority: 'low' },
];

const auditLogs: LogEntry[] = [
  { id: 1, action: 'تعديل صلاحيات', admin: 'أحمد محمد', target: 'محمد الخالدي', ip: '192.168.1.45', time: 'منذ 5 د', type: 'update' },
  { id: 2, action: 'حظر مستخدم', admin: 'أحمد محمد', target: 'عبدالله المالكي', ip: '192.168.1.45', time: 'منذ 30 د', type: 'security' },
  { id: 3, action: 'تسجيل دخول', admin: 'سارة الأحمد', target: '—', ip: '10.0.0.23', time: 'منذ ساعة', type: 'login' },
  { id: 4, action: 'حذف منتج', admin: 'فاطمة القحطاني', target: 'منتج #NB-412', ip: '10.0.0.18', time: 'منذ ساعتين', type: 'delete' },
  { id: 5, action: 'إضافة مستخدم', admin: 'أحمد محمد', target: 'خالد الشمري', ip: '192.168.1.45', time: 'منذ 3 س', type: 'create' },
  { id: 6, action: 'تحديث إعدادات النظام', admin: 'أحمد محمد', target: 'إعدادات البريد', ip: '192.168.1.45', time: 'منذ 5 س', type: 'update' },
  { id: 7, action: 'تسجيل دخول', admin: 'نورة العتيبي', target: '—', ip: '172.16.0.8', time: 'منذ 6 س', type: 'login' },
  { id: 8, action: 'محاولة وصول مرفوضة', admin: 'مجهول', target: '/admin/users/export', ip: '45.33.22.11', time: 'منذ 8 س', type: 'security' },
];

// ==================== HELPERS ====================
const statusColors: Record<ServerStatus, { dot: string; text: string; bg: string }> = {
  healthy: { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  warning: { dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  critical: { dot: 'bg-red-400', text: 'text-red-400', bg: 'bg-red-500/10' },
};

const statusLabels: Record<ServerStatus, string> = {
  healthy: 'سليم',
  warning: 'تحذير',
  critical: 'حرج',
};

const severityConfig: Record<AlertSeverity, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  critical: {
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    label: 'حرج',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
  },
  warning: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    label: 'تحذير',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>,
  },
  info: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    label: 'معلومة',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>,
  },
};

const roleConfig: Record<UserRole, { label: string; color: string; bg: string }> = {
  admin: { label: 'مدير', color: 'text-[#f43f5e]', bg: 'bg-[#f43f5e]/10 border-[#f43f5e]/20' },
  editor: { label: 'محرر', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  viewer: { label: 'مشاهد', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
  suspended: { label: 'موقوف', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

const logTypeConfig: Record<LogEntry['type'], { color: string; bg: string }> = {
  create: { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  update: { color: 'text-blue-400', bg: 'bg-blue-500/10' },
  delete: { color: 'text-red-400', bg: 'bg-red-500/10' },
  login: { color: 'text-slate-400', bg: 'bg-slate-500/10' },
  security: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: 'عالي', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  medium: { label: 'متوسط', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  low: { label: 'منخفض', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
};

const modTypeIcons: Record<string, React.ReactNode> = {
  report: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>,
  review: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
  content: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
};

function getMetricColor(value: number): string {
  if (value >= 85) return 'from-red-500 to-red-400';
  if (value >= 65) return 'from-amber-500 to-amber-400';
  return 'from-emerald-500 to-emerald-400';
}

function getMetricRingColor(value: number): string {
  if (value >= 85) return 'text-red-400';
  if (value >= 65) return 'text-amber-400';
  return 'text-emerald-400';
}

// ==================== COMPONENTS ====================

function MetricRing({ value, size = 44, strokeWidth = 3.5 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className={`-rotate-90 ${getMetricRingColor(value)}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="opacity-10" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

function ProgressBar({ value, height = 6 }: { value: number; height?: number }) {
  return (
    <div className={`w-full bg-white/[0.06] rounded-full overflow-hidden`} style={{ height }}>
      <div
        className={`h-full rounded-full bg-gradient-to-l ${getMetricColor(value)} transition-all duration-700 ease-out`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

// ==================== MAIN ====================
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedServer, setExpandedServer] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex" dir="rtl">

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ===== SIDEBAR ===== */}
      <aside className={`fixed top-0 right-0 bottom-0 w-72 bg-[#0c1322] border-l border-white/[0.06] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f43f5e] to-[#e11d48] flex items-center justify-center shadow-lg shadow-[#f43f5e]/20">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <div className="flex-1">
            <span className="text-lg font-semibold tracking-tight">NIBLAN</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] text-amber-400 font-medium tracking-wide">ADMIN</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold px-3 mb-3 mt-2">لوحة الإدارة</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span className={activeTab === item.id ? 'text-[#f43f5e]' : 'text-slate-500 group-hover:text-slate-300 transition-colors'}>{item.icon}</span>
              <span className="flex-1 text-right">{item.label}</span>
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === item.id ? 'bg-[#f43f5e]/20 text-[#f43f5e]' : 'bg-white/[0.06] text-slate-500'
                }`}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Danger Zone */}
        <div className="p-4 border-t border-white/[0.06]">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all duration-200 group">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            <span>وضع الصيانة</span>
          </button>
        </div>

        {/* Admin Profile */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f43f5e]/30 to-[#e11d48]/20 flex items-center justify-center text-sm font-semibold text-[#f43f5e]">أ.م</div>
              <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0c1322]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">أحمد محمد</p>
              <p className="text-[11px] text-[#f43f5e]/70 truncate">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* ===== TOP BAR ===== */}
        <header className="sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">لوحة إدارة النظام</h1>
                <p className="text-xs text-slate-500 hidden sm:block">مراقبة وإدارة جميع جوانب المنصة</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* System Status Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                <span className="text-[11px] font-medium text-amber-400">3 تنبيهات</span>
              </div>

              {/* Time */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-xs text-slate-400 font-mono">{new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f43f5e]/30 to-[#e11d48]/20 flex items-center justify-center text-sm font-semibold text-[#f43f5e] cursor-pointer hover:from-[#f43f5e]/40 hover:to-[#e11d48]/30 transition-all duration-200">أ.م</div>
            </div>
          </div>
        </header>

        {/* ===== CONTENT ===== */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">

            {/* ===== SYSTEM STATS ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
              {systemStats.map((stat, i) => (
                <div key={i} className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] ${
                      stat.status === 'healthy' ? 'bg-emerald-500/5' : stat.status === 'warning' ? 'bg-amber-500/5' : 'bg-red-500/5'
                    }`} />
                  </div>
                  <div className="relative flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      stat.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' :
                      stat.status === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {stat.status === 'healthy' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      {stat.status === 'warning' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
                      {stat.status === 'critical' && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    </div>
                    <span className={`w-2 h-2 rounded-full ${
                      stat.status === 'healthy' ? 'bg-emerald-400' : stat.status === 'warning' ? 'bg-amber-400' : 'bg-red-400 animate-pulse'
                    }`} />
                  </div>
                  <div className="relative">
                    <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                    <p className="text-[11px] text-slate-600 mt-2">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== SERVERS + ALERTS ===== */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-5">

              {/* Servers */}
              <div className="xl:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 lg:px-6 py-5 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-base font-semibold">حالة الخوادم</h3>
                    <p className="text-xs text-slate-500 mt-0.5">مراقبة الأداء في الوقت الفعلي</p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-slate-500">سليم</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-slate-500">تحذير</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /><span className="text-slate-500">حرج</span></div>
                  </div>
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {servers.map((server) => {
                    const sc = statusColors[server.status];
                    const isExpanded = expandedServer === server.id;

                    return (
                      <div key={server.id} className="hover:bg-white/[0.02] transition-colors">
                        <button
                          onClick={() => setExpandedServer(isExpanded ? null : server.id)}
                          className="w-full px-5 lg:px-6 py-4 flex items-center gap-4 text-right"
                        >
                          {/* Status dot */}
                          <div className={`relative w-2.5 h-2.5 rounded-full flex-shrink-0 ${sc.dot}`}>
                            {server.status === 'critical' && <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{server.name}</span>
                              <span className="text-[10px] text-slate-600 font-mono hidden sm:inline">{server.id}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[11px] text-slate-500">{server.region}</span>
                              <span className="text-[11px] text-slate-700">•</span>
                              <span className={`text-[11px] ${sc.text}`}>{statusLabels[server.status]}</span>
                              <span className="text-[11px] text-slate-700 hidden sm:inline">•</span>
                              <span className="text-[11px] text-slate-600 hidden sm:inline">{server.uptime}</span>
                            </div>
                          </div>

                          {/* Mini metrics */}
                          <div className="hidden md:flex items-center gap-5">
                            {[
                              { label: 'CPU', val: server.cpu },
                              { label: 'RAM', val: server.memory },
                              { label: 'DISK', val: server.disk },
                            ].map((m) => (
                              <div key={m.label} className="text-center w-14">
                                <div className="relative w-10 h-10 mx-auto">
                                  <MetricRing value={m.val} size={40} strokeWidth={3} />
                                  <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-semibold ${getMetricRingColor(m.val)}`}>{m.val}</span>
                                </div>
                                <p className="text-[9px] text-slate-600 mt-0.5">{m.label}</p>
                              </div>
                            ))}
                          </div>

                          {/* Expand arrow */}
                          <svg className={`w-4 h-4 text-slate-600 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-5 lg:px-6 pb-5 pt-0">
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">المعالج</p>
                                  <p className={`text-lg font-semibold ${getMetricRingColor(server.cpu)}`}>{server.cpu}%</p>
                                  <ProgressBar value={server.cpu} height={4} />
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">الذاكرة</p>
                                  <p className={`text-lg font-semibold ${getMetricRingColor(server.memory)}`}>{server.memory}%</p>
                                  <ProgressBar value={server.memory} height={4} />
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">القرص</p>
                                  <p className={`text-lg font-semibold ${getMetricRingColor(server.disk)}`}>{server.disk}%</p>
                                  <ProgressBar value={server.disk} height={4} />
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">الطلبات/د</p>
                                  <p className="text-lg font-semibold text-white">{server.requests.toLocaleString()}</p>
                                  <div className="h-1 mt-2" />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                                <button className="text-xs text-[#f43f5e] hover:text-[#fb7185] transition-colors font-medium">إعادة تشغيل</button>
                                <span className="text-slate-700">•</span>
                                <button className="text-xs text-slate-400 hover:text-white transition-colors">السجلات</button>
                                <span className="text-slate-700">•</span>
                                <button className="text-xs text-slate-400 hover:text-white transition-colors">الإعدادات</button>
                                <span className="text-slate-700">•</span>
                                <button className="text-xs text-slate-400 hover:text-white transition-colors">SSH</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Alerts */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-base font-semibold">التنبيهات</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{alerts.filter((a) => !a.resolved).length} تنبيهات نشطة</p>
                  </div>
                  <button className="text-xs text-[#f43f5e] hover:text-[#fb7185] transition-colors font-medium">عرض الكل</button>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
                  {alerts.map((alert) => {
                    const sev = severityConfig[alert.severity];
                    return (
                      <div key={alert.id} className={`px-5 py-3.5 hover:bg-white/[0.02] transition-colors ${alert.resolved ? 'opacity-50' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg ${sev.bg} border flex items-center justify-center flex-shrink-0 mt-0.5 ${sev.color}`}>
                            {sev.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${sev.bg} ${sev.color}`}>{sev.label}</span>
                              {alert.resolved && <span className="text-[9px] text-emerald-400 font-medium">✓ تم الحل</span>}
                            </div>
                            <p className="text-sm font-medium leading-snug">{alert.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{alert.description}</p>
                            <p className="text-[10px] text-slate-600 mt-1.5">{alert.time}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ===== USERS + MODERATION ===== */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">

              {/* Users */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 lg:px-6 py-5 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-base font-semibold">المستخدمون الأخيرون</h3>
                    <p className="text-xs text-slate-500 mt-0.5">إدارة الصلاحيات والأدوار</p>
                  </div>
                  <button className="text-xs text-[#f43f5e] hover:text-[#fb7185] transition-colors font-medium">عرض الكل</button>
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {users.map((user) => {
                    const role = roleConfig[user.role];
                    return (
                      <div key={user.id} className="px-5 lg:px-6 py-3.5 hover:bg-white/[0.02] transition-colors group">
                        <div className="flex items-center gap-3">
                          {/* Avatar + Status */}
                          <div className="relative flex-shrink-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-medium ${
                              user.role === 'admin' ? 'bg-[#f43f5e]/10 text-[#f43f5e]' :
                              user.role === 'editor' ? 'bg-blue-500/10 text-blue-400' :
                              user.role === 'suspended' ? 'bg-red-500/10 text-red-400' :
                              'bg-slate-700 text-slate-300'
                            }`}>
                              {user.avatar}
                            </div>
                            <span className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-[#0f172a] ${
                              user.status === 'online' ? 'bg-emerald-400' : user.status === 'away' ? 'bg-amber-400' : 'bg-slate-600'
                            }`} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">{user.name}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${role.bg} ${role.color}`}>{role.label}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5" dir="ltr">{user.email}</p>
                          </div>

                          {/* Actions + Time */}
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className="text-[10px] text-slate-600">{user.lastActive}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-slate-500 hover:text-white transition-all">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                              </button>
                              <button className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-red-500/10 flex items-center justify-center text-slate-500 hover:text-red-400 transition-all">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Moderation Queue */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 lg:px-6 py-5 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-base font-semibold">طابور المراجعة</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{modQueue.length} عناصر بانتظار المراجعة</p>
                  </div>
                  <button className="text-xs text-[#f43f5e] hover:text-[#fb7185] transition-colors font-medium">عرض الكل</button>
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {modQueue.map((item) => {
                    const prio = priorityConfig[item.priority];
                    return (
                      <div key={item.id} className="px-5 lg:px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                        <div className="flex items-start gap-3">
                          {/* Type icon */}
                          <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 flex-shrink-0 mt-0.5">
                            {modTypeIcons[item.type]}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium truncate">{item.title}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${prio.bg} ${prio.color}`}>{prio.label}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{item.reason}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[10px] text-slate-600">بواسطة: {item.reporter}</span>
                              <span className="text-slate-700">•</span>
                              <span className="text-[10px] text-slate-600">{item.time}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all" title="قبول">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all" title="رفض">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all" title="تفاصيل">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ===== AUDIT LOGS ===== */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 lg:px-6 py-5 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-base font-semibold">سجل العمليات</h3>
                  <p className="text-xs text-slate-500 mt-0.5">تتبع جميع الإجراءات الإدارية</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                      تصدير
                    </span>
                  </button>
                  <button className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      فلتر
                    </span>
                  </button>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-12 gap-4 px-5 lg:px-6 py-3 text-[10px] text-slate-600 uppercase tracking-wider font-semibold border-b border-white/[0.04]">
                  <div className="col-span-1">النوع</div>
                  <div className="col-span-3">الإجراء</div>
                  <div className="col-span-2">المدير</div>
                  <div className="col-span-2">الهدف</div>
                  <div className="col-span-2">IP</div>
                  <div className="col-span-2">الوقت</div>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {auditLogs.map((log) => {
                    const lt = logTypeConfig[log.type];
                    return (
                      <div key={log.id} className="grid grid-cols-12 gap-4 px-5 lg:px-6 py-3.5 items-center hover:bg-white/[0.02] transition-colors">
                        <div className="col-span-1">
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-md ${lt.bg} ${lt.color}`}>{log.type === 'create' ? 'إنشاء' : log.type === 'update' ? 'تعديل' : log.type === 'delete' ? 'حذف' : log.type === 'login' ? 'دخول' : 'أمن'}</span>
                        </div>
                        <div className="col-span-3 text-sm">{log.action}</div>
                        <div className="col-span-2 text-sm text-slate-400">{log.admin}</div>
                        <div className="col-span-2 text-sm text-slate-500 font-mono">{log.target}</div>
                        <div className="col-span-2 text-xs text-slate-600 font-mono" dir="ltr">{log.ip}</div>
                        <div className="col-span-2 text-xs text-slate-600">{log.time}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-white/[0.04]">
                {auditLogs.map((log) => {
                  const lt = logTypeConfig[log.type];
                  return (
                    <div key={log.id} className="px-5 py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-md ${lt.bg} ${lt.color}`}>{log.type === 'create' ? 'إنشاء' : log.type === 'update' ? 'تعديل' : log.type === 'delete' ? 'حذف' : log.type === 'login' ? 'دخول' : 'أمن'}</span>
                        <span className="text-[10px] text-slate-600">{log.time}</span>
                      </div>
                      <p className="text-sm font-medium">{log.action}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{log.admin}</span>
                        <span className="text-slate-700">→</span>
                        <span className="font-mono">{log.target}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-mono" dir="ltr">IP: {log.ip}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ===== QUICK ACTIONS ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
              {[
                { label: 'إضافة مدير', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>, color: 'from-[#f43f5e]/10 to-[#f43f5e]/5 border-[#f43f5e]/10 hover:border-[#f43f5e]/30', textColor: 'text-[#f43f5e]' },
                { label: 'نسخ احتياطي', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>, color: 'from-blue-500/10 to-blue-500/5 border-blue-500/10 hover:border-blue-500/30', textColor: 'text-blue-400' },
                { label: 'مسح الكاش', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>, color: 'from-amber-500/10 to-amber-500/5 border-amber-500/10 hover:border-amber-500/30', textColor: 'text-amber-400' },
                { label: 'تقرير النظام', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>, color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30', textColor: 'text-emerald-400' },
              ].map((action, i) => (
                <button key={i} className={`group flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-b ${action.color} border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}>
                  <span className={`${action.textColor} group-hover:scale-110 transition-transform duration-300`}>{action.icon}</span>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">{action.label}</span>
                </button>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}