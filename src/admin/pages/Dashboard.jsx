import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarCheck2,
  FileCheck2,
  MessageSquare,
  ArrowUpRight,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { getDashboardMetrics } from '../services/adminDashboardService';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to load live metrics from Cloud Firestore.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Aggregating live Firestore operations metrics..." size="lg" className="py-24" />;
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-center space-y-3">
        <AlertCircle className="w-10 h-10 mx-auto text-rose-500" />
        <h3 className="text-base font-bold">Unable to load dashboard metrics</h3>
        <p className="text-xs text-rose-600 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => fetchMetrics(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { properties, inquiries, sellers, messages } = metrics || {};

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="admin-dashboard-hero p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wider uppercase mb-2 inline-block">
            Prime Housing Operations
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Property operations overview
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Review listings, buyer enquiries, and landowner submissions from one workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => fetchMetrics(true)}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh live metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh dashboard</span>
          </button>

          <Link
            to="/admin/properties"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Plot</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 sm:gap-5">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Published</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-slate-900">{properties?.published || 0}</div>
            <p className="text-xs text-slate-500 font-medium">Active Listings</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-slate-900">{sellers?.pending || 0}</div>
            <p className="text-xs text-slate-500 font-medium">Landowner Submissions</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Buyer Enquiries</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-slate-900">{inquiries?.total || 0}</div>
            <p className="text-xs text-slate-500 font-medium">New + Follow-up</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sold Out</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-slate-900">{properties?.soldOut || 0}</div>
            <p className="text-xs text-slate-500 font-medium">Unavailable Plots</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Messages</span>
            <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-slate-900">{messages?.total || 0}</div>
            <p className="text-xs text-slate-500 font-medium">Unread + New</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Corridor Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Corridor Distribution & Lead Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Corridor Inventory Distribution */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Inventory by Chennai Corridor</h3>
                <p className="text-xs text-slate-400">Active property listings grouped by growth belt</p>
              </div>
              <Link
                to="/admin/properties"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              {Object.keys(properties?.byCorridor || {}).length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">No corridor data available yet.</p>
              ) : (
                Object.entries(properties.byCorridor).map(([corridor, count]) => {
                  const percentage = Math.round((count / (properties.total || 1)) * 100);
                  return (
                    <div key={corridor} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">{corridor}</span>
                        <span className="text-slate-500 font-medium">{count} plots ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Action Dock */}
          <div className="p-6 rounded-3xl bg-indigo-50/60 border border-indigo-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Recommended Administrative Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/admin/inquiries"
                className="p-4 rounded-2xl bg-white border border-indigo-100/80 shadow-sm hover:border-indigo-300 transition-colors flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Review Inquiries
                  </p>
                  <p className="text-[11px] text-slate-500">{inquiries?.new || 0} waiting</p>
                </div>
              </Link>

              <Link
                to="/admin/sellers"
                className="p-4 rounded-2xl bg-white border border-indigo-100/80 shadow-sm hover:border-indigo-300 transition-colors flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Review submissions
                  </p>
                  <p className="text-[11px] text-slate-500">{sellers?.pending || 0} pending review</p>
                </div>
              </Link>

              <Link
                to="/admin/messages"
                className="p-4 rounded-2xl bg-white border border-indigo-100/80 shadow-sm hover:border-indigo-300 transition-colors flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Visitor Inbox
                  </p>
                  <p className="text-[11px] text-slate-500">{messages?.new || 0} unread</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

