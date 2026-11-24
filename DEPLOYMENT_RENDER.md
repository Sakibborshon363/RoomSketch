# Deploying RoomSketch on Render

This guide outlines how **RoomSketch** is hosted on Render with a clean, unified public link:

👉 **`https://roomsketch.onrender.com`**

---

## Unified Cloud Architecture

```
  ┌────────────────────────────────────────────────────────┐
  │                 Render Cloud Platform                  │
  │                                                        │
  │   [Main Web Application: "roomsketch"]                 │
  │   Next.js 14 (Node 20 runtime)                         │
  │   Public URL: https://roomsketch.onrender.com          │
  │   (Serves UI + transparently proxies /api requests)    │
  │              │                                         │
  │              ▼ (Internal proxy)                        │
  │   [Backend API Service: "roomsketch-backend"]          │
  │   Spring Boot 3 + Java 21 (Docker runtime)             │
  │              │                                         │
  │              ▼ (DATABASE_URL)                          │
  │   [PostgreSQL Database: "roomsketch-db"]               │
  │   Render Managed PostgreSQL                            │
  └────────────────────────────────────────────────────────┘
```

---

## 1. Blueprint Deployment (Automatic)

Since `render.yaml` is located in the root of the repository, Render will automatically:
1. Create `roomsketch-db` (PostgreSQL)
2. Create `roomsketch-backend` (Spring Boot API)
3. Create `roomsketch` (Next.js Web Application at `https://roomsketch.onrender.com`)

---

## 2. If You Already Have the Existing Blueprint in Render Dashboard:

If you already deployed earlier and see the service named `roomsketch-frontend`:

You can instantly change its domain to **`https://roomsketch.onrender.com`** in 10 seconds:
1. In [dashboard.render.com](https://dashboard.render.com), click on **`roomsketch-frontend`**.
2. Click **Settings** on the left menu.
3. In the **Name** field, change `roomsketch-frontend` to **`roomsketch`**.
4. Click **Save Changes**.
5. Render will immediately update your URL to:
   👉 **`https://roomsketch.onrender.com`**

---

## Default Demo Credentials

- **URL**: `https://roomsketch.onrender.com`
- **Email**: `demo@roomsketch.com`
- **Password**: `password123`
