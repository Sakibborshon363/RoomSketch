"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { RoomItem, FurnitureItem, DoorWindowItem, FloorLayoutData, UnitSystem } from "@/types/editor";
import { formatArea, formatDimension } from "@/lib/utils";
import {
  Compass,
  Layers,
  Grid,
  Ruler,
  Maximize2,
  RotateCcw,
  Sparkles,
  Loader2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Check,
} from "lucide-react";


// Dynamically import Konva components for client-side rendering
const ReadOnlyStage = dynamic(
  () => import("@/components/shared/SharedCanvasViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#FBFBFA]">
        <div className="flex flex-col items-center gap-2 text-stone-400">
          <Loader2 className="h-7 w-7 animate-spin text-[#1E3A34]" />
          <span className="text-xs font-semibold">Loading 2D floor plan...</span>
        </div>
      </div>
    ),
  }
);

interface SharedFloor {
  id: string;
  name: string;
  floorNumber: number;
  layoutData: string;
}

interface SharedProjectData {
  id: string;
  name: string;
  description: string;
  unitSystem: UnitSystem;
  designerName: string;
  floors: SharedFloor[];
  createdAt: string;
}

export default function SharedFloorPlanPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<SharedProjectData | null>(null);
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);

  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [floorMenuOpen, setFloorMenuOpen] = useState(false);

  useEffect(() => {
    if (!token) return;

    api
      .get(`/shared/${token}`)
      .then((res) => {
        if (res.data?.success) {
          const data = res.data.data as SharedProjectData;
          setProject(data);
          if (data.floors && data.floors.length > 0) {
            setActiveFloorId(data.floors[0].id);
          }
        } else {
          setError("This shared design could not be found.");
        }
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "This shared floor plan link is invalid, expired, or has been revoked by the designer."
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBFBFA]">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E3A34]" />
          <p className="text-sm font-bold">Opening Architectural Plan...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FBFBFA] px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 border border-rose-200">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-extrabold text-stone-900">Floor Plan Unavailable</h1>
        <p className="text-xs text-stone-500 max-w-md mt-1.5 leading-relaxed">{error}</p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-[#1E3A34] px-4 py-2 text-xs font-bold text-white hover:bg-[#254A42] transition-colors"
        >
          Explore RoomSketch
        </Link>
      </div>
    );
  }

  const activeFloor = project.floors.find((f) => f.id === activeFloorId) || project.floors[0];

  let layoutData: FloorLayoutData = {
    version: 1,
    unit: project.unitSystem || "METERS",
    gridSize: 20,
    rooms: [],
    furniture: [],
    doorsWindows: [],
  };

  if (activeFloor?.layoutData) {
    try {
      layoutData =
        typeof activeFloor.layoutData === "string"
          ? JSON.parse(activeFloor.layoutData)
          : activeFloor.layoutData;
    } catch (e) {
      console.error("Error parsing layoutData", e);
    }
  }

  const pxToMeters = (px: number) => px * 0.04;
  const totalArea = layoutData.rooms.reduce(
    (acc, r) => acc + pxToMeters(r.width) * pxToMeters(r.height),
    0
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#FBFBFA] text-stone-900 select-none">
      {/* Top Header */}
      <header className="flex h-16 w-full items-center justify-between border-b border-stone-200/90 bg-[#FBFBFA]/95 px-4 sm:px-6 backdrop-blur-md">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E3A34] text-white shadow-xs">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-stone-900 leading-none">{project.name}</h1>
              <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[9px] font-bold text-stone-600 uppercase">
                Read-Only
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Designed by <strong className="font-semibold text-stone-700">{project.designerName}</strong>
            </p>
          </div>
        </div>

        {/* Center: Floor Switcher (if multi-floor) & View Toggles */}
        <div className="flex items-center gap-2">
          {project.floors.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setFloorMenuOpen(!floorMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-800 hover:border-stone-300 transition-colors shadow-xs"
              >
                <Layers className="h-3.5 w-3.5 text-stone-500" />
                <span>{activeFloor?.name}</span>
                <ChevronDown className="h-3 w-3 text-stone-400" />
              </button>

              {floorMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setFloorMenuOpen(false)} />
                  <div className="absolute left-0 top-full mt-1.5 z-40 w-44 rounded-xl border border-stone-200 bg-white py-1.5 shadow-lg">
                    {project.floors.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setActiveFloorId(f.id);
                          setFloorMenuOpen(false);
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                      >
                        <span>{f.name}</span>
                        {f.id === activeFloor?.id && <Check className="h-3.5 w-3.5 text-[#1E3A34]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Dimension Lines Toggle */}
          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className={`rounded-xl border p-2 transition-colors ${
              showMeasurements
                ? "border-[#1E3A34] bg-[#1E3A34] text-white"
                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            }`}
            title="Toggle Dimension Lines"
          >
            <Ruler className="h-4 w-4" />
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`rounded-xl border p-2 transition-colors ${
              showGrid
                ? "border-[#1E3A34] bg-[#1E3A34] text-white"
                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            }`}
            title="Toggle Grid"
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>

        {/* Right: CTA to RoomSketch */}
        <div className="flex items-center gap-2">
          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-xl bg-[#1E3A34] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#254A42] transition-colors shadow-xs"
          >
            <span>Design Your Space</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Main 2D Viewer Stage */}
      <main className="relative flex-1 overflow-hidden">
        <ReadOnlyStage
          layoutData={layoutData}
          unit={project.unitSystem}
          showGrid={showGrid}
          showMeasurements={showMeasurements}
        />

        {/* Floating Layout Stats Badge */}
        <div className="absolute bottom-5 left-5 z-20 flex items-center gap-3 rounded-2xl border border-stone-200/90 bg-white/95 px-4 py-2.5 shadow-md backdrop-blur-sm">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Footprint</div>
            <div className="text-sm font-extrabold text-stone-900">
              {formatArea(totalArea, project.unitSystem)}
            </div>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div className="text-xs text-stone-600 font-semibold">
            {layoutData.rooms.length} Rooms  •  {layoutData.furniture.length} Items
          </div>
        </div>
      </main>
    </div>
  );
}
