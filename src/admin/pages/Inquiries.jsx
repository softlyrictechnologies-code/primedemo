import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck2, 
  Phone, 
  Mail, 
  Car, 
  Clock, 
  CheckCircle, 
  Trash2, 
  MessageSquare, 
  Eye, 
  AlertCircle,
  X,
  Loader2,
  Calendar
} from 'lucide-react';
import { getAllInquiries, updateInquiryStatus, deleteInquiry } from '../services/adminInquiryService';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal / Detail state
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [newStatus, setNewStatus] = useState('new');
  const [internalNote, setInternalNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete state
  const [deletingInquiry, setDeletingInquiry] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const data = await getAllInquiries();
      setInquiries(data);
    } catch (err) {
      console.error('Error fetching admin inquiries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleOpenDetailModal = (inq) => {
    setSelectedInquiry(inq);
    setNewStatus(inq.status || 'new');
    setInternalNote('');
  };

  const handleSaveStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    setIsUpdating(true);

    try {
      await updateInquiryStatus(selectedInquiry.id, newStatus, internalNote);
      await fetchInquiries();
      setSelectedInquiry(null);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingInquiry) return;
    setIsDeleting(true);
    try {
      await deleteInquiry(deletingInquiry.id, deletingInquiry.customerName);
      setInquiries((prev) => prev.filter((i) => i.id !== deletingInquiry.id));
      setDeletingInquiry(null);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter inquiries
  const displayedInquiries = inquiries.filter((inq) => {
    if (statusFilter === 'all') return true;
    return inq.status === statusFilter;
  });

  const columns = [
    {
      key: 'customerName',
      header: 'Customer Details',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.customerName}</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[11px] text-slate-500 mt-0.5">
            <span className="flex items-center gap-1 text-slate-600 font-semibold">
              <Phone className="w-3 h-3 text-slate-400" />
              {row.customerPhone}
            </span>
            {row.customerEmail && (
              <span className="flex items-center gap-1 text-slate-400">
                <Mail className="w-3 h-3" />
                {row.customerEmail}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'propertyTitle',
      header: 'Requested Plot',
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-semibold text-slate-800 truncate">
            {row.propertyTitle || 'General Site Visit'}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">
            ID: {row.propertyId || 'N/A'}
          </p>
        </div>
      ),
    },
    {
      key: 'preferredDate',
      header: 'Visit Schedule',
      render: (row) => (
        <div className="text-xs">
          <p className="font-bold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {row.preferredDate || 'Tomorrow'} • {row.preferredTime || '10:00 AM'}
          </p>
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 mt-0.5 font-medium">
            <Car className="w-3 h-3 text-emerald-600" />
            {row.transport === 'shuttle' ? 'Free AC Shuttle Pickup' : 'Self-Driven'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Workflow Status',
      render: (row) => <StatusBadge status={row.status || 'new'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenDetailModal(row)}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Manage</span>
          </button>

          <button
            onClick={() => setDeletingInquiry(row)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
            title="Delete Inquiry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Customer Site-Visit Requests ({inquiries.length})
          </h2>
          <p className="text-xs text-slate-500">
            Follow up with prospective buyers, confirm visit schedules, and manage shuttle pickups.
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={displayedInquiries}
        isLoading={isLoading}
        searchPlaceholder="Search by customer name, phone, email, or property title..."
        searchKeys={['customerName', 'customerPhone', 'customerEmail', 'propertyTitle', 'propertyId']}
        filterComponent={
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {['all', 'new', 'contacted', 'scheduled', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        }
      />

      {/* Inquiry Detail & Status Update Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Inquiry Management</h3>
                  <p className="text-[11px] text-slate-400">Lead ID: {selectedInquiry.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatusUpdate} className="p-6 space-y-4 text-xs">
              {/* Customer summary box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {selectedInquiry.customerName}
                  </span>
                  <StatusBadge status={selectedInquiry.status || 'new'} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone Number</span>
                    <a href={`tel:${selectedInquiry.customerPhone}`} className="font-bold text-indigo-600 hover:underline">
                      {selectedInquiry.customerPhone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Address</span>
                    <span className="font-semibold">{selectedInquiry.customerEmail || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Preferred Timing</span>
                    <span className="font-semibold">{selectedInquiry.preferredDate} @ {selectedInquiry.preferredTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Transport Mode</span>
                    <span className="font-semibold capitalize">{selectedInquiry.transport || 'self'}</span>
                  </div>
                </div>

                {selectedInquiry.message && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Visitor Message</span>
                    <p className="text-slate-700 italic mt-0.5">"{selectedInquiry.message}"</p>
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Update Lead Stage *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:bg-white"
                >
                  <option value="new">NEW (Uncontacted)</option>
                  <option value="contacted">CONTACTED (Follow-up Call Completed)</option>
                  <option value="scheduled">SCHEDULED (Site Visit Booked)</option>
                  <option value="completed">COMPLETED (Site Visit Attended)</option>
                  <option value="cancelled">CANCELLED (Not Interested / Postponed)</option>
                </select>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Append Internal Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="e.g. Customer requested Sunday morning slot with family pickup from Thoraipakkam."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
                />
              </div>

              {/* Existing Notes history */}
              {Array.isArray(selectedInquiry.notes) && selectedInquiry.notes.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="font-bold text-slate-700 block">Note History:</span>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    {selectedInquiry.notes.map((n, idx) => (
                      <div key={idx} className="text-[11px] p-2 rounded-lg bg-white border border-slate-100">
                        <p className="text-slate-800">{n.text}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Added by {n.addedBy} on {new Date(n.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingInquiry)}
        onClose={() => setDeletingInquiry(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer Lead"
        message={`Are you sure you want to delete inquiry for "${deletingInquiry?.customerName}"?`}
        confirmLabel="Delete Lead"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

