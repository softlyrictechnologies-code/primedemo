import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldAlert, ArrowLeft, LogOut, Loader2 } from 'lucide-react';

export default function RequireAdmin({ children }) {
  const { currentUser, isAuthorized, role, loading, logout, diagnostics } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-auth-state min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-2">Verifying Administrative Privileges</h2>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          Cryptographically verifying the Firebase custom claim and session authenticity...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    return (
      <div className="admin-auth-state min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white selection:bg-red-500">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl shadow-red-950/40 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white mb-2">Access Denied</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              You are signed in as <span className="font-semibold text-slate-200">{currentUser.email}</span>, but your account lacks the Firebase admin claim (<code className="text-red-400">admin: true</code>).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-left text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-slate-200">Security Diagnostics</p>
            <ul className="space-y-1 text-[11px] text-slate-300">
              <li><span className="text-slate-400">UID:</span> {diagnostics?.uid || 'Unavailable'}</li>
              <li><span className="text-slate-400">Email:</span> {diagnostics?.email || 'Unavailable'}</li>
              <li><span className="text-slate-400">Project:</span> {diagnostics?.projectId || 'Unknown'}</li>
              <li><span className="text-slate-400">Admin claim present:</span> {diagnostics?.hasAdminClaim ? 'Yes' : 'No'}</li>
              <li><span className="text-slate-400">Admin claim value:</span> {diagnostics?.adminClaimValue === null ? 'Not set' : String(diagnostics.adminClaimValue)}</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={logout}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              Sign Out
            </button>
            <Link
              to="/"
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Public Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pathname = location.pathname;
  const routeRoles = {
    '/admin/dashboard': ['admin', 'editor', 'support'],
    '/admin/properties': ['admin', 'editor'],
    '/admin/locations': ['admin', 'editor'],
    '/admin/insights': ['admin', 'editor'],
    '/admin/content': ['admin', 'editor'],
    '/admin/website-content': ['admin', 'editor'],
    '/admin/inquiries': ['admin', 'support'],
    '/admin/sellers': ['admin', 'support'],
    '/admin/messages': ['admin', 'support'],
    '/admin/users': ['admin'],
    '/admin/logs': ['admin'],
  };
  const allowedRoles = routeRoles[pathname] || ['admin'];
  if (!allowedRoles.includes(role) && role !== 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

