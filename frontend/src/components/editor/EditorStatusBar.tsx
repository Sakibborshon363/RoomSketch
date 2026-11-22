"use client";

import React from "react";
import { useEditorStore } from "@/store/editorStore";
import { UnitSystem } from "@/types/editor";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Magnet,
  ChevronDown,
} from "lucide-react";

export function EditorStatusBar() {
  const {
    zoom,
    setZoom,
    fitToScreen,
    snapToGrid,
    setSnapToGrid,
    unit,
    setUnit,
    cursorPos,
    selectedId,
    rooms,
    activeTool,
  } = useEditorStore();

  const selectedRoom = rooms.find((r) => r.id === selectedId);

  return (
    <footer className="sticky bottom-0 z-30 flex h-10 w-full items-center justify-between border-t border-stone-200/90 bg-[#FBFBFA]/95 px-4 text-xs font-semibold text-stone-600 backdrop-blur-md select-none">
      {/* Left: Cursor coordinates and selection status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-stone-500 font-mono text-[11px]">
          <span>X: {cursorPos.x.toFixed(2)}m</span>
          <span>·</span>
          <span>Y: {cursorPos.y.toFixed(2)}m</span>
        </div>

        <div className="h-3 w-px bg-stone-200 hidden sm:block" />

        <div className="text-[11px] text-stone-500 hidden sm:block">
          {selectedRoom ? (
            <span className="text-stone-800 font-bold">Selected: {selectedRoom.name}</span>
          ) : activeTool === "draw_room" ? (
            <span className="text-[#1E3A34] font-bold">Draw room mode active (drag on canvas)</span>
          ) : (
            <span>Ready · Click object to select</span>
          )}
        </div>
      </div>

      {/* Center: Quick navigation tip */}
      <div className="hidden md:block text-[11px] text-stone-400">
        Mouse wheel zooms · Hold middle click or spacebar to pan
      </div>

      {/* Right: Snap toggle, Unit selector, Zoom controls & Fit-to-screen */}
      <div className="flex items-center gap-3">
        {/* Snap on/off */}
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] transition-colors ${
            snapToGrid ? "bg-stone-200 text-stone-900 font-bold" : "text-stone-400 hover:text-stone-600"
          }`}
          title="Snap to grid"
        >
          <Magnet className="h-3 w-3" />
          <span>{snapToGrid ? "Snap on" : "Snap off"}</span>
        </button>

        {/* Unit Selector */}
        <div className="relative">
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as UnitSystem)}
            className="rounded-md border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-bold text-stone-700 shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="METERS">Meters (m)</option>
            <option value="CENTIMETERS">Centimeters (cm)</option>
            <option value="FEET">Feet &amp; Inches (ft)</option>
          </select>
        </div>

        {/* Zoom Controls (- 103% +) */}
        <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-1.5 py-0.5 shadow-xs">
          <button
            onClick={() => setZoom(zoom - 0.1)}
            className="rounded p-0.5 text-stone-500 hover:bg-stone-100"
            title="Zoom out"
          >
            <ZoomOut className="h-3 w-3" />
          </button>
          <span className="w-12 text-center font-mono text-[11px] font-bold text-stone-800">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(zoom + 0.1)}
            className="rounded p-0.5 text-stone-500 hover:bg-stone-100"
            title="Zoom in"
          >
            <ZoomIn className="h-3 w-3" />
          </button>
        </div>

        {/* Fit to screen */}
        <button
          onClick={fitToScreen}
          className="rounded-md p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </footer>
  );
}
