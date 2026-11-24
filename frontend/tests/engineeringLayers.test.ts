import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@/store/editorStore";
import { FURNITURE_CATALOG } from "@/lib/furnitureCatalog";
import { FurnitureItem } from "@/types/editor";

describe("Multi-Layer CAD Engineering Systems Overlays (Part 2)", () => {
  beforeEach(() => {
    useEditorStore.setState({
      showElectrical: true,
      showPlumbing: true,
      showLighting: true,
      showHvac: true,
      showFurniture: true,
    });
  });

  it("initializes engineering layer visibility toggles as true by default", () => {
    const state = useEditorStore.getState();
    expect(state.showElectrical).toBe(true);
    expect(state.showPlumbing).toBe(true);
    expect(state.showLighting).toBe(true);
    expect(state.showHvac).toBe(true);
    expect(state.showFurniture).toBe(true);
  });

  it("updates individual engineering layer visibility toggles correctly", () => {
    const { setShowElectrical, setShowPlumbing, setShowLighting, setShowHvac } =
      useEditorStore.getState();

    setShowElectrical(false);
    expect(useEditorStore.getState().showElectrical).toBe(false);

    setShowPlumbing(false);
    expect(useEditorStore.getState().showPlumbing).toBe(false);

    setShowLighting(false);
    expect(useEditorStore.getState().showLighting).toBe(false);

    setShowHvac(false);
    expect(useEditorStore.getState().showHvac).toBe(false);

    // Re-enabling
    setShowElectrical(true);
    expect(useEditorStore.getState().showElectrical).toBe(true);
  });

  it("verifies architectural engineering symbol catalog definitions", () => {
    const electricalItems = FURNITURE_CATALOG.filter(
      (item) => item.category === "ELECTRICAL"
    );
    const plumbingItems = FURNITURE_CATALOG.filter(
      (item) => item.category === "PLUMBING"
    );
    const lightingItems = FURNITURE_CATALOG.filter(
      (item) => item.category === "LIGHTING"
    );
    const hvacItems = FURNITURE_CATALOG.filter((item) => item.category === "HVAC");

    expect(electricalItems.length).toBeGreaterThanOrEqual(4);
    expect(plumbingItems.length).toBeGreaterThanOrEqual(3);
    expect(lightingItems.length).toBeGreaterThanOrEqual(3);
    expect(hvacItems.length).toBeGreaterThanOrEqual(3);

    // Check specific critical symbols
    expect(electricalItems.some((i) => i.type === "power_socket_duplex")).toBe(true);
    expect(electricalItems.some((i) => i.type === "main_distribution_board")).toBe(true);
    expect(plumbingItems.some((i) => i.type === "water_inlet_tap")).toBe(true);
    expect(lightingItems.some((i) => i.type === "recessed_downlight")).toBe(true);
    expect(hvacItems.some((i) => i.type === "ac_indoor_split")).toBe(true);
  });

  it("correctly filters mixed multi-layer items based on active layer toggles", () => {
    const mixedItems: FurnitureItem[] = [
      {
        id: "sofa-1",
        name: "Linen Sofa",
        type: "sofa_linen",
        category: "LIVING_ROOM",
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        rotation: 0,
        color: "#ccc",
        material: "fabric",
        isLocked: false,
        isVisible: true,
        zIndex: 1,
      },
      {
        id: "outlet-1",
        name: "Duplex Socket",
        type: "power_socket_duplex",
        category: "ELECTRICAL",
        x: 10,
        y: 10,
        width: 20,
        height: 20,
        rotation: 0,
        color: "#2563eb",
        material: "polycarbonate",
        isLocked: false,
        isVisible: true,
        zIndex: 2,
      },
      {
        id: "tap-1",
        name: "Water Tap",
        type: "water_inlet_tap",
        category: "PLUMBING",
        x: 50,
        y: 50,
        width: 20,
        height: 20,
        rotation: 0,
        color: "#0284c7",
        material: "brass",
        isLocked: false,
        isVisible: true,
        zIndex: 3,
      },
    ];

    const filterItems = (
      items: FurnitureItem[],
      showFurn: boolean,
      showElec: boolean,
      showPlumb: boolean
    ) => {
      return items.filter((f) => {
        if (f.isVisible === false) return false;
        if (f.category === "ELECTRICAL" && !showElec) return false;
        if (f.category === "PLUMBING" && !showPlumb) return false;
        if (
          f.category !== "ELECTRICAL" &&
          f.category !== "PLUMBING" &&
          f.category !== "LIGHTING" &&
          f.category !== "HVAC" &&
          !showFurn
        ) {
          return false;
        }
        return true;
      });
    };

    // All active
    expect(filterItems(mixedItems, true, true, true)).toHaveLength(3);

    // Hide electrical layer: only sofa and tap visible
    const withoutElec = filterItems(mixedItems, true, false, true);
    expect(withoutElec).toHaveLength(2);
    expect(withoutElec.some((i) => i.id === "outlet-1")).toBe(false);

    // Hide furniture layer: only outlet and tap visible
    const withoutFurn = filterItems(mixedItems, false, true, true);
    expect(withoutFurn).toHaveLength(2);
    expect(withoutFurn.some((i) => i.id === "sofa-1")).toBe(false);

    // Only plumbing layer visible
    const onlyPlumb = filterItems(mixedItems, false, false, true);
    expect(onlyPlumb).toHaveLength(1);
    expect(onlyPlumb[0].id).toBe("tap-1");
  });
});
