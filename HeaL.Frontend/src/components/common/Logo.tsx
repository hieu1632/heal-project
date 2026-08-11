import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon Logo */}
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <svg 
            viewBox="0 0 40 40" 
            className="w-7 h-7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 6C20 6 12 10 10 16C8 22 14 28 20 30C26 28 32 22 30 16C28 10 20 6 20 6Z"
              fill="#8B5E3C"
              opacity="0.15"
              stroke="#8B5E3C"
              strokeWidth="1.5"
            />
            <path
              d="M20 10C20 10 16 12 15 15C14 18 17 22 20 23C23 22 26 18 25 15C24 12 20 10 20 10Z"
              fill="#8B5E3C"
              opacity="0.3"
            />
            <path
              d="M18 26L22 26C23.1046 26 24 26.8954 24 28V29C24 30.1046 23.1046 31 22 31L18 31C16.8954 31 16 30.1046 16 29V28C16 26.8954 16.8954 26 18 26Z"
              fill="#8B5E3C"
              opacity="0.4"
            />
            <path
              d="M24 27.5C24.5 27.5 25 27.8 25 28.5C25 29.2 24.5 29.5 24 29.5"
              stroke="#8B5E3C"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M14 14C14 14 13 12 14 10"
              stroke="#D4A574"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M17 12C17 12 16 10 17 8"
              stroke="#D4A574"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>
        </div>
      </div>
      
      {/* Text Logo */}
      {showText && (
        <span className="text-2xl font-bold text-primary tracking-tight">
          HeaL
        </span>
      )}
    </div>
  );
};

export default Logo;