export interface FloorMaterial {
  id: string;
  name: string;
  category: "WOOD" | "TILE" | "STONE" | "CONCRETE";
  color: string;
  pattern: "planks" | "chevron" | "grid" | "marble" | "terrazzo" | "concrete";
  description: string;
  roughness: number;
}

export interface WallFinish {
  id: string;
  name: string;
  color: string;
  finishType: "Matte" | "Satin" | "Eggshell";
  description: string;
}

export interface FurnitureFinish {
  id: string;
  name: string;
  category: "FABRIC" | "LEATHER" | "WOOD" | "METAL";
  color: string;
  material: string;
  description: string;
}

export const FLOOR_MATERIALS: FloorMaterial[] = [
  {
    id: "warm_oak",
    name: "Warm Oak Plank",
    category: "WOOD",
    color: "#EBDCCB",
    pattern: "planks",
    description: "Natural Scandinavian warm oak with subtle longitudinal grain",
    roughness: 0.4,
  },
  {
    id: "dark_walnut",
    name: "American Dark Walnut",
    category: "WOOD",
    color: "#735B47",
    pattern: "planks",
    description: "Deep espresso wood finish with rich linear timber planks",
    roughness: 0.35,
  },
  {
    id: "herringbone_parquet",
    name: "Classic French Herringbone",
    category: "WOOD",
    color: "#D4B996",
    pattern: "chevron",
    description: "Traditional 45-degree interlocking chevron parquet blocks",
    roughness: 0.45,
  },
  {
    id: "sage_tile",
    name: "Mediterranean Sage Tile",
    category: "TILE",
    color: "#D9E3DF",
    pattern: "grid",
    description: "Calm sage green ceramic square tiles with white grout lines",
    roughness: 0.2,
  },
  {
    id: "light_blue_tile",
    name: "Coastal Light Blue Tile",
    category: "TILE",
    color: "#DCE9EA",
    pattern: "grid",
    description: "Glazed coastal blue bathroom & wet room ceramic tiles",
    roughness: 0.15,
  },
  {
    id: "ceramic_sand",
    name: "Sandstone Matte Ceramic",
    category: "TILE",
    color: "#EDE8DE",
    pattern: "grid",
    description: "Earthy sandstone porcelain pavers with fine stone speckle",
    roughness: 0.3,
  },
  {
    id: "marble_white",
    name: "Carrara Polished Marble",
    category: "STONE",
    color: "#FBFBFA",
    pattern: "marble",
    description: "White Carrara Italian marble with soft grey veining lines",
    roughness: 0.1,
  },
  {
    id: "slate_charcoal",
    name: "Charcoal Cleft Slate",
    category: "STONE",
    color: "#475569",
    pattern: "grid",
    description: "Textured natural slate slabs with deep charcoal tones",
    roughness: 0.6,
  },
  {
    id: "terrazzo_speckle",
    name: "Venetian Speckled Terrazzo",
    category: "STONE",
    color: "#F5F0E6",
    pattern: "terrazzo",
    description: "Composite stone with multi-tonal quartz and marble chips",
    roughness: 0.25,
  },
  {
    id: "concrete_loft",
    name: "Urban Polished Concrete",
    category: "CONCRETE",
    color: "#D1D5DB",
    pattern: "concrete",
    description: "Industrial loft seamless cast concrete with soft trowel marks",
    roughness: 0.3,
  },
];

