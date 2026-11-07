import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  UploadCloud, 
  ShieldCheck, 
  X, 
  Loader2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  getAllSubmissions, 
  approveAndPublishSubmission, 
  rejectSubmission, 
  requestRevision 
} from '../services/adminSellerService';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Sellers() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Review modal state
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reject dialog state
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('Document verification failed or title not clear.');

  // Revision dialog state
  const [revisingId, setRevisingId] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState('Please provide updated survey sketch and patta documents.');

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await getAllSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching seller submissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApproveAndPublish = async (sub) => {
    setIsProcessing(true);
    try {
      await approveAndPublishSubmission(sub);
      await fetchSubmissions();
      setReviewingSubmission(null);
      alert(`Success! "${sub.title}" is now verified and published to the live public listings.`);
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    setIsProcessing(true);
    try {
      await rejectSubmission(rejectingId, rejectReason);
      await fetchSubmissions();
      setRejectingId(null);
      if (reviewingSubmission?.id === rejectingId) setReviewingSubmission(null);
    } catch (err) {
      alert(`Reject error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRevision = async () => {
    if (!revisingId) return;
    setIsProcessing(true);
    try {
      await requestRevision(revisingId, revisionNotes);
      await fetchSubmissions();
      setRevisingId(null);
      if (reviewingSubmission?.id === revisingId) setReviewingSubmission(null);
    } catch (err) {
      alert(`Revision request error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayedSubmissions = submissions.filter((sub) => {
    if (statusFilter === 'all') return true;
    return sub.status === statusFilter;
  });

  const columns = [
    {
      key: 'title',
      header: 'Plot Proposal',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={
              Array.isArray(row.images) && row.images[0]
                ? row.images[0]
                : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80'
            }
            alt=""
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div className="max-w-xs sm:max-w-sm">
            <p className="font-bold text-slate-900 truncate">{row.title}</p>
            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              {row.location}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'sellerName',
      header: 'Landowner / Seller',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.sellerName || 'Landowner'}</p>
          {row.sellerPhone && (
            <p className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
              <Phone className="w-3 h-3 text-slate-400" />
              {row.sellerPhone}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'expectedPrice',
      header: 'Specs & Price',
      render: (row) => {
        const priceLakhs = row.expectedPrice ? (row.expectedPrice / 100000).toFixed(2) : (row.priceLakhs || 0);
        return (
          <div>
            <p className="font-extrabold text-slate-900">₹{priceLakhs} Lakhs</p>
            <p className="text-[10px] text-slate-400">{row.areaSqFt} sq.ft</p>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Verification Status',
      render: (row) => <StatusBadge status={row.status || 'pending'} />,
    },
    {
      key: 'actions',
      header: 'Review Actions',
      sortable: false,
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setReviewingSubmission(row)}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Audit & Review</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Seller & Landowner Proposals ({submissions.length})
          </h2>
          <p className="text-xs text-slate-500">
            Review submitted plot documents, verify CMDA clearances, and approve listings for public view.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={displayedSubmissions}
        isLoading={isLoading}
        searchPlaceholder="Search by title, location, or landowner..."
        searchKeys={['title', 'location', 'sellerName', 'sellerPhone']}
        filterComponent={
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {['all', 'pending', 'approved', 'rejected', 'needs_revision'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.replace(/_/g, ' ').toUpperCase()}
              </button>
            ))}
          </div>
        }
      />

      {/* Review Submission Drawer / Modal */}
      {reviewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Land Title & Document Audit</h3>
                  <p className="text-[11px] text-slate-400">Proposal ID: {reviewingSubmission.id}</p>
                </div>
              </div>
              <button
                onClick={() => setReviewingSubmission(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Proposal Header */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{reviewingSubmission.title}</h4>
                    <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {reviewingSubmission.location}
                    </p>
                  </div>
                  <StatusBadge status={reviewingSubmission.status || 'pending'} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Expected Price</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ₹{reviewingSubmission.expectedPrice ? (reviewingSubmission.expectedPrice / 100000).toFixed(2) : 0} L
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Area</span>
                    <span className="font-bold text-slate-800">{reviewingSubmission.areaSqFt} Sq.Ft</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Facing</span>
                    <span className="font-bold text-slate-800">{reviewingSubmission.facing || 'East'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Dimensions</span>
                    <span className="font-bold text-slate-800">{reviewingSubmission.dimensions || '30x40'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Landowner</span>
                    <span className="font-bold">{reviewingSubmission.sellerName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact</span>
                    <span className="font-bold text-indigo-600">{reviewingSubmission.sellerPhone || 'N/A'}</span>
                  </div>
                </div>

                {reviewingSubmission.description && (
                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-slate-400 block text-[10px]">Seller Notes</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{reviewingSubmission.description}</p>
                  </div>
                )}
              </div>

              {/* Photos Gallery */}
              {Array.isArray(reviewingSubmission.images) && reviewingSubmission.images.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">Submitted Site Photos:</span>
                  <div className="grid grid-cols-3 gap-3">
                    {reviewingSubmission.images.map((imgUrl, idx) => (
                      <a
                        key={idx}
                        href={imgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-2xl overflow-hidden border border-slate-200 group relative aspect-video"
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Legal verification status notice */}
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-bold">Legal Approval & Publishing Process:</p>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    Clicking "Approve & Publish" creates an authentic listing in the public <code className="font-bold">properties</code> collection, marks the submission as approved, and logs the action in the audit trail.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setReviewingSubmission(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => setRevisingId(reviewingSubmission.id)}
                  className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold transition-colors cursor-pointer"
                >
                  Request Revisions
                </button>

                <button
                  type="button"
                  onClick={() => setRejectingId(reviewingSubmission.id)}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold transition-colors cursor-pointer"
                >
                  Reject
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleApproveAndPublish(reviewingSubmission)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Approve & Publish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reject Seller Proposal</h3>
            <p className="text-xs text-slate-500">
              Provide a clear reason for the landowner explaining why this property cannot be listed.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Request Modal */}
      {revisingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Request Document Revision</h3>
            <p className="text-xs text-slate-500">
              Specify what additional records (e.g. EC, patta, survey sketch) the landowner must upload.
            </p>
            <textarea
              rows={3}
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRevisingId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={handleConfirmRevision}
                className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700"
              >
                Send Revision Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

