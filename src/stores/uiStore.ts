import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  selectedWarehouseId: string | undefined;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedWarehouseId: (id: string | undefined) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  selectedWarehouseId: undefined,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedWarehouseId: (id) => set({ selectedWarehouseId: id }),
}));
