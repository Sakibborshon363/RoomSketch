"use client";

import React, { useMemo } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatArea, formatDimension } from "@/lib/utils";
import { validateLayout } from "@/lib/collisionDetection";
import { FLOOR_MATERIALS, WALL_FINISHES, FURNITURE_FINISHES } from "@/lib/materialsCatalog";
import {
  Square,
  Copy,
  Trash2,
  X,
  Layers,
  ChevronRight,
  Sparkles,
  RotateCw,
  RotateCcw,
  Lock,
  Unlock,
  Move,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  AlertTriangle,
  DoorOpen,
} from "lucide-react";

export function PropertiesPanel() {
  const {
    rooms,
    furniture,
    doorsWindows,
    selectedId,
    selectedType,
    unit,
    floorName,
    floorId,
    floors,
    updateFloorDetails,
    addFloor,
    deleteFloor,
    duplicateCurrentFloor,
    updateRoom,
    deleteRoom,
    duplicateRoom,
    updateFurniture,
    deleteFurniture,
    duplicateFurniture,
    rotateFurniture,
    toggleFurnitureLock,
    reorderFurnitureZIndex,
    updateDoorWindow,
    deleteDoorWindow,
    duplicateDoorWindow,
    rotateDoorWindow,
    setSelection,
  } = useEditorStore();

  const selectedRoom = selectedType === "room" ? rooms.find((r) => r.id === selectedId) : null;
  const selectedFurniture = selectedType === "furniture" ? furniture.find((f) => f.id === selectedId) : null;
  const selectedDoorWindow = selectedType === "door_window" ? doorsWindows.find((dw) => dw.id === selectedId) : null;

  // Layout Collision & Containment Validation (Phase 5)
  const { warnings, collidingIds, outOfBoundsIds } = useMemo(
    () => validateLayout(rooms, furniture, doorsWindows),
    [rooms, furniture, doorsWindows]
  );

  const selectedFurnitureWarnings = selectedFurniture
    ? warnings.filter((w) => w.targetId === selectedFurniture.id || w.otherTargetId === selectedFurniture.id)
    : [];

  // Calculate total footprint area
  const pxToMeters = (px: number) => px * 0.04;
  const totalAreaInSqM = rooms.reduce(
    (acc, r) => acc + pxToMeters(r.width) * pxToMeters(r.height),
    0
  );

  const floorColors = [
    { name: "Warm Oak", color: "#EBDCCB" },
    { name: "Soft Oak", color: "#E2D3BE" },
    { name: "Sage Tile", color: "#D9E3DF" },
    { name: "Ceramic Sand", color: "#EDE8DE" },
    { name: "Light Blue Tile", color: "#DCE9EA" },
    { name: "Marble White", color: "#FBFBFA" },
  ];

  const wallColors = [
    { name: "Architect Charcoal", color: "#292524" },
    { name: "Slate Grey", color: "#475569" },
    { name: "Stone Ochre", color: "#78716C" },
    { name: "Deep Forest", color: "#1E3A34" },
  ];

  const furnitureColors = [
    { name: "Linen", color: "#C5BCAB" },
    { name: "Soft Cream", color: "#EDE8DE" },
    { name: "Sage", color: "#8EA69B" },
    { name: "Deep Forest", color: "#335C43" },
    { name: "Tan Leather", color: "#B38260" },
    { name: "Solid Oak", color: "#A07855" },
    { name: "Dark Walnut", color: "#57483B" },
    { name: "Charcoal", color: "#3D3935" },
    { name: "Porcelain", color: "#FFFFFF" },
    { name: "Brushed Steel", color: "#D5DDDE" },
  ];

  return (
    <aside className="w-80 h-[calc(100vh-4rem)] border-l border-stone-200/90 bg-white overflow-y-auto p-5 select-none text-stone-900 shrink-0">
      {/* 1. ROOM INSPECTOR */}
      {selectedRoom ? (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Selected Space
              </span>
              <h3 className="text-base font-extrabold text-stone-900">Room Properties</h3>
            </div>
            <button
              onClick={() => setSelection(null, null)}
              className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Room Name */}
          <Input
            id="roomName"
            label="Room Label"
            value={selectedRoom.name}
            onChange={(e) => updateRoom(selectedRoom.id, { name: e.target.value })}
          />

          {/* Dimensions & Area */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                Width
              </label>
              <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800">
                {formatDimension(pxToMeters(selectedRoom.width), unit)}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                Length
              </label>
              <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800">
                {formatDimension(pxToMeters(selectedRoom.height), unit)}
              </div>
            </div>
          </div>

          {/* Calculated Area Badge */}
          <div className="rounded-xl border border-stone-200/80 bg-[#F9F8F5] p-3 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Room Footprint</span>
            <div className="text-xl font-black text-[#1E3A34] mt-0.5">
              {formatArea(pxToMeters(selectedRoom.width) * pxToMeters(selectedRoom.height), unit)}
            </div>
          </div>

          {/* Floor Finish Material Swatches (Phase 7) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Floor Material Finish
              </label>
              <span className="text-[10px] font-bold text-stone-600 truncate max-w-[150px]">
                {FLOOR_MATERIALS.find((m) => m.id === selectedRoom.floorMaterial)?.name || "Warm Oak"}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {FLOOR_MATERIALS.map((mat) => (
                <button
                  key={mat.id}
                  onClick={() => updateRoom(selectedRoom.id, { floorMaterial: mat.id, floorColor: mat.color })}
                  className={`h-8 rounded-lg border transition-all ${
                    selectedRoom.floorMaterial === mat.id || selectedRoom.floorColor === mat.color
                      ? "border-[#1E3A34] ring-2 ring-[#1E3A34]/30 scale-105"
                      : "border-stone-200 hover:scale-105"
                  }`}
                  style={{ backgroundColor: mat.color }}
                  title={`${mat.name} (${mat.description})`}
                />
              ))}
            </div>
          </div>

          {/* Wall Finish Color Swatches (Phase 7) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Wall Structure Color
              </label>
              <span className="text-[10px] font-bold text-stone-600 truncate max-w-[150px]">
                {WALL_FINISHES.find((w) => w.color === selectedRoom.wallColor)?.name || "Architect Charcoal"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {WALL_FINISHES.map((wall) => (
                <button
                  key={wall.id}
                  onClick={() => updateRoom(selectedRoom.id, { wallColor: wall.color })}
                  className={`h-8 rounded-lg border transition-all ${
                    selectedRoom.wallColor === wall.color
                      ? "border-[#1E3A34] ring-2 ring-[#1E3A34]/30 scale-105"
                      : "border-stone-200 hover:scale-105"
                  }`}
                  style={{ backgroundColor: wall.color }}
                  title={`${wall.name} (${wall.finishType})`}
                />
              ))}
            </div>
          </div>

          {/* Room Action Buttons */}
          <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => duplicateRoom(selectedRoom.id)}
              className="flex-1 text-xs font-bold gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteRoom(selectedRoom.id)}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>
      ) : selectedFurniture ? (
        /* 2. FURNITURE INSPECTOR (PHASE 4 + PHASE 5 COLLISION NOTICES) */
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Selected Object
              </span>
              <h3 className="text-base font-extrabold text-stone-900">Furniture Properties</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleFurnitureLock(selectedFurniture.id)}
                className={`rounded-lg p-1.5 transition-colors ${
                  selectedFurniture.isLocked
                    ? "bg-amber-100 text-amber-800"
                    : "text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                }`}
                title={selectedFurniture.isLocked ? "Unlock item" : "Lock item in place"}
              >
                {selectedFurniture.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setSelection(null, null)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Collision Warning Banner (Phase 5 SAT Engine) */}
          {selectedFurnitureWarnings.length > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 space-y-1 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                Layout Validation Alert
              </div>
              {selectedFurnitureWarnings.map((w) => (
                <p key={w.id} className="text-[11px] text-amber-800 leading-relaxed">
                  • {w.message}
                </p>
              ))}
            </div>
          )}

          {/* Furniture Label & Category */}
          <div>
            <Input
              id="furnitureName"
              label="Item Name"
              value={selectedFurniture.name}
              onChange={(e) => updateFurniture(selectedFurniture.id, { name: e.target.value })}
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500">
              <span className="capitalize">{selectedFurniture.category.toLowerCase().replace("_", " ")}</span>
              <span className="text-[10px] text-stone-400 font-mono">ID: {selectedFurniture.id.slice(0, 8)}</span>
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Width
                </label>
                <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800">
                  {formatDimension(pxToMeters(selectedFurniture.width), unit)}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Depth / Height
                </label>
                <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800">
                  {formatDimension(pxToMeters(selectedFurniture.height), unit)}
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-stone-400 flex items-center gap-1">
              <Move className="h-3 w-3" /> Position: ({Math.round(selectedFurniture.x)}px, {Math.round(selectedFurniture.y)}px)
            </div>
          </div>

          {/* Rotation Controls */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Rotation Angle
              </label>
              <span className="text-xs font-extrabold text-[#1E3A34] font-mono">
                {Math.round(selectedFurniture.rotation)}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              value={Math.round(selectedFurniture.rotation)}
              onChange={(e) => rotateFurniture(selectedFurniture.id, Number(e.target.value), true)}
              className="w-full accent-[#1E3A34] cursor-pointer"
            />
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              <button
                onClick={() => rotateFurniture(selectedFurniture.id, -90)}
                className="flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-stone-50 py-1.5 text-[10px] font-bold text-stone-700 hover:bg-stone-100 transition-colors"
                title="Rotate 90 degrees counter-clockwise"
              >
                <RotateCcw className="h-3 w-3" /> -90°
              </button>
              <button
                onClick={() => rotateFurniture(selectedFurniture.id, 90)}
                className="flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-stone-50 py-1.5 text-[10px] font-bold text-stone-700 hover:bg-stone-100 transition-colors"
                title="Rotate 90 degrees clockwise"
              >
                <RotateCw className="h-3 w-3" /> +90°
              </button>
              <button
                onClick={() => rotateFurniture(selectedFurniture.id, 180)}
                className="rounded-lg border border-stone-200 bg-stone-50 py-1.5 text-[10px] font-bold text-stone-700 hover:bg-stone-100 transition-colors"
              >
                180°
              </button>
              <button
                onClick={() => rotateFurniture(selectedFurniture.id, 0, true)}
                className="rounded-lg border border-stone-200 bg-stone-50 py-1.5 text-[10px] font-bold text-stone-700 hover:bg-stone-100 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Furniture Finish & Color Swatches (Phase 7) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Upholstery &amp; Finish
              </label>
              <span className="text-[10px] font-bold text-stone-600 truncate max-w-[140px]">
                {FURNITURE_FINISHES.find((f) => f.color === selectedFurniture.color)?.name || selectedFurniture.material || "Finish"}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {FURNITURE_FINISHES.map((swatch) => (
                <button
                  key={swatch.id}
                  onClick={() => updateFurniture(selectedFurniture.id, { color: swatch.color, material: swatch.material })}
                  className={`h-7 rounded-lg border transition-all ${
                    selectedFurniture.color === swatch.color
                      ? "border-[#1E3A34] ring-2 ring-[#1E3A34]/30 scale-105"
                      : "border-stone-200 hover:scale-105"
                  }`}
                  style={{ backgroundColor: swatch.color }}
                  title={`${swatch.name} (${swatch.material})`}
                />
              ))}
            </div>
          </div>

          {/* Layer Arrangement Order */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Layer Arrangement (Z-Order: {selectedFurniture.zIndex || 1})
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => reorderFurnitureZIndex(selectedFurniture.id, "front")}
                className="flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white py-1.5 font-bold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <ChevronsUp className="h-3.5 w-3.5 text-stone-500" /> Bring to Front
              </button>
              <button
                onClick={() => reorderFurnitureZIndex(selectedFurniture.id, "back")}
                className="flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white py-1.5 font-bold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <ChevronsDown className="h-3.5 w-3.5 text-stone-500" /> Send to Back
              </button>
              <button
                onClick={() => reorderFurnitureZIndex(selectedFurniture.id, "forward")}
                className="flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white py-1.5 font-bold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <ArrowUp className="h-3.5 w-3.5 text-stone-500" /> Bring Forward
              </button>
              <button
                onClick={() => reorderFurnitureZIndex(selectedFurniture.id, "backward")}
                className="flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white py-1.5 font-bold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <ArrowDown className="h-3.5 w-3.5 text-stone-500" /> Send Backward
              </button>
            </div>
          </div>

          {/* Actions: Duplicate & Delete */}
          <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => duplicateFurniture(selectedFurniture.id)}
              className="flex-1 text-xs font-bold gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" /> Duplicate (Ctrl+D)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteFurniture(selectedFurniture.id)}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete (Del)
            </Button>
          </div>
        </div>
      ) : selectedDoorWindow ? (
        /* 3. DOORS & WINDOWS INSPECTOR (PHASE 5) */
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Selected Opening
              </span>
              <h3 className="text-base font-extrabold text-stone-900">
                {selectedDoorWindow.type === "DOOR" ? "Door Properties" : "Window Properties"}
              </h3>
            </div>
            <button
              onClick={() => setSelection(null, null)}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Name & Type */}
          <div>
            <Input
              id="openingName"
              label="Opening Label"
              value={selectedDoorWindow.name}
              onChange={(e) => updateDoorWindow(selectedDoorWindow.id, { name: e.target.value })}
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500">
              <span className="font-semibold text-stone-700">
                Type: {selectedDoorWindow.type === "DOOR" ? "Door (Passage)" : "Exterior Window"}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">ID: {selectedDoorWindow.id.slice(0, 8)}</span>
            </div>
          </div>

          {/* Width & Depth */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                Opening Width
              </label>
              <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800">
                {formatDimension(pxToMeters(selectedDoorWindow.width), unit)}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                Wall Thickness
              </label>
              <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800">
                {formatDimension(pxToMeters(selectedDoorWindow.height || 12), unit)}
              </div>
            </div>
          </div>

          {/* Wall Alignment & Rotation */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
              Wall Alignment &amp; Orientation
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => rotateDoorWindow(selectedDoorWindow.id, 0, true)}
                className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                  (selectedDoorWindow.rotation || 0) % 360 === 0
                    ? "bg-[#1E3A34] text-white border-[#1E3A34]"
                    : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                }`}
              >
                0° Horiz
              </button>
              <button
                onClick={() => rotateDoorWindow(selectedDoorWindow.id, 90, true)}
                className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                  (selectedDoorWindow.rotation || 0) % 360 === 90
                    ? "bg-[#1E3A34] text-white border-[#1E3A34]"
                    : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                }`}
              >
                90° Vert
              </button>
              <button
                onClick={() => rotateDoorWindow(selectedDoorWindow.id, 180, true)}
                className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                  (selectedDoorWindow.rotation || 0) % 360 === 180
                    ? "bg-[#1E3A34] text-white border-[#1E3A34]"
                    : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                }`}
              >
                180°
              </button>
              <button
                onClick={() => rotateDoorWindow(selectedDoorWindow.id, 270, true)}
                className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                  (selectedDoorWindow.rotation || 0) % 360 === 270
                    ? "bg-[#1E3A34] text-white border-[#1E3A34]"
                    : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                }`}
              >
                270°
              </button>
            </div>
          </div>

          {/* Door Swing Direction Controls (if Door) */}
          {selectedDoorWindow.type === "DOOR" && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Door Swing Direction
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => updateDoorWindow(selectedDoorWindow.id, { swing: "INSIDE_LEFT" })}
                  className={`py-2 px-2.5 rounded-lg border font-bold text-center transition-all ${
                    selectedDoorWindow.swing === "INSIDE_LEFT" || !selectedDoorWindow.swing
                      ? "bg-[#1E3A34] text-white border-[#1E3A34]"
                      : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  Inside Left
                </button>
                <button
                  onClick={() => updateDoorWindow(selectedDoorWindow.id, { swing: "INSIDE_RIGHT" })}
                  className={`py-2 px-2.5 rounded-lg border font-bold text-center transition-all ${
                    selectedDoorWindow.swing === "INSIDE_RIGHT"
                      ? "bg-[#1E3A34] text-white border-[#1E3A34]"
                      : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  Inside Right
                </button>
              </div>
            </div>
          )}

          {/* Actions: Duplicate & Delete */}
          <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => duplicateDoorWindow(selectedDoorWindow.id)}
              className="flex-1 text-xs font-bold gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteDoorWindow(selectedDoorWindow.id)}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>
      ) : (
        /* 4. PLAN OVERVIEW (Default State with Layout Quality Section) */
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Plan Overview</span>
            <h3 className="text-base font-extrabold text-stone-900 mt-0.5">{floorName}</h3>
          </div>

          {/* Big Footprint Area Banner Card */}
          <div className="rounded-2xl border border-stone-200/90 bg-[#F9F8F5] p-5 text-center shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              A space with possibilities
            </p>
            <div className="text-3xl font-black text-stone-900 mt-1">
              {totalAreaInSqM > 0 ? formatArea(totalAreaInSqM, unit) : "85.3 m²"}
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Total room footprint</p>

            <div className="mt-4 pt-3 border-t border-stone-200/60 grid grid-cols-4 text-center text-xs text-stone-600">
              <div>
                <span className="font-extrabold text-stone-900">{rooms.length}</span>
                <span className="block text-[10px] text-stone-400">rooms</span>
              </div>
              <div>
                <span className="font-extrabold text-stone-900">{furniture.length}</span>
                <span className="block text-[10px] text-stone-400">furniture</span>
              </div>
              <div>
                <span className="font-extrabold text-stone-900">{doorsWindows.length}</span>
                <span className="block text-[10px] text-stone-400">openings</span>
              </div>
              <div>
                <span className="font-extrabold text-stone-900">{floors.length}</span>
                <span className="block text-[10px] text-stone-400">{floors.length === 1 ? "floor" : "floors"}</span>
              </div>
            </div>
          </div>

          {/* Layout Quality & Collision Warnings Box (Phase 5) */}
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Geometric Validation
              </span>
              {warnings.length === 0 ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Clean Layout
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {warnings.length} Warning{warnings.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {warnings.length === 0 ? (
              <p className="text-[11px] text-stone-500">
                All furniture is within room walls with zero physical collision overlaps.
              </p>
            ) : (
              <div className="space-y-1.5 mt-2">
                {warnings.slice(0, 4).map((w) => (
                  <div
                    key={w.id}
                    onClick={() => setSelection(w.targetId, w.targetType)}
                    className="flex items-start gap-1.5 rounded-lg bg-white p-2 border border-stone-200 text-[11px] text-stone-700 hover:border-amber-400 transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{w.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* "Your rooms" list (matching reference image) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Your rooms</span>
              <span className="text-xs font-semibold text-stone-500">{rooms.length}</span>
            </div>

            <div className="space-y-1.5">
              {rooms.map((room) => {
                const roomArea = pxToMeters(room.width) * pxToMeters(room.height);
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelection(room.id, "room")}
                    className="flex items-center justify-between rounded-xl border border-stone-200/70 bg-white p-2.5 hover:border-stone-300 hover:bg-stone-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-4 w-4 rounded-md border border-stone-300 shrink-0"
                        style={{ backgroundColor: room.floorColor || "#EBDCCB" }}
                      />
                      <span className="text-xs font-bold text-stone-800">{room.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold">
                      <span>{formatArea(roomArea, unit)}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floor Settings & Multi-Floor Management (Phase 6) */}
          <div className="pt-4 border-t border-stone-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Floor Settings</span>
              <span className="text-[10px] font-bold text-stone-500">
                Story {floors.find((f) => f.id === floorId)?.floorNumber || 1} of {floors.length}
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-stone-500 mb-1">Active Floor Name</label>
              <Input
                value={floorName}
                onChange={(e) => {
                  if (floorId) updateFloorDetails(floorId, e.target.value);
                }}
                className="h-9 text-xs font-bold"
                placeholder="Floor name..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">Wall Height</label>
                <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800">
                  2.70 m
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">Thickness</label>
                <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-800">
                  0.16 m
                </div>
              </div>
            </div>

            {/* Quick Floor Actions */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => duplicateCurrentFloor()}
                  className="flex-1 text-xs font-bold gap-1.5 h-8.5"
                  title="Duplicate current floor layout with all furniture and openings"
                >
                  <Copy className="h-3.5 w-3.5 text-amber-600" />
                  <span>Duplicate Level</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addFloor()}
                  className="flex-1 text-xs font-bold gap-1.5 h-8.5 text-[#1E3A34] hover:bg-stone-50"
                  title="Add empty new story"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>+ New Level</span>
                </Button>
              </div>

              {floors.length > 1 && floorId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${floorName}? This cannot be undone.`)) {
                      deleteFloor(floorId);
                    }
                  }}
                  className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold gap-1.5 h-8"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete This Level</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
