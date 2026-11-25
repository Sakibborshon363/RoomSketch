# SOFTWARE REQUIREMENTS SPECIFICATION & SYSTEM DESIGN DOCUMENT (SRS / SDD)
## Project: RoomSketch — Architectural 2D & 3D CAD Planning Platform
**Document Version:** 2.4.0-PROD  
**Status:** Approved for Production Deployment  
**Author:** Lead Software Architect & Systems Engineering Team  
**Standard Basis:** IEEE 830 / ISO/IEC/IEEE 29148 Extended System Design  
**Live Production URL:** `https://roomsketch.onrender.com`  
**Repository Branch:** `main` (Unified Multi-Tier Cloud Repository)  

---

## DOCUMENT CONTROL & PREFACE

### Document History
| Version | Date | Author / Role | Status / Description |
| :--- | :--- | :--- | :--- |
| `1.0.0-DRAFT` | Nov 20, 2026 | Lead Architect | Initial architectural requirements & CAD drafting baseline. |
| `2.0.0-BETA` | Nov 24, 2026 | Systems Engineering | Integrated BoQ takeoff engine, 3D WebGL visualizer, and CAD layers. |
| `2.4.0-PROD` | Nov 25, 2026 | Lead Architect | Full production freeze: AI copilot, SAT collision separator, and Render IaC. |

### Intended Audience & Stakeholders
1. **Academic Supervisors & Examiners**: To verify formal requirements traceability, mathematical soundness, architectural rationale, and ISO/IEEE compliance.
2. **Full-Stack Software Engineers**: As the authoritative contract for the Next.js 14 frontend, Spring Boot 3 microservice backend, and PostgreSQL database.
3. **Quality Assurance (QA) Engineers**: To derive automated test cases from functional requirements, numeric thresholds, and acceptance criteria.
4. **DevOps & Cloud Engineers**: For maintaining the Render Infrastructure-as-Code (`render.yaml`), Docker container pipelines, and health probes.

### How to Read This Document
- **Chapters 1–2**: High-level system overview, stakeholder personas, and operational boundaries.
- **Chapters 3–4**: Distributed 3-tier architecture, reactive state store mechanics, and relational data schemas.
- **Chapter 5**: Uniquely indexed, testable functional requirements (`FR-01` to `FR-10`). Requirement keywords **shall** (mandatory) and **should** (recommended) are utilized in strict adherence to IEEE 830.
- **Chapter 6**: Exact mathematical derivations (SAT collision geometry, physics relaxation impulse, BoQ takeoff formulas, IBC/Neufert ergonomic heuristics).
- **Chapter 7**: RESTful API interface contracts with exact controller route paths, request payloads, and status codes.
- **Chapters 8–12**: Use-case models, non-functional requirements (NFRs), deployment topology, verification results, and traceability matrix.

---

## 1. INTRODUCTION

### 1.1 Purpose and Intent
This document defines the formal Software Requirements Specification (SRS) and System Design Document (SDD) for **RoomSketch**. RoomSketch is a cloud-native, browser-based Computer-Aided Design (CAD) and spatial planning environment. It addresses the friction between heavyweight desktop CAD suites (such as Autodesk AutoCAD, Revit, or ArchiCAD) and simplistic consumer interior styling tools. 

RoomSketch executes parametric 2D vector CAD drafting, automated International Building Code (IBC) egress verification, procedural WebGL 3D volumetric extrusion, multi-discipline Building Services (MEP) schematics, and instantaneous Bill of Quantities (BoQ) material takeoffs directly within modern web browsers without native desktop plugins or installation overhead.

### 1.2 System Scope
The platform provides an integrated suite of four core functional subsystems:
| # | Subsystem | Functional Scope |
| :-: | :--- | :--- |
| **1** | **Interactive 2D Parametric CAD Engine** | Canvas-based vector geometry modeling with continuous Cartesian grid snapping ($50\text{px} = 1.0\text{m}$), polygonal room closure, dynamic dimensional annotations, opening fenestration (doors/windows), and full catalog furniture placement. |
| **2** | **Procedural WebGL 3D Spatial Visualizer** | Real-time client-side extrusion of 2D coordinates into textured 3D volumetric structures, featuring cutaway walls ($1.2\text{m}$ inspection cut) and full-height mode ($2.6\text{m}$), soft shadow illumination, and spherical camera orbit physics. |
| **3** | **AI Architectural Copilot & Ergonomics Engine** | IBC Section 1005 / Ernst Neufert compliance scanner, paired with an autonomous collision separator powered by the Separating Axis Theorem (SAT) and a natural language conversational agent that generates structured layouts from text prompts. |
| **4** | **Quantity Surveying & Cost Takeoff Engine** | Deterministic geometric material takeoffs that compute net floor finishes ($+10\%$ cutting waste), subtract door/window apertures from wall plaster/paint estimates, aggregate skirting linear perimeters, calculate trades labor costs, and export formatted CSV reports across global currencies. |

### 1.3 Definitions, Acronyms and Abbreviations
- **Aperture**: A fenestration opening (door or window) carved into a wall polygon that is mathematically deducted from wall surface finish quantities.
- **BoQ**: Bill of Quantities — an itemized survey detailing materials, parts, trades labor, and costs.
- **CAD**: Computer-Aided Design.
- **IBC**: International Building Code; Section 1005 specifically governs minimum width and clearance of egress pathways.
- **MEP**: Mechanical, Electrical, and Plumbing building engineering services.
- **OBB**: Oriented Bounding Box — a rectangular bounding area oriented at an arbitrary rotation angle $\theta$.
- **PBR**: Physically Based Rendering material model representing roughness, metalness, and diffuse albedo.
- **PCF**: Percentage-Closer Filtering used in WebGL shadow map generation for soft, realistic shadow penumbras.
- **SAT**: Separating Axis Theorem — a mathematical formulation proving that two convex polygons do not intersect if there exists a projection line upon which their shadows are disjoint.
- **FloorLayoutData**: The serialized JSON document encapsulating room polygons, furniture items, and openings for a specific building floor level.

---

## 2. OVERALL SYSTEM DESCRIPTION

### 2.1 Product Perspective
RoomSketch operates as a decoupled, multi-tier web application:
1. **Client Tier**: A React 18 / Next.js 14 client executing high-density vector CAD mathematics, Three.js WebGL tessellation, SAT collision checks, and BoQ cost estimation locally on the browser main/worker thread.
2. **Edge Proxy Tier**: A Next.js 14 server deployed on Render providing server-side HTML hydration, edge asset caching, and transparent reverse-proxy rewrites (`/api/*` $\to$ backend:8080) unifying all traffic under a single origin (`roomsketch.onrender.com`).
3. **Application Core**: A stateless Spring Boot 3.2.0 (Java 21 LTS) microservice owning authentication, business rules, multi-tenant authorization, and project persistence.
4. **Persistence Tier**: A managed PostgreSQL 16 database utilizing pooled connections managed by HikariCP.

### 2.2 User Classes and Access Matrix
| User Class | Description | System Privileges |
| :--- | :--- | :--- |
| **Registered Architect / Designer (`ROLE_USER`)** | Professional designer, contractor, or homeowner creating custom plans. | Full CRUD on owned projects and floors; share token generation; drawing export. |
| **Demo User** | Evaluator logging in via the 1-Click Instant Demo gateway. | Instant session authenticated against demo account (`demo@roomsketch.com`) pre-seeded with multi-room apartment blueprints. |
| **Guest Viewer (Public)** | External client or trade contractor reviewing a design link. | Unauthenticated, strictly read-only access to floor layouts via cryptographic token (`/shared/{token}`). |

### 2.3 Design & Implementation Constraints
1. **Unified Origin Enforcement**: The browser strictly communicates with `roomsketch.onrender.com`. All API requests route to `/api/*` and are proxied server-side to the backend, completely eliminating Cross-Origin Resource Sharing (CORS) preflight round-trips and cookie partitioning constraints.
2. **Stateless Scalability**: No HTTP sessions are maintained on the application server. Authentication is verified per-request via cryptographically signed HMAC-SHA256 JWT tokens.
3. **Document-Centric Floor Persistence**: Floor layouts are persisted as serialized JSON documents in `floors.layout_data`, enabling atomic commits, instant whole-floor snapshotting, and client-side undo/redo without relational schema fragmentation.
4. **Cloud Standby Wakeup Tolerance**: To accommodate free-tier container standby states (Render 15-minute spin-down), the client interceptor traps HTTP 502/503 responses and provides real-time warmup guidance rather than displaying false credential error messages.

---

## 3. SYSTEM ARCHITECTURE & COMPONENT DESIGN

### 3.1 Distributed Cloud Topology
```
+-----------------------------------------------------------------------------------+
|                              CLIENT WEB BROWSER                                   |
|  +---------------------+  +----------------------+  +--------------------------+  |
|  |  React 18 / Next.js |  |  HTML5 Canvas 2D CAD |  |  Three.js WebGL 3D Scene |  |
|  |   App Router SPA    |  |  (Konva Layer Stack) |  |   (Procedural Extrusion) |  |
|  +----------+----------+  +----------+-----------+  +------------+-------------+  |
|             |                        |                           |                |
|             +------------------------+---------------------------+                |
|                                      |                                            |
|                 Zustand Reactive State Store (Central Hub)                       |
|           [ Layout Slices | Undo/Redo Stacks | 1200ms Autosave Queue ]           |
+--------------------------------------|--------------------------------------------+
                                       | HTTPS (Unified Origin: /api/*)
                                       v
+-----------------------------------------------------------------------------------+
|                 EDGE INGRESS & REVERSE PROXY (Next.js 14 Server)                  |
|                           Domain: roomsketch.onrender.com                         |
|  - Server-Side Rewrites: /api/:path*  -->  roomsketch-backend:8080/api/:path*     |
|  - Edge Static Asset Caching & SSR HTML Hydration                                 |
|  - Automatic HTTP 502/503 Standby Warmup Shielding                                |
+--------------------------------------|--------------------------------------------+
                                       | Internal VPC Network (mTLS / SSL)
                                       v
+-----------------------------------------------------------------------------------+
|               APPLICATION CORE: SPRING BOOT 3.2.0 (Java 21 LTS)                   |
|                        Host: roomsketch-backend.onrender.com                      |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  | Security Filter    |  | REST Controllers     |  | Service Layer             |  |
|  | - JWT HMAC-SHA256  |  | - AuthController     |  | - AuthService             |  |
|  | - BCrypt Hasher    |  | - ProjectController  |  | - ProjectService          |  |
|  | - Stateless Session|  | - FloorController    |  | - FloorService            |  |
|  | - Role Auth        |  | - ShareController    |  | - ShareService            |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|                                      |                                            |
|                                Spring Data JPA                                    |
|                       Hibernate 6.4 ORM Layer (Prepared SQL)                      |
|                                      |                                            |
|                          HikariCP Connection Pool                                 |
+--------------------------------------|--------------------------------------------+
                                       | PostgreSQL Wire Protocol (TCP 5432)
                                       v
+-----------------------------------------------------------------------------------+
|               PERSISTENCE TIER: MANAGED POSTGRESQL 16 (Render Managed)            |
|                              Database: roomsketch_db                              |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  | users Table        |  | projects Table       |  | floors Table              |  |
|  | (UUID, BCrypt hash)|  | (UUID, Owner Ref)    |  | (UUID, Layout JSON TEXT)  |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  | shared_projects Table (UUID, Cryptographic Share Token, Expiry Timestamp)    |  |
+-----------------------------------------------------------------------------------+
```

