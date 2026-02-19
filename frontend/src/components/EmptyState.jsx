export default function EmptyState({ message }) {
  return (
    <div className="rounded-xl bg-slate-50 px-6 py-16 text-center text-slate-400 ring-1 ring-dashed ring-slate-200">
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

