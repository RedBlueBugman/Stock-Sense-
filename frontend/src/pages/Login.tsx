import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Lock, Mail, ArrowRight, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Login: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@stocksense.local");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (role: "ADMIN" | "WORKER") => {
    demoLogin(role);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto">
            <Box className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">StockSense IMS</h1>
          <p className="text-xs text-slate-400">Double-Entry Real-Time Inventory Control</p>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2">
            <span>{loading ? "Signing in..." : "Sign In to Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-center text-slate-400 flex items-center justify-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Judge 1-Click Demo Login:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleDemo("ADMIN")} className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-indigo-400 font-semibold text-xs">
              👑 Manager Demo
            </button>
            <button onClick={() => handleDemo("WORKER")} className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-emerald-400 font-semibold text-xs">
              📦 Worker Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};