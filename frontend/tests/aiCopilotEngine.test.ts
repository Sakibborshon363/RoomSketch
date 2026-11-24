import { describe, it, expect } from "vitest";
import {
  autoFixAllErgonomicIssues,
  processCopilotUserInput,
  CopilotContext,
} from "@/lib/aiCopilotEngine";
import { RoomItem, FurnitureItem, DoorWindowItem } from "@/types/editor";
import { runArchitecturalAudit } from "@/lib/aiArchitectEngine";

describe("RoomSketch AI Copilot & Autonomous Remediation Engine", () => {
  const mockRoom: RoomItem = {
    id: "room-copilot-1",
    name: "Master Bedroom",
    x: 100,
    y: 100,
    width: 320, // 6.4m
    height: 260, // 5.2m
    wallThickness: 12,
    wallColor: "#333",
    floorColor: "#f5efe6",
    floorMaterial: "hardwood_oak",
  };

  const sampleContext: CopilotContext = {
    projectName: "Test Residence",
    floorName: "Ground floor",
    rooms: [mockRoom],
    doorsWindows: [],
    furniture: [],
    unit: "METERS",
  };

  it("should autonomously relocate furniture that obstructs door swing arc", () => {
    const door: DoorWindowItem = {
      id: "door-main-1",
      name: "Bedroom Ingress Door",
      type: "SINGLE_DOOR",
      x: 120,
      y: 100,
      width: 45, // 0.9m swing radius
      height: 105,
      rotation: 0,
    };

    // Obstructive nightstand placed inside the 90cm arc
    const obstructiveItem: FurnitureItem = {
      id: "furn-obstruction",
      roomId: mockRoom.id,
      name: "Blocking Nightstand",
      category: "BEDROOM",
      type: "nightstand",
      x: 130, // only 10px from door!
      y: 115,
      width: 25,
      height: 25,
      rotation: 0,
      color: "#d4a373",
      material: "Wood",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    };

    // Pre-check: audit should have 1 critical violation
    const beforeAudit = runArchitecturalAudit([mockRoom], [door], [obstructiveItem]);
    expect(beforeAudit.criticalCount).toBe(1);

    // Run autonomous auto-fix
    const { fixedFurniture, fixesApplied, newAuditReport } = autoFixAllErgonomicIssues(
      [mockRoom],
      [door],
      [obstructiveItem]
    );

    expect(fixesApplied.length).toBeGreaterThanOrEqual(1);
    expect(fixesApplied[0]).toContain("Relocated");
    expect(newAuditReport.criticalCount).toBe(0);

    const fixedItem = fixedFurniture.find((f) => f.id === obstructiveItem.id);
    expect(fixedItem).toBeDefined();
    // Verify distance from door is now safe (> 65px)
    const newDist = Math.hypot(fixedItem!.x - door.x, fixedItem!.y - door.y);
    expect(newDist).toBeGreaterThanOrEqual(60);
  });

  it("should autonomously center a king bed pressed tightly against a room side wall", () => {
    const tightBed: FurnitureItem = {
      id: "furn-tight-bed",
      roomId: mockRoom.id,
      name: "Architectural King Bed",
      category: "BEDROOM",
      type: "bed_king",
      x: mockRoom.x + 35, // pressed against left wall
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

    const beforeAudit = runArchitecturalAudit([mockRoom], [], [tightBed]);
    expect(beforeAudit.warningCount).toBeGreaterThanOrEqual(1);

    const { fixedFurniture, fixesApplied, newAuditReport } = autoFixAllErgonomicIssues(
      [mockRoom],
      [],
      [tightBed]
    );

    expect(fixesApplied.length).toBeGreaterThanOrEqual(1);
    expect(fixesApplied[0]).toContain("Centered");

    const fixedBed = fixedFurniture.find((f) => f.id === tightBed.id);
    expect(fixedBed).toBeDefined();
    // Bed should now be near center of room
    const roomCenter = mockRoom.x + mockRoom.width / 2;
    expect(Math.abs(fixedBed!.x - roomCenter)).toBeLessThan(5);
  });

  it("should process 'fix warnings' natural language command and execute remediation", () => {
    const door: DoorWindowItem = {
      id: "door-102",
      name: "Room Entry Door",
      type: "SINGLE_DOOR",
      x: 120,
      y: 100,
      width: 45,
      height: 105,
      rotation: 0,
    };

    const blockingItem: FurnitureItem = {
      id: "furn-block-2",
      roomId: mockRoom.id,
      name: "Armchair",
      category: "LIVING_ROOM",
      type: "armchair_leather",
      x: 125,
      y: 110,
      width: 30,
      height: 30,
      rotation: 0,
      color: "#475569",
      material: "Leather",
      zIndex: 2,
      isLocked: false,
      isVisible: true,
    };

    const ctx: CopilotContext = {
      ...sampleContext,
      doorsWindows: [door],
      furniture: [blockingItem],
    };

    const result = processCopilotUserInput("Please fix all warnings and collisions in my plan", ctx);

    expect(result.actionTaken?.type).toBe("WARNINGS_FIXED");
    expect(result.updatedFurniture).toBeDefined();
    expect(result.replyText).toContain("Compliance Score Improved");
  });

  it("should process 'furnish living room' command and return coordinated furniture fixtures", () => {
    const livingRoom: RoomItem = {
      id: "room-liv-101",
      name: "Main Living Room",
      x: 450,
      y: 100,
      width: 380,
      height: 280,
      wallThickness: 12,
      wallColor: "#333",
      floorColor: "#ebdccb",
      floorMaterial: "warm_oak",
    };

    const ctx: CopilotContext = {
      ...sampleContext,
      rooms: [livingRoom],
    };

    const result = processCopilotUserInput("Furnish living room in modern minimalist style", ctx);

    expect(result.actionTaken?.type).toBe("AUTO_FURNISHED");
    expect(result.newFurniture).toBeDefined();
    expect(result.newFurniture!.length).toBeGreaterThanOrEqual(4);
    expect(result.replyText).toContain("Main Living Room");
  });

  it("should process 'create room' command and place a new room on the canvas", () => {
    const result = processCopilotUserInput("Add a master bedroom 6x5m", sampleContext);

    expect(result.actionTaken?.type).toBe("ROOM_ADDED");
    expect(result.newRooms).toBeDefined();
    expect(result.newRooms!.length).toBe(1);
    expect(result.newRooms![0].name).toContain("Master Bedroom");
    expect(result.replyText).toContain("Created");
  });

  it("should process 'cost inquiry' command and provide BoQ estimate", () => {
    const result = processCopilotUserInput("What is the total estimated construction cost?", sampleContext);

    expect(result.actionTaken?.type).toBe("BOQ_CALCULATED");
    expect(result.replyText).toContain("Bill of Quantities");
    expect(result.replyText).toContain("Grand Total Budget");
  });
});
