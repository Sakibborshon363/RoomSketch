import { RoomItem, DoorWindowItem, FurnitureItem, UnitSystem } from "@/types/editor";

export type ElevationOrientation = "FRONT" | "BACK" | "LEFT" | "RIGHT";

export interface ElevationOptions {
  orientation: ElevationOrientation;
  storyCount: number; // 1 to 10 (default 5 stories)
  storyHeightFeet?: number; // default 10.0 ft
  plinthHeightFeet?: number; // default 1.5 ft (1'-6")
  parapetHeightFeet?: number; // default 3.0 ft (3'-0")
  stairRoomHeightFeet?: number; // default 7.0 ft (7'-0")
  unit?: UnitSystem;
  projectName?: string;
  drawingTitle?: string;
}

export interface BayProjection {
  index: number;
  id: string;
  xStartFeet: number;
  xEndFeet: number;
  widthFeet: number;
  widthFormatted: string; // e.g. "14'-0""
  roomType: "BEDROOM" | "LIVING" | "BALCONY" | "VOID" | "STAIR" | "KITCHEN" | "BATH" | "GENERAL";
  label: string; // e.g. "14'-0" M.BED (VER)", "CENTRAL VOID"
  hasBalcony: boolean;
  hasWindow: boolean;
  hasDoor: boolean;
  associatedRoomName?: string;
}

export interface DatumLevel {
  id: string;
  name: string;
  levelIndex: number;
  elevationFeet: number;
  elevationFormatted: string; // e.g. "EL. +11'-6""
  isMajor: boolean;
  isStairRoom?: boolean;
  isParapet?: boolean;
  isRoof?: boolean;
  isPlinth?: boolean;
  isGround?: boolean;
}

export interface DimensionCallout {
  id: string;
  axis: "VERTICAL" | "HORIZONTAL";
  startFeet: number;
  endFeet: number;
  spanFeet: number;
  valueFormatted: string;
  label?: string;
  side: "LEFT" | "RIGHT" | "BOTTOM";
}

export interface ElevationModel {
  orientation: ElevationOrientation;
  storyCount: number;
  totalWidthFeet: number;
  totalHeightFeet: number; // ground to stair roof
  plinthHeightFeet: number;
  storyHeightFeet: number;
  parapetHeightFeet: number;
  stairRoomHeightFeet: number;
  bays: BayProjection[];
  datumLevels: DatumLevel[];
  verticalDimensions: DimensionCallout[];
  horizontalDimensions: DimensionCallout[];
  hasCentralVoid: boolean;
  hasStairRoom: boolean;
  stairBayIndex?: number;
  drawingMetadata: {
    projectName: string;
    drawingTitle: string;
    scale: string;
    date: string;
    sheet: string;
    revision: string;
  };
}

/**
 * Format a number in decimal feet to architectural feet and inches string,
 * e.g., 1.5 -> "1'-6"", 11.5 -> "11'-6"", 13.75 -> "13'-9""
 */
export function formatFeetAndInches(totalFeet: number): string {
  const isNegative = totalFeet < 0;
  const absFeet = Math.abs(totalFeet);
  let feet = Math.floor(absFeet);
  let inches = Math.round((absFeet - feet) * 12);

  if (inches === 12) {
    feet += 1;
    inches = 0;
  }

  const sign = isNegative ? "-" : "";
  return `${sign}${feet}'-${inches}"`;
}

/**
 * Convert meters to architectural feet and inches format or metric format
 */
export function formatDimension(
  valueFeet: number,
  unit: UnitSystem = "FEET"
): string {
  if (unit === "METERS") {
    const meters = valueFeet * 0.3048;
    return `${meters.toFixed(2)}m`;
  }
  if (unit === "CENTIMETERS") {
    const cm = Math.round(valueFeet * 30.48);
    return `${cm}cm`;
  }
  return formatFeetAndInches(valueFeet);
}

