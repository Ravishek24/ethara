import { useState } from 'react'

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations']

export default function EmployeeForm({ onSubmit }) {
  const [form, setForm] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await onSubmit(form)
      setForm({ employee_id: '', full_name: '', email: '', department: '' })
    } catch (err) {
      const data = err.response?.data
      setError(
        data?.email?.[0] || data?.employee_id?.[0] || 'Failed to add employee.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <h3 className="mb-4 text-lg font-semibold text-slate-900">
        Add New Employee
      </h3>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <input
          name="employee_id"
          placeholder="Employee ID"
          value={form.employee_id}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none ring-0 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        <input
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none ring-0 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none ring-0 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        <select
          name="department"
          value={form.department}
          onChange={handleChange}
          required
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        >
          <option value="">Select Department</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? 'Adding...' : 'Add Employee'}
      </button>
    </form>
  )
}

