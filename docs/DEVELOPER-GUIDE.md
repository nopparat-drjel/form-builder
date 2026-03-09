# HR FormKit Developer Guide

Welcome to the **HR FormKit** developer documentation. This guide explains the project's architecture, technology stack, and how to get started with development.

---

## 1. Project Overview

HR FormKit is a modern, full-stack application for building and managing HR-related forms (job applications, surveys, etc.). It is built as a **monorepo** for easy management of shared types and multiple services.

### Core Philosophy
- **Speed & Performance:** Built on Vite (Frontend) and Cloudflare Workers (Backend).
- **Type Safety:** End-to-end TypeScript integration.
- **Modern UI:** Clean, "Neumorphic" design using Tailwind CSS.
- **Serverless:** Fully serverless architecture for scalability.

---

## 2. Technology Stack

### Frontend (`apps/frontend`)
- **React 18** (TypeScript)
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **TanStack Query (v5)** (Data fetching & caching)
- **Zustand** (State management)
- **React Router 6** (Navigation)
- **dnd-kit** (Drag and Drop for Form Builder)

### Backend (`apps/worker`)
- **Hono** (Web framework for Cloudflare Workers)
- **Cloudflare D1** (Serverless SQL Database)
- **Cloudflare R2** (Object Storage for file uploads)
- **JWT** (Stateless authentication)
- **Zod** (Schema validation)

### Shared (`packages/shared`)
- Shared TypeScript interfaces and utility functions.

---

## 3. Getting Started

### Prerequisites
- **Node.js** (v18 or later)
- **pnpm** (Package manager)
- **Wrangler CLI** (For backend development)

### Installation
```bash
# Install dependencies
pnpm install
```

### Development
To run both the frontend and backend in development mode:
```bash
# Run Frontend (http://localhost:5173)
pnpm dev:frontend

# Run Backend (http://localhost:8787)
pnpm dev:worker
```

---

## 4. Architecture

### Monorepo Structure
```text
.
├── apps/
│   ├── frontend/       # React application
│   └── worker/         # Hono-based Cloudflare Worker
├── packages/
│   └── shared/         # Shared types and logic
├── docs/               # Project documentation
└── package.json        # Root workspace configuration
```

### Database Schema (D1)
The system uses SQLite (via D1) with the following key tables:
- `users`: HR administrators.
- `tenants`: Organizational units.
- `forms`: Form definitions (stored as JSON blocks).
- `responses`: Submitted form data.
- `share_tokens`: Unique tokens for public form access.
- `file_uploads`: Tracking for files stored in R2.

---

## 5. Deployment

### Frontend (Vite)
Deployed to **Vercel** or **Cloudflare Pages**.
```bash
cd apps/frontend
pnpm build
```

### Backend (Cloudflare Worker)
Deployed to **Cloudflare** using Wrangler.
```bash
cd apps/worker
pnpm deploy
```

---

## 6. Testing

### Frontend
- **Unit/Integration:** Vitest & React Testing Library.
- **E2E:** Playwright.
```bash
cd apps/frontend
pnpm test
```

### Backend
- **Unit:** Vitest.
```bash
cd apps/worker
pnpm test
```

---

## 7. Contributing

1. **Branching:** Use `feature/` or `fix/` prefixes for branches.
2. **Linting:** Ensure code passes `pnpm lint`.
3. **Type Checking:** Run `pnpm typecheck` before pushing.
4. **Testing:** All new features must include corresponding tests.

---

*Last Updated: March 10, 2026*
