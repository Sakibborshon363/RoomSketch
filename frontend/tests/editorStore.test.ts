import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../src/store/editorStore";

describe("useEditorStore canvas state and room operations", () => {
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

  it("adds a room with dimensions and selects it", () => {
    useEditorStore.getState().addRoom({
      name: "Master Bedroom",
      width: 400,
      height: 300,
      floorColor: "#E2D3BE",
    });

    const state = useEditorStore.getState();
    expect(state.rooms.length).toBe(1);
    expect(state.rooms[0].name).toBe("Master Bedroom");
    expect(state.rooms[0].width).toBe(400);
    expect(state.selectedId).toBe(state.rooms[0].id);
    expect(state.selectedType).toBe("room");
  });

  it("updates room properties", () => {
    useEditorStore.getState().addRoom({
      name: "Initial Room",
      width: 200,
      height: 200,
    });

    const roomId = useEditorStore.getState().rooms[0].id;
    useEditorStore.getState().updateRoom(roomId, {
      name: "Renamed Living Room",
      width: 500,
      floorColor: "#EBDCCB",
    });

    const updated = useEditorStore.getState().rooms[0];
    expect(updated.name).toBe("Renamed Living Room");
    expect(updated.width).toBe(500);
    expect(updated.floorColor).toBe("#EBDCCB");
  });

  it("duplicates a room", () => {
    useEditorStore.getState().addRoom({
      name: "Guest Suite",
      x: 100,
      y: 100,
      width: 300,
      height: 250,
    });

    const originalId = useEditorStore.getState().rooms[0].id;
    useEditorStore.getState().duplicateRoom(originalId);

    const state = useEditorStore.getState();
    expect(state.rooms.length).toBe(2);
    expect(state.rooms[1].name).toBe("Guest Suite (Copy)");
    expect(state.rooms[1].x).toBe(130);
  });

  it("deletes a room and clears selection", () => {
    useEditorStore.getState().addRoom({ name: "Temporary Room" });
    const roomId = useEditorStore.getState().rooms[0].id;

    useEditorStore.getState().deleteRoom(roomId);

    const state = useEditorStore.getState();
    expect(state.rooms.length).toBe(0);
    expect(state.selectedId).toBeNull();
  });

  it("supports undo and redo", () => {
    useEditorStore.getState().addRoom({ name: "First Room" });
    useEditorStore.getState().addRoom({ name: "Second Room" });

    expect(useEditorStore.getState().rooms.length).toBe(2);

    // Undo adding the second room
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().rooms.length).toBe(1);
    expect(useEditorStore.getState().rooms[0].name).toBe("First Room");

    // Redo adding the second room
    useEditorStore.getState().redo();
    expect(useEditorStore.getState().rooms.length).toBe(2);
  });

  it("adjusts zoom scale within constraints", () => {
    useEditorStore.getState().setZoom(1.5);
    expect(useEditorStore.getState().zoom).toBe(1.5);

    // Clamps excessive zoom
    useEditorStore.getState().setZoom(5.0);
    expect(useEditorStore.getState().zoom).toBe(3.0);

    useEditorStore.getState().setZoom(0.01);
    expect(useEditorStore.getState().zoom).toBe(0.2);
  });
});
