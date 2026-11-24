# Deploying RoomSketch on Render

This guide walks you through deploying the complete **RoomSketch** platform (Spring Boot backend + PostgreSQL database + Next.js frontend) to [Render](https://render.com).

---

## Architecture on Render

```
  ┌────────────────────────────────────────────────────────┐
  │                 Render Cloud Platform                  │
  │                                                        │
  │   [Frontend Web Service]                               │
  │   Next.js 14 (Node 20 runtime)                         │
  │   URL: https://roomsketch-frontend.onrender.com        │
  │              │                                         │
  │              ▼ (NEXT_PUBLIC_API_URL)                   │
  │   [Backend Web Service]                                │
  │   Spring Boot 3 + Java 21 (Docker runtime)             │
  │   URL: https://roomsketch-backend.onrender.com         │
  │              │                                         │
  │              ▼ (DATABASE_URL)                          │
  │   [PostgreSQL Database]                                │
  │   Render Managed PostgreSQL (roomsketch-db)            │
  └────────────────────────────────────────────────────────┘
```

---

## Method 1: One-Click Blueprint Deployment (Recommended)

Render Blueprints use the `render.yaml` specification file located in the root of the repository to automatically create the database, backend, and frontend with all environment variables pre-configured.

### Step 1: Open Render Dashboard
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click the **"New +"** button in the top navigation bar.
3. Select **"Blueprint"**.

### Step 2: Connect Your GitHub Repository
1. Select your connected GitHub account.
2. Search for and select the **`RoomSketch`** repository.
3. Click **"Connect"**.

### Step 3: Review and Deploy
1. Enter a Blueprint name (e.g., `roomsketch`).
2. Render will parse `render.yaml` and display the three components:
   - **`roomsketch-db`** (PostgreSQL)
   - **`roomsketch-backend`** (Web Service via Docker)
   - **`roomsketch-frontend`** (Web Service via Node)
3. Click **"Apply"**.

Render will now provision the database, build the backend Docker container, and compile the Next.js frontend.

### Step 4: Verify URLs
Once deployed, check the URLs assigned to your services:
- **Backend URL**: e.g., `https://roomsketch-backend.onrender.com`
- **Frontend URL**: e.g., `https://roomsketch-frontend.onrender.com`

> **Important**: If Render assigns a customized subdomain to your backend (e.g. `roomsketch-backend-xyz.onrender.com`), go to your **`roomsketch-frontend`** service -> **Environment** tab, update `NEXT_PUBLIC_API_URL` to `https://<your-actual-backend-url>/api`, and click **Save Changes** (Render will trigger a quick redeploy).

---

## Method 2: Manual Step-by-Step Deployment

If you prefer configuring each service individually in the Render UI:

### Step 1: Create PostgreSQL Database
1. In Render Dashboard, click **New +** -> **PostgreSQL**.
2. Settings:
   - **Name**: `roomsketch-db`
   - **Database**: `roomsketch_db`
   - **User**: `roomsketch_user`
   - **Region**: Choose the region closest to you (e.g., *Oregon (US West)* or *Frankfurt (EU)*).
   - **Plan**: `Free`
3. Click **Create Database**.
4. Once created, copy the **Internal Database URL** (e.g., `postgres://roomsketch_user:...@dpg-...:5432/roomsketch_db`).

---

### Step 2: Deploy Backend Web Service
1. Click **New +** -> **Web Service**.
2. Select your `RoomSketch` GitHub repository.
3. Settings:
   - **Name**: `roomsketch-backend`
   - **Region**: Same region as your database.
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Plan**: `Free`
   - **Health Check Path**: `/api/health`
4. Expand **Environment Variables** and add:
   | Key | Value | Notes |
   |---|---|---|
   | `SPRING_PROFILES_ACTIVE` | `prod` | Activates production PostgreSQL configuration |
   | `DATABASE_URL` | *(paste Internal Database URL)* | From Step 1 |
   | `APP_JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | 64-char secret key |
   | `APP_CORS_ALLOWED_ORIGINS` | `https://*.onrender.com,http://localhost:3000` | Allows Render frontend domains |
5. Click **Create Web Service**.
6. Wait for the build to finish. Test the health check by visiting:
   `https://<your-backend-name>.onrender.com/api/health`
   You should see: `{"status":"UP","service":"RoomSketch Backend API",...}`.

---

### Step 3: Deploy Frontend Web Service
1. Click **New +** -> **Web Service**.
2. Select your `RoomSketch` GitHub repository.
3. Settings:
   - **Name**: `roomsketch-frontend`
   - **Region**: Same region as your backend.
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Expand **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `NODE_VERSION` | `20` |
   | `NEXT_PUBLIC_API_URL` | `https://<your-backend-name>.onrender.com/api` |
5. Click **Create Web Service**.
6. Render will build and deploy the Next.js frontend!

---

## Default Demo Credentials

The backend automatically seeds a complete multi-story demonstration project on its first run:
- **Email**: `demo@roomsketch.com`
- **Password**: `password123`

You can also register a brand new user account directly on the deployed frontend!

---

## Render Free Tier Considerations

- **Spin-down / Inactivity**: Free Web Services spin down after 15 minutes of inactivity. When you open the frontend or backend after a period of inactivity, the first request may take 30-50 seconds to wake up the service.
- **Persistent Database**: Render Free PostgreSQL databases are available for 30 days on new accounts. For persistent long-term storage, you can either upgrade to a Starter DB ($7/month) or connect any external free PostgreSQL database (e.g. Supabase, Neon) simply by updating `DATABASE_URL`.
