import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase.js';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import AdminNotice, { useAdminNotice } from '../components/AdminNotice';
import { MapPin, Plus, Edit3, Trash2, X, TrendingUp, CheckCircle } from 'lucide-react';
import { logAdminAction } from '../services/adminLogService';

export const LOCATIONS_COLLECTION = 'locations';

const EMPTY_LOCATION = {
  name: '',
  code: '',
  avgPriceSqft: 4200,
  appreciationRate: '+14% YoY',
  description: '',
  highlights: '',
  active: true,
};

export default function Locations() {
  const { notice, showNotice, clearNotice } = useAdminNotice();
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [formData, setFormData] = useState(EMPTY_LOCATION);
  const [deletingId, setDeletingId] = useState(null);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, LOCATIONS_COLLECTION));
      const list = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setLocations(list);
    } catch (err) {
      console.error('Error fetching locations:', err);
      showNotice('error', err.message || 'Could not load location data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setFormData(EMPTY_LOCATION);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLoc(loc);
    setFormData({
      name: loc.name || '',
      code: loc.code || loc.id,
      avgPriceSqft: loc.avgPriceSqft || 4000,
      appreciationRate: loc.appreciationRate || '+12% YoY',
      description: loc.description || '',
      highlights: Array.isArray(loc.highlights) ? loc.highlights.join(', ') : (loc.highlights || ''),
      active: loc.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docId = editingLoc ? editingLoc.id : `loc-${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const docRef = doc(db, LOCATIONS_COLLECTION, docId);

      const highlightsArray = formData.highlights
        ? formData.highlights.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name.trim(),
        code: formData.code || formData.name.toUpperCase(),
        avgPriceSqft: Number(formData.avgPriceSqft) || 4000,
        appreciationRate: formData.appreciationRate || '+12% YoY',
        description: formData.description.trim(),
        highlights: highlightsArray,
        active: formData.active !== false,
        updatedAt: serverTimestamp(),
      };

      if (!editingLoc) {
        payload.createdAt = serverTimestamp();
      }

      await setDoc(docRef, payload, { merge: true });
      await logAdminAction({
        action: editingLoc ? 'LOCATION_UPDATED' : 'LOCATION_CREATED',
        target: 'locations',
        targetId: docId,
        details: { name: payload.name },
      });

      await fetchLocations();
      setIsModalOpen(false);
    } catch (err) {
      showNotice('error', `Could not save location: ${err.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(db, LOCATIONS_COLLECTION, deletingId));
      await logAdminAction({ action: 'LOCATION_DELETED', target: LOCATIONS_COLLECTION, targetId: deletingId });
      setLocations((prev) => prev.filter((l) => l.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      showNotice('error', `Could not delete location: ${err.message}`);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Corridor Name',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'avgPriceSqft',
      header: 'Average Benchmark',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900">₹{row.avgPriceSqft || 'N/A'}/sq.ft</span>
        </div>
      ),
    },
    {
      key: 'appreciationRate',
      header: 'Capital Appreciation',
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
          <TrendingUp className="w-3 h-3" />
          {row.appreciationRate || '+12% YoY'}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Highlights',
      render: (row) => (
        <p className="text-xs text-slate-500 max-w-xs truncate">
          {Array.isArray(row.highlights) ? row.highlights.join(' • ') : row.description || 'N/A'}
        </p>
      ),
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
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Edit Corridor"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Corridor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminNotice notice={notice} onClose={clearNotice} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Chennai Growth Corridors ({locations.length})
          </h2>
          <p className="text-xs text-slate-500">
            Benchmark market prices, growth metrics, and infrastructure drivers for Chennai micro-markets.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Corridor</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={locations}
        isLoading={isLoading}
        searchPlaceholder="Search corridors by name..."
        searchKeys={['name', 'id', 'description']}
      />

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingLoc ? 'Edit Corridor' : 'Add New Chennai Corridor'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Corridor Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Siruseri IT Corridor"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Avg Price/SqFt (₹)</label>
                  <input
                    type="number"
                    value={formData.avgPriceSqft}
                    onChange={(e) => setFormData({ ...formData, avgPriceSqft: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Appreciation Rate</label>
                  <input
                    type="text"
                    value={formData.appreciationRate}
                    onChange={(e) => setFormData({ ...formData, appreciationRate: e.target.value })}
                    placeholder="+14.5% YoY"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Infrastructure Highlights (Comma separated)</label>
                <input
                  type="text"
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  placeholder="SIPCOT IT Park, Metro Phase 2, PSBB Millennium"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key catalysts, upcoming transit networks..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <input type="checkbox" checked={formData.active !== false} onChange={(event) => setFormData({ ...formData, active: event.target.checked })} />
                Visible on the public website
              </label>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  Save Corridor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Corridor"
        message="Are you sure you want to delete this corridor record?"
      />
    </div>
  );
}

