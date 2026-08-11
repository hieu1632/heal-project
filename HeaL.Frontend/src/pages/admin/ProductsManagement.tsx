import React, { useEffect, useState } from 'react';
import { categoryApi, productApi } from '../../api/productApi';
import type { Product, ProductCreate } from '../../api/productApi';
import AdminLayout from './AdminLayout';
import ImageUpload from './ImageUpload';

const ProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const buildEmptyForm = (categoryId = categories[0]?.id ?? 0): ProductCreate => ({
    name: '',
    description: '',
    categoryId,
    image: '',
    ingredients: '',
    isAvailable: true,
    isBestSeller: false,
    sizes: [
      { sizeName: 'S', price: 0, stock: 0, isAvailable: true, displayOrder: 1 },
      { sizeName: 'M', price: 0, stock: 0, isAvailable: true, displayOrder: 2 },
      { sizeName: 'L', price: 0, stock: 0, isAvailable: true, displayOrder: 3 },
    ],
  });

  const [formData, setFormData] = useState<ProductCreate>(buildEmptyForm());

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getCategories();
      setCategories(response.data);
      if (response.data.length > 0 && formData.categoryId === 0) {
        setFormData((prev) => ({ ...prev, categoryId: response.data[0].id }));
      }
    } catch (err) {
      console.error('Fetch categories failed', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productApi.getProducts({ search: searchTerm });
      setProducts(response.data);
      setError(null);
    } catch (err: any) {
      setError('Không thể tải danh sách sản phẩm');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await productApi.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      alert('Không thể xóa sản phẩm');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId || formData.categoryId <= 0) {
      alert('Vui lòng chọn danh mục hợp lệ');
      return;
    }

    // Validate sizes
    if (formData.sizes.some(s => s.price <= 0)) {
      alert('Vui lòng nhập giá hợp lệ cho tất cả size');
      return;
    }

    try {
      if (editingProduct) {
        await productApi.updateProduct(editingProduct.id, formData);
      } else {
        await productApi.createProduct(formData);
      }
      setShowModal(false);
      fetchProducts();
      resetForm();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const resetForm = () => {
    setFormData(buildEmptyForm(categories[0]?.id ?? 0));
    setEditingProduct(null);
  };

  const handleSizeChange = (index: number, field: string, value: any) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setFormData({ ...formData, sizes: newSizes });
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
        <h1 className="text-2xl font-bold text-primary">📦 Quản lý sản phẩm</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={fetchProducts}
          className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Tìm
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Tên</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Danh mục</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Giá</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Size</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">#{product.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={product.image || '/placeholder.jpg'} 
                      alt={product.name} 
                      className="w-10 h-10 object-cover rounded" 
                    />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{product.categoryName}</td>
                <td className="px-6 py-4 text-sm font-semibold text-primary">
                  {product.price.toLocaleString('vi-VN')}đ
                </td>
                <td className="px-6 py-4 text-sm">
                  {product.sizes.map(s => s.sizeName).join(', ')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                  </span>
                  {product.isBestSeller && (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      Bán chạy
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setFormData({
                        name: product.name,
                        description: product.description || '',
                        categoryId: product.categoryId || categories[0]?.id || 0,
                        image: product.image || '',
                        ingredients: product.ingredients || '',
                        isAvailable: product.isAvailable,
                        isBestSeller: product.isBestSeller,
                        sizes: product.sizes.map(s => ({
                          sizeName: s.sizeName,
                          price: s.price,
                          stock: s.stock,
                          isAvailable: s.isAvailable,
                          displayOrder: s.displayOrder,
                        })),
                      });
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Chưa có sản phẩm nào
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
              {editingProduct ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={0}>Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* ✅ IMAGE UPLOAD - PHẦN THAY ĐỔI CHÍNH */}
                <div className="md:col-span-2">
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    label="Hình ảnh sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thành phần</label>
                  <input
                    type="text"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Còn hàng</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Bán chạy</span>
                  </label>
                </div>
              </div>

              {/* Sizes Management */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">Quản lý Size</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formData.sizes.map((size, index) => (
                    <div key={index} className="border p-4 rounded-lg bg-gray-50">
                      <div className="mb-2">
                        <input
                          type="text"
                          placeholder="Size name (S, M, L...)"
                          value={size.sizeName}
                          onChange={(e) => handleSizeChange(index, 'sizeName', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                      <div className="mb-2">
                        <input
                          type="number"
                          placeholder="Giá"
                          value={size.price}
                          onChange={(e) => handleSizeChange(index, 'price', Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                      <div className="mb-2">
                        <input
                          type="number"
                          placeholder="Tồn kho"
                          value={size.stock}
                          onChange={(e) => handleSizeChange(index, 'stock', Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={size.isAvailable}
                            onChange={(e) => handleSizeChange(index, 'isAvailable', e.target.checked)}
                            className="w-4 h-4 text-primary"
                          />
                          <span>Còn hàng</span>
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.sizes.length > 1) {
                            const newSizes = formData.sizes.filter((_, i) => i !== index);
                            setFormData({ ...formData, sizes: newSizes });
                          } else {
                            alert('Phải có ít nhất 1 size');
                          }
                        }}
                        className="mt-2 text-red-500 text-sm hover:underline"
                      >
                        🗑️ Xóa size này
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      sizes: [...formData.sizes, { 
                        sizeName: '', 
                        price: 0, 
                        stock: 0, 
                        isAvailable: true, 
                        displayOrder: formData.sizes.length + 1 
                      }]
                    });
                  }}
                  className="mt-3 text-primary text-sm hover:underline"
                >
                  + Thêm size mới
                </button>
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
                  {editingProduct ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductsManagement;