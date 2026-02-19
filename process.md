# HRMS Lite — 5 Part Completion Plan

---

## Part 1: Project Setup & Django Backend Foundation
**Goal:** Get the project skeleton, database, and models ready.

**Project Structure to create:**
```
hrms-lite/
├── backend/
├── frontend/
└── README.md
```

**Django Setup — run these commands:**
```bash
mkdir hrms-lite && cd hrms-lite
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install django djangorestframework psycopg2-binary django-filter django-cors-headers python-decouple

pip freeze > requirements.txt

django-admin startproject core .
python manage.py startapp employees
python manage.py startapp attendance
```

**Your folder structure should look like:**
```
backend/
├── core/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── employees/
│   └── models.py
├── attendance/
│   └── models.py
├── manage.py
└── requirements.txt
```

**Configure `core/settings.py`:**
```python
import os

INSTALLED_APPS = [
    # django defaults...
    'rest_framework',
    'django_filters',
    'corsheaders',
    'employees',
    'attendance',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be first
    # ... rest unchanged
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'hrmsdb'),
        'USER': os.environ.get('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'postgres'),
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
}
```

**Employee Model — `employees/models.py`:**
```python
from django.db import models

class Employee(models.Model):
    employee_id = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"
```

**Attendance Model — `attendance/models.py`:**
```python
from django.db import models
from employees.models import Employee

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
    ]

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    class Meta:
        ordering = ['-date']
        unique_together = ['employee', 'date']  # one record per employee per day

    def __str__(self):
        return f"{self.employee.full_name} - {self.date} - {self.status}"
```

**Run migrations:**
```bash
python manage.py makemigrations employees attendance
python manage.py migrate
python manage.py runserver
```

**What to commit:** Django project initialized, both models with constraints, settings configured.

---

## Part 2: Backend API Endpoints
**Goal:** All REST endpoints working with validation and proper error handling.

**Employee Serializer — `employees/serializers.py`:**
```python
from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['created_at']

    def validate_email(self, value):
        return value.lower()

    def validate_employee_id(self, value):
        return value.strip().upper()
```

**Employee Views — `employees/views.py`:**
```python
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Employee
from .serializers import EmployeeSerializer

class EmployeeListCreateView(generics.ListCreateAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

class EmployeeDeleteView(generics.DestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
```

**Attendance Serializer — `attendance/serializers.py`:**
```python
from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(
        source='employee.full_name', read_only=True
    )
    employee_id_code = serializers.CharField(
        source='employee.employee_id', read_only=True
    )

    class Meta:
        model = Attendance
        fields = '__all__'

    def validate(self, data):
        # Prevent duplicate attendance for same employee+date on create
        if self.instance is None:
            if Attendance.objects.filter(
                employee=data['employee'],
                date=data['date']
            ).exists():
                raise serializers.ValidationError(
                    "Attendance for this employee on this date already exists."
                )
        return data
```

**Attendance Views — `attendance/views.py`:**
```python
from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from .models import Attendance
from .serializers import AttendanceSerializer

class AttendanceListCreateView(generics.ListCreateAPIView):
    queryset = Attendance.objects.select_related('employee').all()
    serializer_class = AttendanceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'date', 'status']  # bonus: filter by date

class AttendanceByEmployeeView(generics.ListAPIView):
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        employee_id = self.kwargs['employee_id']
        return Attendance.objects.filter(
            employee_id=employee_id
        ).select_related('employee')
```

**URLs — `employees/urls.py`:**
```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.EmployeeListCreateView.as_view()),
    path('<int:pk>/', views.EmployeeDeleteView.as_view()),
]
```

**URLs — `attendance/urls.py`:**
```python
from django.urls import path
from . import views

urlpatterns = [
    path('', views.AttendanceListCreateView.as_view()),
    path('employee/<int:employee_id>/', views.AttendanceByEmployeeView.as_view()),
]
```

**Wire into `core/urls.py`:**
```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/employees/', include('employees.urls')),
    path('api/attendance/', include('attendance.urls')),
]
```

