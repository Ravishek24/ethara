import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const baseLink =
    'text-sm font-medium text-slate-300 hover:text-white transition-colors border-b-2 border-transparent pb-1'
  const active =
    'text-white border-b-2 border-rose-500 pb-1'

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-slate-950 text-white shadow-sm">
      <div className="text-xl font-bold tracking-tight text-rose-400">
        HRMS Lite
      </div>
      <div className="flex gap-6">
        <Link
          to="/"
          className={
            location.pathname === '/' ? `${baseLink} ${active}` : baseLink
          }
        >
          Employees
        </Link>
        <Link
          to="/attendance"
          className={
            location.pathname === '/attendance'
              ? `${baseLink} ${active}`
              : baseLink
          }
        >
          Attendance
        </Link>
      </div>
    </nav>
  )
}