/**
 * Default Residential Reference Blueprint matching Image 1:
 * - 4 Master Bedrooms on back side with Verandahs (VER 3'-0")
 * - Central Void & Stair Core (7' x 16')
 * - Toilets / Baths, Kitchens, Drawing Rooms (20'-9" x 13'-5"), Dining Rooms (13'-9" x 13'-0")
 * - Front Common Bedrooms (14' x 13')
 */
export const REFERENCE_RESIDENTIAL_PLAN: {
  rooms: RoomItem[];
  doorsWindows: DoorWindowItem[];
  furniture: FurnitureItem[];
} = {
  rooms: [
    // --- BACK SIDE ROOMS (North, Y = 0 to 180) ---
    // Bay 1: Far Left Master Bedroom + Verandah
    {
      id: "ref-room-mbed-1",
      name: "M.BED ROOM (14'-0\" X 13'-0\")",
      x: 40,
      y: 40,
      width: 140,
      height: 130,
      wallThickness: 10,
      wallColor: "#E2E8F0",
      floorColor: "#CBD5E1",
      floorMaterial: "WOOD_HARDWOOD",
    },
    {
      id: "ref-room-ver-1",
      name: "VER (3'-0\")",
      x: 40,
      y: 10,
      width: 140,
      height: 30,
      wallThickness: 8,
      wallColor: "#94A3B8",
      floorColor: "#E2E8F0",
      floorMaterial: "CERAMIC_TILE",
    },

    // Bay 2: Mid-Left Master Bedroom + Verandah
    {
      id: "ref-room-mbed-2",
      name: "M.BED ROOM (13'-9\" X 13'-0\")",
      x: 180,
      y: 40,
      width: 138,
      height: 130,
      wallThickness: 10,
      wallColor: "#E2E8F0",
      floorColor: "#CBD5E1",
      floorMaterial: "WOOD_HARDWOOD",
    },
    {
      id: "ref-room-ver-2",
      name: "VER (3'-0\")",
      x: 180,
      y: 10,
      width: 138,
      height: 30,
      wallThickness: 8,
      wallColor: "#94A3B8",
      floorColor: "#E2E8F0",
      floorMaterial: "CERAMIC_TILE",
    },

    // Central Void & Stair Core (Y: 10 to 220)
    {
      id: "ref-room-void",
      name: "CENTRAL VOID",
      x: 318,
      y: 10,
      width: 70,
      height: 150,
      wallThickness: 8,
      wallColor: "#64748B",
      floorColor: "#F1F5F9",
      floorMaterial: "POLISHED_CONCRETE",
    },
    {
      id: "ref-room-stair",
      name: "STAIR (7' X 16')",
      x: 318,
      y: 160,
      width: 70,
      height: 160,
      wallThickness: 12,
      wallColor: "#475569",
      floorColor: "#E2E8F0",
      floorMaterial: "POLISHED_CONCRETE",
    },

    // Bay 3: Mid-Right Master Bedroom + Verandah
    {
      id: "ref-room-mbed-3",
      name: "M.BED ROOM (13'-9\" X 13'-0\")",
      x: 388,
      y: 40,
      width: 138,
      height: 130,
      wallThickness: 10,
      wallColor: "#E2E8F0",
      floorColor: "#CBD5E1",
      floorMaterial: "WOOD_HARDWOOD",
    },
    {
      id: "ref-room-ver-3",
      name: "VER (3'-0\")",
      x: 388,
      y: 10,
      width: 138,
      height: 30,
      wallThickness: 8,
      wallColor: "#94A3B8",
      floorColor: "#E2E8F0",
      floorMaterial: "CERAMIC_TILE",
    },

    // Bay 4: Far Right Master Bedroom + Verandah
    {
      id: "ref-room-mbed-4",
      name: "M.BED ROOM (14'-0\" X 13'-0\")",
      x: 526,
      y: 40,
      width: 140,
      height: 130,
      wallThickness: 10,
      wallColor: "#E2E8F0",
      floorColor: "#CBD5E1",
      floorMaterial: "WOOD_HARDWOOD",
    },
    {
      id: "ref-room-ver-4",
      name: "VER (3'-0\")",
      x: 526,
      y: 10,
      width: 140,
      height: 30,
      wallThickness: 8,
      wallColor: "#94A3B8",
      floorColor: "#E2E8F0",
      floorMaterial: "CERAMIC_TILE",
    },

    // --- MID-WING SERVICES (Toilets, Kitchens, Drawing) ---
    // Left Wing Services
    {
      id: "ref-room-bath-1",
      name: "TOILET/BATH (7' X 5')",
      x: 40,
      y: 170,
      width: 70,
      height: 50,
      wallThickness: 8,
      wallColor: "#CBD5E1",
      floorColor: "#E2E8F0",
      floorMaterial: "CERAMIC_TILE",
    },
    {
      id: "ref-room-kitchen-1",
      name: "KITCHEN (7'-0\" X 8'-0\")",
      x: 40,
      y: 220,
      width: 70,
      height: 80,
      wallThickness: 8,
      wallColor: "#E2E8F0",
      floorColor: "#CBD5E1",
      floorMaterial: "CERAMIC_TILE",
    },
    {
      id: "ref-room-drawing-1",
      name: "DRAWING ROOM (20'-9\" X 13'-5\")",
      x: 110,
      y: 170,
      width: 208,
      height: 134,
      wallThickness: 10,
      wallColor: "#F8FAFC",
      floorColor: "#E2E8F0",
      floorMaterial: "MARBLE",
    },

    // Right Wing Services
    {
      id: "ref-room-bath-2",
      name: "TOILET/BATH (7' X 5')",
      x: 596,
      y: 170,
      width: 70,
      height: 50,
      wallThickness: 8,
      wallColor: "#CBD5E1",
      floorColor: "#E2E8F0",
      floorMaterial: "CERAMIC_TILE",
    },
    {
      id: "ref-room-kitchen-2",
      name: "KITCHEN (7'-0\" X 8'-0\")",
      x: 596,
      y: 220,
      width: 70,
      height: 80,
      wallThickness: 8,
      wallColor: "#E2E8F0",
      floorColor: "#CBD5E1",
      floorMaterial: "CERAMIC_TILE",
    },
    {
      id: "ref-room-drawing-2",
      name: "DRAWING ROOM (20'-9\" X 13'-5\")",
      x: 388,
      y: 170,
      width: 208,
      height: 134,
      wallThickness: 10,
      wallColor: "#F8FAFC",
      floorColor: "#E2E8F0",
      floorMaterial: "MARBLE",
    },

    // --- FRONT SIDE ROOMS (South, Y = 304 to 434) ---
    // Left Wing Front Rooms
    {
      id: "ref-room-cbed-1",
      name: "C.BED ROOM (14' X 13')",
      x: 40,
      y: 304,
      width: 140,
      height: 130,
      wallThickness: 10,
      wallColor: "#E2E8F0",
      floorColor: "#CBD5E1",
      floorMaterial: "WOOD_HARDWOOD",
    },
    {
      id: "ref-room-dining-1",
      name: "DINING ROOM (13'-9\" X 13'-0\")",
      x: 180,
      y: 304,
      width: 138,
      height: 130,
      wallThickness: 10,
      wallColor: "#F8FAFC",
      floorColor: "#E2E8F0",
      floorMaterial: "MARBLE",
    },

    // Right Wing Front Rooms
    {
      id: "ref-room-dining-2",
      name: "DINING ROOM (13'-9\" X 13'-0\")",
      x: 388,
      y: 304,
      width: 138,
      height: 130,
      wallThickness: 10,
      wallColor: "#F8FAFC",
      floorColor: "#E2E8F0",
      floorMaterial: "MARBLE",
    },
    {
      id: "ref-room-cbed-2",
      name: "C.BED ROOM (14' X 13')",
      x: 526,
      y: 304,
      width: 140,
      height: 130,
      wallThickness: 10,
      wallColor: "#E2E8F0",
      floorColor: "#CBD5E1",
      floorMaterial: "WOOD_HARDWOOD",
    },
  ],
  doorsWindows: [
    // Aluminum sliding doors connecting bedrooms to verandahs on back elevation
    {
      id: "ref-door-ver-1",
      name: "Aluminum Sliding Door",
      type: "DOOR",
      x: 95,
      y: 40,
      width: 30,
      height: 8,
      rotation: 0,
    },
    {
      id: "ref-door-ver-2",
      name: "Aluminum Sliding Door",
      type: "DOOR",
      x: 235,
      y: 40,
      width: 30,
      height: 8,
      rotation: 0,
    },
    {
      id: "ref-door-ver-3",
      name: "Aluminum Sliding Door",
      type: "DOOR",
      x: 443,
      y: 40,
      width: 30,
      height: 8,
      rotation: 0,
    },
    {
      id: "ref-door-ver-4",
      name: "Aluminum Sliding Door",
      type: "DOOR",
      x: 581,
      y: 40,
      width: 30,
      height: 8,
      rotation: 0,
    },
    // Front windows
    {
      id: "ref-win-front-1",
      name: "Casement Window",
      type: "WINDOW",
      x: 95,
      y: 434,
      width: 30,
      height: 8,
      rotation: 0,
    },
    {
      id: "ref-win-front-2",
      name: "Casement Window",
      type: "WINDOW",
      x: 235,
      y: 434,
      width: 30,
      height: 8,
      rotation: 0,
    },
    {
      id: "ref-win-front-3",
      name: "Casement Window",
      type: "WINDOW",
      x: 443,
      y: 434,
      width: 30,
      height: 8,
      rotation: 0,
    },
    {
      id: "ref-win-front-4",
      name: "Casement Window",
      type: "WINDOW",
      x: 581,
      y: 434,
      width: 30,
      height: 8,
      rotation: 0,
    },
  ],
  furniture: [],
};

