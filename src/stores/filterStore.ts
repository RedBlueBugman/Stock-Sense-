import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  warehouse: string | null;
  category: string | null;
  dateRange: { from: Date; to: Date } | null;
  status: string | null;
  search: string;

  setWarehouse: (warehouse: string | null) => void;
  setCategory: (category: string | null) => void;
  setDateRange: (range: { from: Date; to: Date } | null) => void;
  setStatus: (status: string | null) => void;
  setSearch: (search: string) => void;
  reset: () => void;
}

const initialState = {
  warehouse: null,
  category: null,
  dateRange: null,
  status: null,
  search: '',
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...initialState,
      setWarehouse: (warehouse) => set({ warehouse }),
      setCategory: (category) => set({ category }),
      setDateRange: (dateRange) => set({ dateRange }),
      setStatus: (status) => set({ status }),
      setSearch: (search) => set({ search }),
      reset: () => set(initialState),
    }),
    {
      name: 'filter-store',
    }
  )
);
