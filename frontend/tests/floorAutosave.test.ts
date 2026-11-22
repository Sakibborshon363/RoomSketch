import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useEditorStore, scheduleAutosave, cancelPendingAutosave } from "../src/store/editorStore";
import { api } from "../src/lib/api";

// Mock the API module
vi.mock("../src/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Phase 6: Multi-Floor Management & Autosave Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cancelPendingAutosave();

    useEditorStore.setState({
      projectId: "proj-101",
      projectName: "Scandinavian Villa",
      floorId: "floor-1",
      floorName: "Ground floor",
      floors: [
        { id: "floor-1", name: "Ground floor", floorNumber: 1 },
      ],
      rooms: [
        {
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
        },
      ],
      furniture: [],
      doorsWindows: [],
      selectedId: null,
      selectedType: null,
      saveStatus: "saved",
      lastSavedAt: null,
      showGrid: true,
      showMeasurements: true,
      snapToGrid: true,
      showFurniture: true,
      showRoomLabels: true,
    });
  });

  afterEach(() => {
    cancelPendingAutosave();
  });

  describe("Multi-Floor Management", () => {
    it("adds a new floor, appends to floors array, and switches to it", async () => {
      const newFloorData = {
        id: "floor-2",
        name: "Second floor",
        floorNumber: 2,
        projectId: "proj-101",
        layoutData: JSON.stringify({ version: 1, rooms: [], furniture: [], doorsWindows: [] }),
      };

      vi.mocked(api.put).mockResolvedValueOnce({ data: { success: true } });
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: true, data: newFloorData },
      });
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: "proj-101",
            name: "Scandinavian Villa",
            floors: [
              { id: "floor-1", name: "Ground floor", floorNumber: 1 },
              newFloorData,
            ],
          },
        },
      });

      const newId = await useEditorStore.getState().addFloor("Second floor");

      expect(newId).toBe("floor-2");
      expect(api.post).toHaveBeenCalledWith("/projects/proj-101/floors", {
        name: "Second floor",
        floorNumber: 2,
      });

      const state = useEditorStore.getState();
      expect(state.floors.length).toBe(2);
      expect(state.floorId).toBe("floor-2");
      expect(state.floorName).toBe("Second floor");
    });

    it("renames an existing floor and updates active floor name if matched", async () => {
      vi.mocked(api.put).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: "floor-1",
            name: "Main Ground Suite",
            floorNumber: 1,
          },
        },
      });

      await useEditorStore.getState().updateFloorDetails("floor-1", "Main Ground Suite");

      expect(api.put).toHaveBeenCalledWith("/floors/floor-1", {
        name: "Main Ground Suite",
        floorNumber: undefined,
      });

      const state = useEditorStore.getState();
      expect(state.floorName).toBe("Main Ground Suite");
      expect(state.floors[0].name).toBe("Main Ground Suite");
    });

    it("prevents deleting the sole floor in a project", async () => {
      const result = await useEditorStore.getState().deleteFloor("floor-1");

      expect(result).toBe(false);
      expect(api.delete).not.toHaveBeenCalled();
      expect(useEditorStore.getState().floors.length).toBe(1);
    });

    it("deletes a floor when multiple floors exist and switches active floor", async () => {
      useEditorStore.setState({
        floors: [
          { id: "floor-1", name: "Ground floor", floorNumber: 1 },
          { id: "floor-2", name: "Second floor", floorNumber: 2 },
        ],
        floorId: "floor-2",
        floorName: "Second floor",
      });

      vi.mocked(api.delete).mockResolvedValueOnce({ data: { success: true } });
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: "proj-101",
            name: "Scandinavian Villa",
            floors: [{ id: "floor-1", name: "Ground floor", floorNumber: 1 }],
          },
        },
      });

      const result = await useEditorStore.getState().deleteFloor("floor-2");

      expect(result).toBe(true);
      expect(api.delete).toHaveBeenCalledWith("/floors/floor-2");
      const state = useEditorStore.getState();
      expect(state.floors.length).toBe(1);
      expect(state.floorId).toBe("floor-1");
    });

    it("duplicates the current floor via backend API", async () => {
      const duplicatedData = {
        id: "floor-1-dup",
        name: "Ground floor (Copy)",
        floorNumber: 2,
        projectId: "proj-101",
        layoutData: JSON.stringify({
          version: 1,
          rooms: [{ id: "room-dup", name: "Living Room", x: 100, y: 100, width: 300, height: 250 }],
          furniture: [],
          doorsWindows: [],
        }),
      };

      vi.mocked(api.put).mockResolvedValueOnce({ data: { success: true } });
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { success: true, data: duplicatedData },
      });
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: "proj-101",
            name: "Scandinavian Villa",
            floors: [
              { id: "floor-1", name: "Ground floor", floorNumber: 1 },
              duplicatedData,
            ],
          },
        },
      });

      const dupId = await useEditorStore.getState().duplicateCurrentFloor();

      expect(dupId).toBe("floor-1-dup");
      expect(api.post).toHaveBeenCalledWith("/floors/floor-1/duplicate");
      const state = useEditorStore.getState();
      expect(state.floors.length).toBe(2);
      expect(state.floorId).toBe("floor-1-dup");
      expect(state.floorName).toBe("Ground floor (Copy)");
    });
  });

  describe("Real-time Autosave Engine", () => {
    it("persists current layout and updates save status and timestamp", async () => {
      vi.mocked(api.put).mockResolvedValueOnce({ data: { success: true } });

      useEditorStore.setState({ saveStatus: "unsaved" });

      await useEditorStore.getState().saveCurrentLayout();

      expect(api.put).toHaveBeenCalledWith(
        "/floors/floor-1/layout",
        expect.objectContaining({
          layoutData: expect.stringContaining("Living Room"),
        })
      );

      const state = useEditorStore.getState();
      expect(state.saveStatus).toBe("saved");
      expect(state.lastSavedAt).toBeInstanceOf(Date);
    });

    it("flushes pending unsaved changes immediately on flushAutosaveNow", async () => {
      vi.mocked(api.put).mockResolvedValueOnce({ data: { success: true } });
      useEditorStore.setState({ saveStatus: "unsaved" });

      await useEditorStore.getState().flushAutosaveNow();

      expect(api.put).toHaveBeenCalledTimes(1);
      expect(useEditorStore.getState().saveStatus).toBe("saved");
    });

    it("debounces rapid consecutive autosave requests into a single execution", async () => {
      vi.useFakeTimers();
      const mockSave = vi.fn().mockResolvedValue(undefined);

      // Trigger 5 rapid autosave calls
      scheduleAutosave(mockSave, 1200);
      scheduleAutosave(mockSave, 1200);
      scheduleAutosave(mockSave, 1200);
      scheduleAutosave(mockSave, 1200);
      scheduleAutosave(mockSave, 1200);

      // Before timer expires, function has not fired
      expect(mockSave).not.toHaveBeenCalled();

      // Fast-forward 1199ms
      vi.advanceTimersByTime(1199);
      expect(mockSave).not.toHaveBeenCalled();

      // Advance last millisecond (1200ms total)
      vi.advanceTimersByTime(1);
      expect(mockSave).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe("Drawing & Canvas Layer Toggles", () => {
    it("toggles furniture visibility layer", () => {
      expect(useEditorStore.getState().showFurniture).toBe(true);
      useEditorStore.getState().setShowFurniture(false);
      expect(useEditorStore.getState().showFurniture).toBe(false);
      useEditorStore.getState().setShowFurniture(true);
      expect(useEditorStore.getState().showFurniture).toBe(true);
    });

    it("toggles room labels and areas layer", () => {
      expect(useEditorStore.getState().showRoomLabels).toBe(true);
      useEditorStore.getState().setShowRoomLabels(false);
      expect(useEditorStore.getState().showRoomLabels).toBe(false);
    });

    it("toggles grid background and dimension measurements", () => {
      useEditorStore.getState().setShowGrid(false);
      expect(useEditorStore.getState().showGrid).toBe(false);

      useEditorStore.getState().setShowMeasurements(false);
      expect(useEditorStore.getState().showMeasurements).toBe(false);

      useEditorStore.getState().setSnapToGrid(false);
      expect(useEditorStore.getState().snapToGrid).toBe(false);
    });
  });
});
