import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../src/store/editorStore";
import { FURNITURE_CATALOG } from "../src/lib/furnitureCatalog";

describe("Phase 4: Furniture Store & Library Tests", () => {
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

  it("verifies furniture catalog has valid items across all 8 architectural categories", () => {
    expect(FURNITURE_CATALOG.length).toBeGreaterThanOrEqual(20);

    const categories = new Set(FURNITURE_CATALOG.map((item) => item.category));
    expect(categories.has("LIVING_ROOM")).toBe(true);
    expect(categories.has("BEDROOM")).toBe(true);
    expect(categories.has("KITCHEN")).toBe(true);
    expect(categories.has("BATHROOM")).toBe(true);
    expect(categories.has("DINING_ROOM")).toBe(true);
    expect(categories.has("OFFICE")).toBe(true);
    expect(categories.has("STORAGE")).toBe(true);
    expect(categories.has("DECORATION")).toBe(true);

    FURNITURE_CATALOG.forEach((item) => {
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.defaultWidth).toBeGreaterThan(0);
      expect(item.defaultHeight).toBeGreaterThan(0);
      expect(item.defaultColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(item.material).toBeDefined();
    });
  });

  it("adds a furniture item, selects it, and sets proper defaults", () => {
    useEditorStore.getState().addFurniture({
      name: "Linen Sofa",
      category: "LIVING_ROOM",
      type: "sofa_linen",
      width: 60,
      height: 140,
      color: "#C5BCAB",
      material: "Linen Fabric",
    });

    const state = useEditorStore.getState();
    expect(state.furniture.length).toBe(1);
    const sofa = state.furniture[0];
    expect(sofa.name).toBe("Linen Sofa");
    expect(sofa.type).toBe("sofa_linen");
    expect(sofa.rotation).toBe(0);
    expect(sofa.isLocked).toBe(false);
    expect(sofa.isVisible).toBe(true);
    expect(state.selectedId).toBe(sofa.id);
    expect(state.selectedType).toBe("furniture");
  });

  it("updates furniture position, rotation, and appearance", () => {
    useEditorStore.getState().addFurniture({
      name: "Lounge Chair",
      type: "chair_lounge",
      x: 100,
      y: 120,
      rotation: 0,
    });

    const chairId = useEditorStore.getState().furniture[0].id;
    useEditorStore.getState().updateFurniture(chairId, {
      x: 160,
      y: 200,
      color: "#A67A53",
      material: "Cognac Leather",
    });

    const updated = useEditorStore.getState().furniture[0];
    expect(updated.x).toBe(160);
    expect(updated.y).toBe(200);
    expect(updated.color).toBe("#A67A53");
    expect(updated.material).toBe("Cognac Leather");
  });

  it("rotates furniture with relative delta and absolute angles with [0..359] wrapping", () => {
    useEditorStore.getState().addFurniture({
      name: "Queen Bed",
      type: "bed_queen",
      rotation: 0,
    });

    const bedId = useEditorStore.getState().furniture[0].id;

    // Rotate +45 degrees relative
    useEditorStore.getState().rotateFurniture(bedId, 45);
    expect(useEditorStore.getState().furniture[0].rotation).toBe(45);

    // Rotate +90 degrees relative
    useEditorStore.getState().rotateFurniture(bedId, 90);
    expect(useEditorStore.getState().furniture[0].rotation).toBe(135);

    // Rotate -180 degrees (should wrap properly to 315)
    useEditorStore.getState().rotateFurniture(bedId, -180);
    expect(useEditorStore.getState().furniture[0].rotation).toBe(315);

    // Rotate absolute 90 degrees
    useEditorStore.getState().rotateFurniture(bedId, 90, true);
    expect(useEditorStore.getState().furniture[0].rotation).toBe(90);
  });

  it("duplicates furniture with offset and selects the duplicate", () => {
    useEditorStore.getState().addFurniture({
      name: "Bedside Table",
      type: "nightstand",
      x: 200,
      y: 200,
      width: 30,
      height: 30,
    });

    const originalId = useEditorStore.getState().furniture[0].id;
    useEditorStore.getState().duplicateFurniture(originalId);

    const state = useEditorStore.getState();
    expect(state.furniture.length).toBe(2);
    const copy = state.furniture[1];
    expect(copy.name).toBe("Bedside Table (Copy)");
    expect(copy.x).toBe(225);
    expect(copy.y).toBe(225);
    expect(state.selectedId).toBe(copy.id);
  });

  it("toggles lock and visibility states for furniture", () => {
    useEditorStore.getState().addFurniture({
      name: "Dining Table",
      type: "table_dining_4",
    });

    const tableId = useEditorStore.getState().furniture[0].id;
    expect(useEditorStore.getState().furniture[0].isLocked).toBe(false);

    useEditorStore.getState().toggleFurnitureLock(tableId);
    expect(useEditorStore.getState().furniture[0].isLocked).toBe(true);

    useEditorStore.getState().toggleFurnitureLock(tableId);
    expect(useEditorStore.getState().furniture[0].isLocked).toBe(false);

    useEditorStore.getState().toggleFurnitureVisibility(tableId);
    expect(useEditorStore.getState().furniture[0].isVisible).toBe(false);
  });

  it("reorders furniture z-index correctly", () => {
    useEditorStore.getState().addFurniture({ name: "Rug", type: "rug_woven", zIndex: 1 });
    useEditorStore.getState().addFurniture({ name: "Sofa", type: "sofa_linen", zIndex: 2 });
    useEditorStore.getState().addFurniture({ name: "Lamp", type: "floor_lamp", zIndex: 3 });

    const rugId = useEditorStore.getState().furniture[0].id;
    const lampId = useEditorStore.getState().furniture[2].id;

    // Bring rug to front
    useEditorStore.getState().reorderFurnitureZIndex(rugId, "front");
    const updatedRug = useEditorStore.getState().furniture.find((f) => f.id === rugId);
    expect(updatedRug?.zIndex).toBeGreaterThanOrEqual(4);

    // Send lamp to back
    useEditorStore.getState().reorderFurnitureZIndex(lampId, "back");
    const updatedLamp = useEditorStore.getState().furniture.find((f) => f.id === lampId);
    expect(updatedLamp?.zIndex).toBe(1);
  });

  it("deletes furniture and clears selection if active", () => {
    useEditorStore.getState().addFurniture({ name: "Temporary Plant", type: "plant_potted" });
    const plantId = useEditorStore.getState().furniture[0].id;

    expect(useEditorStore.getState().selectedId).toBe(plantId);

    useEditorStore.getState().deleteFurniture(plantId);

    const state = useEditorStore.getState();
    expect(state.furniture.length).toBe(0);
    expect(state.selectedId).toBeNull();
  });

  it("supports undo and redo for furniture operations", () => {
    useEditorStore.getState().addFurniture({ name: "First Item", type: "sofa_linen" });
    useEditorStore.getState().addFurniture({ name: "Second Item", type: "coffee_table" });

    expect(useEditorStore.getState().furniture.length).toBe(2);

    // Undo adding the second item
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().furniture.length).toBe(1);
    expect(useEditorStore.getState().furniture[0].name).toBe("First Item");

    // Redo adding the second item
    useEditorStore.getState().redo();
    expect(useEditorStore.getState().furniture.length).toBe(2);
  });
});
