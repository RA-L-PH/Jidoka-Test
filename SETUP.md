# Task Manager API - Setup & Run Instructions

## Prerequisites

- **Node.js** (version 16.0.0 or higher)
- **PostgreSQL** (version 12 or higher)
- **npm** or **yarn** package manager

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
copy .env.example .env
```

Update the `.env` file with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_manager_db
DB_USER=your_db_username
DB_PASSWORD=your_db_password

# JWT Secret (IMPORTANT: Change this in production!)
JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. Database Setup

Create a PostgreSQL database:

```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE task_manager_db;
```

Run database migration:

```bash
npm run migrate
```

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The API will be available at: `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires auth)

### Tasks (All require authentication)

- `GET /api/tasks` - List all user tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats` - Get task statistics

## Example Usage

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

Response will include a JWT token.

### 3. Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, and bread",
    "due_date": "2026-01-31T10:00:00Z"
  }'
```

### 4. Get All Tasks

```bash
curl -X GET "http://localhost:3000/api/tasks?page=1&limit=10&status=PENDING" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Project Structure

```
task-manager-api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Express middlewares
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── app.js           # Express app setup
├── tests/               # Test files
├── server.js            # Entry point
├── package.json
└── README.md
```

## API Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "data": any,
  "error": string|null,
  "message": string (optional)
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

## Security Features

- **Password Hashing**: Uses bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Joi validation for all endpoints
- **CORS Protection**: Configurable origin restrictions
- **SQL Injection Protection**: Sequelize ORM prevents SQL injection

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `task_manager_db` |
| `DB_USER` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration | `24h` |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:3000` |

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper database credentials
4. Set up SSL/TLS
5. Use a process manager like PM2
6. Set up proper logging and monitoring

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify database exists
4. Check firewall settings

### Common Errors

- **Port already in use**: Change `PORT` in `.env`
- **Database connection failed**: Check PostgreSQL service
- **JWT token invalid**: Ensure token is properly formatted as `Bearer <token>`

For more help, check the logs or create an issue in the repository.