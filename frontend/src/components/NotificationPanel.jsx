import { Bell, Ticket, Clock, AlertCircle } from 'lucide-react'

const typeIcons = {
  booking: Ticket,
  reminder: Clock,
  alert: AlertCircle,
}

const NotificationPanel = ({ notifications }) => {
  return (
    <section className="card p-5 animate-fade-in">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <Bell size={16} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Notifications</h3>
        {notifications.length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {notifications.length}
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <Bell size={28} className="mb-2 text-slate-300" />
          <p className="text-sm text-slate-400">No notifications yet</p>
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-slate-100" />

          {notifications.map((notification, index) => {
            const Icon = typeIcons[notification.type] || Bell
            return (
              <article
                key={notification.id}
                className={`relative flex gap-3 rounded-xl p-3 transition hover:bg-slate-50 animate-fade-in stagger-${index + 1}`}
              >
                {/* Timeline dot */}
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--role-soft)] text-[var(--role-primary)]">
                  <Icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-700">{notification.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{notification.message}</p>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default NotificationPanel
