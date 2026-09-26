import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  History,
  Warehouse,
  Users,
  LogOut,
  Scan,
  PlusCircle,
  Box,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { OperationModal } from "./OperationModal";
import { BarcodeScannerModal } from "./BarcodeScannerModal";
import { Product } from "../types";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Operations", path: "/operations", icon: ArrowLeftRight },
    { name: "Move History", path: "/movements", icon: History },
    { name: "Products", path: "/products", icon: Package },
    { name: "Warehouses", path: "/warehouses", icon: Warehouse },
    { name: "Partners", path: "/partners", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center space-x-3 px-2 py-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">StockSense</span>
              <span className="block text-[10px] font-medium text-indigo-400 uppercase tracking-widest">Double-Entry IMS</span>
            </div>
          </div>

          <button
            onClick={() => setIsOpModalOpen(true)}
            className="w-full mb-6 py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Operation</span>
          </button>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <button
            onClick={() => setIsBarcodeOpen(true)}
            className="w-full py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 text-xs font-medium flex items-center justify-center space-x-2 transition"
          >
            <Scan className="w-3.5 h-3.5 text-indigo-400" />
            <span>Scan Barcode</span>
          </button>

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user?.name || "Inventory Manager"}</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">{user?.email || "admin@stocksense.local"}</div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-200">Main Warehouse (HYD-01)</span>
            <span className="text-slate-600">|</span>
            <span>Live SQLite Ledger</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>

      <OperationModal
        isOpen={isOpModalOpen}
        onClose={() => setIsOpModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
      <BarcodeScannerModal
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        products={[]}
        onScanSuccess={(prod: Product) => {
          navigate("/products");
        }}
      />
    </div>
  );
};