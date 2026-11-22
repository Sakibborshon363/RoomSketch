"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Button } from "@/components/ui/Button";
import { FURNITURE_CATALOG } from "@/lib/furnitureCatalog";
import { DOORS_WINDOWS_CATALOG } from "@/lib/doorsWindowsCatalog";
import { FLOOR_MATERIALS, WALL_FINISHES, FURNITURE_FINISHES } from "@/lib/materialsCatalog";
import {
  LayoutGrid,
  Armchair,
  Palette,
  Layers,
  Plus,
  Square,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  DoorOpen,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Edit2,
  Check,
  Grid,
  Ruler,
  Magnet,
} from "lucide-react";

export function EditorSidebar() {
  const [activeTab, setActiveTab] = useState<"build" | "furnish" | "materials" | "layers">("build");
  const [buildSubTab, setBuildSubTab] = useState<"spaces" | "openings">("spaces");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [furnitureCategory, setFurnitureCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [newFloorInput, setNewFloorInput] = useState("");
  const [isAddingFloor, setIsAddingFloor] = useState(false);
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [editingFloorName, setEditingFloorName] = useState("");
  const [materialCategory, setMaterialCategory] = useState<"FLOOR" | "WALL" | "FURNITURE">("FLOOR");

  const {
    addRoom,
    updateRoom,
    addFurniture,
    updateFurniture,
    addDoorWindow,
    setActiveTool,
    selectedId,
    selectedType,
    floors,
    floorId,
    floorName,
    switchFloor,
    addFloor,
    deleteFloor,
    duplicateCurrentFloor,
    updateFloorDetails,
    showGrid,
    setShowGrid,
    showMeasurements,
    setShowMeasurements,
    snapToGrid,
    setSnapToGrid,
    showFurniture,
    setShowFurniture,
    showRoomLabels,
    setShowRoomLabels,
    rooms,
    furniture,
    doorsWindows,
  } = useEditorStore();

  const roomPresets = [
    { name: "Living & dining", width: 380, height: 300, color: "#EBDCCB", material: "warm_oak", desc: "33.3 m² standard living" },
    { name: "Master Bedroom", width: 260, height: 240, color: "#E2D3BE", material: "warm_oak", desc: "18.4 m² suite room" },
    { name: "Kitchen", width: 200, height: 180, color: "#D9E3DF", material: "sage_tile", desc: "10.2 m² culinary space" },
    { name: "Bathroom", width: 200, height: 180, color: "#DCE9EA", material: "light_blue_tile", desc: "14.4 m² ensuite bath" },
    { name: "Entry / Foyer", width: 180, height: 160, color: "#EDE8DE", material: "ceramic_sand", desc: "9.0 m² greeting entry" },
    { name: "Home Office", width: 220, height: 200, color: "#F0EAE1", material: "wood_oak", desc: "12.5 m² study space" },
  ];

  const categories = [
    { id: "ALL", label: "All" },
    { id: "LIVING", label: "Living" },
    { id: "BEDROOM", label: "Bedroom" },
    { id: "KITCHEN", label: "Kitchen" },
    { id: "BATHROOM", label: "Bathroom" },
    { id: "DINING", label: "Dining" },
    { id: "OFFICE", label: "Office" },
    { id: "STORAGE", label: "Storage" },
    { id: "DECOR", label: "Decor" },
  ];

  const filteredFurniture = FURNITURE_CATALOG.filter((item) => {
    const matchesCat =
      furnitureCategory === "ALL" ||
      (furnitureCategory === "LIVING" && item.category === "LIVING_ROOM") ||
      (furnitureCategory === "BEDROOM" && item.category === "BEDROOM") ||
      (furnitureCategory === "KITCHEN" && item.category === "KITCHEN") ||
      (furnitureCategory === "BATHROOM" && item.category === "BATHROOM") ||
      (furnitureCategory === "DINING" && item.category === "DINING_ROOM") ||
      (furnitureCategory === "OFFICE" && item.category === "OFFICE") ||
      (furnitureCategory === "STORAGE" && item.category === "STORAGE") ||
      (furnitureCategory === "DECOR" && item.category === "DECORATION");

    const matchesSearch =
      searchQuery.trim() === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  // Render miniature SVG for catalog card
  const renderCatalogSvg = (type: string, color: string) => {
    switch (type) {
      case "sofa_linen":
      case "sofa_2seater":
        return (
          <svg className="w-12 h-8" viewBox="0 0 60 40" fill="none">
            <rect x="2" y="2" width="56" height="36" rx="4" fill={color} stroke="#44403C" strokeWidth="2" />
            <rect x="10" y="4" width="40" height="10" rx="2" fill="#B8AE9C" />
            <rect x="2" y="2" width="8" height="36" rx="2" fill="#AFA492" />
            <rect x="50" y="2" width="8" height="36" rx="2" fill="#AFA492" />
          </svg>
        );
      case "chair_lounge":
        return (
          <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
            <rect x="4" y="4" width="32" height="32" rx="6" fill={color} stroke="#44403C" strokeWidth="2" />
            <rect x="8" y="6" width="24" height="8" rx="2" fill="#9C6F4F" />
          </svg>
        );
      case "bed_queen":
      case "bed_king":
        return (
          <svg className="w-10 h-10" viewBox="0 0 50 50" fill="none">
            <rect x="4" y="4" width="42" height="42" rx="3" fill="#EAE5DC" stroke="#3D3833" strokeWidth="2" />
            <rect x="4" y="4" width="42" height="8" rx="2" fill="#5A4A3A" />
            <rect x="8" y="15" width="14" height="10" rx="2" fill="#FFFFFF" stroke="#A8A29E" strokeWidth="1" />
            <rect x="28" y="15" width="14" height="10" rx="2" fill="#FFFFFF" stroke="#A8A29E" strokeWidth="1" />
            <rect x="6" y="28" width="38" height="16" rx="3" fill={color} stroke="#44403C" strokeWidth="1.5" />
          </svg>
        );
      case "coffee_table":
        return (
          <svg className="w-10 h-6" viewBox="0 0 50 30" fill="none">
            <rect x="4" y="4" width="42" height="22" rx="10" fill={color} stroke="#3D3833" strokeWidth="2" />
          </svg>
        );
      case "table_dining_4":
        return (
          <svg className="w-10 h-8" viewBox="0 0 50 40" fill="none">
            <circle cx="16" cy="6" r="4" fill="#B8A793" stroke="#44403C" strokeWidth="1" />
            <circle cx="34" cy="6" r="4" fill="#B8A793" stroke="#44403C" strokeWidth="1" />
            <circle cx="16" cy="34" r="4" fill="#B8A793" stroke="#44403C" strokeWidth="1" />
            <circle cx="34" cy="34" r="4" fill="#B8A793" stroke="#44403C" strokeWidth="1" />
            <rect x="8" y="10" width="34" height="20" rx="3" fill={color} stroke="#3D3833" strokeWidth="2" />
          </svg>
        );
      case "counter_sink":
        return (
          <svg className="w-12 h-6" viewBox="0 0 60 30" fill="none">
            <rect x="2" y="4" width="56" height="22" rx="2" fill={color} stroke="#292524" strokeWidth="2" />
            <rect x="22" y="8" width="18" height="14" rx="2" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
          </svg>
        );
      case "bathtub":
        return (
          <svg className="w-10 h-8" viewBox="0 0 50 40" fill="none">
            <rect x="4" y="4" width="42" height="32" rx="8" fill="#FFFFFF" stroke="#57534E" strokeWidth="2" />
            <rect x="8" y="8" width="34" height="24" rx="6" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="1" />
          </svg>
        );
      case "toilet":
        return (
          <svg className="w-6 h-8" viewBox="0 0 30 40" fill="none">
            <rect x="4" y="4" width="22" height="10" rx="2" fill="#FFFFFF" stroke="#57534E" strokeWidth="1.5" />
            <rect x="6" y="14" width="18" height="22" rx="9" fill="#FFFFFF" stroke="#57534E" strokeWidth="1.5" />
          </svg>
        );
      case "plant_potted":
        return (
          <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="10" r="6" fill="#335C43" opacity="0.8" />
            <circle cx="28" cy="15" r="6" fill={color} opacity="0.8" />
            <circle cx="28" cy="25" r="6" fill="#335C43" opacity="0.8" />
            <circle cx="20" cy="30" r="6" fill={color} opacity="0.8" />
            <circle cx="12" cy="25" r="6" fill="#335C43" opacity="0.8" />
            <circle cx="12" cy="15" r="6" fill={color} opacity="0.8" />
            <circle cx="20" cy="20" r="5" fill="#A65F38" stroke="#44403C" strokeWidth="1.5" />
          </svg>
        );
      case "rug_woven":
        return (
          <svg className="w-10 h-8" viewBox="0 0 50 40" fill="none">
            <rect x="4" y="4" width="42" height="32" rx="2" fill={color} stroke="#78716C" strokeWidth="1.5" strokeDasharray="3 2" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
            <rect x="4" y="4" width="32" height="32" rx="3" fill={color} stroke="#44403C" strokeWidth="1.5" />
          </svg>
        );
    }
  };

  return (
    <aside className="relative flex z-20 h-[calc(100vh-4rem)] border-r border-stone-200/90 bg-white select-none">
      {/* Far-Left Icon Navigation Rail */}
      <nav className="flex w-16 flex-col items-center justify-between border-r border-stone-200/80 bg-[#F9F8F5] py-4 shrink-0">
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => {
              setActiveTab("build");
              setIsCollapsed(false);
            }}
            className={`flex flex-col items-center gap-1 rounded-xl p-2.5 text-[11px] font-bold transition-all ${
              activeTab === "build" && !isCollapsed
                ? "bg-[#1E3A34] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-200/60"
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
            <span>Build</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("furnish");
              setIsCollapsed(false);
            }}
            className={`flex flex-col items-center gap-1 rounded-xl p-2.5 text-[11px] font-bold transition-all ${
              activeTab === "furnish" && !isCollapsed
                ? "bg-[#1E3A34] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-200/60"
            }`}
          >
            <Armchair className="h-5 w-5" />
            <span>Furnish</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("materials");
              setIsCollapsed(false);
            }}
            className={`flex flex-col items-center gap-1 rounded-xl p-2.5 text-[11px] font-bold transition-all ${
              activeTab === "materials" && !isCollapsed
                ? "bg-[#1E3A34] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-200/60"
            }`}
          >
            <Palette className="h-5 w-5" />
            <span>Materials</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("layers");
              setIsCollapsed(false);
            }}
            className={`flex flex-col items-center gap-1 rounded-xl p-2.5 text-[11px] font-bold transition-all ${
              activeTab === "layers" && !isCollapsed
                ? "bg-[#1E3A34] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-200/60"
            }`}
          >
            <Layers className="h-5 w-5" />
            <span>Layers</span>
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200/60 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">v1.0</div>
        </div>
      </nav>

      {/* Expandable Drawer Panel */}
      {!isCollapsed && (
        <div className="w-80 flex flex-col justify-between bg-white overflow-y-auto p-4 border-r border-stone-200/80 animate-in slide-in-from-left-4 duration-150">
          <div>
            <div className="mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Your Design Toolkit
              </span>
              <h2 className="text-base font-extrabold text-stone-900 mt-0.5">
                {activeTab === "build" && "Build & Layout Spaces"}
                {activeTab === "furnish" && "Make it feel like home"}
                {activeTab === "materials" && "Materials & Color Palettes"}
                {activeTab === "layers" && "Floor & Drawing Layers"}
              </h2>
            </div>

            {/* TAB 1: BUILD (SPACES, DOORS & WINDOWS) */}
            {activeTab === "build" && (
              <div className="space-y-3">
                {/* Sub-tab Pill Switch */}
                <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-bold text-stone-600">
                  <button
                    onClick={() => setBuildSubTab("spaces")}
                    className={`flex-1 rounded-lg py-1.5 text-center transition-all ${
                      buildSubTab === "spaces" ? "bg-white text-stone-900 shadow-xs" : "hover:text-stone-900"
                    }`}
                  >
                    Spaces &amp; Rooms
                  </button>
                  <button
                    onClick={() => setBuildSubTab("openings")}
                    className={`flex-1 rounded-lg py-1.5 text-center transition-all ${
                      buildSubTab === "openings" ? "bg-white text-stone-900 shadow-xs" : "hover:text-stone-900"
                    }`}
                  >
                    Doors &amp; Windows
                  </button>
                </div>

                {buildSubTab === "spaces" ? (
                  <div className="space-y-4">
                    {/* Draw Room CTA */}
                    <div className="rounded-xl border border-dashed border-[#1E3A34]/40 bg-[#F9F8F5] p-3 text-center">
                      <p className="text-xs font-bold text-stone-800">Custom Freeform Room</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">Click &amp; drag on canvas to draw custom dimensions</p>
                      <Button
                        size="sm"
                        onClick={() => setActiveTool("draw_room")}
                        className="w-full mt-2.5 bg-[#1E3A34] text-white text-xs font-bold shadow-xs hover:bg-[#152a26]"
                      >
                        <Square className="h-3.5 w-3.5 mr-1.5" /> Draw Room on Canvas
                      </Button>
                    </div>

                    {/* Preset Room Cards */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Quick Preset Spaces
                      </span>
                      <div className="space-y-2 mt-2">
                        {roomPresets.map((preset) => (
                          <div
                            key={preset.name}
                            onClick={() =>
                              addRoom({
                                name: preset.name,
                                width: preset.width,
                                height: preset.height,
                                floorColor: preset.color,
                                floorMaterial: preset.material,
                              })
                            }
                            className="group flex items-center justify-between rounded-xl border border-stone-200/80 bg-white p-2.5 hover:border-[#1E3A34] hover:shadow-xs transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="h-8 w-8 rounded-lg border border-stone-300/80 shadow-xs flex items-center justify-center shrink-0"
                                style={{ backgroundColor: preset.color }}
                              >
                                <Square className="h-4 w-4 text-[#292524] opacity-50" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#1E3A34] transition-colors">
                                  {preset.name}
                                </h4>
                                <p className="text-[10px] text-stone-400">{preset.desc}</p>
                              </div>
                            </div>
                            <Plus className="h-4 w-4 text-stone-400 group-hover:text-[#1E3A34] transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* SUB-TAB 2: DOORS & WINDOWS (PHASE 5) */
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Architectural Openings ({DOORS_WINDOWS_CATALOG.length} items)
                    </span>
                    <div className="space-y-2 pt-1">
                      {DOORS_WINDOWS_CATALOG.map((opening) => (
                        <div
                          key={opening.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData(
                              "application/json",
                              JSON.stringify({
                                openingType: opening.type,
                                type: opening.type,
                                name: opening.name,
                                width: opening.defaultWidth,
                                height: opening.defaultHeight,
                                swing: opening.defaultSwing || "INSIDE_LEFT",
                              })
                            );
                          }}
                          onClick={() => {
                            addDoorWindow({
                              type: opening.type,
                              name: opening.name,
                              width: opening.defaultWidth,
                              height: opening.defaultHeight,
                              swing: opening.defaultSwing || "INSIDE_LEFT",
                            });
                          }}
                          className="group flex items-center justify-between rounded-xl border border-stone-200/80 bg-[#FAF9F5] p-2.5 hover:border-[#1E3A34] hover:bg-white hover:shadow-xs transition-all cursor-pointer"
                          title={`${opening.name} - Drag or click to place`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-white border border-stone-200/70 shrink-0">
                              {opening.type === "DOOR" ? (
                                <svg className="w-8 h-6" viewBox="0 0 40 30" fill="none">
                                  <rect x="4" y="22" width="32" height="3" fill="#E7E5E4" />
                                  <line x1="6" y1="22" x2="6" y2="4" stroke="#1C1917" strokeWidth="2" />
                                  <path d="M 6 4 A 18 18 0 0 1 24 22" stroke="#78716C" strokeWidth="1" strokeDasharray="2 2" fill="none" />
                                </svg>
                              ) : (
                                <svg className="w-8 h-5" viewBox="0 0 40 20" fill="none">
                                  <line x1="4" y1="5" x2="36" y2="5" stroke="#292524" strokeWidth="2" />
                                  <line x1="4" y1="15" x2="36" y2="15" stroke="#292524" strokeWidth="2" />
                                  <line x1="5" y1="8.5" x2="35" y2="8.5" stroke="#0284C7" strokeWidth="1.2" />
                                  <line x1="5" y1="11.5" x2="35" y2="11.5" stroke="#0284C7" strokeWidth="1.2" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#1E3A34] transition-colors">
                                {opening.name}
                              </h4>
                              <p className="text-[10px] text-stone-400">{opening.widthMeters.toFixed(2)} m width</p>
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-stone-400 group-hover:text-[#1E3A34] transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FURNISH (PHASE 4 - FULL ARCHITECTURAL LIBRARY) */}
            {activeTab === "furnish" && (
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find the perfect piece..."
                    className="w-full rounded-xl border border-stone-200 bg-[#FBFBFA] py-2 pl-8 pr-3 text-xs text-stone-800 placeholder:text-stone-400 focus:border-[#1E3A34] focus:outline-hidden transition-all"
                  />
                </div>

                {/* Category Pills (Living, Bedroom, Kitchen, etc.) */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {categories.map((cat) => {
                    const isSelected = furnitureCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setFurnitureCategory(cat.id)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                          isSelected
                            ? "bg-[#1E3A34] text-white shadow-xs"
                            : "bg-[#F4F1EA] text-stone-600 hover:bg-stone-200/70"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* Subheading with item counter */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-bold text-stone-600">Thoughtful essentials</span>
                  <span className="text-[10px] font-bold text-stone-400">{filteredFurniture.length} items</span>
                </div>

                {/* 2-Column Furniture Cards Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {filteredFurniture.map((item) => (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify({
                            name: item.name,
                            category: item.category,
                            type: item.type,
                            width: item.defaultWidth,
                            height: item.defaultHeight,
                            color: item.defaultColor,
                            material: item.material,
                          })
                        );
                      }}
                      onClick={() => {
                        addFurniture({
                          name: item.name,
                          category: item.category,
                          type: item.type,
                          width: item.defaultWidth,
                          height: item.defaultHeight,
                          color: item.defaultColor,
                          material: item.material,
                        });
                      }}
                      className="group flex flex-col justify-between rounded-xl border border-stone-200/80 bg-[#FAF9F5] p-2.5 hover:border-[#1E3A34] hover:bg-white hover:shadow-xs transition-all cursor-pointer relative"
                      title={`${item.name} (${item.description}) - Drag or click to place`}
                    >
                      {/* Mini Preview Box */}
                      <div className="flex h-16 w-full items-center justify-center rounded-lg bg-[#F3EFE6] border border-stone-200/50 group-hover:bg-[#EFEAE0] transition-colors">
                        {renderCatalogSvg(item.type, item.defaultColor)}
                      </div>

                      {/* Card Info */}
                      <div className="mt-2">
                        <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#1E3A34] transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          {item.widthMeters.toFixed(2)} m × {item.heightMeters.toFixed(2)} m
                        </p>
                      </div>

                      {/* Floating Add Pill on Hover */}
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="rounded-full bg-[#1E3A34] p-1 text-white shadow-xs">
                          <Plus className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MATERIALS & SURFACE FINISHES (Phase 7) */}
            {activeTab === "materials" && (
              <div className="space-y-3.5">
                {/* Category Switcher */}
                <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-bold text-stone-600">
                  <button
                    onClick={() => setMaterialCategory("FLOOR")}
                    className={`flex-1 rounded-lg py-1.5 text-center transition-all ${
                      materialCategory === "FLOOR" ? "bg-white text-stone-900 shadow-xs" : "hover:text-stone-900"
                    }`}
                  >
                    Flooring ({FLOOR_MATERIALS.length})
                  </button>
                  <button
                    onClick={() => setMaterialCategory("WALL")}
                    className={`flex-1 rounded-lg py-1.5 text-center transition-all ${
                      materialCategory === "WALL" ? "bg-white text-stone-900 shadow-xs" : "hover:text-stone-900"
                    }`}
                  >
                    Walls ({WALL_FINISHES.length})
                  </button>
                  <button
                    onClick={() => setMaterialCategory("FURNITURE")}
                    className={`flex-1 rounded-lg py-1.5 text-center transition-all ${
                      materialCategory === "FURNITURE" ? "bg-white text-stone-900 shadow-xs" : "hover:text-stone-900"
                    }`}
                  >
                    Furniture ({FURNITURE_FINISHES.length})
                  </button>
                </div>

                {/* Contextual Target Banner */}
                <div className="rounded-xl border border-stone-200/80 bg-[#FAF9F5] p-2.5 text-[11px]">
                  {selectedType === "room" ? (
                    <div className="flex items-center gap-2 text-stone-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>
                        Target: <strong className="font-bold">{rooms.find((r) => r.id === selectedId)?.name || "Selected Room"}</strong>. Click any swatch below to apply immediately.
                      </span>
                    </div>
                  ) : selectedType === "furniture" ? (
                    <div className="flex items-center gap-2 text-stone-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>
                        Target: <strong className="font-bold">{furniture.find((f) => f.id === selectedId)?.name || "Selected Furniture"}</strong>. Click any finish to re-upholster.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-stone-500">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>Click any room or furniture on the canvas, then choose a material below to apply it.</span>
                    </div>
                  )}
                </div>

                {/* Material Catalog Grid */}
                <div className="space-y-2">
                  {materialCategory === "FLOOR" &&
                    FLOOR_MATERIALS.map((mat) => (
                      <div
                        key={mat.id}
                        onClick={() => {
                          if (selectedType === "room" && selectedId) {
                            updateRoom(selectedId, { floorMaterial: mat.id, floorColor: mat.color });
                          }
                        }}
                        className={`flex items-start gap-3 rounded-xl border p-2.5 transition-all cursor-pointer ${
                          selectedType === "room" &&
                          rooms.find((r) => r.id === selectedId)?.floorMaterial === mat.id
                            ? "border-[#1E3A34] bg-white ring-2 ring-[#1E3A34]/15"
                            : "border-stone-200/80 bg-white hover:border-[#1E3A34] hover:shadow-xs"
                        }`}
                      >
                        {/* Swatch */}
                        <div
                          className="h-10 w-10 shrink-0 rounded-lg border border-stone-300 shadow-xs relative overflow-hidden"
                          style={{ backgroundColor: mat.color }}
                        >
                          {mat.pattern === "planks" && (
                            <div className="absolute inset-0 flex flex-col justify-between py-1 opacity-20">
                              <div className="h-px bg-black" />
                              <div className="h-px bg-black" />
                            </div>
                          )}
                          {mat.pattern === "grid" && (
                            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-25">
                              <div className="border-r border-b border-black" />
                              <div className="border-b border-black" />
                              <div className="border-r border-black" />
                              <div />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-stone-900 truncate">{mat.name}</h4>
                            <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[9px] font-bold text-stone-500 uppercase">
                              {mat.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{mat.description}</p>
                        </div>
                      </div>
                    ))}

                  {materialCategory === "WALL" &&
                    WALL_FINISHES.map((wall) => (
                      <div
                        key={wall.id}
                        onClick={() => {
                          if (selectedType === "room" && selectedId) {
                            updateRoom(selectedId, { wallColor: wall.color });
                          }
                        }}
                        className={`flex items-start gap-3 rounded-xl border p-2.5 transition-all cursor-pointer ${
                          selectedType === "room" &&
                          rooms.find((r) => r.id === selectedId)?.wallColor === wall.color
                            ? "border-[#1E3A34] bg-white ring-2 ring-[#1E3A34]/15"
                            : "border-stone-200/80 bg-white hover:border-[#1E3A34] hover:shadow-xs"
                        }`}
                      >
                        <div
                          className="h-10 w-10 shrink-0 rounded-lg border border-stone-300 shadow-xs"
                          style={{ backgroundColor: wall.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-stone-900 truncate">{wall.name}</h4>
                            <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[9px] font-bold text-stone-500">
                              {wall.finishType}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{wall.description}</p>
                        </div>
                      </div>
                    ))}

                  {materialCategory === "FURNITURE" &&
                    FURNITURE_FINISHES.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (selectedType === "furniture" && selectedId) {
                            updateFurniture(selectedId, { color: item.color, material: item.material });
                          }
                        }}
                        className={`flex items-start gap-3 rounded-xl border p-2.5 transition-all cursor-pointer ${
                          selectedType === "furniture" &&
                          furniture.find((f) => f.id === selectedId)?.color === item.color
                            ? "border-[#1E3A34] bg-white ring-2 ring-[#1E3A34]/15"
                            : "border-stone-200/80 bg-white hover:border-[#1E3A34] hover:shadow-xs"
                        }`}
                      >
                        <div
                          className="h-10 w-10 shrink-0 rounded-lg border border-stone-300 shadow-xs"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-stone-900 truncate">{item.name}</h4>
                            <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[9px] font-bold text-stone-500">
                              {item.material}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TAB 4: LAYERS & FLOORS (Phase 6) */}
            {activeTab === "layers" && (
              <div className="space-y-4">
                {/* 1. Multi-Floor Manager */}
                <div className="rounded-2xl border border-stone-200/90 bg-[#F9F8F5] p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-[#1E3A34]" />
                      <span className="text-xs font-bold text-stone-900">Project Stories &amp; Floors</span>
                    </div>
                    <span className="rounded-full bg-stone-200/80 px-2 py-0.5 text-[10px] font-extrabold text-stone-700">
                      {floors.length} {floors.length === 1 ? "level" : "levels"}
                    </span>
                  </div>

                  {/* Floor List */}
                  <div className="space-y-2">
                    {floors.map((floor) => {
                      const isActive = floor.id === floorId || floor.name === floorName;
                      const isEditing = editingFloorId === floor.id;

                      return (
                        <div
                          key={floor.id}
                          className={`rounded-xl border p-2.5 transition-all ${
                            isActive
                              ? "border-[#1E3A34] bg-white shadow-xs"
                              : "border-stone-200/80 bg-stone-50 hover:bg-white hover:border-stone-300"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div
                              onClick={() => {
                                if (!isEditing) switchFloor(floor.id);
                              }}
                              className="flex items-center gap-2 flex-1 cursor-pointer min-w-0"
                            >
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                                  isActive
                                    ? "bg-[#1E3A34] text-white"
                                    : "bg-stone-200 text-stone-700"
                                }`}
                              >
                                L{floor.floorNumber}
                              </span>

                              {isEditing ? (
                                <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    value={editingFloorName}
                                    onChange={(e) => setEditingFloorName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && editingFloorName.trim()) {
                                        updateFloorDetails(floor.id, editingFloorName.trim());
                                        setEditingFloorId(null);
                                      } else if (e.key === "Escape") {
                                        setEditingFloorId(null);
                                      }
                                    }}
                                    className="w-full rounded border border-[#1E3A34] px-1.5 py-0.5 text-xs font-bold text-stone-900 focus:outline-none"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => {
                                      if (editingFloorName.trim()) {
                                        updateFloorDetails(floor.id, editingFloorName.trim());
                                        setEditingFloorId(null);
                                      }
                                    }}
                                    className="rounded p-1 text-emerald-700 hover:bg-emerald-50"
                                    title="Confirm Rename"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-stone-800 truncate">
                                      {floor.name}
                                    </span>
                                    {isActive && (
                                      <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {!isEditing && (
                                <button
                                  onClick={() => {
                                    setEditingFloorId(floor.id);
                                    setEditingFloorName(floor.name);
                                  }}
                                  className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                                  title="Rename floor"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  if (isActive) {
                                    duplicateCurrentFloor();
                                  } else {
                                    switchFloor(floor.id).then(() => duplicateCurrentFloor());
                                  }
                                }}
                                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-amber-700 transition-colors"
                                title="Duplicate this floor"
                              >
                                <Copy className="h-3 w-3" />
                              </button>

                              <button
                                onClick={() => {
                                  if (floors.length > 1) {
                                    if (confirm(`Delete ${floor.name}? All rooms and furniture on this level will be removed.`)) {
                                      deleteFloor(floor.id);
                                    }
                                  }
                                }}
                                disabled={floors.length <= 1}
                                className={`rounded-lg p-1 transition-colors ${
                                  floors.length <= 1
                                    ? "text-stone-300 cursor-not-allowed"
                                    : "text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                                }`}
                                title={floors.length <= 1 ? "Cannot delete the sole floor" : "Delete floor"}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add New Floor Button / Form */}
                  {isAddingFloor ? (
                    <div className="space-y-2 pt-2 border-t border-stone-200/60">
                      <input
                        type="text"
                        placeholder="e.g. Second floor, Attic, Terrace"
                        value={newFloorInput}
                        onChange={(e) => setNewFloorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addFloor(newFloorInput);
                            setNewFloorInput("");
                            setIsAddingFloor(false);
                          } else if (e.key === "Escape") {
                            setIsAddingFloor(false);
                          }
                        }}
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 placeholder-stone-400 focus:border-[#1E3A34] focus:outline-none"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            addFloor(newFloorInput);
                            setNewFloorInput("");
                            setIsAddingFloor(false);
                          }}
                          className="flex-1 bg-[#1E3A34] hover:bg-[#254A42] text-white text-xs font-bold h-8"
                        >
                          Create Level
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsAddingFloor(false);
                            setNewFloorInput("");
                          }}
                          className="text-xs text-stone-600 h-8"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingFloor(true)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300 bg-white py-2 text-xs font-bold text-[#1E3A34] hover:border-[#1E3A34] hover:bg-stone-50 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add New Story / Floor</span>
                    </button>
                  )}
                </div>

                {/* 2. Display & Drawing Layer Toggles */}
                <div className="rounded-2xl border border-stone-200/80 bg-stone-50 p-3.5 space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Canvas Drawing Layers
                  </span>

                  <div className="space-y-1.5">
                    {/* Grid Snapping */}
                    <div className="flex items-center justify-between rounded-xl bg-white p-2 border border-stone-200/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                        <Magnet className="h-3.5 w-3.5 text-stone-500" />
                        <span>Grid Snapping (20cm)</span>
                      </div>
                      <button
                        onClick={() => setSnapToGrid(!snapToGrid)}
                        className={`flex h-5 w-9 items-center rounded-full transition-colors p-0.5 ${
                          snapToGrid ? "bg-[#1E3A34]" : "bg-stone-300"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                            snapToGrid ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Dot Grid Layer */}
                    <div className="flex items-center justify-between rounded-xl bg-white p-2 border border-stone-200/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                        <Grid className="h-3.5 w-3.5 text-stone-500" />
                        <span>Dot Grid</span>
                      </div>
                      <button
                        onClick={() => setShowGrid(!showGrid)}
                        className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 transition-colors"
                        title={showGrid ? "Hide grid" : "Show grid"}
                      >
                        {showGrid ? <Eye className="h-3.5 w-3.5 text-[#1E3A34]" /> : <EyeOff className="h-3.5 w-3.5 text-stone-400" />}
                      </button>
                    </div>

                    {/* Dimension Measurements Layer */}
                    <div className="flex items-center justify-between rounded-xl bg-white p-2 border border-stone-200/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                        <Ruler className="h-3.5 w-3.5 text-stone-500" />
                        <span>Dimension Lines</span>
                      </div>
                      <button
                        onClick={() => setShowMeasurements(!showMeasurements)}
                        className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 transition-colors"
                        title={showMeasurements ? "Hide measurements" : "Show measurements"}
                      >
                        {showMeasurements ? <Eye className="h-3.5 w-3.5 text-[#1E3A34]" /> : <EyeOff className="h-3.5 w-3.5 text-stone-400" />}
                      </button>
                    </div>

                    {/* Furniture Layer Toggle */}
                    <div className="flex items-center justify-between rounded-xl bg-white p-2 border border-stone-200/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                        <Armchair className="h-3.5 w-3.5 text-stone-500" />
                        <span>Furniture Layer</span>
                      </div>
                      <button
                        onClick={() => setShowFurniture(!showFurniture)}
                        className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 transition-colors"
                        title={showFurniture ? "Hide furniture" : "Show furniture"}
                      >
                        {showFurniture ? <Eye className="h-3.5 w-3.5 text-[#1E3A34]" /> : <EyeOff className="h-3.5 w-3.5 text-stone-400" />}
                      </button>
                    </div>

                    {/* Room Labels Layer */}
                    <div className="flex items-center justify-between rounded-xl bg-white p-2 border border-stone-200/60">
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                        <Square className="h-3.5 w-3.5 text-stone-500" />
                        <span>Room Labels &amp; Areas</span>
                      </div>
                      <button
                        onClick={() => setShowRoomLabels(!showRoomLabels)}
                        className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 transition-colors"
                        title={showRoomLabels ? "Hide labels" : "Show labels"}
                      >
                        {showRoomLabels ? <Eye className="h-3.5 w-3.5 text-[#1E3A34]" /> : <EyeOff className="h-3.5 w-3.5 text-stone-400" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Scene Breakdown */}
                <div className="rounded-2xl border border-stone-200/70 bg-[#F9F8F5] p-3 text-xs text-stone-600">
                  <div className="flex items-center justify-between font-bold text-stone-800 mb-1">
                    <span>Active Level Elements</span>
                    <span className="text-[10px] text-stone-400">{rooms.length + furniture.length + doorsWindows.length} items</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                    <div className="rounded-lg bg-white p-1.5 border border-stone-200/60">
                      <div className="font-extrabold text-stone-900">{rooms.length}</div>
                      <div className="text-[10px] text-stone-400">Rooms</div>
                    </div>
                    <div className="rounded-lg bg-white p-1.5 border border-stone-200/60">
                      <div className="font-extrabold text-stone-900">{furniture.length}</div>
                      <div className="text-[10px] text-stone-400">Furniture</div>
                    </div>
                    <div className="rounded-lg bg-white p-1.5 border border-stone-200/60">
                      <div className="font-extrabold text-stone-900">{doorsWindows.length}</div>
                      <div className="text-[10px] text-stone-400">Openings</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Friendly Tip Card at bottom (matching reference image) */}
          <div className="rounded-xl border border-stone-200/70 bg-[#F9F8F5] p-3 text-[11px] text-stone-600 mt-4">
            <div className="flex items-center gap-1.5 font-bold text-stone-800 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-[#1E3A34]" /> Good spaces start with you
            </div>
            <p className="text-[10px] text-stone-500 leading-relaxed">
              Try an idea. Move things around. There&apos;s always undo (Ctrl+Z).
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
