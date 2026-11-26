import { describe, it, expect } from "vitest";
import {
  generateStructuralColumns,
  generateAutomatedArchitecture,
  BuildingArchetype,
} from "@/lib/aiStructureGenerator";
import {
  scanBuildingImage,
  SAMPLE_BUILDING_PRESETS,
} from "@/lib/imageToArchitectureEngine";
import { RoomItem } from "@/types/editor";

describe("AI Structure & Automated Plan Generator", () => {
  describe("generateStructuralColumns", () => {
    it("should generate columns at room corners with welded intersections", () => {
      const mockRooms: RoomItem[] = [
        {
          id: "r1",
          name: "Room 1",
          x: 100,
          y: 100,
          width: 200,
          height: 200,
          type: "BEDROOM",
          color: "#E2E8F0",
        },
        {
          id: "r2",
          name: "Room 2",
          x: 300,
          y: 100,
          width: 200,
          height: 200,
          type: "LIVING_ROOM",
          color: "#E2E8F0",
        },
      ];

      const columns = generateStructuralColumns(mockRooms);
      // R1 has 4 corners, R2 has 4 corners. They share 2 corners at x=300 (y=100 and y=300).
      // Total unique welded corners = 6
      expect(columns.length).toBe(6);
      expect(columns[0]).toHaveProperty("id");
      expect(columns[0]).toHaveProperty("x");
      expect(columns[0]).toHaveProperty("y");
      expect(columns[0].width).toBe(15); // 30cm at 50px/m
      expect(columns[0].height).toBe(15);
      expect(columns[0].label).toMatch(/^C\d+$/);
    });

    it("should handle empty room list gracefully", () => {
      const columns = generateStructuralColumns([]);
      expect(columns).toEqual([]);
    });
  });

  describe("generateAutomatedArchitecture", () => {
    const archetypes: BuildingArchetype[] = [
      "RESIDENTIAL_COMPLEX_5S",
      "MODERN_DUPLEX_VILLA",
      "CONTEMPORARY_3BED",
      "COMMERCIAL_STUDIO",
    ];

    archetypes.forEach((archetype) => {
      it(`should generate a complete architectural blueprint for ${archetype}`, () => {
        const plan = generateAutomatedArchitecture(archetype, {
          projectName: "Test Project",
          includeColumns: true,
          autoFurnish: true,
        });

        expect(plan.archetype).toBe(archetype);
        expect(plan.name).toContain("Test Project");
        expect(plan.storyCount).toBeGreaterThanOrEqual(1);
        expect(plan.totalAreaSqM).toBeGreaterThan(0);
        expect(plan.totalAreaSqFt).toBeGreaterThan(0);
        expect(plan.rooms.length).toBeGreaterThan(0);
        expect(plan.doorsWindows.length).toBeGreaterThan(0);
        expect(plan.furniture.length).toBeGreaterThan(0);
        expect(plan.structuralColumns.length).toBeGreaterThan(0);

        // Verify structural specifications
        expect(plan.specifications.stories).toBe(plan.storyCount);
        expect(plan.specifications.structuralGrid).toBeTruthy();
        expect(plan.specifications.ceilingHeight).toBeTruthy();
      });
    });

    it("should omit structural columns when includeColumns is false", () => {
      const plan = generateAutomatedArchitecture("CONTEMPORARY_3BED", {
        includeColumns: false,
        autoFurnish: true,
      });

      expect(plan.structuralColumns.length).toBe(0);
      expect(plan.rooms.length).toBeGreaterThan(0);
    });

    it("should omit furniture when autoFurnish is false", () => {
      const plan = generateAutomatedArchitecture("CONTEMPORARY_3BED", {
        includeColumns: true,
        autoFurnish: false,
      });

      expect(plan.furniture.length).toBe(0);
      expect(plan.rooms.length).toBeGreaterThan(0);
    });

    it("should accurately reflect the 5-story reference building from user specifications", () => {
      const plan = generateAutomatedArchitecture("RESIDENTIAL_COMPLEX_5S");

      expect(plan.storyCount).toBe(5);
      expect(plan.specifications.bedrooms).toBe(6); // 4 master beds + 2 common beds
      expect(plan.specifications.bathrooms).toBe(4);
      expect(plan.specifications.balconies).toBe(4);

      // Verify specific room types exist in the reference blueprint
      const roomNames = plan.rooms.map((r) => r.name);
      expect(roomNames.some((n) => n.includes("STAIR"))).toBe(true);
      expect(roomNames.some((n) => n.includes("M.BED"))).toBe(true);
      expect(roomNames.some((n) => n.includes("DRAWING"))).toBe(true);
      expect(roomNames.some((n) => n.includes("DINING"))).toBe(true);
      expect(roomNames.some((n) => n.includes("KITCHEN"))).toBe(true);
    });
  });

  describe("imageToArchitectureEngine", () => {
    it("should provide valid sample building presets", () => {
      expect(SAMPLE_BUILDING_PRESETS.length).toBeGreaterThanOrEqual(3);
      SAMPLE_BUILDING_PRESETS.forEach((preset) => {
        expect(preset.id).toBeTruthy();
        expect(preset.title).toBeTruthy();
        expect(preset.stories).toBeGreaterThan(0);
        expect(preset.bays).toBeGreaterThan(0);
        expect(preset.archetype).toBeTruthy();
      });
    });

    it("should scan building image and reverse engineer architectural parameters", async () => {
      const result = await scanBuildingImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");

      expect(result.detectedStories).toBe(5);
      expect(result.detectedBays).toBe(5);
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0.85);
      expect(result.confidenceScore).toBeLessThanOrEqual(1.0);
      expect(result.estimatedHeightMeters).toBeGreaterThan(15);
      expect(result.estimatedFootprintSqM).toBeGreaterThan(100);
      expect(result.materialPalette.primaryWall).toBeTruthy();
      expect(result.materialPalette.accentCladding).toBeTruthy();
      expect(result.recommendedArchetype).toBe("RESIDENTIAL_COMPLEX_5S");
    });

    it("should adapt archetype heuristics based on image filename hint", async () => {
      const mockFile = { name: "luxury_villa_exterior.jpg" } as unknown as File;
      const result = await scanBuildingImage(mockFile);

      expect(result.detectedStories).toBe(2);
      expect(result.recommendedArchetype).toBe("MODERN_DUPLEX_VILLA");
      expect(result.facadeStyle).toBe("LUXURY_VILLA");
    });
  });
});
