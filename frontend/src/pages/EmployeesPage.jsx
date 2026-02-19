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
  if (error) return <div style={{ color: 'red', padding: '32px' }}>{error}</div>

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Employee Management</h2>
      <EmployeeForm onSubmit={handleAdd} />
      {employees.length === 0 ? (
        <EmptyState message="No employees yet. Add one above." />
      ) : (
        <EmployeeTable employees={employees} onDelete={handleDelete} />
      )}
    </div>
  )
}

