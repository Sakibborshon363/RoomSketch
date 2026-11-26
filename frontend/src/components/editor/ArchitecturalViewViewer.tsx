"use client";

import React, { useState, useMemo, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import {
  computeElevationModel,
  ElevationOrientation,
  REFERENCE_RESIDENTIAL_PLAN,
} from "@/lib/elevationEngine";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Sparkles,
  Download,
  Upload,
  Sun,
  Moon,
  Sunset,
  Layers,
  Image as ImageIcon,
  Building,
  Check,
  Eye,
  Sliders,
  Palette,
  Camera,
  Maximize2,
  Columns,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

export type FacadeStyle =
  | "CONTEMPORARY_RESIDENTIAL" // Image 3 Match: Teak wood, aluminum frames, warm sconces
  | "MODERN_MINIMALIST"
  | "LUXURY_VILLA"
  | "SCANDINAVIAN_TIMBER";

export type LightingMode = "DUSK" | "DAYLIGHT" | "NIGHT";

export function ArchitecturalViewViewer() {
  const {
    rooms,
    doorsWindows,
    projectName,
    unit,
    viewMode,
    setViewMode,
    addBatchRooms,
    addDoorWindow,
  } = useEditorStore();

  // Architectural View State
  const [facadeStyle, setFacadeStyle] = useState<FacadeStyle>("CONTEMPORARY_RESIDENTIAL");
  const [lightingMode, setLightingMode] = useState<LightingMode>("DUSK");
  const [storyCount, setStoryCount] = useState<number>(5);
  const [orientation, setOrientation] = useState<ElevationOrientation>("FRONT");
  const [showRooftopGarden, setShowRooftopGarden] = useState<boolean>(true);
  const [showSconceLights, setShowSconceLights] = useState<boolean>(true);
  const [showGroundLandscaping, setShowGroundLandscaping] = useState<boolean>(true);
  const [showPlanOverlay, setShowPlanOverlay] = useState<boolean>(false);
  const [splitView, setSplitView] = useState<boolean>(false);

  // Custom User Upload Reference from Any Source
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const [customImageOpacity, setCustomImageOpacity] = useState<number>(0.85);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute CAD Elevation Data for parametric alignment
  const elevationModel = useMemo(() => {
    return computeElevationModel(rooms, doorsWindows, {
      orientation,
      storyCount,
      projectName: projectName || "RESIDENTIAL BUILDING",
      unit,
    });
  }, [rooms, doorsWindows, orientation, storyCount, projectName, unit]);

  // Handle Custom Image Upload from any external source (Google, Pinterest, photos)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset Style Palettes
  const styleConfig = useMemo(() => {
    switch (facadeStyle) {
      case "CONTEMPORARY_RESIDENTIAL":
        return {
          name: "Contemporary Multi-Story Residential (Blueprint Reference)",
          wallColor: "#EAE7DF",
          accentColor: "#C28952", // Teak Wood Panel
          accentName: "Natural Teak Cladding",
          trimColor: "#2A2A2A",
          glassTint: "rgba(180, 215, 235, 0.45)",
          warmGlow: "#FBBF24",
          roofStyle: "Terrace Garden & Steel Pergola",
        };
      case "MODERN_MINIMALIST":
        return {
          name: "Modern Minimalist & Bauhaus",
          wallColor: "#F4F4F5",
          accentColor: "#3F3F46", // Dark Anthracite Zinc
          accentName: "Anthracite Zinc Composite",
          trimColor: "#18181B",
          glassTint: "rgba(224, 242, 254, 0.35)",
          warmGlow: "#FEF08A",
          roofStyle: "Clean Parapet & Glass Balustrade",
        };
      case "LUXURY_VILLA":
        return {
          name: "Luxury Urban Villa",
          wallColor: "#E8E2D5", // Travertine Stone
          accentColor: "#9A7B56", // Champagne Bronze
          accentName: "Champagne Bronze Louvers",
          trimColor: "#3E3832",
          glassTint: "rgba(195, 220, 240, 0.5)",
          warmGlow: "#F59E0B",
          roofStyle: "Penthouse Sunroom & Pergola",
        };
      case "SCANDINAVIAN_TIMBER":
        return {
          name: "Nordic Scandinavian Timber",
          wallColor: "#DFE3E6",
          accentColor: "#B46F46", // Cedar Slat
          accentName: "Vertical Cedar Slatting",
          trimColor: "#27272A",
          glassTint: "rgba(200, 230, 245, 0.4)",
          warmGlow: "#FDE68A",
          roofStyle: "Green Sedum Living Roof",
        };
    }
  }, [facadeStyle]);

  // Lighting Colors
  const lightingConfig = useMemo(() => {
    switch (lightingMode) {
      case "DUSK":
        return {
          skyGradient: "from-sky-300 via-amber-100 to-rose-200",
          ambientFilter: "brightness(0.96) contrast(1.05) saturate(1.1)",
          interiorLightOpacity: 0.9,
          sconceGlowOpacity: 0.85,
          skyDesc: "Golden Hour Dusk (Sunset Glow & Exterior Sconces)",
        };
      case "DAYLIGHT":
        return {
          skyGradient: "from-sky-400 via-sky-200 to-sky-100",
          ambientFilter: "brightness(1.05) contrast(1.0) saturate(1.0)",
          interiorLightOpacity: 0.35,
          sconceGlowOpacity: 0.0,
          skyDesc: "Crisp Daylight (Natural Sunlight & Crisp Shadows)",
        };
      case "NIGHT":
        return {
          skyGradient: "from-slate-950 via-slate-900 to-indigo-950",
          ambientFilter: "brightness(0.7) contrast(1.15) saturate(1.2)",
          interiorLightOpacity: 1.0,
          sconceGlowOpacity: 1.0,
          skyDesc: "Architectural Night View (Dramatic Façade Illumination)",
        };
    }
  }, [lightingMode]);

  // SVG Geometry Dimensions for Architectural Elevation Render
  const SVG_WIDTH = 1350;
  const SVG_HEIGHT = 920;
  const ORIGIN_X = 260;
  const ORIGIN_Y = 700;
  const SCALE_X = 870 / Math.max(30, elevationModel.totalWidthFeet);
  const SCALE_Y = 540 / elevationModel.totalHeightFeet;

  const toSvgX = (feet: number) => ORIGIN_X + feet * SCALE_X;
  const toSvgY = (feet: number) => ORIGIN_Y - feet * SCALE_Y;

  const groundY = toSvgY(0);
  const plinthY = toSvgY(elevationModel.plinthHeightFeet);
  const buildingLeft = toSvgX(0);
  const buildingRight = toSvgX(elevationModel.totalWidthFeet);
  const buildingWidth = buildingRight - buildingLeft;

  // AI Façade Recommendation based on 2D room plan layout
  const aiRecommendation = useMemo(() => {
    const bayCount = elevationModel.bays.length;
    const hasVoid = elevationModel.hasCentralVoid;
    const balconyBays = elevationModel.bays.filter((b) => b.hasBalcony).length;

    let text = `Detected ${bayCount} vertical architectural bays with ${balconyBays} balcony zones and ${storyCount} stories.`;
    if (hasVoid) {
      text += ` Central void core provides natural vertical ventilation and structural rhythm matching the residential blueprint.`;
    }
    return text;
  }, [elevationModel, storyCount]);

  // Export Architectural Presentation Sheet
  const handleExportSheet = () => {
    const svgElem = document.getElementById("architectural-facade-svg");
    if (!svgElem) return;
    const svgData = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName || "Residential_Building"}_Architectural_Elevation_${facadeStyle}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-stone-100 select-none">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white/95 px-4 py-2.5 backdrop-blur-md shadow-xs">
        {/* Left: Navigation & Mode Switcher */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setViewMode("ELEVATION_CAD")}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold gap-1.5 border border-stone-200"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-stone-500" />
            <span>CAD Technical Elevation</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setViewMode("2D")}
            className="bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-semibold"
          >
            2D Floor Plan
          </Button>

          <div className="h-4 w-px bg-stone-200" />

          {/* Architectural Styles Dropdown / Selector */}
          <div className="flex items-center gap-1.5 bg-stone-100 rounded-xl p-0.5 text-xs font-bold">
            <button
              onClick={() => setFacadeStyle("CONTEMPORARY_RESIDENTIAL")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                facadeStyle === "CONTEMPORARY_RESIDENTIAL"
                  ? "bg-[#1E3A34] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Contemporary (Image 3)
            </button>
            <button
              onClick={() => setFacadeStyle("MODERN_MINIMALIST")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                facadeStyle === "MODERN_MINIMALIST"
                  ? "bg-[#1E3A34] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Minimalist
            </button>
            <button
              onClick={() => setFacadeStyle("LUXURY_VILLA")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                facadeStyle === "LUXURY_VILLA"
                  ? "bg-[#1E3A34] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Luxury Villa
            </button>
            <button
              onClick={() => setFacadeStyle("SCANDINAVIAN_TIMBER")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                facadeStyle === "SCANDINAVIAN_TIMBER"
                  ? "bg-[#1E3A34] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Nordic Timber
            </button>
          </div>
        </div>

        {/* Center: Lighting Presets (Dusk / Day / Night) */}
        <div className="hidden md:flex items-center gap-1 bg-stone-100 rounded-xl p-0.5 text-xs font-bold text-stone-600">
          <button
            onClick={() => setLightingMode("DUSK")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
              lightingMode === "DUSK"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
            title="Dusk / Golden Hour with glowing architectural wall sconces"
          >
            <Sunset className="h-3.5 w-3.5" />
            <span>Dusk</span>
          </button>
          <button
            onClick={() => setLightingMode("DAYLIGHT")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
              lightingMode === "DAYLIGHT"
                ? "bg-sky-500 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
            title="Crisp Daylight with sun and blue sky"
          >
            <Sun className="h-3.5 w-3.5" />
            <span>Daylight</span>
          </button>
          <button
            onClick={() => setLightingMode("NIGHT")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
              lightingMode === "NIGHT"
                ? "bg-indigo-900 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
            title="Night Façade Illumination"
          >
            <Moon className="h-3.5 w-3.5" />
            <span>Night</span>
          </button>
        </div>

        {/* Right: Upload External Reference, Split View, & Export */}
        <div className="flex items-center gap-2">
          {/* Upload Image From Any Source Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold gap-1.5 border border-stone-200"
            title="Upload architectural elevation image from Google, Pinterest or any source to match or compare"
          >
            <Upload className="h-3.5 w-3.5 text-amber-600" />
            <span>{customImageSrc ? "Replace Ref Image" : "Upload Image Ref"}</span>
          </Button>

          {/* Toggle Split View / Compare with 2D */}
          <button
            onClick={() => setSplitView(!splitView)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              splitView
                ? "bg-[#1E3A34] text-white border-[#1E3A34]"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
            title="Compare 2D Floor Plan and 3D Architectural View Side-by-Side"
          >
            <Columns className="h-3.5 w-3.5" />
            <span>Compare 2D/3D</span>
          </button>

          {/* Export Presentation Sheet */}
          <Button
            size="sm"
            onClick={handleExportSheet}
            className="bg-[#1E3A34] hover:bg-[#254A42] text-white text-xs font-bold gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Presentation Sheet</span>
          </Button>
        </div>
      </header>

      {/* AI Suggestion Banner */}
      <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-1.5 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span className="font-bold">AI Façade Suggestion:</span>
          <span className="text-stone-700">{aiRecommendation}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-amber-800 font-semibold">
          <span>Style: {styleConfig.name}</span>
          <span>•</span>
          <span>Lighting: {lightingConfig.skyDesc}</span>
        </div>
      </div>

      {/* Main Workspace Area: Split View or Full Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: 2D Floor Plan Preview (if Split View is enabled) */}
        {splitView && (
          <div className="w-1/3 border-r border-stone-200 bg-white p-4 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                2D Floor Plan Reference
              </h3>
              <span className="text-[10px] font-mono text-stone-500">
                {rooms.length} Rooms • {doorsWindows.length} Openings
              </span>
            </div>
            <div className="mt-3 flex-1 flex flex-col items-center justify-center border border-dashed border-stone-200 rounded-xl bg-stone-50 p-4">
              <p className="text-xs text-stone-500 text-center mb-2">
                Floor Plan Bays align parametrically with the Façade Elevation.
              </p>
              <div className="space-y-1.5 w-full">
                {elevationModel.bays.map((bay) => (
                  <div
                    key={bay.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200 text-xs"
                  >
                    <span className="font-bold text-stone-800">{bay.label}</span>
                    <span className="text-[10px] font-mono text-stone-500">
                      {bay.widthFormatted}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Center / Right Side: Main Architectural Exterior Façade Canvas */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <svg
            id="architectural-facade-svg"
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full max-w-[1240px] max-h-[820px] bg-white shadow-2xl rounded-sm border border-stone-300 font-sans"
            style={{ shapeRendering: "geometricPrecision" }}
          >
            <defs>
              {/* Photorealistic Soft Architectural Drop Shadows */}
              <filter id="facade-shadow" x="-5%" y="-5%" width="120%" height="130%">
                <feDropShadow dx="4" dy="8" stdDeviation="6" floodOpacity="0.32" floodColor="#0F172A" />
              </filter>
              <filter id="balcony-deep-shadow" x="-5%" y="0%" width="120%" height="200%">
                <feDropShadow dx="3" dy="12" stdDeviation="5" floodOpacity="0.4" floodColor="#090D16" />
              </filter>
              <filter id="warm-sconce-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="12" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Sky Background Gradients */}
              <linearGradient id="sky-dusk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7DD3FC" />
                <stop offset="40%" stopColor="#FED7AA" />
                <stop offset="85%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#FEF08A" />
              </linearGradient>

              <linearGradient id="sky-daylight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="60%" stopColor="#BAE6FD" />
                <stop offset="100%" stopColor="#E0F2FE" />
              </linearGradient>

              <linearGradient id="sky-night" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="60%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#1E1B4B" />
              </linearGradient>

              {/* Teak Wood Cladding Pattern (Image 3) */}
              <pattern id="teak-wood-slats" width="100" height="8" patternUnits="userSpaceOnUse">
                <rect width="100" height="8" fill={styleConfig.accentColor} />
                <line x1="0" y1="8" x2="100" y2="8" stroke="#8D5B2F" strokeWidth="1" />
              </pattern>

              {/* Vertical Louver Pattern */}
              <pattern id="vertical-louvers" width="6" height="100" patternUnits="userSpaceOnUse">
                <line x1="3" y1="0" x2="3" y2="100" stroke="#334155" strokeWidth="2" />
              </pattern>
            </defs>

            {/* 1. ARCHITECTURAL PRESENTATION SHEET BORDER */}
            <rect
              x="20"
              y="20"
              width={SVG_WIDTH - 40}
              height={SVG_HEIGHT - 40}
              fill="#FFFFFF"
              stroke="#1E293B"
              strokeWidth="2.5"
            />
            <rect
              x="28"
              y="28"
              width={SVG_WIDTH - 56}
              height={SVG_HEIGHT - 56}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="0.8"
            />

            {/* 2. SKY ENVIRONMENT BACKGROUND (Inside Drawing Frame) */}
            <rect
              x="30"
              y="30"
              width={SVG_WIDTH - 60}
              height={groundY - 30}
              fill={
                lightingMode === "DUSK"
                  ? "url(#sky-dusk)"
                  : lightingMode === "DAYLIGHT"
                  ? "url(#sky-daylight)"
                  : "url(#sky-night)"
              }
            />

            {/* Soft Clouds in Sky */}
            {lightingMode !== "NIGHT" && (
              <g id="sky-clouds" opacity="0.45">
                <ellipse cx="280" cy="90" rx="90" ry="22" fill="#FFFFFF" />
                <ellipse cx="320" cy="80" rx="60" ry="26" fill="#FFFFFF" />
                <ellipse cx="1020" cy="110" rx="110" ry="24" fill="#FFFFFF" />
                <ellipse cx="980" cy="100" rx="70" ry="28" fill="#FFFFFF" />
              </g>
            )}

            {/* Background Neighboring Trees (Image 3) */}
            <g id="surrounding-trees" opacity="0.85">
              <circle cx={buildingLeft - 60} cy={groundY - 140} r="55" fill="#15803D" />
              <circle cx={buildingLeft - 95} cy={groundY - 100} r="48" fill="#166534" />
              <circle cx={buildingLeft - 30} cy={groundY - 80} r="40" fill="#14532D" />
              <rect x={buildingLeft - 70} y={groundY - 80} width="16" height="80" fill="#78350F" />

              <circle cx={buildingRight + 60} cy={groundY - 140} r="55" fill="#15803D" />
              <circle cx={buildingRight + 95} cy={groundY - 100} r="48" fill="#166534" />
              <circle cx={buildingRight + 30} cy={groundY - 80} r="40" fill="#14532D" />
              <rect x={buildingRight + 55} y={groundY - 80} width="16" height="80" fill="#78350F" />
            </g>

            {/* 3. GROUND / STREET LEVEL (Roadway & Sidewalk matching Image 3) */}
            <g id="ground-street">
              {/* Dark Asphalt Street in foreground */}
              <rect
                x="30"
                y={groundY}
                width={SVG_WIDTH - 60}
                height={SVG_HEIGHT - groundY - 100}
                fill="#334155"
              />
              {/* White Road Surface Dividing Line */}
              <line
                x1="30"
                y1={groundY + 45}
                x2={SVG_WIDTH - 30}
                y2={groundY + 45}
                stroke="#64748B"
                strokeWidth="1.5"
                strokeDasharray="30 20"
              />
              {/* Concrete Curb & Sidewalk */}
              <rect
                x="30"
                y={groundY - 14}
                width={SVG_WIDTH - 60}
                height="14"
                fill="#E2E8F0"
                stroke="#64748B"
                strokeWidth="1"
              />
              {/* Sidewalk Tile Joints */}
              {Array.from({ length: 30 }).map((_, si) => (
                <line
                  key={`sidewalk-joint-${si}`}
                  x1={40 + si * 42}
                  y1={groundY - 14}
                  x2={40 + si * 42}
                  y2={groundY}
                  stroke="#94A3B8"
                  strokeWidth="0.8"
                />
              ))}

              {/* Front Sidewalk Landscaping Shrubs (Image 3) */}
              {showGroundLandscaping && (
                <g id="ground-shrubs">
                  {Array.from({ length: 24 }).map((_, shi) => (
                    <circle
                      key={`shrub-${shi}`}
                      cx={buildingLeft + 16 + shi * 36}
                      cy={groundY - 12}
                      r="11"
                      fill={shi % 2 === 0 ? "#16A34A" : "#15803D"}
                    />
                  ))}
                </g>
              )}
            </g>

            {/* 4. PHOTOREALISTIC ARCHITECTURAL BUILDING ELEVATION */}
            {/* Custom Image Overlay mode if user uploaded external reference */}
            {customImageSrc && (
              <image
                href={customImageSrc}
                x={buildingLeft - 10}
                y={toSvgY(elevationModel.totalHeightFeet)}
                width={buildingWidth + 20}
                height={groundY - toSvgY(elevationModel.totalHeightFeet)}
                preserveAspectRatio="none"
                opacity={customImageOpacity}
              />
            )}

            <g id="architectural-facade-structure" style={{ filter: customImageSrc ? "none" : undefined }}>
              {/* Main Exterior Building Mass / Plaster Façade */}
              <rect
                x={buildingLeft}
                y={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet)}
                width={buildingWidth}
                height={plinthY - toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet)}
                fill={styleConfig.wallColor}
                stroke="#0F172A"
                strokeWidth="2.5"
                filter="url(#facade-shadow)"
              />

              {/* Central Stair / Core Tower (Extends above Roof) */}
              {(() => {
                const voidBay = elevationModel.bays.find(
                  (b) => b.roomType === "VOID" || b.roomType === "STAIR"
                );
                const stairStartX = voidBay
                  ? toSvgX(voidBay.xStartFeet)
                  : toSvgX(elevationModel.totalWidthFeet * 0.42);
                const stairWidth = voidBay
                  ? voidBay.widthFeet * SCALE_X
                  : elevationModel.totalWidthFeet * 0.16 * SCALE_X;
                const roofY = toSvgY(elevationModel.totalHeightFeet - elevationModel.parapetHeightFeet - elevationModel.stairRoomHeightFeet);
                const stairRoofY = toSvgY(elevationModel.totalHeightFeet);

                return (
                  <g id="facade-stair-tower">
                    {/* Dark Charcoal Accent on Stair Tower (Image 3) */}
                    <rect
                      x={stairStartX - 4}
                      y={stairRoofY}
                      width={stairWidth + 8}
                      height={roofY - stairRoofY}
                      fill="#475569"
                      stroke="#0F172A"
                      strokeWidth="2"
                    />
                    {/* Headhouse Slab Cap */}
                    <rect
                      x={stairStartX - 10}
                      y={stairRoofY - 6}
                      width={stairWidth + 20}
                      height="8"
                      fill="#1E293B"
                    />
                    {/* Stair Ventilation Grilles / Louvers */}
                    <rect
                      x={stairStartX + 8}
                      y={stairRoofY + 18}
                      width={stairWidth - 16}
                      height="36"
                      fill="url(#vertical-louvers)"
                      stroke="#0F172A"
                      strokeWidth="1"
                    />
                  </g>
                );
              })()}

              {/* Rooftop Garden Terrace & Pergolas (Image 3) */}
              {showRooftopGarden && (
                <g id="rooftop-garden">
                  {/* Left Pergola & Green Trees */}
                  <circle cx={buildingLeft + 45} cy={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet) - 24} r="22" fill="#15803D" />
                  <circle cx={buildingLeft + 80} cy={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet) - 28} r="26" fill="#16A34A" />
                  <circle cx={buildingLeft + 120} cy={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet) - 20} r="20" fill="#15803D" />
                  {/* Modern Dark Pergola Slats */}
                  <rect
                    x={buildingLeft + 10}
                    y={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet) - 35}
                    width="150"
                    height="4"
                    fill="#1E293B"
                  />
                  {Array.from({ length: 6 }).map((_, pi) => (
                    <line
                      key={`pergola-post-${pi}`}
                      x1={buildingLeft + 15 + pi * 26}
                      y1={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet) - 35}
                      x2={buildingLeft + 15 + pi * 26}
                      y2={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet)}
                      stroke="#1E293B"
                      strokeWidth="2.5"
                    />
                  ))}

                  {/* Right Pergola & Green Trees */}
                  <circle cx={buildingRight - 120} cy={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet) - 20} r="20" fill="#15803D" />
                  <circle cx={buildingRight - 80} cy={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet) - 28} r="26" fill="#16A34A" />
                  <circle cx={buildingRight - 45} cy={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet) - 24} r="22" fill="#15803D" />
                  <rect
                    x={buildingRight - 160}
                    y={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet) - 35}
                    width="150"
                    height="4"
                    fill="#1E293B"
                  />
                  {Array.from({ length: 6 }).map((_, pi) => (
                    <line
                      key={`pergola-post-r-${pi}`}
                      x1={buildingRight - 155 + pi * 26}
                      y1={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet) - 35}
                      x2={buildingRight - 155 + pi * 26}
                      y2={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet)}
                      stroke="#1E293B"
                      strokeWidth="2.5"
                    />
                  ))}
                </g>
              )}

              {/* BAYS & MULTI-STORY BALCONIES WITH TEAK WOOD & WARM LIGHTING (Image 3) */}
              {elevationModel.bays.map((bay, bayIdx) => {
                const bayLeftX = toSvgX(bay.xStartFeet);
                const bayWidthSvg = bay.widthFeet * SCALE_X;
                const bayCenterX = bayLeftX + bayWidthSvg / 2;

                return (
                  <g key={`arch-bay-${bay.id}`}>
                    {/* Upper Floors & Ground Floor */}
                    {Array.from({ length: storyCount }).map((_, storyIdx) => {
                      const floorElev = elevationModel.plinthHeightFeet + storyIdx * elevationModel.storyHeightFeet;
                      const nextFloorElev = floorElev + elevationModel.storyHeightFeet;
                      const floorSlabY = toSvgY(floorElev);
                      const ceilingSlabY = toSvgY(nextFloorElev);
                      const storyHeightPx = floorSlabY - ceilingSlabY;

                      const isGroundFloor = storyIdx === 0;

                      // Balcony / Window aperture
                      const balMargin = 12;
                      const balX = bayLeftX + balMargin;
                      const balW = bayWidthSvg - balMargin * 2;
                      const balH = storyHeightPx * 0.76;
                      const balTop = floorSlabY - balH - 6;

                      return (
                        <g key={`arch-elem-b${bayIdx}-s${storyIdx}`}>
                          {/* Upper Floor Balconies (or Ground Floor Apertures) */}
                          {!isGroundFloor ? (
                            <g id={`balcony-unit-b${bayIdx}-s${storyIdx}`}>
                              {/* Deep Architectural Recessed Alcove */}
                              <rect
                                x={balX}
                                y={balTop}
                                width={balW}
                                height={balH}
                                fill="#27272A"
                                stroke="#18181B"
                                strokeWidth="1.5"
                              />

                              {/* Warm Teak Wood Wall Paneling behind the balcony (Image 3) */}
                              <rect
                                x={balX + 4}
                                y={balTop + 4}
                                width={balW - 8}
                                height={balH - 8}
                                fill="url(#teak-wood-slats)"
                              />

                              {/* Aluminum Framed Sliding Glass Doors */}
                              <rect
                                x={balX + 8}
                                y={balTop + 8}
                                width={balW - 16}
                                height={balH - 12}
                                fill={
                                  lightingMode === "NIGHT"
                                    ? "#FDE68A"
                                    : lightingMode === "DUSK"
                                    ? "#FEF08A"
                                    : styleConfig.glassTint
                                }
                                opacity={lightingMode === "DAYLIGHT" ? 0.7 : 0.9}
                                stroke="#18181B"
                                strokeWidth="2.5"
                              />
                              {/* Window Dividing Mullions */}
                              <line
                                x1={balX + balW / 2}
                                y1={balTop + 8}
                                x2={balX + balW / 2}
                                y2={balTop + balH - 4}
                                stroke="#18181B"
                                strokeWidth="2.5"
                              />

                              {/* Warm Interior Lighting Glow through glass */}
                              {lightingMode !== "DAYLIGHT" && (
                                <rect
                                  x={balX + 10}
                                  y={balTop + 10}
                                  width={balW - 20}
                                  height={balH - 16}
                                  fill={styleConfig.warmGlow}
                                  opacity="0.35"
                                  filter="url(#warm-sconce-glow)"
                                />
                              )}

                              {/* Cantilevered Concrete Floor Slab with Underside Deep Shadow */}
                              <rect
                                x={balX - 4}
                                y={floorSlabY - 4}
                                width={balW + 8}
                                height="8"
                                fill="#FFFFFF"
                                stroke="#18181B"
                                strokeWidth="1.5"
                                filter="url(#balcony-deep-shadow)"
                              />

                              {/* Horizontal Balcony Railings (Dark Metal matching Image 3) */}
                              <g id="balcony-railing-arch">
                                {/* Top Handrail */}
                                <rect
                                  x={balX - 2}
                                  y={floorSlabY - 32}
                                  width={balW + 4}
                                  height="3.5"
                                  fill="#18181B"
                                />
                                {/* Horizontal Intermediate Bars */}
                                <line x1={balX} y1={floorSlabY - 24} x2={balX + balW} y2={floorSlabY - 24} stroke="#18181B" strokeWidth="1.8" />
                                <line x1={balX} y1={floorSlabY - 16} x2={balX + balW} y2={floorSlabY - 16} stroke="#18181B" strokeWidth="1.8" />
                                <line x1={balX} y1={floorSlabY - 8} x2={balX + balW} y2={floorSlabY - 8} stroke="#18181B" strokeWidth="1.8" />
                              </g>
                            </g>
                          ) : (
                            /* Ground Floor Entrance Doors / Windows & Planters (Image 3) */
                            <g id={`ground-floor-unit-b${bayIdx}`}>
                              <rect
                                x={balX}
                                y={floorSlabY - balH * 0.75}
                                width={balW}
                                height={balH * 0.75}
                                fill="#27272A"
                                stroke="#18181B"
                                strokeWidth="2"
                              />
                              {/* Modern Entrance Door or Casement Window */}
                              <rect
                                x={balX + 6}
                                y={floorSlabY - balH * 0.75 + 4}
                                width={balW - 12}
                                height={balH * 0.75 - 4}
                                fill={bayIdx === 0 || bayIdx === 3 ? "#451A03" : "#334155"}
                                stroke="#0F172A"
                                strokeWidth="1.5"
                              />
                            </g>
                          )}

                          {/* ARCHITECTURAL EXTERIOR WALL SCONCE LIGHTS ON PIERS (Image 3) */}
                          {showSconceLights && !isGroundFloor && (
                            <g id={`sconce-lights-b${bayIdx}-s${storyIdx}`}>
                              {/* Left Sconce Light Fixture */}
                              <rect
                                x={balX - 10}
                                y={floorSlabY - storyHeightPx * 0.55}
                                width="4"
                                height="12"
                                fill="#18181B"
                              />
                              {/* Right Sconce Light Fixture */}
                              <rect
                                x={balX + balW + 6}
                                y={floorSlabY - storyHeightPx * 0.55}
                                width="4"
                                height="12"
                                fill="#18181B"
                              />

                              {/* Sconce Light Glow Cone (Warm Golden Lighting) */}
                              {lightingMode !== "DAYLIGHT" && (
                                <>
                                  {/* Left Sconce Glow */}
                                  <polygon
                                    points={`${balX - 8},${floorSlabY - storyHeightPx * 0.55} ${balX - 22},${floorSlabY - storyHeightPx * 0.75} ${balX + 6},${floorSlabY - storyHeightPx * 0.75}`}
                                    fill={styleConfig.warmGlow}
                                    opacity="0.35"
                                  />
                                  <polygon
                                    points={`${balX - 8},${floorSlabY - storyHeightPx * 0.55 + 12} ${balX - 22},${floorSlabY - storyHeightPx * 0.35} ${balX + 6},${floorSlabY - storyHeightPx * 0.35}`}
                                    fill={styleConfig.warmGlow}
                                    opacity="0.35"
                                  />
                                  {/* Right Sconce Glow */}
                                  <polygon
                                    points={`${balX + balW + 8},${floorSlabY - storyHeightPx * 0.55} ${balX + balW - 6},${floorSlabY - storyHeightPx * 0.75} ${balX + balW + 22},${floorSlabY - storyHeightPx * 0.75}`}
                                    fill={styleConfig.warmGlow}
                                    opacity="0.35"
                                  />
                                  <polygon
                                    points={`${balX + balW + 8},${floorSlabY - storyHeightPx * 0.55 + 12} ${balX + balW - 6},${floorSlabY - storyHeightPx * 0.35} ${balX + balW + 22},${floorSlabY - storyHeightPx * 0.35}`}
                                    fill={styleConfig.warmGlow}
                                    opacity="0.35"
                                  />
                                </>
                              )}
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* Concrete Cantilever Beams & Floor Slab Dividers */}
              {Array.from({ length: storyCount }).map((_, si) => {
                const floorElev = elevationModel.plinthHeightFeet + (si + 1) * elevationModel.storyHeightFeet;
                const fY = toSvgY(floorElev);
                return (
                  <rect
                    key={`arch-floor-divider-${si}`}
                    x={buildingLeft - 6}
                    y={fY - 3}
                    width={buildingWidth + 12}
                    height="6"
                    fill="#FFFFFF"
                    stroke="#18181B"
                    strokeWidth="1.2"
                  />
                );
              })}
            </g>

            {/* 5. OFFICIAL ARCHITECTURAL DRAWING TITLE BLOCK (Matching Image 3) */}
            <g id="presentation-title-block">
              <rect
                x="28"
                y="820"
                width={SVG_WIDTH - 56}
                height="65"
                fill="#FFFFFF"
                stroke="#0F172A"
                strokeWidth="2.2"
              />

              {/* Project Name */}
              <line x1="380" y1="820" x2="380" y2="885" stroke="#0F172A" strokeWidth="1.5" />
              <text x="40" y="836" className="text-[8px] font-bold uppercase tracking-wider fill-stone-500">
                Project:
              </text>
              <text
                x="40"
                y="864"
                className="text-base font-black fill-stone-950 uppercase tracking-wide"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                {elevationModel.drawingMetadata.projectName}
              </text>

              {/* Drawing Title: FRONT ELEVATION */}
              <line x1="780" y1="820" x2="780" y2="885" stroke="#0F172A" strokeWidth="1.5" />
              <text x="395" y="836" className="text-[8px] font-bold uppercase tracking-wider fill-stone-500">
                Drawing Title:
              </text>
              <text
                x="395"
                y="864"
                className="text-base font-black fill-stone-950 uppercase tracking-widest"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                FRONT ELEVATION (ARCHITECTURAL VIEW)
              </text>

              {/* Scale */}
              <line x1="970" y1="820" x2="970" y2="885" stroke="#0F172A" strokeWidth="1.5" />
              <text x="795" y="836" className="text-[8px] font-bold uppercase tracking-wider fill-stone-500">
                Scale:
              </text>
              <text
                x="795"
                y="852"
                className="text-[10px] font-mono font-bold fill-stone-900"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                1/8&quot; = 1&apos;-0&quot;
              </text>
              <rect x="795" y="862" width="130" height="7" fill="#F1F5F9" stroke="#0F172A" strokeWidth="0.8" />
              <rect x="795" y="862" width="32" height="7" fill="#0F172A" />
              <rect x="859" y="862" width="32" height="7" fill="#0F172A" />
              <text x="795" y="878" className="text-[7px] font-mono fill-stone-500">0</text>
              <text x="827" y="878" className="text-[7px] font-mono fill-stone-500">1</text>
              <text x="859" y="878" className="text-[7px] font-mono fill-stone-500">2</text>
              <text x="925" y="878" className="text-[7px] font-mono fill-stone-500">4m / 12ft</text>

              {/* North Arrow */}
              <line x1="1050" y1="820" x2="1050" y2="885" stroke="#0F172A" strokeWidth="1.5" />
              <text x="980" y="836" className="text-[8px] font-bold uppercase tracking-wider fill-stone-500">
                North:
              </text>
              <g transform="translate(1010, 856)">
                <circle cx="0" cy="0" r="13" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.2" />
                <polygon points="0,-12 5,8 0,4" fill="#0F172A" />
                <polygon points="0,-12 -5,8 0,4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />
                <text x="-3" y="-14" className="text-[8px] font-bold fill-stone-900">N</text>
              </g>

              {/* Date */}
              <line x1="1140" y1="820" x2="1140" y2="885" stroke="#0F172A" strokeWidth="1.5" />
              <text x="1060" y="836" className="text-[8px] font-bold uppercase tracking-wider fill-stone-500">
                Date:
              </text>
              <text
                x="1060"
                y="860"
                className="text-[10px] font-mono font-bold fill-stone-900"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                {elevationModel.drawingMetadata.date}
              </text>

              {/* Sheet & Revision */}
              <text x="1150" y="836" className="text-[8px] font-bold uppercase tracking-wider fill-stone-500">
                Sheet:
              </text>
              <text
                x="1150"
                y="864"
                className="text-base font-black fill-stone-950 tracking-wider"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                A-301
              </text>
              <text x="1240" y="836" className="text-[8px] font-bold uppercase tracking-wider fill-stone-500">
                Rev:
              </text>
              <text
                x="1240"
                y="860"
                className="text-xs font-mono font-bold fill-stone-700"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                R01
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
