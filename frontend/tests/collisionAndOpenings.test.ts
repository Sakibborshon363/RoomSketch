import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../src/store/editorStore";
import {
  satPolygonsIntersect,
  getRotatedBoxCorners,
  isFurnitureInsideAnyRoom,
  validateLayout,
  isRugItem,
} from "../src/lib/collisionDetection";
import { DOORS_WINDOWS_CATALOG } from "../src/lib/doorsWindowsCatalog";
import { RoomItem, FurnitureItem } from "../src/types/editor";

describe("Phase 5: Collision Detection (SAT) & Doors/Windows Tests", () => {
  beforeEach(() => {
    useEditorStore.setState({
      rooms: [],
      furniture: [],
      doorsWindows: [],
      selectedId: null,
      selectedType: null,
      zoom: 1,
      unit: "METERS",
      snapToGrid: true,
      history: { past: [], future: [] },
    });
  });

  // 1. SAT MATHEMATICAL ENGINE TESTS
  describe("Separating Axis Theorem (SAT) Engine", () => {
    it("detects collision between overlapping axis-aligned rectangles", () => {
      const boxA = getRotatedBoxCorners(100, 100, 50, 50, 0);
      const boxB = getRotatedBoxCorners(120, 100, 50, 50, 0); // Overlaps by 30px
      expect(satPolygonsIntersect(boxA, boxB)).toBe(true);
    });

    it("detects separation when rectangles do not touch", () => {
      const boxA = getRotatedBoxCorners(100, 100, 40, 40, 0);
      const boxB = getRotatedBoxCorners(200, 100, 40, 40, 0); // Separated by 60px
      expect(satPolygonsIntersect(boxA, boxB)).toBe(false);
    });

    it("detects collision when rectangles are rotated at 45 degrees", () => {
      const boxA = getRotatedBoxCorners(150, 150, 60, 60, 45);
      const boxB = getRotatedBoxCorners(170, 150, 60, 60, 0);
      expect(satPolygonsIntersect(boxA, boxB)).toBe(true);
    });

    it("detects separation when rotated diagonal corners narrowly miss", () => {
      const boxA = getRotatedBoxCorners(100, 100, 40, 40, 45);
      const boxB = getRotatedBoxCorners(180, 100, 40, 40, 45);
      expect(satPolygonsIntersect(boxA, boxB)).toBe(false);
    });

    it("correctly identifies rugs and ignores them in collision detection", () => {
      const rug: FurnitureItem = {
        id: "rug-1",
        name: "Woven Area Rug",
        category: "DECORATION",
        type: "rug_woven",
        x: 100,
        y: 100,
        width: 120,
        height: 120,
        rotation: 0,
        color: "#E5DEC9",
        material: "Wool",
        isLocked: false,
        isVisible: true,
        zIndex: 1,
      };

      const table: FurnitureItem = {
        id: "table-1",
        name: "Coffee Table",
        category: "LIVING_ROOM",
        type: "coffee_table",
        x: 100,
        y: 100,
        width: 40,
        height: 40,
        rotation: 0,
        color: "#A67A53",
        material: "Oak",
        isLocked: false,
        isVisible: true,
        zIndex: 2,
      };

      expect(isRugItem(rug)).toBe(true);
      expect(isRugItem(table)).toBe(false);

      const result = validateLayout([], [rug, table]);
      expect(result.collidingIds.has(rug.id)).toBe(false);
      expect(result.collidingIds.has(table.id)).toBe(false);
    });
  });

  // 2. ROOM CONTAINMENT TESTS
  describe("Room Containment Validation", () => {
    const sampleRoom: RoomItem = {
      id: "room-1",
      name: "Living Room",
      x: 100,
      y: 100,
      width: 300,
      height: 250,
      wallThickness: 12,
      wallColor: "#292524",
      floorColor: "#EBDCCB",
      floorMaterial: "warm_oak",
    };

    it("validates furniture placed safely inside a room", () => {
      const insideFurniture: FurnitureItem = {
        id: "sofa-inside",
        name: "Linen Sofa",
        category: "LIVING_ROOM",
        type: "sofa_linen",
        x: 200,
        y: 180,
        width: 60,
        height: 100,
        rotation: 0,
        color: "#C5BCAB",
        material: "Linen",
        isLocked: false,
        isVisible: true,
        zIndex: 2,
      };

      expect(isFurnitureInsideAnyRoom(insideFurniture, [sampleRoom])).toBe(true);
    });

    it("flags furniture placed outside room walls as out-of-bounds", () => {
      const outsideFurniture: FurnitureItem = {
        id: "sofa-outside",
        name: "Lost Sofa",
        category: "LIVING_ROOM",
        type: "sofa_linen",
        x: 600,
        y: 600, // Far outside (100..400, 100..350)
        width: 60,
        height: 100,
        rotation: 0,
        color: "#C5BCAB",
        material: "Linen",
        isLocked: false,
        isVisible: true,
        zIndex: 2,
      };

      expect(isFurnitureInsideAnyRoom(outsideFurniture, [sampleRoom])).toBe(false);

      const result = validateLayout([sampleRoom], [outsideFurniture]);
      expect(result.outOfBoundsIds.has(outsideFurniture.id)).toBe(true);
      expect(result.warnings.length).toBe(1);
      expect(result.warnings[0].type).toBe("OUT_OF_BOUNDS");
    });
  });

  // 3. DOORS & WINDOWS STORE OPERATIONS
  describe("Doors & Windows Store Actions", () => {
    it("adds a door opening and selects it", () => {
      useEditorStore.getState().addDoorWindow({
        name: "Main Entrance Door",
        type: "DOOR",
        width: 75,
        height: 14,
        wall: "SOUTH",
        swing: "INSIDE_LEFT",
      });

      const state = useEditorStore.getState();
      expect(state.doorsWindows.length).toBe(1);
      const door = state.doorsWindows[0];
      expect(door.name).toBe("Main Entrance Door");
      expect(door.type).toBe("DOOR");
      expect(door.width).toBe(75);
      expect(state.selectedId).toBe(door.id);
      expect(state.selectedType).toBe("door_window");
    });

    it("adds a window opening", () => {
      useEditorStore.getState().addDoorWindow({
        name: "Casement Window",
        type: "WINDOW",
        width: 80,
      });

      const state = useEditorStore.getState();
      expect(state.doorsWindows.length).toBe(1);
      expect(state.doorsWindows[0].type).toBe("WINDOW");
      expect(state.doorsWindows[0].width).toBe(80);
    });

    it("updates door properties and swing direction", () => {
      useEditorStore.getState().addDoorWindow({
        name: "Interior Door",
        type: "DOOR",
        swing: "INSIDE_LEFT",
      });

      const doorId = useEditorStore.getState().doorsWindows[0].id;
      useEditorStore.getState().updateDoorWindow(doorId, {
        name: "Bedroom Ensuite Door",
        swing: "INSIDE_RIGHT",
        width: 70,
      });

      const updated = useEditorStore.getState().doorsWindows[0];
      expect(updated.name).toBe("Bedroom Ensuite Door");
      expect(updated.swing).toBe("INSIDE_RIGHT");
      expect(updated.width).toBe(70);
    });

    it("rotates door and window by 90-degree increments", () => {
      useEditorStore.getState().addDoorWindow({
        name: "Wall Window",
        type: "WINDOW",
        rotation: 0,
      });

      const winId = useEditorStore.getState().doorsWindows[0].id;

      // Rotate +90 degrees
      useEditorStore.getState().rotateDoorWindow(winId, 90);
      expect(useEditorStore.getState().doorsWindows[0].rotation).toBe(90);

      // Rotate absolute 270 degrees
      useEditorStore.getState().rotateDoorWindow(winId, 270, true);
      expect(useEditorStore.getState().doorsWindows[0].rotation).toBe(270);
    });

    it("duplicates door/window with offset", () => {
      useEditorStore.getState().addDoorWindow({
        name: "French Door",
        type: "DOOR",
        x: 150,
        y: 200,
        width: 110,
      });

      const originalId = useEditorStore.getState().doorsWindows[0].id;
      useEditorStore.getState().duplicateDoorWindow(originalId);

      const state = useEditorStore.getState();
      expect(state.doorsWindows.length).toBe(2);
      expect(state.doorsWindows[1].name).toBe("French Door (Copy)");
      expect(state.doorsWindows[1].x).toBe(170);
    });

    it("deletes door/window and clears selection", () => {
      useEditorStore.getState().addDoorWindow({
        name: "Temporary Window",
        type: "WINDOW",
      });

      const winId = useEditorStore.getState().doorsWindows[0].id;
      useEditorStore.getState().deleteDoorWindow(winId);

      const state = useEditorStore.getState();
      expect(state.doorsWindows.length).toBe(0);
      expect(state.selectedId).toBeNull();
    });

    it("supports undo and redo for door/window actions", () => {
      useEditorStore.getState().addDoorWindow({ name: "Door 1", type: "DOOR" });
      useEditorStore.getState().addDoorWindow({ name: "Door 2", type: "DOOR" });

      expect(useEditorStore.getState().doorsWindows.length).toBe(2);

      useEditorStore.getState().undo();
      expect(useEditorStore.getState().doorsWindows.length).toBe(1);
      expect(useEditorStore.getState().doorsWindows[0].name).toBe("Door 1");

      useEditorStore.getState().redo();
      expect(useEditorStore.getState().doorsWindows.length).toBe(2);
    });
  });

  // 4. CATALOG INTEGRITY
  describe("Doors & Windows Catalog Integrity", () => {
    it("contains valid architectural presets for both doors and windows", () => {
      expect(DOORS_WINDOWS_CATALOG.length).toBeGreaterThanOrEqual(6);

      const types = new Set(DOORS_WINDOWS_CATALOG.map((item) => item.type));
      expect(types.has("DOOR")).toBe(true);
      expect(types.has("WINDOW")).toBe(true);

      DOORS_WINDOWS_CATALOG.forEach((item) => {
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.defaultWidth).toBeGreaterThan(0);
        expect(item.defaultHeight).toBeGreaterThan(0);
        expect(item.widthMeters).toBeGreaterThan(0);
        expect(item.description.length).toBeGreaterThan(0);
      });
    });
  });
});
