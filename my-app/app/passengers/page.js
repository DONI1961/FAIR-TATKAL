'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/components/auth-provider"
import Loading from "@/components/loading"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Train, 
  Users, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  CreditCard,
  Search,
  Filter,
  ArrowRight,
  UserCheck
} from "lucide-react"
import { GlassCard } from "@/components/design-system/GlassCard"
import { PremiumButton } from "@/components/design-system/PremiumButton"
import { cn } from "@/lib/utils"

const STATUS_CONFIG = {
  selected:        { label: 'Winner',          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  confirmed:       { label: 'Verified Payment', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  payment_pending: { label: 'Pending Action',  color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  payment_failed:  { label: 'Payment Void',    color: 'text-red-400 bg-red-500/10 border-red-500/20' },
}

const CLASS_COLOR = {
  economy:  'text-slate-400 bg-slate-500/10 border-slate-500/20',
  business: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  first:    'text-amber-400 bg-amber-500/10 border-amber-500/20',
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

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
    else if (status === 'authenticated' && session?.user?.role !== undefined && session?.user?.role !== 'admin') router.push('/')
  }, [session, status, router])

  useEffect(() => {
    const fetchTrains = async () => {
      setLoadingTrains(true)
      try {
        const params = new URLSearchParams()
        if (selectedDate && selectedDate.trim() !== '') {
          params.append('filter_date', selectedDate)
        }
        
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/published_trains${params.toString() ? '?' + params.toString() : ''}`
        const res = await fetch(url)
        const data = await res.json()
        
        if (data.ok) {
          setTrains(data.trains)
          setError(data.message || null)
        } else {
          setTrains([])
          setError(data.message || 'Error loading target journeys')
        }
      } catch (err) {
        setError('Network error: Intelligence link severed')
        setTrains([])
      } finally {
        setLoadingTrains(false)
      }
    }
    fetchTrains()
  }, [selectedDate])

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

  if (status === 'loading' || loadingTrains) return <div className="min-h-screen flex items-center justify-center"><Loading /></div>

  const stats = {
    total:   passengers.length,
    paid:    passengers.filter(p => p.status === 'confirmed').length,
    pending: passengers.filter(p => p.status === 'payment_pending' || p.status === 'selected').length,
    failed:  passengers.filter(p => p.status === 'payment_failed').length,
  }

  return (
    <div className="relative min-h-screen py-12 px-4">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 size-[600px] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 size-[600px] rounded-full bg-orange-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 app-shell">
        {/* Header Section */}
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
              <UserCheck className="size-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Intelligence Center</h1>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400/80">Passenger Management Protocol</p>
            </div>
          </motion.div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3 backdrop-blur-md"
          >
            <XCircle className="size-4" />
            {error}
          </motion.div>
        )}

        {/* Filters Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Date Filter */}
          <div className="lg:col-span-3">
            <GlassCard className="p-4 border-white/5 h-full">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">
                Temporal Range
              </label>
              <div className="relative group">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setSelectedTrain(null)
                    setPassengers([])
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                />
                <div className="absolute inset-0 rounded-xl bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </GlassCard>
          </div>

          {/* Journey Selector */}
          <div className="lg:col-span-9">
            <GlassCard className="p-4 border-white/5 relative">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">
                Target Journey Vector
              </label>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="w-full flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-left transition-all hover:bg-white/10"
              >
                {selectedTrain ? (
                  <div className="flex items-center gap-4 min-w-0">
                    <Train className="size-4 text-orange-500 shrink-0" />
                    <span className="font-bold text-white truncate">{selectedTrain.train_name}</span>
                    <span className="text-xs font-mono text-slate-400 shrink-0">#{selectedTrain.train_number}</span>
                    <span className="hidden sm:inline text-xs text-slate-500 shrink-0">{selectedTrain.from_station} → {selectedTrain.to_station}</span>
                  </div>
                ) : (
                  <span className="text-slate-500 font-medium italic">Select active coordinate for scanning...</span>
                )}
                <ChevronDown className={cn("size-4 text-slate-500 transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute left-4 right-4 z-50 mt-2 rounded-2xl border border-white/10 bg-slate-900/95 p-2 backdrop-blur-2xl shadow-2xl overflow-hidden"
                  >
                    {trains.length === 0 ? (
                      <div className="px-6 py-8 text-center text-sm text-slate-500">
                        {selectedDate 
                          ? `No mission data available for ${selectedDate}.` 
                          : "Intelligence database empty. Awaiting train publications."}
                      </div>
                    ) : (
                      <ul className="max-h-72 overflow-y-auto space-y-1">
                        {trains.map(t => (
                          <li
                            key={t.id}
                            onClick={() => handleSelectTrain(t)}
                            className="flex items-center gap-4 px-4 py-3 cursor-pointer rounded-xl hover:bg-white/5 transition-colors group"
                          >
                            <Train className="size-4 text-slate-500 group-hover:text-orange-500 transition-colors shrink-0" />
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-white truncate">{t.train_name} <span className="text-xs font-mono text-slate-500">#{t.train_number}</span></p>
                              <p className="text-xs text-slate-500 truncate uppercase tracking-tighter">{t.from_station} &rarr; {t.to_station} &bull; {t.departure_date}</p>
                            </div>
                            <ArrowRight className="size-4 text-white/0 group-hover:text-white/20 ml-auto transition-all" />
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </div>
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {selectedTrain && (
            <motion.div 
              key={selectedTrain.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {loadingPass ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="animate-spin size-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Decrypting Passenger Data...</p>
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                      { label: 'Total Winners',    value: stats.total,   icon: Users,         color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                      { label: 'Verified Seats',   value: stats.paid,    icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                      { label: 'Pending Action',   value: stats.pending, icon: Clock,         color: 'text-amber-400', bg: 'bg-amber-500/10' },
                      { label: 'Void Allocations', value: stats.failed,  icon: XCircle,       color: 'text-red-400', bg: 'bg-red-500/10' },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                      <GlassCard key={label} className="p-6 border-white/5 relative overflow-hidden group">
                        <div className={cn("absolute -right-4 -bottom-4 size-24 opacity-5 group-hover:opacity-10 transition-opacity rotate-12", color)}>
                          <Icon className="size-full" />
                        </div>
                        <div className={cn("flex size-10 items-center justify-center rounded-xl mb-4", bg, color)}>
                          <Icon className="size-5" />
                        </div>
                        <p className="text-3xl font-black text-white mb-1">{value}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
                      </GlassCard>
                    ))}
                  </div>

                  {passengers.length === 0 ? (
                    <GlassCard className="py-24 text-center border-white/5">
                      <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                        <Users className="size-8 text-slate-700" />
                      </div>
                      <p className="text-white font-bold text-lg">No active allocations found.</p>
                      <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto italic">Scanning complete. This coordinate appears to have zero eligible lottery entries.</p>
                    </GlassCard>
                  ) : (
                    <GlassCard className="border-white/5 overflow-hidden">
                      <div className="px-8 py-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                            <Train className="size-5" />
                          </div>
                          <div>
                            <h2 className="font-black text-white tracking-tight">
                              {selectedTrain.train_name} <span className="text-slate-500 font-normal">&bull;</span> {selectedTrain.from_station} &rarr; {selectedTrain.to_station}
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{selectedTrain.departure_date} &bull; {passengers.length} Identities Scanned</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                           <PremiumButton className="h-9 px-4 text-[10px] bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                             Export Manifest
                           </PremiumButton>
                        </div>
                      </div>

                      {/* Data Grid */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              <th className="px-8 py-4 border-b border-white/5">Identity Index</th>
                              <th className="px-8 py-4 border-b border-white/5">Passenger Entity</th>
                              <th className="px-8 py-4 border-b border-white/5">Class Vector</th>
                              <th className="px-8 py-4 border-b border-white/5">Mission Status</th>
                              <th className="px-8 py-4 border-b border-white/5">Payment Hook</th>
                              <th className="px-8 py-4 border-b border-white/5 text-right">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {passengers.map((p, i) => (
                              <motion.tr 
                                key={p.booking_id} 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="hover:bg-white/[0.02] transition-colors group"
                              >
                                <td className="px-8 py-5 text-slate-600 font-mono text-[11px]">[{String(i + 1).padStart(3, '0')}]</td>
                                <td className="px-8 py-5">
                                  <p className="font-bold text-white text-sm">{p.name}</p>
                                  <p className="text-[10px] text-slate-500 font-medium group-hover:text-slate-400 transition-colors">{p.email}</p>
                                </td>
                                <td className="px-8 py-5">
                                  <span className={cn("inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border", CLASS_COLOR[p.seat_class] || 'text-slate-500 border-slate-500/20')}>
                                    {p.seat_class}
                                  </span>
                                </td>
                                <td className="px-8 py-5">
                                  {STATUS_CONFIG[p.status] ? (
                                    <span className={cn("inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border", STATUS_CONFIG[p.status].color)}>
                                      {STATUS_CONFIG[p.status].label}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 text-[10px] uppercase font-bold">{p.status}</span>
                                  )}
                                </td>
                                <td className="px-8 py-5">
                                  {p.paid ? (
                                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                      <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                      Verified
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                                      <div className="size-1.5 rounded-full bg-slate-700" />
                                      Unlinked
                                    </div>
                                  )}
                                </td>
                                <td className="px-8 py-5 text-right font-mono text-[11px] text-slate-500">
                                  {p.selected_at ? p.selected_at.slice(0, 16).replace('T', ' ') : '—'}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </GlassCard>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

