import { getSeatLabel } from '../utils/format'

const COLS = 5 // 2 seats + aisle + 2 seats
const ROWS = 10

const SeatGrid = ({ totalSeats = 40, bookedSeats = [], selectedSeats = [], onSeatToggle }) => {
  // Build a realistic 2+2 bus layout
  const buildLayout = () => {
    const layout = []
    let seatNum = 1

    for (let row = 0; row < ROWS && seatNum <= totalSeats; row++) {
      const rowSeats = []
      for (let col = 0; col < COLS; col++) {
        if (col === 2) {
          // Aisle
          rowSeats.push({ type: 'aisle', key: `aisle-${row}` })
        } else if (seatNum <= totalSeats) {
          rowSeats.push({ type: 'seat', number: seatNum, key: `seat-${seatNum}` })
          seatNum++
        } else {
          rowSeats.push({ type: 'empty', key: `empty-${row}-${col}` })
        }
      }
      layout.push(rowSeats)
    }
    return layout
  }

  const layout = buildLayout()

  return (
    <div className="animate-fade-in">
      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-11v6h12V7H6z"/></svg>
          </span>
          Available
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-100 text-rose-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-11v6h12V7H6z"/></svg>
          </span>
          Booked
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-11v6h12V7H6z"/></svg>
          </span>
          Selected
        </span>
      </div>

      {/* Bus Body */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Driver area */}
        <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            </svg>
            <span className="font-medium">Driver</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
            Door
          </div>
        </div>

        {/* Seat Grid */}
        <div className="flex flex-col gap-2">
          {layout.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center justify-center gap-2">
              {row.map((cell) => {
                if (cell.type === 'aisle') {
                  return <div key={cell.key} className="w-6 sm:w-8" /> // Aisle gap
                }
                if (cell.type === 'empty') {
                  return <div key={cell.key} className="h-10 w-10 sm:h-11 sm:w-11" />
                }

                const isBooked = bookedSeats.includes(cell.number)
                const isSelected = selectedSeats.includes(cell.number)

                return (
                  <button
                    key={cell.key}
                    type="button"
                    disabled={isBooked}
                    onClick={() => onSeatToggle(cell.number)}
                    title={`${getSeatLabel(cell.number)}${isBooked ? ' (Booked)' : isSelected ? ' (Selected)' : ''}`}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 sm:h-11 sm:w-11 ${
                      isBooked
                        ? 'cursor-not-allowed bg-rose-100 text-rose-400 border border-rose-200'
                        : isSelected
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 scale-105 border border-sky-400'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 hover:scale-105'
                    }`}
                  >
                    {/* Seat shape top */}
                    <div className={`absolute -top-0.5 left-1 right-1 h-1.5 rounded-t-md ${
                      isBooked ? 'bg-rose-200' : isSelected ? 'bg-sky-400' : 'bg-emerald-200'
                    }`} />
                    {getSeatLabel(cell.number)}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Back row label */}
        <div className="mt-3 text-center text-[10px] font-medium text-slate-400 uppercase tracking-wider">
          Back of Bus
        </div>
      </div>
    </div>
  )
}

export default SeatGrid
