import { RoomItem, FurnitureItem, DoorWindowItem, UnitSystem } from "@/types/editor";
import { formatArea } from "./utils";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "BDT" | "CAD" | "AUD";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rateAgainstUsd: number;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", rateAgainstUsd: 1.0 },
  EUR: { code: "EUR", symbol: "€", rateAgainstUsd: 0.92 },
  GBP: { code: "GBP", symbol: "£", rateAgainstUsd: 0.79 },
  BDT: { code: "BDT", symbol: "৳", rateAgainstUsd: 118.0 },
  CAD: { code: "CAD", symbol: "CA$", rateAgainstUsd: 1.36 },
  AUD: { code: "AUD", symbol: "AU$", rateAgainstUsd: 1.52 },
};

// Default unit rates in USD ($)
export const DEFAULT_FLOOR_RATES_PER_SQM: Record<string, number> = {
  hardwood_oak: 68.0,
  hardwood_walnut: 88.0,
  hardwood_light: 58.0,
  marble_carrara: 125.0,
  ceramic_beige: 38.0,
  ceramic_slate: 48.0,
  terrazzo_white: 78.0,
  polished_concrete: 32.0,
  carpet_beige: 42.0,
  carpet_charcoal: 46.0,
  default: 55.0,
};

export const DEFAULT_WALL_FINISH_RATES = {
  paintPerSqm: 5.5, // 2 coats premium emulsion paint
  skirtingPerLinearMeter: 14.0, // Architectural baseboard trim
  paintCoverageSqmPerLiter: 9.0, // Coverage for 2 coats
  defaultCeilingHeightMeters: 2.8, // Standard residential ceiling
};

export const DEFAULT_FURNITURE_PRICES_USD: Record<string, number> = {
  // Living
  sofa_3seater: 850.0,
  sofa_sectional_l: 1450.0,
  armchair_modern: 320.0,
  coffee_table_glass: 220.0,
  tv_console_credenza: 380.0,
  floor_lamp_arc: 120.0,
  potted_monstera: 65.0,

  // Bedroom
  bed_king: 950.0,
  bed_queen: 780.0,
  bed_single: 450.0,
  nightstand_pair: 220.0,
  wardrobe_sliding_3door: 780.0,

  // Dining & Kitchen
  dining_table_6p: 620.0,
  dining_table_4p: 420.0,
  dining_chair: 95.0,
  kitchen_island_prep: 1150.0,
  kitchen_sink_counter: 580.0,
  refrigerator_french_door: 980.0,
  cooktop_induction_4zone: 540.0,

  // Office & Bath
  office_desk_executive: 420.0,
  chair_ergonomic: 280.0,
  bookshelf_display: 290.0,
  bath_vanity_double: 620.0,
  bathtub_freestanding: 890.0,
};

export interface RoomFlooringEstimate {
  id: string;
  name: string;
  netAreaSqm: number;
  grossAreaWithWastageSqm: number;
  materialId: string;
  materialName: string;
  unitRate: number;
  subtotal: number;
}

export interface RoomWallEstimate {
  id: string;
  name: string;
  perimeterMeters: number;
  ceilingHeightMeters: number;
  grossWallAreaSqm: number;
  openingsDeductionSqm: number;
  netPaintableAreaSqm: number;
  paintRequiredLiters: number;
  skirtingLinearMeters: number;
  paintSubtotal: number;
  skirtingSubtotal: number;
  subtotal: number;
}

export interface FurnitureLineItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BoQSummary {
  currency: CurrencyConfig;
  totalFloorAreaSqm: number;
  flooringItems: RoomFlooringEstimate[];
  totalFlooringCost: number;

  wallItems: RoomWallEstimate[];
  totalNetWallAreaSqm: number;
  totalPaintRequiredLiters: number;
  totalWallFinishesCost: number;

  furnitureItems: FurnitureLineItem[];
  totalFurnitureCount: number;
  totalFurnitureCost: number;

  subtotalMaterials: number;
  laborRatePercentage: number;
  laborCost: number;
  contingencyPercentage: number;
  contingencyCost: number;

  grandTotal: number;
}

/**
 * Format monetary amount with active currency symbol and localization
 */
