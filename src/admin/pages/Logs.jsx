import React, { useState, useEffect } from 'react';
import { getAdminLogs } from '../services/adminLogService';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { ShieldAlert, RefreshCw, Filter, Clock, UserCheck, Terminal, Info, ChevronRight, Activity } from 'lucide-react';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterAction, setFilterAction] = useState('ALL');

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminLogs(100);
      setLogs(data);
    } catch (err) {
      console.error('[Logs] Error loading audit logs:', err);
      setError(`Failed to retrieve audit trail: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionTypes = ['ALL', ...Array.from(new Set(logs.map((l) => l.action).filter(Boolean)))];

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'ALL') return true;
    return log.action === filterAction;
  });

  const formatTimestamp = (ts) => {
    if (!ts) return '—';
    try {
      if (ts.seconds) {
        return new Date(ts.seconds * 1000).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
      }
      if (ts instanceof Date) {
        return ts.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
      }
      return String(ts);
    } catch {
      return '—';
    }
  };

  const getActionColor = (action) => {
    const act = String(action || '').toUpperCase();
    if (act.includes('DELETE') || act.includes('REJECT')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (act.includes('CREATE') || act.includes('APPROVE') || act.includes('PUBLISH')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (act.includes('UPDATE') || act.includes('EDIT')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (act.includes('LOGIN') || act.includes('AUTH')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const columns = [
    {
      header: 'Action',
      accessor: 'action',
      sortable: true,
      render: (val) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getActionColor(
            val
          )}`}
        >
          {val || 'UNKNOWN'}
        </span>
      ),
    },
    {
      header: 'Target Module',
      accessor: 'target',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-800">{val || 'general'}</span>
          {row.targetId && (
            <span className="block font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
              ID: {row.targetId}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Admin Actor',
      accessor: 'adminEmail',
      sortable: true,
      render: (val) => (
        <span className="font-medium text-xs text-slate-700">{val || 'system'}</span>
      ),
    },
    {
      header: 'Details & Changes',
      accessor: 'details',
      render: (val) => {
        if (!val) return <span className="text-slate-400 text-xs">—</span>;
        const jsonStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return (
          <span className="font-mono text-[11px] text-slate-600 truncate block max-w-xs" title={jsonStr}>
            {jsonStr}
          </span>
        );
      },
    },
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">{formatTimestamp(val)}</span>
      ),
    },
    {
      header: 'Inspect',
      accessor: 'id',
      className: 'text-right',
      render: (val, row) => (
        <button
          onClick={() => setSelectedLog(row)}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          title="Inspect Payload"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-indigo-600" />
            <span>Audit Trail & Activity Logs</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable administrative action logs recorded in Google Cloud Firestore
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Audit Logs</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{logs.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">Action Types</p>
          <p className="text-2xl font-black text-indigo-950 mt-1">{actionTypes.length - 1}</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Storage Collection</p>
          <p className="text-sm font-mono font-bold text-emerald-950 mt-2">/adminLogs</p>
        </div>
        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600">Integrity</p>
          <p className="text-sm font-bold text-purple-950 mt-2">Write-Once Verified</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Action Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {actionTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterAction(type)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap ${
              filterAction === type
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm p-6">
        <DataTable
          columns={columns}
          data={filteredLogs}
          isLoading={isLoading}
          searchPlaceholder="Search logs by action, admin, target, or details..."
          searchKeys={['action', 'target', 'adminEmail', 'targetId']}
          emptyMessage="No audit logs recorded matching criteria."
          defaultSortKey="createdAt"
          defaultSortDirection="desc"
        />
      </div>

      {/* Log Payload Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-base">Audit Event Details</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Action</span>
                  <p className="font-black text-slate-900">{selectedLog.action}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Actor</span>
                  <p className="font-bold text-slate-800">{selectedLog.adminEmail}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Target</span>
                  <p className="font-mono text-slate-800">{selectedLog.target} {selectedLog.targetId ? `(${selectedLog.targetId})` : ''}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Timestamp</span>
                  <p className="text-slate-700">{formatTimestamp(selectedLog.createdAt)}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Full Payload Data</span>
                <pre className="p-3 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

