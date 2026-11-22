import { RoomItem, FurnitureItem, DoorWindowItem } from "@/types/editor";

export interface Point {
  x: number;
  y: number;
}

export interface LayoutWarning {
  id: string;
  targetId: string;
  targetType: "furniture" | "door_window";
  targetName: string;
  otherTargetId?: string;
  otherTargetName?: string;
  type: "COLLISION" | "OUT_OF_BOUNDS";
  severity: "warning" | "error";
  message: string;
}

export interface ValidationResult {
  warnings: LayoutWarning[];
  collidingIds: Set<string>;
  outOfBoundsIds: Set<string>;
  isValid: boolean;
}

/**
 * Calculates the 4 rotated corner coordinates of an oriented 2D bounding box (OBB)
 * centered at (x, y) with rotation in degrees.
 */
export function getRotatedBoxCorners(
  cx: number,
  cy: number,
  width: number,
  height: number,
  rotationDegrees: number
): Point[] {
  const rad = (rotationDegrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const hw = width / 2;
  const hh = height / 2;

  const localCorners: Point[] = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
  ];

  return localCorners.map((pt) => ({
    x: cx + pt.x * cos - pt.y * sin,
    y: cy + pt.x * sin + pt.y * cos,
  }));
}

/**
 * Separating Axis Theorem (SAT) implementation to detect intersection
 * between two arbitrary convex polygons (e.g. rotated rectangles).
 */
export function satPolygonsIntersect(polyA: Point[], polyB: Point[]): boolean {
  const polygons = [polyA, polyB];

  for (let i = 0; i < polygons.length; i++) {
    const polygon = polygons[i];
    for (let j = 0; j < polygon.length; j++) {
      const p1 = polygon[j];
      const p2 = polygon[(j + 1) % polygon.length];

      // Calculate the normal perpendicular to the current edge
      const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
      const normal = { x: -edge.y, y: edge.x };

      // Project polygon A onto normal
      let minA = Infinity;
      let maxA = -Infinity;
      for (const p of polyA) {
        const dot = p.x * normal.x + p.y * normal.y;
        if (dot < minA) minA = dot;
        if (dot > maxA) maxA = dot;
      }

      // Project polygon B onto normal
      let minB = Infinity;
      let maxB = -Infinity;
      for (const p of polyB) {
        const dot = p.x * normal.x + p.y * normal.y;
        if (dot < minB) minB = dot;
        if (dot > maxB) maxB = dot;
      }

      // If there is a separating axis where projections do not overlap, they do not collide
      if (maxA <= minB || maxB <= minA) {
        return false;
      }
    }
  }

  // Overlap on all separating axes means collision occurred
  return true;
}

/**
 * Checks whether an item is a floor rug / mat (which intentionally overlaps with tables/sofas)
 */
export function isRugItem(item: FurnitureItem): boolean {
  const isTypeRug = item.type?.toLowerCase().includes("rug");
  const isNameRug = item.name?.toLowerCase().includes("rug");
  const isDecorRug = item.category === "DECORATION" && (isTypeRug || isNameRug);
  return isTypeRug || isNameRug || isDecorRug || (item.zIndex !== undefined && item.zIndex <= 1);
}

/**
 * Tests if a 2D point is inside an axis-aligned room rectangle with slight tolerance
 */
export function isPointInsideRoom(point: Point, room: RoomItem, tolerance = 10): boolean {
  return (
    point.x >= room.x - tolerance &&
    point.x <= room.x + room.width + tolerance &&
    point.y >= room.y - tolerance &&
    point.y <= room.y + room.height + tolerance
  );
}

/**
 * Validates whether a furniture piece is enclosed within at least one room on the floor
 */
