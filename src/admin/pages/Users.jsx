import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../../firebase.js';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import AdminNotice, { useAdminNotice } from '../components/AdminNotice';
import { Users as UsersIcon, Shield, UserCheck, Trash2, Edit2, X, Check, Mail, Phone, Calendar } from 'lucide-react';
import { logAdminAction } from '../services/adminLogService';
import { useAdminAuth } from '../context/AdminAuthContext';

export const USERS_COLLECTION = 'users';

export default function Users() {
  const { notice, showNotice, clearNotice } = useAdminNotice();
  const { currentUser, isSuperAdmin } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRoleUser, setEditRoleUser] = useState(null);
  const [newRole, setNewRole] = useState('buyer');
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, USERS_COLLECTION));
      const list = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setUsers(list);
    } catch (err) {
      console.error('[Users] Error fetching user records:', err);
      setError(`Failed to retrieve user registry: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const counts = {
    total: users.length,
    buyers: users.filter((u) => u.role === 'buyer').length,
    sellers: users.filter((u) => u.role === 'seller').length,
    admins: users.filter((u) => u.role === 'admin').length,
  };

  const handleOpenRoleModal = (user) => {
    setEditRoleUser(user);
    setNewRole(user.role || 'buyer');
  };

  const handleSaveRole = async () => {
    if (!editRoleUser) return;
    setIsUpdating(true);
    try {
      const setRole = httpsCallable(getFunctions(), 'setAdminCustomClaim');
      await setRole({ targetUid: editRoleUser.id, role: newRole });

      setUsers((prev) =>
        prev.map((u) => (u.id === editRoleUser.id ? { ...u, role: newRole } : u))
      );
      setEditRoleUser(null);
    } catch (err) {
      console.error('[Users] Error updating user role:', err);
      showNotice('error', `Could not update user role: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingId) return;
    try {
      const targetUser = users.find((u) => u.id === deletingId);
      await deleteDoc(doc(db, USERS_COLLECTION, deletingId));

      await logAdminAction({
        action: 'DELETE_USER',
        target: 'users',
        targetId: deletingId,
        details: { email: targetUser?.email || 'unknown' },
      });

      setUsers((prev) => prev.filter((u) => u.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error('[Users] Error deleting user:', err);
      showNotice('error', `Could not delete user: ${err.message}`);
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      sortable: true,
      render: (val, row) => {
        const userName = typeof val === 'string' && val.trim() ? val : '';
        const email = typeof row?.email === 'string' ? row.email : '';
        const label = userName || email || 'Unnamed User';
        return (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 uppercase border border-slate-200">
            {label.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs">{userName || 'Unnamed User'}</p>
            <p className="text-[11px] text-slate-500 font-mono">{email || 'No email'}</p>
          </div>
        </div>
        );
      },
    },
    {
      header: 'Contact Phone',
      accessor: 'phone',
      render: (val) => (
        <span className="text-xs text-slate-600 font-medium">{val || '—'}</span>
      ),
    },
    {
      header: 'System Role',
      accessor: 'role',
      sortable: true,
      render: (val) => <StatusBadge status={val || 'buyer'} />,
    },
    {
      header: 'UID Reference',
      accessor: 'uid',
      render: (val, row) => (
        <span className="font-mono text-[10px] text-slate-400 max-w-[120px] truncate block">
          {val || row.id}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      className: 'text-right',
      render: (val, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenRoleModal(row)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Edit Role"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingId(row.id)}
            disabled={row.id === currentUser?.uid}
            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
            title="Delete User Record"
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <UsersIcon className="w-6 h-6 text-indigo-600" />
            <span>Registered Users</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage authenticated buyer, seller, and administrator accounts
          </p>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Users</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{counts.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Buyers</p>
          <p className="text-2xl font-black text-emerald-950 mt-1">{counts.buyers}</p>
        </div>
        <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600">Landowners</p>
          <p className="text-2xl font-black text-sky-950 mt-1">{counts.sellers}</p>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 shadow-sm">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">Administrators</p>
          <p className="text-2xl font-black text-indigo-950 mt-1">{counts.admins}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm p-6">
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          searchPlaceholder="Search by name, email, or role..."
          searchKeys={['name', 'email', 'role', 'phone']}
          emptyMessage="No registered users found."
          defaultSortKey="name"
          defaultSortDirection="asc"
        />
      </div>

      {/* Edit Role Modal */}
      {editRoleUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Modify System Role</h3>
              <button
                onClick={() => setEditRoleUser(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Updating role for user <span className="font-bold text-slate-900">{editRoleUser.email || editRoleUser.name}</span>:
            </p>

            <div className="space-y-2">
              {['buyer', 'seller', 'support', 'editor', 'admin'].map((roleOption) => (
                <label
                  key={roleOption}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    newRole === roleOption
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="capitalize text-xs">{roleOption}</span>
                  <input
                    type="radio"
                    name="role"
                    value={roleOption}
                    checked={newRole === roleOption}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="accent-indigo-600"
                  />
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditRoleUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Apply Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        title="Delete User Record"
        message="Are you sure you want to remove this user profile from the database? This action cannot be reversed."
        confirmText="Delete User"
        isDestructive={true}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}

