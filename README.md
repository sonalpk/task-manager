<<<<<<< HEAD
# Task Manager Application

A full-stack task management application built with **Spring Boot** (backend) and **Angular** (frontend), using an in-memory **H2** database.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Reference](#api-reference)
- [Design Document](#design-document)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Spring Data JPA, Hibernate, H2 |
| Frontend | Angular 17 (Standalone Components), RxJS |
| Testing | JUnit 5, Mockito, Jasmine/Karma, Playwright |
| Build | Maven, npm |

---

## Project Structure

```
task-manager/
├── backend/                          # Spring Boot application
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/taskmanager/
│       │   ├── TaskManagerApplication.java
│       │   ├── config/
│       │   │   └── WebConfig.java            # CORS configuration
│       │   ├── controller/
│       │   │   └── TaskController.java       # REST endpoints
│       │   ├── service/
│       │   │   ├── TaskService.java          # Interface
│       │   │   └── TaskServiceImpl.java      # Business logic
│       │   ├── repository/
│       │   │   └── TaskRepository.java       # JPA repository
│       │   ├── model/
│       │   │   └── TaskEntity.java           # JPA entity
│       │   ├── dto/
│       │   │   ├── TaskDTO.java
│       │   │   ├── TaskFilterRequest.java
│       │   │   └── PagedResponse.java
│       │   └── exception/
│       │       ├── TaskNotFoundException.java
│       │       ├── GlobalExceptionHandler.java
│       │       └── ErrorResponse.java
│       ├── main/resources/
│       │   └── application.properties
│       └── test/java/com/taskmanager/service/
│           └── TaskServiceImplTest.java      # JUnit tests
│
└── frontend/                         # Angular application
    ├── angular.json
    ├── package.json
    ├── playwright.config.ts
    └── src/
        ├── main.ts
        ├── index.html
        ├── styles.css
        └── app/
            ├── app.component.ts
            ├── app.config.ts
            ├── app.routes.ts
            ├── models/
            │   └── task.model.ts
            ├── services/
            │   ├── task.service.ts
            │   └── task.service.spec.ts      # Unit tests
            ├── components/
            │   ├── task-list/
            │   │   └── task-list.component.ts
            │   ├── task-form/
            │   │   └── task-form.component.ts
            │   └── task-detail/
            │       └── task-detail.component.ts
            └── environments/
                └── environment.ts
```

---

## Backend Setup

### Prerequisites

- Java 17+
- Maven 3.8+

### Run the Application

```bash
cd backend
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**

### H2 Console

The in-memory H2 database console is available at:
**http://localhost:8080/h2-console**

- JDBC URL: `jdbc:h2:mem:taskdb`
- Username: `sa`
- Password: *(leave empty)*

### Run Backend Tests

```bash
cd backend
mvn test
```

---

## Frontend Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Angular CLI: `npm install -g @angular/cli`

### Install Dependencies

```bash
cd frontend
npm install
```

### Run Development Server

```bash
npm start
```

The frontend starts on **http://localhost:4200**

> Make sure the backend is running before starting the frontend.

### Run Unit Tests

```bash
npm test
```

### Run E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests (requires both backend + frontend running)
npm run e2e

# Or with UI mode
npx playwright test --ui
```

### Build for Production

```bash
npm run build
```

---

## API Reference

Base URL: `http://localhost:8080/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks (paginated, filterable) |
| GET | `/tasks/{id}` | Get task by ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/{id}` | Update a task |
| PATCH | `/tasks/{id}/toggle` | Toggle completion status |
| DELETE | `/tasks/{id}` | Delete a task |

### GET /tasks Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `isCompleted` | Boolean | Filter by completion status |
| `dueDateFrom` | ISO DateTime | Filter tasks due after this date |
| `dueDateTo` | ISO DateTime | Filter tasks due before this date |
| `sortBy` | String | Sort field: `title`, `dueDate`, `createdAt` |
| `sortDirection` | String | `asc` or `desc` |
| `page` | Integer | Page number (0-indexed) |
| `size` | Integer | Items per page |

### Example Requests

```bash
# Create a task
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk, eggs, bread","dueDate":"2024-12-31T18:00:00"}'

# Get pending tasks sorted by due date
curl "http://localhost:8080/api/tasks?isCompleted=false&sortBy=dueDate&sortDirection=asc"

# Toggle completion
curl -X PATCH http://localhost:8080/api/tasks/1/toggle
```

---

## Design Document

### Architecture Overview

The application follows a classic **3-tier architecture**:

```
[Angular SPA] ←→ HTTP/REST ←→ [Spring Boot API] ←→ JPA/Hibernate ←→ [H2 DB]
```

### Data Model

**TaskEntity**

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | Integer | PK, Auto-generated |
| `title` | String | NOT NULL, MAX 100 chars |
| `description` | String | Optional, TEXT |
| `isCompleted` | Boolean | NOT NULL, Default: false |
| `dueDate` | LocalDateTime | Optional |
| `createdAt` | LocalDateTime | Auto-set on creation |
| `updatedAt` | LocalDateTime | Auto-set on update |

### Backend Design Decisions

**Service Layer Pattern**: Business logic is encapsulated in `TaskServiceImpl`, keeping the controller thin and testable.

**DTO Pattern**: `TaskDTO` decouples the API contract from the database entity, allowing independent evolution of both layers.

**Repository Layer**: `TaskRepository` extends `JpaRepository` and uses a custom JPQL query (`findWithFilters`) that supports optional filtering by completion status and date range. `Spring Data` handles pagination and sorting via `Pageable`.

**Error Handling**: `GlobalExceptionHandler` (`@RestControllerAdvice`) centralizes all error handling:
- `TaskNotFoundException` → 404 Not Found
- `MethodArgumentNotValidException` → 400 Bad Request with field-level errors
- Generic `Exception` → 500 Internal Server Error

**Validation**: Jakarta Bean Validation annotations on `TaskDTO` enforce constraints at the API boundary.

**CORS**: `WebConfig` allows requests from `http://localhost:4200` during development.

### Frontend Design Decisions

**Standalone Components**: Angular 17 standalone components eliminate the need for NgModules, reducing boilerplate.

**Lazy Loading**: Routes use `loadComponent()` for code splitting, only loading component code when that route is visited.

**Reactive Forms**: The task form uses Angular's Reactive Forms for type-safe, programmatic form control with built-in validation.

**State Management**: Component-local state is sufficient for this application. The task list re-fetches from the API after mutations (create/update/delete) to stay in sync. Filtering, sorting, and pagination state is kept in the component and sent as query parameters.

**Client-side Filtering**: The `TaskFilterRequest` parameters are sent to the server, which performs the actual filtering and pagination — the source of truth remains on the backend.

### Error Handling Strategy

- **Backend errors** surface to the Angular components via RxJS `error` callbacks
- **Field-level validation errors** from the backend (400 responses with `fieldErrors`) are applied directly to the reactive form controls
- **User-friendly error messages** are displayed in prominent alert banners
- **404 responses** show a clear "not found" state

### Security Considerations

This is a development-only configuration. For production:
- Replace H2 with a persistent database (PostgreSQL, MySQL)
- Add Spring Security for authentication/authorization
- Restrict CORS to specific trusted origins
- Enable HTTPS
- Add rate limiting

### Testing Strategy

**Backend (JUnit + Mockito)**:
- Service layer is tested in isolation with mocked repositories
- Tests cover: happy path (create, toggle, delete), edge cases (not found)

**Frontend (Jasmine + Karma)**:
- `TaskService` is tested with `HttpTestingController` to mock HTTP calls
- Tests verify correct HTTP methods, URLs, and response mapping

**E2E (Playwright)**:
- Tests cover: page rendering, form validation, navigation, routing
- Tests are designed to be runnable independently of the backend (validation tests)
- Full CRUD tests require both servers running
=======
# task-manager
task manager application 
>>>>>>> af2cd7aff0657107f9ff00ddc99f7973ea8a456c
