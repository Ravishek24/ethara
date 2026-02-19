# HRMS Lite

A lightweight Human Resource Management System for managing employees and tracking attendance.

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios, Tailwind CSS — typically deployed on Vercel
- **Backend:** Django + Django REST Framework — typically deployed on Render
- **Database:** PostgreSQL (Render managed DB in production)

## Live Links

- Frontend: http://localhost:5175
- Backend API: https://ethara-1-9uij.onrender.com/api

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

## Features

- Add, view, delete employees
- Mark daily attendance (present/absent)
- Filter attendance by date and employee
- Present days summary per employee
- Dashboard stats (total employees, present/absent counts)

## Assumptions

- Single admin user, no authentication required
- One attendance record per employee per day enforced at DB level

