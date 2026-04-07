# BookMySlot

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)
![React Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?logo=reactquery&logoColor=white)

BookMySlot is a full-stack appointment scheduling platform built with a split architecture:

- Backend: NestJS API for authentication, availability, bookings, and notifications
- Frontend: Next.js app for clients and providers with role-based workflows

The project is organized as a monorepo with independent frontend and backend runtimes so it can evolve into production-grade deployment patterns (separate scaling, isolated CI pipelines, and independent release cadence).

## Core Capabilities

- JWT-based authentication (client/provider roles)
- Provider discovery with search, sorting, and pagination
- Provider availability management (days + working hours)
- Real-time slot generation in 30-minute intervals
- Booking conflict prevention (overlap checks)
- Booking confirmation emails to both participants
- Personal bookings list and calendar schedule view
- Role-aware protected UI navigation

## Architecture

### Backend (NestJS)

- Modular structure: `auth`, `users`, `bookings`, `mail`
- MongoDB persistence via Mongoose
- Request validation via class-validator/class-transformer
- Global security and resilience controls:
	- Helmet security headers
	- Global validation pipe
	- Global exception filter
	- Global API throttling
- Swagger/OpenAPI documentation

### Frontend (Next.js + App Router)

- App Router with protected route group
- Auth state management with context + localStorage persistence
- Server communication through Axios instance + auth interceptors
- Data fetching/caching via TanStack Query
- Forms and input validation via React Hook Form + Zod
- Schedule UI using react-big-calendar

## Tech Stack

### Backend

- NestJS 11
- MongoDB + Mongoose
- JWT + Passport
- Swagger
- Nodemailer
- Helmet + Throttler

### Frontend

- Next.js 16
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query v5
- Axios
- React Hook Form + Zod
- date-fns + react-big-calendar
- Sonner

## Repository Structure

```text
bookmyslot2/
	backend/
		src/
			auth/
			bookings/
			mail/
			users/
			app.module.ts
			main.ts
		package.json

	frontend/
		src/
			app/
				(protected)/
				login/
				layout.tsx
				page.tsx
			components/
			context/
			lib/
			providers/
			types/
		package.json

	README.md
```

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB instance (local or cloud)

## Environment Configuration

Create the following files before running the project.

### Backend `.env` (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bookmyslot
JWT_SECRET=replace_with_secure_secret
FRONTEND_URL=http://localhost:3000

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
MAIL_FROM="BookMySlot <no-reply@bookmyslot.local>"
```

Notes:

- `EMAIL_USER` and `EMAIL_PASS` are used by the mail transporter.
- If using Gmail, configure an app password for SMTP.

### Frontend `.env.local` (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Local Development

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Run backend:

```bash
cd backend
npm run start:dev
```

Run frontend:

```bash
cd frontend
npm run dev
```

Application URLs:

- Frontend: `http://localhost:3000`
- Backend API base: `http://localhost:5000/api`
- Swagger docs: `http://localhost:5000/docs`

## Scripts

### Backend scripts

- `npm run start:dev` - start API in watch mode
- `npm run build` - compile backend
- `npm run start:prod` - run compiled backend
- `npm run lint` - lint backend files
- `npm run test` - run unit tests
- `npm run test:e2e` - run e2e tests

### Frontend scripts

- `npm run dev` - start Next.js dev server
- `npm run build` - production build
- `npm run start` - run production server

## API Overview

Main route groups:

- `/auth` - registration and login
- `/users` - provider listing, profile, availability management
- `/bookings` - availability slots, create/cancel bookings, schedule data

Use Swagger for contract-level details and request/response models.

## Security and Reliability Notes

- JWT-protected routes for authenticated resources
- Input validation on DTO boundaries
- Global error normalization via exception filter
- Basic rate limiting to reduce abuse
- CORS restricted by `FRONTEND_URL`

## Production Readiness Guidance

For a production deployment, consider the following next steps:

1. Move secrets to a secure secret manager (not plain env files in shared environments).
2. Add structured logging and centralized log aggregation.
3. Add API and UI test pipelines in CI.
4. Add database indexes and migration/versioning strategy.
5. Add observability (health checks, metrics, tracing).
6. Configure email provider failover strategy.
7. Add role/permission expansion if admin workflows are introduced.

## Roadmap

- Time zone aware availability and bookings
- Recurring availability templates
- Reschedule workflow
- Notification preferences (email/web/push)
- Admin dashboard and analytics
- Containerized deployment (Docker + orchestration)

## Contributing

Contributions are welcome. To contribute:

1. Create a feature branch from `main`.
2. Keep changes scoped and documented.
3. Run lint/tests before opening a PR.
4. Include screenshots or API examples for UI/API changes.

## License

This project is licensed under the MIT License.