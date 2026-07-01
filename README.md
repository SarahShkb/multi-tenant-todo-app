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
## API Reference

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Create account + new tenant |
| POST | `/auth/login` | — | Step 1: verify credentials, returns tenant list |
| POST | `/auth/select-tenant` | — | Step 2: pick a tenant, receive JWT |
| POST | `/auth/switch-tenant` | JWT | Swap active tenant, receive new JWT |

### Boards

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/boards` | JWT | List all boards in active tenant |
| GET | `/boards/:id` | JWT | Get one board |
| POST | `/boards` | JWT | Create board |
| PATCH | `/boards/:id` | JWT | Update board |
| DELETE | `/boards/:id` | JWT | Delete board |

### Todos

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/boards/:boardId/todos` | JWT | List todos on a board |
| GET | `/boards/:boardId/todos/:id` | JWT | Get one todo |
| POST | `/boards/:boardId/todos` | JWT | Create todo |
| PATCH | `/boards/:boardId/todos/:id` | JWT | Update todo |
| DELETE | `/boards/:boardId/todos/:id` | JWT | Delete todo |

### Tenant membership (admin only)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/tenants/members` | JWT | List members of active tenant |
| POST | `/tenants/members` | JWT + Admin | Add a user by email |
| DELETE | `/tenants/members/:userId` | JWT + Admin | Remove a member |

### Users

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/users` | JWT | List users in active tenant |
| GET | `/users/me` | JWT | Your own profile |
| GET | `/users/:id` | JWT | A specific user's profile |
| PATCH | `/users/me` | JWT | Update your own profile |
| PATCH | `/users/:id` | JWT | Update another user |
| DELETE | `/users/:id` | JWT | Remove user from tenant |

### WebSocket events

Connect: `ws://localhost:3000?token=<jwt>` (or via `socket.auth.token`)

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client → Server | `board:join` | `{ boardId }` | Subscribe to a board's live feed |
| Client → Server | `board:leave` | `{ boardId }` | Unsubscribe from a board |
| Server → Client | `todo:created` | `Todo` | A new todo was added |
| Server → Client | `todo:updated` | `Todo` | A todo was changed |
| Server → Client | `todo:deleted` | `{ id }` | A todo was removed |

---

## Architecture

### Backend

Built with **NestJS** (Node.js), **TypeORM**, **PostgreSQL**, and **Socket.io**.

```
src/
├── auth/                   # JWT strategy, login flow, token issuance
├── tenants/                # Tenant entities, membership management
│   └── entities/
│       ├── tenant.entity.ts
│       └── user-tenant.entity.ts   # join table
├── users/                  # User CRUD, scoped to active tenant
├── boards/                 # Board CRUD, scoped to active tenant
├── todos/                  # Todo CRUD + WebSocket gateway
│   ├── todos.service.ts
│   └── todos.gateway.ts
└── common/                 # Shared guards, decorators
    ├── guards/
    │   ├── jwt-auth.guard.ts
    │   └── roles.guard.ts
    └── decorators/
        ├── current-user.decorator.ts
        └── roles.decorator.ts
```

#### Multi-tenancy: row-level isolation

Tenant isolation is implemented at the **row level** — all business tables (`boards`, `todos`) carry a `tenantId` column, and every query unconditionally filters by it:

```typescript
// BoardsService — tenantId always comes from the verified JWT, never from client input
findOne(id: string, tenantId: string) {
  return this.boardRepo.findOne({ where: { id, tenantId } });
}
```

`tenantId` is never accepted from the request body or URL. It is read exclusively from `req.user.tenantId`, which is set by `JwtStrategy` after verifying the token — making cross-tenant access structurally impossible to accidentally allow. A response of 404 (rather than 403) is returned when a resource exists in a different tenant, to avoid leaking its existence.

#### User–tenant relationship

Users can belong to multiple tenants. This is modelled with a dedicated `user_tenants` join table rather than a simple `tenantId` column on `users`:

```
users  ──<  user_tenants  >──  tenants
              (role, createdAt)
```

