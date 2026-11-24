import React from "react";

interface FloorPlanThumbnailProps {
  name: string;
  thumbnailData?: string;
  className?: string;
}

export function FloorPlanThumbnail({ name = "", thumbnailData, className = "" }: FloorPlanThumbnailProps) {
  if (thumbnailData && (thumbnailData.startsWith("data:image/") || thumbnailData.startsWith("http"))) {
    return (
      <div
        className={`relative w-full aspect-[16/10] overflow-hidden rounded-xl bg-[#F9F8F5] border border-stone-200/90 flex items-center justify-center select-none ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailData}
          alt={name || "Floor plan preview"}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2.5 z-20 flex items-center gap-1.5 rounded-md bg-stone-900/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          <span>Saved Snapshot</span>
        </div>
      </div>
    );
  }

  const isGardenApartment = (name || "").toLowerCase().includes("garden") || (name || "").toLowerCase().includes("apartment");

  return (
    <div
      className={`relative w-full aspect-[16/10] overflow-hidden rounded-xl bg-[#F9F8F5] border border-stone-200/90 flex items-center justify-center p-3 select-none ${className}`}
    >
      {/* Subtle architectural grid background */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #EBE7DF 1px, transparent 1px), linear-gradient(to bottom, #EBE7DF 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      {isGardenApartment ? (
        /* The Garden Apartment 85.3 m² Architectural Vector Thumbnail */
        <svg viewBox="0 0 400 260" className="w-full h-full drop-shadow-sm relative z-10">
          {/* External Thick Wall Perimeter */}
          <rect x="30" y="25" width="340" height="210" fill="#292524" rx="4" />
          <rect x="36" y="31" width="328" height="198" fill="#FBFBFA" rx="2" />

          {/* Living & Dining Room */}
          <rect x="36" y="31" width="194" height="114" fill="#EBDCCB" />
          {/* Master Bedroom */}
          <rect x="236" y="31" width="128" height="104" fill="#E2D3BE" />
          {/* Kitchen */}
          <rect x="36" y="151" width="94" height="78" fill="#D9E3DF" />
          {/* Entry */}
          <rect x="136" y="151" width="94" height="78" fill="#EDE8DE" />
          {/* Bathroom */}
          <rect x="236" y="141" width="128" height="88" fill="#DCE9EA" />

          {/* Interior Dividing Walls */}
          <rect x="230" y="31" width="6" height="198" fill="#292524" />
          <rect x="36" y="145" width="194" height="6" fill="#292524" />
          <rect x="130" y="151" width="6" height="78" fill="#292524" />
          <rect x="236" y="135" width="128" height="6" fill="#292524" />

          {/* Furniture: Living Room Sofa & Rug */}
          <rect x="50" y="60" width="22" height="56" rx="3" fill="#C5BCAB" stroke="#A99E8B" strokeWidth="1" />
          <rect x="76" y="62" width="46" height="52" rx="2" fill="#E5DEC9" opacity="0.8" />
          <rect x="88" y="78" width="16" height="24" rx="4" fill="#A67A53" />
          <rect x="114" y="55" width="20" height="20" rx="3" transform="rotate(-20 114 55)" fill="#B38260" />

          {/* Dining Table with Chairs */}
          <rect x="148" y="75" width="30" height="46" rx="2" fill="#A07855" />
          <rect x="140" y="83" width="6" height="12" rx="1" fill="#8C6645" />
          <rect x="140" y="101" width="6" height="12" rx="1" fill="#8C6645" />
          <rect x="180" y="83" width="6" height="12" rx="1" fill="#8C6645" />
          <rect x="180" y="101" width="6" height="12" rx="1" fill="#8C6645" />

          {/* Plants */}
          <circle cx="48" cy="42" r="7" fill="#4A6B53" />
          <circle cx="214" cy="42" r="7" fill="#4A6B53" />

          {/* Bedroom Bed with Pillows */}
          <rect x="264" y="42" width="56" height="68" rx="2" fill="#8EA69B" stroke="#6C877A" strokeWidth="1" />
          <rect x="270" y="45" width="20" height="10" rx="1" fill="#FFFFFF" opacity="0.8" />
          <rect x="294" y="45" width="20" height="10" rx="1" fill="#FFFFFF" opacity="0.8" />
          <rect x="246" y="46" width="12" height="12" rx="1" fill="#A98462" />
          <rect x="326" y="46" width="12" height="12" rx="1" fill="#A98462" />

          {/* Kitchen Counter with Sink */}
          <rect x="42" y="165" width="16" height="54" rx="1" fill="#637D71" />
          <rect x="45" y="178" width="10" height="14" rx="1" fill="#BAC8C3" />

          {/* Bathroom Bathtub & Toilet */}
          <rect x="318" y="162" width="36" height="58" rx="6" fill="#FFFFFF" stroke="#9BB5BA" strokeWidth="1" />
          <rect x="246" y="200" width="14" height="20" rx="4" fill="#FFFFFF" stroke="#9BB5BA" strokeWidth="1" />

          {/* Door Openings */}
          <path d="M 172 229 A 24 24 0 0 1 196 205" fill="none" stroke="#292524" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="172" y1="229" x2="172" y2="205" stroke="#292524" strokeWidth="1.5" />

          {/* Dimension Label */}
          <text x="133" y="100" fill="#292524" fontSize="8" fontWeight="600" textAnchor="middle" opacity="0.75">
            Living &amp; dining
          </text>
          <text x="292" y="85" fill="#292524" fontSize="8" fontWeight="600" textAnchor="middle" opacity="0.75">
            Bedroom
          </text>
        </svg>
      ) : (
        /* Studio / Modern Layout Vector Thumbnail */
        <svg viewBox="0 0 400 260" className="w-full h-full drop-shadow-sm relative z-10">
          <rect x="40" y="30" width="320" height="200" fill="#292524" rx="4" />
          <rect x="46" y="36" width="308" height="188" fill="#FBFBFA" rx="2" />

          {/* Studio Open Concept Room */}
          <rect x="46" y="36" width="220" height="188" fill="#EBDCCB" />
          {/* Bathroom */}
          <rect x="272" y="36" width="82" height="100" fill="#DCE9EA" />

          <rect x="266" y="36" width="6" height="106" fill="#292524" />
          <rect x="266" y="142" width="88" height="6" fill="#292524" />

          {/* Bed */}
          <rect x="65" y="55" width="60" height="75" rx="2" fill="#8EA69B" />
          {/* Sofa */}
          <rect x="155" y="70" width="24" height="60" rx="3" fill="#C5BCAB" />
          {/* Coffee Table */}
          <rect x="185" y="85" width="20" height="30" rx="3" fill="#A67A53" />
          {/* Vanity & Toilet */}
          <rect x="285" y="48" width="22" height="14" rx="2" fill="#FFFFFF" stroke="#9BB5BA" />
          <rect x="320" y="100" width="16" height="22" rx="4" fill="#FFFFFF" stroke="#9BB5BA" />

          <text x="156" y="170" fill="#292524" fontSize="9" fontWeight="600" textAnchor="middle" opacity="0.75">
            Studio Space
          </text>
        </svg>
      )}

      {/* Modern Badge Overlay */}
      <div className="absolute bottom-2 left-2.5 z-20 flex items-center gap-1.5 rounded-md bg-stone-900/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
        <span>2D & 3D Architectural CAD</span>
      </div>
    </div>
  );
}
