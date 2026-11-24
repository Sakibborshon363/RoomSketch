import { describe, it, expect } from "vitest";
import {
  runArchitecturalAudit,
  generateAutoFurnishLayout,
} from "@/lib/aiArchitectEngine";
import { RoomItem, FurnitureItem, DoorWindowItem } from "@/types/editor";

describe("AI Architectural Design & Ergonomics Engine", () => {
  const mockRoom: RoomItem = {
    id: "room-bedroom-1",
    name: "Master Bedroom",
    x: 100,
    y: 100,
    width: 300, // 6.0m
    height: 250, // 5.0m
    wallThickness: 12,
    wallColor: "#333",
    floorColor: "#f5efe6",
    floorMaterial: "hardwood_oak",
  };

  it("should flag empty, unfurnished rooms with INFO advisory", () => {
    const report = runArchitecturalAudit([mockRoom], [], []);

    expect(report.issues.length).toBeGreaterThanOrEqual(1);
    const emptyIssue = report.issues.find((i) => i.id.includes("empty-room"));
    expect(emptyIssue).toBeDefined();
    expect(emptyIssue?.severity).toBe("INFO");
    expect(emptyIssue?.category).toBe("CIRCULATION");
    expect(report.score).toBeLessThan(100);
  });

  it("should detect door swing clearance obstruction with CRITICAL severity", () => {
    const door: DoorWindowItem = {
      id: "door-101",
      name: "Bedroom Ingress Door",
      type: "SINGLE_DOOR",
      x: 120,
      y: 100,
      width: 45, // 0.9m swing radius
      height: 105,
      rotation: 0,
    };

    // Item placed right in the door swing path
    const blockingNightstand: FurnitureItem = {
      id: "furn-block",
      roomId: "room-bedroom-1",
      name: "Blocking Nightstand",
      category: "BEDROOM",
      type: "nightstand",
      x: 125, // only 5px away!
      y: 110,
      width: 25,
      height: 25,
      rotation: 0,
      color: "#d4a373",
      material: "Wood",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    };

    const report = runArchitecturalAudit([mockRoom], [door], [blockingNightstand]);

    expect(report.criticalCount).toBeGreaterThanOrEqual(1);
    const doorIssue = report.issues.find((i) => i.severity === "CRITICAL");
    expect(doorIssue).toBeDefined();
    expect(doorIssue?.category).toBe("DOOR_CLEARANCE");
    expect(doorIssue?.recommendation).toContain("90cm");
  });

  it("should detect tight bed circulation corridor against room side wall", () => {
    const tightBed: FurnitureItem = {
      id: "furn-king-bed",
      roomId: "room-bedroom-1",
      name: "King Bed",
      category: "BEDROOM",
      type: "bed_king",
      x: mockRoom.x + 40, // width is 95, so left edge is at x: 40 - 47.5 < mockRoom.x (against wall!)
      y: mockRoom.y + 70,
      width: 95,
      height: 105,
      rotation: 0,
      color: "#f5efe6",
      material: "Linen",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    };

    const report = runArchitecturalAudit([mockRoom], [], [tightBed]);
    const bedIssue = report.issues.find((i) => i.category === "CIRCULATION" && i.id.includes("bed-circulation"));

    expect(bedIssue).toBeDefined();
    expect(bedIssue?.severity).toBe("WARNING");
    expect(bedIssue?.recommendation).toContain("60cm");
  });

  it("should detect kitchen splash proximity hazard between cooktop and sink", () => {
    const kitchenRoom: RoomItem = {
      id: "room-kitchen-1",
      name: "Chef's Kitchen",
      x: 500,
      y: 100,
      width: 250,
      height: 200,
      wallThickness: 12,
      wallColor: "#333",
      floorColor: "#e2e8f0",
      floorMaterial: "ceramic_tile",
    };

    const cooktop: FurnitureItem = {
      id: "cooktop-1",
      roomId: kitchenRoom.id,
      name: "Induction Cooktop",
      category: "KITCHEN",
      type: "cooktop_induction",
      x: 550,
      y: 150,
      width: 30,
      height: 30,
      rotation: 0,
      color: "#1e293b",
      material: "Ceramic Glass",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    };

    const sink: FurnitureItem = {
      id: "sink-1",
      roomId: kitchenRoom.id,
      name: "Double Bowl Sink",
      category: "KITCHEN",
      type: "sink_double",
      x: 565, // only 15px away (< 0.6m = 30px)
      y: 150,
      width: 30,
      height: 30,
      rotation: 0,
      color: "#94a3b8",
      material: "Stainless Steel",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    };

    const report = runArchitecturalAudit([kitchenRoom], [], [cooktop, sink]);
    const kitchenIssue = report.issues.find((i) => i.category === "KITCHEN_WORKFLOW");

    expect(kitchenIssue).toBeDefined();
    expect(kitchenIssue?.severity).toBe("WARNING");
    expect(kitchenIssue?.title).toContain("Cooktop & Water Source Proximity Hazard");
  });

  it("should generate balanced, coordinated 1-click auto-furnishing layout for bedroom", () => {
    const generated = generateAutoFurnishLayout({
      room: mockRoom,
      style: "SCANDINAVIAN",
    });

    expect(generated.length).toBeGreaterThanOrEqual(4);
    const hasBed = generated.some((f) => f.type.includes("bed"));
    const hasWardrobe = generated.some((f) => f.type.includes("wardrobe"));
    const hasLighting = generated.some((f) => f.category === "LIGHTING");

    expect(hasBed).toBe(true);
    expect(hasWardrobe).toBe(true);
    expect(hasLighting).toBe(true);

    // All items should have valid coordinates inside room bounding box
    generated.forEach((item) => {
      expect(item.x).toBeGreaterThanOrEqual(mockRoom.x);
      expect(item.x).toBeLessThanOrEqual(mockRoom.x + mockRoom.width);
      expect(item.y).toBeGreaterThanOrEqual(mockRoom.y);
      expect(item.y).toBeLessThanOrEqual(mockRoom.y + mockRoom.height);
      expect(item.roomId).toBe(mockRoom.id);
    });
  });

  it("should generate living room layout with sofa, coffee table, and electrical fixtures", () => {
    const livingRoom: RoomItem = {
      id: "room-living-1",
      name: "Main Living Room",
      x: 0,
      y: 0,
      width: 400,
      height: 300,
      wallThickness: 12,
      wallColor: "#333",
      floorColor: "#ebdccb",
      floorMaterial: "warm_oak",
    };

    const generated = generateAutoFurnishLayout({
      room: livingRoom,
      style: "MODERN_MINIMAL",
    });

    expect(generated.length).toBeGreaterThanOrEqual(4);
    const hasSofa = generated.some((f) => f.type.includes("sofa"));
    const hasTV = generated.some((f) => f.type.includes("tv"));
    const hasElectrical = generated.some((f) => f.category === "ELECTRICAL");

    expect(hasSofa).toBe(true);
    expect(hasTV).toBe(true);
    expect(hasElectrical).toBe(true);
  });
});
