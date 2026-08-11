import React, { useEffect, useState } from 'react';
import { comboApi } from '../../api/comboApi';
import type { Combo, ComboCreate } from '../../api/comboApi';  
import { productApi } from '../../api/productApi';
import type { Product } from '../../api/productApi';           
import AdminLayout from './AdminLayout';
import ImageUpload from './ImageUpload';

const CombosManagement: React.FC = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<ComboCreate>({
    name: '',
    description: '',
    price: 0,
    discountPercent: 0,
    image: '',
    type: 'Product',
    isActive: true,
    items: [
      { productId: 0, productSizeId: undefined, quantity: 1, isFreebie: false, note: '' }
    ],
  });

  useEffect(() => {
    fetchCombos();
    fetchProducts();
  }, []);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const response = await comboApi.getCombos();
      setCombos(response.data);
      setError(null);
    } catch (err: any) {
      setError('Không thể tải danh sách combo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productApi.getProducts({ isAvailable: true });
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa combo này?')) return;
    try {
      await comboApi.deleteCombo(id);
      setCombos(combos.filter(c => c.id !== id));
    } catch (err: any) {
      alert('Không thể xóa combo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên combo');
      return;
    }
    if (formData.items.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm vào combo');
      return;
    }
    if (formData.items.some(item => item.productId === 0)) {
      alert('Vui lòng chọn sản phẩm cho tất cả các mục');
      return;
    }

    try {
      if (editingCombo) {
        await comboApi.updateCombo(editingCombo.id, formData);
      } else {
        await comboApi.createCombo(formData);
      }
      setShowModal(false);
      fetchCombos();
      resetForm();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu combo');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      discountPercent: 0,
      image: '',
      type: 'Product',
      isActive: true,
      items: [
        { productId: 0, productSizeId: undefined, quantity: 1, isFreebie: false, note: '' }
      ],
    });
    setEditingCombo(null);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { productId: 0, productSizeId: undefined, quantity: 1, isFreebie: false, note: '' }
      ]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) {
      alert('Phải có ít nhất 1 sản phẩm trong combo');
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'Freebie': return '🎁 Mua tặng';
      case 'Quantity': return '📦 Số lượng';
      default: return '💰 Tiết kiệm';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Freebie': return 'bg-red-100 text-red-800';
      case 'Quantity': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
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
        <h1 className="text-2xl font-bold text-primary">🎁 Quản lý Combo</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors"
        >
          + Thêm combo mới
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm combo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={fetchCombos}
          className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Tìm
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Combos Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Tên</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Loại</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Giá</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Sản phẩm</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {combos
              .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((combo) => (
                <tr key={combo.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">#{combo.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={combo.image || '/combo-placeholder.jpg'} 
                        alt={combo.name} 
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span className="font-medium">{combo.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(combo.type)}`}>
                      {getTypeLabel(combo.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-primary">
                    {combo.price.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {combo.items.length} sản phẩm
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      combo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {combo.isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setEditingCombo(combo);
                        setFormData({
                          name: combo.name,
                          description: combo.description || '',
                          price: combo.price,
                          discountPercent: combo.discountPercent || 0,
                          image: combo.image || '',
                          type: combo.type,
                          isActive: combo.isActive,
                          items: combo.items.map(item => ({
                            productId: item.productId,
                            productSizeId: item.productSizeId,
                            quantity: item.quantity,
                            isFreebie: item.isFreebie,
                            note: item.note || '',
                          })),
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(combo.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            {combos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Chưa có combo nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingCombo ? '✏️ Sửa combo' : '➕ Thêm combo mới'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên combo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại combo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Product">💰 Tiết kiệm</option>
                    <option value="Freebie">🎁 Mua tặng</option>
                    <option value="Quantity">📦 Số lượng</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <ImageUpload
                    value={formData.image || ''}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    label="Hình ảnh combo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá combo (đ)</label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercent || ''}
                    onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-4">
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
              </div>

              {/* Items Management */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">📦 Sản phẩm trong combo</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-primary text-sm hover:underline"
                  >
                    + Thêm sản phẩm
                  </button>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} className="border p-4 rounded-lg bg-gray-50 mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Sản phẩm *</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, 'productId', Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        >
                          <option value={0}>Chọn sản phẩm</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                        <select
                          value={item.productSizeId || ''}
                          onChange={(e) => handleItemChange(index, 'productSizeId', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        >
                          <option value="">Mặc định</option>
                          {products
                            .find(p => p.id === item.productId)
                            ?.sizes?.map((size) => (
                              <option key={size.id} value={size.id}>
                                {size.sizeName} - {size.price.toLocaleString('vi-VN')}đ
                              </option>
                            ))
                          }
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Số lượng *</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.isFreebie}
                            onChange={(e) => handleItemChange(index, 'isFreebie', e.target.checked)}
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-xs font-medium text-green-600">🎁 Quà tặng</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Ghi chú (tùy chọn)"
                        value={item.note || ''}
                        onChange={(e) => handleItemChange(index, 'note', e.target.value)}
                        className="w-full px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                >
                  {editingCombo ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default CombosManagement;