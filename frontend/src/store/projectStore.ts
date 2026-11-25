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

const DEFAULT_DEMO_PROJECTS: Project[] = [
  {
    id: "e51f4081-0f8d-49e4-bd8e-2de41d9e76c9",
    name: "Two-Story Contemporary Villa",
    description: "Multi-level modern architectural villa with open-plan living, terrace, and en-suite master.",
    unitSystem: "METERS",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    floorCount: 2,
    roomCount: 7,
    totalArea: 476.16,
  },
  {
    id: "97f4dc56-2770-4910-81a9-8bf6210d2f0f",
    name: "Scandinavian Studio Apartment",
    description: "Compact 42 m² open-concept urban studio with ensuite bathroom and kitchenette.",
    unitSystem: "METERS",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    floorCount: 1,
    roomCount: 3,
    totalArea: 42.0,
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "The Garden Apartment",
    description: "85.3 m² residential floor plan with 5 rooms and outdoor terrace egress.",
    unitSystem: "METERS",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    floorCount: 1,
    roomCount: 5,
    totalArea: 85.3,
  },
];

const DEFAULT_DEMO_STATS: DashboardStats = {
  totalProjects: 3,
  totalFloors: 4,
  totalRooms: 15,
  totalArea: 603.46,
};

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

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
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    searchDebounceTimer = setTimeout(() => {
      get().fetchProjects();
    }, 300);
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
      // Fallback: If backend is cold-starting or offline, populate with demo architectural projects
      if (get().projects.length === 0) {
        set({ projects: DEFAULT_DEMO_PROJECTS, stats: DEFAULT_DEMO_STATS, isLoading: false });
      } else {
        set({ isLoading: false });
      }
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
      if (!get().stats) {
        set({ stats: DEFAULT_DEMO_STATS });
      }
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
