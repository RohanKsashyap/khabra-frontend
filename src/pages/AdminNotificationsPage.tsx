import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

const AdminNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationAPI.getNotifications();
      setNotifications(data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setCreating(true);
    try {
      await notificationAPI.createNotification({ title, message });
      setTitle('');
      setMessage('');
      fetchNotifications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create notification');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this notification?')) return;
    setDeletingId(id);
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(notifications => notifications.filter(n => n._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete notification');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (n: Notification) => {
    setEditingId(n._id);
    setEditTitle(n.title);
    setEditMessage(n.message);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditMessage('');
  };

  const handleUpdate = async (id: string) => {
    if (!editTitle.trim() || !editMessage.trim()) return;
    setUpdatingId(id);
    try {
      await notificationAPI.updateNotification(id, { title: editTitle, message: editMessage });
      setNotifications(notifications => notifications.map(n => n._id === id ? { ...n, title: editTitle, message: editMessage } : n));
      setEditingId(null);
      setEditTitle('');
      setEditMessage('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update notification');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="h1 text-center mb-10">Notifications</h1>
        <div className="max-w-2xl mx-auto text-center text-gray-500">
          You do not have permission to post or manage notifications. Please contact an admin if you believe this is a mistake.
        </div>
        <div className="space-y-6 max-w-2xl mx-auto mt-10">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500">No notifications yet.</div>
          ) : (
            notifications.map((n) => (
              <div key={n._id} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{n.title}</h2>
                  <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-gray-700 text-base mb-2">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="h1 text-center mb-10">Admin Notifications</h1>
      <form onSubmit={handleCreate} className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-6 mb-10 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border rounded px-4 py-2 text-lg"
          required
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="border rounded px-4 py-2 text-base min-h-[80px]"
          required
        />
        <button
          type="submit"
          className="bg-primary text-white px-6 py-2 rounded-lg text-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
          disabled={creating || !title.trim() || !message.trim()}
        >
          {creating ? 'Posting...' : 'Post Notification'}
        </button>
      </form>
      <div className="space-y-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500">No notifications yet.</div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-2 relative">
              {editingId === n._id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="border rounded px-4 py-2 text-lg mb-2"
                  />
                  <textarea
                    value={editMessage}
                    onChange={e => setEditMessage(e.target.value)}
                    className="border rounded px-4 py-2 text-base min-h-[80px] mb-2"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleUpdate(n._id)}
                      className="bg-primary text-white px-4 py-1 rounded hover:bg-primary/90 disabled:opacity-50"
                      disabled={updatingId === n._id || !editTitle.trim() || !editMessage.trim()}
                    >
                      {updatingId === n._id ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-200 text-gray-700 px-4 py-1 rounded hover:bg-gray-300"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{n.title}</h2>
                    <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700 text-base mb-2">{n.message}</p>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(n)}
                      className="text-blue-500 hover:text-blue-700 text-xs font-bold px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(n._id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded"
                      disabled={deletingId === n._id}
                    >
                      {deletingId === n._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotificationsPage; 