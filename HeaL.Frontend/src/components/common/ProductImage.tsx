import React, { useState } from 'react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-48 object-cover',
  fallbackText,
}) => {
  const [error, setError] = useState(false);

  // Nếu không có ảnh hoặc lỗi, hiển thị placeholder
  if (!src || error) {
    return (
      <div className={`${className} bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center`}>
        <div className="text-center">
          <span className="text-5xl block mb-2">🍵</span>
          {fallbackText && (
            <span className="text-xs text-gray-400">{fallbackText}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

export default ProductImage;