/**
 * Extract bays projected along the chosen face (BACK, FRONT, LEFT, RIGHT).
 */
export function extractElevationBays(
  rooms: RoomItem[],
  orientation: ElevationOrientation = "BACK"
): BayProjection[] {
  if (!rooms || rooms.length === 0) {
    return [];
  }

  // Determine coordinate bounding box
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  rooms.forEach((r) => {
    minX = Math.min(minX, r.x);
    maxX = Math.max(maxX, r.x + r.width);
    minY = Math.min(minY, r.y);
    maxY = Math.max(maxY, r.y + r.height);
  });

  const totalWidth = maxX - minX;
  const totalHeight = maxY - minY;

  // Horizontal projection is along X for FRONT and BACK; along Y for LEFT and RIGHT
  const isHorizontalProjection = orientation === "FRONT" || orientation === "BACK";

  // Filter perimeter rooms along the specified elevation face
  const THRESHOLD = 0.35; // consider rooms within top/bottom 35% depth

  const faceRooms = rooms.filter((r) => {
    if (orientation === "BACK") {
      // Near top of floor plan (minY)
      return r.y <= minY + totalHeight * THRESHOLD;
    } else if (orientation === "FRONT") {
      // Near bottom of floor plan (maxY)
      return r.y + r.height >= maxY - totalHeight * THRESHOLD;
    } else if (orientation === "LEFT") {
      // Near left of floor plan (minX)
      return r.x <= minX + totalWidth * THRESHOLD;
    } else {
      // RIGHT: Near right of floor plan (maxX)
      return r.x + r.width >= maxX - totalWidth * THRESHOLD;
    }
  });

  // If no face rooms found, fall back to all rooms
  const targetRooms = faceRooms.length > 0 ? faceRooms : rooms;

  // Extract intervals along the projection axis
  interface Interval {
    start: number;
    end: number;
    room: RoomItem;
  }

  const intervals: Interval[] = targetRooms.map((r) => {
    if (isHorizontalProjection) {
      return { start: r.x, end: r.x + r.width, room: r };
    } else {
      return { start: r.y, end: r.y + r.height, room: r };
    }
  });

  // Sort intervals by start coordinate
  intervals.sort((a, b) => a.start - b.start);

  // Group overlapping or adjacent intervals into clean architectural bays
  // Scale factor: 10 pixels in editor approx = 1.0 ft (or 100px = 10ft)
  const PIXELS_PER_FOOT = 10;

  const bays: BayProjection[] = [];
  let currentBayX = intervals[0].start;

  // If the first interval does not start at min coordinate, add plinth lead-in if needed
  intervals.forEach((inv, i) => {
    const widthPx = inv.end - inv.start;
    const widthFeet = Math.max(1, Math.round((widthPx / PIXELS_PER_FOOT) * 4) / 4); // round to 0.25 ft
    const xStartFeet = Math.round(((inv.start - (isHorizontalProjection ? minX : minY)) / PIXELS_PER_FOOT) * 4) / 4;
    const xEndFeet = xStartFeet + widthFeet;

    const nameUpper = inv.room.name.toUpperCase();
    let roomType: BayProjection["roomType"] = "GENERAL";
    let hasBalcony = false;

    if (nameUpper.includes("VER") || nameUpper.includes("BALCONY") || nameUpper.includes("TERRACE")) {
      roomType = "BALCONY";
      hasBalcony = true;
    } else if (nameUpper.includes("VOID") || nameUpper.includes("SHAFT")) {
      roomType = "VOID";
    } else if (nameUpper.includes("STAIR") || nameUpper.includes("LIFT") || nameUpper.includes("CORE")) {
      roomType = "STAIR";
    } else if (nameUpper.includes("BED")) {
      roomType = "BEDROOM";
      // If bedroom is on back/front face, often features an attached verandah or large window
      hasBalcony = nameUpper.includes("VER") || orientation === "BACK";
    } else if (nameUpper.includes("DRAWING") || nameUpper.includes("LIVING")) {
      roomType = "LIVING";
    } else if (nameUpper.includes("KITCHEN")) {
      roomType = "KITCHEN";
    } else if (nameUpper.includes("BATH") || nameUpper.includes("TOILET")) {
      roomType = "BATH";
    }

    // Check if duplicate of immediately preceding bay with same span
    const prev = bays[bays.length - 1];
    if (prev && Math.abs(prev.xStartFeet - xStartFeet) < 1.0 && Math.abs(prev.widthFeet - widthFeet) < 1.0) {
      // Merge / skip duplicate stacked room (e.g., VER stacked directly on M.BED)
      if (hasBalcony) {
        prev.hasBalcony = true;
        prev.label = `${formatFeetAndInches(prev.widthFeet)} M.BED (VER)`;
      }
      return;
    }

    let label = `${formatFeetAndInches(widthFeet)}`;
    if (roomType === "VOID") {
      label = "CENTRAL VOID";
    } else if (roomType === "STAIR") {
      label = "STAIR CORE";
    } else if (hasBalcony) {
      label = `${formatFeetAndInches(widthFeet)} M.BED (VER)`;
    } else if (nameUpper.includes("M.BED")) {
      label = `${formatFeetAndInches(widthFeet)} M.BED`;
    } else if (nameUpper.includes("C.BED")) {
      label = `${formatFeetAndInches(widthFeet)} C.BED`;
    } else if (nameUpper.includes("DINING")) {
      label = `${formatFeetAndInches(widthFeet)} DINING`;
    } else if (nameUpper.includes("DRAWING")) {
      label = `${formatFeetAndInches(widthFeet)} DRAWING`;
    }

    bays.push({
      index: bays.length,
      id: `bay-${bays.length}-${inv.room.id}`,
      xStartFeet,
      xEndFeet,
      widthFeet,
      widthFormatted: formatFeetAndInches(widthFeet),
      roomType,
      label,
      hasBalcony,
      hasWindow: !hasBalcony && roomType !== "VOID",
      hasDoor: hasBalcony || (i === 0 && orientation === "FRONT"),
      associatedRoomName: inv.room.name,
    });
  });

  return bays;
}

