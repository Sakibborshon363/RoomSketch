import { describe, it, expect } from "vitest";
import { formatArea, formatDimension } from "../src/lib/utils";

describe("Geometry and measurement formatting utilities", () => {
  it("formats area in meters correctly", () => {
    expect(formatArea(24.5, "METERS")).toBe("24.50 m²");
  });

  it("formats area in square feet correctly", () => {
    // 10 sq meters = 107.6 sq ft
    expect(formatArea(10, "FEET")).toBe("107.6 sq ft");
  });

  it("formats area in square centimeters correctly", () => {
    expect(formatArea(2, "CENTIMETERS")).toBe("20,000 cm²");
  });

  it("formats dimension in meters", () => {
    expect(formatDimension(3.5, "METERS")).toBe("3.50 m");
  });

  it("formats dimension in centimeters", () => {
    expect(formatDimension(1.2, "CENTIMETERS")).toBe("120 cm");
  });

  it("formats dimension in feet and inches", () => {
    // 1 meter is approx 3' 3"
    expect(formatDimension(1, "FEET")).toBe("3' 3\"");
  });
});
