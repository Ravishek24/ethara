import { useEffect, useMemo, useState } from 'react'
import { attendanceAPI, employeeAPI } from '../api'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function AttendancePage() {
  const [employees, setEmployees] = useState([])
  const [records, setRecords] = useState([])
  const [form, setForm] = useState({ employee: '', date: '', status: 'present' })
  const [filterDate, setFilterDate] = useState('')
  const [filterEmployee, setFilterEmployee] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([employeeAPI.getAll(), attendanceAPI.getAll()])
      .then(([empRes, attRes]) => {
        setEmployees(empRes.data)
        setRecords(attRes.data)
      })
      .catch(() => {
        setError('Failed to load attendance data.')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await attendanceAPI.create(form)
      setRecords((prev) => [res.data, ...prev])
      setForm({ employee: '', date: '', status: 'present' })
    } catch (err) {
      setError(
        err.response?.data?.non_field_errors?.[0] ||
          'Failed to mark attendance.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        const matchDate = filterDate ? r.date === filterDate : true
        const matchEmp = filterEmployee
          ? r.employee === Number.parseInt(filterEmployee, 10)
          : true
        return matchDate && matchEmp
      }),
    [records, filterDate, filterEmployee]
  )

  const presentCounts = useMemo(
    () =>
      employees.map((emp) => ({
        ...emp,
        presentDays: records.filter(
          (r) => r.employee === emp.id && r.status === 'present'
        ).length,
      })),
    [employees, records]
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Attendance Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Mark daily attendance, view records, and see summary stats.
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <DashboardCard
          label="Total Employees"
          value={employees.length}
          tone="primary"
        />
        <DashboardCard
          label="Total Present Records"
          value={records.filter((r) => r.status === 'present').length}
          tone="success"
        />
        <DashboardCard
          label="Total Absent Records"
          value={records.filter((r) => r.status === 'absent').length}
          tone="danger"
        />
      </div>

      {/* Mark Attendance Form */}
      <section className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Mark Attendance
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <select
              name="employee"
              required
              value={form.employee}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, employee: e.target.value }))
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employee_id} — {emp.full_name}
                </option>
              ))}
            </select>

            <input
              type="date"
              required
              value={form.date}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, date: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />

            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value }))
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Saving...' : 'Mark Attendance'}
          </button>
        </form>
      </section>

      {/* Present Days Summary */}
      <section className="mb-8">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Present Days Summary
        </h3>
        {presentCounts.length === 0 ? (
          <EmptyState message="No employees to summarize yet." />
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-950 text-white">
                <tr>
                  {['Employee ID', 'Name', 'Department', 'Present Days'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {presentCounts.map((emp, idx) => (
                  <tr
                    key={emp.id}
                    className={
                      idx % 2 === 0
                        ? 'border-t border-slate-100 bg-white'
                        : 'border-t border-slate-100 bg-slate-50'
                    }
                  >
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {emp.employee_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {emp.full_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {emp.department}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {emp.presentDays} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Attendance Records with Filters */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Attendance Records
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs shadow-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs shadow-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setFilterDate('')
                setFilterEmployee('')
              }}
              className="inline-flex h-9 items-center rounded-lg bg-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-300"
            >
              Clear
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="No attendance records found." />
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-950 text-white">
                <tr>
                  {['Employee', 'Date', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec, idx) => (
                  <tr
                    key={rec.id}
                    className={
                      idx % 2 === 0
                        ? 'border-t border-slate-100 bg-white'
                        : 'border-t border-slate-100 bg-slate-50'
                    }
                  >
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {rec.employee_name || rec.employee}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {rec.date}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          rec.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {rec.status.charAt(0).toUpperCase() +
                          rec.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function DashboardCard({ label, value, tone }) {
  const tones = {
    primary: 'bg-slate-950 text-white',
    success: 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100',
    danger: 'bg-rose-50 text-rose-900 ring-1 ring-rose-100',
  }

  const numTone =
    tone === 'primary'
      ? 'text-3xl font-bold text-rose-400'
      : 'text-3xl font-bold text-slate-900'

  return (
    <div
      className={`rounded-xl px-5 py-4 shadow-sm ${tones[tone] ?? tones.primary}`}
    >
      <div className={numTone}>{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide opacity-80">
        {label}
      </div>
    </div>
  )
}

