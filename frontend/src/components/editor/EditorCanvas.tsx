"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Stage, Layer, Rect, Line, Text, Group, Circle } from "react-konva";
import Konva from "konva";
import { useEditorStore } from "@/store/editorStore";
import { RoomItem } from "@/types/editor";
import { formatDimension, formatArea } from "@/lib/utils";
import FurnitureShape from "./FurnitureShape";
import DoorWindowShape from "./DoorWindowShape";
import { validateLayout } from "@/lib/collisionDetection";

export default function EditorCanvas() {
  const {
    rooms,
    doorsWindows,
    furniture,
    selectedId,
    activeTool,
    zoom,
    stagePos,
    gridSize,
    showGrid,
    showMeasurements,
    snapToGrid,
    showFurniture,
    showRoomLabels,
    unit,
    setZoom,
    setStagePos,
    setCursorPos,
    setSelection,
    addRoom,
    updateRoom,
    addFurniture,
    updateFurniture,
    deleteFurniture,
    duplicateFurniture,
    rotateFurniture,
    toggleFurnitureLock,
    addDoorWindow,
    updateDoorWindow,
    deleteDoorWindow,
    duplicateDoorWindow,
    rotateDoorWindow,
    setActiveTool,
  } = useEditorStore();

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });

  // SAT Collision & Containment Layout Validation Engine (Phase 5)
  const { warnings, collidingIds, outOfBoundsIds } = useMemo(
    () => validateLayout(rooms, furniture, doorsWindows),
    [rooms, furniture, doorsWindows]
  );

  // Drawing state for new room
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);

  // Resize handler for responsive canvas
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Snap coordinate helper
  const snap = useCallback(
    (val: number) => {
      if (!snapToGrid) return Math.round(val);
      return Math.round(val / gridSize) * gridSize;
    },
    [snapToGrid, gridSize]
  );

  // Mouse wheel zoom centered on cursor
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.08;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    newScale = Math.max(0.2, Math.min(newScale, 3.0));

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setZoom(Math.round(newScale * 100) / 100);
    setStagePos(newPos);
  };

  // Architectural Floor Texture Overlay Generator (Phase 7)
  const renderFloorTexture = (room: RoomItem) => {
    const innerX = room.wallThickness / 2;
    const innerY = room.wallThickness / 2;
    const innerW = room.width - room.wallThickness;
    const innerH = room.height - room.wallThickness;
    const mat = room.floorMaterial || "warm_oak";

    if (mat === "warm_oak" || mat === "dark_walnut") {
      const plankHeight = 22;
      const count = Math.floor(innerH / plankHeight);
      const lines = [];
      for (let i = 1; i <= count; i++) {
        const y = innerY + i * plankHeight;
        lines.push(
          <Line
            key={`plank-${i}`}
            points={[innerX, y, innerX + innerW, y]}
            stroke="#1C1917"
            strokeWidth={0.8}
            opacity={0.08}
          />
        );
      }
      return <Group listening={false}>{lines}</Group>;
    }

    if (mat === "herringbone_parquet") {
      const step = 24;
      const count = Math.floor((innerW + innerH) / step);
      const lines = [];
      for (let i = 0; i <= count; i++) {
        const offset = i * step;
        lines.push(
          <Line
            key={`chevron-${i}`}
            points={[
              Math.max(innerX, innerX + offset - innerH),
              Math.min(innerY + innerH, innerY + offset),
              Math.min(innerX + innerW, innerX + offset),
              Math.max(innerY, innerY + offset - innerW),
            ]}
            stroke="#1C1917"
            strokeWidth={0.7}
            opacity={0.09}
            dash={[12, 12]}
          />
        );
      }
      return <Group listening={false}>{lines}</Group>;
    }

    if (mat.includes("tile") || mat === "ceramic_sand" || mat === "slate_charcoal") {
      const tileSize = 24;
      const cols = Math.floor(innerW / tileSize);
      const rows = Math.floor(innerH / tileSize);
      const lines = [];
      for (let c = 1; c <= cols; c++) {
        lines.push(
          <Line
            key={`t-col-${c}`}
            points={[innerX + c * tileSize, innerY, innerX + c * tileSize, innerY + innerH]}
            stroke={mat === "slate_charcoal" ? "#1E293B" : "#FFFFFF"}
            strokeWidth={1}
            opacity={0.35}
          />
        );
      }
      for (let r = 1; r <= rows; r++) {
        lines.push(
          <Line
            key={`t-row-${r}`}
            points={[innerX, innerY + r * tileSize, innerX + innerW, innerY + r * tileSize]}
            stroke={mat === "slate_charcoal" ? "#1E293B" : "#FFFFFF"}
            strokeWidth={1}
            opacity={0.35}
          />
        );
      }
      return <Group listening={false}>{lines}</Group>;
    }

    if (mat === "marble_white") {
      return (
        <Group listening={false}>
          <Line
            points={[
              innerX + innerW * 0.1,
              innerY + innerH * 0.2,
              innerX + innerW * 0.4,
              innerY + innerH * 0.6,
              innerX + innerW * 0.8,
              innerY + innerH * 0.9,
            ]}
            stroke="#94A3B8"
            strokeWidth={1}
            tension={0.5}
            opacity={0.2}
          />
        </Group>
      );
    }

    if (mat === "terrazzo_speckle") {
      return (
        <Group listening={false}>
          {[0.2, 0.4, 0.6, 0.8].flatMap((rx, i) =>
            [0.25, 0.5, 0.75].map((ry, j) => (
              <Circle
                key={`terrazzo-${i}-${j}`}
                x={innerX + innerW * rx}
                y={innerY + innerH * ry}
                radius={2}
                fill={(i + j) % 2 === 0 ? "#78716C" : "#A8A29E"}
                opacity={0.25}
              />
            ))
          )}
        </Group>
      );
    }

    return null;
  };

  // Stage mouse events
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // If clicking on empty canvas (stage background), deselect
    if (e.target === e.target.getStage()) {
      if (activeTool !== "draw_room") {
        setSelection(null, null);
      }
    }

    if (activeTool === "draw_room") {
      const stage = stageRef.current;
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const scale = stage.scaleX();
      const rawX = (pointer.x - stage.x()) / scale;
      const rawY = (pointer.y - stage.y()) / scale;

      const startX = snap(rawX);
      const startY = snap(rawY);

      setIsDrawing(true);
      setDrawStart({ x: startX, y: startY });
      setDrawCurrent({ x: startX, y: startY });
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scale = stage.scaleX();
    const rawX = (pointer.x - stage.x()) / scale;
    const rawY = (pointer.y - stage.y()) / scale;

    setCursorPos({ x: rawX * 0.04, y: rawY * 0.04 });

    if (isDrawing && drawStart) {
      setDrawCurrent({ x: snap(rawX), y: snap(rawY) });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && drawStart && drawCurrent) {
      const x = Math.min(drawStart.x, drawCurrent.x);
      const y = Math.min(drawStart.y, drawCurrent.y);
      const width = Math.abs(drawCurrent.x - drawStart.x);
      const height = Math.abs(drawCurrent.y - drawStart.y);

      // Only create if meaningful size (at least 60x60)
      if (width >= 60 && height >= 60) {
        addRoom({
          name: `Room ${rooms.length + 1}`,
          x,
          y,
          width,
          height,
          wallThickness: 12,
          wallColor: "#292524",
          floorColor: "#EBDCCB",
          floorMaterial: "warm_oak",
        });
      }

      setIsDrawing(false);
      setDrawStart(null);
      setDrawCurrent(null);
      setActiveTool("select");
    }
  };

  // Convert canvas pixel units to meters (100px = approx 4.0 meters, scale = 0.04)
  const pxToMeters = (px: number) => px * 0.04;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#FBFBFA] overflow-hidden select-none cursor-default"
      style={{
        cursor:
          activeTool === "pan"
            ? "grab"
            : activeTool === "draw_room"
            ? "crosshair"
            : "default",
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData("application/json");
        if (!raw) return;
        try {
          const itemData = JSON.parse(raw);
          const stage = stageRef.current;
          if (!stage) return;
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const stageX = stage.x();
          const stageY = stage.y();
          const scale = stage.scaleX();
          const canvasX = snap((mouseX - stageX) / scale);
          const canvasY = snap((mouseY - stageY) / scale);

          if (itemData.openingType || itemData.type === "DOOR" || itemData.type === "WINDOW") {
            addDoorWindow({
              ...itemData,
              x: canvasX,
              y: canvasY,
            });
          } else {
            addFurniture({
              ...itemData,
              x: canvasX,
              y: canvasY,
            });
          }
        } catch (err) {
          console.error("Drop furniture failed", err);
        }
      }}
    >
      {/* Floating Layout Warnings Badge (Phase 5) */}
      {warnings.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-amber-300/90 bg-amber-50/95 px-3.5 py-1.5 text-xs font-bold text-amber-800 shadow-sm backdrop-blur-sm animate-in fade-in duration-200">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span>{warnings.length} Layout Warning{warnings.length > 1 ? "s" : ""}</span>
          <span className="text-[11px] text-amber-700 font-medium hidden sm:inline">
            — {warnings[0].message}
          </span>
        </div>
      )}

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={zoom}
        scaleY={zoom}
        x={stagePos.x}
        y={stagePos.y}
        draggable={activeTool === "pan"}
        onDragEnd={(e) => {
          if (activeTool === "pan" || e.target === stageRef.current) {
            setStagePos({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Layer 1: Infinite Grid Lines */}
        {showGrid && (
          <Layer listening={false}>
            {/* Draw architectural subtle dot grid */}
            {(() => {
              const dots = [];
              const startX = -1000;
              const endX = 3000;
              const startY = -1000;
              const endY = 3000;
              const step = gridSize * 2; // 40px grid

              for (let x = startX; x <= endX; x += step) {
                for (let y = startY; y <= endY; y += step) {
                  dots.push(
                    <Circle
                      key={`grid-${x}-${y}`}
                      x={x}
                      y={y}
                      radius={1}
                      fill="#D6D1C7"
                      opacity={0.6}
                    />
                  );
                }
              }
              return dots;
            })()}
          </Layer>
        )}

        {/* Layer 2: Rooms Layer */}
        <Layer>
          {rooms.map((room) => {
            const isSelected = selectedId === room.id;
            const areaInSqM = pxToMeters(room.width) * pxToMeters(room.height);

            return (
              <Group
                key={room.id}
                x={room.x}
                y={room.y}
                draggable={activeTool === "select"}
                onClick={(e) => {
                  e.cancelBubble = true;
                  setSelection(room.id, "room");
                }}
                onDragEnd={(e) => {
                  const newX = snap(e.target.x());
                  const newY = snap(e.target.y());
                  e.target.position({ x: newX, y: newY });
                  updateRoom(room.id, { x: newX, y: newY });
                }}
              >
                {/* Room Outer Wall Border (Structural Wall Perimeter) */}
                <Rect
                  x={-room.wallThickness / 2}
                  y={-room.wallThickness / 2}
                  width={room.width + room.wallThickness}
                  height={room.height + room.wallThickness}
                  fill={room.wallColor || "#292524"}
                  cornerRadius={2}
                  shadowColor="#292524"
                  shadowBlur={isSelected ? 8 : 2}
                  shadowOpacity={isSelected ? 0.25 : 0.08}
                  shadowOffset={{ x: 0, y: 2 }}
                />

                {/* Room Interior Floor Fill */}
                <Rect
                  x={room.wallThickness / 2}
                  y={room.wallThickness / 2}
                  width={room.width - room.wallThickness}
                  height={room.height - room.wallThickness}
                  fill={room.floorColor || "#EBDCCB"}
                  cornerRadius={1}
                />

                {/* Architectural Texture Pattern Overlay (Phase 7) */}
                {renderFloorTexture(room)}

                {/* Selected Room Highlight Ring */}
                {isSelected && (
                  <Rect
                    x={-room.wallThickness / 2 - 4}
                    y={-room.wallThickness / 2 - 4}
                    width={room.width + room.wallThickness + 8}
                    height={room.height + room.wallThickness + 8}
                    stroke="#1E3A34"
                    strokeWidth={2}
                    dash={[6, 4]}
                    cornerRadius={4}
                  />
                )}

                {/* Room Center Name & Area Badge */}
                {showRoomLabels && (
                  <Group x={room.width / 2} y={room.height / 2}>
                    <Text
                      text={room.name}
                      fontSize={13}
                      fontFamily="sans-serif"
                      fontStyle="bold"
                      fill="#292524"
                      align="center"
                      offsetX={room.name.length * 3.5}
                      offsetY={12}
                      opacity={0.85}
                    />
                    <Text
                      text={formatArea(areaInSqM, unit)}
                      fontSize={11}
                      fontFamily="sans-serif"
                      fill="#665E54"
                      align="center"
                      offsetX={24}
                      offsetY={-4}
                    />
                  </Group>
                )}

                {/* Dimension Indicators along walls */}
                {showMeasurements && (
                  <>
                    {/* Top Wall Dimension (Width) */}
                    <Group y={-room.wallThickness - 14}>
                      <Line
                        points={[0, 0, room.width, 0]}
                        stroke="#78716C"
                        strokeWidth={1}
                      />
                      <Line points={[0, -4, 0, 4]} stroke="#78716C" strokeWidth={1} />
                      <Line
                        points={[room.width, -4, room.width, 4]}
                        stroke="#78716C"
                        strokeWidth={1}
                      />
                      <Text
                        text={formatDimension(pxToMeters(room.width), unit)}
                        fontSize={10}
                        fill="#57534E"
                        x={room.width / 2 - 16}
                        y={-12}
                        fontFamily="sans-serif"
                        fontStyle="600"
                      />
                    </Group>

                    {/* Right Wall Dimension (Height) */}
                    <Group x={room.width + room.wallThickness + 14}>
                      <Line
                        points={[0, 0, 0, room.height]}
                        stroke="#78716C"
                        strokeWidth={1}
                      />
                      <Line points={[-4, 0, 4, 0]} stroke="#78716C" strokeWidth={1} />
                      <Line
                        points={[-4, room.height, 4, room.height]}
                        stroke="#78716C"
                        strokeWidth={1}
                      />
                      <Text
                        text={formatDimension(pxToMeters(room.height), unit)}
                        fontSize={10}
                        fill="#57534E"
                        x={6}
                        y={room.height / 2 - 6}
                        fontFamily="sans-serif"
                        fontStyle="600"
                      />
                    </Group>
                  </>
                )}

                {/* Resize Handle at Bottom-Right Corner (when selected) */}
                {isSelected && (
                  <Rect
                    x={room.width - 6}
                    y={room.height - 6}
                    width={14}
                    height={14}
                    fill="#FFFFFF"
                    stroke="#1E3A34"
                    strokeWidth={2}
                    cornerRadius={2}
                    draggable
                    onDragMove={(e) => {
                      const newW = Math.max(60, snap(e.target.x()));
                      const newH = Math.max(60, snap(e.target.y()));
                      updateRoom(room.id, { width: newW, height: newH });
                    }}
                  />
                )}
              </Group>
            );
          })}

          {/* Doors & Windows Openings Layer (Phase 5) */}
          {doorsWindows.map((item) => (
            <DoorWindowShape
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              unit={unit}
              pxToMeters={pxToMeters}
              snap={snap}
              onSelect={() => setSelection(item.id, "door_window")}
              onUpdate={(updates) => updateDoorWindow(item.id, updates)}
              onRotate={(delta, isAbsolute) => rotateDoorWindow(item.id, delta, isAbsolute)}
              onDuplicate={() => duplicateDoorWindow(item.id)}
              onDelete={() => deleteDoorWindow(item.id)}
            />
          ))}

          {/* Furniture Layer (sorted by zIndex: rugs below, tables/sofas middle, lamps/decor top) */}
          {(showFurniture ?? true) &&
            [...furniture]
              .filter((f) => f.isVisible !== false)
              .sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1))
              .map((item) => (
                <FurnitureShape
                  key={item.id}
                  item={item}
                  isSelected={selectedId === item.id}
                  hasCollision={collidingIds.has(item.id)}
                  isOutOfBounds={outOfBoundsIds.has(item.id)}
                  unit={unit}
                  pxToMeters={pxToMeters}
                  snap={snap}
                  onSelect={() => setSelection(item.id, "furniture")}
                  onUpdate={(updates) => updateFurniture(item.id, updates)}
                  onRotate={(delta, isAbsolute) => rotateFurniture(item.id, delta, isAbsolute)}
                  onDuplicate={() => duplicateFurniture(item.id)}
                  onDelete={() => deleteFurniture(item.id)}
                  onToggleLock={() => toggleFurnitureLock(item.id)}
                />
              ))}

          {/* Real-time Drawing Preview when dragging with draw_room tool */}
          {isDrawing && drawStart && drawCurrent && (
            <Group>
              <Rect
                x={Math.min(drawStart.x, drawCurrent.x)}
                y={Math.min(drawStart.y, drawCurrent.y)}
                width={Math.abs(drawCurrent.x - drawStart.x)}
                height={Math.abs(drawCurrent.y - drawStart.y)}
                fill="rgba(30, 58, 52, 0.12)"
                stroke="#1E3A34"
                strokeWidth={2}
                dash={[6, 4]}
                cornerRadius={2}
              />
              <Text
                x={Math.min(drawStart.x, drawCurrent.x) + 10}
                y={Math.min(drawStart.y, drawCurrent.y) + 10}
                text={`${formatDimension(
                  pxToMeters(Math.abs(drawCurrent.x - drawStart.x)),
                  unit
                )} × ${formatDimension(
                  pxToMeters(Math.abs(drawCurrent.y - drawStart.y)),
                  unit
                )}`}
                fontSize={12}
                fontStyle="bold"
                fill="#1E3A34"
                fontFamily="sans-serif"
              />
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
}
