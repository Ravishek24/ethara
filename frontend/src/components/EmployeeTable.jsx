export default function EmployeeTable({ employees, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="min-w-full border-collapse">
        <thead className="bg-slate-950 text-white">
          <tr>
            {['ID', 'Name', 'Email', 'Department', 'Action'].map((h) => (
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
          {employees.map((emp, idx) => (
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
              <td className="px-4 py-3 text-sm text-slate-700">{emp.email}</td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {emp.department}
              </td>
              <td className="px-4 py-3 text-sm">
                <button
                  onClick={() => onDelete(emp.id)}
                  className="inline-flex items-center rounded-md bg-rose-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-rose-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

