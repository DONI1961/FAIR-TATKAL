'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/components/auth-provider"
import Loading from "@/components/loading"
import { Badge } from "@/components/ui/badge"
import { Train, Users, ChevronDown, CheckCircle2, Clock, XCircle, CreditCard } from "lucide-react"

const STATUS_CONFIG = {
  selected:        { label: 'Winner',          color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  confirmed:       { label: 'Paid',            color: 'bg-blue-50 text-blue-700 border-blue-200' },
  payment_pending: { label: 'Payment Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  payment_failed:  { label: 'Payment Failed',  color: 'bg-red-50 text-red-700 border-red-200' },
}

const CLASS_COLOR = {
  economy:  'bg-slate-100 text-slate-700',
  business: 'bg-indigo-50 text-indigo-700',
  first:    'bg-amber-50 text-amber-700',
}

export default function PassengersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [trains, setTrains]           = useState([])
  const [selectedTrain, setSelectedTrain] = useState(null)
  const [passengers, setPassengers]   = useState([])
  const [loadingTrains, setLoadingTrains] = useState(true)
  const [loadingPass, setLoadingPass] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')

  // Guard: admin only — wait until role is explicitly known (not undefined)
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
    else if (status === 'authenticated' && session?.user?.role !== undefined && session?.user?.role !== 'admin') router.push('/')
  }, [session, status, router])

  // Load published trains
  useEffect(() => {
    const fetchTrains = async () => {
      console.log('[passengers] fetchTrains triggered. selectedDate:', `"${selectedDate}"`)
      setLoadingTrains(true)
      try {
        const params = new URLSearchParams()
        if (selectedDate && selectedDate.trim() !== '') {
          params.append('filter_date', selectedDate)
        }
        
        const queryString = params.toString()
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/published_trains${queryString ? '?' + queryString : ''}`
        console.log('[passengers] Fetching from URL:', url)
        
        const res = await fetch(url)
        const data = await res.json()
        console.log('[passengers] Received data:', data)
        
        if (data.ok) {
          setTrains(data.trains)
          setError(data.message || null)
        } else {
          setTrains([])
          setError(data.message || 'Error loading trains')
        }
      } catch (err) {
        console.error('[passengers] fetch error:', err)
        setError('Network error loading trains')
        setTrains([])
      } finally {
        setLoadingTrains(false)
      }
    }
    fetchTrains()
  }, [selectedDate])

  // Load passengers when a train is selected
  const handleSelectTrain = async (train) => {
    setSelectedTrain(train)
    setDropdownOpen(false)
    setLoadingPass(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/passengers?journey_id=${train.id}`,
        { headers: { Authorization: `Bearer ${session?.accessToken}` } }
      )
      const data = await res.json()
      if (data.ok) setPassengers(data.passengers)
      else setPassengers([])
    } finally {
      setLoadingPass(false)
    }
  }

  if (status === 'loading' || loadingTrains) return <Loading />

  const stats = {
    total:   passengers.length,
    paid:    passengers.filter(p => p.status === 'confirmed').length,
    pending: passengers.filter(p => p.status === 'payment_pending' || p.status === 'selected').length,
    failed:  passengers.filter(p => p.status === 'payment_failed').length,
  }

  return (
    <div className="app-shell py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Users className="size-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Passenger List</h1>
          <span className="ml-2 rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-semibold text-indigo-600 border border-indigo-100 uppercase tracking-wider">Admin</span>
        </div>
        <p className="text-sm text-slate-500 ml-13">View selected passengers for any announced lottery journey.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
          <XCircle className="size-4" />
          {error}
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Date Filter */}
        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center justify-between">
            Filter by Date
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate('')}
                className="text-[10px] text-indigo-600 hover:underline font-bold"
              >
                Clear
              </button>
            )}
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              console.log('[passengers] Date input changed:', e.target.value)
              setSelectedDate(e.target.value)
              setSelectedTrain(null)
              setPassengers([])
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          />
        </div>

        {/* Journey Selector */}
        <div className="flex-1 relative">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Select Journey</label>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="w-full flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm hover:border-indigo-400 hover:shadow-md transition-all h-[58px]"
          >
          {selectedTrain ? (
            <div className="flex items-center gap-3 min-w-0">
              <Train className="size-4 text-indigo-600 shrink-0" />
              <span className="font-semibold text-slate-900 truncate">{selectedTrain.train_name}</span>
              <span className="text-xs text-slate-500 font-mono shrink-0">#{selectedTrain.train_number}</span>
              <span className="text-xs text-slate-400 shrink-0">{selectedTrain.from_station} → {selectedTrain.to_station}</span>
            </div>
          ) : (
            <span className="text-slate-400 font-medium">Select a published journey…</span>
          )}
          <ChevronDown className={`size-4 text-slate-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            {trains.length === 0 ? (
              <div className="px-5 py-4 text-sm text-slate-400">
                {selectedDate 
                  ? `No published journeys found for ${selectedDate}.` 
                  : "No published journeys yet."}
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {trains.map(t => (
                  <li
                    key={t.id}
                    onClick={() => handleSelectTrain(t)}
                    className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-indigo-50 transition-colors"
                  >
                    <Train className="size-4 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{t.train_name} <span className="text-xs text-slate-400 font-mono">#{t.train_number}</span></p>
                      <p className="text-xs text-slate-500 truncate">{t.from_station} → {t.to_station} &bull; {t.departure_date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>

      {/* Passenger Table */}
      {selectedTrain && (
        loadingPass ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin size-8 rounded-full border-2 border-indigo-300 border-t-indigo-600" />
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total Winners',    value: stats.total,   icon: Users,         color: 'text-indigo-600 bg-indigo-50' },
                { label: 'Payment Done',     value: stats.paid,    icon: CheckCircle2,  color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Awaiting Payment', value: stats.pending, icon: Clock,         color: 'text-amber-600 bg-amber-50' },
                { label: 'Payment Failed',   value: stats.failed,  icon: XCircle,       color: 'text-red-600 bg-red-50' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3 shadow-sm">
                  <div className={`flex size-9 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {passengers.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 py-16 text-center">
                <Users className="size-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No winners selected for this journey.</p>
                <p className="text-sm text-slate-400 mt-1">No passengers applied or the lottery had no eligible entries.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800">
                    {selectedTrain.train_name} — {selectedTrain.from_station} → {selectedTrain.to_station}
                  </h2>
                  <span className="text-xs text-slate-400">{passengers.length} passenger{passengers.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                        <th className="px-5 py-3 text-left font-semibold">#</th>
                        <th className="px-5 py-3 text-left font-semibold">Passenger</th>
                        <th className="px-5 py-3 text-left font-semibold">Class</th>
                        <th className="px-5 py-3 text-left font-semibold">Status</th>
                        <th className="px-5 py-3 text-left font-semibold">Payment</th>
                        <th className="px-5 py-3 text-left font-semibold">Selected At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {passengers.map((p, i) => (
                        <tr key={p.booking_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{i + 1}</td>
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-slate-900">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.email}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${CLASS_COLOR[p.seat_class] || 'bg-slate-100 text-slate-600'}`}>
                              {p.seat_class}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {STATUS_CONFIG[p.status] ? (
                              <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_CONFIG[p.status].color}`}>
                                {STATUS_CONFIG[p.status].label}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs capitalize">{p.status}</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            {p.paid ? (
                              <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                                <CheckCircle2 className="size-3.5" /> Paid
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-slate-400 text-xs">
                                <CreditCard className="size-3.5" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                            {p.selected_at ? p.selected_at.slice(0, 16).replace('T', ' ') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  )
}
