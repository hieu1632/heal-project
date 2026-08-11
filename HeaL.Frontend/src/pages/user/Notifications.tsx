import React, { useEffect, useState } from 'react';
import { notificationApi } from '../../api/notificationApi';
import type { Notification } from '../../api/notificationApi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationApi.getNotifications();
      setNotifications(response.data);
    } catch (err: any) {
      setError('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead([id]);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Lỗi xóa thông báo:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Welcome': return '🎉';
      case 'Voucher': return '🎁';
      case 'Order': return '📦';
      case 'Promotion': return '🔥';
      default: return '📢';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Welcome': return 'bg-green-100 text-green-800';
      case 'Voucher': return 'bg-yellow-100 text-yellow-800';
      case 'Order': return 'bg-blue-100 text-blue-800';
      case 'Promotion': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">📬 Thông báo</h1>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors"
          >
            Đọc tất cả
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <span className="text-6xl block mb-4">📭</span>
          <h2 className="text-2xl font-semibold text-gray-600">Chưa có thông báo</h2>
          <p className="text-gray-400 mt-2">Khi có thông báo mới, chúng sẽ hiển thị ở đây</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white rounded-lg shadow-md p-4 transition-colors ${
                !notif.isRead ? 'border-l-4 border-primary' : ''
              }`}
              onClick={() => handleMarkAsRead(notif.id)}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">
                  {getTypeIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-800">{notif.title}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notif.id);
                      }}
                      className="text-gray-400 hover:text-red-500 text-sm flex-shrink-0"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-gray-600 mt-1">{notif.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(notif.type)}`}>
                      {notif.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notif.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                    {!notif.isRead && (
                      <span className="text-xs text-blue-500">● Chưa đọc</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;