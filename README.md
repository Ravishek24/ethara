# HRMS Lite

A lightweight Human Resource Management System for managing employees and tracking attendance.

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios, Tailwind CSS — typically deployed on Vercel
- **Backend:** Django + Django REST Framework — typically deployed on Render
- **Database:** PostgreSQL (Render managed DB in production)

## Live Links

- Frontend: https://your-app.vercel.app
- Backend API: https://your-backend.onrender.com/api

## Run Locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # on Windows
pip install -r requirements.txt
# Create a .env file with your PostgreSQL credentials (POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT)
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
# Create .env.local with:
# VITE_API_URL=http://localhost:8000/api
npm run dev
```

## Deploying Backend to Render

1. Push this repo to GitHub.
2. On Render, create a new **Web Service** from the GitHub repo pointing to the `backend` directory.
3. Use these commands:
   - **Build command:** `pip install -r requirements.txt && bash build.sh`
   - **Start command:** `gunicorn core.wsgi:application`
4. Add environment variables on Render:
   - `RENDER=true`
   - `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` (from Render PostgreSQL add-on)

## Deploying Frontend to Vercel

1. Push this repo to GitHub (same repo as backend is fine).
2. On Vercel, import the repo and select the `frontend` folder.
3. In Vercel environment variables, set:
   - `VITE_API_URL=https://your-backend.onrender.com/api`
4. Vercel will auto-detect Vite React and deploy.

> After deployment, update your Django `CORS_ALLOWED_ORIGINS` to include your Vercel URL.

## Features

- Add, view, delete employees
- Mark daily attendance (present/absent)
- Filter attendance by date and employee
- Present days summary per employee
- Dashboard stats (total employees, present/absent counts)

## Assumptions

- Single admin user, no authentication required
- One attendance record per employee per day enforced at DB level

