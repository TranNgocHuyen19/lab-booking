# Lab Room Booking & Management System

A full-stack web application for managing university laboratory room bookings.

The system supports room scheduling, booking approval workflows, research group coordination, GPS-based attendance, in-app notifications, and administrative reports.

## Project Status

This project is under active development. The current version includes backend APIs, a React frontend, role-based access control, booking validation, attendance tracking, notification workflows, dashboard screens, and statistics pages.

## User Roles

| Role | Main responsibilities |
| --- | --- |
| Student | Browse lab schedules, create booking requests, join research groups, check in and check out for approved bookings |
| Lecturer | Manage research groups, review group-related booking workflows, monitor group usage, handle join requests |
| Admin | Manage users, lab rooms, devices, slots, approvals, system configuration, notifications, and reports |

## Main Features

### Authentication and Authorization

- JWT-based authentication.
- Role-based access control with Spring Security.
- Access token and refresh token flow.
- OTP support for account and password-related workflows.
- Redis-backed temporary data such as OTP and token/session state.

### Booking Management

- Personal, group, and thesis booking types.
- Multi-slot booking requests.
- Room capacity validation.
- Device availability validation.
- Participant management.
- Schedule conflict detection.
- Participant conflict handling.
- Booking approval, rejection, cancellation, and bulk admin actions.
- Booking status history and audit data.
- Pessimistic locking in conflict-sensitive repository operations to reduce race conditions during concurrent booking requests.

### Research Group Management

- Create and update research groups.
- Manage group members and member roles.
- Browse public and joined groups.
- Send and review group join requests.
- Lecturer-managed group workflows.
- Admin research group management.
- Group usage statistics.

### Lab Room, Slot, and Device Management

- Lab room CRUD for administrators.
- Room status and capacity management.
- Device management.
- Device assignment to lab rooms.
- Slot management.
- Room schedule views for students, lecturers, and admins.
- Map-based location selection for lab rooms.

### GPS-Based Attendance

- Slot-based check-in and check-out.
- Attendance records per booking participant.
- GPS distance validation using room coordinates.
- Configurable lab radius.
- Configurable late check-in and early check-out thresholds.
- Stored check-in and check-out distance values.
- Attendance records linked to configuration snapshots.

### System Configuration

- Booking rule configuration.
- Attendance rule configuration.
- Field-level configuration updates.
- Configuration history.
- Booking and attendance configuration snapshots.
- Schedule rules displayed in the booking and schedule workflow.

### Notifications

- In-app notification records.
- Notification popover in the frontend.
- Unread notification count.
- Mark one notification as read.
- Mark all notifications as read.
- Notification navigation to related booking flows.
- Notification creation through Spring Application Events after the related transaction commits.

### Dashboards and Statistics

- Admin dashboard KPIs.
- Lecturer dashboard.
- Device usage statistics.
- Room activity reports.
- Booking type distribution.
- Booking trends.
- Lab booking statistics.
- Room statistics.
- Research group statistics.
- Booking audit logs.

## Tech Stack

### Backend

| Technology | Purpose |
| --- | --- |
| Java 22 | Backend runtime |
| Spring Boot 3.5 | Application framework |
| Spring Web | REST API |
| Spring Security | Authentication and authorization |
| Spring Data JPA | ORM and repository layer |
| PostgreSQL | Primary relational database |
| Redis | Cache, OTP, and temporary token/session data |
| Spring Cache | Cache abstraction |
| Spring Mail | Email delivery |
| Thymeleaf | Email templates |
| Spring Application Events | In-process event handling for notification workflows |
| MapStruct | DTO and entity mapping |
| Lombok | Boilerplate reduction |
| Springdoc OpenAPI | Swagger/OpenAPI documentation |
| Docker Compose | Local infrastructure |

### Frontend

