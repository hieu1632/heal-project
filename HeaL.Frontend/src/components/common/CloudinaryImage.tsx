import React, { useState } from 'react';

interface CloudinaryImageProps {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
}) => {
  const [error, setError] = useState(false);

  const getOptimizedUrl = () => {
    if (!src) return '';
    if (!src.includes('cloudinary.com')) return src;

    let url = src;
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return src;

    const baseUrl = url.substring(0, uploadIndex + 8);
    const rest = url.substring(uploadIndex + 8);
    
    let transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (width || height) transformations.push('c_fit');
    transformations.push('q_80');
    transformations.push('f_auto');
    
    const transformStr = transformations.length > 0 ? transformations.join(',') + '/' : '';
    return `${baseUrl}${transformStr}${rest}`;
  };

  if (!src || error) {
    return (
      <div className={`${className} bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center`}>
        <span className="text-4xl">🍵</span>
      </div>
    );
  }

  return (
    <img
      src={getOptimizedUrl()}
      alt={alt}
      className={className}
      loading="lazy"
      width={width}
      height={height}
      onError={() => setError(true)}
    />
  );
};

export default CloudinaryImage;