export function isFurnitureInsideAnyRoom(item: FurnitureItem, rooms: RoomItem[]): boolean {
  if (!rooms || rooms.length === 0) return true; // Don't flag if layout has no rooms yet

  const corners = getRotatedBoxCorners(item.x, item.y, item.width, item.height, item.rotation || 0);
  const center: Point = { x: item.x, y: item.y };

  // Center must be in a room
  const centerInRoom = rooms.some((r) => isPointInsideRoom(center, r, 5));
  if (!centerInRoom) return false;

  // At least 3 of 4 corners should also be in a room
  let cornersInside = 0;
  for (const c of corners) {
    if (rooms.some((r) => isPointInsideRoom(c, r, 8))) {
      cornersInside++;
    }
  }

  return cornersInside >= 3;
}

/**
 * Comprehensive geometric validation of the entire floor layout.
 * Detects:
 * 1. Furniture-to-furniture physical overlaps (SAT)
 * 2. Furniture extending outside room boundaries (Containment)
 */
export function validateLayout(
  rooms: RoomItem[],
  furniture: FurnitureItem[],
  doorsWindows: DoorWindowItem[] = []
): ValidationResult {
  const warnings: LayoutWarning[] = [];
  const collidingIds = new Set<string>();
  const outOfBoundsIds = new Set<string>();

  // Filter out hidden furniture
  const activeFurniture = furniture.filter((f) => f.isVisible !== false);

  // 1. Boundary & Containment Check
  if (rooms.length > 0) {
    for (const item of activeFurniture) {
      if (!isFurnitureInsideAnyRoom(item, rooms)) {
        outOfBoundsIds.add(item.id);
        warnings.push({
          id: `bound-${item.id}`,
          targetId: item.id,
          targetType: "furniture",
          targetName: item.name,
          type: "OUT_OF_BOUNDS",
          severity: "warning",
          message: `"${item.name}" extends outside room walls or is placed in open space.`,
        });
      }
    }
  }

  // Pre-calculate corners for SAT
  const cornerMap = new Map<string, Point[]>();
  for (const item of activeFurniture) {
    cornerMap.set(
      item.id,
      getRotatedBoxCorners(item.x, item.y, item.width, item.height, item.rotation || 0)
    );
  }

  // 2. Pairwise Furniture Collision Check (SAT)
  for (let i = 0; i < activeFurniture.length; i++) {
    const itemA = activeFurniture[i];
    if (isRugItem(itemA)) continue; // Skip rugs (rugs are designed to have furniture on top)

    const cornersA = cornerMap.get(itemA.id)!;

    for (let j = i + 1; j < activeFurniture.length; j++) {
      const itemB = activeFurniture[j];
      if (isRugItem(itemB)) continue;

      const cornersB = cornerMap.get(itemB.id)!;

      // Quick bounding circle distance reject before SAT
      const dx = itemA.x - itemB.x;
      const dy = itemA.y - itemB.y;
      const distSq = dx * dx + dy * dy;
      const maxRadiusA = Math.sqrt(itemA.width * itemA.width + itemA.height * itemA.height) / 2;
      const maxRadiusB = Math.sqrt(itemB.width * itemB.width + itemB.height * itemB.height) / 2;
      const combinedRadius = maxRadiusA + maxRadiusB;

      if (distSq > combinedRadius * combinedRadius) {
        continue; // Far apart, cannot collide
      }

      // Execute SAT
      if (satPolygonsIntersect(cornersA, cornersB)) {
        collidingIds.add(itemA.id);
        collidingIds.add(itemB.id);

        warnings.push({
          id: `col-${itemA.id}-${itemB.id}`,
          targetId: itemA.id,
          targetType: "furniture",
          targetName: itemA.name,
          otherTargetId: itemB.id,
          otherTargetName: itemB.name,
          type: "COLLISION",
          severity: "warning",
          message: `"${itemA.name}" overlaps with "${itemB.name}".`,
        });
      }
    }
  }

  return {
    warnings,
    collidingIds,
    outOfBoundsIds,
    isValid: warnings.length === 0,
  };
}
