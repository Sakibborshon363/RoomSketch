"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  BuildingArchetype,
  generateAutomatedArchitecture,
  GeneratedStructurePlan,
} from "@/lib/aiStructureGenerator";
import {
  Sparkles,
  Building,
  Check,
  Layers,
  ArrowRight,
  ShieldCheck,
  Columns,
  Cpu,
} from "lucide-react";

interface AiPlanGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPlan: (plan: GeneratedStructurePlan) => void;
}

export function AiPlanGeneratorModal({
  isOpen,
  onClose,
  onApplyPlan,
}: AiPlanGeneratorModalProps) {
  const [selectedArchetype, setSelectedArchetype] =
    useState<BuildingArchetype>("RESIDENTIAL_COMPLEX_5S");
  const [autoFurnish, setAutoFurnish] = useState<boolean>(true);
  const [includeColumns, setIncludeColumns] = useState<boolean>(true);

  const archetypes: {
    id: BuildingArchetype;
    title: string;
    stories: number;
    tag: string;
    description: string;
    features: string[];
  }[] = [
    {
      id: "RESIDENTIAL_COMPLEX_5S",
      title: "5-Story Residential Complex (Blueprint Reference)",
      stories: 5,
      tag: "Multi-Unit Apartment",
      description:
        "Full 5-story building featuring 4 master bedrooms with attached verandahs, central void/stair core, dual drawing & dining halls, and ground entrance.",
      features: ["4 Master Suites with Balconies", "Central Ventilation Void", "Reinforced Stair Core", "IBC 1005 Egress Compliant"],
    },
    {
      id: "MODERN_DUPLEX_VILLA",
      title: "Modern Luxury Duplex Villa",
      stories: 2,
      tag: "Luxury Residential",
      description:
        "2-story luxury villa with grand double-height lounge, chef's island kitchen, covered garden verandah, spiral stair, and master suite.",
      features: ["Grand Double-Height Living", "Open Island Kitchen", "Covered Garden Verandah", "Architectural Stair Tower"],
    },
    {
      id: "CONTEMPORARY_3BED",
      title: "Contemporary 3-Bedroom Residence",
      stories: 1,
      tag: "Urban Apartment",
      description:
        "High-efficiency 3-bedroom urban apartment with open-plan living/dining room, master suite, daylight orientation, and zero circulation waste.",
      features: ["3 Dedicated Bedrooms", "Enclosed Chef Kitchen", "Daylight Balcony", "Optimized Corridor Clearance"],
    },
  ];

  const handleGenerate = () => {
    const plan = generateAutomatedArchitecture(selectedArchetype);
    if (!autoFurnish) {
      plan.furniture = [];
    }
    if (!includeColumns) {
      plan.structuralColumns = [];
    }
    onApplyPlan(plan);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Automated 2D Plan & Structure Generator"
      description="Select an architectural building archetype to automatically generate complete 2D floor plans, load-bearing walls, structural columns, doors, and furniture in 1 click."
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* Archetype Cards */}
        <div className="space-y-2.5">
          {archetypes.map((arch) => (
            <div
              key={arch.id}
              onClick={() => setSelectedArchetype(arch.id)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedArchetype === arch.id
                  ? "border-[#1E3A34] bg-emerald-50/50 shadow-sm ring-1 ring-[#1E3A34]"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase text-stone-500">
                  {arch.tag}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {arch.stories} {arch.stories === 1 ? "Story" : "Stories"}
                </span>
              </div>
              <h4 className="text-sm font-bold text-stone-900 leading-tight">
                {arch.title}
              </h4>
              <p className="text-xs text-stone-600 mt-1">{arch.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {arch.features.map((feat, fi) => (
                  <span
                    key={fi}
                    className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium"
                  >
                    • {feat}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Options: Auto-furnish & Structural Columns */}
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={autoFurnish}
              onChange={(e) => setAutoFurnish(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-[#1E3A34] focus:ring-[#1E3A34]"
            />
            <span>Auto-populate with ergonomic furniture (0 Collisions guaranteed)</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={includeColumns}
              onChange={(e) => setIncludeColumns(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-[#1E3A34] focus:ring-[#1E3A34]"
            />
            <span>Generate structural reinforced concrete column grid (30x30cm)</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleGenerate}
            className="bg-[#1E3A34] hover:bg-[#254A42] text-white font-bold gap-2 shadow-md text-xs py-2 px-4"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Generate 2D Plan & Structure (1-Click)</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
