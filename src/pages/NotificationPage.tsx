import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../services/api';

interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
}

export const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    fetchNotifications();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="h1 text-center mb-10">Notifications</h1>
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
            <div key={n._id} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{n.title}</h2>
                <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-gray-700 text-base">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 