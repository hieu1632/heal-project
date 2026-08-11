import React from 'react';
import { Link } from 'react-router-dom';
import type { Product, ProductSize } from '../../../api/productApi';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const minPrice = product.sizes?.length > 0 
    ? Math.min(...product.sizes.map((s: ProductSize) => s.price)) 
    : product.price;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/product/${product.id}`}>
        <img 
          src={product.image || '/placeholder.jpg'} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mt-1">{product.categoryName}</p>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-primary font-bold">
            {minPrice.toLocaleString('vi-VN')}đ
          </span>
          {product.isBestSeller && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
              Bán chạy
            </span>
          )}
        </div>
        {!product.isAvailable && (
          <span className="text-red-500 text-sm">Hết hàng</span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;