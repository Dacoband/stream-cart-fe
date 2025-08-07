import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  Shield,
  Truck,
  CreditCard,
  Headset,
  MessageCircleQuestion,
} from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Main Footer Content */}
      <div className="px-6 md:px-12 lg:px-24 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Cột 1: Logo và mô tả */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <Image
                src="/logo2 .png"
                alt="Stream Card Logo"
                width={96}
                height={96}
                className="w-10 h-10 object-contain"
              />
              <h2 className="text-2xl font-bold text-[#B0F847] ">StreamCard</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Nền tảng livestream bán hàng hiện đại, kết nối người mua và người
              bán một cách nhanh chóng, tiện lợi và an toàn.
            </p>

            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Cột 2: Dịch vụ khách hàng */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-[#B0F847]  flex items-center">
              <MessageCircleQuestion className="w-5 h-5 mr-2" />
              Dịch vụ khách hàng
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#B0F847]  transition-colors flex items-center"
                >
                  <span className="w-2 h-2 bg-[#B0F847]  rounded-full mr-3"></span>
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#B0F847]  transition-colors flex items-center"
                >
                  <span className="w-2 h-2 bg-[#B0F847]  rounded-full mr-3"></span>
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#B0F847]  transition-colors flex items-center"
                >
                  <span className="w-2 h-2 bg-[#B0F847]  rounded-full mr-3"></span>
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#B0F847]  transition-colors flex items-center"
                >
                  <span className="w-2 h-2 bg-[#B0F847]  rounded-full mr-3"></span>
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#B0F847]  transition-colors flex items-center"
                >
                  <span className="w-2 h-2 bg-[#B0F847]  rounded-full mr-3"></span>
                  Câu hỏi thường gặp
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Thông tin liên hệ */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-[#B0F847]  flex items-center">
              <Headset className="w-5 h-5 mr-2" />
              Liên hệ
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-[#B0F847]  mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Hotline</p>
                  <p className="text-gray-300">1900 1234</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-[#B0F847]  mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Email</p>
                  <p className="text-gray-300">support@streamcard.vn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cột 4: Cam kết dịch vụ */}
          <div>
            {/* <h3 className="text-xl font-semibold mb-6 text-[#B0F847]  flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Cam kết
            </h3> */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <Shield className="w-6 h-6 text-[#B0F847]  flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm">
                    Bảo mật thông tin
                  </p>
                  <p className="text-gray-400 text-xs">100% an toàn</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <Truck className="w-6 h-6 text-[#B0F847]  flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm">
                    Giao hàng nhanh
                  </p>
                  <p className="text-gray-400 text-xs">Toàn quốc</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <CreditCard className="w-6 h-6 text-[#B0F847]  flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm">
                    Thanh toán đa dạng
                  </p>
                  <p className="text-gray-400 text-xs">Visa, MasterCard, ATM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-black">
        <div className="px-6 md:px-12 lg:px-24 py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} StreamCard. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-[#B0F847]  transition-colors">
                Chính sách bảo mật
              </a>
              <span>|</span>
              <a href="#" className="hover:text-[#B0F847]  transition-colors">
                Điều khoản sử dụng
              </a>
              <span>|</span>
              <a href="#" className="hover:text-[#B0F847]  transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
