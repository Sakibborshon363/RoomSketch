import { RoomItem, FurnitureItem, DoorWindowItem } from "@/types/editor";
import { FURNITURE_CATALOG, CatalogFurnitureItem } from "./furnitureCatalog";

export type AuditSeverity = "CRITICAL" | "WARNING" | "INFO";

export interface ErgonomicsIssue {
  id: string;
  severity: AuditSeverity;
  category: "CIRCULATION" | "DOOR_CLEARANCE" | "KITCHEN_WORKFLOW" | "VIEWING_DISTANCE" | "DAYLIGHT";
  title: string;
  description: string;
  affectedItemId?: string;
  affectedRoomId?: string;
  recommendation: string;
}

export interface ArchitecturalAuditReport {
  score: number; // 0 to 100
  rating: "Flawless" | "Excellent" | "Good" | "Needs Improvement" | "Suboptimal";
  totalChecks: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  issues: ErgonomicsIssue[];
}

export type DesignStylePreset = "SCANDINAVIAN" | "MODERN_MINIMAL" | "EXECUTIVE_LUXURY";

/**
 * Architectural Ergonomics & Circulation Rule Engine
 */
export function runArchitecturalAudit(
  rooms: RoomItem[],
  doorsWindows: DoorWindowItem[],
  furniture: FurnitureItem[]
): ArchitecturalAuditReport {
  const issues: ErgonomicsIssue[] = [];
  const SCALE = 50; // 50px = 1m

  // 1. Check: Empty Rooms
  rooms.forEach((room) => {
    const itemsInRoom = furniture.filter((f) => {
      const fx = f.x;
      const fy = f.y;
      return fx >= room.x && fx <= room.x + room.width && fy >= room.y && fy <= room.y + room.height;
    });

    if (itemsInRoom.length === 0) {
      issues.push({
        id: `empty-room-${room.id}`,
        severity: "INFO",
        category: "CIRCULATION",
        title: `Unfurnished Space: ${room.name}`,
        description: `Room "${room.name}" has no furniture or functional fixtures assigned.`,
        affectedRoomId: room.id,
        recommendation: "Use the 1-Click Auto-Furnish assistant to populate this space with ergonomic layouts.",
      });
    }
  });

  // 2. Check: Door Swing Arc Clearance (Minimum 90cm / 45px clearance)
  doorsWindows
    .filter((dw) => (dw.type || "").toUpperCase().includes("DOOR"))
    .forEach((door) => {
      const doorRadiusPx = door.width || 45; // ~0.9m
      furniture.forEach((f) => {
        const dist = Math.hypot(f.x - door.x, f.y - door.y);
        if (dist < doorRadiusPx + 15) {
          issues.push({
            id: `door-obstruction-${door.id}-${f.id}`,
            severity: "CRITICAL",
            category: "DOOR_CLEARANCE",
            title: `Door Swing Clearance Violation`,
            description: `"${f.name}" is positioned within the 90cm swing path of door "${door.name}".`,
            affectedItemId: f.id,
            recommendation: "Relocate the object at least 90cm away from the door frame to ensure unobstructed egress.",
          });
        }
      });
    });

  // 3. Check: Bed Walkway Circulation (Minimum 60cm / 30px side clearance)
  furniture
    .filter((f) => (f.type || "").toLowerCase().includes("bed"))
    .forEach((bed) => {
      // Find room enclosing the bed
      const room = rooms.find(
        (r) => bed.x >= r.x && bed.x <= r.x + r.width && bed.y >= r.y && bed.y <= r.y + r.height
      );

      if (room) {
        const distToLeftWall = (bed.x - bed.width / 2) - room.x;
        const distToRightWall = (room.x + room.width) - (bed.x + bed.width / 2);

        // A single bed can be placed against a wall, but King/Queen beds need bilateral clearance
        const isMasterBed = (bed.type || "").includes("king") || (bed.type || "").includes("queen");
        if (isMasterBed && (distToLeftWall < 20 || distToRightWall < 20)) {
          issues.push({
            id: `bed-circulation-${bed.id}`,
            severity: "WARNING",
            category: "CIRCULATION",
            title: `Tight Bedside Circulation Corridor`,
            description: `"${bed.name}" is positioned directly against a side wall, restricting bilateral access.`,
            affectedItemId: bed.id,
            affectedRoomId: room.id,
            recommendation: "Center the bed on the headboard wall with at least 60cm (30px) clearance on both sides for nightstands.",
          });
        }
      }
    });

  // 4. Check: Kitchen Ergonomic Workflow (Cooktop vs Sink spacing)
  const cooktops = furniture.filter((f) => (f.type || "").includes("cooktop") || (f.name || "").includes("Cooktop"));
  const sinks = furniture.filter((f) => (f.type || "").includes("sink") || (f.name || "").includes("Sink"));

  cooktops.forEach((cooktop) => {
    sinks.forEach((sink) => {
      const distM = Math.hypot(cooktop.x - sink.x, cooktop.y - sink.y) / SCALE;
      if (distM < 0.6) {
        issues.push({
          id: `kitchen-proximity-${cooktop.id}-${sink.id}`,
          severity: "WARNING",
          category: "KITCHEN_WORKFLOW",
          title: "Cooktop & Water Source Proximity Hazard",
          description: `Cooktop is located too close (${distM.toFixed(1)}m) to the sink, violating architectural water splash separation standards.`,
          affectedItemId: cooktop.id,
          recommendation: "Maintain at least 60cm - 90cm of continuous prep countertop workspace between sink and stovetop.",
        });
      }
    });
  });

  // 5. Check: Sofa-to-TV Viewing Distance
  const sofas = furniture.filter((f) => (f.type || "").includes("sofa"));
  const tvs = furniture.filter((f) => (f.type || "").includes("tv"));

  sofas.forEach((sofa) => {
    tvs.forEach((tv) => {
      const distM = Math.hypot(sofa.x - tv.x, sofa.y - tv.y) / SCALE;
      if (distM < 1.4) {
        issues.push({
          id: `tv-distance-${sofa.id}-${tv.id}`,
          severity: "WARNING",
          category: "VIEWING_DISTANCE",
          title: "Inadequate TV Viewing Distance",
          description: `Distance between Sofa and Media Console is only ${distM.toFixed(1)}m (recommended: 2.2m - 3.5m).`,
          affectedItemId: sofa.id,
          recommendation: "Increase living room viewing distance to at least 2.2 meters for optimal ergonomic viewing angles.",
        });
      }
    });
  });

  // Calculate Quality Score
  const criticalCount = issues.filter((i) => i.severity === "CRITICAL").length;
  const warningCount = issues.filter((i) => i.severity === "WARNING").length;
  const infoCount = issues.filter((i) => i.severity === "INFO").length;

  let score = 100 - criticalCount * 25 - warningCount * 10 - infoCount * 3;
  score = Math.max(20, Math.min(100, score));

  let rating: ArchitecturalAuditReport["rating"] = "Excellent";
  if (score >= 95) rating = "Flawless";
  else if (score >= 85) rating = "Excellent";
  else if (score >= 70) rating = "Good";
  else if (score >= 50) rating = "Needs Improvement";
  else rating = "Suboptimal";

  return {
    score,
    rating,
    totalChecks: rooms.length * 4 + furniture.length * 2,
    criticalCount,
    warningCount,
    infoCount,
    issues,
  };
}

