export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-24 text-slate-500">
      <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      <span className="text-sm font-medium">Loading...</span>
    </div>
  )
}

