# TaskFlow — Full-Stack Task Manager

A modern, production-ready task manager built with **React + Vite** (frontend) and **FastAPI + MongoDB** (backend).

---

## ✨ Features
- 🔐 JWT authentication (register, login, logout)
- ✅ Full task CRUD — create, edit, toggle complete, delete
- 🎨 Dark-themed glassmorphism UI with micro-animations
- 📊 Dashboard stats: total / active / completed / high-priority
- 🔍 Filter tasks: All / Active / Completed
- 🔒 Bcrypt password hashing, ownership-enforced task access
- 📱 Fully responsive

---

## 📁 Project Structure
```
sample/
├── backend/          # FastAPI Python server
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── requirements.txt
│   └── .env.example
└── frontend/         # React + Vite client
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   └── pages/
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Setup & Running Locally

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** running locally on `localhost:27017`
  - Install: https://www.mongodb.com/try/download/community
  - Or use Docker: `docker run -d -p 27017:27017 mongo`

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux

# Start the server (hot-reload enabled)
uvicorn main:app --reload --port 8000
```

The API will be running at **http://localhost:8000**  
Interactive API docs available at **http://localhost:8000/docs**

---

### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Copy and configure environment variables
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux

# Start the dev server
npm run dev
```

The app will be running at **http://localhost:5173**

---

## 🔑 Environment Variables

### backend/.env
| Variable | Default | Description |
|---|---|---|
| `MONGODB_URL` | `mongodb://localhost:27017` | MongoDB connection string |
| `DB_NAME` | `taskmanager` | MongoDB database name |
| `JWT_SECRET_KEY` | *(change this!)* | Secret key for signing JWTs |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `JWT_EXPIRE_DAYS` | `7` | Token expiry in days |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |

### frontend/.env
| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | *(empty)* | Backend URL (empty = use Vite proxy) |

---

## 🛠️ API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT token |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/me` | Yes | Get current user profile |
| GET | `/api/tasks/` | Yes | List all tasks for current user |
| POST | `/api/tasks/` | Yes | Create a new task |
| PUT | `/api/tasks/{id}` | Yes | Update a task |
| PATCH | `/api/tasks/{id}/toggle` | Yes | Toggle task completed status |
| DELETE | `/api/tasks/{id}` | Yes | Delete a task |

---

## 🔒 Security Notes

- Passwords are hashed with **bcrypt** (via passlib) — never stored in plain text
- JWT tokens are signed with a secret key — **change `JWT_SECRET_KEY` in production!**
- All task endpoints verify the `user_id` to prevent cross-user access
- CORS is restricted to the configured frontend origins only

---

## 🧪 Development Tips

- Backend auto-reloads on file changes with `--reload`
- Frontend hot-reloads via Vite HMR
- API docs (Swagger UI): http://localhost:8000/docs
- API docs (ReDoc): http://localhost:8000/redoc