/**
 * Generate structural datum levels matching AutoCAD Elevation standards (Image 2):
 * - Ground / Plinth Level: EL. +1'-6"
 * - 1st Floor: EL. +11'-6"
 * - 2nd Floor: EL. +21'-6"
 * - 3rd Floor: EL. +31'-6"
 * - 4th Floor: EL. +41'-6"
 * - Roof Level: EL. +51'-6"
 * - Parapet Level: EL. +54'-6"
 * - Stair Room Roof: EL. +61'-6"
 */
export function generateDatumLevels(
  storyCount: number,
  storyHeightFeet: number = 10.0,
  plinthHeightFeet: number = 1.5,
  parapetHeightFeet: number = 3.0,
  stairRoomHeightFeet: number = 7.0
): DatumLevel[] {
  const levels: DatumLevel[] = [];

  // 1. Foundation / Ground Baseline
  levels.push({
    id: "lvl-ground",
    name: "GROUND LEVEL / BASE",
    levelIndex: -1,
    elevationFeet: 0.0,
    elevationFormatted: "EL. +0'-0\"",
    isMajor: false,
    isGround: true,
  });

  // 2. Plinth Level
  levels.push({
    id: "lvl-plinth",
    name: "GROUND LEVEL / PLINTH",
    levelIndex: 0,
    elevationFeet: plinthHeightFeet,
    elevationFormatted: `EL. +${formatFeetAndInches(plinthHeightFeet)}`,
    isMajor: true,
    isPlinth: true,
  });

  // 3. Floor Levels (1st Floor to N-th Floor)
  let currentElevation = plinthHeightFeet;

  for (let i = 1; i < storyCount; i++) {
    currentElevation += storyHeightFeet;
    const suffix = i === 1 ? "ST" : i === 2 ? "ND" : i === 3 ? "RD" : "TH";
    levels.push({
      id: `lvl-floor-${i}`,
      name: `${i}${suffix} FLOOR`,
      levelIndex: i,
      elevationFeet: currentElevation,
      elevationFormatted: `EL. +${formatFeetAndInches(currentElevation)}`,
      isMajor: true,
    });
  }

  // 4. Roof Level
  currentElevation += storyHeightFeet;
  const roofElevation = currentElevation;
  levels.push({
    id: "lvl-roof",
    name: "ROOF LEVEL",
    levelIndex: storyCount,
    elevationFeet: roofElevation,
    elevationFormatted: `EL. +${formatFeetAndInches(roofElevation)}`,
    isMajor: true,
    isRoof: true,
  });

  // 5. Parapet Level (+3'-0" above roof)
  const parapetElevation = roofElevation + parapetHeightFeet;
  levels.push({
    id: "lvl-parapet",
    name: "PARAPET LEVEL",
    levelIndex: storyCount + 1,
    elevationFeet: parapetElevation,
    elevationFormatted: `EL. +${formatFeetAndInches(parapetElevation)}`,
    isMajor: false,
    isParapet: true,
  });

  // 6. Stair Room Roof (+7'-0" above parapet or roof)
  const stairElevation = parapetElevation + stairRoomHeightFeet;
  levels.push({
    id: "lvl-stair-roof",
    name: "STAIR ROOM ROOF",
    levelIndex: storyCount + 2,
    elevationFeet: stairElevation,
    elevationFormatted: `EL. +${formatFeetAndInches(stairElevation)}`,
    isMajor: true,
    isStairRoom: true,
  });

  return levels;
}

