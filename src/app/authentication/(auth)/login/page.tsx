"use client";
import React, { useState } from "react";
import LoginForm from "../../components/LoginForm";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

function LoginPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden flex">
      <motion.div
        className="h-full bg-white/30 rounded-r-[22%]  flex flex-col justify-center items-center px-10 z-20"
        initial={{ x: "110%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.8 }}
        style={{ width: "50%" }}
        onAnimationComplete={() => setShowForm(true)}
      >
        <Link href="/home">
          <div className="w-36 h-36 mb-6 cursor-pointer">
            <Image src="/logo2 .png" alt="Logo" width={250} height={250} />
          </div>
        </Link>
        <h1 className="text-white text-4xl font-bold mb-8">StreamCart</h1>
        <p className="text-white/80  text-xl mb-12 font-semibold text-center px-12 font-sans">
          Bạn chưa có tài khoản? Hãy đăng ký để trãi nghiệm mua sắm tốt nhất.
        </p>
        <Link href="/authentication/register">
          <button className="mt-4 border text-black font-semibold shadow-lg cursor-pointer shadow-gray-800 px-10 py-2.5 bg-gradient-to-r from-[#B0F847] via-[#c6ef88] to-[#B0F847] rounded-full text-base uppercase animate-zoom-custom">
            Đăng ký
          </button>
        </Link>
      </motion.div>

      <div className="w-1/2 h-full flex items-center justify-center relative z-10">
        {showForm && (
          <motion.div
            className="w-[80%] max-w-lg p-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoginForm />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
