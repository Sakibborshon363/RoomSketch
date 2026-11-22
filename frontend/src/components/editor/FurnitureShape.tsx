"use client";

import React, { useRef, useState } from "react";
import { Group, Rect, Circle, Line, Text, Arc } from "react-konva";
import Konva from "konva";
import { FurnitureItem, UnitSystem } from "@/types/editor";
import { formatDimension } from "@/lib/utils";

interface FurnitureShapeProps {
  item: FurnitureItem;
  isSelected: boolean;
  hasCollision?: boolean;
  isOutOfBounds?: boolean;
  unit: UnitSystem;
  pxToMeters: (px: number) => number;
  snap: (val: number) => number;
  onSelect: () => void;
  onUpdate: (updates: Partial<FurnitureItem>) => void;
  onRotate: (delta: number, isAbsolute?: boolean) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
}

export default function FurnitureShape({
  item,
  isSelected,
  hasCollision = false,
  isOutOfBounds = false,
  unit,
  pxToMeters,
  snap,
  onSelect,
  onUpdate,
  onRotate,
  onDuplicate,
  onDelete,
  onToggleLock,
}: FurnitureShapeProps) {
  const groupRef = useRef<Konva.Group>(null);
  const [isRotating, setIsRotating] = useState(false);

  const { width, height, rotation, color, type, isLocked } = item;
  const cx = width / 2;
  const cy = height / 2;

  // Handle drag end for moving furniture
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (isLocked) return;
    const newX = snap(e.target.x());
    const newY = snap(e.target.y());
    onUpdate({ x: newX, y: newY });
  };

  // Dedicated architectural vector rendering based on furniture type
  const renderVectorGraphics = () => {
    switch (type) {
      // 1. LINEN SOFA & 2-SEATER LOVESEAT
      case "sofa_linen":
      case "sofa_2seater": {
        const armWidth = Math.min(14, width * 0.16);
        const backDepth = Math.min(16, height * 0.22);
        const isTriple = type === "sofa_linen";
        const seatW = (width - armWidth * 2);
        const cushionW = isTriple ? seatW / 3 : seatW / 2;

        return (
          <Group>
            {/* Main body shadow & base */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={color || "#C5BCAB"}
              stroke="#44403C"
              strokeWidth={1.5}
              cornerRadius={6}
            />
            {/* Backrest along top edge */}
            <Rect
              x={armWidth}
              y={2}
              width={width - armWidth * 2}
              height={backDepth}
              fill="#B8AE9C"
              stroke="#57534E"
              strokeWidth={1}
              cornerRadius={3}
            />
            {/* Left Armrest */}
            <Rect
              x={0}
              y={0}
              width={armWidth}
              height={height}
              fill="#AFA492"
              stroke="#57534E"
              strokeWidth={1}
              cornerRadius={[5, 0, 0, 5]}
            />
            {/* Right Armrest */}
            <Rect
              x={width - armWidth}
              y={0}
              width={armWidth}
              height={height}
              fill="#AFA492"
              stroke="#57534E"
              strokeWidth={1}
              cornerRadius={[0, 5, 5, 0]}
            />
            {/* Seat Cushions */}
            {isTriple ? (
              <>
                <Rect
                  x={armWidth + 2}
                  y={backDepth + 2}
                  width={cushionW - 3}
                  height={height - backDepth - 5}
                  fill={color || "#C5BCAB"}
                  stroke="#78716C"
                  strokeWidth={0.8}
                  cornerRadius={4}
                />
                <Rect
                  x={armWidth + cushionW + 1}
                  y={backDepth + 2}
                  width={cushionW - 2}
                  height={height - backDepth - 5}
                  fill={color || "#C5BCAB"}
                  stroke="#78716C"
                  strokeWidth={0.8}
                  cornerRadius={4}
                />
                <Rect
                  x={armWidth + cushionW * 2}
                  y={backDepth + 2}
                  width={cushionW - 3}
                  height={height - backDepth - 5}
                  fill={color || "#C5BCAB"}
                  stroke="#78716C"
                  strokeWidth={0.8}
                  cornerRadius={4}
                />
              </>
            ) : (
              <>
                <Rect
                  x={armWidth + 2}
                  y={backDepth + 2}
                  width={cushionW - 3}
                  height={height - backDepth - 5}
                  fill={color || "#C5BCAB"}
                  stroke="#78716C"
                  strokeWidth={0.8}
                  cornerRadius={4}
                />
                <Rect
                  x={armWidth + cushionW + 1}
                  y={backDepth + 2}
                  width={cushionW - 3}
                  height={height - backDepth - 5}
                  fill={color || "#C5BCAB"}
                  stroke="#78716C"
                  strokeWidth={0.8}
                  cornerRadius={4}
                />
              </>
            )}
          </Group>
        );
      }

      // 2. LOUNGE CHAIR / ACCENT ARMCHAIR
      case "chair_lounge": {
        const armW = width * 0.18;
        return (
          <Group>
            {/* Outer Shell */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={color || "#B38260"}
              stroke="#44403C"
              strokeWidth={1.5}
              cornerRadius={10}
            />
            {/* Curved Backrest */}
            <Rect
              x={armW}
              y={3}
              width={width - armW * 2}
              height={height * 0.28}
              fill="#9C6F4F"
              stroke="#57534E"
              strokeWidth={1}
              cornerRadius={6}
            />
            {/* Inner Cushion */}
            <Rect
              x={armW + 3}
              y={height * 0.28 + 3}
              width={width - armW * 2 - 6}
              height={height * 0.65}
              fill={color || "#B38260"}
              stroke="#57534E"
              strokeWidth={1}
              cornerRadius={6}
            />
          </Group>
        );
      }

      // 3. QUEEN / KING MASTER BED (Signature Architectural Bed)
      case "bed_queen":
      case "bed_king": {
        const headboardH = Math.min(16, height * 0.14);
        const pillowW = (width - 24) / 2;
        const pillowH = Math.min(26, height * 0.22);
        const duvetH = height - headboardH - pillowH + 10;

        return (
          <Group>
            {/* Wooden Frame / Base */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="#EAE5DC"
              stroke="#3D3833"
              strokeWidth={1.8}
              cornerRadius={4}
            />
            {/* Architectural Headboard bar */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={headboardH}
              fill="#5A4A3A"
              stroke="#3D3833"
              strokeWidth={1.2}
              cornerRadius={[4, 4, 0, 0]}
            />
            {/* Dual Pillows */}
            <Rect
              x={8}
              y={headboardH + 5}
              width={pillowW}
              height={pillowH}
              fill="#FDFDFC"
              stroke="#A8A29E"
              strokeWidth={1}
              cornerRadius={5}
            />
            <Rect
              x={width - 8 - pillowW}
              y={headboardH + 5}
              width={pillowW}
              height={pillowH}
              fill="#FDFDFC"
              stroke="#A8A29E"
              strokeWidth={1}
              cornerRadius={5}
            />
            {/* Pillow Crease accents */}
            <Line
              points={[8 + pillowW * 0.2, headboardH + 5 + pillowH / 2, 8 + pillowW * 0.8, headboardH + 5 + pillowH / 2]}
              stroke="#D6D3D1"
              strokeWidth={1}
            />
            <Line
              points={[width - 8 - pillowW * 0.8, headboardH + 5 + pillowH / 2, width - 8 - pillowW * 0.2, headboardH + 5 + pillowH / 2]}
              stroke="#D6D3D1"
              strokeWidth={1}
            />
            {/* Turned-down Duvet Blanket (Soft architectural sage / user color) */}
            <Rect
              x={4}
              y={height - duvetH}
              width={width - 8}
              height={duvetH - 4}
              fill={color || "#8EA69B"}
              stroke="#44403C"
              strokeWidth={1.2}
              cornerRadius={[8, 8, 3, 3]}
            />
            {/* Duvet fold flap */}
            <Rect
              x={4}
              y={height - duvetH}
              width={width - 8}
              height={14}
              fill="#7A9388"
              stroke="#44403C"
              strokeWidth={1}
              cornerRadius={[8, 8, 0, 0]}
            />
          </Group>
        );
      }

      // 4. BEDSIDE NIGHTSTAND
      case "nightstand": {
        return (
          <Group>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={color || "#A98462"}
              stroke="#44403C"
              strokeWidth={1.5}
              cornerRadius={3}
            />
            <Line
              points={[3, height * 0.35, width - 3, height * 0.35]}
              stroke="#57534E"
              strokeWidth={1}
            />
            {/* Drawer pull knob */}
            <Circle
              x={cx}
              y={height * 0.18}
              radius={2.5}
              fill="#D4AF37"
              stroke="#44403C"
              strokeWidth={0.8}
            />
          </Group>
        );
      }

      // 5. DINING TABLE (WITH SURROUNDING CHAIRS)
      case "table_dining_4":
      case "table_dining_round": {
        const isRound = type === "table_dining_round";
        const chairDepth = 14;
        const chairWidth = 24;

        if (isRound) {
          const tableRadius = Math.min(width, height) / 2 - 10;
          return (
            <Group>
              {/* Chairs around round table */}
              <Circle x={cx} y={10} radius={8} fill="#B8A793" stroke="#44403C" strokeWidth={1} />
              <Circle x={cx} y={height - 10} radius={8} fill="#B8A793" stroke="#44403C" strokeWidth={1} />
              <Circle x={10} y={cy} radius={8} fill="#B8A793" stroke="#44403C" strokeWidth={1} />
              <Circle x={width - 10} y={cy} radius={8} fill="#B8A793" stroke="#44403C" strokeWidth={1} />
              {/* Main Circular Tabletop */}
              <Circle
                x={cx}
                y={cy}
                radius={tableRadius}
                fill={color || "#916B49"}
                stroke="#3D3833"
                strokeWidth={1.8}
              />
            </Group>
          );
        }

        // Rectangular dining table with 4 chairs
        const tableMarginX = 14;
        const tableMarginY = 16;
        const tblW = width - tableMarginX * 2;
        const tblH = height - tableMarginY * 2;

        return (
          <Group>
            {/* Top Chairs */}
            <Rect
              x={cx - chairWidth - 4}
              y={2}
              width={chairWidth}
              height={chairDepth}
              fill="#B8A793"
              stroke="#44403C"
              strokeWidth={1}
              cornerRadius={3}
            />
            <Rect
              x={cx + 4}
              y={2}
              width={chairWidth}
              height={chairDepth}
              fill="#B8A793"
              stroke="#44403C"
              strokeWidth={1}
              cornerRadius={3}
            />
            {/* Bottom Chairs */}
            <Rect
              x={cx - chairWidth - 4}
              y={height - chairDepth - 2}
              width={chairWidth}
              height={chairDepth}
              fill="#B8A793"
              stroke="#44403C"
              strokeWidth={1}
              cornerRadius={3}
            />
            <Rect
              x={cx + 4}
              y={height - chairDepth - 2}
              width={chairWidth}
              height={chairDepth}
              fill="#B8A793"
              stroke="#44403C"
              strokeWidth={1}
              cornerRadius={3}
            />
            {/* Center Table */}
            <Rect
              x={tableMarginX}
              y={tableMarginY}
              width={tblW}
              height={tblH}
              fill={color || "#A07855"}
              stroke="#3D3833"
              strokeWidth={1.8}
              cornerRadius={5}
            />
          </Group>
        );
      }

      // 6. COFFEE TABLE (Scandinavian Rounded Pill / Oval)
      case "coffee_table": {
        return (
          <Group>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={color || "#A67A53"}
              stroke="#3D3833"
              strokeWidth={1.5}
              cornerRadius={Math.min(width, height) / 3}
            />
            <Rect
              x={4}
              y={4}
              width={width - 8}
              height={height - 8}
              stroke="#C49B72"
              strokeWidth={0.8}
              cornerRadius={Math.min(width, height) / 3 - 2}
            />
          </Group>
        );
      }

      // 7. KITCHEN COUNTER & SINK
      case "counter_sink":
      case "kitchen_prep": {
        const isSink = type === "counter_sink";
        return (
          <Group>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={color || "#637D71"}
              stroke="#292524"
              strokeWidth={1.5}
              cornerRadius={3}
            />
            {isSink && (
              <Group x={width * 0.3} y={height * 0.2}>
                {/* Basin cutout */}
                <Rect
                  x={0}
                  y={0}
                  width={width * 0.4}
                  height={height * 0.6}
                  fill="#E2E8F0"
                  stroke="#475569"
                  strokeWidth={1.2}
                  cornerRadius={4}
                />
                {/* Faucet circle & spout */}
                <Circle x={width * 0.2} y={6} radius={3.5} fill="#94A3B8" stroke="#334155" strokeWidth={1} />
                <Line points={[width * 0.2, 6, width * 0.2, 14]} stroke="#334155" strokeWidth={2} />
              </Group>
            )}
            {/* Front counter bevel edge line */}
            <Line points={[0, height - 3, width, height - 3]} stroke="#44403C" strokeWidth={0.8} />
          </Group>
        );
      }

      // 8. REFRIGERATOR
      case "refrigerator": {
        return (
          <Group>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={color || "#D5DDDE"}
              stroke="#334155"
              strokeWidth={1.5}
              cornerRadius={3}
            />
            {/* French door center seam */}
            <Line points={[cx, 0, cx, height]} stroke="#64748B" strokeWidth={1} />
            {/* Handles */}
            <Line points={[cx - 4, height * 0.3, cx - 4, height * 0.7]} stroke="#1E293B" strokeWidth={2} />
            <Line points={[cx + 4, height * 0.3, cx + 4, height * 0.7]} stroke="#1E293B" strokeWidth={2} />
          </Group>
        );
      }

      // 9. BATHTUB (Ergonomic soaking tub)
      case "bathtub": {
        return (
          <Group>
            {/* Outer ceramic rim */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="#FFFFFF"
              stroke="#57534E"
              strokeWidth={1.5}
              cornerRadius={12}
            />
            {/* Inner tub basin */}
            <Rect
              x={6}
              y={6}
              width={width - 12}
              height={height - 12}
              fill="#E0F2FE"
              stroke="#7DD3FC"
              strokeWidth={1}
              cornerRadius={Math.min(width - 12, height - 12) / 2.5}
            />
            {/* Drain plug */}
            <Circle x={cx} y={height - 18} radius={3} fill="#94A3B8" stroke="#475569" strokeWidth={1} />
            {/* Chrome mixer / faucet */}
            <Circle x={cx} y={10} radius={3} fill="#64748B" />
          </Group>
        );
      }

      // 10. TOILET
      case "toilet": {
        const tankH = height * 0.3;
        return (
          <Group>
            {/* Cistern Tank */}
            <Rect
              x={2}
              y={0}
              width={width - 4}
              height={tankH}
              fill="#FFFFFF"
              stroke="#57534E"
              strokeWidth={1.5}
              cornerRadius={3}
            />
            {/* Flush button */}
            <Circle x={cx} y={tankH / 2} radius={3} fill="#CBD5E1" stroke="#64748B" strokeWidth={0.8} />
            {/* Toilet Bowl (Oval) */}
            <Rect
              x={4}
              y={tankH}
              width={width - 8}
              height={height - tankH}
              fill="#FFFFFF"
              stroke="#57534E"
              strokeWidth={1.5}
              cornerRadius={[0, 0, (width - 8) / 2, (width - 8) / 2]}
            />
            {/* Inner bowl contour */}
            <Rect
              x={8}
              y={tankH + 4}
              width={width - 16}
              height={height - tankH - 8}
              fill="#E0F2FE"
              stroke="#BAE6FD"
              strokeWidth={1}
              cornerRadius={[0, 0, (width - 16) / 2, (width - 16) / 2]}
            />
          </Group>
        );
      }

      // 11. WASHBASIN VANITY
      case "washbasin": {
        return (
          <Group>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={color || "#CFDCDE"}
              stroke="#57534E"
              strokeWidth={1.5}
              cornerRadius={4}
            />
            {/* Oval Ceramic Sink Basin */}
            <Rect
              x={6}
              y={6}
              width={width - 12}
              height={height - 12}
              fill="#FFFFFF"
              stroke="#94A3B8"
              strokeWidth={1.2}
              cornerRadius={Math.min(width - 12, height - 12) / 2}
            />
            {/* Faucet */}
            <Circle x={cx} y={10} radius={2.5} fill="#64748B" />
          </Group>
        );
      }

      // 12. INDOOR POTTED BOTANICAL PLANT (Match reference image leafy plant!)
      case "plant_potted": {
        const potRadius = Math.min(width, height) * 0.22;
        const leafLength = Math.min(width, height) * 0.42;

        return (
          <Group>
            {/* 6 Radiating Organic Petals / Leaves */}
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const leafX = cx + Math.cos(rad) * leafLength;
              const leafY = cy + Math.sin(rad) * leafLength;
              return (
                <Circle
                  key={deg}
                  x={leafX}
                  y={leafY}
                  radius={potRadius * 1.05}
                  fill={deg % 120 === 0 ? "#335C43" : (color || "#4A6B53")}
                  opacity={0.88}
                />
              );
            })}
            {/* Center Terracotta Planter Pot */}
            <Circle
              x={cx}
              y={cy}
              radius={potRadius}
              fill="#A65F38"
              stroke="#44403C"
              strokeWidth={1.5}
            />
            <Circle
              x={cx}
              y={cy}
              radius={potRadius * 0.7}
              fill="#52392E"
            />
          </Group>
        );
      }

      // 13. WOVEN AREA RUG
      case "rug_woven": {
        return (
          <Group>
            {/* Outer Rug */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={color || "#E5DEC9"}
              stroke="#78716C"
              strokeWidth={1}
              dash={[6, 3]}
              cornerRadius={4}
            />
            {/* Inner Border Frame */}
            <Rect
              x={8}
              y={8}
              width={width - 16}
              height={height - 16}
              stroke="#A8A29E"
              strokeWidth={1}
              cornerRadius={2}
            />
          </Group>
        );
      }

      // 14. EXECUTIVE WORK DESK & CHAIR
      case "desk_office": {
        return (
          <Group>
            {/* Desk Top */}
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={color || "#826346"}
              stroke="#3D3833"
              strokeWidth={1.5}
              cornerRadius={4}
            />
            {/* Laptop / Monitor footprint */}
            <Rect
              x={cx - 16}
              y={6}
              width={32}
              height={18}
              fill="#475569"
              stroke="#1E293B"
              strokeWidth={1}
              cornerRadius={2}
            />
            {/* Cable pass grommet */}
            <Circle x={width - 12} y={10} radius={2.5} fill="#1E293B" />
          </Group>
        );
      }

      // 15. OFFICE CHAIR (5-spoke caster swivel)
      case "chair_office": {
        return (
          <Group>
            <Circle x={cx} y={cy} radius={Math.min(width, height) / 2.2} fill={color || "#3D3935"} stroke="#1C1917" strokeWidth={1.5} />
            {/* Backrest curved bar */}
            <Rect
              x={cx - 14}
              y={cy - Math.min(width, height) / 2.2}
              width={28}
              height={8}
              fill="#1C1917"
              cornerRadius={3}
            />
          </Group>
        );
      }

      // 16. WARDROBE / BOOKSHELF / TV CONSOLE (Storage items)
      case "wardrobe_double":
      case "bookshelf_open":
      case "tv_unit": {
        return (
          <Group>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={color || "#A07E60"}
              stroke="#44403C"
              strokeWidth={1.5}
              cornerRadius={3}
            />
            {/* Divider lines */}
            <Line points={[0, height / 2, width, height / 2]} stroke="#57534E" strokeWidth={1} />
            <Line points={[width / 2, 0, width / 2, height]} stroke="#57534E" strokeWidth={1} />
          </Group>
        );
      }

      // 17. FLOOR LAMP
      case "floor_lamp": {
        return (
          <Group>
            <Circle x={cx} y={cy} radius={Math.min(width, height) / 2.2} fill={color || "#D1C7BD"} stroke="#44403C" strokeWidth={1.2} />
            <Circle x={cx} y={cy} radius={4} fill="#D4AF37" stroke="#3D3833" strokeWidth={0.8} />
          </Group>
        );
      }

      // DEFAULT FALLBACK (Clean generic architectural furniture rect)
      default: {
        return (
          <Group>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={color || "#D6D3D1"}
              stroke="#44403C"
              strokeWidth={1.5}
              cornerRadius={4}
            />
            <Text
              x={4}
              y={cy - 5}
              width={width - 8}
              align="center"
              text={item.name}
              fontSize={9}
              fill="#44403C"
              fontFamily="sans-serif"
            />
          </Group>
        );
      }
    }
  };

  return (
    <Group
      ref={groupRef}
      x={item.x}
      y={item.y}
      width={width}
      height={height}
      rotation={rotation}
      offsetX={cx}
      offsetY={cy}
      draggable={!isLocked}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onDragEnd={handleDragEnd}
    >
      {/* 2D Vector Drawing */}
      {renderVectorGraphics()}

      {/* Lock Badge if locked */}
      {isLocked && (
        <Group x={width - 16} y={4}>
          <Circle radius={7} fill="#1E3A34" />
          <Text text="🔒" fontSize={8} x={-4} y={-5} />
        </Group>
      )}

      {/* Collision / Out of bounds Warning Indicator */}
      {(hasCollision || isOutOfBounds) && (
        <Group>
          {!isSelected && (
            <Rect
              x={-3}
              y={-3}
              width={width + 6}
              height={height + 6}
              stroke={hasCollision ? "#E11D48" : "#D97706"}
              strokeWidth={1.8}
              dash={[4, 2]}
              cornerRadius={6}
            />
          )}
          <Group x={width - 4} y={-4}>
            <Circle radius={6.5} fill={hasCollision ? "#E11D48" : "#D97706"} />
            <Text text="!" fontSize={9} fontStyle="bold" fill="#FFFFFF" x={-2} y={-5.5} />
          </Group>
        </Group>
      )}

      {/* SELECTION OVERLAY & CONTROLS */}
      {isSelected && (
        <Group>
          {/* Green Selection Border */}
          <Rect
            x={-3}
            y={-3}
            width={width + 6}
            height={height + 6}
            stroke="#1E3A34"
            strokeWidth={1.8}
            dash={[5, 3]}
            cornerRadius={6}
          />

          {/* 4 Corner Indicators */}
          <Circle x={-3} y={-3} radius={3.5} fill="#FFFFFF" stroke="#1E3A34" strokeWidth={1.5} />
          <Circle x={width + 3} y={-3} radius={3.5} fill="#FFFFFF" stroke="#1E3A34" strokeWidth={1.5} />
          <Circle x={-3} y={height + 3} radius={3.5} fill="#FFFFFF" stroke="#1E3A34" strokeWidth={1.5} />
          <Circle x={width + 3} y={height + 3} radius={3.5} fill="#FFFFFF" stroke="#1E3A34" strokeWidth={1.5} />

          {/* Interactive Top Rotation Stem and Handle */}
          {!isLocked && (
            <Group>
              {/* Stem line extending upward */}
              <Line points={[cx, -3, cx, -26]} stroke="#1E3A34" strokeWidth={1.5} />
              {/* Rotatable circular handle */}
              <Circle
                x={cx}
                y={-26}
                radius={7}
                fill="#FFFFFF"
                stroke="#1E3A34"
                strokeWidth={2}
                draggable
                onDragMove={(e) => {
                  const stage = e.target.getStage();
                  if (!stage) return;
                  const pointer = stage.getPointerPosition();
                  if (!pointer) return;

                  // Get furniture center in stage absolute coordinates
                  const transform = groupRef.current?.getAbsoluteTransform();
                  if (!transform) return;

                  const centerStage = transform.point({ x: cx, y: cy });
                  const rad = Math.atan2(pointer.y - centerStage.y, pointer.x - centerStage.x);
                  let deg = (rad * 180) / Math.PI + 90; // offset because stem is at top (-90 deg)
                  deg = ((deg % 360) + 360) % 360;

                  // Snap to 15 degrees if near
                  const snapDeg = Math.round(deg / 15) * 15;
                  const finalDeg = Math.abs(deg - snapDeg) < 4 ? snapDeg : Math.round(deg);

                  onRotate(finalDeg, true);
                  // Keep the handle anchored locally
                  e.target.position({ x: cx, y: -26 });
                }}
              />
              <Text text="⟳" x={cx - 4.5} y={-33} fontSize={11} fill="#1E3A34" fontStyle="bold" />
            </Group>
          )}

          {/* Dimension Tag at bottom */}
          <Group x={cx - 38} y={height + 12}>
            <Rect
              width={76}
              height={18}
              fill="#1C1917"
              opacity={0.88}
              cornerRadius={4}
            />
            <Text
              x={0}
              y={4}
              width={76}
              align="center"
              text={`${formatDimension(pxToMeters(width), unit)} × ${formatDimension(pxToMeters(height), unit)}`}
              fontSize={9}
              fontStyle="bold"
              fill="#FFFFFF"
              fontFamily="sans-serif"
            />
          </Group>
        </Group>
      )}
    </Group>
  );
}
