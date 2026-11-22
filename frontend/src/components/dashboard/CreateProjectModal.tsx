"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UnitSystem } from "@/types/editor";
import { Check, Compass, Sparkles, LayoutGrid, Square } from "lucide-react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, unitSystem: UnitSystem, templateId: string) => Promise<void>;
}

export function CreateProjectModal({ isOpen, onClose, onCreate }: CreateProjectModalProps) {
  const [name, setName] = useState("My New Floor Plan");
  const [description, setDescription] = useState("");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("METERS");
  const [templateId, setTemplateId] = useState("garden-apartment");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await onCreate(name.trim(), description.trim(), unitSystem, templateId);
      onClose();
      // Reset form
      setName("My New Floor Plan");
      setDescription("");
      setTemplateId("garden-apartment");
    } finally {
      setIsLoading(false);
    }
  };

  const templates = [
    {
      id: "garden-apartment",
      name: "The Garden Apartment",
      description: "85.3 m² with 5 rooms (Living, Bedroom, Kitchen, Entry, Bath) & curated furniture",
      badge: "Recommended",
      icon: Sparkles,
    },
    {
      id: "modern-studio",
      name: "Scandinavian Studio",
      description: "42.0 m² open studio with integrated sleeping quarters & ensuite bathroom",
      badge: "Compact",
      icon: LayoutGrid,
    },
    {
      id: "blank",
      name: "Blank Canvas",
      description: "Start from scratch with a custom rectangular perimeter and draw your walls",
      badge: "Custom",
      icon: Square,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Floor Plan" description="Choose a design template and unit system to start" className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5 mt-2">
        <Input
          id="projectName"
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. The Garden Apartment, Seaside Villa"
          required
        />

        <Input
          id="projectDesc"
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Master floor plan for family residence"
        />

        {/* Measurement Unit Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Default Measurement Unit
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: "METERS", label: "Meters (m)", sub: "Metric" },
              { id: "CENTIMETERS", label: "Centimeters (cm)", sub: "Metric" },
              { id: "FEET", label: "Feet & Inches (ft)", sub: "Imperial" },
            ].map((unit) => (
              <button
                key={unit.id}
                type="button"
                onClick={() => setUnitSystem(unit.id as UnitSystem)}
                className={`flex flex-col items-center justify-center rounded-xl p-2.5 border text-center transition-all ${
                  unitSystem === unit.id
                    ? "border-brand-600 bg-brand-50/70 text-brand-900 shadow-sm ring-1 ring-brand-500/30"
                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                }`}
              >
                <span className="text-xs font-bold">{unit.label}</span>
                <span className="text-[10px] text-stone-400 mt-0.5">{unit.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Template Selector Cards */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Select Starting Layout
          </label>
          <div className="space-y-2.5">
            {templates.map((tmpl) => {
              const Icon = tmpl.icon;
              const isSelected = templateId === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setTemplateId(tmpl.id)}
                  className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                    isSelected
                      ? "border-brand-600 bg-brand-50/50 shadow-sm ring-1 ring-brand-500/20"
                      : "border-stone-200 bg-white hover:bg-stone-50"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                      isSelected ? "bg-brand-600 text-white" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-stone-900">{tmpl.name}</h4>
                      <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{tmpl.description}</p>
                  </div>
                  <div className="pt-1">
                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-brand-600 bg-brand-600 text-white" : "border-stone-300"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className="font-semibold shadow-sm px-5">
            Create &amp; Open Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
