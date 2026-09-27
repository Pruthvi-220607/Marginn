# MARGINN - Dropship Fulfillment Platform

A robust, full-stack automated dropshipping platform designed to orchestrate the core loop between Amazon/Flipkart webhooks, supplier management, Shiprocket logistics, and AI-driven insights.

## System Architecture
- **Frontend:** React + TypeScript + Vite (Tailwind CSS, Recharts)
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite (managed via Prisma ORM)
- **Security:** AES-256-CBC Encryption for sensitive Customer PII at rest

## Prerequisites
- Node.js (v18 or higher recommended)
- npm

## How to Run the System

The project is structured as a monorepo containing both the Vite frontend and the Express backend.

### 1. Install Dependencies
You need to install dependencies in both the root directory (for the frontend) and the `server` directory (for the backend).

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Database Initialization
Before running the backend, you must push the Prisma schema to create your local SQLite database (`dev.db`).

```bash
cd server
npx prisma@5 db push
cd ..
```

### 3. Start the Development Servers
You can start both the React frontend and the Express backend simultaneously from the root folder using `concurrently`.

```bash
# Run this from the root MARGINN folder
npm run dev
```

This will spin up:
- **Frontend:** `http://localhost:5173`
- **Backend (API):** `http://localhost:5000`

### 4. Running Load Tests / Webhook Simulations
To test the core fulfillment pipeline and AI engines without real Amazon SP-API credentials, you can run the provided simulation scripts inside the `server` folder while the backend is running.

```bash
cd server

# Simulate a single Amazon Webhook payload
node test_webhook.js

# Simulate a burst of 50 concurrent webhooks
node load_test.js
```

## Production Hardening Details
- **PII Encryption:** Customer Names, Addresses, and Phone numbers are encrypted before being written to SQLite.
- **Observability:** All pipeline transitions (e.g., `InventoryDeducted` -> `ShipmentBooked`) emit structured JSON logs.
- **AI Engine:** The intelligence endpoints (`/api/ai-engine/*`) operate entirely decoupled from the critical order ingestion path to prevent latency.
