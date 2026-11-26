import { RoomItem, FurnitureItem, DoorWindowItem, UnitSystem } from "@/types/editor";

export type BuildingArchetype =
  | "RESIDENTIAL_COMPLEX_5S" // 5-Story multi-unit apartment matching Image 1 & 2
  | "MODERN_DUPLEX_VILLA" // 2-Story modern luxury villa with terrace
  | "CONTEMPORARY_3BED" // 3-Bedroom urban apartment
  | "COMMERCIAL_STUDIO"; // Modern creative studio / open-plan office

export interface GeneratedStructurePlan {
  name: string;
  archetype: BuildingArchetype;
  description: string;
  storyCount: number;
  totalAreaSqM: number;
  totalAreaSqFt: number;
  rooms: RoomItem[];
  doorsWindows: DoorWindowItem[];
  furniture: FurnitureItem[];
  structuralColumns: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }[];
  specifications: {
    stories: number;
    bedrooms: number;
    bathrooms: number;
    balconies: number;
    structuralGrid: string;
    exteriorWallThickness: string;
    interiorWallThickness: string;
    ceilingHeight: string;
  };
}

/**
 * Generate structural reinforced concrete columns (30cm x 30cm) at room corners & grid intersections
 */
export function generateStructuralColumns(rooms: RoomItem[]): {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}[] {
  const points = new Map<string, { x: number; y: number }>();

  rooms.forEach((r) => {
    const corners = [
      { x: r.x, y: r.y },
      { x: r.x + r.width, y: r.y },
      { x: r.x, y: r.y + r.height },
      { x: r.x + r.width, y: r.y + r.height },
    ];

    corners.forEach((pt) => {
      // Snap to nearest 10px to weld shared corners
      const key = `${Math.round(pt.x / 10) * 10}_${Math.round(pt.y / 10) * 10}`;
      if (!points.has(key)) {
        points.set(key, { x: Math.round(pt.x / 10) * 10, y: Math.round(pt.y / 10) * 10 });
      }
    });
  });

  const columns: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }[] = [];

  let idx = 1;
  points.forEach((pt) => {
    columns.push({
      id: `col-${idx}`,
      x: pt.x - 7.5,
      y: pt.y - 7.5,
      width: 15, // 30cm at 50px = 1m
      height: 15,
      label: `C${idx}`,
    });
    idx++;
  });

  return columns;
}

/**
 * Generates an end-to-end professional architectural floor plan and multi-story structure
 */
