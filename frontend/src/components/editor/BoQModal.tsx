"use client";

import React, { useState, useMemo } from "react";
import { RoomItem, FurnitureItem, DoorWindowItem, UnitSystem } from "@/types/editor";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  calculateProjectBoQ,
  exportBoQToCsv,
  formatCurrency,
  SUPPORTED_CURRENCIES,
  CurrencyCode,
  BoQSummary,
} from "@/lib/boqEngine";
import {
  Calculator,
  Download,
  DollarSign,
  Paintbrush,
  Layers,
  Armchair,
  FileSpreadsheet,
  Check,
  TrendingUp,
  Percent,
  Ruler,
  ChevronRight,
  Info,
} from "lucide-react";

interface BoQModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  floorName: string;
  rooms: RoomItem[];
  doorsWindows: DoorWindowItem[];
  furniture: FurnitureItem[];
  unit: UnitSystem;
}

export function BoQModal({
  isOpen,
  onClose,
  projectName,
  floorName,
  rooms,
  doorsWindows,
  furniture,
  unit,
}: BoQModalProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "flooring" | "walls" | "furniture">("summary");
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>("USD");
  const [ceilingHeight, setCeilingHeight] = useState<number>(2.8);
  const [laborPercentage, setLaborPercentage] = useState<number>(18);
  const [contingencyPercentage, setContingencyPercentage] = useState<number>(8);
  const [copiedCsv, setCopiedCsv] = useState(false);

  // Calculate live BoQ summary
  const boq: BoQSummary = useMemo(() => {
    return calculateProjectBoQ({
      rooms,
      doorsWindows,
      furniture,
      ceilingHeight,
      currencyCode,
      laborPercentage,
      contingencyPercentage,
    });
  }, [rooms, doorsWindows, furniture, ceilingHeight, currencyCode, laborPercentage, contingencyPercentage]);

  // Handle CSV Download
  const handleDownloadCsv = () => {
    const csvContent = exportBoQToCsv(boq, projectName, floorName);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${projectName.toLowerCase().replace(/\s+/g, "_")}_${floorName.toLowerCase().replace(/\s+/g, "_")}_BoQ_Estimate.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Architectural Cost Estimator & Bill of Quantities (BoQ)"
      className="max-w-4xl max-h-[90vh] overflow-y-auto"
    >
      <div className="flex flex-col gap-6">
        {/* Top Overview KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5">
            <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
              <DollarSign className="h-4 w-4 text-emerald-600" /> Grand Total Budget
            </div>
            <p className="mt-1.5 text-xl font-black text-stone-900">
              {formatCurrency(boq.grandTotal, currencyCode)}
            </p>
            <span className="text-[10px] text-stone-400 font-medium">Incl. labor & contingency</span>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5">
            <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
              <Layers className="h-4 w-4 text-brand-600" /> Flooring Materials
            </div>
            <p className="mt-1.5 text-xl font-black text-stone-900">
              {formatCurrency(boq.totalFlooringCost, currencyCode)}
            </p>
            <span className="text-[10px] text-stone-400 font-medium">
              {boq.totalFloorAreaSqm} m² (+10% cut waste)
            </span>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5">
            <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
              <Paintbrush className="h-4 w-4 text-amber-600" /> Walls & Paint
            </div>
            <p className="mt-1.5 text-xl font-black text-stone-900">
              {formatCurrency(boq.totalWallFinishesCost, currencyCode)}
            </p>
            <span className="text-[10px] text-stone-400 font-medium">
              {boq.totalPaintRequiredLiters} L paint required
            </span>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5">
            <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold">
              <Armchair className="h-4 w-4 text-indigo-600" /> Furniture & Fixtures
            </div>
            <p className="mt-1.5 text-xl font-black text-stone-900">
              {formatCurrency(boq.totalFurnitureCost, currencyCode)}
            </p>
            <span className="text-[10px] text-stone-400 font-medium">
              {boq.totalFurnitureCount} catalog items
            </span>
          </div>
        </div>

        {/* Global Parameter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-xs">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Currency Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-600">Currency:</span>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
                className="rounded-lg border border-stone-300 bg-stone-50 px-2 py-1 font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A34]"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Ceiling Height */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-600">Ceiling Height:</span>
              <input
                type="number"
                step="0.1"
                min="2.0"
                max="5.0"
                value={ceilingHeight}
                onChange={(e) => setCeilingHeight(parseFloat(e.target.value) || 2.8)}
                className="w-16 rounded-lg border border-stone-300 bg-stone-50 px-2 py-1 text-center font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A34]"
              />
              <span className="text-stone-400">m</span>
            </div>

            {/* Labor Rate % */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-600">Labor:</span>
              <input
                type="number"
                min="0"
                max="50"
                value={laborPercentage}
                onChange={(e) => setLaborPercentage(parseInt(e.target.value) || 0)}
                className="w-14 rounded-lg border border-stone-300 bg-stone-50 px-2 py-1 text-center font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A34]"
              />
              <span className="text-stone-400">%</span>
            </div>

            {/* Contingency % */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-600">Contingency:</span>
              <input
                type="number"
                min="0"
                max="30"
                value={contingencyPercentage}
                onChange={(e) => setContingencyPercentage(parseInt(e.target.value) || 0)}
                className="w-14 rounded-lg border border-stone-300 bg-stone-50 px-2 py-1 text-center font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#1E3A34]"
              />
              <span className="text-stone-400">%</span>
            </div>
          </div>

          {/* Action: Export CSV */}
          <Button
            size="sm"
            onClick={handleDownloadCsv}
            className="bg-[#1E3A34] hover:bg-[#254A42] text-white text-xs font-bold gap-1.5 shadow-xs"
          >
            {copiedCsv ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
            {copiedCsv ? "CSV Downloaded!" : "Export CSV Schedule"}
          </Button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab("summary")}
            className={`pb-2.5 px-4 border-b-2 transition-all ${
              activeTab === "summary"
                ? "border-[#1E3A34] text-[#1E3A34]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Executive Summary
          </button>
          <button
            onClick={() => setActiveTab("flooring")}
            className={`pb-2.5 px-4 border-b-2 transition-all ${
              activeTab === "flooring"
                ? "border-[#1E3A34] text-[#1E3A34]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Flooring ({boq.flooringItems.length})
          </button>
          <button
            onClick={() => setActiveTab("walls")}
            className={`pb-2.5 px-4 border-b-2 transition-all ${
              activeTab === "walls"
                ? "border-[#1E3A34] text-[#1E3A34]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Walls & Finishes
          </button>
          <button
            onClick={() => setActiveTab("furniture")}
            className={`pb-2.5 px-4 border-b-2 transition-all ${
              activeTab === "furniture"
                ? "border-[#1E3A34] text-[#1E3A34]"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            Furniture Schedule ({boq.totalFurnitureCount})
          </button>
        </div>

        {/* TAB 1: SUMMARY */}
        {activeTab === "summary" && (
          <div className="flex flex-col gap-5 text-sm">
            {/* Visual Budget Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-stone-600 mb-1.5">
                <span>Budget Distribution</span>
                <span>100% Allocated</span>
              </div>
              <div className="h-3.5 w-full rounded-full bg-stone-100 overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${(boq.totalFlooringCost / (boq.grandTotal || 1)) * 100}%` }}
                  className="bg-emerald-600"
                  title="Flooring"
                />
                <div
                  style={{ width: `${(boq.totalWallFinishesCost / (boq.grandTotal || 1)) * 100}%` }}
                  className="bg-amber-500"
                  title="Walls & Paint"
                />
                <div
                  style={{ width: `${(boq.totalFurnitureCost / (boq.grandTotal || 1)) * 100}%` }}
                  className="bg-indigo-600"
                  title="Furniture"
                />
                <div
                  style={{ width: `${(boq.laborCost / (boq.grandTotal || 1)) * 100}%` }}
                  className="bg-stone-500"
                  title="Labor"
                />
                <div
                  style={{ width: `${(boq.contingencyCost / (boq.grandTotal || 1)) * 100}%` }}
                  className="bg-rose-400"
                  title="Contingency"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-stone-500">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-600" /> Flooring ({Math.round((boq.totalFlooringCost / (boq.grandTotal || 1)) * 100)}%)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Walls ({Math.round((boq.totalWallFinishesCost / (boq.grandTotal || 1)) * 100)}%)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-600" /> Furniture ({Math.round((boq.totalFurnitureCost / (boq.grandTotal || 1)) * 100)}%)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-stone-500" /> Labor ({Math.round((boq.laborCost / (boq.grandTotal || 1)) * 100)}%)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" /> Contingency ({Math.round((boq.contingencyCost / (boq.grandTotal || 1)) * 100)}%)</span>
              </div>
            </div>

            {/* Financial Ledger Table */}
            <div className="rounded-xl border border-stone-200 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 border-b border-stone-200">
                    <th className="py-2.5 px-4 font-bold">Category</th>
                    <th className="py-2.5 px-4 font-bold">Scope / Specification</th>
                    <th className="py-2.5 px-4 font-bold text-right">Cost ({currencyCode})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-stone-900 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-emerald-600" /> 1.0 Flooring Materials
                    </td>
                    <td className="py-2.5 px-4 text-stone-500">
                      {boq.flooringItems.length} rooms, {boq.totalFloorAreaSqm} m² net area (+10% cut allowance)
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900">
                      {formatCurrency(boq.totalFlooringCost, currencyCode)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-stone-900 flex items-center gap-1.5">
                      <Paintbrush className="h-3.5 w-3.5 text-amber-600" /> 2.0 Wall Finishes & Paint
                    </td>
                    <td className="py-2.5 px-4 text-stone-500">
                      {boq.totalNetWallAreaSqm} m² paintable surface, {boq.totalPaintRequiredLiters}L paint, baseboards
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900">
                      {formatCurrency(boq.totalWallFinishesCost, currencyCode)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-stone-900 flex items-center gap-1.5">
                      <Armchair className="h-3.5 w-3.5 text-indigo-600" /> 3.0 Furniture & Fixtures
                    </td>
                    <td className="py-2.5 px-4 text-stone-500">
                      {boq.totalFurnitureCount} catalog items (Living, Bed, Dining, Kitchen, Bath)
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900">
                      {formatCurrency(boq.totalFurnitureCost, currencyCode)}
                    </td>
                  </tr>
                  <tr className="bg-stone-50/50 font-bold">
                    <td className="py-2.5 px-4 text-stone-800" colSpan={2}>
                      Subtotal Materials & Fixtures
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-stone-900">
                      {formatCurrency(boq.subtotalMaterials, currencyCode)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-stone-700">
                      4.0 Trade Labor & Installation ({boq.laborRatePercentage}%)
                    </td>
                    <td className="py-2.5 px-4 text-stone-500">
                      Flooring installation, drywall patching, 2-coat painting, furniture assembly
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-stone-800">
                      {formatCurrency(boq.laborCost, currencyCode)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-stone-700">
                      5.0 Project Contingency ({boq.contingencyPercentage}%)
                    </td>
                    <td className="py-2.5 px-4 text-stone-500">
                      Site unforeseen issues, delivery buffers, material variances
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-stone-800">
                      {formatCurrency(boq.contingencyCost, currencyCode)}
                    </td>
                  </tr>
                  <tr className="bg-[#1E3A34]/5 border-t-2 border-[#1E3A34] text-sm font-black text-[#1E3A34]">
                    <td className="py-3 px-4" colSpan={2}>
                      ESTIMATED TOTAL TURNKEY BUDGET
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-base font-black">
                      {formatCurrency(boq.grandTotal, currencyCode)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: FLOORING */}
        {activeTab === "flooring" && (
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-600 border-b border-stone-200">
                  <th className="py-2.5 px-4 font-bold">Room</th>
                  <th className="py-2.5 px-4 font-bold">Selected Material</th>
                  <th className="py-2.5 px-4 font-bold text-right">Net Area</th>
                  <th className="py-2.5 px-4 font-bold text-right">Gross (+10% Cut)</th>
                  <th className="py-2.5 px-4 font-bold text-right">Unit Rate ({currencyCode}/m²)</th>
                  <th className="py-2.5 px-4 font-bold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {boq.flooringItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-stone-400">
                      No rooms found on this floor. Draw a room to estimate flooring.
                    </td>
                  </tr>
                ) : (
                  boq.flooringItems.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/70">
                      <td className="py-2.5 px-4 font-bold text-stone-900">{item.name}</td>
                      <td className="py-2.5 px-4 text-stone-600">{item.materialName}</td>
                      <td className="py-2.5 px-4 text-right font-mono">{item.netAreaSqm} m²</td>
                      <td className="py-2.5 px-4 text-right font-mono font-medium text-stone-800">
                        {item.grossAreaWithWastageSqm} m²
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono">{formatCurrency(item.unitRate, currencyCode)}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900">
                        {formatCurrency(item.subtotal, currencyCode)}
                      </td>
                    </tr>
                  ))
                )}
                <tr className="bg-stone-50 font-bold border-t border-stone-200">
                  <td className="py-2.5 px-4 text-stone-900" colSpan={2}>
                    Total Flooring
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-stone-900">{boq.totalFloorAreaSqm} m²</td>
                  <td className="py-2.5 px-4 text-right font-mono" colSpan={2}>—</td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-700 font-bold">
                    {formatCurrency(boq.totalFlooringCost, currencyCode)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: WALLS & FINISHES */}
        {activeTab === "walls" && (
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-600 border-b border-stone-200">
                  <th className="py-2.5 px-4 font-bold">Room</th>
                  <th className="py-2.5 px-4 font-bold text-right">Perimeter</th>
                  <th className="py-2.5 px-4 font-bold text-right">Gross Wall</th>
                  <th className="py-2.5 px-4 font-bold text-right">Aperture Cut</th>
                  <th className="py-2.5 px-4 font-bold text-right">Net Paintable</th>
                  <th className="py-2.5 px-4 font-bold text-right">Paint Req.</th>
                  <th className="py-2.5 px-4 font-bold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {boq.wallItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-stone-400">
                      No rooms found on this floor.
                    </td>
                  </tr>
                ) : (
                  boq.wallItems.map((w) => (
                    <tr key={w.id} className="hover:bg-stone-50/70">
                      <td className="py-2.5 px-4 font-bold text-stone-900">{w.name}</td>
                      <td className="py-2.5 px-4 text-right font-mono">{w.perimeterMeters} m</td>
                      <td className="py-2.5 px-4 text-right font-mono">{w.grossWallAreaSqm} m²</td>
                      <td className="py-2.5 px-4 text-right font-mono text-rose-600">-{w.openingsDeductionSqm} m²</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900">
                        {w.netPaintableAreaSqm} m²
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-amber-700 font-semibold">
                        {w.paintRequiredLiters} L
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900">
                        {formatCurrency(w.subtotal, currencyCode)}
                      </td>
                    </tr>
                  ))
                )}
                <tr className="bg-stone-50 font-bold border-t border-stone-200">
                  <td className="py-2.5 px-4 text-stone-900" colSpan={4}>
                    Total Wall Finishes & Baseboards
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono">{boq.totalNetWallAreaSqm} m²</td>
                  <td className="py-2.5 px-4 text-right font-mono text-amber-700">{boq.totalPaintRequiredLiters} L</td>
                  <td className="py-2.5 px-4 text-right font-mono text-amber-700 font-bold">
                    {formatCurrency(boq.totalWallFinishesCost, currencyCode)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: FURNITURE SCHEDULE */}
        {activeTab === "furniture" && (
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-600 border-b border-stone-200">
                  <th className="py-2.5 px-4 font-bold">Item Description</th>
                  <th className="py-2.5 px-4 font-bold">Category</th>
                  <th className="py-2.5 px-4 font-bold text-center">Qty</th>
                  <th className="py-2.5 px-4 font-bold text-right">Unit Price ({currencyCode})</th>
                  <th className="py-2.5 px-4 font-bold text-right">Extended Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {boq.furnitureItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-400">
                      No furniture placed on this floor plan yet.
                    </td>
                  </tr>
                ) : (
                  boq.furnitureItems.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/70">
                      <td className="py-2.5 px-4 font-bold text-stone-900">{item.name}</td>
                      <td className="py-2.5 px-4">
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-stone-800">{item.quantity}</td>
                      <td className="py-2.5 px-4 text-right font-mono">{formatCurrency(item.unitPrice, currencyCode)}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900">
                        {formatCurrency(item.total, currencyCode)}
                      </td>
                    </tr>
                  ))
                )}
                <tr className="bg-stone-50 font-bold border-t border-stone-200">
                  <td className="py-2.5 px-4 text-stone-900" colSpan={2}>
                    Total Furniture & Fixtures Schedule
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono text-stone-900">{boq.totalFurnitureCount}</td>
                  <td className="py-2.5 px-4 text-right font-mono">—</td>
                  <td className="py-2.5 px-4 text-right font-mono text-indigo-700 font-bold">
                    {formatCurrency(boq.totalFurnitureCost, currencyCode)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Note */}
        <div className="flex items-center gap-2 rounded-lg bg-stone-50 px-3.5 py-2.5 text-[11px] text-stone-500 border border-stone-200/80">
          <Info className="h-4 w-4 text-stone-400 shrink-0" />
          <span>
            Unit prices reflect standard commercial architectural averages. Actual contractor pricing may vary by region and installation complexity.
          </span>
        </div>
      </div>
    </Modal>
  );
}
