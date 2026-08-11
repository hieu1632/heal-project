import React, { useEffect, useState } from 'react';
import { adminNotificationApi } from'../../api/adminNotificationApi';
import type { UserSimple } from '../../api/adminNotificationApi';
import AdminLayout from '../admin/AdminLayout';

const NotificationsManagement: React.FC = () => {
  const [users, setUsers] = useState<UserSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | 'all'>('all');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminNotificationApi.getUsers();
      setUsers(response.data);
    } catch (err: any) {
      setError('Không thể tải danh sách user');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSuccess(null);
    setError(null);

    try {
      if (selectedUser === 'all') {
        await adminNotificationApi.sendToAll({ title, content });
        setSuccess(`✅ Đã gửi thông báo đến tất cả ${users.length} user`);
      } else {
        await adminNotificationApi.sendToUser({
          userId: selectedUser,
          title,
          content,
        });
        const user = users.find(u => u.id === selectedUser);
        setSuccess(`✅ Đã gửi thông báo đến ${user?.fullName}`);
      }
      setTitle('');
      setContent('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gửi thông báo thất bại');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">Đang tải...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">📢 Quản lý thông báo</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Form gửi thông báo */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">✉️ Gửi thông báo mới</h2>
          
          <form onSubmit={handleSend}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Người nhận *
              </label>
              <select
                required
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">📨 Tất cả user ({users.length})</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề *
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề thông báo..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung *
              </label>
              <textarea
                required
                rows={5}
                maxLength={500}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung thông báo..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {content.length}/500
              </p>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {sending ? '⏳ Đang gửi...' : '📤 Gửi thông báo'}
            </button>
          </form>
        </div>

        {/* Thống kê */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Thống kê</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Tổng user</span>
              <span className="font-bold text-primary">{users.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-green-600">User đang hoạt động</span>
              <span className="font-bold text-green-600">{users.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600">Đã gửi thông báo</span>
              <span className="font-bold text-blue-600">-</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium text-gray-700 mb-2">💡 Lưu ý</h3>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Thông báo sẽ hiển thị ngay cho user</li>
              <li>• User sẽ nhận được 🔔 trên góc phải</li>
              <li>• Nội dung tối đa 500 ký tự</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NotificationsManagement;