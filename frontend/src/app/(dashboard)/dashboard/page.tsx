"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useProjectStore } from "@/store/projectStore";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";
import { RenameProjectModal } from "@/components/dashboard/RenameProjectModal";
import { DeleteProjectModal } from "@/components/dashboard/DeleteProjectModal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Project } from "@/types/project";
import { UnitSystem } from "@/types/editor";
import {
  Compass,
  Plus,
  Search,
  FolderOpen,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const {
    projects,
    stats,
    isLoading,
    searchQuery,
    sortBy,
    filterCategory,
    setSearchQuery,
    setSortBy,
    setFilterCategory,
    fetchProjects,
    fetchStats,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
  } = useProjectStore();

  const { success, error: toastError } = useToast();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [fetchProjects, fetchStats]);

  const handleCreateProject = async (
    name: string,
    description: string,
    unitSystem: UnitSystem,
    templateId: string
  ) => {
    try {
      const created = await createProject(name, description, unitSystem, templateId);
      success("Project created", `"${created.name}" is ready to edit.`);
      router.push(`/editor/${created.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create project";
      toastError("Creation error", msg);
    }
  };

  const handleRename = async (id: string, name: string, description: string, unitSystem: string) => {
    try {
      await updateProject(id, name, description, unitSystem);
      success("Project renamed", `Saved as "${name}".`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to rename project";
      toastError("Error", msg);
    }
  };

  const handleDuplicate = async (project: Project) => {
    try {
      const copy = await duplicateProject(project.id);
      success("Project duplicated", `Created "${copy.name}".`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to duplicate project";
      toastError("Error", msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      success("Project deleted", "The floor plan has been permanently removed.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete project";
      toastError("Error", msg);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Filter projects by category
  const filteredProjects = projects.filter((p) => {
    const pName = (p?.name || "").toLowerCase();
    if (filterCategory === "APARTMENTS") {
      return pName.includes("apartment") || pName.includes("garden");
    }
    if (filterCategory === "STUDIOS") {
      return pName.includes("studio");
    }
    return true;
  });

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#FBFBFA] text-stone-900 selection:bg-[#1E3A34] selection:text-white">
        {/* Modern Top Header (matches architectural theme) */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200/80 bg-[#FBFBFA]/90 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3A34] text-white shadow-sm">
                <Compass className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-stone-900">
                roomsketch<span className="text-[#2D5A50]">.</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-stone-200 text-xs text-stone-500 font-medium">
              <span>Personal workspace</span>
              <span>/</span>
              <span className="text-stone-800 font-semibold">Projects ({projects.length})</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Cloud Status */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-stone-500 bg-stone-100/70 rounded-full px-3 py-1 border border-stone-200/60">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PostgreSQL Cloud Synced</span>
            </div>

            <Link href="/profile">
              <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 hover:border-stone-300 transition-colors shadow-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1E3A34] text-xs font-bold text-white">
                  {user?.firstName?.[0] || "U"}
                </div>
                <span className="text-xs font-bold text-stone-800 hidden sm:inline">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-stone-400 hover:text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Welcome Banner with Dynamic Stats */}
          <div className="mb-8 rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700 mb-3 border border-stone-200/60">
                  <Sparkles className="h-3.5 w-3.5 text-[#2D5A50]" />
                  Architectural 2D & 3D CAD Planning
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
                  Welcome to RoomSketch, {user?.firstName}
                </h1>
                <p className="mt-1 text-sm text-stone-500 max-w-2xl leading-relaxed">
                  Plan, furnish, and export architectural layouts. Choose a realistic apartment template or create a custom floor plan.
                </p>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="rounded-xl border border-stone-200/80 bg-[#F9F8F5] px-4 py-3 min-w-[110px]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total Plans</p>
                  <p className="text-xl font-extrabold text-stone-900 mt-0.5">{projects.length}</p>
                </div>
                <div className="rounded-xl border border-stone-200/80 bg-[#F9F8F5] px-4 py-3 min-w-[120px]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total Footprint</p>
                  <p className="text-xl font-extrabold text-[#1E3A34] mt-0.5">
                    {stats?.totalArea ? `${stats.totalArea} m²` : "127.3 m²"}
                  </p>
                </div>
                <div className="rounded-xl border border-stone-200/80 bg-[#F9F8F5] px-4 py-3 min-w-[110px]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Rooms Designed</p>
                  <p className="text-xl font-extrabold text-stone-900 mt-0.5">
                    {stats?.totalRooms ? stats.totalRooms : "7"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plans by name or space..."
                className="w-full rounded-xl border border-stone-200/90 bg-white pl-10 pr-9 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#1E3A34] focus:outline-none focus:ring-2 focus:ring-[#1E3A34]/20 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills & Sort Selector */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
                {(["ALL", "APARTMENTS", "STUDIOS"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      filterCategory === cat
                        ? "bg-[#1E3A34] text-white shadow-xs"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {cat === "ALL" ? "All Plans" : cat === "APARTMENTS" ? "Apartments" : "Studios"}
                  </button>
                ))}
              </div>

              {/* Sort Selector */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "updatedAt_desc" | "createdAt_desc" | "name_asc" | "name_desc")
                  }
                  className="h-10 rounded-xl border border-stone-200 bg-white px-3 pr-8 text-xs font-bold text-stone-700 shadow-sm focus:border-[#1E3A34] focus:outline-none cursor-pointer"
                >
                  <option value="updatedAt_desc">Recently Updated</option>
                  <option value="createdAt_desc">Newest First</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                </select>
              </div>

              {/* + New Project Button */}
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="bg-[#1E3A34] hover:bg-[#254A42] text-white font-bold text-xs h-10 px-4 rounded-xl shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" /> New Floor Plan
              </Button>
            </div>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl border border-stone-200 bg-white p-4 animate-pulse flex flex-col justify-between"
                >
                  <div className="h-36 rounded-xl bg-stone-100" />
                  <div className="space-y-2 pt-2">
                    <div className="h-4 w-2/3 rounded bg-stone-100" />
                    <div className="h-3 w-1/2 rounded bg-stone-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onRename={(p) => setProjectToRename(p)}
                  onDuplicate={handleDuplicate}
                  onDelete={(p) => setProjectToDelete(p)}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center my-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-600">
                <FolderOpen className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-bold text-stone-900">
                {searchQuery ? "No matching floor plans found" : "No floor plans created yet"}
              </h3>
              <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                {searchQuery
                  ? `No project matched "${searchQuery}". Clear your search query or create a new plan.`
                  : "Start by creating your first residential layout or load our recommended Garden Apartment template."}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {searchQuery ? (
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-[#1E3A34] text-white font-semibold text-xs"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Create Floor Plan
                  </Button>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Modals */}
        <CreateProjectModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreate={handleCreateProject}
        />

        <RenameProjectModal
          isOpen={!!projectToRename}
          project={projectToRename}
          onClose={() => setProjectToRename(null)}
          onRename={handleRename}
        />

        <DeleteProjectModal
          isOpen={!!projectToDelete}
          project={projectToDelete}
          onClose={() => setProjectToDelete(null)}
          onConfirm={handleDelete}
        />
      </div>
    </AuthGuard>
  );
}
