"use client";

import React, { useState } from "react";
import RegisterForm from "../components/RegisterForm";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

function RegisterPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden flex ">
      {/* Panel trái - Form đăng ký */}
      <div className="w-1/2 h-full flex items-center justify-center relative z-10">
        {showForm && (
          <motion.div
            className="w-[80%] max-w-lg p-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RegisterForm />
          </motion.div>
        )}
      </div>

      {/* Logo/info panel trượt từ trái → phải và nằm bên phải */}
      <motion.div
        className="h-full bg-white/30 rounded-l-[20%] flex flex-col justify-center items-center px-10 z-20"
        initial={{ x: "-110%" }}
        animate={{ x: 0 }}
        transition={{ duration: 1 }}
        style={{ width: "50%" }}
        onAnimationComplete={() => setShowForm(true)}
      >
        <div className="w-36 h-36 mb-6 cursor-pointer">
          <Image src="/logo2 .png" alt="Logo" width={250} height={250} />
        </div>
        <h1 className="text-white text-4xl font-bold mb-8">StreamCart</h1>
        <p className="text-gray-300 text-xl mb-12 font-semibold text-center px-12 font-sans">
          Bạn đã có tài khoản? Hãy đăng nhập để trải nghiệm mua sắm tốt nhất.
        </p>
        <Link href="/authentication/login">
          <button className="mt-4 border text-black font-semibold shadow-lg cursor-pointer shadow-gray-800 px-10 py-2.5 bg-gradient-to-r from-[#B0F847] via-[#c6ef88] to-[#B0F847] rounded-full text-base uppercase animate-zoom-custom">
            Đăng nhập
          </button>
        </Link>
      </motion.div>
    </div>
  );
}

export default RegisterPage;
