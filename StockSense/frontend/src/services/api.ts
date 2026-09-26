import axios from "axios";
import { Product, Warehouse, Location, Partner, StockOperation, DashboardKPIs, StockQuant } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("stocksense_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg = error.response?.data?.error?.message || error.message || "Request failed";
    return Promise.reject(new Error(msg));
  }
);

export const ApiService = {
  getKPIs: async (): Promise<DashboardKPIs> => {
    const res: any = await api.get("/dashboard/kpis");
    return res.data;
  },
  getRecentOperations: async (): Promise<StockOperation[]> => {
    const res: any = await api.get("/dashboard/recent-operations");
    return res.data || [];
  },
  getProducts: async (search?: string): Promise<Product[]> => {
    const res: any = await api.get("/products", { params: { search } });
    return res.data || [];
  },
  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const res: any = await api.post("/products", data);
    return res.data;
  },
  getWarehouses: async (): Promise<Warehouse[]> => {
    const res: any = await api.get("/warehouses");
    return res.data || [];
  },
  createWarehouse: async (data: Partial<Warehouse>): Promise<Warehouse> => {
    const res: any = await api.post("/warehouses", data);
    return res.data;
  },
  getLocations: async (warehouseId?: string): Promise<Location[]> => {
    const res: any = await api.get("/locations", { params: { warehouse_id: warehouseId } });
    return res.data || [];
  },
  getPartners: async (type?: string): Promise<Partner[]> => {
    const res: any = await api.get("/partners", { params: { type } });
    return res.data || [];
  },
  createPartner: async (data: Partial<Partner>): Promise<Partner> => {
    const res: any = await api.post("/partners", data);
    return res.data;
  },
  getOperations: async (type?: string, status?: string): Promise<StockOperation[]> => {
    const res: any = await api.get("/operations", { params: { type, status } });
    return res.data || [];
  },
  executeOperation: async (payload: {
    operationType: string;
    sourceLocationId: string;
    destinationLocationId: string;
    partnerId?: string;
    notes?: string;
    items: Array<{ productId: string; quantity: number; unitOfMeasure?: string }>;
  }): Promise<StockOperation> => {
    const res: any = await api.post("/operations/execute", payload);
    return res.data;
  },
  getStockQuants: async (): Promise<StockQuant[]> => {
    const res: any = await api.get("/stock/quants");
    return res.data || [];
  },
};

export default api;