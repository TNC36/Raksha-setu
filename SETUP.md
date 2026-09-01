# 🛡️ Raksha Setu — Complete Setup Guide

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Clone & Install](#2-clone--install)
3. [Environment Variables](#3-environment-variables)
4. [Start Development](#4-start-development)
5. [First-Time Setup: Seed Demo Data](#5-first-time-setup-seed-demo-data)
6. [Admin Login](#6-admin-login)
7. [How to Add Demo Disasters](#7-how-to-add-demo-disasters)
8. [Why the Guides Page Was Empty](#8-why-the-guides-page-was-empty)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

Make sure you have these installed:

| Tool | Version | Check Command |
|------|---------|---------------|
| **Node.js** | 18+ | `node --version` |
| **npm** or **bun** | latest | `npm --version` or `bun --version` |
| **Git** | any | `git --version` |

---

## 2. Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-username/raksha-setu.git
cd raksha-setu

# Install dependencies
npm install
# OR if you use bun:
bun install
```

---

## 3. Environment Variables

Create a `.env` file in the project root:

```bash
# Get this from your Convex dashboard
# Go to: https://dashboard.convex.dev → Your Project → Settings → Deployment URL
VITE_CONVEX_URL=https://your-project.convex.cloud
```

**How to get VITE_CONVEX_URL:**

1. Go to [dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project (or create a new one)
3. Click **Settings** → **Deployment URL**
4. Copy the URL (looks like `https://xxxxx-xxxxx.convex.cloud`)

---

## 4. Start Development

Open **two terminals**:

**Terminal 1 — Convex Backend:**
```bash
npx convex dev
```
This starts the Convex backend and generates TypeScript types.

**Terminal 2 — Vite Frontend:**
```bash
npm run dev
# OR
bun dev
```

This starts the Vite dev server, usually at `http://localhost:5173`.

---

## 5. First-Time Setup: Seed Demo Data

After the Convex backend is running, you need to populate the database with demo data (guides, helplines, alerts, safe zones).

### Option A: Using Convex Dashboard (Recommended)

1. Go to [dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project
3. Go to **Functions** tab
4. Find `seed:seedAll` in the list
5. Click **Run** (▶ button)
6. You should see: `"Database seeded successfully!"`

### Option B: Using Command Line

```bash
npx convex run seed:seedAll
```

### What gets seeded:

| Table | Count | Description |
|-------|-------|-------------|
| **guides** | 6 | Flood, Earthquake, Cyclone, Wildfire, Landslide, Conflict safety guides |
| **helplines** | 10 | Indian emergency numbers (112, 100, 101, 108, 1070, etc.) |
| **alerts** | 6 | Demo flood, earthquake, cyclone, landslide, wildfire alerts across India |
| **safeZones** | 6 | Demo shelters in Vadodara, Kutch, Mumbai, Chennai, Delhi |

### Verify it worked:
- Open `/guides` — you should see 6 safety guides
- Open `/helplines` — you should see 10 emergency numbers
- Open `/alerts` — you should see demo alerts
- Open `/safe-zones` — you should see demo safe zones

---

## 6. Admin Login

### How Admin Authentication Works

The admin login uses **Convex Email OTP** authentication:

1. Go to `/admin/login`
2. Enter your email address
3. You'll receive a 6-digit OTP code
4. Enter the code to sign in
5. If no admin exists yet, you'll be asked "Become First Administrator?"

### First-Time Admin Setup

When you first sign in:

1. Enter any email address you want to use as admin
2. Enter the OTP code you receive
3. You'll see: **"No administrator account exists yet"**
4. Click **"Become First Administrator"**
5. You're now the admin!

### Subsequent Admin Logins

After the first admin is set up:
- Sign in with the same email → you'll be redirected to admin dashboard
- New users need an existing admin to promote them via `/admin/dashboard` → Admin Management

### Admin Dashboard Features

Once logged in as admin, you can:
- **Manage Alerts** — Create, edit, delete disaster alerts
- **Manage Safe Zones** — Add shelters, update capacity/status
- **Manage Guides** — Add safety guides for each disaster type
- **Manage Helplines** — Add/edit emergency contact numbers
- **View System Status** — Check live data sources

---

## 7. How to Add Demo Disasters

### Method 1: Via Admin Dashboard (Easiest)

1. Login as admin at `/admin/login`
2. Go to **Admin Dashboard** → **Manage Alerts**
3. Click **"Add Alert"**
4. Fill in:
   - Disaster Type: `Flood` / `Earthquake` / `Cyclone` / etc.
   - Severity: `Low` / `Medium` / `High` / `Critical`
   - Title: e.g., "Flash Flood Warning — Mumbai"
   - Description: Details about the alert
   - Location: e.g., "Mumbai, Maharashtra"
   - Latitude: `19.0760`
   - Longitude: `72.8777`
5. Click **"Add Alert"**

### Method 2: Add Safe Zones

1. Go to **Admin Dashboard** → **Manage Safe Zones**
2. Click **"Add Zone"**
3. Fill in:
   - Zone Name: e.g., "Community Hall Shelter"
   - Location: Address
   - Latitude/Longitude: Coordinates
   - Disaster Types: Which disasters this zone is for
   - Capacity: Maximum people it can hold
   - Status: `Available` / `Limited` / `Full` / `Closed`
   - Verified: Check if it's a verified shelter
4. Click **"Add Zone"**

### Method 3: Add Safety Guides

1. Go to **Admin Dashboard** → **Manage Guides**
2. Click **"Add Guide"**
3. Select the disaster type
4. Enter:
   - Title: e.g., "Flood Safety Guide"
   - Before: Instructions for before the disaster (one per line)
   - During: Instructions for during the disaster (one per line)
   - After: Instructions for after the disaster (one per line)
5. Click **"Add Guide"**

### Method 4: Add Helplines

1. Go to **Admin Dashboard** → **Manage Helplines**
2. Click **"Add Helpline"**
3. Enter the service name and phone number
4. Click **"Add Helpline"**

---

## 8. Why the Guides Page Was Empty

The Guides page was empty because:

**The Convex database was empty.** 

The application queries the Convex database for guides:
```typescript
const guidesData = useQuery(api.guides.list);
```

If no guides exist in the `guides` table, the page shows "No guides available."

**Solution:** Run the seed function (Step 5 above) to populate the database with demo guides, or manually add guides via the Admin Dashboard.

---

## 9. Troubleshooting

### "Could not find Convex client" error
- Make sure `VITE_CONVEX_URL` is set in `.env`
- Make sure `npx convex dev` is running

### "No data showing" on any page
- The database might be empty — run `npx convex run seed:seedAll`
- Check the Convex dashboard to see if data exists

### Admin login not working
- Make sure you're using email OTP flow (enter email → receive OTP → enter code)
- First user to sign in can claim admin role
- Check the Convex dashboard → Users table to see registered users

### Maps not loading
- The map uses OpenStreetMap tiles — requires internet connection
- Check browser console for errors

### Language selector not changing text
- Clear localStorage and refresh
- Make sure the i18n files are loaded (check browser Network tab)

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx convex dev --once
npm run dev
```

---

## Quick Reference

| URL | What It Shows |
|-----|---------------|
| `/` | Landing page with hero, stats, alerts |
| `/alerts` | All disaster alerts (live + demo) |
| `/safe-zones` | Safe zones map with evacuation routes |
| `/guides` | Disaster safety guides (Before/During/After) |
| `/helplines` | Emergency phone numbers |
| `/dashboard` | Civilian dashboard (requires login) |
| `/login` | Civilian sign-in |
| `/register` | Create civilian account |
| `/admin/login` | Admin sign-in (email OTP) |
| `/admin/dashboard` | Admin management panel |

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONVEX_URL` | ✅ Yes | Convex deployment URL |

No API keys needed for:
- USGS Earthquake API (public)
- Open-Meteo Weather API (public)
- ReliefWeb API (public)
- OSRM Routing (public)
- Overpass/OpenStreetMap (public)

---

*Last updated: September 2026*