/**
 * Generate standard architectural vertical dimension strings with ticks
 */
export function generateVerticalDimensions(
  datumLevels: DatumLevel[],
  storyHeightFeet: number = 10.0,
  parapetHeightFeet: number = 3.0,
  stairRoomHeightFeet: number = 7.0
): DimensionCallout[] {
  const dims: DimensionCallout[] = [];

  // Dimension between Ground and Plinth
  const plinth = datumLevels.find((d) => d.isPlinth);
  if (plinth) {
    dims.push({
      id: "dim-vert-plinth",
      axis: "VERTICAL",
      startFeet: 0,
      endFeet: plinth.elevationFeet,
      spanFeet: plinth.elevationFeet,
      valueFormatted: formatFeetAndInches(plinth.elevationFeet),
      label: "PLINTH HT.",
      side: "RIGHT",
    });
  }

  // Dimension for each typical floor
  for (let i = 0; i < datumLevels.length - 1; i++) {
    const cur = datumLevels[i];
    const nxt = datumLevels[i + 1];
    if (cur.levelIndex >= 0 && nxt.levelIndex <= datumLevels.filter((d) => d.isRoof)[0]?.levelIndex) {
      const span = nxt.elevationFeet - cur.elevationFeet;
      dims.push({
        id: `dim-vert-floor-${cur.levelIndex}`,
        axis: "VERTICAL",
        startFeet: cur.elevationFeet,
        endFeet: nxt.elevationFeet,
        spanFeet: span,
        valueFormatted: formatFeetAndInches(span),
        side: "RIGHT",
      });
    }
  }

  // Parapet Dimension
  dims.push({
    id: "dim-vert-parapet",
    axis: "VERTICAL",
    startFeet: datumLevels.find((d) => d.isRoof)?.elevationFeet || 51.5,
    endFeet: datumLevels.find((d) => d.isParapet)?.elevationFeet || 54.5,
    spanFeet: parapetHeightFeet,
    valueFormatted: formatFeetAndInches(parapetHeightFeet),
    label: "PARAPET",
    side: "RIGHT",
  });

  // Stair Room Dimension
  dims.push({
    id: "dim-vert-stair",
    axis: "VERTICAL",
    startFeet: datumLevels.find((d) => d.isParapet)?.elevationFeet || 54.5,
    endFeet: datumLevels.find((d) => d.isStairRoom)?.elevationFeet || 61.5,
    spanFeet: stairRoomHeightFeet,
    valueFormatted: formatFeetAndInches(stairRoomHeightFeet),
    label: "STAIR ROOM",
    side: "RIGHT",
  });

  return dims;
}

