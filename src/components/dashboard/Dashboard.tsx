'use client';

import React, { useState } from 'react';

// ==================== DATA ====================
const navItems = [
  { id: 'overview', label: 'نظرة عامة', icon: 'grid' },
  { id: 'analytics', label: 'التحليلات', icon: 'chart' },
  { id: 'orders', label: 'الطلبات', icon: 'bag', badge: 12 },
  { id: 'products', label: 'المنتجات', icon: 'box' },
  { id: 'customers', label: 'العملاء', icon: 'users' },
  { id: 'messages', label: 'الرسائل', icon: 'mail', badge: 3 },
  { id: 'settings', label: 'الإعدادات', icon: 'gear' },
];

const stats = [
  { label: 'إجمالي الإيرادات', value: '٤٨,٢٥٠ ر.س', change: '+12.5%', up: true, icon: 'currency' },
  { label: 'الطلبات الجديدة', value: '١,٢٤٨', change: '+8.2%', up: true, icon: 'bag' },
  { label: 'العملاء النشطين', value: '٣,٦٧٢', change: '+4.1%', up: true, icon: 'users' },
  { label: 'معدل التحويل', value: '3.24%', change: '-0.4%', up: false, icon: 'target' },
];

const recentOrders = [
  { id: '#NB-4821', customer: 'سارة الأحمد', product: 'باقة البريميوم', amount: '٤٩٩ ر.س', status: 'completed', date: 'منذ 5 دقائق' },
  { id: '#NB-4820', customer: 'محمد الخالدي', product: 'اشتراك شهري', amount: '٩٩ ر.س', status: 'processing', date: 'منذ 23 دقيقة' },
  { id: '#NB-4819', customer: 'نورة العتيبي', product: 'باقة الأساسية', amount: '١٩٩ ر.س', status: 'completed', date: 'منذ ساعة' },
  { id: '#NB-4818', customer: 'خالد الشمري', product: 'باقة البريميوم', amount: '٤٩٩ ر.س', status: 'pending', date: 'منذ ساعتين' },
  { id: '#NB-4817', customer: 'فاطمة القحطاني', product: 'اشتراك سنوي', amount: '٩٩٩ ر.س', status: 'completed', date: 'منذ 3 ساعات' },
  { id: '#NB-4816', customer: 'عبدالله المالكي', product: 'باقة الأساسية', amount: '١٩٩ ر.س', status: 'cancelled', date: 'منذ 5 ساعات' },
];

const topProducts = [
  { name: 'باقة البريميوم', sales: 342, revenue: '١٧٠,٥٥٨ ر.س', progress: 85 },
  { name: 'اشتراك سنوي', sales: 128, revenue: '١٢٧,٨٧٢ ر.س', progress: 64 },
  { name: 'باقة الأساسية', sales: 256, revenue: '٥٠,٩٤٤ ر.س', progress: 51 },
  { name: 'اشتراك شهري', sales: 189, revenue: '١٨,٧١١ ر.س', progress: 38 },
];

const activities = [
  { type: 'order', text: 'طلب جديد من سارة الأحمد', time: 'منذ 5 دقائق', color: '#f43f5e' },
  { type: 'user', text: 'عميل جديد سجّل: محمد الخالدي', time: 'منذ 23 دقيقة', color: '#0ea5e9' },
  { type: 'alert', text: 'تم تحديث أسعار الباقة الأساسية', time: 'منذ ساعة', color: '#eab308' },
  { type: 'success', text: 'تم استلام دفعة بقيمة ٩٩٩ ر.س', time: 'منذ 3 ساعات', color: '#22c55e' },
  { type: 'order', text: 'طلب جديد من فاطمة القحطاني', time: 'منذ 3 ساعات', color: '#f43f5e' },
];

const notifications = [
  { id: 1, title: 'طلب جديد', desc: 'سارة الأحمد - باقة البريميوم', time: '5 د', unread: true },
  { id: 2, title: 'تسجيل عميل جديد', desc: 'محمد الخالدي أنشأ حساباً', time: '23 د', unread: true },
  { id: 3, title: 'تحديث النظام', desc: 'تم تحديث النظام للإصدار 2.4', time: '1 س', unread: false },
  { id: 4, title: 'تنبيه الدفع', desc: 'دفعة بانتظار التأكيد - ٤٩٩ ر.س', time: '2 س', unread: false },
];

