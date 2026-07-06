# EventSphere — Event Booking and Management Platform

EventSphere is a full-stack web platform where **organizers** create and manage events, **attendees** discover events, book tickets, pay online, and check in with QR tickets, and a **super admin** governs the whole system — approvals, users, categories, venues, revenue, and reports.

> MCA Final Year Capstone Project — Lovely Professional University (LPU)

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, React Router, TanStack React Query, Axios, React Hook Form, Zod, Tailwind CSS, shadcn/ui, Lucide Icons, Framer Motion, Recharts, sonner |
| Backend | Node.js, Express.js, TypeScript |
| Database | MySQL with Sequelize ORM |
| Auth | JWT (access + refresh token rotation), Role-Based Access Control |
| Storage | Cloudinary (images) |
| Email | Nodemailer (SMTP) |
| Payments | Razorpay (test mode) |

## Documentation

This repository currently contains the complete Software Requirements Specification (SRS) and technical implementation plan. Code will be built from these documents.

| Doc | Contents |
|---|---|
| [01 — Overview & Scope](docs/01-overview-scope.md) | Vision, architect's review & improvements, functional and non-functional requirements, module breakdown, MVP vs Phase-2 scope |
| [02 — Roles & Permissions](docs/02-roles-permissions.md) | User roles and the full RBAC permission matrix |
| [03 — Database Design](docs/03-database-design.md) | ER diagram, all tables with columns and types, relationships, indexes |
| [04 — API Specification](docs/04-api-specification.md) | REST conventions and every endpoint per module |
| [05 — Architecture](docs/05-architecture.md) | System architecture, authentication flow, booking + payment sequence, React Query data flow |
| [06 — Frontend Plan](docs/06-frontend-plan.md) | Folder structure, full page list, routing and navigation flow, validation rules |
| [07 — Backend Plan](docs/07-backend-plan.md) | Layered folder structure, middleware chain, error handling, environment variables |
| [08 — Security](docs/08-security.md) | Password hashing, token storage, QR ticket signing, payment verification, OWASP considerations |
| [09 — Roadmap](docs/09-roadmap.md) | Phased development roadmap with milestones and acceptance criteria |
| [10 — Deployment & Future](docs/10-deployment-future.md) | Deployment strategy (free-tier friendly) and future enhancements |

## Reading Order

1. Start with **01** for what is being built and why.
2. **02 + 03** define the domain model.
3. **04 + 05** define how the pieces talk to each other.
4. **06 + 07** define how the code is organized.
5. **08** applies across everything.
6. **09 + 10** define when things get built and where they run.
