import { useEffect, useState } from 'react'
import { employeeAPI } from '../api'
import EmployeeForm from '../components/EmployeeForm'
import EmployeeTable from '../components/EmployeeTable'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const res = await employeeAPI.getAll()
      setEmployees(res.data)
    } catch {
      setError('Failed to load employees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleAdd = async (formData) => {
    const res = await employeeAPI.create(formData)
    setEmployees((prev) => [res.data, ...prev])
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return
    await employeeAPI.delete(id)
    setEmployees((prev) => prev.filter((e) => e.id !== id))
  }

  if (loading) return <LoadingSpinner />
  if (error)
    return (
      <div className="px-4 py-8 text-sm text-red-600 md:px-8">
        {error}
      </div>
    )

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Employee Management
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add, view, and remove employees from your HRMS.
          </p>
        </div>
      </div>

      <EmployeeForm onSubmit={handleAdd} />

      {employees.length === 0 ? (
        <EmptyState message="No employees yet. Add one above." />
      ) : (
        <EmployeeTable employees={employees} onDelete={handleDelete} />
      )}
    </div>
  )
}

