import { describe, it, expect } from "vitest";
import {
  formatFeetAndInches,
  formatDimension,
  extractElevationBays,
  generateDatumLevels,
  generateVerticalDimensions,
  generateHorizontalDimensions,
  computeElevationModel,
  REFERENCE_RESIDENTIAL_PLAN,
} from "../src/lib/elevationEngine";
import { RoomItem } from "../src/types/editor";

describe("CAD Elevation & Architectural Transition Engine", () => {
  describe("Architectural Unit Formatting", () => {
    it("converts decimal feet to architectural feet and inches", () => {
      expect(formatFeetAndInches(0)).toBe("0'-0\"");
      expect(formatFeetAndInches(1.5)).toBe("1'-6\"");
      expect(formatFeetAndInches(11.5)).toBe("11'-6\"");
      expect(formatFeetAndInches(21.5)).toBe("21'-6\"");
      expect(formatFeetAndInches(31.5)).toBe("31'-6\"");
      expect(formatFeetAndInches(41.5)).toBe("41'-6\"");
      expect(formatFeetAndInches(51.5)).toBe("51'-6\"");
      expect(formatFeetAndInches(54.5)).toBe("54'-6\"");
      expect(formatFeetAndInches(61.5)).toBe("61'-6\"");
      expect(formatFeetAndInches(13.75)).toBe("13'-9\"");
      expect(formatFeetAndInches(14.0)).toBe("14'-0\"");
      expect(formatFeetAndInches(3.0)).toBe("3'-0\"");
    });

    it("formats dimension in meters or feet", () => {
      expect(formatDimension(10, "FEET")).toBe("10'-0\"");
      expect(formatDimension(10, "METERS")).toBe("3.05m");
      expect(formatDimension(10, "CENTIMETERS")).toBe("305cm");
    });
  });

  describe("Reference Residential Blueprint (Image 1)", () => {
    it("contains complete residential floor plan geometry matching Image 1", () => {
      expect(REFERENCE_RESIDENTIAL_PLAN.rooms.length).toBeGreaterThanOrEqual(10);
      const names = REFERENCE_RESIDENTIAL_PLAN.rooms.map((r) => r.name);

      // Verify Master Bedrooms, Verandahs, Central Void & Stair Core
      expect(names.some((n) => n.includes("M.BED"))).toBe(true);
      expect(names.some((n) => n.includes("VER"))).toBe(true);
      expect(names.some((n) => n.includes("CENTRAL VOID"))).toBe(true);
      expect(names.some((n) => n.includes("STAIR"))).toBe(true);
      expect(names.some((n) => n.includes("DRAWING"))).toBe(true);
      expect(names.some((n) => n.includes("KITCHEN"))).toBe(true);

      // Verify Sliding doors and windows
      expect(REFERENCE_RESIDENTIAL_PLAN.doorsWindows.length).toBeGreaterThan(0);
      expect(
        REFERENCE_RESIDENTIAL_PLAN.doorsWindows.some(
          (dw) => dw.name.includes("Sliding") || dw.type === "DOOR"
        )
      ).toBe(true);
    });
  });

  describe("Elevation Datum Levels Generation (Image 2 Match)", () => {
    it("generates exact datum levels matching 5-story CAD elevation blueprint", () => {
      const levels = generateDatumLevels(5, 10.0, 1.5, 3.0, 7.0);

      expect(levels.length).toBe(9); // Ground, Plinth, 1st, 2nd, 3rd, 4th, Roof, Parapet, Stair Roof

      // 1. Plinth Level (+1'-6")
      const plinth = levels.find((l) => l.isPlinth);
      expect(plinth).toBeDefined();
      expect(plinth?.elevationFeet).toBe(1.5);
      expect(plinth?.elevationFormatted).toBe("EL. +1'-6\"");

      // 2. 1st Floor Level (+11'-6")
      const floor1 = levels.find((l) => l.name === "1ST FLOOR");
      expect(floor1).toBeDefined();
      expect(floor1?.elevationFeet).toBe(11.5);
      expect(floor1?.elevationFormatted).toBe("EL. +11'-6\"");

      // 3. 2nd Floor Level (+21'-6")
      const floor2 = levels.find((l) => l.name === "2ND FLOOR");
      expect(floor2?.elevationFeet).toBe(21.5);
      expect(floor2?.elevationFormatted).toBe("EL. +21'-6\"");

      // 4. 3rd Floor Level (+31'-6")
      const floor3 = levels.find((l) => l.name === "3RD FLOOR");
      expect(floor3?.elevationFeet).toBe(31.5);
      expect(floor3?.elevationFormatted).toBe("EL. +31'-6\"");

      // 5. 4th Floor Level (+41'-6")
      const floor4 = levels.find((l) => l.name === "4TH FLOOR");
      expect(floor4?.elevationFeet).toBe(41.5);
      expect(floor4?.elevationFormatted).toBe("EL. +41'-6\"");

      // 6. Roof Level (+51'-6")
      const roof = levels.find((l) => l.isRoof);
      expect(roof?.elevationFeet).toBe(51.5);
      expect(roof?.elevationFormatted).toBe("EL. +51'-6\"");

      // 7. Parapet Level (+54'-6")
      const parapet = levels.find((l) => l.isParapet);
      expect(parapet?.elevationFeet).toBe(54.5);
      expect(parapet?.elevationFormatted).toBe("EL. +54'-6\"");

      // 8. Stair Room Roof (+61'-6")
      const stair = levels.find((l) => l.isStairRoom);
      expect(stair?.elevationFeet).toBe(61.5);
      expect(stair?.elevationFormatted).toBe("EL. +61'-6\"");
    });
  });

  describe("Elevation Bay Extraction & Alignment", () => {
    it("extracts 5 distinct architectural bays from the reference residential plan", () => {
      const bays = extractElevationBays(REFERENCE_RESIDENTIAL_PLAN.rooms, "BACK");

      expect(bays.length).toBeGreaterThanOrEqual(4);
      // Verify central void or stair bay exists
      const voidOrStair = bays.find((b) => b.roomType === "VOID" || b.roomType === "STAIR");
      expect(voidOrStair).toBeDefined();

      // Verify balcony bays
      const balconyBays = bays.filter((b) => b.hasBalcony);
      expect(balconyBays.length).toBeGreaterThanOrEqual(2);
    });

    it("handles custom or empty room plans gracefully with fallback default bays", () => {
      const model = computeElevationModel([]);
      expect(model.bays.length).toBe(5);
      expect(model.hasCentralVoid).toBe(true);
      expect(model.datumLevels.length).toBeGreaterThan(0);
      expect(model.drawingMetadata.drawingTitle).toBe("BACK ELEVATION");
    });
  });

  describe("Full Orthographic Model Computation", () => {
    it("computes complete model with dimensions and title block metadata", () => {
      const model = computeElevationModel(
        REFERENCE_RESIDENTIAL_PLAN.rooms,
        REFERENCE_RESIDENTIAL_PLAN.doorsWindows,
        {
          orientation: "BACK",
          storyCount: 5,
          projectName: "CAPSTONE RESIDENTIAL COMPLEX",
        }
      );

      expect(model.orientation).toBe("BACK");
      expect(model.storyCount).toBe(5);
      expect(model.drawingMetadata.projectName).toBe("CAPSTONE RESIDENTIAL COMPLEX");
      expect(model.drawingMetadata.drawingTitle).toBe("BACK ELEVATION");
      expect(model.verticalDimensions.length).toBeGreaterThan(0);
      expect(model.horizontalDimensions.length).toBeGreaterThan(0);
      expect(model.totalWidthFeet).toBeGreaterThan(40);
      expect(model.totalHeightFeet).toBe(61.5);
    });

    it("computes Front Elevation with appropriate title and bays", () => {
      const model = computeElevationModel(
        REFERENCE_RESIDENTIAL_PLAN.rooms,
        REFERENCE_RESIDENTIAL_PLAN.doorsWindows,
        {
          orientation: "FRONT",
          storyCount: 5,
        }
      );

      expect(model.orientation).toBe("FRONT");
      expect(model.drawingMetadata.drawingTitle).toBe("FRONT ELEVATION");
      expect(model.bays.length).toBeGreaterThan(0);
    });
  });
});