### 3.2 Client Reactive State Engine (Zustand)
All editor interaction is managed through an atomic state model implemented in `frontend/src/store/editorStore.ts`:
- **State Slicing**: The store maintains discrete reactive slices for room polygons (`rooms`), catalog furniture items (`furniture`), wall openings (`doorsWindows`), and multi-layer visibility switches (`showElectrical`, `showPlumbing`, `showLighting`, `showHvac`).
- **Undo / Redo History Stack**: Mutations are captured immutably upon transaction completion (e.g., `onMouseUp` or discrete dropdown commits). A circular buffer retains up to 50 previous states. Branching mutations following an undo discard future redo branches.
- **Debounced Network Autosave**: When any layout entity is modified, `saveStatus` transitions to `"unsaved"`. A $1200\text{ms}$ debounce timer delays HTTP dispatch. If subsequent edits occur within that window, the timer resets. Upon expiration, the store commits the serialized JSON layout via `PUT /api/floors/{floorId}/layout`, transitioning to `"saved"`.

```
User / Canvas           Zustand Store          Autosave Timer         FloorController          PostgreSQL
     |                        |                      |                       |                      |
     |--- Entity Mutation --->|                      |                       |                      |
     |    (drag/resize/add)   |                      |                       |                      |
     |                        |-- saveStatus='unsaved'                       |                      |
     |                        |-- Start/Reset 1200ms-|                       |                      |
     |                        |                      |                       |                      |
     |--- Further Edit ------>|                      |                       |                      |
     |    (within window)     |-- Reset Timer ------>|                       |                      |
     |                        |                      |                       |                      |
     |                        |                      |-- Window Elapsed ---->|                      |
     |                        |                      |   (Trigger Autosave)  |                      |
     |                        |<-- Serialize JSON ---|                       |                      |
     |                        |                                              |                      |
     |                        |--- PUT /api/floors/{floorId}/layout -------->|                      |
     |                        |    Payload: { layoutData: string }           |--- UPDATE floors --->|
     |                        |                                              |<-- 200 OK -----------|
     |                        |<-- 200 OK (FloorResponse) -------------------|                      |
     |<-- status='saved' -----|                                              |                      |
```

---

## 4. DATABASE SCHEMA & DATA DICTIONARY

### 4.1 Relational Schema Specification
The database comprises four relational tables in PostgreSQL 16 managed through Spring Data JPA / Hibernate:

```
+-----------------------------------+          1:N         +-----------------------------------+
|               users               |--------------------<|             projects              |
+-----------------------------------+                     +-----------------------------------+
| PK  id             UUID           |                     | PK  id             UUID           |
|     email          VARCHAR(255)   |<-- UNIQUE           | FK  user_id        UUID           |
|     password_hash  VARCHAR(255)   |                     |     name           VARCHAR(255)   |
|     first_name     VARCHAR(100)   |                     |     description    TEXT           |
|     last_name      VARCHAR(100)   |                     |     unit_system    VARCHAR(20)    |
|     role           VARCHAR(50)    |                     |     thumbnail_data TEXT           |
|     created_at     TIMESTAMPTZ    |                     |     created_at     TIMESTAMPTZ    |
|     updated_at     TIMESTAMPTZ    |                     |     updated_at     TIMESTAMPTZ    |
+-----------------------------------+                     +-----------------+-----------------+
                                                                            |
                                                                            | 1:N (CASCADE)
                                                                            v
+-----------------------------------+          1:N (CASCADE)+---------------+------------------+
|          shared_projects          |>--------------------|              floors               |
+-----------------------------------+                     +-----------------------------------+
| PK  id             UUID           |                     | PK  id             UUID           |
| FK  project_id     UUID (CASCADE) |                     | FK  project_id     UUID (CASCADE) |
|     share_token    VARCHAR(255)   |<-- UNIQUE           |     name           VARCHAR(100)   |
|     is_active      BOOLEAN        |                     |     floor_number   INT            |
|     expires_at     TIMESTAMPTZ    |                     |     layout_data    TEXT (JSON)    |
|     created_at     TIMESTAMPTZ    |                     |     created_at     TIMESTAMPTZ    |
+-----------------------------------+                     |     updated_at     TIMESTAMPTZ    |
                                                          +-----------------------------------+
```

#### 4.1.1 Table: `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | RFC 4122 randomly generated UUID. |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | User login identifier. Indexed for $O(1)$ lookup. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | One-way salted hash generated via BCrypt (10 rounds). |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | Given name. |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | Surname. |
| `role` | `VARCHAR(50)` | `NOT NULL, DEFAULT 'ROLE_USER'` | Access control role (`ROLE_USER`, `ROLE_ADMIN`). |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Audit timestamps. |

