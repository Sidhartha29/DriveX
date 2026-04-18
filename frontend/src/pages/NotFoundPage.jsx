import { Link } from 'react-router-dom'
import { Home, Search, BusFront } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 text-center animate-fade-in">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 animate-float">
          <BusFront size={40} className="text-slate-400" />
        </div>
        <div className="absolute -right-2 -top-1 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-lg font-black">
          ?
        </div>
      </div>

      <h1 className="text-6xl font-black text-slate-900">404</h1>
      <p className="mt-2 text-xl font-bold text-slate-600">Page Not Found</p>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        Looks like this bus took a wrong turn! The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="btn-primary">
          <Home size={16} />
          Back Home
        </Link>
        <Link to="/search" className="btn-secondary">
          <Search size={16} />
          Search Buses
        </Link>
      </div>
    </main>
  )
}

export default NotFoundPage