`MembershipRole` is either `member` or `admin`. The first user to create a tenant becomes its admin; all subsequently added members default to `member`.

#### Authentication: two-step login

Login is split into two explicit steps to support users who belong to more than one tenant:

1. `POST /auth/login` — verifies email + password only. Returns the list of tenants the user belongs to. **No JWT is issued yet.**
2. `POST /auth/select-tenant` — re-verifies credentials + confirms membership, then issues a JWT scoped to the chosen tenant.

The JWT payload carries `{ sub, email, activeTenantId }`. Re-checking the password on step 2 keeps the flow completely stateless — no short-lived pre-auth token is needed.

For already-authenticated users, `POST /auth/switch-tenant` swaps the active tenant and issues a new JWT without requiring the password again.

#### JWT and membership verification

`JwtStrategy.validate()` runs on **every authenticated request** and does two things beyond decoding the token:

1. Confirms the user still exists in the database
2. Re-verifies that the user still has a valid membership in `activeTenantId`

This means membership revocations take effect immediately — a removed user's existing token will be rejected on their next request without needing to wait for expiry.

#### Role-based access control

`RolesGuard` protects admin-only routes (`POST /tenants/members`, `DELETE /tenants/members/:userId`). Rather than embedding the role in the JWT (which would require a re-login to reflect role changes), it re-queries `user_tenants` on each request. This adds one DB query but ensures role changes are instantaneous.

Usage pattern:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(MembershipRole.ADMIN)
@Post('members')
addMember(...) {}
```

#### Membership management: no self-serve joining

Users cannot join tenants on their own. The only way into a tenant is being explicitly added by an admin via `POST /tenants/members` using an email address. This eliminates the attack surface of slug-guessing: even if a malicious user knows a tenant's slug, there is no endpoint that accepts it as a way to gain access.

An admin is also prevented from removing themselves to avoid orphaned tenants with no administrator.

#### Real-time: WebSocket gateway

`TodosGateway` handles the WebSocket layer with Socket.io. On connection, the JWT is verified and `tenantId` is stored on the socket's `client.data`. When a client opens a board, it emits `board:join`, which places the socket into a room named:

```
tenant:<tenantId>:board:<boardId>
```

Including `tenantId` in the room name is a security measure: even if a client crafts a `board:join` message with a foreign `boardId`, the room they enter is namespaced under their own `tenantId`, so they will never receive events from another tenant's board.

After every mutation, `TodosService` calls `todosGateway.emitToBoardForTenant(tenantId, boardId, event, data)`, which broadcasts to everyone in that room. This includes the user who made the change — the frontend handles deduplication.

---

### Frontend

Built with **React**, **TypeScript**, **TanStack Query**, **Zustand**, and **Socket.io client**.

```
src/
├── api/                    # Axios wrappers for each backend resource
│   ├── auth.ts
│   ├── boards.ts
│   ├── todos.ts
│   ├── users.ts
│   └── tenants.ts
├── store/
│   └── authStore.ts        # Zustand — token, activeTenant, tenant list
├── hooks/
│   ├── useSocket.ts        # Singleton Socket.io connection
│   ├── useTodos.ts         # Fetch + real-time sync
│   ├── useBoards.ts
│   └── useUsers.ts
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx       # Board list
│   └── Board.tsx           # Todo columns
├── components/
│   ├── Navbar.tsx          # Workspace switcher dropdown
│   ├── ManageMembersModal.tsx
│   ├── TenantSelectionModal.tsx
│   └── todo/
└── utils/
    └── slug.ts             # org name → URL slug conversion
