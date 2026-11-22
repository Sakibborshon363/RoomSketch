"use client";

import React, { useRef } from "react";
import { Group, Rect, Line, Text, Arc, Circle } from "react-konva";
import Konva from "konva";
import { DoorWindowItem, UnitSystem } from "@/types/editor";
import { formatDimension } from "@/lib/utils";

interface DoorWindowShapeProps {
  item: DoorWindowItem;
  isSelected: boolean;
  unit: UnitSystem;
  pxToMeters: (px: number) => number;
  snap: (val: number) => number;
  onSelect: () => void;
  onUpdate: (updates: Partial<DoorWindowItem>) => void;
  onRotate: (delta: number, isAbsolute?: boolean) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function DoorWindowShape({
  item,
  isSelected,
  unit,
  pxToMeters,
  snap,
  onSelect,
  onUpdate,
  onRotate,
  onDuplicate,
  onDelete,
}: DoorWindowShapeProps) {
  const groupRef = useRef<Konva.Group>(null);
  const { width, height, rotation, type, swing } = item;
  const isDoor = type === "DOOR";
  const depth = height || 12; // Wall thickness depth

  // Center offsets for smooth rotation around object center
  const cx = width / 2;
  const cy = depth / 2;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const newX = snap(e.target.x());
    const newY = snap(e.target.y());
    onUpdate({ x: newX, y: newY });
  };

  return (
    <Group
      ref={groupRef}
      x={item.x}
      y={item.y}
      width={width}
      height={depth}
      rotation={rotation || 0}
      offsetX={cx}
      offsetY={cy}
      draggable
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
      {/* 1. Wall Cutout Background (Clears dark wall line underneath) */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={depth}
        fill="#FFFFFF"
        opacity={0.95}
      />

      {isDoor ? (
        /* 2. ARCHITECTURAL DOOR RENDERING (Leaf, Jambs & Swing Arc) */
        <Group>
          {/* Left Door Jamb */}
          <Rect
            x={0}
            y={0}
            width={4}
            height={depth}
            fill="#292524"
            cornerRadius={1}
          />

          {/* Right Door Jamb */}
          <Rect
            x={width - 4}
            y={0}
            width={4}
            height={depth}
            fill="#292524"
            cornerRadius={1}
          />

          {/* Threshold Base Line */}
          <Line
            points={[4, depth / 2, width - 4, depth / 2]}
            stroke="#A8A29E"
            strokeWidth={1}
            dash={[2, 2]}
          />

          {/* Door Leaf (Hinged at left jamb, swinging 90° inward) */}
          <Line
            points={[4, 0, 4, -width + 4]}
            stroke="#1C1917"
            strokeWidth={2.5}
            lineCap="round"
          />

          {/* Door Swing Clearance Arc (Quarter circle 90 degrees) */}
          <Arc
            x={4}
            y={0}
            innerRadius={width - 8}
            outerRadius={width - 8}
            angle={90}
            rotation={270}
            stroke="#78716C"
            strokeWidth={1.2}
            dash={[4, 3]}
          />
        </Group>
      ) : (
        /* 3. ARCHITECTURAL WINDOW RENDERING (Sills, Double Glazing & Mullion) */
        <Group>
          {/* Outer Wall Sill */}
          <Line
            points={[0, 0, width, 0]}
            stroke="#292524"
            strokeWidth={2}
          />

          {/* Inner Wall Sill */}
          <Line
            points={[0, depth, width, depth]}
            stroke="#292524"
            strokeWidth={2}
          />

          {/* Left Frame Cap */}
          <Line
            points={[0, 0, 0, depth]}
            stroke="#292524"
            strokeWidth={2}
          />

          {/* Right Frame Cap */}
          <Line
            points={[width, 0, width, depth]}
            stroke="#292524"
            strokeWidth={2}
          />

          {/* Double Glazing Pane 1 (Sky Blue Glass Line) */}
          <Line
            points={[2, depth * 0.35, width - 2, depth * 0.35]}
            stroke="#0284C7"
            strokeWidth={1.5}
          />

          {/* Double Glazing Pane 2 (Sky Blue Glass Line) */}
          <Line
            points={[2, depth * 0.65, width - 2, depth * 0.65]}
            stroke="#0284C7"
            strokeWidth={1.5}
          />

          {/* Central Window Mullion Divider */}
          <Rect
            x={cx - 1.5}
            y={1}
            width={3}
            height={depth - 2}
            fill="#475569"
            cornerRadius={1}
          />
        </Group>
      )}

      {/* 4. SELECTION OVERLAY & CONTROLS */}
      {isSelected && (
        <Group>
          {/* Highlight Bounding Stroke */}
          <Rect
            x={-3}
            y={-3}
            width={width + 6}
            height={depth + 6}
            stroke={isDoor ? "#1E3A34" : "#0284C7"}
            strokeWidth={1.8}
            dash={[4, 2]}
            cornerRadius={3}
          />

          {/* Corner points */}
          <Circle x={-3} y={-3} radius={3} fill="#FFFFFF" stroke={isDoor ? "#1E3A34" : "#0284C7"} strokeWidth={1.5} />
          <Circle x={width + 3} y={-3} radius={3} fill="#FFFFFF" stroke={isDoor ? "#1E3A34" : "#0284C7"} strokeWidth={1.5} />
          <Circle x={-3} y={depth + 3} radius={3} fill="#FFFFFF" stroke={isDoor ? "#1E3A34" : "#0284C7"} strokeWidth={1.5} />
          <Circle x={width + 3} y={depth + 3} radius={3} fill="#FFFFFF" stroke={isDoor ? "#1E3A34" : "#0284C7"} strokeWidth={1.5} />

          {/* Dimension Tag */}
          <Group x={cx - 30} y={depth + 10}>
            <Rect
              width={60}
              height={16}
              fill="#1C1917"
              opacity={0.88}
              cornerRadius={3}
            />
            <Text
              x={0}
              y={3}
              width={60}
              align="center"
              text={formatDimension(pxToMeters(width), unit)}
              fontSize={8.5}
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
