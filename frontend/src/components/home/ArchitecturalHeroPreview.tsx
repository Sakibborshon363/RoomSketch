"use client";

import React, { useState } from "react";
import {
  Compass,
  LayoutGrid,
  Ruler,
  Maximize2,
  CheckCircle,
  Zap,
  Layers,
  Sparkles,
  MousePointer,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ArchitecturalHeroPreviewProps {
  onOpenEditor: () => void;
  isLoading?: boolean;
}

export function ArchitecturalHeroPreview({
  onOpenEditor,
  isLoading = false,
}: ArchitecturalHeroPreviewProps) {
  const [activeTab, setActiveTab] = useState<"full" | "living" | "bedroom" | "kitchen">("full");
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  return (
    <div className="mt-12 mx-auto max-w-5xl rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xl shadow-slate-200/60">
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-900/5 p-4 sm:p-8 relative">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Interactive Architectural Blueprint • Level 01
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              The Coastal Residence — 57.5 m² Master Floor Plan
            </h3>
          </div>

          {/* View Tab Selector */}
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("full")}
              className={`rounded-md px-3 py-1.5 transition-all ${
                activeTab === "full"
                  ? "bg-white text-brand-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Full Residence
            </button>
            <button
              onClick={() => setActiveTab("living")}
              className={`rounded-md px-3 py-1.5 transition-all ${
                activeTab === "living"
                  ? "bg-white text-brand-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Living Room
            </button>
            <button
              onClick={() => setActiveTab("bedroom")}
              className={`rounded-md px-3 py-1.5 transition-all ${
                activeTab === "bedroom"
                  ? "bg-white text-brand-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Master Bedroom
            </button>
            <button
              onClick={() => setActiveTab("kitchen")}
              className={`rounded-md px-3 py-1.5 transition-all ${
                activeTab === "kitchen"
                  ? "bg-white text-brand-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Kitchen & Dining
            </button>
          </div>
        </div>

        {/* Blueprint Canvas View */}
        <div className="relative mt-6 rounded-xl bg-[#F8FAF9] border border-stone-200 overflow-hidden shadow-inner group">
          {/* Architectural Blueprint Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.45]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #CBD5E1 1px, transparent 1px), linear-gradient(to bottom, #CBD5E1 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Interactive Full Residence Blueprint */}
          {activeTab === "full" && (
            <div className="p-4 sm:p-8 flex items-center justify-center relative">
              <svg
                viewBox="0 0 800 480"
                className="w-full h-auto max-h-[460px] drop-shadow-md select-none transition-transform duration-300"
              >
                {/* Exterior Wall Thick Border */}
                <rect x="50" y="40" width="700" height="400" rx="4" fill="#1E293B" />
                <rect x="58" y="48" width="684" height="384" rx="2" fill="#FFFFFF" />

                {/* ============================================================ */}
                {/* 1. LIVING ROOM (Left Wing: 380x250) */}
                {/* ============================================================ */}
                <g
                  onMouseEnter={() => setHoveredRoom("living")}
                  onMouseLeave={() => setHoveredRoom(null)}
                  className="cursor-pointer transition-opacity"
                >
                  {/* Floor Fill */}
                  <rect
                    x="58"
                    y="48"
                    width="380"
                    height="240"
                    fill={hoveredRoom === "living" ? "#F5EFE6" : "#FAF6F0"}
                    className="transition-colors duration-200"
                  />
                  {/* Subtle Wood Parquet Lines */}
                  <line x1="58" y1="96" x2="438" y2="96" stroke="#EFE6DA" strokeWidth="1" />
                  <line x1="58" y1="144" x2="438" y2="144" stroke="#EFE6DA" strokeWidth="1" />
                  <line x1="58" y1="192" x2="438" y2="192" stroke="#EFE6DA" strokeWidth="1" />
                  <line x1="58" y1="240" x2="438" y2="240" stroke="#EFE6DA" strokeWidth="1" />

                  {/* Room Label Badge */}
                  <rect x="74" y="62" width="130" height="26" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
                  <text x="82" y="79" fill="#1E293B" fontSize="11" fontWeight="700" fontFamily="sans-serif">
                    LIVING ROOM
                  </text>
                  <text x="166" y="79" fill="#059669" fontSize="10" fontWeight="700" fontFamily="sans-serif">
                    24.5 m²
                  </text>

                  {/* Furniture: Modern 3-Seater Sofa */}
                  <g transform="translate(130, 95)">
                    {/* Area Rug */}
                    <rect x="-15" y="-15" width="220" height="150" rx="8" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 3" />
                    {/* Sofa Frame */}
                    <rect x="0" y="0" width="190" height="65" rx="10" fill="#334155" />
                    {/* Sofa Seat Cushions */}
                    <rect x="22" y="8" width="46" height="48" rx="6" fill="#475569" stroke="#1E293B" strokeWidth="1" />
                    <rect x="72" y="8" width="46" height="48" rx="6" fill="#475569" stroke="#1E293B" strokeWidth="1" />
                    <rect x="122" y="8" width="46" height="48" rx="6" fill="#475569" stroke="#1E293B" strokeWidth="1" />
                    {/* Armrests */}
                    <rect x="4" y="5" width="14" height="55" rx="4" fill="#1E293B" />
                    <rect x="172" y="5" width="14" height="55" rx="4" fill="#1E293B" />
                    {/* Coffee Table */}
                    <rect x="40" y="80" width="110" height="42" rx="6" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
                    <circle cx="95" cy="101" r="8" fill="#E2E8F0" />
                  </g>

                  {/* Media Wall Console */}
                  <rect x="120" y="272" width="180" height="14" rx="2" fill="#475569" />
                  <rect x="150" y="275" width="120" height="4" rx="1" fill="#0EA5E9" />

                  {/* Balcony Double Door Glass Slider */}
                  <rect x="54" y="110" width="8" height="90" fill="#0284C7" />
                  <line x1="58" y1="155" x2="78" y2="155" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 3" />
                </g>

                {/* ============================================================ */}
                {/* 2. MASTER BEDROOM (Right Wing Top: 304x240) */}
                {/* ============================================================ */}
                <g
                  onMouseEnter={() => setHoveredRoom("bedroom")}
                  onMouseLeave={() => setHoveredRoom(null)}
                  className="cursor-pointer transition-opacity"
                >
                  {/* Floor Fill */}
                  <rect
                    x="438"
                    y="48"
                    width="304"
                    height="240"
                    fill={hoveredRoom === "bedroom" ? "#ECE5D8" : "#F4EFE6"}
                    className="transition-colors duration-200"
                  />

                  {/* Room Label Badge */}
                  <rect x="454" y="62" width="150" height="26" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
                  <text x="462" y="79" fill="#1E293B" fontSize="11" fontWeight="700" fontFamily="sans-serif">
                    MASTER BEDROOM
                  </text>
                  <text x="568" y="79" fill="#059669" fontSize="10" fontWeight="700" fontFamily="sans-serif">
                    18.2 m²
                  </text>

                  {/* King Bed with Nightstands */}
                  <g transform="translate(510, 95)">
                    {/* Headboard */}
                    <rect x="10" y="0" width="140" height="14" rx="3" fill="#334155" />
                    {/* Bed Mattress */}
                    <rect x="15" y="14" width="130" height="135" rx="6" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
                    {/* Dual Pillows */}
                    <rect x="25" y="20" width="48" height="26" rx="4" fill="#F1F5F9" stroke="#CBD5E1" />
                    <rect x="87" y="20" width="48" height="26" rx="4" fill="#F1F5F9" stroke="#CBD5E1" />
                    {/* Duvet / Quilt */}
                    <rect x="15" y="65" width="130" height="84" rx="4" fill="#E2E8F0" />
                    {/* Left Nightstand */}
                    <rect x="-16" y="2" width="22" height="28" rx="3" fill="#E2E8F0" stroke="#94A3B8" />
                    <circle cx="-5" cy="16" r="4" fill="#F59E0B" />
                    {/* Right Nightstand */}
                    <rect x="154" y="2" width="22" height="28" rx="3" fill="#E2E8F0" stroke="#94A3B8" />
                    <circle cx="165" cy="16" r="4" fill="#F59E0B" />
                  </g>

                  {/* Built-in Wardrobe Closet */}
                  <rect x="692" y="90" width="46" height="150" rx="2" fill="#E2E8F0" stroke="#94A3B8" />
                  <line x1="715" y1="90" x2="715" y2="240" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="702" y="170" fill="#64748B" fontSize="9" fontWeight="600" transform="rotate(-90 702 170)">
                    WARDROBE
                  </text>

                  {/* Window on top wall */}
                  <rect x="530" y="44" width="90" height="8" fill="#38BDF8" />
                </g>

                {/* ============================================================ */}
                {/* 3. KITCHEN & DINING (Bottom Left: 380x144) */}
                {/* ============================================================ */}
                <g
                  onMouseEnter={() => setHoveredRoom("kitchen")}
                  onMouseLeave={() => setHoveredRoom(null)}
                  className="cursor-pointer transition-opacity"
                >
                  {/* Floor Fill */}
                  <rect
                    x="58"
                    y="288"
                    width="380"
                    height="144"
                    fill={hoveredRoom === "kitchen" ? "#EAF2EF" : "#F0F6F4"}
                    className="transition-colors duration-200"
                  />

                  {/* Room Label Badge */}
                  <rect x="74" y="300" width="150" height="26" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
                  <text x="82" y="317" fill="#1E293B" fontSize="11" fontWeight="700" fontFamily="sans-serif">
                    KITCHEN & DINING
                  </text>
                  <text x="188" y="317" fill="#059669" fontSize="10" fontWeight="700" fontFamily="sans-serif">
                    14.8 m²
                  </text>

                  {/* L-Shaped Kitchen Countertop */}
                  <path d="M 58 350 L 150 350 L 150 432 L 58 432 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
                  {/* Sink Double Basin */}
                  <rect x="66" y="360" width="28" height="38" rx="2" fill="#FFFFFF" stroke="#94A3B8" />
                  <rect x="98" y="360" width="28" height="38" rx="2" fill="#FFFFFF" stroke="#94A3B8" />
                  <circle cx="96" cy="379" r="3" fill="#64748B" />
                  {/* Induction Cooktop (4 Burners) */}
                  <rect x="66" y="405" width="60" height="22" rx="2" fill="#1E293B" />
                  <circle cx="78" cy="416" r="5" fill="#EF4444" />
                  <circle cx="94" cy="416" r="4" fill="#F97316" />
                  <circle cx="110" cy="416" r="5" fill="#EF4444" />

                  {/* 4-Person Dining Table */}
                  <g transform="translate(230, 320)">
                    {/* Table Surface */}
                    <rect x="20" y="20" width="110" height="60" rx="6" fill="#D97706" opacity="0.85" />
                    <rect x="24" y="24" width="102" height="52" rx="4" fill="#FDE68A" />
                    {/* Top Chairs */}
                    <rect x="35" y="4" width="30" height="12" rx="3" fill="#475569" />
                    <rect x="85" y="4" width="30" height="12" rx="3" fill="#475569" />
                    {/* Bottom Chairs */}
                    <rect x="35" y="84" width="30" height="12" rx="3" fill="#475569" />
                    <rect x="85" y="84" width="30" height="12" rx="3" fill="#475569" />
                  </g>
                </g>

                {/* ============================================================ */}
                {/* 4. BATHROOM & ENTRY (Bottom Right: 304x144) */}
                {/* ============================================================ */}
                <g>
                  {/* Bathroom Floor */}
                  <rect x="438" y="288" width="160" height="144" fill="#E8F1F2" />
                  <rect x="446" y="300" width="100" height="24" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
                  <text x="452" y="316" fill="#1E293B" fontSize="10" fontWeight="700" fontFamily="sans-serif">
                    BATHROOM
                  </text>
                  <text x="520" y="316" fill="#059669" fontSize="9" fontWeight="700" fontFamily="sans-serif">
                    6.2 m²
                  </text>
                  {/* Bathtub / Shower */}
                  <rect x="446" y="340" width="60" height="84" rx="8" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
                  <circle cx="476" cy="355" r="4" fill="#0284C7" />
                  {/* Vanity & Toilet */}
                  <rect x="540" y="340" width="46" height="30" rx="3" fill="#FFFFFF" stroke="#94A3B8" />
                  <ellipse cx="563" cy="405" rx="14" ry="18" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />

                  {/* Foyer / Entrance Hallway */}
                  <rect x="598" y="288" width="144" height="144" fill="#F1F5F9" />
                  <rect x="608" y="300" width="80" height="24" rx="4" fill="#FFFFFF" stroke="#E2E8F0" />
                  <text x="616" y="316" fill="#1E293B" fontSize="10" fontWeight="700" fontFamily="sans-serif">
                    FOYER
                  </text>
                  {/* Main Entry Door with 90° Swing Arc */}
                  <path d="M 680 432 A 45 45 0 0 1 725 387" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="680" y1="432" x2="725" y2="432" stroke="#2563EB" strokeWidth="3" />
                  <text x="640" y="424" fill="#2563EB" fontSize="10" fontWeight="700">
                    ENTRY ↗
                  </text>
                </g>

                {/* ============================================================ */}
                {/* INTERIOR PARTITION WALLS (Thick Architectural Lines) */}
                {/* ============================================================ */}
                {/* Vertical Main Dividing Wall */}
                <rect x="434" y="48" width="8" height="384" fill="#1E293B" />
                {/* Horizontal Wall dividing Living and Kitchen */}
                <rect x="58" y="284" width="380" height="8" fill="#1E293B" />
                {/* Horizontal Wall dividing Bedroom and Bath */}
                <rect x="434" y="284" width="308" height="8" fill="#1E293B" />
                {/* Vertical Wall dividing Bath and Foyer */}
                <rect x="594" y="284" width="8" height="148" fill="#1E293B" />

                {/* Interior Doorway Openings & Swings */}
                {/* Door: Foyer into Living */}
                <path d="M 434 220 A 40 40 0 0 0 394 260" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3 3" />
                <rect x="434" y="220" width="8" height="40" fill="#FAF6F0" />

                {/* Door: Foyer into Bedroom */}
                <path d="M 434 160 A 40 40 0 0 1 474 200" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3 3" />
                <rect x="434" y="160" width="8" height="40" fill="#F4EFE6" />

                {/* ============================================================ */}
                {/* ARCHITECTURAL DIMENSION LINES */}
                {/* ============================================================ */}
                {/* Top Dimension: 12.00 m Total Width */}
                <g stroke="#64748B" strokeWidth="1">
                  <line x1="58" y1="26" x2="742" y2="26" />
                  <line x1="58" y1="20" x2="58" y2="32" />
                  <line x1="742" y1="20" x2="742" y2="32" />
                  <text x="370" y="22" fill="#475569" fontSize="10" fontWeight="700" textAnchor="middle" stroke="none">
                    12.00 m (39&apos; 4&quot;)
                  </text>
                </g>

                {/* Left Dimension: 7.20 m Total Height */}
                <g stroke="#64748B" strokeWidth="1">
                  <line x1="36" y1="48" x2="36" y2="432" />
                  <line x1="30" y1="48" x2="42" y2="48" />
                  <line x1="30" y1="432" x2="42" y2="432" />
                  <text x="24" y="245" fill="#475569" fontSize="10" fontWeight="700" textAnchor="middle" transform="rotate(-90 24 245)" stroke="none">
                    7.20 m (23&apos; 7&quot;)
                  </text>
                </g>
              </svg>

              {/* Floating Action Overlay on Hover */}
              <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-6 py-4 rounded-xl shadow-2xl border border-brand-200 flex flex-col items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <div className="flex items-center gap-2 text-brand-700 font-bold text-sm">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Live 2D CAD Layout Model</span>
                  </div>
                  <p className="text-xs text-slate-500 text-center max-w-xs">
                    Fully editable in the browser. Click below to launch this project directly in the CAD editor!
                  </p>
                  <Button
                    size="sm"
                    onClick={onOpenEditor}
                    isLoading={isLoading}
                    className="mt-1 shadow-md bg-brand-600 hover:bg-brand-700 text-white font-bold"
                  >
                    <Zap className="h-4 w-4 mr-1.5 text-amber-300" /> Open in Interactive CAD Editor
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Living Room Zoom View */}
          {activeTab === "living" && (
            <div className="p-6 flex flex-col items-center">
              <svg viewBox="0 0 600 360" className="w-full h-auto max-h-[380px] drop-shadow-md">
                <rect x="40" y="30" width="520" height="300" rx="6" fill="#1E293B" />
                <rect x="48" y="38" width="504" height="284" rx="3" fill="#FAF6F0" />
                {/* Parquet Texture */}
                <line x1="48" y1="95" x2="552" y2="95" stroke="#EFE6DA" strokeWidth="1" />
                <line x1="48" y1="152" x2="552" y2="152" stroke="#EFE6DA" strokeWidth="1" />
                <line x1="48" y1="209" x2="552" y2="209" stroke="#EFE6DA" strokeWidth="1" />
                <line x1="48" y1="266" x2="552" y2="266" stroke="#EFE6DA" strokeWidth="1" />

                {/* Large 3-Seater Sofa and Lounger */}
                <g transform="translate(130, 90)">
                  <rect x="-20" y="-15" width="340" height="200" rx="10" fill="#F1F5F9" stroke="#CBD5E1" strokeDasharray="4 3" />
                  <rect x="0" y="0" width="280" height="85" rx="10" fill="#334155" />
                  <rect x="25" y="10" width="70" height="65" rx="6" fill="#475569" stroke="#1E293B" />
                  <rect x="105" y="10" width="70" height="65" rx="6" fill="#475569" stroke="#1E293B" />
                  <rect x="185" y="10" width="70" height="65" rx="6" fill="#475569" stroke="#1E293B" />
                  {/* Coffee Table */}
                  <rect x="65" y="110" width="150" height="55" rx="8" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
                  <circle cx="140" cy="137" r="12" fill="#E2E8F0" />
                </g>

                {/* Media Wall Console */}
                <rect x="150" y="295" width="300" height="20" rx="3" fill="#334155" />
                <rect x="200" y="300" width="200" height="6" rx="2" fill="#0284C7" />

                {/* Balcony Slider Door */}
                <rect x="42" y="100" width="10" height="120" fill="#0284C7" />
                <text x="60" y="165" fill="#0284C7" fontSize="11" fontWeight="700">
                  SLIDING BALCONY GLASS DOOR
                </text>
              </svg>
            </div>
          )}

          {/* Bedroom Zoom View */}
          {activeTab === "bedroom" && (
            <div className="p-6 flex flex-col items-center">
              <svg viewBox="0 0 600 360" className="w-full h-auto max-h-[380px] drop-shadow-md">
                <rect x="40" y="30" width="520" height="300" rx="6" fill="#1E293B" />
                <rect x="48" y="38" width="504" height="284" rx="3" fill="#F4EFE6" />
                {/* King Bed Arrangement */}
                <g transform="translate(180, 80)">
                  <rect x="10" y="0" width="220" height="18" rx="4" fill="#334155" />
                  <rect x="20" y="18" width="200" height="200" rx="8" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
                  <rect x="35" y="28" width="75" height="40" rx="6" fill="#F1F5F9" stroke="#CBD5E1" />
                  <rect x="130" y="28" width="75" height="40" rx="6" fill="#F1F5F9" stroke="#CBD5E1" />
                  <rect x="20" y="90" width="200" height="128" rx="6" fill="#E2E8F0" />
                  {/* Nightstands */}
                  <rect x="-25" y="4" width="32" height="40" rx="4" fill="#E2E8F0" stroke="#94A3B8" />
                  <circle cx="-9" cy="24" r="6" fill="#F59E0B" />
                  <rect x="233" y="4" width="32" height="40" rx="4" fill="#E2E8F0" stroke="#94A3B8" />
                  <circle cx="249" cy="24" r="6" fill="#F59E0B" />
                </g>
                {/* Built-in Closet */}
                <rect x="470" y="70" width="76" height="220" rx="4" fill="#E2E8F0" stroke="#94A3B8" />
                <text x="500" y="180" fill="#64748B" fontSize="12" fontWeight="700" transform="rotate(-90 500 180)">
                  CUSTOM CLOSET
                </text>
              </svg>
            </div>
          )}

          {/* Kitchen Zoom View */}
          {activeTab === "kitchen" && (
            <div className="p-6 flex flex-col items-center">
              <svg viewBox="0 0 600 360" className="w-full h-auto max-h-[380px] drop-shadow-md">
                <rect x="40" y="30" width="520" height="300" rx="6" fill="#1E293B" />
                <rect x="48" y="38" width="504" height="284" rx="3" fill="#F0F6F4" />
                {/* Island and Dining Table */}
                <g transform="translate(140, 110)">
                  <rect x="0" y="0" width="240" height="110" rx="8" fill="#D97706" opacity="0.9" />
                  <rect x="8" y="8" width="224" height="94" rx="6" fill="#FEF3C7" />
                  {/* Chairs */}
                  <rect x="30" y="-22" width="50" height="18" rx="4" fill="#334155" />
                  <rect x="150" y="-22" width="50" height="18" rx="4" fill="#334155" />
                  <rect x="30" y="114" width="50" height="18" rx="4" fill="#334155" />
                  <rect x="150" y="114" width="50" height="18" rx="4" fill="#334155" />
                </g>
                {/* Countertop */}
                <path d="M 48 240 L 160 240 L 160 322 L 48 322 Z" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
                <rect x="58" y="255" width="40" height="50" rx="4" fill="#FFFFFF" stroke="#94A3B8" />
                <rect x="105" y="255" width="40" height="50" rx="4" fill="#FFFFFF" stroke="#94A3B8" />
              </svg>
            </div>
          )}
        </div>

        {/* 3 Room Breakdown Cards Below Blueprint */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Living Room */}
          <div
            onClick={() => setActiveTab("living")}
            className={`rounded-xl bg-white p-5 shadow-sm border transition-all cursor-pointer ${
              activeTab === "living"
                ? "border-brand-500 ring-2 ring-brand-500/20"
                : "border-slate-200/70 hover:border-brand-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Living Room</span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">24.5 m²</span>
            </div>
            {/* Visual Floor Plan Vector Preview */}
            <div className="mt-3 relative h-36 rounded-lg bg-[#FAF6F0] border border-stone-200/80 overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 200 120" className="w-full h-full p-2 select-none">
                <rect x="10" y="10" width="180" height="100" rx="3" fill="#FAF6F0" stroke="#1E293B" strokeWidth="2" />
                {/* Sofa */}
                <rect x="25" y="25" width="120" height="35" rx="4" fill="#334155" />
                <rect x="35" y="30" width="30" height="25" rx="2" fill="#475569" />
                <rect x="70" y="30" width="30" height="25" rx="2" fill="#475569" />
                <rect x="105" y="30" width="30" height="25" rx="2" fill="#475569" />
                {/* Coffee Table */}
                <rect x="45" y="70" width="80" height="24" rx="4" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
                <circle cx="85" cy="82" r="5" fill="#CBD5E1" />
              </svg>
              <div className="absolute bottom-1.5 left-2 text-[10px] font-semibold text-slate-500 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200">
                3-Seater Sofa & Coffee Table
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
              <span>Dim: 6.12m × 4.00m</span>
              <span className="text-brand-600 font-semibold flex items-center gap-0.5">
                Inspect <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* Card 2: Master Bedroom */}
          <div
            onClick={() => setActiveTab("bedroom")}
            className={`rounded-xl bg-white p-5 shadow-sm border transition-all cursor-pointer ${
              activeTab === "bedroom"
                ? "border-brand-500 ring-2 ring-brand-500/20"
                : "border-slate-200/70 hover:border-brand-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Master Bedroom</span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">18.2 m²</span>
            </div>
            {/* Visual Floor Plan Vector Preview */}
            <div className="mt-3 relative h-36 rounded-lg bg-[#F4EFE6] border border-stone-200/80 overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 200 120" className="w-full h-full p-2 select-none">
                <rect x="10" y="10" width="180" height="100" rx="3" fill="#F4EFE6" stroke="#1E293B" strokeWidth="2" />
                {/* King Bed */}
                <rect x="50" y="20" width="80" height="75" rx="4" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
                <rect x="55" y="24" width="32" height="18" rx="2" fill="#E2E8F0" />
                <rect x="93" y="24" width="32" height="18" rx="2" fill="#E2E8F0" />
                <rect x="50" y="50" width="80" height="45" rx="3" fill="#CBD5E1" />
                {/* Nightstands */}
                <rect x="30" y="24" width="15" height="18" rx="2" fill="#E2E8F0" stroke="#94A3B8" />
                <rect x="135" y="24" width="15" height="18" rx="2" fill="#E2E8F0" stroke="#94A3B8" />
              </svg>
              <div className="absolute bottom-1.5 left-2 text-[10px] font-semibold text-slate-500 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200">
                King Bed & Nightstands
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
              <span>Dim: 4.55m × 4.00m</span>
              <span className="text-brand-600 font-semibold flex items-center gap-0.5">
                Inspect <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* Card 3: Kitchen & Dining */}
          <div
            onClick={() => setActiveTab("kitchen")}
            className={`rounded-xl bg-white p-5 shadow-sm border transition-all cursor-pointer ${
              activeTab === "kitchen"
                ? "border-brand-500 ring-2 ring-brand-500/20"
                : "border-slate-200/70 hover:border-brand-300 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Kitchen & Dining</span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">14.8 m²</span>
            </div>
            {/* Visual Floor Plan Vector Preview */}
            <div className="mt-3 relative h-36 rounded-lg bg-[#F0F6F4] border border-stone-200/80 overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 200 120" className="w-full h-full p-2 select-none">
                <rect x="10" y="10" width="180" height="100" rx="3" fill="#F0F6F4" stroke="#1E293B" strokeWidth="2" />
                {/* Dining Table */}
                <rect x="70" y="35" width="70" height="40" rx="4" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
                <rect x="78" y="24" width="22" height="8" rx="2" fill="#475569" />
                <rect x="110" y="24" width="22" height="8" rx="2" fill="#475569" />
                <rect x="78" y="78" width="22" height="8" rx="2" fill="#475569" />
                <rect x="110" y="78" width="22" height="8" rx="2" fill="#475569" />
                {/* Kitchen Counter Line */}
                <rect x="14" y="20" width="30" height="80" rx="2" fill="#E2E8F0" stroke="#94A3B8" />
                <circle cx="28" cy="40" r="6" fill="#0284C7" />
              </svg>
              <div className="absolute bottom-1.5 left-2 text-[10px] font-semibold text-slate-500 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200">
                Dining Table & Kitchen Island
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
              <span>Dim: 3.70m × 4.00m</span>
              <span className="text-brand-600 font-semibold flex items-center gap-0.5">
                Inspect <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar with Instant Launch Button */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white px-5 py-3.5 border border-slate-200/90 shadow-sm text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle className="h-4 w-4 text-emerald-600" /> Vector 2D CAD Engine
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle className="h-4 w-4 text-emerald-600" /> Metric & Imperial Scaling
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <CheckCircle className="h-4 w-4 text-emerald-600" /> SAT Collision Checks
            </span>
          </div>
          <Button
            size="sm"
            onClick={onOpenEditor}
            isLoading={isLoading}
            className="shadow-sm font-bold bg-brand-600 hover:bg-brand-700 text-white"
          >
            <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-300" /> Open in Interactive CAD Editor
          </Button>
        </div>
      </div>
    </div>
  );
}
