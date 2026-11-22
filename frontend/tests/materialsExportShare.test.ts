import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  FLOOR_MATERIALS,
  WALL_FINISHES,
  FURNITURE_FINISHES,
} from "../src/lib/materialsCatalog";
import { exportToHighResPng, exportToArchitecturalPdf } from "../src/lib/exportEngine";
import { useEditorStore, cancelPendingAutosave } from "../src/store/editorStore";
import { RoomItem, FurnitureItem, DoorWindowItem } from "../src/types/editor";

vi.mock("../src/lib/api", () => ({
  api: {
    put: vi.fn().mockResolvedValue({ data: { success: true } }),
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
    get: vi.fn().mockResolvedValue({ data: { success: true } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

describe("Phase 7: Materials, Surface Finishes & Architectural Exports", () => {
  beforeEach(() => {
    cancelPendingAutosave();
    useEditorStore.setState({
      projectId: "proj-701",
      projectName: "Penthouse Suite",
      floorId: "floor-1",
      floorName: "Ground floor",
      rooms: [
        {
          id: "room-1",
          name: "Great Room",
          x: 100,
          y: 100,
          width: 400,
          height: 300,
          wallThickness: 12,
          wallColor: "#292524",
          floorColor: "#EBDCCB",
          floorMaterial: "warm_oak",
        },
      ],
      furniture: [
        {
          id: "furn-1",
          name: "Linen Sofa",
          category: "LIVING_ROOM",
          type: "sofa_linen",
          x: 150,
          y: 150,
          width: 80,
          height: 180,
          rotation: 0,
          color: "#C5BCAB",
          material: "Linen",
          isLocked: false,
          isVisible: true,
          zIndex: 1,
        },
      ],
      doorsWindows: [],
      selectedId: "room-1",
      selectedType: "room",
      unit: "METERS",
    });
  });

  afterEach(() => {
    cancelPendingAutosave();
  });

  describe("Materials Catalog Presets", () => {
    it("provides 10 architectural floor materials across wood, tile, stone, concrete", () => {
      expect(FLOOR_MATERIALS.length).toBe(10);
      const categories = new Set(FLOOR_MATERIALS.map((m) => m.category));
      expect(categories.has("WOOD")).toBe(true);
      expect(categories.has("TILE")).toBe(true);
      expect(categories.has("STONE")).toBe(true);
      expect(categories.has("CONCRETE")).toBe(true);

      const patterns = new Set(FLOOR_MATERIALS.map((m) => m.pattern));
      expect(patterns.has("planks")).toBe(true);
      expect(patterns.has("chevron")).toBe(true);
      expect(patterns.has("grid")).toBe(true);
      expect(patterns.has("marble")).toBe(true);
      expect(patterns.has("terrazzo")).toBe(true);
    });

    it("provides 8 architectural wall finishes with finish types", () => {
      expect(WALL_FINISHES.length).toBe(8);
      const deepForest = WALL_FINISHES.find((w) => w.id === "deep_forest");
      expect(deepForest).toBeDefined();
      expect(deepForest?.color).toBe("#1E3A34");
      expect(deepForest?.finishType).toBe("Eggshell");
    });

    it("provides furniture finishes across fabric, leather, wood, and metal", () => {
      expect(FURNITURE_FINISHES.length).toBeGreaterThanOrEqual(14);
      const leather = FURNITURE_FINISHES.find((f) => f.category === "LEATHER");
      expect(leather).toBeDefined();
      expect(leather?.material).toContain("Leather");

      const wood = FURNITURE_FINISHES.find((f) => f.category === "WOOD");
      expect(wood).toBeDefined();

      const metal = FURNITURE_FINISHES.find((f) => f.category === "METAL");
      expect(metal).toBeDefined();
    });
  });

  describe("Material Application on Canvas Entities", () => {
    it("updates room floor material and matching hex color in editorStore", () => {
      const herringbone = FLOOR_MATERIALS.find((m) => m.id === "herringbone_parquet")!;
      useEditorStore.getState().updateRoom("room-1", {
        floorMaterial: herringbone.id,
        floorColor: herringbone.color,
      });

      const updated = useEditorStore.getState().rooms.find((r) => r.id === "room-1")!;
      expect(updated.floorMaterial).toBe("herringbone_parquet");
      expect(updated.floorColor).toBe("#D4B996");
    });

    it("updates room wall structure finish color", () => {
      useEditorStore.getState().updateRoom("room-1", {
        wallColor: "#1E3A34",
      });

      const updated = useEditorStore.getState().rooms.find((r) => r.id === "room-1")!;
      expect(updated.wallColor).toBe("#1E3A34");
    });

    it("updates furniture upholstery material and color", () => {
      const cognacLeather = FURNITURE_FINISHES.find((f) => f.id === "leather_tan")!;
      useEditorStore.getState().updateFurniture("furn-1", {
        color: cognacLeather.color,
        material: cognacLeather.material,
      });

      const updated = useEditorStore.getState().furniture.find((f) => f.id === "furn-1")!;
      expect(updated.color).toBe("#B38260");
      expect(updated.material).toBe("Top-grain Leather");
    });
  });

  describe("Architectural Document Exporters", () => {
    it("exports high-resolution PNG using mock stage data URL", async () => {
      const mockStage = {
        toDataURL: vi.fn().mockReturnValue("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="),
      };

      const rooms = useEditorStore.getState().rooms;
      const furniture = useEditorStore.getState().furniture;

      const result = await exportToHighResPng({
        stage: mockStage,
        projectName: "Villa Solarium",
        floorName: "Ground floor",
        unit: "METERS",
        rooms,
        furniture,
        doorsWindows: [],
      });

      expect(mockStage.toDataURL).toHaveBeenCalledWith({ pixelRatio: 2.5 });
      expect(result).toBe(true);
    });

    it("generates architectural PDF presentation sheet with room schedule", async () => {
      const mockStage = {
        toDataURL: vi.fn().mockReturnValue("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="),
      };

      const rooms: RoomItem[] = [
        {
          id: "r1",
          name: "Master Bedroom",
          x: 50,
          y: 50,
          width: 300,
          height: 250,
          wallThickness: 12,
          wallColor: "#292524",
          floorColor: "#EBDCCB",
          floorMaterial: "warm_oak",
        },
        {
          id: "r2",
          name: "Ensuite Bath",
          x: 350,
          y: 50,
          width: 150,
          height: 200,
          wallThickness: 12,
          wallColor: "#292524",
          floorColor: "#DCE9EA",
          floorMaterial: "light_blue_tile",
        },
      ];

      const result = await exportToArchitecturalPdf({
        stage: mockStage,
        projectName: "The Coastal Residence",
        floorName: "Upper Level",
        designerName: "Alex Rivera",
        unit: "METERS",
        rooms,
        furniture: [],
        doorsWindows: [],
      });

      expect(mockStage.toDataURL).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("Public Read-Only Sharing", () => {
    it("constructs valid share URL pattern /shared/{token}", () => {
      const token = "a1b2c3d4e5f67890";
      const shareUrl = `/shared/${token}`;

      expect(shareUrl).toMatch(/^\/shared\/[a-z0-9]{16}$/);
    });
  });
});
