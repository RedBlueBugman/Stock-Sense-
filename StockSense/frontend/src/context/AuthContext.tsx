import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import api from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  demoLogin: (role: "ADMIN" | "WORKER") => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("stocksense_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("stocksense_token"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("stocksense_token", token);
    } else {
      localStorage.removeItem("stocksense_token");
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res: any = await api.post("/auth/login", { email, password });
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem("stocksense_user", JSON.stringify(res.data.user));
  };

  const demoLogin = (role: "ADMIN" | "WORKER") => {
    const demoUser: User = {
      id: "demo-user-id",
      name: role === "ADMIN" ? "Lead Inventory Manager" : "Floor Warehouse Operator",
      email: role === "ADMIN" ? "admin@stocksense.local" : "worker@stocksense.local",
      role: role === "ADMIN" ? "ADMIN" : "WAREHOUSE_WORKER",
    };
    setUser(demoUser);
    setToken("demo-mock-jwt-token");
    localStorage.setItem("stocksense_user", JSON.stringify(demoUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("stocksense_user");
    localStorage.removeItem("stocksense_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, demoLogin, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};