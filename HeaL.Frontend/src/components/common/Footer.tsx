import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300">
      {/* Main Footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand */}
          <div>
            <Link to="/" className="text-2xl font-bold text-white">
              🍵 HeaL
            </Link>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Trà và bánh ngọt tinh tế - Nơi hương vị gặp nhau. 
              HeaL mang đến những trải nghiệm ẩm thực ấm áp và đáng nhớ.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">YouTube</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Liên kết nhanh
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/menu" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Thông tin liên hệ
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-0.5">📍</span>
                <span className="text-gray-400">
                  134 phố Việt Hòa, Phường Việt Hòa,<br />
                  TP. Hải Phòng
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary">📞</span>
                <a href="tel:0901234567" className="text-gray-400 hover:text-white transition-colors">
                  0376 38 0500
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary">✉️</span>
                <a href="mailto:hello@heal.com" className="text-gray-400 hover:text-white transition-colors">
                  hieulol163@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary">🕐</span>
                <span className="text-gray-400">
                  Thứ 2 - Chủ nhật: 8:00 - 22:00
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Map */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Vị trí của chúng tôi
            </h3>
            <div className="rounded-lg overflow-hidden bg-gray-700 aspect-video w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5959.491947500308!2d106.2973989!3d20.9462276!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31359b75e4d6c0fd%3A0x960a6ed3a45963f7!2zMTM0IFZp4buHdCBIw7Jh!5e0!3m2!1svi!2s!4v1722855593533!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="HeaL Location Map"
                className="w-full h-full"
              ></iframe>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              📍 Xem trên Google Maps
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container-custom py-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-sm text-gray-400">
            © {currentYear} HeaL. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Chính sách bảo mật
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
              Hỗ trợ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;