// ==================== ICONS ====================
const icons: Record<string, React.ReactNode> = {
  grid: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  chart: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  bag: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
  box: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
  users: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  mail: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
  gear: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  currency: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  target: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'مكتمل', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  processing: { label: 'قيد المعالجة', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  pending: { label: 'معلّق', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  cancelled: { label: 'ملغي', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

// ==================== CHART BARS DATA ====================
const chartData = [
  { month: 'يناير', value: 65 },
  { month: 'فبراير', value: 45 },
  { month: 'مارس', value: 78 },
  { month: 'أبريل', value: 52 },
  { month: 'مايو', value: 90 },
  { month: 'يونيو', value: 85 },
  { month: 'يوليو', value: 70 },
  { month: 'أغسطس', value: 95 },
  { month: 'سبتمبر', value: 60 },
  { month: 'أكتوبر', value: 80 },
  { month: 'نوفمبر', value: 72 },
  { month: 'ديسمبر', value: 88 },
];

const miniChartData = [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 90];

// ==================== MAIN COMPONENT ====================
export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex" dir="rtl">

      {/* ===== SIDEBAR OVERLAY (Mobile) ===== */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`fixed top-0 right-0 bottom-0 w-72 bg-[#0c1322] border-l border-white/[0.06] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f43f5e] to-[#e11d48] flex items-center justify-center shadow-lg shadow-[#f43f5e]/20">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight">NIBLAN</span>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase">لوحة التحكم</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden mr-auto text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold px-3 mb-3 mt-2">القائمة الرئيسية</p>
          {navItems.slice(0, 6).map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                activeNav === item.id
                  ? 'bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span className={activeNav === item.id ? 'text-[#f43f5e]' : 'text-slate-500 group-hover:text-slate-300 transition-colors'}>
                {icons[item.icon]}
              </span>
              <span className="flex-1 text-right">{item.label}</span>
              {item.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeNav === item.id ? 'bg-[#f43f5e]/20 text-[#f43f5e]' : 'bg-white/[0.06] text-slate-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="pt-4 pb-2">
            <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold px-3 mb-3">النظام</p>
          </div>
          {navItems.slice(6).map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                activeNav === item.id
                  ? 'bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <span className={activeNav === item.id ? 'text-[#f43f5e]' : 'text-slate-500 group-hover:text-slate-300 transition-colors'}>
                {icons[item.icon]}
              </span>
              <span className="flex-1 text-right">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f43f5e]/30 to-[#e11d48]/20 flex items-center justify-center text-sm font-semibold text-[#f43f5e]">
              أ.م
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">أحمد محمد</p>
              <p className="text-[11px] text-slate-500 truncate">admin@niblan.com</p>
            </div>
            <svg className="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* ===== TOP BAR ===== */}
        <header className="sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            {/* Right: Menu + Title */}
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">نظرة عامة</h1>
                <p className="text-xs text-slate-500 hidden sm:block">مرحباً بك أحمد، إليك ملخص اليوم</p>
              </div>
            </div>

            {/* Left: Search + Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 w-64 focus-within:border-[#f43f5e]/40 focus-within:shadow-[0_0_0_3px_rgba(244,63,94,0.08)] transition-all duration-300">
                <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                <input
                  type="text"
                  placeholder="بحث..."
                  className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 w-full"
                />
                <kbd className="hidden lg:inline text-[10px] text-slate-600 bg-white/[0.06] border border-white/[0.08] rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                  <span className="absolute -top-1 -left-1 w-5 h-5 bg-[#f43f5e] rounded-full text-[10px] font-bold flex items-center justify-center shadow-lg shadow-[#f43f5e]/30">2</span>
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute left-0 top-full mt-2 w-80 bg-[#1a2235] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                        <span className="text-sm font-semibold">الإشعارات</span>
                        <span className="text-[10px] bg-[#f43f5e]/10 text-[#f43f5e] px-2 py-0.5 rounded-full font-medium">2 جديد</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n.id} className={`px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer ${n.unread ? 'bg-white/[0.02]' : ''}`}>
                            <div className="flex items-start gap-3">
                              {n.unread && <span className="w-2 h-2 rounded-full bg-[#f43f5e] mt-1.5 flex-shrink-0" />}
                              {!n.unread && <span className="w-2 mt-1.5 flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{n.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                              </div>
                              <span className="text-[10px] text-slate-600 flex-shrink-0">{n.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-3 border-t border-white/[0.06]">
                        <button className="w-full text-center text-xs text-[#f43f5e] hover:text-[#fb7185] transition-colors font-medium">عرض جميع الإشعارات</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Avatar */}
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-[#f43f5e]/30 to-[#e11d48]/20 items-center justify-center text-sm font-semibold text-[#f43f5e] cursor-pointer hover:from-[#f43f5e]/40 hover:to-[#e11d48]/30 transition-all duration-200">
                أ.م
              </div>
            </div>
          </div>
        </header>

        {/* ===== PAGE CONTENT ===== */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">

            {/* ===== STATS CARDS ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
              {stats.map((stat, i) => (
                <div key={i} className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 overflow-hidden">
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#f43f5e]/5 rounded-full blur-[60px]" />
                  </div>

                  <div className="relative flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      i === 0 ? 'bg-[#f43f5e]/10 text-[#f43f5e]' :
                      i === 1 ? 'bg-blue-500/10 text-blue-400' :
                      i === 2 ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {icons[stat.icon]}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                      stat.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      <svg className={`w-3 h-3 ${!stat.up ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                      {stat.change}
                    </div>
                  </div>

                  <div className="relative">
                    <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                  </div>

                  {/* Mini Sparkline */}
                  <div className="relative mt-4 flex items-end gap-[3px] h-8">
                    {miniChartData.map((val, j) => (
                      <div
                        key={j}
                        className="flex-1 rounded-sm transition-all duration-500"
                        style={{
                          height: `${val}%`,
                          background: j === miniChartData.length - 1
                            ? (stat.up ? '#22c55e' : '#ef4444')
                            : 'rgba(255,255,255,0.06)',
                          opacity: j >= miniChartData.length - 3 ? 1 : 0.6,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ===== CHART + TOP PRODUCTS ===== */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-5">

              {/* Revenue Chart */}
              <div className="xl:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-semibold">الإيرادات الشهرية</h3>
                    <p className="text-xs text-slate-500 mt-0.5">مقارنة الشهور الحالية</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {['شهري', 'أسبوعي', 'يومي'].map((period, i) => (
                      <button key={period} className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-200 ${
                        i === 0
                          ? 'bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                      }`}>
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart */}
                <div className="relative">
                  {/* Y-axis labels */}
                  <div className="absolute right-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-slate-600 font-mono pr-1">
                    <span>100K</span>
                    <span>75K</span>
                    <span>50K</span>
                    <span>25K</span>
                    <span>0</span>
                  </div>

                  {/* Bars */}
                  <div className="mr-10">
                    {/* Grid lines */}
                    <div className="relative h-52">
                      {[0, 1, 2, 3, 4].map((line) => (
                        <div key={line} className="absolute w-full border-t border-white/[0.04]" style={{ bottom: `${line * 25}%` }} />
                      ))}

                      {/* Bars container */}
                      <div className="absolute inset-0 flex items-end gap-2 lg:gap-3 px-1">
                        {chartData.map((bar, i) => (
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center gap-1 relative group/bar"
                            onMouseEnter={() => setHoveredBar(i)}
                            onMouseLeave={() => setHoveredBar(null)}
                          >
                            {/* Tooltip */}
                            {hoveredBar === i && (
                              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1a2235] border border-white/[0.1] rounded-lg px-3 py-1.5 shadow-xl whitespace-nowrap z-10">
                                <p className="text-[10px] text-slate-500">{bar.month}</p>
                                <p className="text-xs font-semibold text-white">{(bar.value * 520).toLocaleString('ar-SA')} ر.س</p>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a2235] border-r border-b border-white/[0.1] rotate-45" />
                              </div>
                            )}
                            <div
                              className="w-full rounded-t-md transition-all duration-300 cursor-pointer"
                              style={{
                                height: `${bar.value}%`,
                                background: hoveredBar === i
                                  ? 'linear-gradient(to top, #f43f5e, #fb7185)'
                                  : 'linear-gradient(to top, rgba(244,63,94,0.3), rgba(244,63,94,0.15))',
                                boxShadow: hoveredBar === i ? '0 0 20px rgba(244,63,94,0.3)' : 'none',
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* X-axis labels */}
                    <div className="flex gap-2 lg:gap-3 px-1 mt-2">
                      {chartData.map((bar, i) => (
                        <span key={i} className="flex-1 text-[9px] text-slate-600 text-center truncate">
                          {i % 2 === 0 ? bar.month : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold">أفضل المنتجات</h3>
                  <button className="text-xs text-[#f43f5e] hover:text-[#fb7185] transition-colors font-medium">عرض الكل</button>
                </div>

                <div className="space-y-5">
                  {topProducts.map((product, i) => (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-600 font-mono w-5">{String(i + 1).padStart(2, '0')}</span>
                          <span className="text-sm font-medium group-hover:text-[#f43f5e] transition-colors">{product.name}</span>
                        </div>
                        <span className="text-xs text-slate-500">{product.sales} مبيعة</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-l from-[#f43f5e] to-[#e11d48] transition-all duration-700 ease-out"
                            style={{ width: `${product.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono w-20 text-left">{product.revenue}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-lg font-semibold">915</p>
                    <p className="text-[11px] text-slate-500">إجمالي المبيعات</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">٤</p>
                    <p className="text-[11px] text-slate-500">منتجات نشطة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== ORDERS TABLE + ACTIVITY ===== */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-5">

              {/* Recent Orders */}
              <div className="xl:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 lg:px-6 py-5 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-base font-semibold">أحدث الطلبات</h3>
                    <p className="text-xs text-slate-500 mt-0.5">آخر الطلبات المستلمة</p>
                  </div>
                  <button className="text-xs text-[#f43f5e] hover:text-[#fb7185] transition-colors font-medium">عرض الكل</button>
                </div>

                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 lg:px-6 py-3 text-[10px] text-slate-600 uppercase tracking-wider font-semibold border-b border-white/[0.04]">
                  <div className="col-span-2">رقم الطلب</div>
                  <div className="col-span-3">العميل</div>
                  <div className="col-span-3">المنتج</div>
                  <div className="col-span-2">المبلغ</div>
                  <div className="col-span-1">الحالة</div>
                  <div className="col-span-1">الوقت</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-white/[0.04]">
                  {recentOrders.map((order) => {
                    const status = statusConfig[order.status];
                    return (
                      <div key={order.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                        {/* Desktop Row */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-5 lg:px-6 py-4 items-center">
                          <div className="col-span-2 text-sm font-mono text-slate-400">{order.id}</div>
                          <div className="col-span-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-[10px] font-medium text-slate-300 flex-shrink-0">
                                {order.customer.split(' ')[0].charAt(0)}{order.customer.split(' ')[1]?.charAt(0)}
                              </div>
                              <span className="text-sm truncate">{order.customer}</span>
                            </div>
                          </div>
                          <div className="col-span-3 text-sm text-slate-400 truncate">{order.product}</div>
                          <div className="col-span-2 text-sm font-medium">{order.amount}</div>
                          <div className="col-span-1">
                            <span className={`text-[10px] font-medium px-2 py-1 rounded-md border ${status.bg} ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="col-span-1 text-[11px] text-slate-600">{order.date}</div>
                        </div>

                        {/* Mobile Row */}
                        <div className="md:hidden px-5 py-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono text-slate-400">{order.id}</span>
                            <span className={`text-[10px] font-medium px-2 py-1 rounded-md border ${status.bg} ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-[10px] font-medium text-slate-300">
                                {order.customer.split(' ')[0].charAt(0)}{order.customer.split(' ')[1]?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm">{order.customer}</p>
                                <p className="text-xs text-slate-500">{order.product}</p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium">{order.amount}</p>
                              <p className="text-[11px] text-slate-600">{order.date}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold">آخر النشاطات</h3>
                  <button className="text-xs text-[#f43f5e] hover:text-[#fb7185] transition-colors font-medium">عرض الكل</button>
                </div>

                <div className="space-y-0">
                  {activities.map((activity, i) => (
                    <div key={i} className="relative flex gap-4 pb-6 last:pb-0 group">
                      {/* Timeline line */}
                      {i < activities.length - 1 && (
                        <div className="absolute right-[7px] top-5 bottom-0 w-px bg-white/[0.06]" />
                      )}

                      {/* Dot */}
                      <div
                        className="relative z-10 w-[15px] h-[15px] rounded-full border-2 flex-shrink-0 mt-0.5 transition-all duration-300 group-hover:scale-125"
                        style={{
                          borderColor: activity.color,
                          background: `${activity.color}20`,
                        }}
                      >
                        <div className="absolute inset-[3px] rounded-full" style={{ background: activity.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-[-2px]">
                        <p className="text-sm leading-relaxed">{activity.text}</p>
                        <p className="text-[11px] text-slate-600 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-2.5">
                  <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold mb-3">إجراءات سريعة</p>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 text-sm text-slate-400 hover:text-white group">
                    <svg className="w-4 h-4 text-[#f43f5e]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    إضافة طلب جديد
                    <svg className="w-3 h-3 mr-auto text-slate-600 group-hover:text-slate-400 group-hover:-translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 text-sm text-slate-400 hover:text-white group">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                    تصدير التقرير
                    <svg className="w-3 h-3 mr-auto text-slate-600 group-hover:text-slate-400 group-hover:-translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}