export function formatCurrency(
  amountUsd: number,
  currencyCode: CurrencyCode = "USD"
): string {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  const converted = amountUsd * currency.rateAgainstUsd;

  if (currencyCode === "BDT") {
    return `${currency.symbol} ${Math.round(converted).toLocaleString("en-BD")}`;
  }

  return `${currency.symbol}${converted.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Material name lookup helper
 */
export function getMaterialDisplayName(materialId: string): string {
  const map: Record<string, string> = {
    hardwood_oak: "Hardwood Oak Plank",
    hardwood_walnut: "Hardwood Walnut Plank",
    hardwood_light: "Natural Light Parquet",
    marble_carrara: "Carrara White Marble",
    ceramic_beige: "Glazed Beige Ceramic Tile",
    ceramic_slate: "Anthracite Slate Tile",
    terrazzo_white: "White Venetian Terrazzo",
    polished_concrete: "Industrial Polished Concrete",
    carpet_beige: "Wool Tufted Beige Carpet",
    carpet_charcoal: "Wool Charcoal Carpet",
  };
  return map[materialId] || "Standard Architectural Finish";
}

/**
 * Core Architectural Bill of Quantities (BoQ) Calculation Engine
 */
export function calculateProjectBoQ({
  rooms,
  doorsWindows = [],
  furniture = [],
  ceilingHeight = DEFAULT_WALL_FINISH_RATES.defaultCeilingHeightMeters,
  currencyCode = "USD",
  laborPercentage = 18,
  contingencyPercentage = 8,
  customFloorRates = {},
  customFurnitureRates = {},
}: {
  rooms: RoomItem[];
  doorsWindows?: DoorWindowItem[];
  furniture?: FurnitureItem[];
  ceilingHeight?: number;
  currencyCode?: CurrencyCode;
  laborPercentage?: number;
  contingencyPercentage?: number;
  customFloorRates?: Record<string, number>;
  customFurnitureRates?: Record<string, number>;
}): BoQSummary {
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;

  // 1. Flooring Estimates per Room (10% material cut allowance)
  let totalFloorAreaSqm = 0;
  let totalFlooringCost = 0;

  const flooringItems: RoomFlooringEstimate[] = rooms.map((room) => {
    // Area in square meters (dimensions in model are in meters, 1m = 50px)
    const netAreaSqm = (room.width / 50) * (room.height / 50);
    const grossAreaWithWastageSqm = netAreaSqm * 1.1; // 10% cutting waste
    const matKey = room.floorMaterial || (room as any).materialId || "default";
    const rate =
      customFloorRates[matKey] ||
      DEFAULT_FLOOR_RATES_PER_SQM[matKey] ||
      DEFAULT_FLOOR_RATES_PER_SQM.default;

    const subtotal = grossAreaWithWastageSqm * rate;

    totalFloorAreaSqm += netAreaSqm;
    totalFlooringCost += subtotal;

    return {
      id: room.id,
      name: room.name || "Room",
      netAreaSqm: Math.round(netAreaSqm * 100) / 100,
      grossAreaWithWastageSqm: Math.round(grossAreaWithWastageSqm * 100) / 100,
      materialId: matKey,
      materialName: getMaterialDisplayName(matKey),
      unitRate: rate,
      subtotal: Math.round(subtotal * 100) / 100,
    };
  });

  // 2. Wall Paint & Baseboard Estimates
  let totalNetWallAreaSqm = 0;
  let totalPaintRequiredLiters = 0;
  let totalWallFinishesCost = 0;

  // Estimate total opening areas (doors: 0.9m x 2.1m = ~1.89m², windows: 1.2m x 1.4m = ~1.68m²)
  const totalOpeningsAreaSqm = doorsWindows.reduce((acc, item) => {
    const isWindow = (item.type || "").toLowerCase().includes("window");
    const itemWidthM = (item.width || 45) / 50;
    const heightM = isWindow ? 1.4 : 2.1;
    return acc + itemWidthM * heightM;
  }, 0);

  // Apportion openings equally across rooms if doorsWindows not explicitly keyed to rooms
  const openingsPerRoomSqm = rooms.length > 0 ? totalOpeningsAreaSqm / rooms.length : 0;

  const wallItems: RoomWallEstimate[] = rooms.map((room) => {
    const widthM = room.width / 50;
    const heightM = room.height / 50;
    const perimeterMeters = 2 * (widthM + heightM);
    const grossWallAreaSqm = perimeterMeters * ceilingHeight;

    const netPaintableAreaSqm = Math.max(0, grossWallAreaSqm - openingsPerRoomSqm);
    const paintRequiredLiters =
      netPaintableAreaSqm / DEFAULT_WALL_FINISH_RATES.paintCoverageSqmPerLiter;

    // Skirting perimeter (subtract 0.9m for standard door opening)
    const skirtingLinearMeters = Math.max(0, perimeterMeters - 0.9);

    const paintSubtotal = netPaintableAreaSqm * DEFAULT_WALL_FINISH_RATES.paintPerSqm;
    const skirtingSubtotal =
      skirtingLinearMeters * DEFAULT_WALL_FINISH_RATES.skirtingPerLinearMeter;
    const subtotal = paintSubtotal + skirtingSubtotal;

    totalNetWallAreaSqm += netPaintableAreaSqm;
    totalPaintRequiredLiters += paintRequiredLiters;
    totalWallFinishesCost += subtotal;

    return {
      id: room.id,
      name: room.name || "Room",
      perimeterMeters: Math.round(perimeterMeters * 100) / 100,
      ceilingHeightMeters: ceilingHeight,
      grossWallAreaSqm: Math.round(grossWallAreaSqm * 100) / 100,
      openingsDeductionSqm: Math.round(openingsPerRoomSqm * 100) / 100,
      netPaintableAreaSqm: Math.round(netPaintableAreaSqm * 100) / 100,
      paintRequiredLiters: Math.round(paintRequiredLiters * 10) / 10,
      skirtingLinearMeters: Math.round(skirtingLinearMeters * 100) / 100,
      paintSubtotal: Math.round(paintSubtotal * 100) / 100,
      skirtingSubtotal: Math.round(skirtingSubtotal * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
    };
  });

  // 3. Furniture Schedule & Fixtures Itemization
  const furnitureMap: Record<
    string,
    { name: string; category: string; count: number; unitPrice: number }
  > = {};

  furniture.forEach((item) => {
    const key = item.type || item.name || "furniture_item";
    const displayName = item.name || formatFurnitureKey(key);
    const category = item.category || "General";
    const price =
      customFurnitureRates[key] ||
      DEFAULT_FURNITURE_PRICES_USD[key] ||
      findFallbackFurniturePrice(displayName, category);

    if (!furnitureMap[key]) {
      furnitureMap[key] = {
        name: displayName,
        category,
        count: 0,
        unitPrice: price,
      };
    }
    furnitureMap[key].count += 1;
  });

  let totalFurnitureCount = 0;
  let totalFurnitureCost = 0;

  const furnitureItems: FurnitureLineItem[] = Object.entries(furnitureMap).map(
    ([id, entry]) => {
      const lineTotal = entry.count * entry.unitPrice;
      totalFurnitureCount += entry.count;
      totalFurnitureCost += lineTotal;

      return {
        id,
        name: entry.name,
        category: entry.category,
        quantity: entry.count,
        unitPrice: entry.unitPrice,
        total: Math.round(lineTotal * 100) / 100,
      };
    }
  );

  // 4. Summaries and Commercial Markups
  const subtotalMaterials = totalFlooringCost + totalWallFinishesCost + totalFurnitureCost;
  const laborCost = subtotalMaterials * (laborPercentage / 100);
  const contingencyCost = (subtotalMaterials + laborCost) * (contingencyPercentage / 100);
  const grandTotal = subtotalMaterials + laborCost + contingencyCost;

  return {
    currency,
    totalFloorAreaSqm: Math.round(totalFloorAreaSqm * 100) / 100,
    flooringItems,
    totalFlooringCost: Math.round(totalFlooringCost * 100) / 100,

    wallItems,
    totalNetWallAreaSqm: Math.round(totalNetWallAreaSqm * 100) / 100,
    totalPaintRequiredLiters: Math.round(totalPaintRequiredLiters * 10) / 10,
    totalWallFinishesCost: Math.round(totalWallFinishesCost * 100) / 100,

    furnitureItems,
    totalFurnitureCount,
    totalFurnitureCost: Math.round(totalFurnitureCost * 100) / 100,

    subtotalMaterials: Math.round(subtotalMaterials * 100) / 100,
    laborRatePercentage: laborPercentage,
    laborCost: Math.round(laborCost * 100) / 100,
    contingencyPercentage,
    contingencyCost: Math.round(contingencyCost * 100) / 100,

    grandTotal: Math.round(grandTotal * 100) / 100,
  };
}

/**
 * Helper to pretty-format raw furniture keys
 */
function formatFurnitureKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Fallback price resolver based on catalog keyword
 */
function findFallbackFurniturePrice(name: string, category: string): number {
  const n = (name || "").toLowerCase();
  if (n.includes("sofa")) return 750;
  if (n.includes("bed")) return 680;
  if (n.includes("table")) return 380;
  if (n.includes("chair")) return 110;
  if (n.includes("wardrobe") || n.includes("closet")) return 550;
  if (n.includes("island") || n.includes("kitchen")) return 720;
  if (n.includes("bath") || n.includes("tub")) return 650;
  if (category.toLowerCase().includes("office")) return 280;
  return 150;
}

/**
 * Export Bill of Quantities to CSV format for Excel/Spreadsheets
 */
export function exportBoQToCsv(
  boq: BoQSummary,
  projectName: string,
  floorName: string
): string {
  const c = boq.currency.code;
  const rows: string[] = [];

  // Header
  rows.push(`"RoomSketch Architectural Bill of Quantities (BoQ) & Cost Estimate"`);
  rows.push(`"Project:","${projectName}"`);
  rows.push(`"Floor Level:","${floorName}"`);
  rows.push(`"Currency:","${c}"`);
  rows.push(`"Generated:","${new Date().toISOString()}"`);
  rows.push("");

  // SECTION 1: Flooring
  rows.push(`"--- SECTION 1: FLOORING & SURFACE MATERIALS ---"`);
  rows.push(`"Room Name","Material","Net Area (sq.m)","Gross (+10% Waste)","Rate (${c})","Subtotal (${c})"`);
  boq.flooringItems.forEach((f) => {
    rows.push(
      `"${f.name}","${f.materialName}",${f.netAreaSqm},${f.grossAreaWithWastageSqm},${f.unitRate},${f.subtotal}`
    );
  });
  rows.push(`"Total Flooring",,,,,"${boq.totalFlooringCost}"`);
  rows.push("");

  // SECTION 2: Walls & Paint
  rows.push(`"--- SECTION 2: WALL FINISHES, PAINT & BASEBOARDS ---"`);
  rows.push(`"Room Name","Perimeter (m)","Ceiling (m)","Net Wall Area (sq.m)","Paint (Liters)","Skirting (m)","Subtotal (${c})"`);
  boq.wallItems.forEach((w) => {
    rows.push(
      `"${w.name}",${w.perimeterMeters},${w.ceilingHeightMeters},${w.netPaintableAreaSqm},${w.paintRequiredLiters},${w.skirtingLinearMeters},${w.subtotal}`
    );
  });
  rows.push(`"Total Wall Finishes",,,,,,"${boq.totalWallFinishesCost}"`);
  rows.push("");

  // SECTION 3: Furniture & Fixtures
  rows.push(`"--- SECTION 3: FURNITURE & FIXTURES SCHEDULE ---"`);
  rows.push(`"Item Description","Category","Quantity","Unit Price (${c})","Total Amount (${c})"`);
  boq.furnitureItems.forEach((item) => {
    rows.push(
      `"${item.name}","${item.category}",${item.quantity},${item.unitPrice},${item.total}`
    );
  });
  rows.push(`"Total Furniture & Fixtures",,,,"${boq.totalFurnitureCost}"`);
  rows.push("");

  // EXECUTIVE COMMERCIAL SUMMARY
  rows.push(`"--- EXECUTIVE FINANCIAL SUMMARY ---"`);
  rows.push(`"Subtotal Materials & Fixtures:","${boq.subtotalMaterials}"`);
  rows.push(`"Estimated Installation & Labor (${boq.laborRatePercentage}%):","${boq.laborCost}"`);
  rows.push(`"Contingency Buffer (${boq.contingencyPercentage}%):","${boq.contingencyCost}"`);
  rows.push(`"GRAND TOTAL ESTIMATED BUDGET:","${boq.grandTotal}"`);

  return rows.join("\n");
}
