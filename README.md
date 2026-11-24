# RoomSketch: Professional 2D Architectural CAD & Interior Design Platform

[![Render Deployment](https://img.shields.io/badge/Render-Live%20Production-00E599?style=for-the-badge&logo=render&logoColor=white)](https://roomsketch.onrender.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java 21](https://img.shields.io/badge/Java-21%20LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20Relational%20DB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Automated Tests](https://img.shields.io/badge/Tests-100%2F100%20Passing%20(100%25)-success?style=for-the-badge&logo=vitest&logoColor=white)](https://github.com/Sakibborshon363/RoomSketch)

---

## 🚀 Live Production Deployment

RoomSketch is deployed live on cloud infrastructure as a unified full-stack web service:

| Service | Endpoint | Status |
| :--- | :--- | :---: |
| **Unified Web Application** | **[https://roomsketch.onrender.com](https://roomsketch.onrender.com)** | **`LIVE`** 🟢 |
| **Backend REST API** | `https://roomsketch.onrender.com/api` *(Internal: `roomsketch-backend.onrender.com`)* | **`LIVE`** 🟢 |
| **API Health Check** | [https://roomsketch.onrender.com/api/health](https://roomsketch.onrender.com/api/health) | `{"status":"UP"}` |
| **Managed Database** | PostgreSQL 16 (`roomsketch-db`) | **`CONNECTED`** 🟢 |

### 🔑 Instant Demo Access
You can evaluate all platform features without manual registration:
- **Direct 1-Click Access:** Click **"Enter Dashboard (1-Click Demo)"** on the landing page.
- **Manual Credentials:**
  - **Email:** `demo@roomsketch.com`
  - **Password:** `password123`

---

## 1. Project Overview

**RoomSketch** is a high-precision, browser-based 2D architectural CAD planning and interior design platform. Engineered for architects, interior designers, real estate planners, and homeowners, RoomSketch enables users to draw custom dimensional rooms, arrange categorized vector furniture, customize textures and materials, detect spatial collisions using SAT algorithms, manage multi-story structures, and export publication-ready drawings to PNG and PDF.

The system is architected as a clean modular monolith adhering to traditional software engineering rigor:
- **Clean Layered Architecture:** Strict separation between presentation, application services, domain entities, and data access layers.
- **Unified Domain Reverse Proxy:** Next.js App Router reverse-proxies all `/api/*` traffic server-to-server, delivering a seamless single-origin experience with zero CORS latency or configuration fragility.
- **Declarative Infrastructure as Code (IaC):** Entire deployment stack (Next.js Node frontend, Java 21 Dockerized Spring Boot backend, and PostgreSQL database) is declared and orchestrated via `render.yaml`.

---

## 2. Technology Stack

### Backend
- **Java 21 LTS** (Modern enterprise Java runtime)
- **Spring Boot 3.3.5**
- **Spring Security 6** (Stateless JWT authentication filter with BCrypt password hashing)
- **Spring Data JPA & Hibernate 6**
- **PostgreSQL 16+** (Production database with dynamic JDBC URL parsing) & **H2 Database** (Development & testing mode)
- **Maven 3.9+** (Multi-stage containerized build)
- **JUnit 5 & Mockito** (Automated backend test suite)

### Frontend
- **Next.js 14+ (App Router)** with server-side rewrites reverse proxy
- **React 18 / TypeScript 5** (Strict mode)
- **Tailwind CSS** (Architectural design tokens & responsive layout)
- **Konva.js / React-Konva** (High-performance 2D HTML5 Canvas rendering engine)
- **Zustand** (Predictable immutable application and CAD editor state management)
- **React Hook Form & Zod** (Type-safe client-side schema validation)
- **Lucide React** (Architectural vector iconography)
- **jsPDF & html2canvas** (A4 landscape architectural PDF sheet and high-DPI PNG document exporters)
- **Vitest & React Testing Library** (Automated frontend test suite)

---

## 3. Cloud Architecture & Infrastructure as Code (IaC)

```
                       [ HTTPS User Request ]
                                 │
                                 ▼
                     https://roomsketch.onrender.com
                ┌─────────────────────────────────────────┐
                │        Next.js 14 Frontend Web App      │
                │     • Static & Dynamic Route Handlers   │
                │     • Interactive 2D Konva.js Canvas    │
                │     • Server Rewrites: /api/:path* ─────┼──┐
                └─────────────────────────────────────────┘  │
                                                             │ Server-to-Server
                                                             │ Secure Proxy
                                                             ▼
                ┌─────────────────────────────────────────┐
                │   Spring Boot 3.3.5 (Java 21 Docker)    │
                │     • Stateless JWT Security Filter     │
                │     • REST Controllers & Services       │
                │     • SAT Geometric Collision Engine    │
                └────────────────────┬────────────────────┘
                                     │
                                     │ Dynamic JDBC Pool (HikariCP)
                                     ▼
                ┌─────────────────────────────────────────┐
                │        Managed PostgreSQL 16 DB         │
                │     • Users, Projects, Floors, Shares   │
                └─────────────────────────────────────────┘
```

The application is deployed using Render's Blueprint specification (`render.yaml`):
1. **Frontend Service (`roomsketch`):** Node.js runtime executing `npm run build && npm start`. Proxies all `/api/*` endpoints transparently to the backend service.
2. **Backend Service (`roomsketch-backend`):** Multi-stage Docker container utilizing `eclipse-temurin:21` JRE, binding dynamically to `$PORT` and connecting to `roomsketch-db`.
3. **Database (`roomsketch-db`):** Managed PostgreSQL instance with automated schema initialization and pre-seeded demonstration projects (*Scandinavian Studio*, *Contemporary Villa*, *Garden Apartment*).

---

## 4. Database Schema

The database uses a normalized relational schema for ownership and floor hierarchies, while storing rich 2D room layouts as versioned JSON documents:

- **`users`**: UUID, unique email, BCrypt password hash, first name, last name, role, timestamps.
- **`projects`**: UUID, user reference (FK with cascade), name, description, unit system (`METERS`, `CENTIMETERS`, `FEET`), thumbnail image data, timestamps.
- **`floors`**: UUID, project reference (FK with cascade), name, floor number, `layout_data` (versioned JSON document containing rooms, furniture, and doors/windows).
- **`shared_projects`**: UUID, project reference (FK), unique unguessable share token, active status flag, expiration timestamp.

---

## 5. Development Roadmap & Milestones

| Phase | Description | Status |
|---|---|:---:|
| **Phase 1: Foundation & Authentication** | Project scaffolding, database schema, Spring Security JWT, user profile, Next.js UI, automated tests | **COMPLETED** ✅ |
| **Phase 2: Project Management & Dashboard** | Full Project CRUD, architectural templates, search, sorting, filtering, responsive cards, duplicate/rename/delete | **COMPLETED** ✅ |
| **Phase 3: Interactive 2D Canvas & Room Engine** | React-Konva infinite canvas, pan, zoom, dot grid, custom room drawing, dimensions, contextual inspector, floor persistence | **COMPLETED** ✅ |
| **Phase 4: Furniture Library & Interactive Manipulations** | 23 categorized vector items, drag-and-drop & click-to-place, interactive rotation handle, z-index layering, lock/visibility, keyboard shortcuts | **COMPLETED** ✅ |
| **Phase 5: Doors, Windows & Collision Validation** | Architectural doors (single, double, pocket) with 90° swing arcs, casement/picture windows, SAT collision detection engine, room containment validation, visual warning auras & inspector alerts | **COMPLETED** ✅ |
| **Phase 6: Multi-Floor Management & Autosave** | Multi-level architectural stories (add, rename, duplicate, delete), debounced cloud autosave engine with live status pill, unsaved `beforeunload` guard, layer visibility toggles | **COMPLETED** ✅ |
| **Phase 7: Materials, Exports & Tokenized Sharing** | 10 textured floor materials, 8 wall finishes, 14 furniture upholstery swatches, high-resolution PNG & A4 landscape architectural PDF sheet exporters, secure unguessable public read-only sharing links & dedicated viewer | **COMPLETED** ✅ |
| **Phase 8: Production Cloud Deployment & Hardening** | Render Blueprint deployment, single-domain Next.js reverse proxy, Java 21 Docker multi-stage container, PostgreSQL connection pooling, 100% automated test coverage | **COMPLETED** ✅ |

---

## 6. Local Quick Start

### Prerequisites
- Java JDK 21+ installed
- Node.js LTS (v20+) and npm installed
- Maven 3.9+ (or use included wrapper)

### Step 1: Start Backend (Port 8080)
```bash
cd backend
mvn clean package -DskipTests
mvn spring-boot:run
```
The backend initializes the database schema and automatically provisions a demo user account:
- **Demo Email**: `demo@roomsketch.com`
- **Demo Password**: `password123`

### Step 2: Start Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 7. REST API Reference

### Authentication
- `POST /api/auth/register` - Create a new user account and receive a JWT token.
- `POST /api/auth/login` - Authenticate with email & password and receive a JWT token.
- `GET /api/auth/verify` - Check current JWT token validity.

### Health Check (Public)
- `GET /api/health` - Health status endpoint (`{"status": "UP", "timestamp": "..."}`).

### User Profile (Protected - `Authorization: Bearer <token>`)
- `GET /api/users/me` - Fetch authenticated user profile and project count.
- `PUT /api/users/me` - Update first and last name.
- `PUT /api/users/me/password` - Change password with current password verification.

### Projects & Floors (Protected - `Authorization: Bearer <token>`)
- `GET /api/projects` - List all projects with search & sorting.
- `POST /api/projects` - Create project with template layout.
- `GET /api/projects/{id}` - Fetch project details and floor list.
- `PUT /api/projects/{id}` - Update project metadata.
- `DELETE /api/projects/{id}` - Delete project.
- `POST /api/projects/{id}/duplicate` - Duplicate project.
- `GET /api/projects/stats` - Fetch user dashboard metrics.
- `POST /api/projects/{projectId}/floors` - Add a new floor.
- `PUT /api/floors/{floorId}` - Update floor metadata.
- `DELETE /api/floors/{floorId}` - Delete floor.
- `POST /api/floors/{floorId}/duplicate` - Duplicate floor with all rooms, furniture, and openings.
- `GET /api/floors/{floorId}/layout` - Retrieve versioned floor layout JSON.
- `PUT /api/floors/{floorId}/layout` - Save / autosave floor layout JSON.
- `POST /api/projects/{projectId}/share` - Generate or reactivate a secure 16-character public read-only share token.
- `DELETE /api/projects/{projectId}/share` - Revoke public share link access.
- `GET /api/shared/{token}` - Publicly retrieve shared project details, designer info, and floor layouts (no authentication required).

---

## 8. Automated Test Suite (100% Pass Rate)

### Backend Tests (JUnit 5 & Mockito)
```bash
cd backend
mvn test
```
*Backend test suite: 35 tests passed across 9 test classes (`AuthServiceTest`, `AuthControllerTest`, `JwtUtilsTest`, `ProjectServiceTest`, `ProjectControllerTest`, `FloorServiceTest`, `ShareServiceTest`, `ShareControllerTest`, `UserControllerTest`) — 100% pass rate.*

### Frontend Tests (Vitest)
```bash
cd frontend
npm test
```
*Frontend test suite: 65 tests passed across 9 test suites (`utils.test.ts`, `authStore.test.ts`, `projectStore.test.ts`, `editorStore.test.ts`, `furniture.test.ts`, `collisionAndOpenings.test.ts`, `floorAutosave.test.ts`, `materialsExportShare.test.ts`, `shortcutsModal.test.ts`) — 100% pass rate.*

**Combined Project Automated Tests: 100 tests passing (100% pass rate).**

---

## 9. License

This project is licensed under the MIT License. © 2026 RoomSketch. All rights reserved.