/**
 * 1-Click Architectural Auto-Furnishing Layout Generator
 */
export function generateAutoFurnishLayout({
  room,
  style = "SCANDINAVIAN",
}: {
  room: RoomItem;
  style?: DesignStylePreset;
}): FurnitureItem[] {
  const generated: FurnitureItem[] = [];
  const roomName = (room.name || "").toLowerCase();
  const rx = room.x;
  const ry = room.y;
  const rw = room.width;
  const rh = room.height;
  const cx = rx + rw / 2;
  const cy = ry + rh / 2;

  const now = Date.now();

  if (roomName.includes("bed")) {
    // 1. Center King Bed against top wall
    const bedW = 95;
    const bedH = 105;
    generated.push({
      id: `ai-bed-${now}-1`,
      roomId: room.id,
      name: "Architectural King Bed",
      type: "bed_king",
      category: "BEDROOM",
      x: cx,
      y: ry + bedH / 2 + 25,
      width: bedW,
      height: bedH,
      rotation: 0,
      color: style === "SCANDINAVIAN" ? "#F5EFE6" : "#E2E8F0",
      material: "Linen",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    });

    // 2. Left Nightstand
    generated.push({
      id: `ai-night-l-${now}`,
      roomId: room.id,
      name: "Bedside Table (Left)",
      type: "nightstand_pair",
      category: "BEDROOM",
      x: cx - bedW / 2 - 20,
      y: ry + 35,
      width: 25,
      height: 25,
      rotation: 0,
      color: "#D4A373",
      material: "Solid Oak",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    });

    // 3. Right Nightstand
    generated.push({
      id: `ai-night-r-${now}`,
      roomId: room.id,
      name: "Bedside Table (Right)",
      type: "nightstand_pair",
      category: "BEDROOM",
      x: cx + bedW / 2 + 20,
      y: ry + 35,
      width: 25,
      height: 25,
      rotation: 0,
      color: "#D4A373",
      material: "Solid Oak",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    });

    // 4. Wardrobe along bottom or side wall
    generated.push({
      id: `ai-wardrobe-${now}`,
      roomId: room.id,
      name: "Sliding 3-Door Wardrobe",
      type: "wardrobe_sliding_3door",
      category: "STORAGE",
      x: rx + 30,
      y: ry + rh - 30,
      width: 110,
      height: 35,
      rotation: 0,
      color: "#E2E8F0",
      material: "Matte Lacquer",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    });

    // 5. Downlight lighting fixture
    generated.push({
      id: `ai-light-${now}`,
      roomId: room.id,
      name: "Center Chandelier",
      type: "pendant_chandelier",
      category: "LIGHTING",
      x: cx,
      y: cy,
      width: 35,
      height: 35,
      rotation: 0,
      color: "#FBBF24",
      material: "Brushed Brass",
      zIndex: 3,
      isLocked: false,
      isVisible: true,
    });
  } else if (roomName.includes("living")) {
    // 1. 3-Seater Sofa
    const sofaW = 120;
    const sofaH = 45;
    generated.push({
      id: `ai-sofa-${now}`,
      roomId: room.id,
      name: "Deep Cushion 3-Seater Sofa",
      type: "sofa_linen",
      category: "LIVING_ROOM",
      x: cx,
      y: ry + 50,
      width: sofaW,
      height: sofaH,
      rotation: 0,
      color: style === "SCANDINAVIAN" ? "#C5BCAB" : "#475569",
      material: "Textured Fabric",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    });

    // 2. Coffee Table
    generated.push({
      id: `ai-coffee-${now}`,
      roomId: room.id,
      name: "Architectural Coffee Table",
      type: "coffee_table",
      category: "LIVING_ROOM",
      x: cx,
      y: ry + 115,
      width: 65,
      height: 35,
      rotation: 0,
      color: "#E2E8F0",
      material: "Smoked Glass & Steel",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    });

    // 3. Media Credenza / TV Console
    generated.push({
      id: `ai-tv-${now}`,
      roomId: room.id,
      name: "Lowline TV Media Console",
      type: "tv_unit",
      category: "LIVING_ROOM",
      x: cx,
      y: ry + rh - 30,
      width: 140,
      height: 25,
      rotation: 0,
      color: "#334155",
      material: "Walnut",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    });

    // 4. Corner Indoor Monstera Plant
    generated.push({
      id: `ai-plant-${now}`,
      roomId: room.id,
      name: "Indoor Monstera Plant",
      type: "plant_potted",
      category: "DECORATION",
      x: rx + 30,
      y: ry + 35,
      width: 30,
      height: 30,
      rotation: 0,
      color: "#335C43",
      material: "Botanical",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    });

    // 5. Duplex Electrical Socket behind TV
    generated.push({
      id: `ai-socket-${now}`,
      roomId: room.id,
      name: "Duplex Power Socket (220V/110V)",
      type: "power_socket_duplex",
      category: "ELECTRICAL",
      x: cx + 50,
      y: ry + rh - 15,
      width: 18,
      height: 18,
      rotation: 0,
      color: "#2563EB",
      material: "Polycarbonate",
      zIndex: 3,
      isLocked: false,
      isVisible: true,
    });
  } else if (roomName.includes("kitchen") || roomName.includes("dining")) {
    // 1. Dining Table 4P
    generated.push({
      id: `ai-dining-${now}`,
      roomId: room.id,
      name: "Modern Dining Table",
      type: "dining_table_4p",
      category: "DINING_ROOM",
      x: cx + 30,
      y: cy,
      width: 80,
      height: 50,
      rotation: 0,
      color: "#FDE68A",
      material: "White Oak",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    });

    // 2. Kitchen Island Counter
    generated.push({
      id: `ai-island-${now}`,
      roomId: room.id,
      name: "Kitchen Prep Counter & Sink",
      type: "kitchen_sink_counter",
      category: "KITCHEN",
      x: rx + 40,
      y: cy,
      width: 45,
      height: 110,
      rotation: 0,
      color: "#E2E8F0",
      material: "Quartz Countertop",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    });

    // 3. Plumbing Inlet Point
    generated.push({
      id: `ai-tap-${now}`,
      roomId: room.id,
      name: "Fresh Water Supply Point",
      type: "water_inlet_tap",
      category: "PLUMBING",
      x: rx + 20,
      y: cy - 25,
      width: 18,
      height: 18,
      rotation: 0,
      color: "#0284C7",
      material: "Chrome",
      zIndex: 3,
      isLocked: false,
      isVisible: true,
    });
  } else {
    // General purpose room auto-layout
    generated.push({
      id: `ai-table-${now}`,
      roomId: room.id,
      name: "Executive Desk",
      type: "desk_executive",
      category: "OFFICE",
      x: cx,
      y: cy,
      width: 70,
      height: 40,
      rotation: 0,
      color: "#A07E60",
      material: "Timber",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    });
  }

  return generated;
}
