import { create } from "zustand";
import { Project } from "@/types/project";
import { api } from "@/lib/api";

interface DashboardStats {
  totalProjects: number;
  totalFloors: number;
  totalRooms: number;
  totalArea: number;
}

interface ProjectState {
  projects: Project[];
  stats: DashboardStats | null;
  isLoading: boolean;
  searchQuery: string;
  sortBy: "updatedAt_desc" | "createdAt_desc" | "name_asc" | "name_desc";
  filterCategory: "ALL" | "APARTMENTS" | "STUDIOS";
  selectedUnit: "METERS" | "CENTIMETERS" | "FEET";

  // Actions
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: "updatedAt_desc" | "createdAt_desc" | "name_asc" | "name_desc") => void;
  setFilterCategory: (category: "ALL" | "APARTMENTS" | "STUDIOS") => void;
  setSelectedUnit: (unit: "METERS" | "CENTIMETERS" | "FEET") => void;

  fetchProjects: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createProject: (name: string, description: string, unitSystem: string, templateId: string) => Promise<Project>;
  updateProject: (id: string, name: string, description: string, unitSystem: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<Project>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  stats: null,
  isLoading: true,
  searchQuery: "",
  sortBy: "updatedAt_desc",
  filterCategory: "ALL",
  selectedUnit: "METERS",

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().fetchProjects();
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    get().fetchProjects();
  },

  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setSelectedUnit: (selectedUnit) => set({ selectedUnit }),

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const { sortBy, searchQuery } = get();
      const params = new URLSearchParams();
      if (sortBy) params.append("sort", sortBy);
      if (searchQuery) params.append("search", searchQuery);

      const res = await api.get(`/projects?${params.toString()}`);
      if (res.data.success) {
        set({ projects: res.data.data, isLoading: false });
      }
    } catch (err) {
      console.error("Failed to load projects", err);
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const res = await api.get("/projects/stats");
      if (res.data.success) {
        set({ stats: res.data.data });
      }
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  },

  createProject: async (name, description, unitSystem, templateId) => {
    const res = await api.post("/projects", { name, description, unitSystem, templateId });
    if (res.data.success) {
      await get().fetchProjects();
      await get().fetchStats();
      return res.data.data;
    }
    throw new Error(res.data.message || "Failed to create project");
  },

  updateProject: async (id, name, description, unitSystem) => {
    const res = await api.put(`/projects/${id}`, { name, description, unitSystem });
    if (res.data.success) {
      await get().fetchProjects();
      return res.data.data;
    }
    throw new Error(res.data.message || "Failed to update project");
  },

  deleteProject: async (id) => {
    const res = await api.delete(`/projects/${id}`);
    if (res.data.success) {
      await get().fetchProjects();
      await get().fetchStats();
      return;
    }
    throw new Error(res.data.message || "Failed to delete project");
  },

  duplicateProject: async (id) => {
    const res = await api.post(`/projects/${id}/duplicate`);
    if (res.data.success) {
      await get().fetchProjects();
      await get().fetchStats();
      return res.data.data;
    }
    throw new Error(res.data.message || "Failed to duplicate project");
  },
}));
