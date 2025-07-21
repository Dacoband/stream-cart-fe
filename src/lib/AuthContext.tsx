"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "@/services/api/auth/authentication";
import { UserLocal } from "@/types/auth/user";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: UserLocal | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<UserLocal | null>>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const [user, setUser] = useState<UserLocal | null>(null);
  const [loading, setLoading] = useState(true);
  const logout = () => {
    localStorage.clear();
    setUser(null);
    router.push("/authentication/login");
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }

      const userData = await getMe();

      setUser(userData);

      localStorage.setItem("userData", JSON.stringify(userData));
    } catch (error) {
      console.error("Lỗi lấy thông tin người dùng:", error);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem("userData");
    if (cached) {
      setUser(JSON.parse(cached));
    }

    refreshUser().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth phải được dùng trong AuthProvider");
  return context;
};
