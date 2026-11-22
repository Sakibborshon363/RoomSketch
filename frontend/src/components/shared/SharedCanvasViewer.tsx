"use client";

import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Line, Text, Group, Circle } from "react-konva";
import Konva from "konva";
import { FloorLayoutData, RoomItem, UnitSystem } from "@/types/editor";
import { formatDimension, formatArea } from "@/lib/utils";
import FurnitureShape from "@/components/editor/FurnitureShape";
import DoorWindowShape from "@/components/editor/DoorWindowShape";
import { Maximize2, RotateCcw } from "lucide-react";

interface SharedCanvasViewerProps {
  layoutData: FloorLayoutData;
  unit: UnitSystem;
  showGrid: boolean;
  showMeasurements: boolean;
}

export default function SharedCanvasViewer({
  layoutData,
  unit,
  showGrid,
  showMeasurements,
}: SharedCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });
  const [zoom, setZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 100, y: 80 });

  const pxToMeters = (px: number) => px * 0.04;

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

    setZoom(Math.round(newScale * 100) / 100);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const fitToScreen = () => {
    const rooms = layoutData.rooms || [];
    if (rooms.length === 0) {
      setZoom(1);
      setStagePos({ x: 100, y: 80 });
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    rooms.forEach((r) => {
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.width);
      maxY = Math.max(maxY, r.y + r.height);
    });

    const padding = 120;
    const boundingW = maxX - minX + padding * 2;
    const boundingH = maxY - minY + padding * 2;

    const viewportW = dimensions.width;
    const viewportH = dimensions.height;

    const scaleX = viewportW / boundingW;
    const scaleY = viewportH / boundingH;
    const scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.4), 1.5);

    const stageX = (viewportW - (maxX - minX) * scale) / 2 - minX * scale;
    const stageY = (viewportH - (maxY - minY) * scale) / 2 - minY * scale;

    setZoom(Math.round(scale * 100) / 100);
    setStagePos({ x: stageX, y: stageY });
  };

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      fitToScreen();
    }
  }, [dimensions.width, dimensions.height, layoutData]);

  // Floor texture pattern generator
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

    if (mat.includes("tile") || mat === "ceramic_sand") {
      const tileSize = 24;
      const cols = Math.floor(innerW / tileSize);
      const rows = Math.floor(innerH / tileSize);
      const lines = [];
      for (let c = 1; c <= cols; c++) {
        lines.push(
          <Line
            key={`t-col-${c}`}
            points={[innerX + c * tileSize, innerY, innerX + c * tileSize, innerY + innerH]}
            stroke="#FFFFFF"
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
            stroke="#FFFFFF"
            strokeWidth={1}
            opacity={0.35}
          />
        );
      }
      return <Group listening={false}>{lines}</Group>;
    }

    return null;
  };

  const rooms = layoutData.rooms || [];
  const furniture = layoutData.furniture || [];
  const doorsWindows = layoutData.doorsWindows || [];

  return (
    <div ref={containerRef} className="relative h-full w-full bg-[#FBFBFA] cursor-grab active:cursor-grabbing">
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={zoom}
        scaleY={zoom}
        x={stagePos.x}
        y={stagePos.y}
        draggable
        onWheel={handleWheel}
        onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
      >
        {/* Dot Grid */}
        {showGrid && (
          <Layer listening={false}>
            {(() => {
              const dots = [];
              const startX = -1000;
              const endX = 3000;
              const startY = -1000;
              const endY = 3000;
              const step = 40;

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

        {/* Rooms Layer */}
        <Layer>
          {rooms.map((room) => {
            const areaInSqM = pxToMeters(room.width) * pxToMeters(room.height);

            return (
              <Group key={room.id} x={room.x} y={room.y}>
                {/* Structural Outer Wall */}
                <Rect
                  x={-room.wallThickness / 2}
                  y={-room.wallThickness / 2}
                  width={room.width + room.wallThickness}
                  height={room.height + room.wallThickness}
                  fill={room.wallColor || "#292524"}
                  cornerRadius={2}
                />

                {/* Interior Floor Fill */}
                <Rect
                  x={room.wallThickness / 2}
                  y={room.wallThickness / 2}
                  width={room.width - room.wallThickness}
                  height={room.height - room.wallThickness}
                  fill={room.floorColor || "#EBDCCB"}
                  cornerRadius={1}
                />

                {/* Texture Pattern */}
                {renderFloorTexture(room)}

                {/* Room Center Name & Area Badge */}
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

                {/* Dimension Indicators along walls */}
                {showMeasurements && (
                  <>
                    <Group y={-room.wallThickness - 14}>
                      <Line points={[0, 0, room.width, 0]} stroke="#78716C" strokeWidth={1} />
                      <Line points={[0, -4, 0, 4]} stroke="#78716C" strokeWidth={1} />
                      <Line points={[room.width, -4, room.width, 4]} stroke="#78716C" strokeWidth={1} />
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
                    <Group x={room.width + room.wallThickness + 14}>
                      <Line points={[0, 0, 0, room.height]} stroke="#78716C" strokeWidth={1} />
                      <Line points={[-4, 0, 4, 0]} stroke="#78716C" strokeWidth={1} />
                      <Line points={[-4, room.height, 4, room.height]} stroke="#78716C" strokeWidth={1} />
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
              </Group>
            );
          })}

          {/* Doors & Windows */}
          {doorsWindows.map((item) => (
            <DoorWindowShape
              key={item.id}
              item={item}
              isSelected={false}
              unit={unit}
              pxToMeters={pxToMeters}
              snap={(v) => v}
              onSelect={() => {}}
              onUpdate={() => {}}
              onRotate={() => {}}
              onDuplicate={() => {}}
              onDelete={() => {}}
            />
          ))}

          {/* Furniture */}
          {[...furniture]
            .filter((f) => f.isVisible !== false)
            .sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1))
            .map((item) => (
              <FurnitureShape
                key={item.id}
                item={item}
                isSelected={false}
                hasCollision={false}
                isOutOfBounds={false}
                unit={unit}
                pxToMeters={pxToMeters}
                snap={(v) => v}
                onSelect={() => {}}
                onUpdate={() => {}}
                onRotate={() => {}}
                onDuplicate={() => {}}
                onDelete={() => {}}
                onToggleLock={() => {}}
              />
            ))}
        </Layer>
      </Stage>

      {/* Floating Canvas Controls (Fit to screen & Zoom reset) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-2xl border border-stone-200/90 bg-white/95 p-1.5 shadow-sm backdrop-blur-sm">
        <button
          onClick={fitToScreen}
          className="rounded-xl p-2 text-stone-600 hover:bg-stone-100 transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1.0);
            setStagePos({ x: 120, y: 80 });
          }}
          className="rounded-xl p-2 text-stone-600 hover:bg-stone-100 transition-colors"
          title="Reset Zoom (100%)"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <span className="px-2 text-xs font-bold text-stone-700">
          {Math.round(zoom * 100)}%
        </span>
      </div>
    </div>
  );
}
