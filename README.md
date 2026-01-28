## 1. Executive Summary

The Task Management API is a backend service designed to support a To-Do List application. It serves as a centralized hub for managing user identities and task data. The primary goal is to provide a clean, RESTful interface for performing CRUD (Create, Read, Update, Delete) operations with secure authentication.

## 2. Objectives

* **Core Functionality:** Enable users to create accounts and manage their personal tasks.
* **Security:** Implement secure user authentication (JWT) and password hashing.
* **Scalability:** Design a structure that allows for future feature additions (e.g., tags, categories).
* **Education:** Demonstrate industry-standard backend architecture (MVC or Layered Architecture).

---

## 3. User Stories

* **As a User**, I want to register and log in so that my tasks are private and saved securely.
* **As a User**, I want to create a new task with a title and description so I can remember what to do.
* **As a User**, I want to view a list of all my tasks so I can see my workload.
* **As a User**, I want to filter my tasks by status (e.g., pending vs. completed) so I can focus on what's important.
* **As a User**, I want to update a task (e.g., mark as done) to track my progress.
* **As a User**, I want to delete a task when it is no longer relevant.

---

## 4. Functional Requirements

### 4.1 Authentication & Authorization

* **Registration:** Users must provide a username/email and password.
* **Login:** Users receive a JSON Web Token (JWT) upon successful login.
* **Protection:** All Task routes must be protected; users can only access their own data.

### 4.2 Task Management

* **Create:** Create a task with at least a `title`. Optional fields: `description`, `due_date`.
* **Read:** Retrieve all tasks belonging to the authenticated user. Support pagination and status filtering.
* **Read (Single):** Retrieve specific task details by ID.
* **Update:** Modify task details or toggle status (`pending` <-> `completed`).
* **Delete:** Permanently remove a task.

---

## 5. Technical Architecture

### 5.1 Database Schema

The database will be relational (e.g., PostgreSQL or MySQL) to enforce structure.

**Table: Users**
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID/Int | PK, Auto-inc | Unique User ID |
| `email` | Varchar | Unique, Not Null | User email |
| `password_hash`| Varchar | Not Null | Hashed password (Bcrypt) |
| `created_at` | Timestamp | Default Now | Creation time |

**Table: Tasks**
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID/Int | PK, Auto-inc | Unique Task ID |
| `user_id` | UUID/Int | FK (Users) | Owner of the task |
| `title` | Varchar | Not Null | Task headline |
| `description` | Text | Nullable | Detailed notes |
| `status` | Enum | Default 'PENDING' | 'PENDING', 'IN_PROGRESS', 'COMPLETED' |
| `created_at` | Timestamp | Default Now | Creation time |

### 5.2 API Endpoints Specification

All API responses should follow a standard JSON format: `{ "success": boolean, "data": any, "error": string|null }`.

#### **Auth Routes**

* `POST /api/auth/register`
* **Body:** `{ "email": "...", "password": "..." }`


* `POST /api/auth/login`
* **Body:** `{ "email": "...", "password": "..." }`
* **Response:** `{ "token": "jwt_string..." }`



#### **Task Routes (Protected)**

* `GET /api/tasks`
* **Query Params:** `?page=1&limit=10&status=PENDING`


* `POST /api/tasks`
* **Body:** `{ "title": "Buy groceries", "description": "Milk and eggs" }`


* `GET /api/tasks/:id`
* `PUT /api/tasks/:id`
* **Body:** `{ "status": "COMPLETED" }`


* `DELETE /api/tasks/:id`

---

## 6. Recommended File Structure (Node.js/Express Example)

To ensure the project is maintainable and scalable, we will use a **Layered Architecture** (separating concerns into Controllers, Services, and Data Access Layers).

```text
task-manager-api/
├── src/
│   ├── config/              # Environment variables and configuration setup
│   │   ├── db.js            # Database connection logic
│   │   └── env.js           # Environment variable loader
│   │
│   ├── controllers/         # Handles incoming HTTP requests and responses
│   │   ├── authController.js
│   │   └── taskController.js
│   │
│   ├── middlewares/         # Express middlewares
│   │   ├── authMiddleware.js # Validates JWT tokens
│   │   ├── errorMiddleware.js # Global error handler
│   │   └── validation.js    # Request body validation (e.g., Joi/Zod)
│   │
│   ├── models/              # Database models (Sequelize/Mongoose schemas)
│   │   ├── User.js
│   │   └── Task.js
│   │
│   ├── routes/              # API Route definitions
│   │   ├── authRoutes.js    # Maps /auth endpoints to authController
│   │   └── taskRoutes.js    # Maps /tasks endpoints to taskController
│   │
│   ├── services/            # Business logic (The "brain" of the app)
│   │   ├── authService.js   # Hash passwords, generate tokens
│   │   └── taskService.js   # Logic for task creation, filtering, ownership checks
│   │
│   ├── utils/               # Helper functions
│   │   └── logger.js        # Logging utility
│   │
│   └── app.js               # Express app setup (middleware usage, route mounting)
│
├── tests/                   # Unit and Integration tests
│   ├── auth.test.js
│   └── tasks.test.js
│
├── .env.example             # Template for environment variables
├── .gitignore
├── package.json
└── server.js                # Entry point (starts the server)

```

### Detailed Breakdown of Key Folders:

1. **Controllers:** Only parse the request (req.body, req.params) and send the response. They should *not* contain business logic (e.g., "how to calculate a due date" or "hashing a password"). They delegate to **Services**.
2. **Services:** Contain the actual business rules. For example, `taskService.updateTask` would check if the task exists and if the user owns it before updating.
3. **Middlewares:** `authMiddleware.js` is critical here. It intercepts the request, checks the `Authorization` header for a valid JWT, attaches the user to `req.user`, and passes control to the controller.

---

## 7. Non-Functional Requirements

* **Security:**
* Use **Bcrypt** (or Argon2) for hashing passwords. Never store plain text passwords.
* Sanitize inputs to prevent SQL Injection (if using SQL) or NoSQL Injection.
* Implement **CORS** (Cross-Origin Resource Sharing) policies to allow frontend access.


* **Performance:**
* Database indexing on `user_id` in the Tasks table for fast retrieval.


* **Validation:**
* Use a library like **Joi** or **Zod** to validate request bodies (e.g., ensure email is valid format, title is not empty).



---

## 8. Development Roadmap

1. **Phase 1: Setup:** Initialize project, setup Git, connect to Database.
2. **Phase 2: Auth Module:** Implement User model, Registration, and Login logic.
3. **Phase 3: Core CRUD:** Implement Task model and CRUD routes.
4. **Phase 4: Middleware:** Secure the Task routes with JWT verification.
5. **Phase 5: Refinement:** Add input validation and error handling.

### Would you like me to generate the code for the `authMiddleware.js` or the Database Schema setup (SQL/Mongoose) to get you started?
