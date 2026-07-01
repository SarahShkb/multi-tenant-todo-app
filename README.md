# Multi-Tenant Collaborative Todo App

A full-stack multi-tenant collaborative Todo application inspired by Trello. The project demonstrates tenant isolation, authentication, real-time collaboration, and a modern monorepo architecture.

This project was developed as part of a take-home assignment focused on software architecture, code quality, and engineering decisions.

---

# Features

- ✅ Multi-tenant architecture
- ✅ JWT Authentication
- ✅ Multiple organizations (tenants)
- ✅ Multiple boards per tenant
- ✅ Todo CRUD operations
- ✅ Real-time updates using Socket.IO
- ✅ PostgreSQL database
- ✅ Dockerized database
- ✅ Monorepo using Turborepo

---

# Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React + Vite + TypeScript |
| Backend | NestJS |
| Database | PostgreSQL |
| Monorepo | Turborepo |
| Real-Time | Socket.IO |
| Package Manager | npm |
| Containerization | Docker & Docker Compose |

---

# Repository Structure

```text
.
├── apps
│   ├── backend
│   └── frontend
│
├── packages
│   ├── shared
│   └── ...
│
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
```

---

# Architecture

```text
                React (Vite)
                     │
        REST API + Socket.IO
                     │
               NestJS Backend
                     │
             PostgreSQL Database
```

The frontend communicates with the backend through REST APIs for standard CRUD operations and Socket.IO for real-time collaboration.

The backend handles:

- Authentication
- Authorization
- Tenant isolation
- Business logic
- Database access
- WebSocket events

---

# Design Decisions

## Monorepo

The project uses **Turborepo** to keep the frontend, backend, and shared packages in a single repository.

Benefits include:

- Shared code
- Easier dependency management
- Better project organization

## Backend

NestJS was chosen because of its modular architecture, dependency injection, and scalability.

## Frontend

React with Vite provides a fast development experience and a lightweight build system.

## Database

PostgreSQL was selected because it provides a reliable relational model suitable for multi-tenant applications.

## Real-Time Communication

Socket.IO is used to broadcast updates whenever a todo changes.

Each board represents a Socket.IO room.

Users connected to the same board immediately receive updates without refreshing the page.

---

# Multi-Tenant Design

Tenant isolation is implemented using row-level filtering.

Each authenticated request contains the user's tenant information.

Every database query filters data by the authenticated tenant.

This guarantees that users cannot access another organization's boards or todos.

---

# Prerequisites

Before running the project, install:

- Node.js (v20 or newer recommended)
- npm
- Docker
- Docker Compose

Verify the installation:

```bash
node -v
npm -v
docker -v
docker compose version
```

---

# Installation

Clone the repository.

```bash
git clone https://github.com/SarahShkb/multi-tenant-todo-app.git
```

Navigate into the project.

```bash
cd multi-tenant-todo-app
```

Install dependencies.

```bash
npm install
```

---

# Environment Variables

The repository **does not include** any `.env` files.

Each application contains an `env.sample` file.

Create a new `.env` file by copying the sample file.

Example:

```text
apps/backend/env.sample
            ↓
apps/backend/.env

apps/frontend/env.sample
            ↓
apps/frontend/.env
```

Fill in every required environment variable before starting the application.

> **Important:** The application will not start correctly until all required environment variables have been configured.

---

# Starting PostgreSQL

Start the PostgreSQL container.

```bash
docker compose up -d
```

Verify the container is running.

```bash
docker ps
```

Stop the database.

```bash
docker compose down
```

Remove the database volume (this deletes all stored data).

```bash
docker compose down -v
```

---

# Running the Project

Start every application.

```bash
npm run dev
```

If your Turborepo supports filtering, individual applications can also be started.

Backend

```bash
npm run dev --workspace=backend
```

Frontend

```bash
npm run dev --workspace=frontend
```

> Adjust the workspace names if they differ in your project.

---

# Real-Time Updates

Real-time collaboration is implemented using **Socket.IO**.

When a user opens a board:

1. The frontend connects to the Socket.IO server.
2. The client joins the board's Socket.IO room.
3. Whenever a todo is created, updated, or deleted:
   - The backend updates the database.
   - The backend emits an event to the corresponding board room.
   - Every connected client instantly updates its UI without refreshing the page.

---

# API Overview

The backend exposes REST endpoints for:

- Authentication
- Tenant management
- Boards
- Todos

Real-time events are delivered through Socket.IO.

---

# Available Scripts

| Command | Description |
|----------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start the development environment |
| `npm run build` | Build all applications |
| `npm run lint` | Run the linter |
| `npm run test` | Run tests |
| `docker compose up -d` | Start PostgreSQL |
| `docker compose down` | Stop PostgreSQL |

---

## Authentication Strategy

Instead of issuing a single JWT that grants access to all of a user's tenants, the application issues a **tenant-specific JWT**.

When a user logs in, they first authenticate with their credentials. If the user belongs to multiple tenants, they must select which tenant they want to access. The backend then generates a JWT containing the selected tenant's identifier.

Each authenticated request therefore carries both the user's identity and the active tenant context.

This approach provides several advantages:

- **Stronger tenant isolation** by ensuring every request is scoped to a single tenant.
- **Simpler authorization logic**, as the backend always knows which tenant the request belongs to.
- **Reduced risk of accidental cross-tenant access**, since the token cannot be used to access resources from another tenant.
- **Smaller and simpler JWT payloads**, avoiding the need to include a list of all tenant memberships.

Switching to another tenant requires requesting a new JWT for the selected tenant, ensuring that every session is explicitly associated with a single organization.

---

## Authentication Trade-off

A possible alternative would have been to issue a single JWT containing all of the user's tenant memberships and allow the frontend to specify the active tenant on each request.

While this approach can reduce the need to obtain a new token when switching tenants, it also increases the complexity of authorization and introduces a greater risk of cross-tenant access if tenant validation is overlooked.

For this assignment, I prioritized security and clarity by using **tenant-specific JWTs**, where each token represents exactly one active tenant.

---


# Future Improvements

With additional time, the following features would be added:

- Role-based permissions
- Redis pub/sub for horizontal scaling
- Drag-and-drop task ordering
- File attachments
- Email notifications
- Activity history
- Better error reporting
- Integration and end-to-end tests
- GitHub Actions CI/CD pipeline

---

# Troubleshooting

## Docker is not running

Ensure Docker Desktop is running before executing:

```bash
docker compose up -d
```

---

## Database connection failed

Verify:

- PostgreSQL container is running
- `.env` contains the correct credentials
- The backend is using the correct database host and port

---

## Missing environment variables

Make sure every `env.sample` has been copied to a `.env` file and all required values have been filled.

---

## Port already in use

If a port is already occupied, either stop the conflicting application or change the port in the corresponding `.env` file.
