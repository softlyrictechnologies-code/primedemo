import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import BrandLogo from '../../components/BrandLogo';
import { usePublicSiteContent } from '../../services/publicSiteContent.js';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck2,
  FileCheck2,
  MessageSquare,
  MapPin,
  ExternalLink,
  LogOut,
  X,
  ShieldCheck,
  Sparkles,
  Users,
  Activity,
  BookOpen,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Properties', path: '/admin/properties', icon: Building2 },
  { name: 'Buyer Inquiries', path: '/admin/inquiries', icon: CalendarCheck2 },
  { name: 'Seller Submissions', path: '/admin/sellers', icon: FileCheck2 },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
  { name: 'Locations & Areas', path: '/admin/locations', icon: MapPin },
  { name: 'Insights & Guides', path: '/admin/insights', icon: BookOpen },
  { name: 'Audit Logs', path: '/admin/logs', icon: Activity },
  { name: 'Website Content', path: '/admin/content', icon: Sparkles },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const { currentUser, logout, adminProfile, isSuperAdmin, role } = useAdminAuth();
  const siteContent = usePublicSiteContent();
  const allowedItems = NAV_ITEMS.filter((item) => {
    if (role === 'admin') return true;
    if (role === 'editor') return ['/admin/dashboard', '/admin/properties', '/admin/locations', '/admin/insights', '/admin/content'].includes(item.path);
    if (role === 'support') return ['/admin/dashboard', '/admin/inquiries', '/admin/sellers', '/admin/messages'].includes(item.path);
    return false;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`admin-sidebar fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-lg bg-white p-1.5 shadow-sm">
              <BrandLogo className="h-8 w-auto object-contain" alt={siteContent.companyName || 'Prime Housing'} />
            </div>
            <div className="shrink-0">
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                ADMIN
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Close admin navigation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
            Management Modules
          </p>
          {allowedItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer shortcuts & Admin Profile */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/30 space-y-3">
          {/* Link back to public site */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors group border border-slate-700/50"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              View Live Website
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          {/* Admin user info & logout */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                {(currentUser?.email || 'A')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {adminProfile?.name || currentUser?.displayName || 'Administrator'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <ShieldCheck className="w-3 h-3 shrink-0" />
                  <span className="truncate">{isSuperAdmin ? 'Super Admin' : 'Verified Admin'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              type="button"
              aria-label="Sign out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

