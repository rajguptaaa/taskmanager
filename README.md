# TaskFlow — Team Task Manager

A minimal MERN stack app with role-based access (Admin / Member).

## ⚡ Quick Start

### 1. Configure MongoDB
- Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free cluster
- Get your connection string
- Copy `server/.env.example` → `server/.env` and fill in your values:

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/taskmanager?retryWrites=true&w=majority
JWT_SECRET=any_random_secret_string
PORT=5000
```

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Start the app

**Terminal 1 — Backend:**
```bash
cd server
npm start
```

**Terminal 2 — Frontend:**
```bash
cd client
npm start
```

App opens at **http://localhost:3000**

---

## Features

- **Auth** — Signup/Login with JWT, role selection (Admin or Member)
- **Dashboard** — Stats: total/todo/in-progress/done/overdue tasks + project count
- **Projects** — Admins can create/edit/delete projects, assign members
- **Tasks** — Create tasks with title, project, assignee, priority, status, due date
- **Role-based access** — Admins have full control; Members can view and update task status

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/signup | — | Register |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✓ | Current user |
| GET | /api/auth/users | ✓ | All users |
| GET | /api/projects | ✓ | List projects |
| POST | /api/projects | Admin | Create project |
| PUT | /api/projects/:id | Admin | Update project |
| DELETE | /api/projects/:id | Admin | Delete project |
| GET | /api/tasks | ✓ | List tasks |
| POST | /api/tasks | ✓ | Create task |
| PUT | /api/tasks/:id | ✓ | Update task |
| DELETE | /api/tasks/:id | Admin | Delete task |
| GET | /api/dashboard | ✓ | Dashboard stats |
