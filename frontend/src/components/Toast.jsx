import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const TOAST_CONFIG = {
  success: {
    bg: 'bg-emerald-600',
    icon: CheckCircle2,
    progressColor: 'bg-emerald-300',
  },
  error: {
    bg: 'bg-rose-600',
    icon: XCircle,
    progressColor: 'bg-rose-300',
  },
  warning: {
    bg: 'bg-amber-500',
    icon: AlertTriangle,
    progressColor: 'bg-amber-300',
  },
  info: {
    bg: 'bg-slate-700',
    icon: Info,
    progressColor: 'bg-slate-400',
  },
}

const Toast = ({ toast }) => {
  const { clearToast } = useToast()

  if (!toast) return null

  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info
  const Icon = config.icon

  return (
    <div className="pointer-events-auto fixed right-4 top-4 z-[60] animate-slide-in-right">
      <div className={`relative overflow-hidden rounded-xl px-4 py-3 pr-10 shadow-2xl ${config.bg} min-w-[260px] max-w-[360px]`}>
        <div className="flex items-center gap-2.5">
          <Icon size={18} className="shrink-0 text-white/90" />
          <p className="text-sm font-medium text-white leading-tight">{toast.message}</p>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={clearToast}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <X size={14} />
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5">
          <div
            className={`h-full ${config.progressColor}`}
            style={{ animation: 'progress-bar 2.6s linear forwards' }}
          />
        </div>
      </div>
    </div>
  )
}

export default Toast
