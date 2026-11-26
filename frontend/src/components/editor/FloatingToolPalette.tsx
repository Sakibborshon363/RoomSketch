"use client";

import React from "react";
import { useEditorStore } from "@/store/editorStore";
import {
  MousePointer2,
  Square,
  PenTool,
  DoorOpen,
  AppWindow,
  Ruler,
  Hand,
  Undo2,
  Redo2,
  Box,
  Compass,
  Building,
  Sparkles,
  Zap,
} from "lucide-react";
import { autoResolveCollisions } from "@/lib/collisionDetection";
import { useToast } from "@/components/ui/Toast";

export function FloatingToolPalette() {
  const {
    activeTool,
    setActiveTool,
    undo,
    redo,
    history,
    viewMode,
    setViewMode,
    rooms,
    furniture,
    doorsWindows,
    setFurnitureList,
  } = useEditorStore();
  const { success } = useToast();

  const handleFixCollisions = () => {
    const res = autoResolveCollisions(rooms, furniture, doorsWindows);
    setFurnitureList(res.resolvedFurniture);
    if (res.actionsCount > 0) {
      success(
        "1-Click Fix Applied! ✨",
        `Resolved ${res.actionsCount} overlapping item(s) & cleared door clearances.`
      );
    } else {
      success(
        "Zero Collisions! ✨",
        "All furniture and doors already have optimal clearances."
      );
    }
  };

  const tools = [
    { id: "select", label: "Select (V)", icon: MousePointer2 },
    { id: "draw_room", label: "Draw Room (R)", icon: Square },
    { id: "wall", label: "Wall (W)", icon: PenTool },
    { id: "door", label: "Door (D)", icon: DoorOpen },
    { id: "window", label: "Window", icon: AppWindow },
    { id: "measure", label: "Tape Measure", icon: Ruler },
    { id: "pan", label: "Pan Canvas (H)", icon: Hand },
  ] as const;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-2xl border border-stone-200/90 bg-white/95 p-1.5 shadow-lg backdrop-blur-md select-none">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => {
              if (tool.id === "door") {
                useEditorStore.getState().addDoorWindow({ type: "DOOR", name: "Standard Interior Door" });
                setActiveTool("select");
              } else if (tool.id === "window") {
                useEditorStore.getState().addDoorWindow({ type: "WINDOW", name: "Casement Window" });
                setActiveTool("select");
              } else {
                setActiveTool(tool.id);
              }
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
              isActive
                ? "bg-[#1E3A34] text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
            title={tool.label}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}

      <div className="mx-1 h-5 w-px bg-stone-200" />

      <button
        onClick={undo}
        disabled={history.past.length === 0}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        title="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </button>

      <button
        onClick={redo}
        disabled={history.future.length === 0}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        title="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </button>

      {/* 1-Click Fix Collisions Button */}
      <button
        onClick={handleFixCollisions}
        className="flex h-9 px-2 items-center justify-center rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors text-xs font-bold gap-1 shadow-2xs"
        title="1-Click Auto-Fix Collisions & Doorway Overlaps"
      >
        <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
        <span className="hidden lg:inline text-[11px]">Auto-Fix</span>
      </button>

      <div className="mx-1 h-5 w-px bg-stone-200" />

      {/* Floor Plan to Architectural View Transition Mode Switcher */}
      <div className="flex items-center rounded-xl bg-stone-100 p-0.5 text-xs font-bold">
        <button
          onClick={() => setViewMode("2D")}
          className={`rounded-lg px-2 py-1 transition-all ${
            viewMode === "2D"
              ? "bg-[#1E3A34] text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900"
          }`}
          title="2D CAD Floor Plan Editor"
        >
          2D Plan
        </button>
        <button
          onClick={() => setViewMode("3D_ISOMETRIC")}
          className={`rounded-lg px-2 py-1 flex items-center gap-1 transition-all ${
            viewMode === "3D_ISOMETRIC" || viewMode === "3D_FIRST_PERSON"
              ? "bg-[#1E3A34] text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900"
          }`}
          title="3D Spatial WebGL Architectural Scene"
        >
          <Box className="h-3 w-3 text-amber-300" />
          <span>3D View</span>
        </button>
        <button
          onClick={() => setViewMode("ELEVATION_CAD")}
          className={`rounded-lg px-2 py-1 flex items-center gap-1 transition-all ${
            viewMode === "ELEVATION_CAD"
              ? "bg-[#1E3A34] text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900"
          }`}
          title="CAD Orthographic Technical Elevation with Datum Levels & Dimensions"
        >
          <Building className="h-3 w-3 text-sky-400" />
          <span>CAD Elevation</span>
        </button>
        <button
          onClick={() => setViewMode("ARCHITECTURAL_VIEW")}
          className={`rounded-lg px-2 py-1 flex items-center gap-1 transition-all ${
            viewMode === "ARCHITECTURAL_VIEW"
              ? "bg-[#1E3A34] text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900"
          }`}
          title="Floor Plan to Architectural Façade Visualizer & AI Suggester"
        >
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>Façade View</span>
        </button>
      </div>
    </div>
  );
}
