import { create } from "zustand";
import { RoomItem, FurnitureItem, DoorWindowItem, FloorLayoutData, UnitSystem } from "@/types/editor";
import { api } from "@/lib/api";

interface EditorState {
  projectId: string | null;
  projectName: string;
  floorId: string | null;
  floorName: string;
  floors: { id: string; name: string; floorNumber: number }[];
  unit: UnitSystem;
  gridSize: number;
  showGrid: boolean;
  showMeasurements: boolean;
  snapToGrid: boolean;
  showFurniture: boolean;
  showRoomLabels: boolean;
  showElectrical: boolean;
  showPlumbing: boolean;
  showLighting: boolean;
  showHvac: boolean;
  viewMode: "2D" | "3D_ISOMETRIC" | "3D_FIRST_PERSON";
  activeTool: "select" | "draw_room" | "wall" | "door" | "window" | "measure" | "pan";
  zoom: number;
  stagePos: { x: number; y: number };
  cursorPos: { x: number; y: number };
  rooms: RoomItem[];
  furniture: FurnitureItem[];
  doorsWindows: DoorWindowItem[];
  selectedId: string | null;
  selectedType: "room" | "furniture" | "door_window" | null;
  saveStatus: "saved" | "saving" | "unsaved";
  lastSavedAt: Date | null;
  history: {
    past: FloorLayoutData[];
    future: FloorLayoutData[];
  };

  // Actions
  setActiveTool: (tool: EditorState["activeTool"]) => void;
  setZoom: (zoom: number) => void;
  setStagePos: (pos: { x: number; y: number }) => void;
  setCursorPos: (pos: { x: number; y: number }) => void;
  setShowGrid: (show: boolean) => void;
  setShowMeasurements: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setShowFurniture: (show: boolean) => void;
  setShowRoomLabels: (show: boolean) => void;
  setShowElectrical: (show: boolean) => void;
  setShowPlumbing: (show: boolean) => void;
  setShowLighting: (show: boolean) => void;
  setShowHvac: (show: boolean) => void;
  setViewMode: (mode: EditorState["viewMode"]) => void;
  setUnit: (unit: UnitSystem) => void;
  setSelection: (id: string | null, type?: EditorState["selectedType"]) => void;

  // Project & Floor Loading
  loadProjectAndFloor: (projectId: string, floorId?: string) => Promise<void>;
  switchFloor: (floorId: string) => Promise<void>;
  saveCurrentLayout: () => Promise<void>;
  flushAutosaveNow: () => Promise<void>;

  // Floor Management (Phase 6)
  addFloor: (name?: string) => Promise<string | null>;
  updateFloorDetails: (floorId: string, name: string, floorNumber?: number) => Promise<void>;
  deleteFloor: (floorId: string) => Promise<boolean>;
  duplicateCurrentFloor: () => Promise<string | null>;

  // Room operations
  addRoom: (room: Partial<RoomItem>) => void;
  addBatchRooms: (rooms: RoomItem[]) => void;
  updateRoom: (id: string, updates: Partial<RoomItem>) => void;
  deleteRoom: (id: string) => void;
  duplicateRoom: (id: string) => void;

  // Furniture operations (Phase 4)
  addFurniture: (item: Partial<FurnitureItem>) => void;
  addBatchFurniture: (items: FurnitureItem[]) => void;
  setFurnitureList: (items: FurnitureItem[]) => void;
  updateFurniture: (id: string, updates: Partial<FurnitureItem>) => void;
  deleteFurniture: (id: string) => void;
  duplicateFurniture: (id: string) => void;
  rotateFurniture: (id: string, angleDeltaOrAbsolute: number, isAbsolute?: boolean) => void;
  toggleFurnitureLock: (id: string) => void;
  toggleFurnitureVisibility: (id: string) => void;
  reorderFurnitureZIndex: (id: string, action: "front" | "back" | "forward" | "backward") => void;

