export interface Project {
  id: string;
  name: string;
  description?: string;
  unitSystem: "METERS" | "CENTIMETERS" | "FEET";
  thumbnailData?: string;
  createdAt: string;
  updatedAt: string;
  floorCount?: number;
  roomCount?: number;
  totalArea?: number;
}

export interface Floor {
  id: string;
  projectId: string;
  name: string;
  floorNumber: number;
  layoutData?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedProject {
  id: string;
  projectId: string;
  shareToken: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}
