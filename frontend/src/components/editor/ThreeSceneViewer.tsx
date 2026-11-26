"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useEditorStore } from "@/store/editorStore";
import {
  Layers,
  RotateCcw,
  Eye,
  Maximize2,
  Box,
  Compass,
  Sun,
  Grid,
  Sparkles,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ThreeSceneViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    rooms,
    furniture,
    doorsWindows,
    showFurniture,
    showElectrical,
    showPlumbing,
    showLighting,
    showHvac,
    viewMode,
    setViewMode,
  } = useEditorStore();

  const [wallHeightMode, setWallHeightMode] = useState<"cutaway" | "full">("cutaway");
  const [cameraPreset, setCameraPreset] = useState<"isometric" | "topdown" | "eyelevel">("isometric");

  // Camera spherical coordinates state ref for smooth orbit
  const orbitRef = useRef({
    isDragging: false,
    isPanning: false,
    prevX: 0,
    prevY: 0,
    theta: Math.PI / 4, // 45 deg
    phi: Math.PI / 3, // 60 deg elevation
    radius: 20, // Distance
    target: new THREE.Vector3(0, 0, 0),
  });

  const wallHeight = wallHeightMode === "cutaway" ? 1.2 : 2.6;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#F4F4F0");

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // 2. Center of rooms for origin alignment
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    rooms.forEach((r) => {
      minX = Math.min(minX, r.x);
      maxX = Math.max(maxX, r.x + r.width);
      minY = Math.min(minY, r.y);
      maxY = Math.max(maxY, r.y + r.height);
    });

    const centerX = rooms.length > 0 ? (minX + maxX) / 2 : 250;
    const centerY = rooms.length > 0 ? (minY + maxY) / 2 : 200;
    const SCALE = 1 / 50; // 50px = 1m in 3D

    // 3. Ground Plane & Grid
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: "#ECECE6",
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(60, 60, 0xb0b0a8, 0xd0d0c8);
    gridHelper.position.y = -0.04;
    scene.add(gridHelper);

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdfe5e8, 0.6);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    sunLight.position.set(20, 35, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 5. Build 3D Rooms (Floors & Walls)
    rooms.forEach((room) => {
      const roomW = room.width * SCALE;
      const roomD = room.height * SCALE;
      const roomX = (room.x + room.width / 2 - centerX) * SCALE;
      const roomZ = (room.y + room.height / 2 - centerY) * SCALE;

      // 5a. 3D Floor Slab
      const floorColor = resolveFloorColor(room.floorMaterial, room.floorColor);
      const floorGeo = new THREE.BoxGeometry(roomW, 0.08, roomD);
      const floorMat = new THREE.MeshStandardMaterial({
        color: floorColor,
        roughness: 0.5,
        metalness: 0.1,
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.set(roomX, 0.04, roomZ);
      floorMesh.receiveShadow = true;
      scene.add(floorMesh);

      // 5b. 3D Walls (4 Perimeter Slabs)
      const wallThick = 0.16; // 16cm thick walls
      const wallMat = new THREE.MeshStandardMaterial({
        color: room.wallColor || "#E8E7E3",
        roughness: 0.8,
        metalness: 0.05,
      });

      // Top Wall (Z - roomD/2)
      createWallSegment(scene, roomW, wallHeight, wallThick, roomX, wallHeight / 2, roomZ - roomD / 2, wallMat);
      // Bottom Wall (Z + roomD/2)
      createWallSegment(scene, roomW, wallHeight, wallThick, roomX, wallHeight / 2, roomZ + roomD / 2, wallMat);
      // Left Wall (X - roomW/2)
      createWallSegment(scene, wallThick, wallHeight, roomD, roomX - roomW / 2, wallHeight / 2, roomZ, wallMat);
      // Right Wall (X + roomW/2)
      createWallSegment(scene, wallThick, wallHeight, roomD, roomX + roomW / 2, wallHeight / 2, roomZ, wallMat);
    });

    // 6. Build 3D Furniture & Engineering Systems
    furniture.forEach((f) => {
      if (f.isVisible === false) return;
      if (f.category === "ELECTRICAL" && !showElectrical) return;
      if (f.category === "PLUMBING" && !showPlumbing) return;
      if (f.category === "LIGHTING" && !showLighting) return;
      if (f.category === "HVAC" && !showHvac) return;
      if (
        f.category !== "ELECTRICAL" &&
        f.category !== "PLUMBING" &&
        f.category !== "LIGHTING" &&
        f.category !== "HVAC" &&
        !showFurniture
      ) {
        return;
      }

      const itemW = f.width * SCALE;
      const itemD = f.height * SCALE;
      const itemX = (f.x - centerX) * SCALE;
      const itemZ = (f.y - centerY) * SCALE;
      const rotY = -(f.rotation || 0) * (Math.PI / 180);

      build3DFurnitureMesh(scene, f, itemW, itemD, itemX, itemZ, rotY);
    });

    // 7. Render Loop & Camera Positioning
    let animationFrameId: number;

    const updateCamera = () => {
      const o = orbitRef.current;
      // Clamp phi to avoid pole flip
      o.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, o.phi));
      o.radius = Math.max(4, Math.min(60, o.radius));

      camera.position.x = o.target.x + o.radius * Math.sin(o.phi) * Math.sin(o.theta);
      camera.position.y = o.target.y + o.radius * Math.cos(o.phi);
      camera.position.z = o.target.z + o.radius * Math.sin(o.phi) * Math.cos(o.theta);
      camera.lookAt(o.target);
    };

    updateCamera();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      updateCamera();
      renderer.render(scene, camera);
    };
    animate();

    // 8. Interactive Orbit & Pan Mouse Handlers
    const handleMouseDown = (e: MouseEvent) => {
      const o = orbitRef.current;
      o.isDragging = e.button === 0; // Left click rotate
      o.isPanning = e.button === 2 || e.shiftKey; // Right click pan
      o.prevX = e.clientX;
      o.prevY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const o = orbitRef.current;
      if (!o.isDragging && !o.isPanning) return;

      const deltaX = e.clientX - o.prevX;
      const deltaY = e.clientY - o.prevY;
      o.prevX = e.clientX;
      o.prevY = e.clientY;

      if (o.isPanning) {
        // Pan parallel to camera view plane
        const panSpeed = 0.02 * (o.radius / 15);
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        o.target.addScaledVector(right, -deltaX * panSpeed);
        o.target.addScaledVector(forward, deltaY * panSpeed);
      } else if (o.isDragging) {
        o.theta -= deltaX * 0.008;
        o.phi -= deltaY * 0.008;
      }
    };

    const handleMouseUp = () => {
      orbitRef.current.isDragging = false;
      orbitRef.current.isPanning = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbitRef.current.radius += e.deltaY * 0.015;
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("contextmenu", handleContextMenu);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [rooms, furniture, doorsWindows, showFurniture, showElectrical, showPlumbing, showLighting, showHvac, wallHeight]);

  // Camera Presets
  const applyPreset = (preset: "isometric" | "topdown" | "eyelevel") => {
    setCameraPreset(preset);
    const o = orbitRef.current;
    if (preset === "isometric") {
      o.theta = Math.PI / 4;
      o.phi = Math.PI / 3;
      o.radius = 20;
      o.target.set(0, 0, 0);
    } else if (preset === "topdown") {
      o.theta = 0;
      o.phi = 0.15; // Almost 90 deg down
      o.radius = 24;
      o.target.set(0, 0, 0);
    } else if (preset === "eyelevel") {
      o.theta = Math.PI / 4;
      o.phi = Math.PI / 2.3; // Near horizontal
      o.radius = 12;
      o.target.set(0, 1.2, 0);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#F4F4F0]">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Control HUD Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        {/* Return to 2D Button */}
        <Button
          size="sm"
          onClick={() => setViewMode("2D")}
          className="bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold gap-1.5 shadow-md border border-stone-200"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-stone-500" />
          <span>2D Plan Mode</span>
        </Button>

        {/* Transition to CAD Elevation Button */}
        <Button
          size="sm"
          onClick={() => setViewMode("ELEVATION_CAD")}
          className="bg-white hover:bg-stone-100 text-stone-800 text-xs font-bold gap-1.5 shadow-md border border-stone-200"
        >
          <Compass className="h-3.5 w-3.5 text-sky-600" />
          <span>CAD Elevation &rarr;</span>
        </Button>

        {/* Transition to Façade View Button */}
        <Button
          size="sm"
          onClick={() => setViewMode("ARCHITECTURAL_VIEW")}
          className="bg-[#1E3A34] hover:bg-[#254A42] text-white text-xs font-bold gap-1.5 shadow-md"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>Façade View &rarr;</span>
        </Button>

        {/* Camera Preset Segmented Control */}
        <div className="flex rounded-xl bg-white/95 backdrop-blur-md p-1 shadow-md border border-stone-200 text-xs font-bold">
          <button
            onClick={() => applyPreset("isometric")}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              cameraPreset === "isometric" ? "bg-[#1E3A34] text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            3D Isometric
          </button>
          <button
            onClick={() => applyPreset("eyelevel")}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              cameraPreset === "eyelevel" ? "bg-[#1E3A34] text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Eye Level (1.7m)
          </button>
          <button
            onClick={() => applyPreset("topdown")}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              cameraPreset === "topdown" ? "bg-[#1E3A34] text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Top-Down 3D
          </button>
        </div>

        {/* Wall Height Toggle */}
        <div className="flex rounded-xl bg-white/95 backdrop-blur-md p-1 shadow-md border border-stone-200 text-xs font-bold">
          <button
            onClick={() => setWallHeightMode("cutaway")}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              wallHeightMode === "cutaway" ? "bg-[#1E3A34] text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
            title="1.2m Cutaway view (see interior layout clearly)"
          >
            Cutaway Walls (1.2m)
          </button>
          <button
            onClick={() => setWallHeightMode("full")}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              wallHeightMode === "full" ? "bg-[#1E3A34] text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
            title="2.6m Full architectural ceiling height"
          >
            Full Height (2.6m)
          </button>
        </div>
      </div>

      {/* Floating Bottom Help Note */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-lg bg-white/90 backdrop-blur-md px-3 py-1.5 text-[11px] text-stone-500 shadow-sm border border-stone-200 pointer-events-none">
        <Compass className="h-3.5 w-3.5 text-brand-600" />
        <span>Left Drag to Orbit • Right Drag to Pan • Scroll to Zoom</span>
      </div>
    </div>
  );
}

// ==============================================================================
// Helper Functions for 3D Geometry Generation
// ==============================================================================

function createWallSegment(
  scene: THREE.Scene,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material
) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

function resolveFloorColor(materialId?: string, defaultColor?: string): string {
  const map: Record<string, string> = {
    hardwood_oak: "#C5A059",
    hardwood_walnut: "#6A4A3C",
    hardwood_light: "#D8C4B6",
    marble_carrara: "#EAEAE8",
    ceramic_beige: "#D8C7B5",
    ceramic_slate: "#4A4D52",
    terrazzo_white: "#E2DFD8",
    polished_concrete: "#9E9E9C",
    carpet_beige: "#C8BFA7",
    carpet_charcoal: "#3B3A36",
  };
  return map[materialId || ""] || defaultColor || "#EBDCCB";
}

function build3DFurnitureMesh(
  scene: THREE.Scene,
  f: any,
  w: number,
  d: number,
  x: number,
  z: number,
  rotY: number
) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotY;

  const type = f.type || "";
  const baseColor = f.color || "#8A817C";

  if (type.includes("bed")) {
    // Bed Base
    const baseGeo = new THREE.BoxGeometry(w, 0.35, d);
    const baseMat = new THREE.MeshStandardMaterial({ color: "#2E282A", roughness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.175;
    base.castShadow = true;
    group.add(base);

    // Mattress
    const matGeo = new THREE.BoxGeometry(w * 0.95, 0.25, d * 0.9);
    const matMat = new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.9 });
    const mattress = new THREE.Mesh(matGeo, matMat);
    mattress.position.set(0, 0.475, d * 0.02);
    mattress.castShadow = true;
    group.add(mattress);

    // Headboard
    const headGeo = new THREE.BoxGeometry(w, 0.9, 0.1);
    const headMat = new THREE.MeshStandardMaterial({ color: "#1E293B", roughness: 0.7 });
    const headboard = new THREE.Mesh(headGeo, headMat);
    headboard.position.set(0, 0.45, -d / 2 + 0.05);
    headboard.castShadow = true;
    group.add(headboard);
  } else if (type.includes("sofa")) {
    // Sofa Base Cushion
    const seatGeo = new THREE.BoxGeometry(w, 0.4, d);
    const seatMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.8 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.y = 0.2;
    seat.castShadow = true;
    group.add(seat);

    // Backrest
    const backGeo = new THREE.BoxGeometry(w, 0.45, 0.18);
    const backMat = new THREE.MeshStandardMaterial({ color: "#334155", roughness: 0.8 });
    const back = new THREE.Mesh(backGeo, backMat);
    back.position.set(0, 0.625, -d / 2 + 0.09);
    back.castShadow = true;
    group.add(back);
  } else if (type.includes("table")) {
    // Tabletop
    const topGeo = new THREE.BoxGeometry(w, 0.06, d);
    const topMat = new THREE.MeshStandardMaterial({ color: "#D97706", roughness: 0.6 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 0.72;
    top.castShadow = true;
    group.add(top);

    // 4 Legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7);
    const legMat = new THREE.MeshStandardMaterial({ color: "#1F2937" });
    const legPositions = [
      [-w / 2 + 0.08, -d / 2 + 0.08],
      [w / 2 - 0.08, -d / 2 + 0.08],
      [-w / 2 + 0.08, d / 2 - 0.08],
      [w / 2 - 0.08, d / 2 - 0.08],
    ];
    legPositions.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0.35, lz);
      leg.castShadow = true;
      group.add(leg);
    });
  } else if (f.category === "LIGHTING") {
    // Glowing Ceiling Light Fixture
    const lightGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const lightMat = new THREE.MeshStandardMaterial({
      color: "#FDE68A",
      emissive: "#F59E0B",
      emissiveIntensity: 1.5,
    });
    const lightMesh = new THREE.Mesh(lightGeo, lightMat);
    lightMesh.position.set(0, 2.3, 0);
    group.add(lightMesh);

    const pointLight = new THREE.PointLight(0xfffaed, 0.8, 6);
    pointLight.position.set(0, 2.2, 0);
    group.add(pointLight);
  } else if (f.category === "HVAC") {
    // Wall AC Unit
    const acGeo = new THREE.BoxGeometry(w, 0.28, d);
    const acMat = new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.4 });
    const ac = new THREE.Mesh(acGeo, acMat);
    ac.position.set(0, 2.2, 0);
    ac.castShadow = true;
    group.add(ac);
  } else {
    // Generic Architectural Cabinet / Rect Box
    const h = Math.min(1.0, Math.max(0.4, (w + d) / 3));
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.7 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    group.add(mesh);
  }

  scene.add(group);
}