/**
 * Generate standard architectural horizontal bay dimension strings
 */
export function generateHorizontalDimensions(
  bays: BayProjection[]
): DimensionCallout[] {
  return bays.map((bay, idx) => ({
    id: `dim-horiz-bay-${idx}`,
    axis: "HORIZONTAL",
    startFeet: bay.xStartFeet,
    endFeet: bay.xEndFeet,
    spanFeet: bay.widthFeet,
    valueFormatted: bay.widthFormatted,
    label: bay.label,
    side: "BOTTOM",
  }));
}

/**
 * Compute Complete Parametric Orthographic CAD Elevation Model
 */
export function computeElevationModel(
  rooms: RoomItem[],
  doorsWindows: DoorWindowItem[] = [],
  options: Partial<ElevationOptions> = {}
): ElevationModel {
  const orientation = options.orientation || "BACK";
  const storyCount = Math.max(1, Math.min(10, options.storyCount ?? 5)); // default 5 stories
  const storyHeightFeet = options.storyHeightFeet ?? 10.0;
  const plinthHeightFeet = options.plinthHeightFeet ?? 1.5;
  const parapetHeightFeet = options.parapetHeightFeet ?? 3.0;
  const stairRoomHeightFeet = options.stairRoomHeightFeet ?? 7.0;

  // Extract bays from 2D floor plan
  let bays = extractElevationBays(rooms, orientation);

  // If no rooms exist or extraction is empty, provide default 5-bay residential reference
  if (bays.length === 0) {
    bays = [
      {
        index: 0,
        id: "bay-default-1",
        xStartFeet: 0,
        xEndFeet: 14.0,
        widthFeet: 14.0,
        widthFormatted: "14'-0\"",
        roomType: "BEDROOM",
        label: "14'-0\" M.BED (VER)",
        hasBalcony: true,
        hasWindow: false,
        hasDoor: true,
      },
      {
        index: 1,
        id: "bay-default-2",
        xStartFeet: 14.0,
        xEndFeet: 27.75,
        widthFeet: 13.75,
        widthFormatted: "13'-9\"",
        roomType: "BEDROOM",
        label: "13'-9\" M.BED (VER)",
        hasBalcony: true,
        hasWindow: false,
        hasDoor: true,
      },
      {
        index: 2,
        id: "bay-default-void",
        xStartFeet: 27.75,
        xEndFeet: 34.75,
        widthFeet: 7.0,
        widthFormatted: "7'-0\"",
        roomType: "VOID",
        label: "CENTRAL VOID",
        hasBalcony: false,
        hasWindow: false,
        hasDoor: false,
      },
      {
        index: 3,
        id: "bay-default-3",
        xStartFeet: 34.75,
        xEndFeet: 48.5,
        widthFeet: 13.75,
        widthFormatted: "13'-9\"",
        roomType: "BEDROOM",
        label: "13'-9\" M.BED (VER)",
        hasBalcony: true,
        hasWindow: false,
        hasDoor: true,
      },
      {
        index: 4,
        id: "bay-default-4",
        xStartFeet: 48.5,
        xEndFeet: 62.5,
        widthFeet: 14.0,
        widthFormatted: "14'-0\"",
        roomType: "BEDROOM",
        label: "14'-0\" M.BED (VER)",
        hasBalcony: true,
        hasWindow: false,
        hasDoor: true,
      },
    ];
  }

  // Calculate total building width
  const totalWidthFeet = bays.reduce((max, b) => Math.max(max, b.xEndFeet), 0);

  // Generate datum levels
  const datumLevels = generateDatumLevels(
    storyCount,
    storyHeightFeet,
    plinthHeightFeet,
    parapetHeightFeet,
    stairRoomHeightFeet
  );

  const topLevel = datumLevels[datumLevels.length - 1];
  const totalHeightFeet = topLevel.elevationFeet;

  // Generate dimensions
  const verticalDimensions = generateVerticalDimensions(
    datumLevels,
    storyHeightFeet,
    parapetHeightFeet,
    stairRoomHeightFeet
  );

  const horizontalDimensions = generateHorizontalDimensions(bays);

  // Check for central void & stair bay
  const voidBayIndex = bays.findIndex((b) => b.roomType === "VOID" || b.roomType === "STAIR");
  const hasCentralVoid = voidBayIndex !== -1;
  const stairBayIndex = voidBayIndex !== -1 ? voidBayIndex : Math.floor(bays.length / 2);

  // Drawing title block metadata
  const drawingTitle =
    options.drawingTitle ||
    (orientation === "BACK"
      ? "BACK ELEVATION"
      : orientation === "FRONT"
      ? "FRONT ELEVATION"
      : orientation === "LEFT"
      ? "LEFT SIDE ELEVATION"
      : "RIGHT SIDE ELEVATION");

  return {
    orientation,
    storyCount,
    totalWidthFeet,
    totalHeightFeet,
    plinthHeightFeet,
    storyHeightFeet,
    parapetHeightFeet,
    stairRoomHeightFeet,
    bays,
    datumLevels,
    verticalDimensions,
    horizontalDimensions,
    hasCentralVoid,
    hasStairRoom: true,
    stairBayIndex,
    drawingMetadata: {
      projectName: options.projectName || "RESIDENTIAL BUILDING",
      drawingTitle,
      scale: 'SCALE: 1/8" = 1\'-0"',
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      sheet: "A-201",
      revision: "R01",
    },
  };
}