#### 4.1.2 Table: `projects`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Project identifier. |
| `user_id` | `UUID` | `NOT NULL, REFERENCES users(id) ON DELETE CASCADE` | Owner user identifier. Indexed. |
| `name` | `VARCHAR(255)` | `NOT NULL` | Project name (e.g., "Scandinavian Penthouse"). |
| `description` | `TEXT` | `NULLABLE` | Architectural project notes. |
| `unit_system` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'METERS'` | Measurement system (`METERS`, `CENTIMETERS`, `FEET`). |
| `thumbnail_data` | `TEXT` | `NULLABLE` | Base64 PNG snapshot of primary floor plan for dashboard cards. |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Audit timestamps. |

#### 4.1.3 Table: `floors`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Floor identifier. |
| `project_id` | `UUID` | `NOT NULL, REFERENCES projects(id) ON DELETE CASCADE` | Parent project identifier. Indexed. |
| `name` | `VARCHAR(100)` | `NOT NULL` | Floor name (e.g. "Ground Floor", "Level 2"). |
| `floor_number` | `INT` | `NOT NULL, DEFAULT 1` | Vertical building story index. |
| `layout_data` | `TEXT` | `NULLABLE` | Serialized JSON floor plan document (`FloorLayoutData`). |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Audit timestamps. |

#### 4.1.4 Table: `shared_projects`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Share record identifier. |
| `project_id` | `UUID` | `NOT NULL, REFERENCES projects(id) ON DELETE CASCADE` | Shared project identifier. |
| `share_token` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Cryptographically random public access token. Indexed. |
| `is_active` | `BOOLEAN` | `NOT NULL, DEFAULT TRUE` | Active killswitch flag to immediately revoke guest link. |
| `expires_at` | `TIMESTAMPTZ` | `NULLABLE` | Optional timestamp expiration barrier. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp. |

---

## 5. FUNCTIONAL REQUIREMENTS (FR)

All requirements use IEEE 830 priority classification: **M = Mandatory**.

### FR-01: Identity, Authentication and Session Authorization
- **FR-01.1 [M]**: The system shall authenticate users with stateless JSON Web Tokens (JWT) signed using HMAC-SHA256 with a 24-hour expiration lifetime.
- **FR-01.2 [M]**: The system shall store passwords exclusively as one-way salted hashes using BCrypt with a work factor of 10 rounds. Plaintext passwords shall never be persisted or logged.
- **FR-01.3 [M]**: The system shall provide unauthenticated endpoints for registration (`POST /api/auth/register`) and login (`POST /api/auth/login`).
- **FR-01.4 [M]**: The system shall provide a 1-Click Instant Demo login mechanism that authenticates against a pre-seeded account (`demo@roomsketch.com`) holding pre-configured architectural plans.
- **FR-01.5 [M]**: The client application shall intercept HTTP 502 and 503 gateway responses caused by cloud container standby sleep (Render 15-minute spin-down) and display real-time warmup guidance.
- **FR-01.6 [M]**: All protected API resources shall enforce Bearer-JWT validation and reject unauthorized requests with HTTP 401.

### FR-02: 2D Interactive CAD Drafting Engine
- **FR-02.1 [M]**: The drafting canvas shall use a global coordinate scale of $50\text{ px} = 1.0\text{ meter}$ ($1\text{ px} = 2.0\text{ cm}$).
- **FR-02.2 [M]**: Vector manipulation operations (drawing, moving, resizing) shall snap to a $25\text{ px}$ ($0.5\text{ m}$) grid, with optional $5\text{ px}$ fine-tuning.
- **FR-02.3 [M]**: Room boundaries shall be resizable via 8-handle bounding box control anchors.
- **FR-02.4 [M]**: Wall thickness shall be parameterizable between $10\text{ px}$ ($20\text{ cm}$) and $30\text{ px}$ ($60\text{ cm}$).
- **FR-02.5 [M]**: Door and window openings shall snap perpendicularly onto room wall edges and visually render opening swing arcs.
- **FR-02.6 [M]**: The canvas shall dynamically compute and display dimensional callout annotations indicating interior room clearance in meters, centimeters, or feet.
- **FR-02.7 [M]**: Furniture entities shall support drag-and-drop placement, continuous rotation ($\theta \in [0^\circ, 360^\circ)$), dimensional locking, and z-index reordering.

### FR-03: Multi-Layer MEP Engineering CAD Overlays
- **FR-03.1 [M]**: The system shall provide a dedicated Electrical engineering layer containing duplex receptacles, quad outlets, circuit breaker distribution panels (MDB), and data ports.
- **FR-03.2 [M]**: The system shall provide a dedicated Plumbing engineering layer containing fresh water supply stubs, blackwater soil drain stacks, and floor traps.
- **FR-03.3 [M]**: The system shall provide a dedicated Lighting engineering layer containing recessed LED ceiling downlights, chandeliers, and toggle switches.
- **FR-03.4 [M]**: The system shall provide a dedicated HVAC engineering layer containing ducted supply diffusers, return grilles, split AC evaporators, and exhaust vents.
- **FR-03.5 [M]**: Each engineering overlay and the furniture layer shall feature an independent visibility toggle that alters canvas rendering without modifying the underlying layout document.

### FR-04: Client-Side WebGL 3D Spatial Visualizer
- **FR-04.1 [M]**: The system shall procedurally extrude 2D floor plan coordinate geometry into 3D volumetric meshes in real time directly within the browser using Three.js.
- **FR-04.2 [M]**: The 3D scene shall support two wall height visualization modes:
  - **Cutaway Mode ($1.2\text{m}$ wall height)**: Unobstructed dollhouse inspection view across all rooms simultaneously.
  - **Full-Enclosure Mode ($2.6\text{m}$ wall height)**: Full ceiling clearance structural visualization.
- **FR-04.3 [M]**: Floor surfaces shall render realistic PBR texture materials (Oak Hardwood, Carrara Marble, Ceramic Slate, Polished Concrete).
- **FR-04.4 [M]**: The visualizer shall provide soft directional sunlight illumination with Percentage-Closer Filtered (`PCFSoftShadowMap`) shadow maps.
- **FR-04.5 [M]**: The camera shall provide continuous spherical orbit controls ($\theta$ azimuth, $\phi$ polar elevation, and zoom damping).

### FR-05: Automated Bill of Quantities (BoQ) & Takeoff Cost Estimation
- **FR-05.1 [M]**: The engine shall calculate net internal floor surface area per room and add a $+10\%$ material cutting waste allowance.
- **FR-05.2 [M]**: The engine shall compute gross wall finish area ($2.80\text{m}$ standard ceiling height) and deduct door and window aperture void areas.
- **FR-05.3 [M]**: Baseboard skirting lengths shall be derived from internal room perimeters minus door opening widths.
- **FR-05.4 [M]**: Furniture and fixtures shall be itemized with unit costs and quantity subtotals.
- **FR-05.5 [M]**: The estimate shall aggregate direct costs and append an $+18\%$ trade labor allowance and an $+8\%$ contingency reserve.
- **FR-05.6 [M]**: Cost calculations shall convert across six currencies: USD (`$`), EUR (`€`), GBP (`£`), BDT (`৳`), CAD (`CA$`), and AUD (`AU$`).
- **FR-05.7 [M]**: The BoQ summary shall be exportable as a standardized CSV report.

### FR-06: AI Architectural Ergonomics & Code Audit Engine
- **FR-06.1 [M]**: The scanner shall verify that egress corridor widths satisfy the IBC Section 1005 standard ($\ge 90\text{cm}$ / $45\text{px}$).
- **FR-06.2 [M]**: The scanner shall flag any furniture obstructing door swing clearance arcs ($R = w_{door} + 25\text{px}$).
- **FR-06.3 [M]**: The scanner shall enforce bilateral bed walking clearances of at least $60\text{cm}$ ($30\text{px}$).
- **FR-06.4 [M]**: The scanner shall enforce a minimum $0.60\text{m}$ separation between kitchen sinks and cooking appliances.
- **FR-06.5 [M]**: Unfurnished room polygons shall be flagged for automatic layout generation.
- **FR-06.6 [M]**: The engine shall output a comprehensive design compliance score on a scale of $0$ to $100$.

### FR-07: Conversational AI Copilot & Generative Text-to-Plan Engine
- **FR-07.1 [M]**: The copilot shall generate structured spatial layouts and place furniture entities from natural language text prompts (text-to-plan).
- **FR-07.2 [M]**: The copilot shall provide interactive contextual design advice referencing active rooms, furniture density, and code warnings.
- **FR-07.3 [M]**: The copilot shall provide 1-click execution chips to trigger layout optimization, MEP layer population, and code audit fixes.
- **FR-07.4 [M]**: The copilot shall calculate and answer natural-language BoQ financial queries.

### FR-08: Autonomous SAT Collision Detection & 1-Click Layout Remediation
- **FR-08.1 [M]**: Physical overlap detection between rotated furniture entities shall execute via the Separating Axis Theorem (SAT).
- **FR-08.2 [M]**: All-pairs collision testing ($O(N^2)$) shall complete in $< 5\text{ms}$ for standard residential room densities.
- **FR-08.3 [M]**: A single-click action shall run an iterative multi-pass relaxation solver (up to 5 passes) that displaces overlapping items along collision normals.
- **FR-08.4 [M]**: The solver shall automatically repel furniture obstructing doorway egress arcs toward room centroids.
- **FR-08.5 [M]**: Locked furniture items shall remain stationary during relaxation passes.

### FR-09: Multi-Floor Architectural Hierarchy & Cloud State Synchronization
- **FR-09.1 [M]**: Projects shall support multiple story levels, each holding independent CAD layout documents.
- **FR-09.2 [M]**: Switching floors shall immediately flush any pending debounced autosave state to PostgreSQL before loading the target floor.
- **FR-09.3 [M]**: Project listings shall query floor metadata via batch operations to eliminate N+1 database round-trips.
- **FR-09.4 [M]**: CAD mutations shall persist automatically via the $1200\text{ms}$ debounced network pipeline (`PUT /api/floors/{floorId}/layout`).

### FR-10: Architectural Sheet Generation, Canvas Snapshot & Read-Only Collaboration
- **FR-10.1 [M]**: The system shall export high-DPI raster image snapshots of the active canvas.
- **FR-10.2 [M]**: The system shall generate multi-page architectural vector PDF drawing sheets with project metadata title blocks and room schedules.
- **FR-10.3 [M]**: An authenticated owner shall generate secure, cryptographic public share tokens (`POST /api/projects/{projectId}/share`).
- **FR-10.4 [M]**: External guests shall view shared layouts in read-only mode (`GET /api/shared/{token}`) without requiring an account.
- **FR-10.5 [M]**: Share tokens shall support active killswitch revocation and optional time-to-live expiration.

---

## 6. ALGORITHMIC & MATHEMATICAL SPECIFICATIONS

### 6.1 Separating Axis Theorem (SAT) for Rotated Rectangles
For an entity centered at $(c_x, c_y)$ with width $w$, height $h$, and rotation $\theta$ degrees:
$$\alpha = \frac{\theta \cdot \pi}{180}, \quad v_k \in \left\{\left(-\frac{w}{2}, -\frac{h}{2}\right), \left(\frac{w}{2}, -\frac{h}{2}\right), \left(\frac{w}{2}, \frac{h}{2}\right), \left(-\frac{w}{2}, \frac{h}{2}\right)\right\}$$
$$\begin{pmatrix} X_k \\ Y_k \end{pmatrix} = \begin{pmatrix} c_x \\ c_y \end{pmatrix} + \begin{pmatrix} \cos\alpha & -\sin\alpha \\ \sin\alpha & \cos\alpha \end{pmatrix} \begin{pmatrix} v_{k,x} \\ v_{k,y} \end{pmatrix}$$

For each edge normal $\vec{n} = \begin{pmatrix} -e_y \\ e_x \end{pmatrix}$, all vertices of polygons $A$ and $B$ are projected via scalar dot product $s = \vec{p} \cdot \vec{n}$, establishing projection intervals $[a_{min}, a_{max}]$ and $[b_{min}, b_{max}]$. If for any normal:
$$a_{max} < b_{min} \quad \lor \quad b_{max} < a_{min}$$
then $\vec{n}$ is a separating axis, and the items are disjoint. If no separating axis exists, a physical collision is registered.

### 6.2 Multi-Pass Autonomous Physics Relaxation Solver
The solver (`resolveAllLayoutCollisions`) runs up to 5 passes over non-locked items:
1. **Perimeter Clamping**: Ensures items remain inside room boundaries:
   $$x \in \left[x_{room} + \frac{w}{2} + 10, \, x_{room} + w_{room} - \frac{w}{2} - 10\right]$$
   $$y \in \left[y_{room} + \frac{h}{2} + 10, \, y_{room} + h_{room} - \frac{h}{2} - 10\right]$$
2. **Impulse Separation Along Normal**: For overlapping items $A$ and $B$, computes unit normal $\vec{n} = \frac{\vec{p}_B - \vec{p}_A}{\|\vec{p}_B - \vec{p}_A\|}$ and applies separation pushes:
   $$\vec{p}_B \leftarrow \vec{p}_B + 0.6 \cdot d_{push} \cdot \vec{n}, \quad \vec{p}_A \leftarrow \vec{p}_A - 0.6 \cdot d_{push} \cdot \vec{n}$$
3. **Door Clearance**: If an item lies within radius $R = w_{door} + 25\text{px}$, it is repelled away from the door opening toward the room's centroid.

```
       Start: User Clicks "Auto-Fix Layout"
                         |
                         v
                    pass = 1
                         |
                         v
     +-----------------------------------------------+
     | Clamp non-locked items 10px inside room walls |
     +-----------------------------------------------+
                         |
                         v
     +-----------------------------------------------+
     | Detect all rotated overlaps using SAT math    |
     +-----------------------------------------------+
                         |
                         v
     +-----------------------------------------------+
     | Displace colliding pairs along collision      |
     | normal: p <- p +/- (0.6 * d_push * n)         |
     +-----------------------------------------------+
                         |
                         v
     +-----------------------------------------------+
     | Repel items obstructing door swing arcs       |
     | (Radius: w_door + 25px) toward room centroid  |
     +-----------------------------------------------+
                         |
                         v
             /-----------------------\
            /   No overlaps left,     \
           <    or pass == 5 ?         >
            \                         /
             \-----------------------/
                   |            |
                  Yes           No
                   |            |
                   |            +--> pass = pass + 1
                   v                      ^
     +---------------------------+        |
     | Commit state to history   |        |
     | & trigger autosave        |--------+
     +---------------------------+
