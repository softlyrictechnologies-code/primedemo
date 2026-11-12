import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { CONTACT_MESSAGES_COLLECTION } from '../../services/contactService.js';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { MessageSquare, Mail, Phone, Calendar, Eye, Trash2, X, CheckCircle2 } from 'lucide-react';
import { logAdminAction } from '../services/adminLogService';
import AdminNotice, { useAdminNotice } from '../components/AdminNotice';

export default function Messages() {
  const { notice, showNotice, clearNotice } = useAdminNotice();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMessage, setActiveMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, CONTACT_MESSAGES_COLLECTION));
      const list = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setMessages(list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    } catch (err) {
      console.error('Error fetching contact messages:', err);
      showNotice('error', err.message || 'Could not load contact messages.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleOpenMessage = async (msg) => {
    setActiveMessage(msg);
    if (msg.status === 'new') {
      try {
        const docRef = doc(db, CONTACT_MESSAGES_COLLECTION, msg.id);
        await updateDoc(docRef, { status: 'read', updatedAt: serverTimestamp() });
        await logAdminAction({ action: 'MESSAGE_MARKED_READ', target: 'contactMessages', targetId: msg.id });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: 'read' } : m))
        );
      } catch (e) {
        console.warn('Could not mark message as read:', e.message);
      }
    }
  };

  const handleMarkReplied = async (msgId) => {
    try {
      const docRef = doc(db, CONTACT_MESSAGES_COLLECTION, msgId);
      await updateDoc(docRef, { status: 'replied', updatedAt: serverTimestamp() });
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, status: 'replied' } : m))
      );
      if (activeMessage?.id === msgId) {
        setActiveMessage((prev) => ({ ...prev, status: 'replied' }));
      }
      await logAdminAction({
        action: 'MESSAGE_REPLIED',
        target: 'contactMessages',
        targetId: msgId,
      });
    } catch (e) {
      showNotice('error', `Could not update message: ${e.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(db, CONTACT_MESSAGES_COLLECTION, deletingId));
      await logAdminAction({ action: 'MESSAGE_DELETED', target: 'contactMessages', targetId: deletingId });
      setMessages((prev) => prev.filter((m) => m.id !== deletingId));
      setDeletingId(null);
    } catch (e) {
      showNotice('error', `Could not delete message: ${e.message}`);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Sender Details',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.name}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
            {row.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                {row.email}
              </span>
            )}
            {row.phone && (
              <span className="flex items-center gap-1 font-semibold text-slate-600">
                <Phone className="w-3 h-3 text-slate-400" />
                {row.phone}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Subject & Preview',
      render: (row) => (
        <div className="max-w-sm">
          <p className="font-semibold text-slate-800 truncate">{row.subject || 'General Inquiry'}</p>
          <p className="text-[11px] text-slate-500 truncate">{row.message}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
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
            onClick={() => handleOpenMessage(row)}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Read</span>
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete Message"
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
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Public Contact Messages ({messages.length})
        </h2>
        <p className="text-xs text-slate-500">
          Inquiries and feedback submitted by site visitors through contact forms.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={messages}
        isLoading={isLoading}
        searchPlaceholder="Search messages by sender name, email, or content..."
        searchKeys={['name', 'email', 'phone', 'subject', 'message']}
      />

      {/* View Message Modal */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{activeMessage.subject || 'Message Details'}</h3>
                <p className="text-xs text-slate-500">From: {activeMessage.name}</p>
              </div>
              <button
                onClick={() => setActiveMessage(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Email Address</span>
                  <a href={`mailto:${activeMessage.email}`} className="font-bold text-indigo-600 hover:underline">
                    {activeMessage.email || 'N/A'}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone Number</span>
                  <a href={`tel:${activeMessage.phone}`} className="font-bold text-indigo-600 hover:underline">
                    {activeMessage.phone || 'N/A'}
                  </a>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 block text-[10px] mb-1">Message Content</span>
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{activeMessage.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <StatusBadge status={activeMessage.status || 'read'} />
              <div className="flex gap-2">
                {activeMessage.status !== 'replied' && (
                  <button
                    onClick={() => handleMarkReplied(activeMessage.id)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Replied</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveMessage(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Contact Message"
        message="Are you sure you want to delete this message record?"
      />
    </div>
  );
}

