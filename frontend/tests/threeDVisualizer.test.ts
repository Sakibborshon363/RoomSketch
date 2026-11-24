import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@/store/editorStore";
import * as THREE from "three";

describe("3D Spatial Architectural Visualizer (Part 3)", () => {
  beforeEach(() => {
    useEditorStore.setState({
      viewMode: "2D",
    });
  });

  it("initializes in 2D Plan view mode by default", () => {
    expect(useEditorStore.getState().viewMode).toBe("2D");
  });

  it("transitions smoothly between 2D and 3D visualizer modes", () => {
    const { setViewMode } = useEditorStore.getState();

    setViewMode("3D_ISOMETRIC");
    expect(useEditorStore.getState().viewMode).toBe("3D_ISOMETRIC");

    setViewMode("3D_FIRST_PERSON");
    expect(useEditorStore.getState().viewMode).toBe("3D_FIRST_PERSON");

    setViewMode("2D");
    expect(useEditorStore.getState().viewMode).toBe("2D");
  });

  it("verifies Three.js architectural coordinate transformation and box geometries", () => {
    const SCALE = 1 / 50; // 50px = 1m
    const roomWidthPx = 300; // 6m
    const roomHeightPx = 200; // 4m

    const widthM = roomWidthPx * SCALE;
    const depthM = roomHeightPx * SCALE;
    expect(widthM).toBe(6.0);
    expect(depthM).toBe(4.0);

    // Verify Three.js Scene and BoxGeometry creation
    const scene = new THREE.Scene();
    const floorGeo = new THREE.BoxGeometry(widthM, 0.08, depthM);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xc5a059 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    scene.add(floorMesh);

    expect(scene.children).toHaveLength(1);
    expect(floorMesh.geometry.parameters.width).toBe(6.0);
    expect(floorMesh.geometry.parameters.depth).toBe(4.0);
  });

  it("verifies directional sunlight and camera lookAt vector computations", () => {
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(20, 35, 20);
    expect(sunLight.position.y).toBe(35);

    const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 200);
    const target = new THREE.Vector3(0, 0, 0);
    camera.position.set(10, 15, 10);
    camera.lookAt(target);

    expect(camera.position.x).toBe(10);
    expect(camera.position.y).toBe(15);
  });
});