export function generateAutomatedArchitecture(
  archetype: BuildingArchetype,
  options: {
    projectName?: string;
    unit?: UnitSystem;
    includeColumns?: boolean;
    autoFurnish?: boolean;
  } = {}
): GeneratedStructurePlan {
  const { includeColumns = true, autoFurnish = true, projectName } = options;
  const now = Date.now();
  const formatName = (base: string) => (projectName ? `${projectName} - ${base}` : base);

  switch (archetype) {
    case "RESIDENTIAL_COMPLEX_5S": {
      // 5-Story Residential Blueprint matching Image 1, 2, and 3
      const rooms: RoomItem[] = [
        // Back Side (North) Master Bedrooms & Verandahs
        {
          id: `r-mbed1-${now}`,
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
          id: `r-ver1-${now}`,
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
        {
          id: `r-mbed2-${now}`,
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
          id: `r-ver2-${now}`,
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
        // Central Void & Stair Core
        {
          id: `r-void-${now}`,
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
          id: `r-stair-${now}`,
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
        // Right Side Back Master Bedrooms & Verandahs
        {
          id: `r-mbed3-${now}`,
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
          id: `r-ver3-${now}`,
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
        {
          id: `r-mbed4-${now}`,
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
          id: `r-ver4-${now}`,
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
        // Mid-Wing Services & Living
        {
          id: `r-bath1-${now}`,
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
          id: `r-kit1-${now}`,
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
          id: `r-draw1-${now}`,
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
        {
          id: `r-bath2-${now}`,
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
          id: `r-kit2-${now}`,
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
          id: `r-draw2-${now}`,
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
        // Front Side (South) Common Bedrooms & Dining
        {
          id: `r-cbed1-${now}`,
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
          id: `r-din1-${now}`,
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
        {
          id: `r-din2-${now}`,
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
          id: `r-cbed2-${now}`,
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
      ];

      // Doors and Windows
      const doorsWindows: DoorWindowItem[] = [
        { id: `dw-ver1-${now}`, name: "Aluminum Sliding Door", type: "DOOR", x: 95, y: 40, width: 30, height: 8, rotation: 0 },
        { id: `dw-ver2-${now}`, name: "Aluminum Sliding Door", type: "DOOR", x: 235, y: 40, width: 30, height: 8, rotation: 0 },
        { id: `dw-ver3-${now}`, name: "Aluminum Sliding Door", type: "DOOR", x: 443, y: 40, width: 30, height: 8, rotation: 0 },
        { id: `dw-ver4-${now}`, name: "Aluminum Sliding Door", type: "DOOR", x: 581, y: 40, width: 30, height: 8, rotation: 0 },
        { id: `dw-frnt1-${now}`, name: "Casement Window", type: "WINDOW", x: 95, y: 434, width: 30, height: 8, rotation: 0 },
        { id: `dw-frnt2-${now}`, name: "Casement Window", type: "WINDOW", x: 235, y: 434, width: 30, height: 8, rotation: 0 },
        { id: `dw-frnt3-${now}`, name: "Casement Window", type: "WINDOW", x: 443, y: 434, width: 30, height: 8, rotation: 0 },
        { id: `dw-frnt4-${now}`, name: "Casement Window", type: "WINDOW", x: 581, y: 434, width: 30, height: 8, rotation: 0 },
      ];

      // Furniture
      const furniture: FurnitureItem[] = [
        {
          id: `f-bed1-${now}`,
          name: "King Bed",
          category: "BEDROOM",
          type: "bed_king",
          x: 110,
          y: 105,
          width: 45,
          height: 50,
          rotation: 0,
          color: "#94A3B8",
          material: "Fabric",
          isLocked: false,
          isVisible: true,
          zIndex: 1,
        },
        {
          id: `f-sofa1-${now}`,
          name: "L-Shape Sectional Sofa",
          category: "LIVING_ROOM",
          type: "sofa_sectional_l",
          x: 214,
          y: 237,
          width: 55,
          height: 45,
          rotation: 0,
          color: "#334155",
          material: "Leather",
          isLocked: false,
          isVisible: true,
          zIndex: 1,
        },
        {
          id: `f-din1-${now}`,
          name: "Dining Table 6P",
          category: "DINING_ROOM",
          type: "dining_table_6p",
          x: 249,
          y: 369,
          width: 50,
          height: 35,
          rotation: 0,
          color: "#B45309",
          material: "Timber",
          isLocked: false,
          isVisible: true,
          zIndex: 1,
        },
      ];

      const columns = generateStructuralColumns(rooms);

      return {
        name: formatName("5-Story Modern Residential Complex"),
        archetype: "RESIDENTIAL_COMPLEX_5S",
        description:
          "Full multi-story residential building featuring 4 master bedroom suites with cantilevered verandah balconies, central natural light void, reinforced stair core, dual drawing/dining halls, and ground-floor entrances.",
        storyCount: 5,
        totalAreaSqM: 320,
        totalAreaSqFt: 3444,
        rooms,
        doorsWindows,
        furniture: autoFurnish ? furniture : [],
        structuralColumns: includeColumns ? columns : [],
        specifications: {
          stories: 5,
          bedrooms: 6,
          bathrooms: 4,
          balconies: 4,
          structuralGrid: "RCC Frame (300x300mm Columns)",
          exteriorWallThickness: "200mm (8\")",
          interiorWallThickness: "125mm (5\")",
          ceilingHeight: "3.00m (10'-0\")",
        },
      };
    }

    case "MODERN_DUPLEX_VILLA": {
      // Modern Luxury 2-Story Villa
      const rooms: RoomItem[] = [
        {
          id: `v-living-${now}`,
          name: "Grand Living & Lounge",
          x: 50,
          y: 50,
          width: 220,
          height: 160,
          wallThickness: 10,
          wallColor: "#F1F5F9",
          floorColor: "#E2E8F0",
          floorMaterial: "MARBLE",
        },
        {
          id: `v-dining-${now}`,
          name: "Open Dining Area",
          x: 270,
          y: 50,
          width: 140,
          height: 160,
          wallThickness: 10,
          wallColor: "#F8FAFC",
          floorColor: "#E2E8F0",
          floorMaterial: "WOOD_HARDWOOD",
        },
        {
          id: `v-kitchen-${now}`,
          name: "Chef's Island Kitchen",
          x: 410,
          y: 50,
          width: 140,
          height: 160,
          wallThickness: 10,
          wallColor: "#E2E8F0",
          floorColor: "#CBD5E1",
          floorMaterial: "CERAMIC_TILE",
        },
        {
          id: `v-terrace-${now}`,
          name: "Covered Garden Verandah",
          x: 50,
          y: 210,
          width: 220,
          height: 60,
          wallThickness: 8,
          wallColor: "#94A3B8",
          floorColor: "#CBD5E1",
          floorMaterial: "STONE_SLATE",
        },
        {
          id: `v-stair-${now}`,
          name: "Architectural Spiral Stair",
          x: 270,
          y: 210,
          width: 80,
          height: 140,
          wallThickness: 10,
          wallColor: "#475569",
          floorColor: "#E2E8F0",
          floorMaterial: "POLISHED_CONCRETE",
        },
        {
          id: `v-master-${now}`,
          name: "Primary Suite (Bedroom)",
          x: 350,
          y: 210,
          width: 200,
          height: 140,
          wallThickness: 10,
          wallColor: "#F8FAFC",
          floorColor: "#CBD5E1",
          floorMaterial: "WOOD_HARDWOOD",
        },
      ];

      const doorsWindows: DoorWindowItem[] = [
        { id: `v-dw1-${now}`, name: "Grand Entrance Door", type: "DOOR", x: 160, y: 50, width: 36, height: 8, rotation: 0 },
        { id: `v-dw2-${now}`, name: "Full Glass Sliding Door", type: "DOOR", x: 160, y: 210, width: 45, height: 8, rotation: 0 },
        { id: `v-dw3-${now}`, name: "Panorama Picture Window", type: "WINDOW", x: 480, y: 50, width: 40, height: 8, rotation: 0 },
      ];

      const furniture: FurnitureItem[] = [
        {
          id: `v-sofa-${now}`,
          name: "Curved Luxury Sofa",
          category: "LIVING_ROOM",
          type: "sofa_curved",
          x: 160,
          y: 130,
          width: 60,
          height: 35,
          rotation: 0,
          color: "#1E293B",
          material: "Velvet",
          isLocked: false,
          isVisible: true,
          zIndex: 1,
        },
        {
          id: `v-bed-${now}`,
          name: "Primary King Bed",
          category: "BEDROOM",
          type: "bed_king",
          x: 450,
          y: 280,
          width: 48,
          height: 52,
          rotation: 0,
          color: "#475569",
          material: "Linen",
          isLocked: false,
          isVisible: true,
          zIndex: 1,
        },
      ];

      return {
        name: formatName("Modern Luxury Duplex Villa"),
        archetype: "MODERN_DUPLEX_VILLA",
        description:
          "Contemporary 2-story luxury duplex villa featuring double-height grand living hall, chef's island kitchen, garden verandah terrace, architectural circulation stair, and private upper master suites.",
        storyCount: 2,
        totalAreaSqM: 260,
        totalAreaSqFt: 2798,
        rooms,
        doorsWindows,
        furniture: autoFurnish ? furniture : [],
        structuralColumns: includeColumns ? generateStructuralColumns(rooms) : [],
        specifications: {
          stories: 2,
          bedrooms: 4,
          bathrooms: 3,
          balconies: 2,
          structuralGrid: "Steel & Concrete Hybrid Frame",
          exteriorWallThickness: "250mm (10\") Cavity Wall",
          interiorWallThickness: "100mm (4\") Drywall",
          ceilingHeight: "3.20m (10'-6\")",
        },
      };
    }

    case "CONTEMPORARY_3BED":
    default: {
      // 3-Bedroom High-Efficiency Apartment
      const rooms: RoomItem[] = [
        {
          id: `c-living-${now}`,
          name: "Living & Dining Room",
          x: 60,
          y: 60,
          width: 200,
          height: 140,
          wallThickness: 10,
          wallColor: "#F8FAFC",
          floorColor: "#E2E8F0",
          floorMaterial: "WOOD_HARDWOOD",
        },
        {
          id: `c-kitchen-${now}`,
          name: "Enclosed Kitchen",
          x: 260,
          y: 60,
          width: 100,
          height: 140,
          wallThickness: 10,
          wallColor: "#E2E8F0",
          floorColor: "#CBD5E1",
          floorMaterial: "CERAMIC_TILE",
        },
        {
          id: `c-bed1-${now}`,
          name: "Master Bedroom",
          x: 60,
          y: 200,
          width: 130,
          height: 120,
          wallThickness: 10,
          wallColor: "#E2E8F0",
          floorColor: "#CBD5E1",
          floorMaterial: "WOOD_HARDWOOD",
        },
        {
          id: `c-bed2-${now}`,
          name: "Guest Bedroom",
          x: 190,
          y: 200,
          width: 110,
          height: 120,
          wallThickness: 10,
          wallColor: "#E2E8F0",
          floorColor: "#CBD5E1",
          floorMaterial: "WOOD_HARDWOOD",
        },
        {
          id: `c-bath-${now}`,
          name: "Shared Bathroom",
          x: 300,
          y: 200,
          width: 60,
          height: 120,
          wallThickness: 10,
          wallColor: "#CBD5E1",
          floorColor: "#E2E8F0",
          floorMaterial: "CERAMIC_TILE",
        },
      ];

      const doorsWindows: DoorWindowItem[] = [
        { id: `c-dw1-${now}`, name: "Main Entry Door", type: "DOOR", x: 160, y: 60, width: 30, height: 8, rotation: 0 },
        { id: `c-dw2-${now}`, name: "Balcony Sliding Window", type: "WINDOW", x: 125, y: 320, width: 35, height: 8, rotation: 0 },
      ];

      const furniture: FurnitureItem[] = [
        {
          id: `c-f1-${now}`,
          name: "3-Seater Sofa",
          category: "LIVING_ROOM",
          type: "sofa_3p",
          x: 160,
          y: 130,
          width: 50,
          height: 25,
          rotation: 0,
          color: "#334155",
          material: "Fabric",
          isLocked: false,
          isVisible: true,
          zIndex: 1,
        },
        {
          id: `c-f2-${now}`,
          name: "Queen Bed",
          category: "BEDROOM",
          type: "bed_queen",
          x: 125,
          y: 260,
          width: 42,
          height: 48,
          rotation: 0,
          color: "#64748B",
          material: "Wood",
          isLocked: false,
          isVisible: true,
          zIndex: 1,
        },
      ];

      return {
        name: formatName("Contemporary 3-Bedroom Apartment"),
        archetype: "CONTEMPORARY_3BED",
        description:
          "Efficient modern 3-bedroom urban residence with open living/dining lounge, dedicated kitchen, master en-suite, and natural daylight orientation.",
        storyCount: 1,
        totalAreaSqM: 140,
        totalAreaSqFt: 1506,
        rooms,
        doorsWindows,
        furniture: autoFurnish ? furniture : [],
        structuralColumns: includeColumns ? generateStructuralColumns(rooms) : [],
        specifications: {
          stories: 1,
          bedrooms: 3,
          bathrooms: 2,
          balconies: 1,
          structuralGrid: "Standard RCC Column Grid",
          exteriorWallThickness: "200mm (8\")",
          interiorWallThickness: "125mm (5\")",
          ceilingHeight: "2.80m (9'-2\")",
        },
      };
    }

    case "COMMERCIAL_STUDIO": {
      // Modern Creative Studio & Open-Plan Commercial Space
      const rooms: RoomItem[] = [
        {
          id: `cs-open-${now}`,
          name: "Open Collaborative Workspace",
          x: 60,
          y: 60,
          width: 240,
          height: 160,
          wallThickness: 10,
          wallColor: "#F8FAFC",
          floorColor: "#CBD5E1",
          floorMaterial: "POLISHED_CONCRETE",
        },
        {
          id: `cs-conf-${now}`,
          name: "Conference & Meeting Room",
          x: 300,
          y: 60,
          width: 120,
          height: 160,
          wallThickness: 10,
          wallColor: "#E2E8F0",
          floorColor: "#CBD5E1",
          floorMaterial: "WOOD_HARDWOOD",
        },
        {
          id: `cs-exec-${now}`,
          name: "Executive Suite",
          x: 60,
          y: 220,
          width: 140,
          height: 120,
          wallThickness: 10,
          wallColor: "#E2E8F0",
          floorColor: "#CBD5E1",
          floorMaterial: "WOOD_HARDWOOD",
        },
        {
          id: `cs-pantry-${now}`,
          name: "Breakroom & Coffee Bar",
          x: 200,
          y: 220,
          width: 100,
          height: 120,
          wallThickness: 8,
          wallColor: "#CBD5E1",
          floorColor: "#E2E8F0",
          floorMaterial: "CERAMIC_TILE",
        },
        {
          id: `cs-restroom-${now}`,
          name: "Restroom",
          x: 300,
          y: 220,
          width: 120,
          height: 120,
          wallThickness: 8,
          wallColor: "#CBD5E1",
          floorColor: "#E2E8F0",
          floorMaterial: "CERAMIC_TILE",
        },
      ];

      const doorsWindows: DoorWindowItem[] = [
        { id: `cs-dw1-${now}`, name: "Double Glass Entrance", type: "DOOR", x: 160, y: 60, width: 40, height: 8, rotation: 0 },
        { id: `cs-dw2-${now}`, name: "Acoustic Glass Door", type: "DOOR", x: 300, y: 120, width: 30, height: 8, rotation: 90 },
      ];

      const furniture: FurnitureItem[] = [
        {
          id: `cs-desk1-${now}`,
          name: "Office Workstation Pod",
          category: "OFFICE",
          type: "office_desk",
          x: 120,
          y: 120,
          width: 60,
          height: 40,
          rotation: 0,
          color: "#334155",
          material: "Timber & Steel",
          isLocked: false,
          isVisible: true,
          zIndex: 1,
        },
      ];

      return {
        name: formatName("Modern Creative Commercial Studio"),
        archetype: "COMMERCIAL_STUDIO",
        description:
          "High-performance open-plan creative commercial studio with acoustic conference room, private executive suite, and modern breakroom.",
        storyCount: 3,
        totalAreaSqM: 185,
        totalAreaSqFt: 1991,
        rooms,
        doorsWindows,
        furniture: autoFurnish ? furniture : [],
        structuralColumns: includeColumns ? generateStructuralColumns(rooms) : [],
        specifications: {
          stories: 3,
          bedrooms: 0,
          bathrooms: 2,
          balconies: 0,
          structuralGrid: "Clear-Span Steel Frame",
          exteriorWallThickness: "200mm (8\") Curtain Wall",
          interiorWallThickness: "100mm (4\") Acoustic Partition",
          ceilingHeight: "3.40m (11'-2\")",
        },
      };
    }
  }
}
