import { Component } from 'react'

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Unexpected application error',
    }
  }

  componentDidCatch(error, info) {
    // Keep lightweight logging for diagnostics in browser console.
    console.error('AppErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-10 text-center">
          <h2 className="text-xl font-black text-slate-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-slate-600">{this.state.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-[var(--role-primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            Reload Page
          </button>
        </main>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary
