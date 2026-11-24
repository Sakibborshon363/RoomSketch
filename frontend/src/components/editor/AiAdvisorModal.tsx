"use client";

import React, { useState, useMemo } from "react";
import { RoomItem, FurnitureItem, DoorWindowItem } from "@/types/editor";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  runArchitecturalAudit,
  generateAutoFurnishLayout,
  DesignStylePreset,
  ArchitecturalAuditReport,
  ErgonomicsIssue,
} from "@/lib/aiArchitectEngine";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Wand2,
  Layers,
  ArrowRight,
  MessageSquare,
  Compass,
  Palette,
  Lightbulb,
  Building,
  RefreshCw,
} from "lucide-react";

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  floorName: string;
  rooms: RoomItem[];
  doorsWindows: DoorWindowItem[];
  furniture: FurnitureItem[];
  onApplyAutoFurnish: (items: FurnitureItem[], roomName: string) => void;
}

const AI_CONSULTANT_TOPICS = [
  {
    title: "Egress & Corridor Standards",
    prompt: "What are the standard circulation and egress corridor clearances?",
    response:
      "Per International Building Code (IBC Section 1005) & Neufert Architectural Standards: Primary residential hallways require a minimum clear width of 90cm (36 inches). Main entryway door swings should maintain at least 90cm of unobstructed arc. Bedside circulation corridors should be at least 60cm–75cm on each side for unhindered movement and nightstand access.",
  },
  {
    title: "Kitchen Ergonomics & Work Triangle",
    prompt: "How should the kitchen work triangle (Sink, Stove, Refrigerator) be structured?",
    response:
      "The classic kitchen work triangle connects the Sink (prep/cleaning), Cooktop (cooking), and Refrigerator (storage). The sum of all three legs should be between 4.0m and 7.9m (13 to 26 feet). Never place a cooktop immediately adjacent to a sink without at least 60cm of prep countertop buffer to avoid water-splash grease hazards.",
  },
  {
    title: "Living Room Acoustics & Viewing Distance",
    prompt: "What is the optimal distance and angle between sofas and 4K TV displays?",
    response:
      "For a standard 55-65 inch 4K display, SMPTE standards recommend a viewing distance of 1.8m to 2.5m (6 to 8.2 feet) with a 30-degree field of view. Keep a coffee table 40cm–45cm from the sofa front edge for legroom and drink reachability.",
  },
  {
    title: "Passive Solar & Daylight Optimization",
    prompt: "How can I optimize natural daylight in open-concept spaces?",
    response:
      "Position living and working zones adjacent to primary south and east-facing apertures to maximize daylighting hours. Keep tall cabinetry, solid partitions, and wardrobes on internal, windowless walls to avoid casting deep shadows across central living corridors.",
  },
];

export function AiAdvisorModal({
  isOpen,
  onClose,
  projectName,
  floorName,
  rooms,
  doorsWindows,
  furniture,
  onApplyAutoFurnish,
}: AiAdvisorModalProps) {
  const [activeTab, setActiveTab] = useState<"audit" | "autofurnish" | "assistant">("audit");
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || "");
  const [selectedStyle, setSelectedStyle] = useState<DesignStylePreset>("SCANDINAVIAN");
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number>(0);
  const [autoFurnishSuccess, setAutoFurnishSuccess] = useState<string | null>(null);

  // Compute live architectural ergonomics audit
  const auditReport: ArchitecturalAuditReport = useMemo(() => {
    return runArchitecturalAudit(rooms, doorsWindows, furniture);
  }, [rooms, doorsWindows, furniture]);

  const targetRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  }, [rooms, selectedRoomId]);

  const handleApplyLayout = () => {
    if (!targetRoom) return;
    const generated = generateAutoFurnishLayout({
      room: targetRoom,
      style: selectedStyle,
    });

    onApplyAutoFurnish(generated, targetRoom.name);
    setAutoFurnishSuccess(
      `Successfully generated ${generated.length} coordinated architectural fixtures for "${targetRoom.name}"!`
    );
    setTimeout(() => setAutoFurnishSuccess(null), 4000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 75) return "text-teal-600 bg-teal-50 border-teal-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Architectural Design Assistant & Ergonomics Advisor">
      <div className="max-w-4xl max-h-[85vh] overflow-y-auto space-y-6 text-stone-800 pr-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "audit"
                ? "bg-[#1E3A34] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Ergonomics & Code Audit</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                auditReport.criticalCount > 0
                  ? "bg-rose-500 text-white"
                  : auditReport.warningCount > 0
                  ? "bg-amber-400 text-stone-900"
                  : "bg-emerald-400 text-stone-900"
              }`}
            >
              {auditReport.score}%
            </span>
          </button>

          <button
            onClick={() => setActiveTab("autofurnish")}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "autofurnish"
                ? "bg-[#1E3A34] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Wand2 className="h-4 w-4 text-purple-400" />
            <span>1-Click Auto-Furnish</span>
          </button>

          <button
            onClick={() => setActiveTab("assistant")}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "assistant"
                ? "bg-[#1E3A34] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <MessageSquare className="h-4 w-4 text-sky-400" />
            <span>Design Code Consultant</span>
          </button>
        </div>

        {/* TAB 1: ERGONOMICS & CODE AUDIT */}
        {activeTab === "audit" && (
          <div className="space-y-5">
            {/* Health Score Overview Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Compliance Score
                </span>
                <div
                  className={`text-3xl font-extrabold px-3 py-1 rounded-xl border ${getScoreColor(
                    auditReport.score
                  )}`}
                >
                  {auditReport.score}
                  <span className="text-sm font-semibold opacity-70">/100</span>
                </div>
                <span className="text-xs font-bold text-stone-700 mt-2">
                  Rating: {auditReport.rating}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-white flex flex-col justify-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Critical Violations
                </span>
                <span
                  className={`text-2xl font-extrabold mt-1 ${
                    auditReport.criticalCount > 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {auditReport.criticalCount}
                </span>
                <span className="text-[11px] text-stone-500 mt-0.5">
                  Door swings & egress blockages
                </span>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-white flex flex-col justify-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Ergonomic Warnings
                </span>
                <span
                  className={`text-2xl font-extrabold mt-1 ${
                    auditReport.warningCount > 0 ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  {auditReport.warningCount}
                </span>
                <span className="text-[11px] text-stone-500 mt-0.5">
                  Tight corridors & kitchen spacing
                </span>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-white flex flex-col justify-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Rooms Scanned
                </span>
                <span className="text-2xl font-extrabold text-stone-800 mt-1">
                  {rooms.length}
                </span>
                <span className="text-[11px] text-stone-500 mt-0.5">
                  {doorsWindows.length} apertures • {furniture.length} items
                </span>
              </div>
            </div>

            {/* Audit Issues List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#1E3A34]" />
                  <span>Audit Findings & Egress Recommendations</span>
                </h4>
                <span className="text-xs text-stone-400">
                  {auditReport.issues.length} item(s) detected
                </span>
              </div>

              {auditReport.issues.length === 0 ? (
                <div className="p-8 rounded-xl border border-emerald-200 bg-emerald-50/50 text-center space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                  <h5 className="text-sm font-bold text-emerald-900">
                    Architectural Layout Perfectly Compliant!
                  </h5>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    All doorway swing radii, bedside circulation corridors, appliance workspaces,
                    and TV viewing distances meet international architectural ergonomics standards.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {auditReport.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        issue.severity === "CRITICAL"
                          ? "border-rose-200 bg-rose-50/60"
                          : issue.severity === "WARNING"
                          ? "border-amber-200 bg-amber-50/50"
                          : "border-sky-200 bg-sky-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          {issue.severity === "CRITICAL" ? (
                            <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                          ) : issue.severity === "WARNING" ? (
                            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                          ) : (
                            <Info className="h-4 w-4 text-sky-600 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                  issue.severity === "CRITICAL"
                                    ? "bg-rose-200 text-rose-800"
                                    : issue.severity === "WARNING"
                                    ? "bg-amber-200 text-amber-900"
                                    : "bg-sky-200 text-sky-800"
                                }`}
                              >
                                {issue.severity}
                              </span>
                              <span className="text-xs font-bold text-stone-900">
                                {issue.title}
                              </span>
                            </div>
                            <p className="text-xs text-stone-600 mt-1">{issue.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation Box */}
                      <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-start gap-2 text-xs">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="text-stone-700">
                          <strong className="text-stone-900">Expert Action: </strong>
                          {issue.recommendation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: 1-CLICK AUTO-FURNISH */}
        {activeTab === "autofurnish" && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span>Algorithmic Spatial Auto-Furnishing</span>
              </div>
              <p className="text-xs text-purple-800 leading-relaxed">
                Our spatial placement engine detects the perimeter geometry of your selected room,
                calculates center axes and primary circulation corridors, and populates coordinated
                fixtures, lighting, and engineering points aligned with architectural ergonomics.
              </p>
            </div>

            {autoFurnishSuccess && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <span>{autoFurnishSuccess}</span>
              </div>
            )}

            {rooms.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 border border-dashed rounded-xl">
                No rooms found on this floor. Please draw or insert a room first.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Room Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-stone-500" />
                    <span>Select Target Room ({rooms.length})</span>
                  </label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full text-xs font-semibold rounded-lg border border-stone-200 bg-white p-2.5 focus:border-[#1E3A34] focus:outline-none"
                  >
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} ({((room.width * room.height) / 2500).toFixed(1)} m²)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Interior Style Preset Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-stone-500" />
                    <span>Design Style Preset</span>
                  </label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value as DesignStylePreset)}
                    className="w-full text-xs font-semibold rounded-lg border border-stone-200 bg-white p-2.5 focus:border-[#1E3A34] focus:outline-none"
                  >
                    <option value="SCANDINAVIAN">Scandinavian (Light Oak, Neutral Linen, Warm Brass)</option>
                    <option value="MODERN_MINIMAL">Modern Minimalist (Sleek Slate, Smoked Glass, Monochrome)</option>
                    <option value="EXECUTIVE_LUXURY">Executive Luxury (Walnut, Leather, Polished Chrome)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Layout Preview Summary */}
            {targetRoom && (
              <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">
                    Target: {targetRoom.name}
                  </span>
                  <span className="text-stone-500">
                    Floor Area: {((targetRoom.width * targetRoom.height) / 2500).toFixed(1)} m²
                  </span>
                </div>

                <div className="text-xs text-stone-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Ergonomic circulation buffer calculated automatically</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Integrates engineering fixtures (downlight, switch/power socket)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Preserves egress corridor clearance</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={handleApplyLayout}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs gap-2"
                  >
                    <Wand2 className="h-4 w-4" />
                    <span>Generate & Place Layout</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DESIGN CODE CONSULTANT */}
        {activeTab === "assistant" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 text-xs text-sky-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-sky-600" />
                <span>Interactive Building Code & Ergonomics Reference</span>
              </div>
              <p>
                Query verified international architectural standards (IBC, Neufert, ADA clearance, and
                ergonomic circulation guidelines) directly inside the workspace.
              </p>
            </div>

            {/* Quick Topic Chips */}
            <div className="flex flex-wrap gap-2">
              {AI_CONSULTANT_TOPICS.map((topic, idx) => (
                <button
                  key={topic.title}
                  onClick={() => setSelectedTopicIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedTopicIndex === idx
                      ? "bg-[#1E3A34] text-white shadow-xs"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {topic.title}
                </button>
              ))}
            </div>

            {/* Selected Topic Content */}
            <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 border-b border-stone-100 pb-2">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                <span>Q: {AI_CONSULTANT_TOPICS[selectedTopicIndex].prompt}</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                {AI_CONSULTANT_TOPICS[selectedTopicIndex].response}
              </p>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200 text-xs text-stone-500">
          <span>Project: {projectName} • Floor: {floorName}</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
