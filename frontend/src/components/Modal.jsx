import { useEffect } from 'react'
import { X } from 'lucide-react'

const Modal = ({ title, onClose, children, icon }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)' }}
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--role-soft)] text-[var(--role-primary)]">
                {icon}
              </div>
            )}
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
