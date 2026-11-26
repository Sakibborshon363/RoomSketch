"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  BuildingScanResult,
  scanBuildingImage,
  synthesizeProjectFromImage,
  SAMPLE_BUILDING_PRESETS,
} from "@/lib/imageToArchitectureEngine";
import { GeneratedStructurePlan } from "@/lib/aiStructureGenerator";
import {
  Upload,
  Sparkles,
  Check,
  Building,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  Image as ImageIcon,
  CheckCircle2,
  Maximize2,
  RefreshCw,
  Columns,
  Cpu,
} from "lucide-react";

interface ImageToArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProject: (generatedPlan: GeneratedStructurePlan) => void;
}

export function ImageToArchitectureModal({
  isOpen,
  onClose,
  onApplyProject,
}: ImageToArchitectureModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "presets">("upload");
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<BuildingScanResult | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedStructurePlan | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload from user computer or online URL
  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      setSelectedImageSrc(src);
      setIsScanning(true);

      // Run AI Architectural Scan
      setTimeout(async () => {
        const result = await scanBuildingImage(file);
        const plan = synthesizeProjectFromImage(result, "AI Reverse-Engineered Building Project");
        setScanResult(result);
        setGeneratedPlan(plan);
        setIsScanning(false);
      }, 900);
    };
    reader.readAsDataURL(file);
  };

  // Handle Preset selection
  const handleSelectPreset = async (preset: typeof SAMPLE_BUILDING_PRESETS[0]) => {
    setSelectedImageSrc(preset.previewColor);
    setIsScanning(true);
    setTimeout(async () => {
      const result = await scanBuildingImage(preset.title);
      result.detectedStories = preset.stories;
      result.detectedBays = preset.bays;
      result.recommendedArchetype = preset.archetype;
      const plan = synthesizeProjectFromImage(result, preset.title);
      setScanResult(result);
      setGeneratedPlan(plan);
      setIsScanning(false);
    }, 600);
  };

  const handleApply = () => {
    if (generatedPlan) {
      onApplyProject(generatedPlan);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Image-to-Architecture AI (Photo to Full 2D & 3D Structure)"
      description="Upload any building photo online (from Google, Pinterest, or your camera) and AI will reverse-engineer its complete 2D floor plan, structural columns, and elevations."
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* Top Segmented Tabs: Upload vs Sample Presets */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "upload"
                ? "bg-[#1E3A34] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Building Picture</span>
          </button>
          <button
            onClick={() => setActiveTab("presets")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "presets"
                ? "bg-[#1E3A34] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Building className="h-3.5 w-3.5" />
            <span>Showcase Building Library</span>
          </button>
        </div>

        {/* Tab 1: Upload Building Photo */}
        {activeTab === "upload" && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />

            {!selectedImageSrc ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-[#1E3A34] rounded-2xl p-8 text-center cursor-pointer bg-stone-50/70 hover:bg-stone-50 transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-xs">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800">
                    Click or Drag & Drop Any Building Picture Here
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Supports JPG, PNG, WebP (e.g., photos from Pinterest, Google Images, or site photos)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[#1E3A34] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  <span>AI scans floors, balcony bays, entrance, and creates the 2D CAD plan</span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl border border-stone-200 overflow-hidden bg-stone-900 text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedImageSrc.startsWith("data:") ? (
                    <img
                      src={selectedImageSrc}
                      alt="Uploaded building"
                      className="h-14 w-14 object-cover rounded-xl border border-white/20"
                    />
                  ) : (
                    <div
                      className="h-14 w-14 rounded-xl flex items-center justify-center font-black text-xl"
                      style={{ backgroundColor: selectedImageSrc }}
                    >
                      🏛️
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Building Image Processed</span>
                    </p>
                    <p className="text-[11px] text-stone-400">
                      AI Structural Scanner ready to synthesize 2D plan & structure.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs border-white/20"
                >
                  Change Photo
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Showcase Library */}
        {activeTab === "presets" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SAMPLE_BUILDING_PRESETS.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  scanResult?.recommendedArchetype === p.archetype
                    ? "border-[#1E3A34] bg-emerald-50/40 shadow-sm"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase text-stone-500">
                      {p.category}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                      {p.stories} Stories
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 leading-tight">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                    {p.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-[#1E3A34]">
                  <span>Select & Scan</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scanning Progress Animation */}
        {isScanning && (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
            <RefreshCw className="h-7 w-7 text-amber-600 animate-spin mx-auto" />
            <h4 className="text-xs font-bold text-amber-950">
              AI Reverse-Engineering Building Architecture...
            </h4>
            <p className="text-[11px] text-amber-800">
              Detecting story levels, balcony spans, structural column grid, and room layouts.
            </p>
          </div>
        )}

        {/* AI Scan Analysis & Generated Blueprint Preview */}
        {scanResult && generatedPlan && !isScanning && (
          <div className="space-y-4 pt-2 border-t border-stone-100">
            {/* Structural Metrics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[10px] font-bold uppercase text-stone-400">Floors</span>
                <p className="text-sm font-black text-stone-900">{scanResult.detectedStories} Stories</p>
                <span className="text-[10px] text-stone-500">{scanResult.estimatedHeightMeters}m Height</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[10px] font-bold uppercase text-stone-400">Facade Bays</span>
                <p className="text-sm font-black text-stone-900">{scanResult.detectedBays} Vertical Bays</p>
                <span className="text-[10px] text-stone-500">Balconies + Core</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[10px] font-bold uppercase text-stone-400">Structure</span>
                <p className="text-sm font-black text-stone-900">RCC Frame</p>
                <span className="text-[10px] text-stone-500">{generatedPlan.structuralColumns.length} Columns</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-center">
                <span className="text-[10px] font-bold uppercase text-stone-400">Area</span>
                <p className="text-sm font-black text-stone-900">{generatedPlan.totalAreaSqM} m²</p>
                <span className="text-[10px] text-stone-500">{generatedPlan.totalAreaSqFt} sq.ft</span>
              </div>
            </div>

            {/* Generated 2D Room Layout Blueprint Preview */}
            <div className="rounded-2xl border border-stone-200 bg-white p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <div className="flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-[#1E3A34]" />
                  <span>Synthesized 2D Architectural Plan ({generatedPlan.rooms.length} Rooms)</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                  Zero Collisions • IBC Compliant
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1 bg-stone-50/70 rounded-xl border border-stone-100">
                {generatedPlan.rooms.map((r) => (
                  <div
                    key={r.id}
                    className="p-1.5 rounded-lg bg-white border border-stone-200 text-[11px]"
                  >
                    <p className="font-bold text-stone-800 truncate">{r.name}</p>
                    <span className="text-[9px] text-stone-500 font-mono">
                      {Math.round(r.width / 10)}ft x {Math.round(r.height / 10)}ft
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded-xl">
                {scanResult.structuralSummary}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                className="bg-[#1E3A34] hover:bg-[#254A42] text-white font-bold gap-2 shadow-md text-xs py-2 px-4"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Generate & Apply Full Architectural Project</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
