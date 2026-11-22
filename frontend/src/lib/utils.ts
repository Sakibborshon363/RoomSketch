import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatArea(areaInSquareMeters: number, unit: "METERS" | "CENTIMETERS" | "FEET" = "METERS"): string {
  if (unit === "FEET") {
    // 1 sq meter = 10.7639 sq ft
    const sqFt = areaInSquareMeters * 10.7639;
    return `${sqFt.toFixed(1)} sq ft`;
  }
  if (unit === "CENTIMETERS") {
    // 1 sq meter = 10,000 sq cm
    const sqCm = areaInSquareMeters * 10000;
    return `${Math.round(sqCm).toLocaleString()} cm²`;
  }
  return `${areaInSquareMeters.toFixed(2)} m²`;
}

export function formatDimension(meters: number, unit: "METERS" | "CENTIMETERS" | "FEET" = "METERS"): string {
  if (unit === "FEET") {
    const totalInches = meters * 39.3701;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}' ${inches}"`;
  }
  if (unit === "CENTIMETERS") {
    return `${Math.round(meters * 100)} cm`;
  }
  return `${meters.toFixed(2)} m`;
}
