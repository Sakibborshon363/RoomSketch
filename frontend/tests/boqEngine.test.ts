import { describe, it, expect } from "vitest";
import {
  calculateProjectBoQ,
  exportBoQToCsv,
  formatCurrency,
  SUPPORTED_CURRENCIES,
} from "@/lib/boqEngine";
import { RoomItem, FurnitureItem, DoorWindowItem } from "@/types/editor";

describe("Architectural BoQ & Cost Estimation Engine", () => {
  const sampleRooms: RoomItem[] = [
    {
      id: "room-1",
      name: "Master Bedroom",
      x: 100,
      y: 100,
      width: 250, // 5.0m
      height: 200, // 4.0m -> Area: 20.0 m², Perimeter: 18.0m
      wallThickness: 10,
      wallColor: "#333333",
      floorColor: "#f5efe6",
      floorMaterial: "hardwood_oak",
    },
    {
      id: "room-2",
      name: "Ensuite Bathroom",
      x: 350,
      y: 100,
      width: 150, // 3.0m
      height: 100, // 2.0m -> Area: 6.0 m², Perimeter: 10.0m
      wallThickness: 10,
      wallColor: "#333333",
      floorColor: "#e8f1f2",
      floorMaterial: "ceramic_slate",
    },
  ];

  const sampleDoorsWindows: DoorWindowItem[] = [
    {
      id: "door-1",
      name: "Entrance Single Door",
      type: "DOOR",
      x: 100,
      y: 100,
      width: 45, // 0.9m
      height: 105, // 2.1m
      rotation: 0,
    },
    {
      id: "win-1",
      name: "Master Bedroom Window",
      type: "WINDOW",
      x: 150,
      y: 100,
      width: 60, // 1.2m
      height: 70, // 1.4m
      rotation: 0,
    },
  ];

  const sampleFurniture: FurnitureItem[] = [
    {
      id: "furn-1",
      name: "King Bed",
      type: "bed_king",
      category: "BEDROOM",
      x: 120,
      y: 120,
      width: 100,
      height: 100,
      rotation: 0,
      color: "#ffffff",
      material: "fabric",
      zIndex: 1,
      isLocked: false,
      isVisible: true,
    },
    {
      id: "furn-2",
      name: "3-Seater Sofa",
      type: "sofa_3seater",
      category: "LIVING_ROOM",
      x: 150,
      y: 150,
      width: 110,
      height: 45,
      rotation: 0,
      color: "#334155",
      material: "leather",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    },
  ];

  it("calculates accurate floor area with 10% wastage cutting allowance", () => {
    const boq = calculateProjectBoQ({
      rooms: sampleRooms,
      doorsWindows: sampleDoorsWindows,
      furniture: sampleFurniture,
      currencyCode: "USD",
    });

    // Room 1: 5.0m x 4.0m = 20.0 m² net -> 22.0 m² gross (+10%)
    // Room 2: 3.0m x 2.0m = 6.0 m² net -> 6.6 m² gross (+10%)
    expect(boq.totalFloorAreaSqm).toBe(26.0);
    expect(boq.flooringItems).toHaveLength(2);
    expect(boq.flooringItems[0].grossAreaWithWastageSqm).toBe(22.0);
    expect(boq.flooringItems[1].grossAreaWithWastageSqm).toBe(6.6);

    // Hardwood Oak rate = $68.0, 22.0 * 68 = 1496.0
    expect(boq.flooringItems[0].subtotal).toBe(1496.0);
    expect(boq.totalFlooringCost).toBeGreaterThan(0);
  });

  it("deducts openings from wall paint area and computes paint volume", () => {
    const boq = calculateProjectBoQ({
      rooms: sampleRooms,
      doorsWindows: sampleDoorsWindows,
      furniture: sampleFurniture,
      ceilingHeight: 3.0, // 3m ceiling
      currencyCode: "USD",
    });

    expect(boq.wallItems).toHaveLength(2);
    // Room 1 perimeter = 2 * (5 + 4) = 18m. Gross wall = 18 * 3.0 = 54 m²
    expect(boq.wallItems[0].grossWallAreaSqm).toBe(54.0);
    // Openings must reduce net paintable area
    expect(boq.wallItems[0].netPaintableAreaSqm).toBeLessThan(54.0);
    expect(boq.totalPaintRequiredLiters).toBeGreaterThan(0);
    expect(boq.totalWallFinishesCost).toBeGreaterThan(0);
  });

  it("aggregates furniture schedule by catalog type with unit pricing", () => {
    const boq = calculateProjectBoQ({
      rooms: sampleRooms,
      doorsWindows: sampleDoorsWindows,
      furniture: sampleFurniture,
      currencyCode: "USD",
    });

    expect(boq.totalFurnitureCount).toBe(2);
    expect(boq.furnitureItems).toHaveLength(2);
    // Bed King ($950) + 3-Seater Sofa ($850) = $1800
    expect(boq.totalFurnitureCost).toBe(1800.0);
  });

  it("applies trade labor percentage and contingency markup accurately", () => {
    const boq = calculateProjectBoQ({
      rooms: sampleRooms,
      doorsWindows: sampleDoorsWindows,
      furniture: sampleFurniture,
      laborPercentage: 20,
      contingencyPercentage: 10,
    });

    const expectedLabor = boq.subtotalMaterials * 0.2;
    expect(boq.laborCost).toBeCloseTo(expectedLabor, 1);

    const expectedContingency = (boq.subtotalMaterials + boq.laborCost) * 0.1;
    expect(boq.contingencyCost).toBeCloseTo(expectedContingency, 1);

    expect(boq.grandTotal).toBeCloseTo(
      boq.subtotalMaterials + boq.laborCost + boq.contingencyCost,
      1
    );
  });

  it("formats multi-currency values correctly", () => {
    expect(formatCurrency(1000, "USD")).toBe("$1,000.00");
    expect(formatCurrency(1000, "EUR")).toBe("€920.00");
    expect(formatCurrency(1000, "GBP")).toBe("£790.00");
    expect(formatCurrency(1000, "BDT")).toContain("৳");
  });

  it("generates structured CSV spreadsheet data for export", () => {
    const boq = calculateProjectBoQ({
      rooms: sampleRooms,
      doorsWindows: sampleDoorsWindows,
      furniture: sampleFurniture,
      currencyCode: "USD",
    });

    const csv = exportBoQToCsv(boq, "Contemporary Villa", "Ground Level");
    expect(csv).toContain("RoomSketch Architectural Bill of Quantities");
    expect(csv).toContain("Contemporary Villa");
    expect(csv).toContain("SECTION 1: FLOORING & SURFACE MATERIALS");
    expect(csv).toContain("SECTION 2: WALL FINISHES, PAINT & BASEBOARDS");
    expect(csv).toContain("SECTION 3: FURNITURE & FIXTURES SCHEDULE");
    expect(csv).toContain("GRAND TOTAL ESTIMATED BUDGET");
  });
});
