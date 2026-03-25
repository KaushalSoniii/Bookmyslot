# 📅 BookMySlot – Appointment & Meeting Booking System

**A modern full-stack appointment booking platform** where **Clients** can browse providers, check real-time availability, and book meetings, while **Providers** can set their availability and manage their schedule.

Built as a **separate backend + frontend** monorepo for better scalability and real-world architecture.

---

## ✨ Features

### 🔐 Authentication
- Register & Login as **Client** or **Provider**
- JWT Authentication with protected routes

### 👥 Users Management
- Providers List with **Pagination, Search, Filter by role, Sort (A-Z / Z-A)**
- Role-based access (Client vs Provider)

### 📆 Booking System (Core Feature)
- Real-time availability checker (30-minute slots)
- Smart overlap prevention (no double booking)
- Dynamic slot generation based on provider’s availability (e.g., 9 AM – 2 PM = 5 hours)
- One-click booking

### 📧 Email Notifications
- Automatic **Nodemailer** confirmation emails sent to **both Client and Provider** on every successful booking

### 📋 My Bookings & Schedule
- **My Bookings** page for both roles
- **Full Calendar View** using `react-big-calendar`
- Cancel booking functionality

### 🎨 UI/UX
- Beautiful, responsive design with **shadcn/ui + Tailwind**
- Role-based sidebar navigation
- Toast notifications (Sonner)
- Dark mode ready

---

## 🛠️ Tech Stack

### Backend
- **NestJS** (Node.js framework)
- **MongoDB** + Mongoose
- **Swagger** (Auto-generated API documentation)
- **JWT** Authentication
- **Nodemailer** (Email service)
- Class-validator + Class-transformer

### Frontend
- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **TanStack Query** (React Query v5)
- **Axios** with interceptors
- **react-hook-form** + **Zod**
- **date-fns**
- **react-big-calendar**
- **Sonner** (Toast)

---

## 📁 Project Structure

```bash
bookmyslot/
├── backend/                  # NestJS Backend
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── bookings/
│   │   ├── mail/
│   │   ├── main.ts
│   │   └── app.module.ts
│   ├── .env
│   └── package.json
│
├── frontend/                 # Next.js Frontend
│   ├── app/
│   │   ├── (protected)/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── src/
│   │   ├── lib/axios.ts
│   │   ├── context/AuthContext.tsx
│   │   ├── types/
│   │   └── providers/
│   ├── .env.local
│   └── package.json
│
└── README.md