```

#### Auth state: Zustand

`authStore` persists three things to `localStorage`:

- `token` — the JWT for API and WebSocket calls
- `activeTenant` — `{ id, name, slug, role }` of the current org
- `tenants` — the full list of orgs the user belongs to (used by the workspace switcher)

All three are updated atomically via `setSession()` (on login / register) or `switchTenant()` (on workspace switch). The store is the single source of truth for whether the user is authenticated and which org they're in.

#### Data fetching: TanStack Query

All server state is managed by TanStack Query. Cache keys follow the pattern `["resource", id]` — e.g. `["todos", boardId]`, `["board", id]`, `["boards"]`. When the user switches tenant, `queryClient.clear()` is called to flush all cached data so no cross-tenant data leaks into the new context.

#### Real-time sync: `useSocket` + `useTodos`

`useSocket` manages a **singleton** Socket.io connection per browser tab. The same socket instance is reused across all components — opening multiple connections (one per component) would be a resource leak. The socket is created when the user logs in (token becomes available) and destroyed on logout.

`useTodos` composes the HTTP fetch with the real-time layer:

```
mount
  ├── useQuery → GET /boards/:id/todos  (initial data)
  └── socket.emit('board:join', { boardId })
        ├── on 'todo:created' → setQueryData: append
        ├── on 'todo:updated' → setQueryData: replace in-place
        └── on 'todo:deleted' → setQueryData: filter out

unmount
  └── socket.emit('board:leave', { boardId })
      + remove all listeners
```

Cache updates use `queryClient.setQueryData` rather than `queryClient.invalidateQueries`. This is the key to instant updates: `setQueryData` patches the cache in memory synchronously, so the UI re-renders immediately without a network round-trip. `invalidateQueries` would trigger a refetch on every change — noticeable latency for every collaborator in the room.

Socket reconnection is handled explicitly: on the `connect` event (which fires both on initial connection and after a reconnect), `board:join` is re-emitted. This is necessary because Socket.io room memberships are not preserved across reconnections — a dropped connection creates a new socket ID with a clean slate.

Mutations in `Board.tsx` have no `onSuccess` callbacks. The socket event serves as the confirmation signal for everyone in the room, including the user who triggered the action.

#### Workspace switcher

The navbar contains a dropdown following the Slack/Notion pattern — the active org's name is clickable, showing all other orgs and a "Manage members" option (admin only). Switching calls `POST /auth/switch-tenant`, updates the store, clears the query cache, and navigates to the dashboard of the new org. The full tenant list is persisted in `localStorage` so the switcher is populated immediately on page load without an extra API call.

#### Slug generation

During registration, the user types an organization name in plain text (e.g. "Acme Corp") and a URL slug is derived live (`acme-corp`). The slug is what the backend stores and uses as a unique identifier for the tenant. The derivation happens client-side using `utils/slug.ts` and is previewed in real time below the input.

---

## Key design decisions and trade-offs

**Two-step login instead of a single endpoint with an optional `tenantSlug`**
Keeps the flow explicit and avoids ambiguous 400 responses. The downside is the password is held in React component state between the two calls. In production this would be replaced with a short-lived (60s) pre-auth token.

**`activeTenantId` in the JWT instead of allowing all tenants per token**
Embedding the active tenant in the token means every request is unambiguously scoped without needing a `?tenantId=` query parameter on every call. The trade-off is that switching tenants requires issuing a new token rather than just changing a header.

**Re-verifying membership on every request in `JwtStrategy`**
Adds one DB query per request but means access revocations are immediate. The alternative — trusting the token until expiry — would mean a removed user retains access for up to 7 days.

**Role not embedded in JWT**
`RolesGuard` re-queries the role on every admin route. This costs one extra DB query but means an admin demotion takes effect instantly. If performance were critical, a short cache (e.g. 60s in-memory or Redis) could reduce this cost.

**`setQueryData` over `invalidateQueries` for real-time updates**
`invalidateQueries` marks data as stale and triggers a background refetch. Under collaborative load (many users, many events) this creates a waterfall of redundant HTTP requests. `setQueryData` patches the cache directly and synchronously — the only source of truth for the current board state becomes the WebSocket stream once the initial fetch completes.

**No self-serve tenant joining**
Users cannot join tenants by knowing a slug. This was a deliberate security decision: the original open `POST /tenants/join` endpoint was a significant attack surface. Only admins can add members by email, giving organisations full control over who has access to their data.

**`DELETE /users/:id` removes membership, not the account**
Since users can belong to multiple tenants, deleting within one org should only remove that membership. Full account deletion happens automatically only if the removed membership was the user's last one.

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
