# Admin Module Backend (Express + JWT)

Beginner-friendly admin module with role-based access, JWT auth, and file-based storage. No external database required.

## Folder Structure

```
backend/
  .env.example
  package.json
  README.md
  data/
    users.json
  src/
    server.js
    config/
    controllers/
      admin.controller.js
      auth.controller.js
      user.controller.js
    middleware/
      auth.middleware.js
    models/
      user.model.js
    routes/
      admin.routes.js
      auth.routes.js
      user.routes.js
    utils/
      errorHandler.js
      notFoundHandler.js
    validations/
```

## Environment

Copy `.env.example` to `.env` and adjust:

```
PORT=4000
JWT_SECRET=supersecret_jwt_key_change_me
JWT_EXPIRES_IN=1d
```

## Install & Run

```bash
cd backend
npm install
npm run dev
# or
npm start
```

Server runs on `http://localhost:4000`.

Seed users are created on first run:
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

## REST API

### Auth
- POST `/api/auth/login`
  - Body: `{ "email": "admin@example.com", "password": "admin123" }`
  - Response: `{ token, user }`
- POST `/api/auth/logout`
  - Response: `{ message: 'Logged out' }`
- POST `/api/auth/register` (public; creates a User)
  - Body: `{ "name": "Your Name", "email": "you@example.com", "password": "strongpass" }`
  - Response: `{ token, user }`

### Users (Admin only)
- GET `/api/users` → list users
- GET `/api/users/:id` → get user
- POST `/api/users` → create user
  - Body: `{ name, email, password, role? }`
- PUT `/api/users/:id` → update user
  - Body: `{ name?, email?, password?, role? }`
- DELETE `/api/users/:id` → delete user

### Admin
- GET `/api/admin/dashboard` → stats for dashboard

Authorization header format for protected routes:
```
Authorization: Bearer <JWT_TOKEN>
```

## Sample Requests

```bash
# Login as admin
curl -s http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Use token
TOKEN="$(curl -s http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"admin123"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")"

# List users (admin)
curl http://localhost:4000/api/users -H "Authorization: Bearer $TOKEN"

# Create user (admin)
curl -X POST http://localhost:4000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"pass123","role":"User"}'

# Dashboard
curl http://localhost:4000/api/admin/dashboard -H "Authorization: Bearer $TOKEN"

# Sign up (public)
curl -s http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"newuser@example.com","password":"pass123"}'
```

## Notes
- Passwords are hashed with bcryptjs.
- JWT is stateless; logout is client-side.
- Storage is file-based (`data/users.json`) for simplicity.
- Input validation is kept simple with helpful error messages.