export const WALL_FINISHES: WallFinish[] = [
  {
    id: "charcoal_slate",
    name: "Architect Charcoal",
    color: "#292524",
    finishType: "Matte",
    description: "Deep moody charcoal for bold accent walls & structural lines",
  },
  {
    id: "deep_forest",
    name: "Nordic Deep Forest",
    color: "#1E3A34",
    finishType: "Eggshell",
    description: "Signature RoomSketch calming architectural pine green",
  },
  {
    id: "slate_grey",
    name: "Slate Modern Grey",
    color: "#475569",
    finishType: "Matte",
    description: "Balanced contemporary neutral grey wall paint",
  },
  {
    id: "stone_ochre",
    name: "Warm Stone Ochre",
    color: "#78716C",
    finishType: "Eggshell",
    description: "Warm tactile stone finish with soft earthy undertones",
  },
  {
    id: "soft_linen",
    name: "Soft Linen White",
    color: "#F5F5F0",
    finishType: "Satin",
    description: "Light-reflecting warm off-white for bright living spaces",
  },
  {
    id: "sandstone_beige",
    name: "Sandstone Beige",
    color: "#D6C7B2",
    finishType: "Matte",
    description: "Desert sandstone warm neutral with cozy warmth",
  },
  {
    id: "terracotta",
    name: "Tuscan Terracotta",
    color: "#B45309",
    finishType: "Matte",
    description: "Mediterranean baked clay for welcoming dining and kitchens",
  },
  {
    id: "midnight_navy",
    name: "Midnight Navy",
    color: "#1E293B",
    finishType: "Matte",
    description: "Sophisticated deep blue for bedrooms and study rooms",
  },
];

export const FURNITURE_FINISHES: FurnitureFinish[] = [
  // Fabrics
  {
    id: "fabric_linen",
    name: "Natural Textured Linen",
    category: "FABRIC",
    color: "#C5BCAB",
    material: "Linen",
    description: "Breathable natural flax linen with tactile organic weave",
  },
  {
    id: "fabric_cream",
    name: "Soft Cream Bouclé",
    category: "FABRIC",
    color: "#EDE8DE",
    material: "Bouclé",
    description: "Cozy textured looped wool blend in warm ivory",
  },
  {
    id: "fabric_sage",
    name: "Earthy Sage Velvet",
    category: "FABRIC",
    color: "#8EA69B",
    material: "Velvet",
    description: "Lustrous short-pile velvet with muted botanic hue",
  },
  {
    id: "fabric_forest",
    name: "Deep Pine Forest",
    category: "FABRIC",
    color: "#335C43",
    material: "Cotton Canvas",
    description: "Heavyweight cotton weave in signature deep forest",
  },
  {
    id: "fabric_charcoal",
    name: "Charcoal Wool Blend",
    category: "FABRIC",
    color: "#3D3935",
    material: "Wool",
    description: "Durable tailored upholstery wool for modern sofas",
  },

  // Leathers
  {
    id: "leather_tan",
    name: "Cognac Saddle Leather",
    category: "LEATHER",
    color: "#B38260",
    material: "Top-grain Leather",
    description: "Full-aniline vegetable tanned leather with patina",
  },
  {
    id: "leather_espresso",
    name: "Espresso Dark Leather",
    category: "LEATHER",
    color: "#451A03",
    material: "Leather",
    description: "Rich dark roasted brown leather for executive chairs",
  },
  {
    id: "leather_black",
    name: "Onyx Black Leather",
    category: "LEATHER",
    color: "#18181B",
    material: "Full-grain Leather",
    description: "Sleek matte black leather for minimalist furniture",
  },

  // Woods
  {
    id: "wood_oak",
    name: "Solid White Oak",
    category: "WOOD",
    color: "#A07855",
    material: "Oak Wood",
    description: "Kiln-dried solid white oak with natural polyurethane seal",
  },
  {
    id: "wood_walnut",
    name: "American Walnut",
    category: "WOOD",
    color: "#57483B",
    material: "Walnut Wood",
    description: "Lustrous oiled walnut with chocolate grain figuring",
  },
  {
    id: "wood_ash",
    name: "Bleached Nordic Ash",
    category: "WOOD",
    color: "#E5D9C5",
    material: "Ash Wood",
    description: "Ultra-light pale Scandinavian ash with subtle grain",
  },

  // Metals
  {
    id: "metal_steel",
    name: "Brushed Stainless Steel",
    category: "METAL",
    color: "#D5DDDE",
    material: "Brushed Steel",
    description: "Satin brushed metal for table legs and bathroom fixtures",
  },
  {
    id: "metal_brass",
    name: "Aged Warm Brass",
    category: "METAL",
    color: "#D4AF37",
    material: "Brass",
    description: "Brushed golden brass accent for lamps and cabinet pulls",
  },
  {
    id: "metal_black",
    name: "Matte Black Powdercoat",
    category: "METAL",
    color: "#1C1917",
    material: "Powdercoated Steel",
    description: "Fine-texture black architectural steel hardware",
  },
];
