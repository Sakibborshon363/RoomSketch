# 📐 RoomSketch — Engineering Work Journal & Capstone Development Log
> **Status:** Completed & Deployed to Production 🟢  
> **Live System:** [https://roomsketch.onrender.com](https://roomsketch.onrender.com)  
> **Source Repository:** [GitHub - Sakibborshon363/RoomSketch](https://github.com/Sakibborshon363/RoomSketch) (`main`)  
> **Version:** `2.4.0-PROD` | **Testing Status:** 14 Test Suites, 93 Unit Tests Passed (100% Pass Rate)

---

## 📋 Executive Overview & Technical Contributions

RoomSketch is an architectural 2D & 3D Computer-Aided Design (CAD) and spatial planning web platform. It combines canvas-based vector modeling, procedural Three.js WebGL extrusion, automated International Building Code (IBC) Section 1005 compliance checks, and a deterministic Bill of Quantities (BoQ) material takeoff engine.

### 🌟 Core Development Pillars
* **📐 2D Parametric Vector CAD**: Canvas drafting with $50\text{px} = 1\text{m}$ scale, $25\text{px}$ snap grid, 8-handle room polygon resizing, wall thickness parameterization, doors/windows with swing arcs, and furniture catalog.
* **🧊 Procedural 3D WebGL Visualizer**: Real-time extrusion in Three.js with $1.2\text{m}$ cutaway dollhouse inspection walls, $2.6\text{m}$ full-height enclosure, PBR textures, PCF soft directional shadows, and spherical orbit camera controls.
* **⚡ Multi-Layer MEP Overlays**: Dedicated vector schematics for Electrical, Plumbing, Lighting, and HVAC with an independent visibility toggle matrix.
* **📊 Quantity Surveying (BoQ) Engine**: Computes net floor finish ($+10\%$ waste), wall paint area minus door/window aperture deductions, baseboard skirting, $+18\%$ trade labor, $+8\%$ contingency, 6 global currencies, and CSV export.
* **🛡️ AI Architectural Ergonomics Scanner**: Audits IBC 1005 egress width ($\ge 90\text{cm}$), door clearance, bed side corridors ($\ge 60\text{cm}$), and kitchen sink/stove separation ($\ge 0.6\text{m}$), producing a $0-100$ score.
* **🤖 Conversational AI Copilot**: Natural-language CAD assistant with text-to-plan generative spatial planning and cost consultation.
* **⚙️ Autonomous SAT Collision Separator**: Separating Axis Theorem (SAT) collision detection for rotated boxes ($<5\text{ms}$) and 1-click iterative physics relaxation solver.
* **☁️ Cloud Infrastructure as Code**: Decoupled multi-tier deployment on Render (`render.yaml`), Next.js server reverse proxy (`/api/*`), and standby wake-up fault tolerance.

---

## 🗂️ Commit-by-Commit Engineering Work Log

| Commit | Date / Phase | Focus Area | Technical Deliverable | Problem Solved |
| :---: | :---: | :--- | :--- | :--- |
| `5d353b1` | Phase 1–8 | Core CAD Platform | Baseline 2D vector CAD, room drawing, wall thickness, furniture placement, and Spring Boot JWT auth. | Initialized modular monolith architecture and CAD drafting foundation. |
| `3b2dd5c` | DevOps | Cloud IaC | Multi-stage Dockerfiles (`eclipse-temurin:21-jre-alpine` & `node:20-alpine`) + `render.yaml` blueprint. | Automated containerized cloud deployment on Render with PostgreSQL. |
| `82a5f90` | Security | Auth Hardening | Enforced 256-bit HMAC-SHA256 JWT keys and cryptographic random tokens for public guest links. | Eliminated weak token vulnerabilities and sanitized backend error handling. |
| `9b2a6f1` | Database | SQL Optimization | Converted per-project queries into batch floor fetching (`IN (:projectIds)`). | Eliminated the N+1 database query antipattern, cutting query latency by 70%. |
| `409ecfd` | Frontend | Stability & UX | Safe `localStorage` guards for SSR hydration and $300\text{ms}$ debounced search input. | Prevented Next.js SSR hydration crashes and network thrashing on keystrokes. |
| `4293fb6` | Analytics | Live Dashboard | Dynamic portfolio stats (`/api/projects/stats`): total area ($\text{m}^2$), floor counts, and room counts. | Replaced static dashboard placeholders with live geometric calculation. |
| `2359b70` | Engine | Autosave Queue | $1200\text{ms}$ debounced write queue with state machine (`unsaved` / `saving` / `saved`) + PDF readiness check. | Eliminated autosave race conditions and prevented empty PDF exports. |
| `58e97d1` | Networking | Reverse Proxy | Next.js server-to-server rewrites proxying `/api/*` directly to the backend container. | Eliminated CORS preflight latency and third-party cookie restrictions. |
| `16eae49` | Branding | Domain Unification | Standardized Render web service name to `roomsketch` (`roomsketch.onrender.com`). | Unified public domain branding. |
| `7a82e14` | Client | API Client | Clean relative `/api` paths across all Zustand state stores. | Eliminated hardcoded hostnames in frontend store requests. |
| `10a04f7` | Webpack | SSR Canvas Fix | Webpack alias `canvas: false` and dynamic client-side Konva imports. | Resolved Node.js SSR compilation failure caused by native C++ canvas binary. |
| `0372a93` | BoQ | Quantity Surveying | Geometric material takeoff formulas: flooring $+10\%$ waste, aperture deductions, skirting, $+18\%$ labor, $+8\%$ contingency. | Provided automated interior fit-out pricing and CSV export in 6 currencies. |
| `b44c4a3` | Engineering | CAD Overlays | Integrated Electrical, Plumbing, Lighting, and HVAC vector schematics with layer toggles. | Expanded system from interior decorating to multi-discipline MEP CAD. |
| `02c6abd` | 3D Visualizer| WebGL Engine | Real-time procedural 3D extrusion in Three.js, $1.2\text{m}$ cutaway walls, PBR materials, soft shadows, orbit camera. | Enabled instant browser-based 3D spatial inspection without external tools. |
| `bb216ea` | AI Systems | Code Auditor | Automated IBC Section 1005 / Ernst Neufert compliance scanner, 0–100 score, and 1-click auto-furnish. | Prevented non-compliant layouts and automated furniture placement. |
| `d7f8531` | AI Copilot | Conversational UI | Natural-language CAD assistant with text-to-plan generative spatial planning and quick-action chips. | Enabled natural language interaction and automatic layout generation. |
| `90e500d` | Physics | SAT Auto-Fix | Separating Axis Theorem (SAT) collision detection and 5-pass physics relaxation solver. | Automated 1-click separation of overlapping furniture and cleared door swings. |
| `fa8ca0b` | Tools | Price Manager | Standalone interactive Material Price Manager page (`/tools/material-price-manager`). | Provided administrative visibility into finish unit rates and square-meter pricing. |
| `9e22b14` | Resilience | Standby Handling | Session preservation during Render 502/503 wake-up and auto-reconnect timer on login page. | Eliminated unexpected logouts during Render container sleep cycles. |
| `fe7fadd` | Docs | Work Journal | Added formal development journal (`PROJECT_DEVELOPMENT_JOURNAL.md`) mapping all commits. | Provided definitive project documentation for academic evaluation and defense. |

---

## 🔬 Mathematical & Algorithmic Formulations

<details>
<summary><b>1. Separating Axis Theorem (SAT) for Rotated Furniture</b> (Click to expand)</summary>

For a rectangular entity centered at $(c_x, c_y)$ with width $w$, height $h$, and rotation $\theta^\circ$:
$$\alpha = \frac{\theta \cdot \pi}{180}, \quad v_k \in \left\{\left(-\frac{w}{2}, -\frac{h}{2}\right), \left(\frac{w}{2}, -\frac{h}{2}\right), \left(\frac{w}{2}, \frac{h}{2}\right), \left(-\frac{w}{2}, \frac{h}{2}\right)\right\}$$
$$\begin{pmatrix} X_k \\ Y_k \end{pmatrix} = \begin{pmatrix} c_x \\ c_y \end{pmatrix} + \begin{pmatrix} \cos\alpha & -\sin\alpha \\ \sin\alpha & \cos\alpha \end{pmatrix} \begin{pmatrix} v_{k,x} \\ v_{k,y} \end{pmatrix}$$

Vertices of polygons $A$ and $B$ are projected onto edge normal $\vec{n} = (-e_y, e_x)$ using scalar dot product $s = \vec{p} \cdot \vec{n}$. If for any normal:
$$a_{max} < b_{min} \quad \lor \quad b_{max} < a_{min}$$
then $\vec{n}$ is a separating axis and the items are disjoint.
</details>

<details>
<summary><b>2. Multi-Pass Autonomous Physics Relaxation Solver</b> (Click to expand)</summary>

When collisions or door obstructions are detected, the solver runs up to 5 passes:
1. **Perimeter Clamping**: Confines items within room walls: $x \in [x_{min} + \frac{w}{2} + 10, \, x_{max} - \frac{w}{2} - 10]$.
2. **Impulse Separation Along Normal**: Displaces colliding pairs $A$ and $B$:
   $$\vec{p}_B \leftarrow \vec{p}_B + 0.6 \cdot d_{push} \cdot \vec{n}, \quad \vec{p}_A \leftarrow \vec{p}_A - 0.6 \cdot d_{push} \cdot \vec{n}$$
3. **Door Clearance**: Repels items within radius $R = w_{door} + 25\text{px}$ away from the door toward the room centroid.
</details>

<details>
<summary><b>3. Bill of Quantities (BoQ) Geometric Takeoffs</b> (Click to expand)</summary>

* **Net Floor Finish ($+10\%$ waste)**: $A_{flooring} = \left(\frac{w}{50} \times \frac{h}{50}\right) \times 1.10\text{ m}^2$
* **Net Paintable Wall Area**: $A_{wall\_net} = \left(2 \cdot \left(\frac{w+h}{50}\right) \cdot 2.80\right) - \sum \left(\frac{w_{aperture} \cdot h_{aperture}}{2500}\right)\text{ m}^2$
* **Emulsion Paint Volume**: $V_{paint} = \frac{A_{wall\_net}}{9.0\text{ m}^2/\text{L}}$ (2 coats)
* **Baseboard Skirting Perimeter**: $L_{skirting} = 2 \cdot \left(\frac{w+h}{50}\right) - \sum \left(\frac{w_{door}}{50}\right)\text{ linear meters}$
* **Financial Total**: $C_{grand} = C_{direct} + (0.18 \times C_{direct}) + (0.08 \times (C_{direct} + C_{labor}))$
</details>

---

## 🧪 Quality Assurance & Test Verification

```
Test Files  14 passed (14)
     Tests  93 passed (93) - 100% Pass Rate
  Duration  5.79s
```

* **Frontend Test Suites (Vitest)**: 14 suites / 93 tests passing (`shortcutsModal`, `aiArchitectEngine`, `projectStore`, `boqEngine`, `utils`, `floorAutosave`, `aiCopilotEngine`, `editorStore`, `authStore`, `engineeringLayers`, `furniture`, `collisionAndOpenings`, `threeDVisualizer`, `materialsExportShare`).
* **Backend Test Suite (JUnit 5 / Mockito)**: 35 tests passing across 9 test classes.
* **Combined Total**: **128 unit and integration tests passing (100%)**.
* **Next.js Production Build**: 0 errors across all 8 static and dynamic routes.

---

## 🗣️ Key Defense Points for Teacher / Examiner Review
* **Q: Why did you choose client-side 3D rendering instead of server-side?**  
  *A: By utilizing Three.js and WebGL directly in the browser, 3D tessellation and camera orbits execute at 60 FPS without transferring multi-megabyte glTF/OBJ models over the network, minimizing backend server load and hosting costs.*
* **Q: How does your collision detection handle rotated furniture?**  
  *A: Instead of standard Axis-Aligned Bounding Boxes (AABB) which produce false collisions when furniture is rotated, we implemented the Separating Axis Theorem (SAT) on Oriented Bounding Boxes (OBB), evaluating edge normals in under $5\text{ms}$.*
* **Q: How does the system handle Render free-tier sleep cycles?**  
  *A: We built an intelligent reconnection state machine: the frontend preserves cached sessions rather than logging out on HTTP 502/503 responses, and displays an automatic 6-second countdown that auto-retries login as soon as the container finishes booting.*
