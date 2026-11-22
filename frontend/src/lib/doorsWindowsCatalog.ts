import { OpeningType } from "@/types/editor";

export interface CatalogOpeningItem {
  id: string;
  type: OpeningType;
  name: string;
  defaultWidth: number; // in canvas px (25px = 1m)
  defaultHeight: number; // wall thickness (usually 12px)
  widthMeters: number;
  description: string;
  defaultSwing?: "INSIDE_LEFT" | "INSIDE_RIGHT" | "OUTSIDE_LEFT" | "OUTSIDE_RIGHT";
}

export const DOORS_WINDOWS_CATALOG: CatalogOpeningItem[] = [
  // DOORS
  {
    id: "door-standard",
    type: "DOOR",
    name: "Standard Interior Door",
    defaultWidth: 65,
    defaultHeight: 12,
    widthMeters: 0.85,
    description: "Single swing hinged passage door with 90° clearance arc",
    defaultSwing: "INSIDE_LEFT",
  },
  {
    id: "door-entry",
    type: "DOOR",
    name: "Main Entrance Door",
    defaultWidth: 75,
    defaultHeight: 14,
    widthMeters: 0.95,
    description: "Sturdy exterior entrance door with architectural threshold",
    defaultSwing: "INSIDE_LEFT",
  },
  {
    id: "door-double",
    type: "DOOR",
    name: "Double French Door",
    defaultWidth: 110,
    defaultHeight: 12,
    widthMeters: 1.4,
    description: "Dual opening terrace or patio swing doors",
    defaultSwing: "INSIDE_LEFT",
  },
  {
    id: "door-sliding",
    type: "DOOR",
    name: "Sliding Pocket Door",
    defaultWidth: 70,
    defaultHeight: 12,
    widthMeters: 0.9,
    description: "Recessed sliding space-saving pocket door",
    defaultSwing: "INSIDE_LEFT",
  },

  // WINDOWS
  {
    id: "win-standard",
    type: "WINDOW",
    name: "Standard Casement Window",
    defaultWidth: 75,
    defaultHeight: 12,
    widthMeters: 1.0,
    description: "Double pane insulated casement window with exterior sill",
  },
  {
    id: "win-large",
    type: "WINDOW",
    name: "Wide Picture Window",
    defaultWidth: 120,
    defaultHeight: 12,
    widthMeters: 1.6,
    description: "Expansive multi-lite architectural panoramic window",
  },
  {
    id: "win-small",
    type: "WINDOW",
    name: "Bathroom Vent Window",
    defaultWidth: 45,
    defaultHeight: 12,
    widthMeters: 0.6,
    description: "Compact awning privacy window for washrooms",
  },
  {
    id: "win-double-hung",
    type: "WINDOW",
    name: "Double-Hung Window",
    defaultWidth: 90,
    defaultHeight: 12,
    widthMeters: 1.2,
    description: "Classic vertical sliding sash window",
  },
];