  // Door & Window operations (Phase 5)
  addDoorWindow: (item: Partial<DoorWindowItem>) => void;
  updateDoorWindow: (id: string, updates: Partial<DoorWindowItem>) => void;
  deleteDoorWindow: (id: string) => void;
  duplicateDoorWindow: (id: string) => void;
  rotateDoorWindow: (id: string, angleDeltaOrAbsolute: number, isAbsolute?: boolean) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  fitToScreen: () => void;
  resetZoom: () => void;
}

let autosaveTimeoutId: ReturnType<typeof setTimeout> | null = null;
let activeSavePromise: Promise<void> | null = null;

export const scheduleAutosave = (saveFn: () => Promise<void>, delayMs: number = 1200) => {
  if (autosaveTimeoutId) {
    clearTimeout(autosaveTimeoutId);
  }
  autosaveTimeoutId = setTimeout(() => {
    autosaveTimeoutId = null;
    saveFn();
  }, delayMs);
};

export const cancelPendingAutosave = () => {
  if (autosaveTimeoutId) {
    clearTimeout(autosaveTimeoutId);
    autosaveTimeoutId = null;
  }
};

export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  projectName: "Untitled Floor Plan",
  floorId: null,
  floorName: "Ground floor",
  floors: [],
  unit: "METERS",
  gridSize: 20,
  showGrid: true,
  showMeasurements: true,
  snapToGrid: true,
  showFurniture: true,
  showRoomLabels: true,
  showElectrical: true,
  showPlumbing: true,
  showLighting: true,
  showHvac: true,
  viewMode: "2D",
  activeTool: "select",
  zoom: 1,
  stagePos: { x: 0, y: 0 },
  cursorPos: { x: 0, y: 0 },
  rooms: [],
  furniture: [],
  doorsWindows: [],
  selectedId: null,
  selectedType: null,
  saveStatus: "saved",
  lastSavedAt: null,
  history: { past: [], future: [] },

  setActiveTool: (activeTool) => set({ activeTool }),
  setZoom: (zoom) => set({ zoom: Math.max(0.2, Math.min(zoom, 3.0)) }),
  setStagePos: (stagePos) => set({ stagePos }),
  setCursorPos: (cursorPos) => set({ cursorPos }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setShowMeasurements: (showMeasurements) => set({ showMeasurements }),
  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
  setShowFurniture: (showFurniture) => set({ showFurniture }),
  setShowRoomLabels: (showRoomLabels) => set({ showRoomLabels }),
  setShowElectrical: (showElectrical) => set({ showElectrical }),
  setShowPlumbing: (showPlumbing) => set({ showPlumbing }),
  setShowLighting: (showLighting) => set({ showLighting }),
  setShowHvac: (showHvac) => set({ showHvac }),
  setViewMode: (viewMode) => set({ viewMode }),
  setUnit: (unit) => set({ unit }),
  setSelection: (selectedId, selectedType = null) => set({ selectedId, selectedType }),

  loadProjectAndFloor: async (projectId: string, targetFloorId?: string) => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      if (res.data.success) {
        const project = res.data.data;
        const floors = project.floors || [];
        const activeFloor = targetFloorId
          ? floors.find((f: { id: string }) => f.id === targetFloorId) || floors[0]
          : floors[0];

        let layoutData: FloorLayoutData = {
          version: 1,
          unit: (project.unitSystem as UnitSystem) || "METERS",
          gridSize: 20,
          rooms: [],
          furniture: [],
          doorsWindows: [],
        };

        if (activeFloor?.layoutData) {
          try {
            layoutData = typeof activeFloor.layoutData === "string"
              ? JSON.parse(activeFloor.layoutData)
              : activeFloor.layoutData;
          } catch (e) {
            console.error("Error parsing floor layoutData", e);
          }
        }

        set({
          projectId: project.id,
          projectName: project.name,
          unit: (project.unitSystem as UnitSystem) || "METERS",
          floors: floors.map((f: { id: string; name: string; floorNumber: number }) => ({
            id: f.id,
            name: f.name,
            floorNumber: f.floorNumber,
          })),
          floorId: activeFloor?.id || null,
          floorName: activeFloor?.name || "Ground floor",
          rooms: layoutData.rooms || [],
          furniture: layoutData.furniture || [],
          doorsWindows: layoutData.doorsWindows || [],
          selectedId: null,
          selectedType: null,
          saveStatus: "saved",
          history: { past: [], future: [] },
        });

        get().fitToScreen();
      }
    } catch (err) {
      console.error("Failed to load project in editor", err);
      // Fallback: If backend is cold-starting, initialize with a complete demonstration layout
      if (get().rooms.length === 0) {
        set({
          projectId,
          projectName: "Contemporary Residence",
          unit: "METERS",
          floors: [{ id: "floor-1", name: "Ground floor", floorNumber: 1 }],
          floorId: "floor-1",
          floorName: "Ground floor",
          rooms: [
            {
              id: "room-living",
              name: "Living & Lounge",
              x: 100,
              y: 100,
              width: 320,
              height: 240,
              wallThickness: 10,
              wallColor: "#2C3E50",
              floorColor: "#E8D8C8",
              floorMaterial: "hardwood_oak",
            },
            {
              id: "room-bed",
              name: "Master Suite",
              x: 430,
              y: 100,
              width: 250,
              height: 240,
              wallThickness: 10,
              wallColor: "#2C3E50",
              floorColor: "#D5C4A1",
              floorMaterial: "hardwood_walnut",
            },
            {
              id: "room-kitchen",
              name: "Kitchen & Dining",
              x: 100,
              y: 350,
              width: 320,
              height: 200,
              wallThickness: 10,
              wallColor: "#2C3E50",
              floorColor: "#F4F4F0",
              floorMaterial: "marble_carrara",
            },
          ],
          furniture: [
            {
              id: "furn-sofa",
              roomId: "room-living",
              name: "Sectional Sofa",
              category: "LIVING_ROOM",
              type: "sofa_sectional_l",
              x: 230,
              y: 190,
              width: 140,
              height: 90,
              rotation: 0,
              color: "#34495E",
              material: "fabric_charcoal",
              isLocked: false,
              isVisible: true,
              zIndex: 1,
            },
            {
              id: "furn-bed",
              roomId: "room-bed",
              name: "King Bed",
              category: "BEDROOM",
              type: "bed_king",
              x: 550,
              y: 190,
              width: 100,
              height: 110,
              rotation: 0,
              color: "#D5C4A1",
              material: "fabric_linen",
              isLocked: false,
              isVisible: true,
              zIndex: 1,
            },
          ],
          doorsWindows: [
            {
              id: "dw-entry",
              type: "DOOR",
              name: "Main Entry Door",
              x: 100,
              y: 200,
              width: 45,
              height: 10,
              rotation: 90,
              wall: "WEST",
              swing: "INSIDE_LEFT",
            },
          ],
          selectedId: null,
          selectedType: null,
          saveStatus: "saved",
          history: { past: [], future: [] },
        });
        get().fitToScreen();
      }
    }
  },

  switchFloor: async (targetFloorId: string) => {
    const { projectId, floorId } = get();
    if (floorId === targetFloorId) return;
    if (projectId) {
      await get().flushAutosaveNow();
      await get().loadProjectAndFloor(projectId, targetFloorId);
    }
  },

  saveCurrentLayout: async () => {
    cancelPendingAutosave();
    const { floorId, rooms, furniture, doorsWindows, unit, gridSize } = get();
    if (!floorId) return;

    set({ saveStatus: "saving" });

    const layoutData: FloorLayoutData = {
      version: 1,
      unit,
      gridSize,
      rooms,
      furniture,
      doorsWindows,
    };

    activeSavePromise = (async () => {
      try {
        await api.put(`/floors/${floorId}/layout`, {
          layoutData: JSON.stringify(layoutData),
        });
        set({ saveStatus: "saved", lastSavedAt: new Date() });
      } catch (err) {
        console.error("Failed to auto-save layout", err);
        set({ saveStatus: "unsaved" });
      } finally {
        activeSavePromise = null;
      }
    })();

    await activeSavePromise;
  },

  flushAutosaveNow: async () => {
    cancelPendingAutosave();
    if (activeSavePromise) {
      await activeSavePromise;
    }
    if (get().saveStatus === "unsaved") {
      await get().saveCurrentLayout();
    }
  },

  addFloor: async (name?: string) => {
    const { projectId, floors } = get();
    if (!projectId) return null;

    await get().flushAutosaveNow();

    const nextNumber = floors.length + 1;
    const defaultName =
      name?.trim() ||
      (nextNumber === 2
        ? "Second floor"
        : nextNumber === 3
        ? "Third floor"
        : `Floor ${nextNumber}`);

    try {
      const res = await api.post(`/projects/${projectId}/floors`, {
        name: defaultName,
        floorNumber: nextNumber,
      });

      if (res.data.success) {
        const newFloor = res.data.data;
        const updatedFloors = [
          ...floors,
          { id: newFloor.id, name: newFloor.name, floorNumber: newFloor.floorNumber },
        ];
        set({ floors: updatedFloors });
        await get().switchFloor(newFloor.id);
        return newFloor.id;
      }
    } catch (err) {
      console.error("Failed to add floor", err);
    }
    return null;
  },

  updateFloorDetails: async (targetFloorId: string, name: string, floorNumber?: number) => {
    try {
      const trimmedName = name.trim();
      const res = await api.put(`/floors/${targetFloorId}`, {
        name: trimmedName,
        floorNumber,
      });
      if (res.data?.success) {
        const updated = res.data.data;
        const newName = updated?.name || trimmedName;
        const newNumber = updated?.floorNumber ?? floorNumber;

        set((state) => ({
          floors: state.floors.map((f) =>
            f.id === targetFloorId
              ? { ...f, name: newName, floorNumber: newNumber !== undefined ? newNumber : f.floorNumber }
              : f
          ),
          floorName: state.floorId === targetFloorId ? newName : state.floorName,
        }));
      }
    } catch (err) {
      console.error("Failed to update floor details", err);
    }
  },

  deleteFloor: async (targetFloorId: string) => {
    const { floors, floorId, projectId } = get();
    if (floors.length <= 1) {
      console.warn("Cannot delete the only floor in the project");
      return false;
    }

    try {
      await api.delete(`/floors/${targetFloorId}`);
      const remainingFloors = floors.filter((f) => f.id !== targetFloorId);
      set({ floors: remainingFloors });

      if (floorId === targetFloorId && remainingFloors.length > 0 && projectId) {
        await get().loadProjectAndFloor(projectId, remainingFloors[0].id);
      }
      return true;
    } catch (err) {
      console.error("Failed to delete floor", err);
      return false;
    }
  },

  duplicateCurrentFloor: async () => {
    const { floorId, projectId, floors } = get();
    if (!floorId || !projectId) return null;

    await get().flushAutosaveNow();

    try {
      const res = await api.post(`/floors/${floorId}/duplicate`);
      if (res.data.success) {
        const duplicatedFloor = res.data.data;
        const updatedFloors = [
          ...floors,
          {
            id: duplicatedFloor.id,
            name: duplicatedFloor.name,
            floorNumber: duplicatedFloor.floorNumber,
          },
        ];
        set({ floors: updatedFloors });
        await get().switchFloor(duplicatedFloor.id);
        return duplicatedFloor.id;
      }
    } catch (err) {
      console.error("Failed to duplicate floor", err);
    }
    return null;
  },

  pushHistory: () => {
    const { history, rooms, furniture, doorsWindows, unit, gridSize } = get();
    const currentSnapshot: FloorLayoutData = {
      version: 1,
      unit,
      gridSize,
      rooms: JSON.parse(JSON.stringify(rooms)),
      furniture: JSON.parse(JSON.stringify(furniture)),
      doorsWindows: JSON.parse(JSON.stringify(doorsWindows)),
    };

    set({
      history: {
        past: [...history.past.slice(-25), currentSnapshot],
        future: [],
      },
      saveStatus: "unsaved",
    });
  },

  undo: () => {
    const { history, rooms, furniture, doorsWindows, unit, gridSize } = get();
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);

    const currentSnapshot: FloorLayoutData = {
      version: 1,
      unit,
      gridSize,
      rooms: JSON.parse(JSON.stringify(rooms)),
      furniture: JSON.parse(JSON.stringify(furniture)),
      doorsWindows: JSON.parse(JSON.stringify(doorsWindows)),
    };

    set({
      rooms: previous.rooms || [],
      furniture: previous.furniture || [],
      doorsWindows: previous.doorsWindows || [],
      history: {
        past: newPast,
        future: [currentSnapshot, ...history.future],
      },
      selectedId: null,
      selectedType: null,
      saveStatus: "unsaved",
    });
  },

  redo: () => {
    const { history, rooms, furniture, doorsWindows, unit, gridSize } = get();
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    const currentSnapshot: FloorLayoutData = {
      version: 1,
      unit,
      gridSize,
      rooms: JSON.parse(JSON.stringify(rooms)),
      furniture: JSON.parse(JSON.stringify(furniture)),
      doorsWindows: JSON.parse(JSON.stringify(doorsWindows)),
    };

    set({
      rooms: next.rooms || [],
      furniture: next.furniture || [],
      doorsWindows: next.doorsWindows || [],
      history: {
        past: [...history.past, currentSnapshot],
        future: newFuture,
      },
      selectedId: null,
      selectedType: null,
      saveStatus: "unsaved",
    });
  },

  addRoom: (roomData) => {
    get().pushHistory();
    const id = "room-" + Math.random().toString(36).substring(2, 9);
    const newRoom: RoomItem = {
      id,
      name: roomData.name || "New Room",
      x: roomData.x || 200,
      y: roomData.y || 160,
      width: roomData.width || 320,
      height: roomData.height || 240,
      wallThickness: roomData.wallThickness || 12,
      wallColor: roomData.wallColor || "#292524",
      floorColor: roomData.floorColor || "#EBDCCB",
      floorMaterial: roomData.floorMaterial || "warm_oak",
    };

    set((state) => ({
      rooms: [...state.rooms, newRoom],
      selectedId: id,
      selectedType: "room",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  addBatchRooms: (newRooms) => {
    if (!newRooms || newRooms.length === 0) return;
    get().pushHistory();
    set((state) => ({
      rooms: [...state.rooms, ...newRooms],
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  updateRoom: (id, updates) => {
    get().pushHistory();
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  deleteRoom: (id) => {
    get().pushHistory();
    set((state) => ({
      rooms: state.rooms.filter((r) => r.id !== id),
      furniture: state.furniture.filter((f) => f.roomId !== id),
      doorsWindows: state.doorsWindows.filter((dw) => dw.roomId !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      selectedType: state.selectedId === id ? null : state.selectedType,
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  duplicateRoom: (id) => {
    const room = get().rooms.find((r) => r.id === id);
    if (!room) return;

    get().pushHistory();
    const newId = "room-" + Math.random().toString(36).substring(2, 9);
    const copy: RoomItem = {
      ...room,
      id: newId,
      name: `${room.name} (Copy)`,
      x: room.x + 30,
      y: room.y + 30,
    };

    set((state) => ({
      rooms: [...state.rooms, copy],
      selectedId: newId,
      selectedType: "room",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  // Furniture Operations (Phase 4)
  addFurniture: (itemData) => {
    get().pushHistory();
    const id = "furn-" + Math.random().toString(36).substring(2, 9);
    const { furniture, stagePos, zoom } = get();

    const defaultX = Math.round((-stagePos.x + 400) / zoom / 20) * 20;
    const defaultY = Math.round((-stagePos.y + 300) / zoom / 20) * 20;

    const maxZ = furniture.reduce((max, f) => Math.max(max, f.zIndex || 1), 1);
    const isRug = itemData.type?.includes("rug") || (itemData.category === "DECORATION" && itemData.name?.toLowerCase().includes("rug"));

    const newFurniture: FurnitureItem = {
      id,
      roomId: itemData.roomId,
      name: itemData.name || "Furniture Item",
      category: itemData.category || "LIVING_ROOM",
      type: itemData.type || "sofa_linen",
      x: itemData.x !== undefined ? itemData.x : Math.max(100, defaultX),
      y: itemData.y !== undefined ? itemData.y : Math.max(100, defaultY),
      width: itemData.width || 60,
      height: itemData.height || 100,
      rotation: itemData.rotation || 0,
      color: itemData.color || "#C5BCAB",
      material: itemData.material || "Fabric",
      isLocked: itemData.isLocked || false,
      isVisible: itemData.isVisible !== false,
      zIndex: itemData.zIndex !== undefined ? itemData.zIndex : (isRug ? 1 : maxZ + 1),
    };

    set((state) => ({
      furniture: [...state.furniture, newFurniture],
      selectedId: id,
      selectedType: "furniture",
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  addBatchFurniture: (items) => {
    if (!items || items.length === 0) return;
    get().pushHistory();
    set((state) => ({
      furniture: [...state.furniture, ...items],
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  setFurnitureList: (items) => {
    get().pushHistory();
    set({
      furniture: items,
      saveStatus: "unsaved",
    });

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  updateFurniture: (id, updates) => {
    get().pushHistory();
    set((state) => ({
      furniture: state.furniture.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  deleteFurniture: (id) => {
    get().pushHistory();
    set((state) => ({
      furniture: state.furniture.filter((f) => f.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      selectedType: state.selectedId === id ? null : state.selectedType,
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  duplicateFurniture: (id) => {
    const item = get().furniture.find((f) => f.id === id);
    if (!item) return;

    get().pushHistory();
    const newId = "furn-" + Math.random().toString(36).substring(2, 9);
    const maxZ = get().furniture.reduce((max, f) => Math.max(max, f.zIndex || 1), 1);

    const copy: FurnitureItem = {
      ...item,
      id: newId,
      name: `${item.name} (Copy)`,
      x: item.x + 25,
      y: item.y + 25,
      zIndex: maxZ + 1,
    };

    set((state) => ({
      furniture: [...state.furniture, copy],
      selectedId: newId,
      selectedType: "furniture",
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  rotateFurniture: (id, angleDeltaOrAbsolute, isAbsolute = false) => {
    const item = get().furniture.find((f) => f.id === id);
    if (!item) return;

    get().pushHistory();
    let newRotation = isAbsolute
      ? angleDeltaOrAbsolute
      : (item.rotation + angleDeltaOrAbsolute);
    newRotation = ((newRotation % 360) + 360) % 360;

    set((state) => ({
      furniture: state.furniture.map((f) =>
        f.id === id ? { ...f, rotation: Math.round(newRotation) } : f
      ),
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  toggleFurnitureLock: (id) => {
    const item = get().furniture.find((f) => f.id === id);
    if (!item) return;

    get().pushHistory();
    set((state) => ({
      furniture: state.furniture.map((f) =>
        f.id === id ? { ...f, isLocked: !f.isLocked } : f
      ),
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  toggleFurnitureVisibility: (id) => {
    const item = get().furniture.find((f) => f.id === id);
    if (!item) return;

    get().pushHistory();
    set((state) => ({
      furniture: state.furniture.map((f) =>
        f.id === id ? { ...f, isVisible: !f.isVisible } : f
      ),
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  reorderFurnitureZIndex: (id, action) => {
    const item = get().furniture.find((f) => f.id === id);
    if (!item) return;

    get().pushHistory();
    const currentZ = item.zIndex || 1;
    const allZ = get().furniture.map((f) => f.zIndex || 1);
    const maxZ = Math.max(...allZ, 1);
    const minZ = Math.min(...allZ, 1);

    let newZ = currentZ;
    if (action === "front") newZ = maxZ + 1;
    else if (action === "back") newZ = Math.max(1, minZ - 1);
    else if (action === "forward") newZ = currentZ + 1;
    else if (action === "backward") newZ = Math.max(1, currentZ - 1);

    set((state) => ({
      furniture: state.furniture.map((f) =>
        f.id === id ? { ...f, zIndex: newZ } : f
      ),
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  // Door & Window Operations (Phase 5)
  addDoorWindow: (itemData) => {
    get().pushHistory();
    const isDoor = itemData.type !== "WINDOW";
    const id = (isDoor ? "door-" : "win-") + Math.random().toString(36).substring(2, 9);
    const { stagePos, zoom } = get();

    const defaultX = Math.round((-stagePos.x + 400) / zoom / 20) * 20;
    const defaultY = Math.round((-stagePos.y + 300) / zoom / 20) * 20;

    const newOpening: DoorWindowItem = {
      id,
      roomId: itemData.roomId,
      type: itemData.type || "DOOR",
      name: itemData.name || (isDoor ? "Standard Interior Door" : "Casement Window"),
      x: itemData.x !== undefined ? itemData.x : Math.max(100, defaultX),
      y: itemData.y !== undefined ? itemData.y : Math.max(100, defaultY),
      width: itemData.width || (isDoor ? 65 : 75),
      height: itemData.height || 12,
      rotation: itemData.rotation || 0,
      wall: itemData.wall || "SOUTH",
      swing: itemData.swing || "INSIDE_LEFT",
    };

    set((state) => ({
      doorsWindows: [...state.doorsWindows, newOpening],
      selectedId: id,
      selectedType: "door_window",
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  updateDoorWindow: (id, updates) => {
    get().pushHistory();
    set((state) => ({
      doorsWindows: state.doorsWindows.map((dw) => (dw.id === id ? { ...dw, ...updates } : dw)),
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  deleteDoorWindow: (id) => {
    get().pushHistory();
    set((state) => ({
      doorsWindows: state.doorsWindows.filter((dw) => dw.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      selectedType: state.selectedId === id ? null : state.selectedType,
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  duplicateDoorWindow: (id) => {
    const item = get().doorsWindows.find((dw) => dw.id === id);
    if (!item) return;

    get().pushHistory();
    const isDoor = item.type !== "WINDOW";
    const newId = (isDoor ? "door-" : "win-") + Math.random().toString(36).substring(2, 9);

    const copy: DoorWindowItem = {
      ...item,
      id: newId,
      name: `${item.name} (Copy)`,
      x: item.x + 20,
      y: item.y + 20,
    };

    set((state) => ({
      doorsWindows: [...state.doorsWindows, copy],
      selectedId: newId,
      selectedType: "door_window",
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  rotateDoorWindow: (id, angleDeltaOrAbsolute, isAbsolute = false) => {
    const item = get().doorsWindows.find((dw) => dw.id === id);
    if (!item) return;

    get().pushHistory();
    let newRotation = isAbsolute
      ? angleDeltaOrAbsolute
      : (item.rotation + angleDeltaOrAbsolute);
    newRotation = ((newRotation % 360) + 360) % 360;

    set((state) => ({
      doorsWindows: state.doorsWindows.map((dw) =>
        dw.id === id ? { ...dw, rotation: Math.round(newRotation) } : dw
      ),
      saveStatus: "unsaved",
    }));

    scheduleAutosave(() => get().saveCurrentLayout(), 1200);
  },

  fitToScreen: () => {
    const { rooms } = get();
    if (rooms.length === 0) {
      set({ zoom: 1, stagePos: { x: 100, y: 80 } });
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    rooms.forEach((r) => {
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.width);
      maxY = Math.max(maxY, r.y + r.height);
    });

    const padding = 120;
    const boundingW = maxX - minX + padding * 2;
    const boundingH = maxY - minY + padding * 2;

    const viewportW = typeof window !== "undefined" ? window.innerWidth - 650 : 800;
    const viewportH = typeof window !== "undefined" ? window.innerHeight - 150 : 600;

    const scaleX = viewportW / boundingW;
    const scaleY = viewportH / boundingH;
    const scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.5), 1.5);

    const stageX = (viewportW - (maxX - minX) * scale) / 2 - minX * scale + 240;
    const stageY = (viewportH - (maxY - minY) * scale) / 2 - minY * scale + 50;

    set({ zoom: Math.round(scale * 100) / 100, stagePos: { x: stageX, y: stageY } });
  },

  resetZoom: () => {
    set({ zoom: 1.0, stagePos: { x: 120, y: 80 } });
  },
}));
