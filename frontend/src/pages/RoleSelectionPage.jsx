import { useNavigate } from 'react-router-dom'
import { BusFront, LogIn, Truck } from 'lucide-react'

const RoleSelectionPage = () => {
  const navigate = useNavigate()

  const roles = [
    {
      id: 'customer',
      name: 'Customer',
      description: 'Book buses and travel',
      icon: '👤',
      color: '#0145F2',
      bgColor: '#EDF1F5',
    },
    {
      id: 'driver',
      name: 'Driver',
      description: 'Manage trips, tracking, and passenger pickup',
      icon: '🚍',
      color: '#F59E0B',
      bgColor: '#FFF7ED',
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Manage buses and routes',
      icon: '👨‍💼',
      color: '#10B981',
      bgColor: '#FFFFFF',
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'System administration',
      icon: '🔐',
      color: '#CD0000',
      bgColor: '#EFEDE6',
    },
  ]

  const handleRoleSelect = (roleId) => {
    navigate(`/auth/${encodeURIComponent(roleId)}`, { state: { role: roleId } })
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-8">
      <section className="w-full">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center">
            <BusFront size={48} className="text-blue-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 md:text-5xl">Welcome to DriveX</h1>
          <p className="mt-2 text-lg text-slate-600">Select your role to continue</p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-8 text-left transition-all duration-300 hover:border-current hover:shadow-xl"
              style={{
                borderColor: '#E2E8F0',
              }}
            >
              {/* Background gradient */}
              <div
                className="absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10"
                style={{ backgroundColor: role.color }}
              />

              {/* Content */}
              <div className="relative flex flex-1 flex-col justify-between">
                {/* Top section: Icon, Title, Description */}
                <div>
                  <div
                    className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl text-3xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: role.bgColor }}
                  >
                    {role.id === 'driver' ? <Truck size={28} style={{ color: role.color }} /> : role.icon}
                  </div>

                  <h2
                    className="text-2xl font-black transition-colors"
                    style={{ color: role.color }}
                  >
                    {role.name}
                  </h2>

                  <p className="mt-2 text-sm text-slate-600 group-hover:text-slate-700">
                    {role.description}
                  </p>
                </div>

                {/* Bottom section: Arrow indicator */}
                <div
                  className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-all group-hover:translate-x-1"
                  style={{ backgroundColor: role.bgColor }}
                >
                  <LogIn size={20} style={{ color: role.color }} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 text-center">
          <p className="text-sm text-slate-600">
            💡 <span className="font-semibold">Tip:</span> Select your role above to proceed to login or registration
          </p>
        </div>
      </section>
    </main>
  )
}

export default RoleSelectionPage