**API Reference to test:**

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/api/employees/` | List all employees |
| POST | `/api/employees/` | Add new employee |
| DELETE | `/api/employees/<id>/` | Delete employee |
| GET | `/api/attendance/` | List all attendance |
| POST | `/api/attendance/` | Mark attendance |
| GET | `/api/attendance/employee/<id>/` | Attendance by employee |
| GET | `/api/attendance/?date=2024-01-15` | Filter by date (bonus) |

**What to commit:** All endpoints working, validation active, proper HTTP status codes returning.

---

## Part 3: React Frontend Setup & Employee Management
**Goal:** React project scaffolded with employee list, add, and delete fully working.

**Create React app:**
```bash
cd ../  # back to hrms-lite root
npx create-react-app frontend
cd frontend
npm install axios react-router-dom
```

**Folder structure to create inside `src/`:**
```
src/
├── api/
│   └── index.js          ← all axios calls live here
├── components/
│   ├── Navbar.jsx
│   ├── EmployeeForm.jsx
│   ├── EmployeeTable.jsx
│   ├── LoadingSpinner.jsx
│   └── EmptyState.jsx
├── pages/
│   ├── EmployeesPage.jsx
│   └── AttendancePage.jsx
├── App.jsx
└── index.js
```

**`src/api/index.js` — centralize all API calls:**
```javascript
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL: BASE_URL });

export const employeeAPI = {
    getAll: () => api.get('/employees/'),
    create: (data) => api.post('/employees/', data),
    delete: (id) => api.delete(`/employees/${id}/`),
};

export const attendanceAPI = {
    getAll: () => api.get('/attendance/'),
    getByEmployee: (employeeId) => api.get(`/attendance/employee/${employeeId}/`),
    create: (data) => api.post('/attendance/', data),
    filterByDate: (date) => api.get(`/attendance/?date=${date}`),
};
```

**`src/components/Navbar.jsx`:**
```jsx
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation();

    return (
        <nav style={styles.nav}>
            <div style={styles.brand}>HRMS Lite</div>
            <div style={styles.links}>
                <Link
                    to="/"
                    style={location.pathname === '/' ? styles.activeLink : styles.link}
                >
                    Employees
                </Link>
                <Link
                    to="/attendance"
                    style={location.pathname === '/attendance' ? styles.activeLink : styles.link}
                >
                    Attendance
                </Link>
            </div>
        </nav>
    );
}

