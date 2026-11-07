import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck2,
  FileCheck2,
  MessageSquare,
  MapPin,
  TrendingUp,
  ExternalLink,
  LogOut,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Landowner Submissions', path: '/admin/sellers', icon: FileCheck2 },
  { name: 'Property Management', path: '/admin/properties', icon: Building2 },
  { name: 'Buyer Enquiries', path: '/admin/inquiries', icon: CalendarCheck2 },
  { name: 'Locations and Categories', path: '/admin/locations', icon: MapPin },
  { name: 'Website Content', path: '/admin/content', icon: MessageSquare },
  { name: 'User and Settings Management', path: '/admin/settings', icon: TrendingUp },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const { currentUser, logout, adminProfile } = useAdminAuth();

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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-base tracking-tight">Prime Housing</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400">Chennai Operations</p>
            </div>
          </div>

          <button
            onClick={onClose}
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
          {NAV_ITEMS.map((item) => {
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
                  <span className="truncate">Verified Admin</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
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

