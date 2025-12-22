"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "./api";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  age?: number;
  phone: string;
  role: string;
  gender: string;
  avatar?: string;
  address?: string;
  bio?: string;
  studentId?: string;
  instructorId?: string;
  isActive: boolean;
  emailVerified: boolean;
  allowLoginWithoutRequirements?: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get("/user/me");
      setUser(response.data);
    } catch (err: any) {
      // Don't set error for 401/404 - it just means user is not logged in or not found
      const status = err.response?.status;
      if (status !== 401 && status !== 404) {
        setError(err);
        console.error("[AuthProvider] Error fetching user:", err);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch user on mount
    fetchUser();

    // Refetch user on window focus (to sync across tabs)
    const handleFocus = () => {
      if (!isLoading) {
        fetchUser();
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const refetch = async () => {
    await fetchUser();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

