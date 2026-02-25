# Fleet Management System

A comprehensive fleet management solution with real-time trip tracking, driver management, and reporting.

## Components

- **Backend API** - Node.js + Express + PostgreSQL
- **Web Dashboard** - React + Vite + Tailwind CSS
- **Driver Mobile App** - React Native + Expo

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account (for image uploads)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database and Cloudinary credentials
npm install
npm run dev
```

### Seed Database

```bash
cd backend
npm run db:seed
```

Default credentials:
- **Admin**: admin@fleet.com / admin123
- **Dispatcher**: dispatcher@fleet.com / dispatch123
- **Driver**: driver@fleet.com / driver123

### Web Dashboard

```bash
cd web-dashboard
npm install
npm run dev
```

Open http://localhost:5173

### Driver App

```bash
cd driver-app
npm install
npx expo start
```

## Railway Deployment

### 1. Deploy Backend

1. Create a new project in Railway
2. Add PostgreSQL service
3. Connect your GitHub repo
4. Set root directory to `backend`
5. Add environment variables:
   - `DATABASE_URL` (auto-provided by Railway PostgreSQL)
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `FRONTEND_URL` (your deployed dashboard URL)

### 2. Deploy Web Dashboard

1. Add another service to your Railway project
2. Set root directory to `web-dashboard`
3. Add environment variable:
   - `VITE_API_URL` (your deployed backend URL + /api)

### 3. Driver App

For the mobile app:
1. Update `src/services/api.ts` with your production API URL
2. Build with Expo:
   ```bash
   npx expo build:android
   npx expo build:ios
   ```

## Features

### Web Dashboard (Dispatchers)
- Real-time trip monitoring
- Driver management (CRUD)
- Vehicle management (CRUD)
- Trip reports with date filters
- Export to CSV/Excel
- Live updates via WebSocket

### Driver App
- Driver authentication
- Start trip with:
  - Vehicle selection
  - Odometer reading + photo
  - Driver selfie
  - Optional passenger photo
  - GPS location capture
- Active trip tracking (duration display)
- End trip with:
  - Odometer reading + photo
  - GPS location capture
- Trip summary

## API Endpoints

### Authentication
- `POST /api/auth/login` - Dispatcher login
- `POST /api/auth/driver/login` - Driver login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Drivers
- `GET /api/drivers` - List drivers
- `POST /api/drivers` - Create driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Deactivate driver

### Vehicles
- `GET /api/vehicles` - List vehicles
- `GET /api/vehicles/available` - Available vehicles
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Deactivate vehicle

### Trips
- `GET /api/trips` - List trips (paginated)
- `GET /api/trips/active` - Active trips
- `GET /api/trips/:id` - Trip details
- `POST /api/trips/start` - Start trip (driver)
- `PUT /api/trips/:id/end` - End trip (driver)
- `POST /api/trips/:id/photos` - Upload photo
- `GET /api/trips/my-active` - Driver's active trip

### Reports
- `GET /api/reports/trips` - Trip report
- `GET /api/reports/summary` - Summary stats
- `GET /api/reports/export` - Export CSV/Excel

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Sequelize ORM
- JWT authentication
- Socket.io for real-time
- Cloudinary for images
- XLSX for exports

### Web Dashboard
- React 18 + TypeScript
- Vite build tool
- Tailwind CSS
- Recharts
- Socket.io client

### Mobile App
- React Native + Expo
- React Navigation
- Expo Camera + Location
- AsyncStorage

## License

MIT
### By: Gebriel D.