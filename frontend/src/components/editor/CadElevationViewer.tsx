"use client";

import React, { useState, useRef, useMemo } from "react";
import { useEditorStore } from "@/store/editorStore";
import {
  computeElevationModel,
  ElevationOrientation,
  REFERENCE_RESIDENTIAL_PLAN,
} from "@/lib/elevationEngine";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Layers,
  Sparkles,
  Sliders,
  Check,
  Eye,
  EyeOff,
  Sun,
  FileCode,
  Image as ImageIcon,
  Compass,
  Building,
  RotateCcw,
} from "lucide-react";

export function CadElevationViewer() {
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

  // CAD Elevation Options
  const [orientation, setOrientation] = useState<ElevationOrientation>("BACK");
  const [storyCount, setStoryCount] = useState<number>(5);
  const [showDatums, setShowDatums] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [showShadows, setShowShadows] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Compute CAD Elevation Model
  const elevationModel = useMemo(() => {
    return computeElevationModel(rooms, doorsWindows, {
      orientation,
      storyCount,
      projectName: projectName || "RESIDENTIAL BUILDING",
      unit,
    });
  }, [rooms, doorsWindows, orientation, storyCount, projectName, unit]);

  // Load Blueprint helper
  const handleLoadBlueprint = () => {
    addBatchRooms(REFERENCE_RESIDENTIAL_PLAN.rooms);
    REFERENCE_RESIDENTIAL_PLAN.doorsWindows.forEach((dw) => addDoorWindow(dw));
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, z + 0.15));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.5, z - 0.15));
  const handleResetZoom = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Export to SVG file
  const handleExportSvg = () => {
    const svgElem = document.getElementById("cad-elevation-svg");
    if (!svgElem) return;
    const svgData = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName || "Residential_Building"}_${orientation}_Elevation_A-201.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // SVG Drawing Coordinate Geometry
  // Target Sheet Dimensions (AutoCAD A3/A2 Sheet aspect ratio)
  const SHEET_WIDTH = 1350;
  const SHEET_HEIGHT = 920;

  // Drawing boundaries inside sheet
  const DRAWING_ORIGIN_X = 260; // Leaves room on left for Datum level bubbles
  const DRAWING_ORIGIN_Y = 700; // Ground line Y position
  const DRAWING_RIGHT_MARGIN = 220; // Leaves room on right for height dimensions

  // Real world to SVG scale:
  // Total building width in feet (approx 62.5 ft for residential reference)
  const buildingWidthFeet = Math.max(30, elevationModel.totalWidthFeet);
  const availableWidthPx = SHEET_WIDTH - DRAWING_ORIGIN_X - DRAWING_RIGHT_MARGIN; // ~870px
  const SCALE_X = availableWidthPx / buildingWidthFeet;

  // Real world to SVG vertical scale:
  // Total height: 61.5 ft (plinth + 5 stories + parapet + stair room)
  const buildingHeightFeet = elevationModel.totalHeightFeet;
  const availableHeightPx = 540; // max elevation height
  const SCALE_Y = availableHeightPx / buildingHeightFeet;

  // Helper coordinate converters
  const toSvgX = (feet: number) => DRAWING_ORIGIN_X + feet * SCALE_X;
  const toSvgY = (elevationFeet: number) => DRAWING_ORIGIN_Y - elevationFeet * SCALE_Y;

  const groundY = toSvgY(0);
  const plinthY = toSvgY(elevationModel.plinthHeightFeet);
  const buildingLeftX = toSvgX(0);
  const buildingRightX = toSvgX(elevationModel.totalWidthFeet);
  const buildingWidthSvg = buildingRightX - buildingLeftX;

  // Floor elevations
  const floorLevels = elevationModel.datumLevels.filter((d) => !d.isGround);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-full select-none overflow-hidden bg-[#F8F9FA] ${
        isPanning ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {/* Top Engineering Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: View Mode Return & Orientation Switcher */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <Button
            size="sm"
            onClick={() => setViewMode("2D")}
            className="bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold gap-1.5 shadow-md border border-stone-200"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-stone-500" />
            <span>2D Plan</span>
          </Button>

          {/* Orientation Selector: FRONT, BACK, LEFT, RIGHT */}
          <div className="flex rounded-xl bg-white/95 backdrop-blur-md p-1 shadow-md border border-stone-200 text-xs font-bold">
            {(["BACK", "FRONT", "LEFT", "RIGHT"] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setOrientation(dir)}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  orientation === dir
                    ? "bg-[#1E3A34] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {dir === "BACK"
                  ? "Back Elevation"
                  : dir === "FRONT"
                  ? "Front Elevation"
                  : `${dir.charAt(0) + dir.slice(1).toLowerCase()} Elevation`}
              </button>
            ))}
          </div>

          {/* Stories Stepper */}
          <div className="flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur-md px-2.5 py-1 shadow-md border border-stone-200 text-xs font-bold text-stone-700">
            <Building className="h-3.5 w-3.5 text-[#1E3A34]" />
            <span>Stories:</span>
            <button
              onClick={() => setStoryCount((c) => Math.max(1, c - 1))}
              disabled={storyCount <= 1}
              className="h-5 w-5 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-30 text-center leading-none"
            >
              -
            </button>
            <span className="w-5 text-center text-[#1E3A34]">{storyCount}</span>
            <button
              onClick={() => setStoryCount((c) => Math.min(10, c + 1))}
              disabled={storyCount >= 10}
              className="h-5 w-5 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-30 text-center leading-none"
            >
              +
            </button>
          </div>
        </div>

        {/* Right: Layer Toggles & Architectural Façade Transition Button */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Toggles */}
          <div className="hidden lg:flex items-center gap-1 rounded-xl bg-white/95 backdrop-blur-md p-1 shadow-md border border-stone-200 text-xs font-medium">
            <button
              onClick={() => setShowDatums(!showDatums)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                showDatums ? "bg-stone-100 font-bold text-stone-900" : "text-stone-400"
              }`}
              title="Toggle Level Datum Markers"
            >
              <Compass className="h-3 w-3" />
              <span>Levels</span>
            </button>
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                showDimensions ? "bg-stone-100 font-bold text-stone-900" : "text-stone-400"
              }`}
              title="Toggle Dimension Callouts"
            >
              <Sliders className="h-3 w-3" />
              <span>Dimensions</span>
            </button>
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                showAnnotations ? "bg-stone-100 font-bold text-stone-900" : "text-stone-400"
              }`}
              title="Toggle Element Callout Text"
            >
              <FileCode className="h-3 w-3" />
              <span>Notes</span>
            </button>
            <button
              onClick={() => setShowShadows(!showShadows)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                showShadows ? "bg-stone-100 font-bold text-stone-900" : "text-stone-400"
              }`}
              title="Toggle Architectural Cast Shadows"
            >
              <Sun className="h-3 w-3" />
              <span>Shadows</span>
            </button>
          </div>

          {/* Quick Load Blueprint if user is testing */}
          {rooms.length === 0 && (
            <Button
              size="sm"
              onClick={handleLoadBlueprint}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold gap-1.5 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Load 5-Story Blueprint</span>
            </Button>
          )}

          {/* Export SVG */}
          <Button
            size="sm"
            onClick={handleExportSvg}
            className="bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold gap-1.5 shadow-md border border-stone-200"
            title="Export CAD Vector Drawing as SVG"
          >
            <Download className="h-3.5 w-3.5 text-stone-500" />
            <span>Export CAD (SVG)</span>
          </Button>

          {/* SEAMLESS TRANSITION TO ARCHITECTURAL FAÇADE VIEW (Image 3) */}
          <Button
            size="sm"
            onClick={() => setViewMode("ARCHITECTURAL_VIEW")}
            className="bg-[#1E3A34] hover:bg-[#254A42] text-white text-xs font-bold gap-2 shadow-lg ring-2 ring-[#1E3A34]/20 animate-pulse hover:animate-none"
            title="Transition to Photorealistic Architectural Façade View"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Façade Architectural View &rarr;</span>
          </Button>
        </div>
      </div>

      {/* Floating Zoom & Pan Controls (Bottom-Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-1.5 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-lg border border-stone-200">
        <button
          onClick={handleZoomOut}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-xs font-mono font-bold text-stone-600 w-12 text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100"
          title="Reset Zoom & Pan"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Main Vector Architectural Elevation Canvas */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: "center center",
        }}
      >
        <svg
          id="cad-elevation-svg"
          viewBox={`0 0 ${SHEET_WIDTH} ${SHEET_HEIGHT}`}
          className="w-[1280px] h-[870px] bg-white shadow-2xl rounded-sm border border-stone-300 font-sans"
          style={{ shapeRendering: "geometricPrecision" }}
        >
          <defs>
            {/* Architectural Shadow Filters */}
            <filter id="soft-shadow" x="-5%" y="-5%" width="120%" height="130%">
              <feDropShadow dx="3" dy="5" stdDeviation="4" floodOpacity="0.22" floodColor="#0F172A" />
            </filter>
            <filter id="balcony-shadow" x="-5%" y="0%" width="115%" height="180%">
              <feDropShadow dx="2" dy="7" stdDeviation="3" floodOpacity="0.30" floodColor="#1E293B" />
            </filter>

            {/* Plaster Grooving Pattern */}
            <pattern id="plaster-groove" width="100" height="12" patternUnits="userSpaceOnUse">
              <line x1="0" y1="12" x2="100" y2="12" stroke="#CBD5E1" strokeWidth="0.75" />
            </pattern>

            {/* Soil / Foundation Hatch Pattern */}
            <pattern id="soil-hatch" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="16" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 4" />
            </pattern>
          </defs>

          {/* 1. ARCHITECTURAL DRAWING SHEET BORDER */}
          <rect
            x="20"
            y="20"
            width={SHEET_WIDTH - 40}
            height={SHEET_HEIGHT - 40}
            fill="#FFFFFF"
            stroke="#1E293B"
            strokeWidth="2.5"
          />
          <rect
            x="28"
            y="28"
            width={SHEET_WIDTH - 56}
            height={SHEET_HEIGHT - 56}
            fill="none"
            stroke="#64748B"
            strokeWidth="0.8"
          />

          {/* 2. TOP DRAWING TITLE HEADER */}
          <text
            x={SHEET_WIDTH / 2}
            y="75"
            textAnchor="middle"
            className="text-2xl font-black tracking-widest fill-stone-900"
            style={{ fontFamily: "'Courier New', Courier, monospace", letterSpacing: "4px" }}
          >
            {elevationModel.drawingMetadata.drawingTitle}
          </text>

          {/* 3. GROUND / FOUNDATION BASE */}
          <g id="ground-foundation">
            {/* Ground Soil Hatch */}
            <rect
              x="50"
              y={groundY}
              width={SHEET_WIDTH - 100}
              height="35"
              fill="url(#soil-hatch)"
              stroke="#64748B"
              strokeWidth="0.5"
            />
            {/* Solid Ground Line (thicker architectural cut line) */}
            <line
              x1="40"
              y1={groundY}
              x2={SHEET_WIDTH - 80}
              y2={groundY}
              stroke="#0F172A"
              strokeWidth="3.5"
            />
            {/* Plinth Foundation Base Beam */}
            <rect
              x={buildingLeftX - 12}
              y={plinthY}
              width={buildingWidthSvg + 24}
              height={groundY - plinthY}
              fill="#F1F5F9"
              stroke="#0F172A"
              strokeWidth="2"
            />
            {/* Plinth Beam Line */}
            <line
              x1={buildingLeftX - 12}
              y1={plinthY + (groundY - plinthY) * 0.4}
              x2={buildingRightX + 12}
              y2={plinthY + (groundY - plinthY) * 0.4}
              stroke="#475569"
              strokeWidth="1.2"
              strokeDasharray="4 2"
            />
          </g>

          {/* 4. MAIN MULTI-STORY BUILDING FAÇADE STRUCTURE */}
          <g id="building-body">
            {/* Exterior Plaster Background Wall */}
            <rect
              x={buildingLeftX}
              y={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet)}
              width={buildingWidthSvg}
              height={toSvgY(elevationModel.plinthHeightFeet) - toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet)}
              fill="#F8FAFC"
              stroke="#0F172A"
              strokeWidth="2.5"
            />

            {/* Plaster Grooves Background */}
            <rect
              x={buildingLeftX}
              y={toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet)}
              width={buildingWidthSvg}
              height={toSvgY(elevationModel.plinthHeightFeet) - toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet)}
              fill="url(#plaster-groove)"
              opacity="0.35"
            />

            {/* Central Stair Room Tower / Headhouse (above Roof Level) */}
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
                <g id="stair-headhouse">
                  {/* Stair Core Wall */}
                  <rect
                    x={stairStartX - 10}
                    y={stairRoofY}
                    width={stairWidth + 20}
                    height={roofY - stairRoofY}
                    fill="#F1F5F9"
                    stroke="#0F172A"
                    strokeWidth="2.2"
                  />
                  {/* Stair Room Overhanging Slab / Coping */}
                  <rect
                    x={stairStartX - 16}
                    y={stairRoofY - 4}
                    width={stairWidth + 32}
                    height="6"
                    fill="#334155"
                    stroke="#0F172A"
                    strokeWidth="1.5"
                  />
                  {/* Louvers / Vent Openings on Stair Tower */}
                  {Array.from({ length: 4 }).map((_, li) => (
                    <line
                      key={`stair-louver-${li}`}
                      x1={stairStartX + 8}
                      y1={stairRoofY + 12 + li * 6}
                      x2={stairStartX + stairWidth - 8}
                      y2={stairRoofY + 12 + li * 6}
                      stroke="#475569"
                      strokeWidth="1.5"
                    />
                  ))}
                </g>
              );
            })()}

            {/* Parapet Wall & Coping Band */}
            {(() => {
              const roofY = toSvgY(elevationModel.totalHeightFeet - elevationModel.parapetHeightFeet - elevationModel.stairRoomHeightFeet);
              const parapetY = toSvgY(elevationModel.totalHeightFeet - elevationModel.stairRoomHeightFeet);
              return (
                <g id="parapet-coping">
                  <rect
                    x={buildingLeftX - 6}
                    y={parapetY}
                    width={buildingWidthSvg + 12}
                    height={roofY - parapetY}
                    fill="#F8FAFC"
                    stroke="#0F172A"
                    strokeWidth="2"
                  />
                  {/* Top Coping Ledge */}
                  <rect
                    x={buildingLeftX - 10}
                    y={parapetY - 4}
                    width={buildingWidthSvg + 20}
                    height="5"
                    fill="#E2E8F0"
                    stroke="#0F172A"
                    strokeWidth="1.5"
                  />
                  {/* Decorative Rooftop Parapet Railing Grilles */}
                  <line
                    x1={buildingLeftX + 6}
                    y1={parapetY - 22}
                    x2={buildingLeftX + 160}
                    y2={parapetY - 22}
                    stroke="#0F172A"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={buildingRightX - 160}
                    y1={parapetY - 22}
                    x2={buildingRightX - 6}
                    y2={parapetY - 22}
                    stroke="#0F172A"
                    strokeWidth="1.5"
                  />
                </g>
              );
            })()}

            {/* BAYS & MULTI-STORY APERTURES / BALCONIES */}
            {elevationModel.bays.map((bay, bayIdx) => {
              const bayLeftX = toSvgX(bay.xStartFeet);
              const bayWidthSvg = bay.widthFeet * SCALE_X;
              const bayCenterX = bayLeftX + bayWidthSvg / 2;

              return (
                <g key={bay.id} id={`bay-group-${bay.index}`}>
                  {/* Central Void Visual Recess / Shaft */}
                  {bay.roomType === "VOID" && (
                    <g id="central-void-shaft">
                      {/* Recessed Vertical Void Backwall */}
                      <rect
                        x={bayLeftX + 4}
                        y={toSvgY(elevationModel.totalHeightFeet - elevationModel.parapetHeightFeet - elevationModel.stairRoomHeightFeet)}
                        width={bayWidthSvg - 8}
                        height={toSvgY(elevationModel.plinthHeightFeet) - toSvgY(elevationModel.totalHeightFeet - elevationModel.parapetHeightFeet - elevationModel.stairRoomHeightFeet)}
                        fill="#E2E8F0"
                        stroke="#64748B"
                        strokeWidth="1.2"
                      />
                      {/* Floor by floor connector slabs & ventilation circles */}
                      {Array.from({ length: storyCount }).map((_, si) => {
                        const floorElev = elevationModel.plinthHeightFeet + si * elevationModel.storyHeightFeet;
                        const floorSlabY = toSvgY(floorElev);
                        return (
                          <g key={`void-level-${si}`}>
                            {/* Horizontal void beam */}
                            <line
                              x1={bayLeftX + 4}
                              y1={floorSlabY}
                              x2={bayLeftX + bayWidthSvg - 4}
                              y2={floorSlabY}
                              stroke="#0F172A"
                              strokeWidth="2"
                            />
                            {/* Circular Vent Hole matching reference drawing */}
                            <circle
                              cx={bayCenterX}
                              cy={floorSlabY - 28}
                              r="7"
                              fill="#CBD5E1"
                              stroke="#334155"
                              strokeWidth="1.2"
                            />
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* Windows / Balconies for Each Floor Level */}
                  {bay.roomType !== "VOID" &&
                    Array.from({ length: storyCount }).map((_, storyIdx) => {
                      const floorElev = elevationModel.plinthHeightFeet + storyIdx * elevationModel.storyHeightFeet;
                      const nextFloorElev = floorElev + elevationModel.storyHeightFeet;
                      const floorSlabY = toSvgY(floorElev);
                      const ceilingSlabY = toSvgY(nextFloorElev);
                      const storyHeightPx = floorSlabY - ceilingSlabY;

                      // Ground floor vs typical upper floors
                      const isGroundFloor = storyIdx === 0;

                      // Window / Opening geometry inside this bay
                      const openingMargin = 12;
                      const openLeft = bayLeftX + openingMargin;
                      const openWidth = bayWidthSvg - openingMargin * 2;
                      const openHeight = isGroundFloor ? storyHeightPx * 0.55 : storyHeightPx * 0.72;
                      const openTop = floorSlabY - openHeight - (isGroundFloor ? storyHeightPx * 0.25 : 8);

                      return (
                        <g key={`bay-${bayIdx}-story-${storyIdx}`} id={`elem-b${bayIdx}-s${storyIdx}`}>
                          {/* Cast Shadow under Sunshade / Cantilever Slab */}
                          {showShadows && (
                            <rect
                              x={openLeft - 6}
                              y={openTop - 6}
                              width={openWidth + 12}
                              height="8"
                              fill="#0F172A"
                              opacity="0.25"
                            />
                          )}

                          {/* Concrete Sunshade / Chajja Projection over Openings */}
                          <rect
                            x={openLeft - 8}
                            y={openTop - 7}
                            width={openWidth + 16}
                            height="5"
                            fill="#F1F5F9"
                            stroke="#0F172A"
                            strokeWidth="1.5"
                          />

                          {/* Opening Frame (Sliding Glass Door or Window) */}
                          <rect
                            x={openLeft}
                            y={openTop}
                            width={openWidth}
                            height={openHeight}
                            fill="#E0F2FE"
                            stroke="#0F172A"
                            strokeWidth="2"
                          />

                          {/* Window / Sliding Door Glazing Panes (2-Panel or 3-Panel) */}
                          <line
                            x1={openLeft + openWidth / 2}
                            y1={openTop}
                            x2={openLeft + openWidth / 2}
                            y2={openTop + openHeight}
                            stroke="#0F172A"
                            strokeWidth="1.8"
                          />
                          {/* Inner Sliding Frame Mullions */}
                          <rect
                            x={openLeft + 2}
                            y={openTop + 2}
                            width={openWidth / 2 - 4}
                            height={openHeight - 4}
                            fill="none"
                            stroke="#64748B"
                            strokeWidth="0.8"
                          />
                          <rect
                            x={openLeft + openWidth / 2 + 2}
                            y={openTop + 2}
                            width={openWidth / 2 - 4}
                            height={openHeight - 4}
                            fill="none"
                            stroke="#64748B"
                            strokeWidth="0.8"
                          />

                          {/* Glass Reflection Diagonal Hatch Lines */}
                          <line
                            x1={openLeft + openWidth * 0.25}
                            y1={openTop + 6}
                            x2={openLeft + openWidth * 0.15}
                            y2={openTop + openHeight * 0.45}
                            stroke="#BAE6FD"
                            strokeWidth="1.5"
                          />
                          <line
                            x1={openLeft + openWidth * 0.75}
                            y1={openTop + 6}
                            x2={openLeft + openWidth * 0.65}
                            y2={openTop + openHeight * 0.45}
                            stroke="#BAE6FD"
                            strokeWidth="1.5"
                          />

                          {/* Balcony Cantilever Slab & M.S. Railing (for upper floors or balcony bays) */}
                          {(!isGroundFloor || bay.hasBalcony) && (
                            <g id={`balcony-railing-b${bayIdx}-s${storyIdx}`}>
                              {/* Balcony Cantilever Floor Slab Projection */}
                              <rect
                                x={bayLeftX + 4}
                                y={floorSlabY - 3}
                                width={bayWidthSvg - 8}
                                height="6"
                                fill="#E2E8F0"
                                stroke="#0F172A"
                                strokeWidth="1.8"
                              />

                              {/* Balcony Soft Underside Shadow */}
                              {showShadows && (
                                <rect
                                  x={bayLeftX + 4}
                                  y={floorSlabY + 3}
                                  width={bayWidthSvg - 8}
                                  height="5"
                                  fill="#0F172A"
                                  opacity="0.22"
                                />
                              )}

                              {/* M.S. Balcony Railing: Top Handrail Bar */}
                              <rect
                                x={bayLeftX + 6}
                                y={floorSlabY - 30}
                                width={bayWidthSvg - 12}
                                height="3"
                                fill="#1E293B"
                                stroke="#0F172A"
                                strokeWidth="1"
                              />

                              {/* M.S. Balcony Railing: Horizontal Intermediate Metal Bars */}
                              <line
                                x1={bayLeftX + 6}
                                y1={floorSlabY - 22}
                                x2={bayLeftX + bayWidthSvg - 6}
                                y2={floorSlabY - 22}
                                stroke="#0F172A"
                                strokeWidth="1.2"
                              />
                              <line
                                x1={bayLeftX + 6}
                                y1={floorSlabY - 14}
                                x2={bayLeftX + bayWidthSvg - 6}
                                y2={floorSlabY - 14}
                                stroke="#0F172A"
                                strokeWidth="1.2"
                              />
                              <line
                                x1={bayLeftX + 6}
                                y1={floorSlabY - 6}
                                x2={bayLeftX + bayWidthSvg - 6}
                                y2={floorSlabY - 6}
                                stroke="#0F172A"
                                strokeWidth="1.2"
                              />

                              {/* Balcony Vertical Support Posts */}
                              <line
                                x1={bayLeftX + 8}
                                y1={floorSlabY - 30}
                                x2={bayLeftX + 8}
                                y2={floorSlabY}
                                stroke="#0F172A"
                                strokeWidth="2"
                              />
                              <line
                                x1={bayLeftX + bayWidthSvg - 8}
                                y1={floorSlabY - 30}
                                x2={bayLeftX + bayWidthSvg - 8}
                                y2={floorSlabY}
                                stroke="#0F172A"
                                strokeWidth="2"
                              />
                            </g>
                          )}

                          {/* Ground Floor Entrance Steps (matching reference Image 2) */}
                          {isGroundFloor && (
                            <g id="ground-entrance-steps">
                              <rect
                                x={openLeft + 6}
                                y={floorSlabY}
                                width={openWidth - 12}
                                height={groundY - floorSlabY}
                                fill="#CBD5E1"
                                stroke="#0F172A"
                                strokeWidth="1"
                              />
                              <line
                                x1={openLeft + 4}
                                y1={floorSlabY + (groundY - floorSlabY) * 0.5}
                                x2={openLeft + openWidth - 4}
                                y2={floorSlabY + (groundY - floorSlabY) * 0.5}
                                stroke="#0F172A"
                                strokeWidth="1"
                              />
                            </g>
                          )}
                        </g>
                      );
                    })}

                  {/* Vertical Rainwater Drain Pipe (RWP) between bays */}
                  {bayIdx < elevationModel.bays.length - 1 && (
                    <g id={`rwp-pipe-${bayIdx}`}>
                      <line
                        x1={toSvgX(bay.xEndFeet)}
                        y1={toSvgY(elevationModel.totalHeightFeet - elevationModel.parapetHeightFeet - elevationModel.stairRoomHeightFeet)}
                        x2={toSvgX(bay.xEndFeet)}
                        y2={plinthY}
                        stroke="#64748B"
                        strokeWidth="2.5"
                      />
                      {/* Pipe Bracket Collars at each floor slab */}
                      {Array.from({ length: storyCount + 1 }).map((_, bi) => {
                        const bY = toSvgY(elevationModel.plinthHeightFeet + bi * elevationModel.storyHeightFeet);
                        return (
                          <rect
                            key={`pipe-bracket-${bayIdx}-${bi}`}
                            x={toSvgX(bay.xEndFeet) - 3}
                            y={bY - 2}
                            width="6"
                            height="4"
                            fill="#1E293B"
                          />
                        );
                      })}
                    </g>
                  )}
                </g>
              );
            })}

            {/* Floor Slab Division Continuous Horizontal Lines */}
            {Array.from({ length: storyCount }).map((_, si) => {
              const floorElev = elevationModel.plinthHeightFeet + (si + 1) * elevationModel.storyHeightFeet;
              const fY = toSvgY(floorElev);
              return (
                <line
                  key={`floor-slab-line-${si}`}
                  x1={buildingLeftX}
                  y1={fY}
                  x2={buildingRightX}
                  y2={fY}
                  stroke="#0F172A"
                  strokeWidth="1.5"
                />
              );
            })}
          </g>

          {/* 5. STRUCTURAL DATUM LEVEL MARKERS (AutoCAD Quartered Circle Symbols on Left) */}
          {showDatums && (
            <g id="datum-levels">
              {elevationModel.datumLevels.map((lvl) => {
                const y = toSvgY(lvl.elevationFeet);
                const bubbleX = 175; // Datum text and symbol X position

                return (
                  <g key={lvl.id} id={`datum-${lvl.id}`}>
                    {/* Horizontal Extension Guideline stretching across building */}
                    <line
                      x1={bubbleX + 16}
                      y1={y}
                      x2={buildingRightX + 15}
                      y2={y}
                      stroke={lvl.isMajor ? "#64748B" : "#94A3B8"}
                      strokeWidth={lvl.isMajor ? "0.8" : "0.5"}
                      strokeDasharray={lvl.isMajor ? "6 3 1 3" : "4 4"}
                    />

                    {/* Standard AutoCAD Level Symbol: Quartered Circle (Alternating Black & White) */}
                    <circle cx={bubbleX} cy={y} r="8.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.2" />
                    {/* Top-Right Wedge (Black) */}
                    <path
                      d={`M ${bubbleX} ${y} L ${bubbleX} ${y - 8.5} A 8.5 8.5 0 0 1 ${bubbleX + 8.5} ${y} Z`}
                      fill="#0F172A"
                    />
                    {/* Bottom-Left Wedge (Black) */}
                    <path
                      d={`M ${bubbleX} ${y} L ${bubbleX} ${y + 8.5} A 8.5 8.5 0 0 1 ${bubbleX - 8.5} ${y} Z`}
                      fill="#0F172A"
                    />
                    {/* Crosshairs extending through circle */}
                    <line x1={bubbleX - 11} y1={y} x2={bubbleX + 11} y2={y} stroke="#0F172A" strokeWidth="0.8" />
                    <line x1={bubbleX} y1={y - 11} x2={bubbleX} y2={y + 11} stroke="#0F172A" strokeWidth="0.8" />

                    {/* Level Name & Elevation Text Callout */}
                    <text
                      x={bubbleX - 16}
                      y={y - 3}
                      textAnchor="end"
                      className="text-[9px] font-bold fill-stone-900"
                      style={{ fontFamily: "'Courier New', Courier, monospace" }}
                    >
                      {lvl.name}
                    </text>
                    <text
                      x={bubbleX - 16}
                      y={y + 8}
                      textAnchor="end"
                      className="text-[9px] font-mono fill-stone-600"
                      style={{ fontFamily: "'Courier New', Courier, monospace" }}
                    >
                      {lvl.elevationFormatted}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* 6. VERTICAL DIMENSION STRINGS WITH 45-DEGREE ARCHITECTURAL TICKS (Right Side) */}
          {showDimensions && (
            <g id="vertical-dimensions">
              {(() => {
                const dimX = buildingRightX + 45;

                return (
                  <>
                    {/* Continuous Vertical Dimension Backbone Line */}
                    <line
                      x1={dimX}
                      y1={toSvgY(elevationModel.totalHeightFeet)}
                      x2={dimX}
                      y2={groundY}
                      stroke="#0F172A"
                      strokeWidth="1.2"
                    />

                    {/* Each Dimension Segment with 45-deg Architectural Ticks */}
                    {elevationModel.verticalDimensions.map((dim) => {
                      const startY = toSvgY(dim.startFeet);
                      const endY = toSvgY(dim.endFeet);
                      const midY = (startY + endY) / 2;

                      return (
                        <g key={dim.id}>
                          {/* 45-degree Architectural Tick at Start */}
                          <line
                            x1={dimX - 5}
                            y1={startY + 5}
                            x2={dimX + 5}
                            y2={startY - 5}
                            stroke="#0F172A"
                            strokeWidth="2.0"
                          />
                          {/* 45-degree Architectural Tick at End */}
                          <line
                            x1={dimX - 5}
                            y1={endY + 5}
                            x2={dimX + 5}
                            y2={endY - 5}
                            stroke="#0F172A"
                            strokeWidth="2.0"
                          />

                          {/* Leader lines back to building */}
                          <line
                            x1={buildingRightX + 8}
                            y1={startY}
                            x2={dimX + 12}
                            y2={startY}
                            stroke="#94A3B8"
                            strokeWidth="0.6"
                          />
                          <line
                            x1={buildingRightX + 8}
                            y1={endY}
                            x2={dimX + 12}
                            y2={endY}
                            stroke="#94A3B8"
                            strokeWidth="0.6"
                          />

                          {/* Dimension Value Text */}
                          <text
                            x={dimX + 14}
                            y={midY + 3}
                            textAnchor="start"
                            className="text-[9px] font-mono font-bold fill-stone-800"
                            style={{ fontFamily: "'Courier New', Courier, monospace" }}
                          >
                            {dim.valueFormatted}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </g>
          )}

          {/* 7. HORIZONTAL BAY DIMENSION STRINGS (Bottom) */}
          {showDimensions && (
            <g id="horizontal-dimensions">
              {(() => {
                const dimY = groundY + 50;

                return (
                  <>
                    {/* Continuous Horizontal Dimension Line */}
                    <line
                      x1={buildingLeftX}
                      y1={dimY}
                      x2={buildingRightX}
                      y2={dimY}
                      stroke="#0F172A"
                      strokeWidth="1.2"
                    />

                    {elevationModel.horizontalDimensions.map((dim) => {
                      const startX = toSvgX(dim.startFeet);
                      const endX = toSvgX(dim.endFeet);
                      const midX = (startX + endX) / 2;

                      return (
                        <g key={dim.id}>
                          {/* 45-degree Architectural Tick at Start */}
                          <line
                            x1={startX - 5}
                            y1={dimY + 5}
                            x2={startX + 5}
                            y2={dimY - 5}
                            stroke="#0F172A"
                            strokeWidth="2.0"
                          />
                          {/* 45-degree Architectural Tick at End */}
                          <line
                            x1={endX - 5}
                            y1={dimY + 5}
                            x2={endX + 5}
                            y2={dimY - 5}
                            stroke="#0F172A"
                            strokeWidth="2.0"
                          />

                          {/* Leader Line down from building base */}
                          <line
                            x1={startX}
                            y1={groundY + 5}
                            x2={startX}
                            y2={dimY + 8}
                            stroke="#94A3B8"
                            strokeWidth="0.6"
                          />
                          <line
                            x1={endX}
                            y1={groundY + 5}
                            x2={endX}
                            y2={dimY + 8}
                            stroke="#94A3B8"
                            strokeWidth="0.6"
                          />

                          {/* Bay Dimension Value & Room Label */}
                          <text
                            x={midX}
                            y={dimY + 14}
                            textAnchor="middle"
                            className="text-[9px] font-mono font-bold fill-stone-900"
                            style={{ fontFamily: "'Courier New', Courier, monospace" }}
                          >
                            {dim.valueFormatted}
                          </text>
                          {dim.label && (
                            <text
                              x={midX}
                              y={dimY + 25}
                              textAnchor="middle"
                              className="text-[8px] font-mono fill-stone-600"
                              style={{ fontFamily: "'Courier New', Courier, monospace" }}
                            >
                              {dim.label.replace(dim.valueFormatted, "").trim()}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </g>
          )}

          {/* 8. ARCHITECTURAL ANNOTATION CALLOUT LABELS (Pointers matching Image 2) */}
          {showAnnotations && (
            <g id="architectural-notes">
              {(() => {
                const noteX = buildingRightX + 85;

                const notes = [
                  { text: "VERANDAH BALCONY", sub: "(VER 3'-0\")", y: toSvgY(46.0), elemY: toSvgY(48.0) },
                  { text: "M.S. BALCONY RAILING", sub: "", y: toSvgY(41.5), elemY: toSvgY(42.5) },
                  { text: "ALUMINUM SLIDING", sub: "GLASS DOORS", y: toSvgY(34.0), elemY: toSvgY(35.5) },
                  { text: "CONCRETE SUNSHADE /", sub: "CHAJJA", y: toSvgY(26.0), elemY: toSvgY(28.0) },
                  { text: "EXTERIOR PLASTER FINISH", sub: "", y: toSvgY(20.0), elemY: toSvgY(21.5) },
                  { text: "RAINWATER DRAIN PIPE", sub: "(RWP)", y: toSvgY(14.0), elemY: toSvgY(15.0) },
                  { text: "PLINTH BEAM", sub: "FOUNDATION", y: toSvgY(1.0), elemY: plinthY },
                ];

                return notes.map((note, ni) => (
                  <g key={`note-${ni}`}>
                    {/* Leader Line with arrowhead pointer */}
                    <line
                      x1={buildingRightX + 3}
                      y1={note.elemY}
                      x2={noteX}
                      y2={note.y}
                      stroke="#475569"
                      strokeWidth="0.8"
                    />
                    <circle cx={buildingRightX + 3} cy={note.elemY} r="2.5" fill="#0F172A" />

                    {/* Text Annotation */}
                    <text
                      x={noteX + 4}
                      y={note.y - 1}
                      className="text-[8px] font-bold fill-stone-900"
                      style={{ fontFamily: "'Courier New', Courier, monospace" }}
                    >
                      {note.text}
                    </text>
                    {note.sub && (
                      <text
                        x={noteX + 4}
                        y={note.y + 9}
                        className="text-[8px] fill-stone-600"
                        style={{ fontFamily: "'Courier New', Courier, monospace" }}
                      >
                        {note.sub}
                      </text>
                    )}
                  </g>
                ));
              })()}
            </g>
          )}

          {/* 9. OFFICIAL ARCHITECTURAL DRAWING TITLE BLOCK (AutoCAD Standard Footer) */}
          <g id="drawing-title-block">
            {/* Title Block Box Border */}
            <rect
              x="28"
              y="820"
              width={SHEET_WIDTH - 56}
              height="65"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="2.2"
            />

            {/* Cell 1: Project Name */}
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

            {/* Cell 2: Drawing Title */}
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
              {elevationModel.drawingMetadata.drawingTitle}
            </text>

            {/* Cell 3: Scale & Scale Bar */}
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
              {elevationModel.drawingMetadata.scale}
            </text>
            {/* Visual Graphic Scale Bar */}
            <rect x="795" y="862" width="130" height="7" fill="#F1F5F9" stroke="#0F172A" strokeWidth="0.8" />
            <rect x="795" y="862" width="32" height="7" fill="#0F172A" />
            <rect x="859" y="862" width="32" height="7" fill="#0F172A" />
            <text x="795" y="878" className="text-[7px] font-mono fill-stone-500">0</text>
            <text x="827" y="878" className="text-[7px] font-mono fill-stone-500">1</text>
            <text x="859" y="878" className="text-[7px] font-mono fill-stone-500">2</text>
            <text x="925" y="878" className="text-[7px] font-mono fill-stone-500">4m / 12ft</text>

            {/* Cell 4: North Arrow Symbol */}
            <line x1="1050" y1="820" x2="1050" y2="885" stroke="#0F172A" strokeWidth="1.5" />
            <text x="980" y="836" className="text-[8px] font-bold uppercase tracking-wider fill-stone-500">
              North:
            </text>
            <g transform="translate(1010, 856)">
              <circle cx="0" cy="0" r="13" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.2" />
              {/* North Arrowhead */}
              <polygon points="0,-12 5,8 0,4" fill="#0F172A" />
              <polygon points="0,-12 -5,8 0,4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />
              <text x="-3" y="-14" className="text-[8px] font-bold fill-stone-900">N</text>
            </g>

            {/* Cell 5: Date */}
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

            {/* Cell 6: Sheet & Revision */}
            <text x="1150" y="836" className="text-[8px] font-bold uppercase tracking-wider fill-stone-500">
              Sheet:
            </text>
            <text
              x="1150"
              y="864"
              className="text-base font-black fill-stone-950 tracking-wider"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              {elevationModel.drawingMetadata.sheet}
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
              {elevationModel.drawingMetadata.revision}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
