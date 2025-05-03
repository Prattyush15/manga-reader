export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <svg className="animate-spin h-12 w-12 text-green" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#1db954" strokeWidth="4" />
          <path className="opacity-75" fill="#1db954" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p className="mt-4 text-green text-lg font-semibold">Loading chapter...</p>
      </div>
    </div>
  )
} 