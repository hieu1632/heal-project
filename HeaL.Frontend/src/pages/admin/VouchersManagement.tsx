import React, { useEffect, useState } from 'react';
import { voucherApi } from '../../api/voucherApi';
import type { Voucher, VoucherCreate } from '../../api/voucherApi';

const VouchersManagement: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [formData, setFormData] = useState<VoucherCreate>({
    code: '',
    description: '',
    discountPercent: 0,
    maxDiscount: undefined,
    minOrderValue: undefined,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    quantity: 100,
    isActive: true,
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const response = await voucherApi.getAll();
      setVouchers(response.data);
      setError(null);
    } catch (err: any) {
      setError('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVoucher) {
        await voucherApi.update(editingVoucher.id, formData);
      } else {
        await voucherApi.create(formData);
      }
      setShowModal(false);
      fetchVouchers();
      resetForm();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu voucher');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa voucher này?')) return;
    try {
      await voucherApi.delete(id);
      fetchVouchers();
    } catch (err: any) {
      alert('Không thể xóa voucher');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountPercent: 0,
      maxDiscount: undefined,
      minOrderValue: undefined,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quantity: 100,
      isActive: true,
    });
    setEditingVoucher(null);
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">🏷️ Quản lý Voucher</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80"
        >
          + Tạo voucher mới
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Mã</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Giảm giá</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Đơn tối thiểu</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Giảm tối đa</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Số lượng</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Hạn sử dụng</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => {
              const expired = isExpired(v.expiryDate);
              return (
                <tr key={v.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-primary">{v.code}</td>
                  <td className="px-6 py-4">{v.discountPercent}%</td>
                  <td className="px-6 py-4">
                    {v.minOrderValue ? `${v.minOrderValue.toLocaleString('vi-VN')}đ` : 'Không'}
                  </td>
                  <td className="px-6 py-4">
                    {v.maxDiscount ? `${v.maxDiscount.toLocaleString('vi-VN')}đ` : 'Không'}
                  </td>
                  <td className="px-6 py-4">{v.quantity}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(v.expiryDate).toLocaleDateString('vi-VN')}
                    {expired && <span className="ml-2 text-red-500">(Hết hạn)</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      v.isActive && !expired ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {v.isActive && !expired ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setEditingVoucher(v);
                        setFormData({
                          code: v.code,
                          description: v.description || '',
                          discountPercent: v.discountPercent,
                          maxDiscount: v.maxDiscount,
                          minOrderValue: v.minOrderValue,
                          expiryDate: new Date(v.expiryDate).toISOString().split('T')[0],
                          quantity: v.quantity,
                          isActive: v.isActive,
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
            {vouchers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  Chưa có voucher nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingVoucher ? '✏️ Sửa voucher' : '➕ Tạo voucher mới'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã voucher *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VD: HEAL10"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                />
                <p className="text-xs text-gray-500 mt-1">Chỉ dùng chữ hoa và số, không dấu</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá (%) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn hàng tối thiểu</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderValue || ''}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Không giới hạn"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscount || ''}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Không giới hạn"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hạn sử dụng *</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Hoạt động</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
                >
                  {editingVoucher ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VouchersManagement;