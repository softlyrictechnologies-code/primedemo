import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase.js';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { BookOpen, Plus, Edit3, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { logAdminAction } from '../services/adminLogService';

export const INSIGHTS_COLLECTION = 'insights';

const EMPTY_INSIGHT = {
  title: '',
  category: 'Legal Guide',
  readTime: '4 min read',
  summary: '',
  content: '',
  published: true,
};

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsight, setEditingInsight] = useState(null);
  const [formData, setFormData] = useState(EMPTY_INSIGHT);
  const [deletingId, setDeletingId] = useState(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, INSIGHTS_COLLECTION));
      const list = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setInsights(list);
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleOpenAdd = () => {
    setEditingInsight(null);
    setFormData(EMPTY_INSIGHT);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ins) => {
    setEditingInsight(ins);
    setFormData({
      title: ins.title || '',
      category: ins.category || 'Legal Guide',
      readTime: ins.readTime || '4 min read',
      summary: ins.summary || '',
      content: ins.content || '',
      published: Boolean(ins.published),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docId = editingInsight ? editingInsight.id : `insight-${formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40)}`;
      const docRef = doc(db, INSIGHTS_COLLECTION, docId);

      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        readTime: formData.readTime,
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        published: Boolean(formData.published),
        updatedAt: serverTimestamp(),
      };

      if (!editingInsight) {
        payload.createdAt = serverTimestamp();
      }

      await setDoc(docRef, payload, { merge: true });
      await logAdminAction({
        action: editingInsight ? 'INSIGHT_UPDATED' : 'INSIGHT_CREATED',
        target: 'insights',
        targetId: docId,
        details: { title: payload.title },
      });

      await fetchInsights();
      setIsModalOpen(false);
    } catch (err) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleTogglePublish = async (ins) => {
    try {
      const docRef = doc(db, INSIGHTS_COLLECTION, ins.id);
      await updateDoc(docRef, { published: !ins.published });
      setInsights((prev) =>
        prev.map((i) => (i.id === ins.id ? { ...i, published: !i.published } : i))
      );
    } catch (err) {
      alert(`Toggle error: ${err.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(db, INSIGHTS_COLLECTION, deletingId));
      setInsights((prev) => prev.filter((i) => i.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Article Title',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="max-w-md">
            <p className="font-bold text-slate-900 truncate">{row.title}</p>
            <p className="text-[11px] text-slate-400 truncate">{row.summary || 'No summary'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
          {row.category}
        </span>
      ),
    },
    {
      key: 'readTime',
      header: 'Read Time',
      render: (row) => <span className="text-xs text-slate-500">{row.readTime}</span>,
    },
    {
      key: 'published',
      header: 'Status',
      render: (row) => <StatusBadge status={row.published ? 'published' : 'draft'} />,
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
            onClick={() => handleTogglePublish(row)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            title={row.published ? 'Unpublish' : 'Publish'}
          >
            {row.published ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Edit Article"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Article"
          >
            <Trash2 className="w-4 h-4" />
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
            Market Insights & Legal Guides ({insights.length})
          </h2>
          <p className="text-xs text-slate-500">
            Publish CMDA checklists, RERA updates, and Chennai real estate buying guides.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Article</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={insights}
        isLoading={isLoading}
        searchPlaceholder="Search articles by title or category..."
        searchKeys={['title', 'category', 'summary']}
      />

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingInsight ? 'Edit Article' : 'Publish New Guide'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 5 Critical Document Checks Before Buying a Plot in OMR"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  >
                    <option value="Legal Guide">Legal Guide</option>
                    <option value="Market Trends">Market Trends</option>
                    <option value="Corridor Spotlight">Corridor Spotlight</option>
                    <option value="RERA Advice">RERA Advice</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="4 min read"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Summary Excerpt</label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Short introductory teaser displayed on cards..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Body Content</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Complete guide text..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Publish immediately to public website</span>
                </label>
              </div>

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
                  Save Article
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
        title="Delete Article"
        message="Are you sure you want to delete this insight article?"
      />
    </div>
  );
}