| Technology | Purpose |
| --- | --- |
| React 19 | UI framework |
| TypeScript | Type-safe frontend code |
| Vite | Development server and build tool |
| React Router | Client-side routing |
| TanStack Query | Server state and caching |
| React Hook Form | Form state management |
| Zod | Form and API schema validation |
| Tailwind CSS | Styling |
| Radix UI | Accessible UI primitives |
| Recharts | Charts and reports |
| Leaflet and React Leaflet | Map and location selection |
| Axios | HTTP client |

### Local Infrastructure

| Service | Default URL or port |
| --- | --- |
| PostgreSQL | localhost:5433 |
| Redis | localhost:6379 |
| pgAdmin | http://localhost:5050 |
| RedisInsight | http://localhost:5540 |

## Main Backend API Groups

- `/auth`
- `/users`
- `/password`
- `/otp`
- `/bookings`
- `/attendances`
- `/lab-rooms`
- `/devices`
- `/slots`
- `/research-groups`
- `/group-join-requests`
- `/system-configs`
- `/notifications`
- `/dashboard`
- `/admin/statistics/lab-bookings`
- `/admin/statistics/groups`
- `/api/v1/admin/statistics/rooms`
- `/files`

## Booking Flow

```text
1. A user selects a room, date, slots, booking type, participants, and devices.
2. The frontend validates the form and sends a booking request.
3. The backend validates the authenticated user and role.
4. The backend loads the active booking configuration.
5. The backend checks room capacity and device availability.
6. The backend checks room schedule conflicts.
7. The backend checks participant conflicts.
8. The backend creates booking records in a transaction.
9. The backend stores booking and attendance configuration snapshots.
10. The backend publishes booking-related application events.
11. Notification listeners create notifications after transaction commit.
12. The frontend refreshes schedules, booking lists, and notifications.
```

## Attendance Flow

```text
1. A participant opens an approved booking slot.
2. The frontend sends a check-in or check-out request with GPS coordinates.
3. The backend loads the related attendance record.
4. The backend compares user coordinates with the lab room coordinates.
5. The backend checks the configured lab radius.
6. The backend checks late check-in or early check-out thresholds.
7. The backend stores attendance status and measured distance.
8. The frontend updates the attendance view.
```

## Notification Flow

```text
1. A booking is created, updated, approved, rejected, cancelled, or requires conflict resolution.
2. The domain service publishes an application event.
3. The database transaction commits successfully.
4. An AFTER_COMMIT listener handles the event.
5. The notification service creates notification records.
6. The frontend notification popover loads unread count and recent notifications.
7. Users can mark notifications as read or open the related booking flow.
```

## Running Locally

### Prerequisites

- Java 22 or compatible JDK for the backend build.
- Node.js and npm for the frontend.
- Docker and Docker Compose for local infrastructure.

### Start backend dependencies

```bash
cd backend
docker compose up -d
```

This starts PostgreSQL, Redis, pgAdmin, and RedisInsight.

### Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The backend usually runs on:

```text
http://localhost:8080
```

If the application is configured with the `/api` context path, API routes and Swagger will be under `/api`.

Swagger UI:

```text
http://localhost:8080/api/swagger-ui/index.html
```

OpenAPI JSON:

```text
http://localhost:8080/api/v3/api-docs
```

### Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server usually runs on:

```text
http://localhost:5173
```

### Build the frontend

```bash
cd frontend
npm run build
```

## Environment Notes

Backend environment values are loaded from `backend/.env` and Docker Compose.

Common values:

| Variable | Purpose |
| --- | --- |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL username |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL password |
| `SPRING_DATA_REDIS_HOST` | Redis host |
| `SPRING_DATA_REDIS_PORT` | Redis port |
| `SERVER_PORT` | Backend port |
| `SERVER_SERVLET_CONTEXT_PATH` | API context path |

When debugging local database issues, verify the datasource URL used by the running Spring Boot process. IDE database connections, `.env` files, and Docker container settings are separate and can point to different PostgreSQL instances.
