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

/**
 * Autonomous Physics-Based Layout & Collision Resolution Engine
 * Automatically separates overlapping furniture items (SAT collisions),
 * pulls out-of-bounds items back into room boundaries, and clears doorway egress paths.
 */
export function resolveAllLayoutCollisions(
  rooms: RoomItem[],
  furniture: FurnitureItem[],
  doorsWindows: DoorWindowItem[] = []
): {
  resolvedFurniture: FurnitureItem[];
  actionsCount: number;
  actionMessages: string[];
  remainingCollisions: number;
} {
  let currentFurniture = furniture.map((f) => ({ ...f }));
  const actionMessages: string[] = [];

  const MAX_ITERATIONS = 12;
  let iteration = 0;

  while (iteration < MAX_ITERATIONS) {
    iteration++;
    const validation = validateLayout(rooms, currentFurniture, doorsWindows);

    if (validation.warnings.length === 0) {
      break;
    }

    let modifiedInPass = false;

    // 1. Pull out-of-bounds items inside room boundaries
    for (const item of currentFurniture) {
      if (item.isLocked) continue;

      // Find enclosing or nearest room
      let room = rooms.find((r) => r.id === item.roomId);
      if (!room && rooms.length > 0) {
        let minDist = Infinity;
        for (const r of rooms) {
          const d = Math.hypot(item.x - (r.x + r.width / 2), item.y - (r.y + r.height / 2));
          if (d < minDist) {
            minDist = d;
            room = r;
          }
        }
      }

      if (room) {
        const minX = room.x + item.width / 2 + 10;
        const maxX = room.x + room.width - item.width / 2 - 10;
        const minY = room.y + item.height / 2 + 10;
        const maxY = room.y + room.height - item.height / 2 - 10;

        const clampedX = Math.max(minX, Math.min(maxX, item.x));
        const clampedY = Math.max(minY, Math.min(maxY, item.y));

        if (clampedX !== item.x || clampedY !== item.y) {
          item.x = Math.round(clampedX / 5) * 5;
          item.y = Math.round(clampedY / 5) * 5;
          item.roomId = room.id;
          modifiedInPass = true;
          if (iteration === 1) {
            actionMessages.push(`Moved "${item.name}" safely inside "${room.name}" boundaries.`);
          }
        }
      }
    }

    // 2. Separate overlapping furniture pairs (SAT)
    const activeFurniture = currentFurniture.filter((f) => f.isVisible !== false && !isRugItem(f));
    const cornerMap = new Map<string, Point[]>();
    for (const item of activeFurniture) {
      cornerMap.set(
        item.id,
        getRotatedBoxCorners(item.x, item.y, item.width, item.height, item.rotation || 0)
      );
    }

    for (let i = 0; i < activeFurniture.length; i++) {
      const itemA = activeFurniture[i];
      const cornersA = cornerMap.get(itemA.id)!;

      for (let j = i + 1; j < activeFurniture.length; j++) {
        const itemB = activeFurniture[j];
        const cornersB = cornerMap.get(itemB.id)!;

        if (satPolygonsIntersect(cornersA, cornersB)) {
          // Compute separation vector
          let dx = itemB.x - itemA.x;
          let dy = itemB.y - itemA.y;
          let dist = Math.hypot(dx, dy);

          let nx = 1;
          let ny = 0;
          if (dist > 0.001) {
            nx = dx / dist;
            ny = dy / dist;
          } else {
            const angle = ((i + j) * 45 * Math.PI) / 180;
            nx = Math.cos(angle);
            ny = Math.sin(angle);
            dist = 0;
          }

          const reqDist = (Math.max(itemA.width, itemA.height) + Math.max(itemB.width, itemB.height)) / 2 + 20;
          const pushDist = Math.max(reqDist - dist, 30);

          const roomA = rooms.find((r) => r.id === itemA.roomId);
          const roomB = rooms.find((r) => r.id === itemB.roomId);

          if (!itemB.isLocked) {
            let newBx = itemB.x + nx * pushDist * 0.6;
            let newBy = itemB.y + ny * pushDist * 0.6;
            if (roomB) {
              newBx = Math.max(roomB.x + itemB.width / 2 + 10, Math.min(roomB.x + roomB.width - itemB.width / 2 - 10, newBx));
              newBy = Math.max(roomB.y + itemB.height / 2 + 10, Math.min(roomB.y + roomB.height - itemB.height / 2 - 10, newBy));
            }
            itemB.x = Math.round(newBx / 5) * 5;
            itemB.y = Math.round(newBy / 5) * 5;
            modifiedInPass = true;
          }

          if (!itemA.isLocked) {
            let newAx = itemA.x - nx * pushDist * 0.6;
            let newAy = itemA.y - ny * pushDist * 0.6;
            if (roomA) {
              newAx = Math.max(roomA.x + itemA.width / 2 + 10, Math.min(roomA.x + roomA.width - itemA.width / 2 - 10, newAx));
              newAy = Math.max(roomA.y + itemA.height / 2 + 10, Math.min(roomA.y + roomA.height - itemA.height / 2 - 10, newAy));
            }
            itemA.x = Math.round(newAx / 5) * 5;
            itemA.y = Math.round(newAy / 5) * 5;
            modifiedInPass = true;
          }

          if (iteration === 1) {
            actionMessages.push(
              `Separated "${itemA.name}" and "${itemB.name}" by ${Math.round(pushDist)}px to eliminate collision overlap.`
            );
          }

          // Update corners
          cornerMap.set(
            itemA.id,
            getRotatedBoxCorners(itemA.x, itemA.y, itemA.width, itemA.height, itemA.rotation || 0)
          );
          cornerMap.set(
            itemB.id,
            getRotatedBoxCorners(itemB.x, itemB.y, itemB.width, itemB.height, itemB.rotation || 0)
          );
        }
      }
    }

    if (!modifiedInPass) break;
  }

  // 3. Clear Doorway Egress Arcs
  const doors = doorsWindows.filter((dw) => (dw.type || "").toUpperCase().includes("DOOR"));
  doors.forEach((door) => {
    const requiredRadius = (door.width || 45) + 25;
    currentFurniture.forEach((item) => {
      if (item.isLocked) return;
      const dist = Math.hypot(item.x - door.x, item.y - door.y);
      if (dist < requiredRadius) {
        const room = rooms.find(
          (r) => door.x >= r.x && door.x <= r.x + r.width && door.y >= r.y && door.y <= r.y + r.height
        );
        if (room) {
          const roomCenterX = room.x + room.width / 2;
          const roomCenterY = room.y + room.height / 2;
          const angle = Math.atan2(roomCenterY - door.y, roomCenterX - door.x);
          let newX = door.x + Math.cos(angle) * (requiredRadius + 20);
          let newY = door.y + Math.sin(angle) * (requiredRadius + 20);

          newX = Math.max(room.x + item.width / 2 + 10, Math.min(room.x + room.width - item.width / 2 - 10, newX));
          newY = Math.max(room.y + item.height / 2 + 10, Math.min(room.y + room.height - item.height / 2 - 10, newY));

          item.x = Math.round(newX / 5) * 5;
          item.y = Math.round(newY / 5) * 5;
          actionMessages.push(`Moved "${item.name}" 85cm away from door "${door.name}" swing path.`);
        }
      }
    });
  });

  const finalValidation = validateLayout(rooms, currentFurniture, doorsWindows);

  return {
    resolvedFurniture: currentFurniture,
    actionsCount: actionMessages.length,
    actionMessages,
    remainingCollisions: finalValidation.warnings.length,
  };
}

/**
 * 1-Click Alias for resolving all layout collisions and obstructions
 */
export const autoResolveCollisions = resolveAllLayoutCollisions;
