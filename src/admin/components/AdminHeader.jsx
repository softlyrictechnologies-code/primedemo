import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, ExternalLink } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

const ROUTE_TITLES = {
  '/admin/dashboard': 'Executive Overview',
  '/admin/properties': 'Property Management',
  '/admin/inquiries': 'Buyer Enquiries',
  '/admin/sellers': 'Landowner Submissions',
  '/admin/locations': 'Locations and Categories',
  '/admin/content': 'Website Content',
  '/admin/website-content': 'Website Content',
  '/admin/settings': 'User and Settings Management',
  '/admin/messages': 'Website Content',
  '/admin/insights': 'Website Content',
};

export default function AdminHeader({ onToggleSidebar }) {
  const location = useLocation();
  const { currentUser } = useAdminAuth();

  const currentTitle = ROUTE_TITLES[location.pathname] || 'Admin Portal';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
      {/* Left side: Hamburger on mobile + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            {currentTitle}
          </h1>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Prime Housing Control Center • <span className="font-semibold text-slate-600">prime-housing</span>
          </p>
        </div>
      </div>

      {/* Right side: Environment badges & live site link */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Firebase Live Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] font-bold text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Firestore Live</span>
        </div>

        {/* Live Site Shortcut */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          title="Switch to Public Home"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Public Site</span>
        </Link>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-xs shadow-sm">
            {(currentUser?.email || 'A')[0].toUpperCase()}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
              {currentUser?.email}
            </p>
            <p className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider">
              Super Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