const styles = {
    nav: { display:'flex', justifyContent:'space-between', alignItems:'center',
           padding:'16px 32px', background:'#1a1a2e', color:'white' },
    brand: { fontSize:'20px', fontWeight:'bold', color:'#e94560' },
    links: { display:'flex', gap:'24px' },
    link: { color:'#ccc', textDecoration:'none' },
    activeLink: { color:'white', textDecoration:'none', fontWeight:'bold',
                  borderBottom:'2px solid #e94560', paddingBottom:'4px' },
};
```

**`src/pages/EmployeesPage.jsx`:**
```jsx
import { useState, useEffect } from 'react';
import { employeeAPI } from '../api';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeTable from '../components/EmployeeTable';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await employeeAPI.getAll();
            setEmployees(res.data);
        } catch {
            setError('Failed to load employees.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const handleAdd = async (formData) => {
        const res = await employeeAPI.create(formData);
        setEmployees(prev => [res.data, ...prev]);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this employee?')) return;
        await employeeAPI.delete(id);
        setEmployees(prev => prev.filter(e => e.id !== id));
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div style={{color:'red', padding:'32px'}}>{error}</div>;

    return (
        <div style={{ padding: '32px' }}>
            <h2>Employee Management</h2>
            <EmployeeForm onSubmit={handleAdd} />
            {employees.length === 0
                ? <EmptyState message="No employees yet. Add one above." />
                : <EmployeeTable employees={employees} onDelete={handleDelete} />
            }
        </div>
    );
}
```

**`src/components/EmployeeForm.jsx`:**
```jsx
import { useState } from 'react';

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations'];

export default function EmployeeForm({ onSubmit }) {
    const [form, setForm] = useState({
        employee_id: '', full_name: '', email: '', department: ''
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await onSubmit(form);
            setForm({ employee_id: '', full_name: '', email: '', department: '' });
        } catch (err) {
            const data = err.response?.data;
            setError(data?.email?.[0] || data?.employee_id?.[0] || 'Failed to add employee.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h3>Add New Employee</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={styles.grid}>
                <input name="employee_id" placeholder="Employee ID" value={form.employee_id}
                    onChange={handleChange} required style={styles.input} />
                <input name="full_name" placeholder="Full Name" value={form.full_name}
                    onChange={handleChange} required style={styles.input} />
                <input name="email" type="email" placeholder="Email" value={form.email}
                    onChange={handleChange} required style={styles.input} />
                <select name="department" value={form.department}
                    onChange={handleChange} required style={styles.input}>
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
            </div>
            <button type="submit" disabled={submitting} style={styles.btn}>
                {submitting ? 'Adding...' : 'Add Employee'}
            </button>
        </form>
    );
}

const styles = {
    form: { background:'#f9f9f9', padding:'24px', borderRadius:'8px', marginBottom:'32px' },
    grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' },
    input: { padding:'10px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px' },
    btn: { padding:'10px 24px', background:'#1a1a2e', color:'white',
           border:'none', borderRadius:'6px', cursor:'pointer' },
};
```

**`src/components/EmployeeTable.jsx`:**
```jsx
export default function EmployeeTable({ employees, onDelete }) {
    return (
        <table style={styles.table}>
            <thead>
                <tr style={styles.headerRow}>
                    {['ID', 'Name', 'Email', 'Department', 'Action'].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {employees.map(emp => (
                    <tr key={emp.id} style={styles.row}>
                        <td style={styles.td}>{emp.employee_id}</td>
                        <td style={styles.td}>{emp.full_name}</td>
                        <td style={styles.td}>{emp.email}</td>
                        <td style={styles.td}>{emp.department}</td>
                        <td style={styles.td}>
                            <button onClick={() => onDelete(emp.id)} style={styles.deleteBtn}>
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

const styles = {
    table: { width:'100%', borderCollapse:'collapse', background:'white',
             borderRadius:'8px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
    headerRow: { background:'#1a1a2e', color:'white' },
    th: { padding:'14px 16px', textAlign:'left', fontSize:'13px', fontWeight:'600' },
    row: { borderBottom:'1px solid #eee' },
    td: { padding:'12px 16px', fontSize:'14px' },
    deleteBtn: { background:'#e94560', color:'white', border:'none',
                 padding:'6px 14px', borderRadius:'4px', cursor:'pointer' },
};
```

**Reusable components:**
```jsx
// LoadingSpinner.jsx
export default function LoadingSpinner() {
    return (
        <div style={{ textAlign:'center', padding:'60px', color:'#888' }}>
            Loading...
        </div>
    );
}

// EmptyState.jsx
export default function EmptyState({ message }) {
    return (
        <div style={{ textAlign:'center', padding:'60px', color:'#aaa',
                      background:'#f9f9f9', borderRadius:'8px' }}>
            {message}
        </div>
    );
}
```

**`src/App.jsx`:**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import EmployeesPage from './pages/EmployeesPage';
import AttendancePage from './pages/AttendancePage';

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<EmployeesPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
            </Routes>
        </BrowserRouter>
    );
}
```

**What to commit:** React app running, employee CRUD working, loading/empty/error states all showing correctly.

---

## Part 4: Attendance Management UI + Bonus Features
**Goal:** Attendance marking, viewing, filtering, and bonus dashboard summary.

**`src/pages/AttendancePage.jsx`:**
```jsx
import { useState, useEffect } from 'react';
import { employeeAPI, attendanceAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function AttendancePage() {
    const [employees, setEmployees] = useState([]);
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState({ employee: '', date: '', status: 'present' });
    const [filterDate, setFilterDate] = useState('');
    const [filterEmployee, setFilterEmployee] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([employeeAPI.getAll(), attendanceAPI.getAll()])
            .then(([empRes, attRes]) => {
                setEmployees(empRes.data);
                setRecords(attRes.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await attendanceAPI.create(form);
            setRecords(prev => [res.data, ...prev]);
            setForm({ employee: '', date: '', status: 'present' });
        } catch (err) {
            setError(err.response?.data?.non_field_errors?.[0] || 'Failed to mark attendance.');
        } finally {
            setSubmitting(false);
        }
    };

    // Bonus: filter by date and employee
    const filtered = records.filter(r => {
        const matchDate = filterDate ? r.date === filterDate : true;
        const matchEmp = filterEmployee ? r.employee === parseInt(filterEmployee) : true;
        return matchDate && matchEmp;
    });

    // Bonus: total present days per employee
    const presentCounts = employees.map(emp => ({
        ...emp,
        presentDays: records.filter(r => r.employee === emp.id && r.status === 'present').length
    }));

    if (loading) return <LoadingSpinner />;

    return (
        <div style={{ padding: '32px' }}>
            {/* Bonus: Dashboard Summary */}
            <div style={styles.summaryRow}>
                <div style={styles.card}>
                    <div style={styles.cardNum}>{employees.length}</div>
                    <div style={styles.cardLabel}>Total Employees</div>
                </div>
                <div style={styles.card}>
                    <div style={styles.cardNum}>{records.filter(r => r.status === 'present').length}</div>
                    <div style={styles.cardLabel}>Total Present Records</div>
                </div>
                <div style={styles.card}>
                    <div style={styles.cardNum}>{records.filter(r => r.status === 'absent').length}</div>
                    <div style={styles.cardLabel}>Total Absent Records</div>
                </div>
            </div>

            {/* Mark Attendance Form */}
            <form onSubmit={handleSubmit} style={styles.form}>
                <h3>Mark Attendance</h3>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div style={styles.grid}>
                    <select name="employee" value={form.employee} required style={styles.input}
                        onChange={e => setForm({ ...form, employee: e.target.value })}>
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.employee_id} — {emp.full_name}
                            </option>
                        ))}
                    </select>
                    <input type="date" value={form.date} required style={styles.input}
                        onChange={e => setForm({ ...form, date: e.target.value })} />
                    <select value={form.status} style={styles.input}
                        onChange={e => setForm({ ...form, status: e.target.value })}>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                    </select>
                </div>
                <button type="submit" disabled={submitting} style={styles.btn}>
                    {submitting ? 'Saving...' : 'Mark Attendance'}
                </button>
            </form>

            {/* Bonus: Present Days Per Employee Table */}
            <h3>Present Days Summary</h3>
            <table style={{ ...styles.table, marginBottom: '32px' }}>
                <thead>
                    <tr style={styles.headerRow}>
                        {['Employee ID', 'Name', 'Department', 'Present Days'].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {presentCounts.map(emp => (
                        <tr key={emp.id} style={styles.row}>
                            <td style={styles.td}>{emp.employee_id}</td>
                            <td style={styles.td}>{emp.full_name}</td>
                            <td style={styles.td}>{emp.department}</td>
                            <td style={styles.td}>
                                <span style={styles.badge}>{emp.presentDays} days</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Attendance Records with Filters */}
            <h3>Attendance Records</h3>
            <div style={{ display:'flex', gap:'12px', marginBottom:'16px' }}>
                <input type="date" value={filterDate} style={styles.input}
                    onChange={e => setFilterDate(e.target.value)}
                    placeholder="Filter by date" />
                <select value={filterEmployee} style={styles.input}
                    onChange={e => setFilterEmployee(e.target.value)}>
                    <option value="">All Employees</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                    ))}
                </select>
                <button onClick={() => { setFilterDate(''); setFilterEmployee(''); }}
                    style={{ ...styles.btn, background: '#888' }}>
                    Clear
                </button>
            </div>

            {filtered.length === 0
                ? <EmptyState message="No attendance records found." />
                : (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.headerRow}>
                                {['Employee', 'Date', 'Status'].map(h => (
                                    <th key={h} style={styles.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(rec => (
                                <tr key={rec.id} style={styles.row}>
                                    <td style={styles.td}>{rec.employee_name || rec.employee}</td>
                                    <td style={styles.td}>{rec.date}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            background: rec.status === 'present' ? '#d4edda' : '#f8d7da',
                                            color: rec.status === 'present' ? '#155724' : '#721c24',
                                        }}>
                                            {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            }
        </div>
    );
}

const styles = {
    summaryRow: { display:'grid', gridTemplateColumns:'repeat(3,1fr)',
                  gap:'16px', marginBottom:'32px' },
    card: { background:'#1a1a2e', color:'white', padding:'24px',
            borderRadius:'8px', textAlign:'center' },
    cardNum: { fontSize:'36px', fontWeight:'bold', color:'#e94560' },
    cardLabel: { fontSize:'13px', marginTop:'8px', color:'#ccc' },
    form: { background:'#f9f9f9', padding:'24px', borderRadius:'8px', marginBottom:'32px' },
    grid: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'16px' },
    input: { padding:'10px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px' },
    btn: { padding:'10px 24px', background:'#1a1a2e', color:'white',
           border:'none', borderRadius:'6px', cursor:'pointer' },
    table: { width:'100%', borderCollapse:'collapse', background:'white',
             borderRadius:'8px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
             marginBottom:'16px' },
    headerRow: { background:'#1a1a2e', color:'white' },
    th: { padding:'14px 16px', textAlign:'left', fontSize:'13px' },
    row: { borderBottom:'1px solid #eee' },
    td: { padding:'12px 16px', fontSize:'14px' },
    statusBadge: { padding:'4px 10px', borderRadius:'12px', fontSize:'12px', fontWeight:'600' },
    badge: { background:'#e8f4fd', color:'#1a5276', padding:'4px 10px',
             borderRadius:'12px', fontSize:'12px', fontWeight:'600' },
};
```

**What to commit:** Attendance marking, viewing, filtering by date/employee, present days summary, and dashboard counts all working.

---

## Part 5: Deployment & README
**Goal:** Live frontend + backend deployed, GitHub repo ready, README complete.

**Backend deployment on Render:**

First add these packages:
```bash
pip install gunicorn whitenoise dj-database-url
pip freeze > requirements.txt
```

Update `core/settings.py` for production:
```python
import dj_database_url

# At the bottom
if os.environ.get('RENDER'):
    DEBUG = False
    ALLOWED_HOSTS = ['your-app-name.onrender.com']
    DATABASES['default'] = dj_database_url.config(conn_max_age=600)
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

Create `build.sh` in backend root:
```bash
#!/usr/bin/env bash
python manage.py collectstatic --no-input
python manage.py migrate
```

On Render dashboard: create a new Web Service, connect your GitHub repo, set build command to `pip install -r requirements.txt && bash build.sh`, start command to `gunicorn core.wsgi:application`, and add environment variables for `POSTGRES_*` from Render's PostgreSQL addon plus set `RENDER=true`.

**Frontend deployment on Vercel:**

Create `frontend/.env.production`:
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

Push to GitHub and connect repo to Vercel. Vercel auto-detects React and deploys. In Vercel settings add the environment variable `REACT_APP_API_URL` pointing to your live Render backend URL. Also update your Django backend's `CORS_ALLOWED_ORIGINS` to include your Vercel URL.

**GitHub cleanup checklist before pushing:**
```
.gitignore should include:
  backend/venv/
  backend/.env
  frontend/node_modules/
  frontend/.env.local
  **/__pycache__/
  *.pyc
```

**README.md to write:**
```markdown
# HRMS Lite

A lightweight Human Resource Management System for managing employees and tracking attendance.

## Tech Stack
- **Frontend:** React, React Router, Axios — deployed on Vercel
- **Backend:** Django + Django REST Framework — deployed on Render
- **Database:** PostgreSQL (Render managed DB)

## Live Links
- Frontend: https://your-app.vercel.app
- Backend API: https://your-api.onrender.com/api

## Run Locally

### Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Create a .env file with your PostgreSQL credentials
python manage.py migrate
python manage.py runserver

### Frontend
cd frontend
npm install
# Create .env.local with REACT_APP_API_URL=http://localhost:8000/api
npm start

## Features
- Add, view, delete employees
- Mark daily attendance (present/absent)
- Filter attendance by date and employee
- Present days summary per employee
- Dashboard stats (total employees, present/absent counts)

## Assumptions
- Single admin user, no authentication required
- One attendance record per employee per day enforced at DB level
```

**Final pre-submission checklist:**

| Check | Status |
|---|---|
| Employee add/delete works on live URL | ✓ |
| Attendance marking works on live URL | ✓ |
| Filters work correctly | ✓ |
| No console errors in browser | ✓ |
| Loading, empty, error states all visible | ✓ |
| GitHub repo is public with full commit history | ✓ |
| README has both live URLs | ✓ |
| No API keys or `.env` files committed | ✓ |

**Time allocation:** Part 1 = 30 min, Part 2 = 60 min, Part 3 = 90 min, Part 4 = 60 min, Part 5 = 60 min — totals ~5 hours, leaving comfortable buffer for debugging.