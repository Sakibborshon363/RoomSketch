export type UnitSystem = "METERS" | "CENTIMETERS" | "FEET";

export interface RoomItem {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  wallThickness: number;
  wallColor: string;
  floorColor: string;
  floorMaterial: string;
}

export type FurnitureCategory =
  | "LIVING_ROOM"
  | "BEDROOM"
  | "KITCHEN"
  | "BATHROOM"
  | "OFFICE"
  | "DINING_ROOM"
  | "STORAGE"
  | "DECORATION";

export interface FurnitureItem {
  id: string;
  roomId?: string;
  name: string;
  category: FurnitureCategory;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  material: string;
  isLocked: boolean;
  isVisible: boolean;
  zIndex: number;
}

export type OpeningType = "DOOR" | "WINDOW";

export interface DoorWindowItem {
  id: string;
  roomId?: string;
  type: OpeningType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  wall?: "NORTH" | "SOUTH" | "EAST" | "WEST";
  swing?: "INSIDE_LEFT" | "INSIDE_RIGHT" | "OUTSIDE_LEFT" | "OUTSIDE_RIGHT";
}

export interface FloorLayoutData {
  version: number;
  unit: UnitSystem;
  gridSize: number;
  rooms: RoomItem[];
  furniture: FurnitureItem[];
  doorsWindows: DoorWindowItem[];
}