```

### 6.3 Bill of Quantities (BoQ) Takeoff Formulas
Canvas dimensions are in pixels ($50\text{ px} = 1.0\text{ m}$; $2500\text{ px}^2 = 1.0\text{ m}^2$):
- **Flooring Area with Waste ($+10\%$)**:
  $$A_{flooring} = \left(\frac{w}{50} \times \frac{h}{50}\right) \times 1.10 \quad [\text{m}^2]$$
- **Net Wall Finish Area (Ceiling Height $H = 2.80\text{m}$)**:
  $$A_{wall\_gross} = 2 \times \left(\frac{w + h}{50}\right) \times 2.80 \quad [\text{m}^2]$$
  $$A_{wall\_net} = \max\left(0, \, A_{wall\_gross} - \sum \frac{w_{aperture} \cdot h_{aperture}}{2500}\right) \quad [\text{m}^2]$$
- **Emulsion Paint Volume (2 Coats @ $9.0\text{ m}^2/\text{L}$)**:
  $$V_{paint} = \frac{A_{wall\_net}}{9.0} \quad [\text{Liters}]$$
- **Baseboard Skirting Perimeter**:
  $$L_{skirting} = \max\left(0, \, 2 \times \left(\frac{w + h}{50}\right) - \sum \frac{w_{door}}{50}\right) \quad [\text{linear meters}]$$
- **Grand Financial Total**:
  $$C_{direct} = C_{materials} + C_{furniture}$$
  $$C_{labor} = C_{direct} \times 0.18$$
  $$C_{contingency} = (C_{direct} + C_{labor}) \times 0.08$$
  $$C_{grand\_total} = C_{direct} + C_{labor} + C_{contingency}$$

#### Worked Example
For a room measuring $250 \times 200\text{ px}$ ($5.0\text{m} \times 4.0\text{m}$) containing one door $45 \times 105\text{ px}$ ($0.9\text{m} \times 2.1\text{m}$) and one window $75 \times 60\text{ px}$ ($1.5\text{m} \times 1.2\text{m}$):
- **Flooring**: $(5.0 \times 4.0) \times 1.10 = \mathbf{22.00\text{ m}^2}$
- **Gross Wall Area**: $2 \times (5.0 + 4.0) \times 2.80 = \mathbf{50.40\text{ m}^2}$
- **Apertures**: $\frac{45 \times 105}{2500} + \frac{75 \times 60}{2500} = 1.89 + 1.80 = \mathbf{3.69\text{ m}^2}$
- **Net Wall Area**: $50.40 - 3.69 = \mathbf{46.71\text{ m}^2}$
- **Emulsion Paint**: $46.71 / 9.0 = \mathbf{5.19\text{ Liters}}$
- **Skirting**: $2 \times (5.0 + 4.0) - 0.9 = 18.0 - 0.9 = \mathbf{17.10\text{ meters}}$
- **Cost Total** ($C_{direct} = \$1000.00$):
  $$C_{labor} = \$180.00, \quad C_{contingency} = 0.08 \times \$1180.00 = \$94.40, \quad C_{grand} = \mathbf{\$1274.40}$$

---

## 7. RESTFUL API INTERFACE CONTRACTS

All API endpoints are hosted under the unified origin `/api/*`. Authenticated endpoints require the header `Authorization: Bearer <JWT>`. Responses use a standard envelope `ApiResponse<T>`.

| HTTP Verb | Exact Endpoint Path | Description | Authentication |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account. | Public (None) |
| `POST` | `/api/auth/login` | Authenticate credentials; return JWT bearer token. | Public (None) |
| `GET` | `/api/projects` | List all projects belonging to user (batch floor querying). | Bearer JWT |
| `POST` | `/api/projects` | Create a new project and initialize Floor 1. | Bearer JWT |
| `GET` | `/api/projects/{id}` | Retrieve project metadata and all associated floor entities. | Bearer JWT |
| `PUT` | `/api/projects/{id}` | Update project metadata (name, description, unit system). | Bearer JWT |
| `DELETE` | `/api/projects/{id}` | Delete project with cascading deletion of child floors. | Bearer JWT |
| `POST` | `/api/projects/{id}/duplicate` | Duplicate an entire project hierarchy and all child floors. | Bearer JWT |
| `GET` | `/api/projects/stats` | Retrieve dashboard portfolio statistics (area, counts). | Bearer JWT |
| `POST` | `/api/projects/{projectId}/floors` | Add a new floor story to the designated project. | Bearer JWT |
| `PUT` | `/api/floors/{floorId}` | Update floor metadata (name and floor number). | Bearer JWT |
| `DELETE` | `/api/floors/{floorId}` | Delete floor level from project. | Bearer JWT |
| `POST` | `/api/floors/{floorId}/duplicate` | Duplicate an existing floor level and its layout. | Bearer JWT |
| `GET` | `/api/floors/{floorId}/layout` | Retrieve raw floor plan layout JSON document. | Bearer JWT |
| `PUT` | `/api/floors/{floorId}/layout` | Persist floor plan layout JSON document (autosave endpoint). | Bearer JWT |
| `POST` | `/api/projects/{projectId}/share` | Generate or retrieve active read-only public share token. | Bearer JWT |
| `DELETE` | `/api/projects/{projectId}/share` | Revoke active public share token immediately. | Bearer JWT |
| `GET` | `/api/shared/{token}` | Public guest view of project layout (no editing privileges). | Public (None) |
| `GET` | `/api/health` | Container liveness and readiness health probe. | Public (None) |

---

## 8. NON-FUNCTIONAL REQUIREMENTS (NFR)

| ID | Category | Requirement Statement | Verification Metric |
| :--- | :--- | :--- | :--- |
| **NFR-01** | Performance | The 2D canvas and 3D WebGL scenes shall maintain continuous 60 FPS animation during viewport transformations. | Frame budget $< 16.6\text{ms}$. |
| **NFR-02** | Performance | Backend query processing for project and floor listings shall execute in $< 80\text{ms}$. | Backend server metrics. |
| **NFR-03** | Performance | Network persistence requests shall be throttled by a $1200\text{ms}$ debounced write queue. | Network trace verification. |
| **NFR-04** | Performance | Pairwise SAT collision detection for residential layouts shall complete in $< 5\text{ms}$. | Vitest collision test suite. |
| **NFR-05** | Security | User passwords shall be salted and hashed via BCrypt (10 rounds). Plaintext passwords shall never be persisted. | Database inspection test. |
| **NFR-06** | Security | Authentication tokens shall use HMAC-SHA256 signatures with 256-bit key derivation and 24-hour expiration. | Security filter unit test. |
| **NFR-07** | Security | All database access shall pass through Spring Data JPA parameterized prepared statements, preventing SQL injection. | Static code analysis. |
| **NFR-08** | Security | The backend shall enforce CORS origin whitelisting allowing only authenticated hostnames. | Integration test. |
| **NFR-09** | Reliability | The frontend shall intercept HTTP 502/503 container standby sleep events and guide users during warmup. | Simulated 502 test. |
| **NFR-10** | Reliability | Container health shall be monitored via `GET /api/health` probes. | Render orchestration logs. |
| **NFR-11** | Integrity | Foreign key cascades shall ensure no orphaned floor or share records persist following project deletion. | Integration delete test. |
| **NFR-12** | Maintainability| Codebase shall follow strict layered architecture (controller $\to$ service $\to$ repository) and single-hub state. | Architecture review. |
| **NFR-13** | Portability | System shall build reproducibly via multi-stage Dockerfiles (`eclipse-temurin:21-jre-alpine`, `node:20-alpine`). | Docker build verification. |
| **NFR-14** | Usability | Platform shall require zero client-side installation or browser plugins. | Evergreen browser audit. |
| **NFR-15** | Testability | Automated test suites shall achieve a 100% pass rate across core CAD, BoQ, SAT, and store actions. | **14 suites, 93 tests passed**. |

---

## 9. DEPLOYMENT & INFRASTRUCTURE AS CODE

The deployment is managed as Infrastructure-as-Code via `render.yaml`:
```
Client Web Browser (Chrome / Edge / Safari / Firefox)
        |
        | HTTPS (Port 443)
        v
+-----------------------------------------------------------+
| Render Web Service: roomsketch (Next.js 14 App Router)    |
| Build: node:20-alpine                                     |
| Role: Edge Ingress, SSR Hydration, /api/* Reverse Proxy   |
+-----------------------------------------------------------+
        |
        | Internal VPC Network: /api/* (Port 8080)
        v
+-----------------------------------------------------------+
| Render Web Service: roomsketch-backend (Spring Boot 3.2)  |
| Build: eclipse-temurin:21-jre-alpine                      |
| Role: REST API Microservice, Security Filter, Health Probe|
+-----------------------------------------------------------+
        |
        | PostgreSQL Wire Protocol (TCP 5432)
        v
+-----------------------------------------------------------+
| Render Managed Database: roomsketch-db (PostgreSQL 16)    |
| Pool: HikariCP (Connection Pooling)                       |
+-----------------------------------------------------------+
```

---

## 10. VERIFICATION, VALIDATION & ACCEPTANCE CHECKS

The platform is validated by **14 automated test suites containing 93 unit tests with a 100% pass rate** (`vitest run`):
- `tests/shortcutsModal.test.ts` (2 tests passed)
- `tests/aiArchitectEngine.test.ts` (6 tests passed)
- `tests/projectStore.test.ts` (4 tests passed)
- `tests/boqEngine.test.ts` (6 tests passed)
- `tests/utils.test.ts` (6 tests passed)
- `tests/floorAutosave.test.ts` (11 tests passed)
- `tests/aiCopilotEngine.test.ts` (8 tests passed)
- `tests/editorStore.test.ts` (6 tests passed)
- `tests/authStore.test.ts` (3 tests passed)
- `tests/engineeringLayers.test.ts` (4 tests passed)
- `tests/furniture.test.ts` (9 tests passed)
- `tests/collisionAndOpenings.test.ts` (15 tests passed)
- `tests/threeDVisualizer.test.ts` (4 tests passed)
- `tests/materialsExportShare.test.ts` (9 tests passed)

### Formal Acceptance Checks (AC)
- **AC-1 (Authentication)**: Valid login returns JWT token and user profile; invalid credentials return HTTP 401; expired tokens redirect to login.
- **AC-2 (Grid & Snap)**: Wall endpoint drags snap to 25 px grid; history stack records state on mouse release.
- **AC-3 (Autosave Throttle)**: Successive edits within 1.0s trigger exactly one `PUT /api/floors/{id}/layout` call 1200ms after user quiescence.
- **AC-4 (SAT Overlap Resolution)**: Overlapping rotated furniture items separate cleanly within $\le 5$ relaxation passes upon 1-click Auto-Fix.
- **AC-5 (BoQ Takeoff Precision)**: Evaluating the worked example room yields exactly $22.00\text{ m}^2$ flooring, $46.71\text{ m}^2$ net wall area, $5.19\text{ L}$ paint, and $17.10\text{ m}$ skirting.
- **AC-6 (Public Collaboration)**: Accessing a shared project link while unauthenticated displays read-only geometry and rejects modification attempts.
- **AC-7 (Standby Warmup)**: A cold container returning HTTP 502/503 causes the client to display an informative warmup banner and retry rather than failing.

---

## 11. REQUIREMENTS TRACEABILITY MATRIX (RTM)

| Requirement ID | Frontend Component | Backend Controller / Entity | Verification Suite |
| :--- | :--- | :--- | :--- |
| **FR-01** | `(auth)/login`, `AuthGuard.tsx` | `AuthController`, `AuthService`, `users` | `authStore.test.ts`, AC-1, AC-7 |
| **FR-02** | `EditorCanvas.tsx`, `editorStore.ts` | `floors.layout_data` | `editorStore.test.ts`, AC-2 |
| **FR-03** | `EditorToolbar.tsx` (Layer toggles) | `floors.layout_data` | `engineeringLayers.test.ts` |
| **FR-04** | `ThreeSceneViewer.tsx` | N/A (Client WebGL extrusion) | `threeDVisualizer.test.ts` |
| **FR-05** | `BoQModal.tsx`, `boqEngine.ts` | N/A (Client deterministic calculation) | `boqEngine.test.ts`, AC-5 |
| **FR-06** | `AiAdvisorModal.tsx`, `aiArchitectEngine.ts` | N/A (Client IBC heuristic audit) | `aiArchitectEngine.test.ts` |
| **FR-07** | `AiCopilotDrawer.tsx`, `aiCopilotEngine.ts` | N/A (Client natural language parser) | `aiCopilotEngine.test.ts` |
| **FR-08** | `collisionDetection.ts` | N/A (Client SAT & relaxation solver) | `collisionAndOpenings.test.ts`, AC-4 |
| **FR-09** | `editorStore.ts` (Floor management) | `FloorController`, `FloorService`, `floors` | `floorAutosave.test.ts`, AC-3 |
| **FR-10** | `exportEngine.ts`, `shared/[token]` | `ShareController`, `shared_projects` | `materialsExportShare.test.ts`, AC-6 |

---

## APPENDIX A: SYSTEM CONSTANTS
| Metric / Constant | Value | Applied Subsystem |
| :--- | :--- | :--- |
| Canvas Scale Factor | $50\text{ px} = 1.0\text{ meter}$ ($1\text{ px} = 2.0\text{ cm}$) | 2D CAD Engine, BoQ Engine |
| Primary Snap Grid | $25\text{ px}$ ($0.5\text{ meter}$) | 2D CAD Drafting |
| Fine Snap Grid | $5\text{ px}$ ($0.1\text{ meter}$) | Collision Separator |
| Autosave Debounce Window | $1200\text{ ms}$ | Zustand Store & Network Client |
| Undo / Redo Buffer Cap | 50 historical states | State Management |
| JWT Expiry & Algorithm | 24 Hours / HMAC-SHA256 | Spring Security Core |
| Password Hashing Rounds | BCrypt (10 rounds) | Authentication Service |
| 3D Cutaway Wall Height | $1.2\text{ meters}$ | Three.js WebGL Visualizer |
| 3D Full Enclosure Wall Height | $2.6\text{ meters}$ | Three.js WebGL Visualizer |
| BoQ Finished Ceiling Height | $2.80\text{ meters}$ | BoQ Material Takeoff Engine |
| Flooring Installation Waste | $+10\%$ | BoQ Material Takeoff Engine |
| Paint Commercial Coverage | $9.0\text{ m}^2/\text{Liter}$ (2 coats) | BoQ Material Takeoff Engine |
| Trade Labor Allowance | $+18\%$ | BoQ Financial Summary |
| Unforeseen Contingency | $+8\%$ | BoQ Financial Summary |
| Maximum Relaxation Passes | 5 iterative passes | Autonomous Collision Solver |
| Collision Push Damping | $0.6 \cdot d_{push}$ | Physics Relaxation Solver |
| Wall Boundary Safety Margin | $10\text{ px}$ clearance | Room Perimeter Clamping |
| Door Swing Arc Radius | $w_{door} + 25\text{ px}$ | Ergonomics & Door Clearance |
| IBC Minimum Egress Width | $\ge 90\text{ cm}$ ($45\text{ px}$) | Architectural Ergonomics Scanner |
| Bilateral Bed Clearance | $\ge 60\text{ cm}$ ($30\text{ px}$) | Architectural Ergonomics Scanner |
| Kitchen Wet/Dry Separation | $\ge 0.60\text{ meters}$ | Architectural Ergonomics Scanner |

---

## APPENDIX B: GLOSSARY OF ARCHITECTURAL & CAD TERMS
- **Aperture Deduction**: The process in quantity surveying where void areas created by window and door openings are deducted from gross wall masonry, plaster, and paint quantities.
- **Egress Corridor**: An unobstructed continuous path of travel from any occupied point within a building structure to an exit doorway (governed by IBC 1005).
- **Emulsion Paint**: Water-based architectural coating applied in two continuous coats over primed drywall or plaster.
- **Fenestration**: The design, construction, and placement of physical openings (doors, windows, skylights) in a building envelope.
- **PBR (Physically Based Rendering)**: A computer graphics shading model that simulates realistic physical light interactions with surfaces using roughness, metalness, and albedo parameters.
- **Skirting (Baseboard)**: Architectural trim mounted along the perimeter base of interior walls to conceal the joint between drywall and floor finishes.
- **Work Triangle**: An ergonomic spatial guideline in kitchen architecture measuring the combined perimeter path connecting the sink (cleaning), refrigerator (cold storage), and cooktop (food preparation).
