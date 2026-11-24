"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useEditorStore } from "@/store/editorStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import {
  Compass,
  ArrowLeft,
  Undo2,
  Redo2,
  Grid,
  Ruler,
  Download,
  Share2,
  Plus,
  Check,
  ChevronDown,
  Layers,
  Sparkles,
  HelpCircle,
  Calculator,
} from "lucide-react";

interface EditorToolbarProps {
  onExportPng: () => void;
  onExportPdf: () => void;
  onShare: () => void;
  onOpenShortcuts?: () => void;
  onOpenBoQ?: () => void;
}

export function EditorToolbar({
  onExportPng,
  onExportPdf,
  onShare,
  onOpenShortcuts,
  onOpenBoQ,
}: EditorToolbarProps) {
  const {
    projectName,
    floorName,
    floors,
    switchFloor,
    addFloor,
    duplicateCurrentFloor,
    saveStatus,
    saveCurrentLayout,
    lastSavedAt,
    undo,
    redo,
    history,
    showGrid,
    setShowGrid,
    showMeasurements,
    setShowMeasurements,
  } = useEditorStore();

  const { user } = useAuthStore();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [floorMenuOpen, setFloorMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-stone-200/90 bg-[#FBFBFA]/95 px-4 sm:px-6 backdrop-blur-md select-none">
      {/* Left: Brand, Project Name & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-stone-500" />
          <span>Projects</span>
        </Link>

        <div className="h-4 w-px bg-stone-200 hidden sm:block" />

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-stone-900 leading-none">{projectName}</h1>
            <span className="text-[10px] text-stone-400">▾</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
            <span>Personal workspace</span>
            <span>/</span>
            <span className="text-stone-600 font-medium">{floorName}</span>
          </div>
        </div>

        {/* Live Cloud Save Status */}
        <button
          onClick={() => saveCurrentLayout()}
          title={lastSavedAt ? `Last saved at ${lastSavedAt.toLocaleTimeString()}. Click to force save now.` : "Click to save layout"}
          className="hidden lg:flex items-center gap-1.5 ml-3 pl-3 border-l border-stone-200 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              saveStatus === "saved"
                ? "bg-emerald-500"
                : saveStatus === "saving"
                ? "bg-amber-500 animate-pulse"
                : "bg-stone-400"
            }`}
          />
          <span>
            {saveStatus === "saved"
              ? lastSavedAt
                ? `Saved (${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })})`
                : "Saved in cloud"
              : saveStatus === "saving"
              ? "Saving layout..."
              : "Unsaved changes"}
          </span>
        </button>
      </div>

      {/* Center: Floor Switcher, 2D/3D Mode, Grid/Ruler Toggles */}
      <div className="hidden md:flex items-center gap-2">
        {/* Floor Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setFloorMenuOpen(!floorMenuOpen)}
            className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-800 hover:border-stone-300 transition-colors shadow-xs"
          >
            <Layers className="h-3.5 w-3.5 text-stone-500" />
            <span>{floorName}</span>
            <span className="rounded-md bg-stone-100 px-1.5 py-0.2 text-[10px] text-stone-500">
              {floors.length}
            </span>
            <ChevronDown className="h-3 w-3 text-stone-400" />
          </button>

          {floorMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setFloorMenuOpen(false)} />
              <div className="absolute left-0 top-full mt-1.5 z-40 w-52 rounded-xl border border-stone-200 bg-white py-1.5 shadow-lg">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Select Floor ({floors.length})
                </div>
                {floors.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFloorMenuOpen(false);
                      switchFloor(f.id);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-600">
                        L{f.floorNumber}
                      </span>
                      <span>{f.name}</span>
                    </div>
                    {f.name === floorName && <Check className="h-3.5 w-3.5 text-[#1E3A34]" />}
                  </button>
                ))}

                <div className="my-1 border-t border-stone-100" />

                <button
                  onClick={() => {
                    setFloorMenuOpen(false);
                    addFloor();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#1E3A34] hover:bg-stone-50 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New Floor</span>
                </button>
                <button
                  onClick={() => {
                    setFloorMenuOpen(false);
                    duplicateCurrentFloor();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>Duplicate This Floor</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* 2D / 3D Mode Switcher (Matching Reference Image) */}
        <div className="flex items-center rounded-xl border border-stone-200 bg-stone-100/80 p-0.5 text-xs font-bold text-stone-600">
          <span className="rounded-lg bg-white px-3 py-1 text-stone-900 shadow-xs">2D</span>
          <span className="px-3 py-1 text-stone-400 cursor-not-allowed flex items-center gap-1">
            3D <span className="text-[9px] uppercase font-bold text-[#1E3A34]">Beta</span>
          </span>
          <span className="px-2.5 py-1 text-stone-400 cursor-not-allowed">Split</span>
        </div>

        {/* Grid & Ruler Measurement Toggles */}
        <div className="flex items-center gap-1 border-l border-stone-200 pl-2">
          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className={`rounded-lg p-2 transition-colors ${
              showMeasurements
                ? "bg-[#1E3A34] text-white"
                : "text-stone-500 hover:bg-stone-100"
            }`}
            title="Toggle Dimension Lines"
          >
            <Ruler className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`rounded-lg p-2 transition-colors ${
              showGrid
                ? "bg-[#1E3A34] text-white"
                : "text-stone-500 hover:bg-stone-100"
            }`}
            title="Toggle Grid Background"
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Right: Undo/Redo, Export, Share & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <button
          onClick={undo}
          disabled={history.past.length === 0}
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={redo}
          disabled={history.future.length === 0}
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </button>

        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
            title="Keyboard Shortcuts & Gestures (?)"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        )}

        <div className="h-4 w-px bg-stone-200 hidden sm:block" />

        {/* Cost & BoQ Button */}
        {onOpenBoQ && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenBoQ}
            className="text-xs font-bold gap-1.5 h-9 border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300"
            title="Bill of Quantities & Material Cost Estimator"
          >
            <Calculator className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Cost / BoQ</span>
          </Button>
        )}

        {/* Share Button */}
        <Button variant="outline" size="sm" onClick={onShare} className="text-xs font-bold gap-1.5 h-9">
          <Share2 className="h-3.5 w-3.5 text-stone-500" />
          <span className="hidden sm:inline">Share</span>
        </Button>

        {/* Export Dropdown Button */}
        <div className="relative">
          <Button
            size="sm"
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="bg-[#1E3A34] hover:bg-[#254A42] text-white text-xs font-bold gap-1.5 h-9 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
            <ChevronDown className="h-3 w-3" />
          </Button>

          {exportMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setExportMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 z-40 w-44 rounded-xl border border-stone-200 bg-white py-1.5 shadow-lg">
                <button
                  onClick={() => {
                    setExportMenuOpen(false);
                    onExportPng();
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <Download className="h-3.5 w-3.5 text-stone-400" /> Export PNG Image
                </button>
                <button
                  onClick={() => {
                    setExportMenuOpen(false);
                    onExportPdf();
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <Download className="h-3.5 w-3.5 text-stone-400" /> Export Architectural PDF
                </button>
              </div>
            </>
          )}
        </div>

        {/* User Avatar */}
        <Link href="/profile">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A34] text-xs font-bold text-white shadow-xs">
            {user?.firstName?.[0] || "U"}
          </div>
        </Link>
      </div>
    </header>
  );
}
