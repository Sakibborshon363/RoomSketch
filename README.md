# RoomSketch: 2D Interior Design & Room Layout Planning Platform
> **University Final Year Software Engineering Capstone Project**  
> Built with Java, Spring Boot 3, Spring Security, JWT, PostgreSQL, Next.js, React, TypeScript, Tailwind CSS, and Konva.js.

---

## 1. Project Overview

**RoomSketch** is a professional browser-based 2D interior design and room layout planning platform. It allows architects, interior designers, and homeowners to draw rooms with custom dimensions, add vector furniture, inspect measurements, detect boundary and object collisions, manage multiple floors, and export plans to PNG and PDF.

This project follows traditional software engineering principles with clean layered architecture, relational database management, stateless JWT authentication, and interactive canvas rendering.

---

## 2. Technology Stack

### Backend
- **Java 21 / 23**
- **Spring Boot 3.3.5**
- **Spring Security** (Stateless JWT authentication filter with BCrypt password hashing)
- **Spring Data JPA & Hibernate**
- **PostgreSQL 16+** (Production database) & **H2 Database** (In-memory testing & development mode)
- **Maven 3.9+**
- **JUnit 5 & Mockito** (Automated backend test suite)

### Frontend
- **Next.js 14+ (App Router)**
- **React 18 / TypeScript 5**
- **Tailwind CSS** (Modern SaaS UI styling)
- **Konva.js / React-Konva** (Interactive 2D HTML5 Canvas engine)
- **Zustand** (Application and editor state management)
- **React Hook Form & Zod** (Type-safe client-side validation)
- **Lucide React** (Vector icons)
- **jsPDF & html2canvas** (PDF and PNG document exports)
- **Vitest & React Testing Library** (Automated frontend test suite)

---

## 3. Database Schema

The system uses normalized relational entities for ownership and floor hierarchies, while storing rich 2D room layouts as versioned JSON documents:

- **`users`**: UUID, unique email, BCrypt password hash, first name, last name, role, timestamps.
- **`projects`**: UUID, user reference (FK with cascade), name, description, unit system (`METERS`, `CENTIMETERS`, `FEET`), thumbnail image data, timestamps.
- **`floors`**: UUID, project reference (FK with cascade), name, floor number, `layout_data` (versioned JSON document containing rooms, furniture, and doors/windows).
- **`shared_projects`**: UUID, project reference (FK), unique unguessable share token, active status flag, expiration timestamp.

---

## 4. Phase-by-Phase Development Roadmap

| Phase | Description | Status |
|---|---|:---:|
| **Phase 1: Foundation & Authentication** | Project scaffolding, database schema, Spring Security JWT, user profile, Next.js UI, automated tests | **COMPLETED** |
| **Phase 2: Project Management & Dashboard** | Full Project CRUD, realistic architectural templates, search, sorting, filtering, responsive cards, duplicate/rename/delete | **COMPLETED** |
| **Phase 3: Interactive 2D Canvas & Room Engine** | React-Konva infinite canvas, pan, zoom, dot grid, custom room drawing, dimensions, contextual inspector, floor persistence | **COMPLETED** |
| **Phase 4: Furniture Library & Interactive Manipulations** | 23 categorized vector items, drag-and-drop & click-to-place, interactive rotation handle, z-index layering, lock/visibility, keyboard shortcuts, automated tests | **COMPLETED** |
| **Phase 5: Doors, Windows & Collision Validation** | Architectural doors (single, double, pocket) with 90° swing arcs, casement/picture windows, SAT collision detection engine, room containment validation, visual warning auras & inspector alerts | **COMPLETED** |
| **Phase 6: Multi-Floor Management & Autosave** | Multi-level architectural stories (add, rename, duplicate, delete), debounced 1200ms cloud autosave engine with live status pill, unsaved `beforeunload` guard, canvas drawing layer visibility toggles | **COMPLETED** |
| **Phase 7: Materials, Exports & Sharing** | 10 textured floor materials, 8 wall finishes, 14 furniture upholstery swatches, high-resolution PNG & A4 landscape architectural PDF sheet exporters, secure unguessable public read-only sharing links & dedicated viewer | **COMPLETED** |
| **Phase 8: Polish, Audit & Capstone Demonstration** | Security & ownership authorization audit, seeded multi-story villa demonstration dataset, interactive keyboard shortcuts & CAD gesture system, 100% passing test suite | **COMPLETED** |

---

## 5. Quick Start Instructions

### Prerequisites
- Java JDK 21 or 23 installed
- Node.js LTS (v20+) and npm installed
- Maven 3.9+ (or use included wrapper)

### Step 1: Start Backend (Port 8080)
```bash
cd backend
mvn clean install
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

## 6. REST API Endpoints (Phase 1)

### Authentication
- `POST /api/auth/register` - Create a new user account and receive a JWT token.
- `POST /api/auth/login` - Authenticate with email & password and receive a JWT token.
- `GET /api/auth/verify` - Check current JWT token validity.

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

## 7. Running Automated Tests

### Backend Unit & Controller Tests (JUnit 5 & Mockito)
```bash
cd backend
mvn test
```
*Current backend test suite: 35 tests passed across 9 test classes (AuthServiceTest, AuthControllerTest, JwtUtilsTest, ProjectServiceTest, ProjectControllerTest, FloorServiceTest, ShareServiceTest, ShareControllerTest, UserControllerTest) - 100% pass rate.*

### Frontend Unit & Store Tests (Vitest)
```bash
cd frontend
npm test
```
*Current frontend test suite: 65 tests passed across 9 test suites (utils.test.ts, authStore.test.ts, projectStore.test.ts, editorStore.test.ts, furniture.test.ts, collisionAndOpenings.test.ts, floorAutosave.test.ts, materialsExportShare.test.ts, shortcutsModal.test.ts) - 100% pass rate.*

**Combined Project Automated Tests: 100 tests passing (100% pass rate).**
