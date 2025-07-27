import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import { Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  referralCode?: string;
  referredBy?: {
    _id: string;
    name: string;
    email: string;
    referralCode?: string;
  } | null;
}

const roles = ['user', 'franchise', 'admin'];

function exportToCSV(users: User[]) {
  const headers = ['Name', 'Email', 'Phone', 'Role', 'Referral Code', 'Referred By'];
  const rows = users.map(u => [
    u.name,
    u.email,
    u.phone || '-',
    u.role,
    u.referralCode || '-',
    u.referredBy ? `${u.referredBy.name} (${u.referredBy.email})` : '-'
  ]);
  const csvContent = [headers, ...rows].map(e => e.map(x => `"${x}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'users.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [processingDelete, setProcessingDelete] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    axios.get('/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setUsers(res.data);
        setError(null);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to fetch users');
      })
      .finally(() => setLoading(false));
  }, []);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Search and filter logic
  const filteredUsers = users.filter(u => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(searchText) ||
      u.email.toLowerCase().includes(searchText) ||
      (u.referralCode?.toLowerCase().includes(searchText) ?? false) ||
      (u.referredBy?.name?.toLowerCase().includes(searchText) ?? false) ||
      (u.referredBy?.email?.toLowerCase().includes(searchText) ?? false);
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  // Bulk selection handler
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  // Delete user handler
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setProcessingDelete(true);
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users => users.filter(u => u._id !== id));
      toast.success('User deleted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setProcessingDelete(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected for deletion.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected users?`)) return;

    setProcessingDelete(true);
    const token = localStorage.getItem('token');
    try {
      await axios.delete('/users', {
        headers: { Authorization: `Bearer ${token}` },
        data: { userIds: selectedUsers },
      });
      setUsers(users => users.filter(u => !selectedUsers.includes(u._id)));
      toast.success(`${selectedUsers.length} users deleted successfully!`);
      setSelectedUsers([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete selected users.');
    } finally {
      setProcessingDelete(false);
    }
  };

  // Edit user handler (opens modal)
  const handleEdit = (user: User) => {
    setEditUser({ ...user });
  };

  // Save edit
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSavingEdit(true);
    const token = localStorage.getItem('token');
    try {
      const { name, phone, role } = editUser;
      const res = await axios.put(`/users/${editUser._id}`, { name, phone, role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users => users.map(u => u._id === editUser._id ? res.data.user : u));
      setEditUser(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSavingEdit(false);
    }
  };

  // Close edit modal
  const closeEditModal = () => setEditUser(null);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[300px]"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Toaster position="top-center" reverseOrder={false} />
      <h2 className="text-2xl font-bold mb-4">All Users</h2>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">All Roles</option>
            {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={processingDelete}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-600/90 disabled:bg-red-400"
            >
              {processingDelete ? 'Deleting...' : `Delete Selected (${selectedUsers.length})`}
            </button>
          )}
          <button
            onClick={() => exportToCSV(filteredUsers)}
            className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/90"
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                  disabled={filteredUsers.length === 0}
                />
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referral Code</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referred By</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredUsers.map(u => (
              <tr key={u._id}>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u._id)}
                    onChange={() => handleSelectOne(u._id)}
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{u.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{u.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">{u.phone || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap">{u.role}</td>
                <td className="px-4 py-2 whitespace-nowrap">{u.referralCode || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {u.referredBy ? `${u.referredBy.name} (${u.referredBy.email})` : '-'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                  <button
                    className="text-blue-600 hover:underline text-xs"
                    onClick={() => handleEdit(u)}
                  >Edit</button>
                  <button
                    className="text-red-600 hover:underline text-xs"
                    onClick={() => handleDelete(u._id)}
                    disabled={processingDelete}
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit User</h3>
            <form onSubmit={handleEditSave}>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input className="border rounded px-3 py-2 w-full" value={editUser.name}
                  onChange={e => setEditUser({ ...editUser, name: e.target.value })} required />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input className="border rounded px-3 py-2 w-full" value={editUser.phone || ''}
                  onChange={e => setEditUser({ ...editUser, phone: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select className="border rounded px-3 py-2 w-full" value={editUser.role}
                  onChange={e => setEditUser({ ...editUser, role: e.target.value })} required>
                  {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={closeEditModal} disabled={savingEdit}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-primary text-white" disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 