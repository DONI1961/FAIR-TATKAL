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
  selected:        { label: 'Winner',          color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  confirmed:       { label: 'Verified Payment', color: 'text-primary bg-primary/10 border-primary/20' },
  payment_pending: { label: 'Pending Action',  color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  payment_failed:  { label: 'Payment Void',    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
}

const CLASS_COLOR = {
  economy:  'text-muted-foreground bg-secondary border-border',
  business: 'text-primary bg-primary/10 border-primary/20',
  first:    'text-amber-500 bg-amber-500/10 border-amber-500/20',
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
        <div className="absolute top-1/4 left-1/4 size-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 size-[600px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <div className="relative z-10 app-shell">
        {/* Header Section */}
        <div className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/10">
              <UserCheck className="size-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Intelligence Center</h1>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Passenger Management Protocol</p>
            </div>
          </motion.div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-3 backdrop-blur-md"
          >
            <XCircle className="size-4" />
            {error}
          </motion.div>
        )}

        {/* Filters Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* Date Filter */}
          <div className="lg:col-span-3">
            <GlassCard className="p-4 border-border h-full">
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 px-1">
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
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary outline-none transition-all shadow-sm"
                />
              </div>
            </GlassCard>
          </div>

          {/* Journey Selector */}
          <div className="lg:col-span-9">
            <GlassCard className="p-4 border-border relative">
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 px-1">
                Target Journey Vector
              </label>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="w-full h-14 flex items-center justify-between gap-3 rounded-xl border border-border bg-input px-5 text-left transition-all hover:bg-secondary/50 shadow-sm"
              >
                {selectedTrain ? (
                  <div className="flex items-center gap-4 min-w-0">
                    <Train className="size-4 text-primary shrink-0" />
                    <span className="font-bold text-foreground truncate">{selectedTrain.train_name}</span>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">#{selectedTrain.train_number}</span>
                    <span className="hidden sm:inline text-xs text-muted-foreground shrink-0">{selectedTrain.from_station} → {selectedTrain.to_station}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground font-medium italic">Select active coordinate for scanning...</span>
                )}
                <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="absolute left-4 right-4 z-50 mt-2 rounded-2xl border border-border bg-popover p-2 backdrop-blur-2xl shadow-2xl overflow-hidden"
                  >
                    {trains.length === 0 ? (
                      <div className="px-6 py-8 text-center text-sm text-muted-foreground">
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
                            className="flex items-center gap-4 px-4 py-3 cursor-pointer rounded-xl hover:bg-secondary transition-colors group"
                          >
                            <Train className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-foreground truncate">{t.train_name} <span className="text-xs font-mono text-muted-foreground">#{t.train_number}</span></p>
                              <p className="text-xs text-muted-foreground truncate uppercase tracking-tighter">{t.from_station} &rarr; {t.to_station} &bull; {t.departure_date}</p>
                            </div>
                            <ArrowRight className="size-4 text-primary opacity-0 group-hover:opacity-100 ml-auto transition-all" />
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
                  <div className="animate-spin size-10 rounded-full border-2 border-primary/20 border-t-primary" />
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Decrypting Passenger Data...</p>
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                      { label: 'Total Winners',    value: stats.total,   icon: Users,         color: 'text-primary', bg: 'bg-primary/10' },
                      { label: 'Verified Seats',   value: stats.paid,    icon: CheckCircle2,  color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                      { label: 'Pending Action',   value: stats.pending, icon: Clock,         color: 'text-amber-500', bg: 'bg-amber-500/10' },
                      { label: 'Void Allocations', value: stats.failed,  icon: XCircle,       color: 'text-rose-500', bg: 'bg-rose-500/10' },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                      <GlassCard key={label} className="p-6 border-border relative overflow-hidden group shadow-sm">
                        <div className={cn("absolute -right-4 -bottom-4 size-24 opacity-5 group-hover:opacity-10 transition-opacity rotate-12", color)}>
                          <Icon className="size-full" />
                        </div>
                        <div className={cn("flex size-10 items-center justify-center rounded-xl mb-4 shadow-sm", bg, color)}>
                          <Icon className="size-5" />
                        </div>
                        <p className="text-3xl font-black text-foreground mb-1">{value}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
                      </GlassCard>
                    ))}
                  </div>

                  {passengers.length === 0 ? (
                    <GlassCard className="py-24 text-center border-border shadow-sm">
                      <div className="size-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                        <Users className="size-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-foreground font-bold text-lg">No active allocations found.</p>
                      <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto italic">Scanning complete. This coordinate appears to have zero eligible lottery entries.</p>
                    </GlassCard>
                  ) : (
                    <GlassCard className="border-border overflow-hidden shadow-xl">
                      <div className="px-8 py-6 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/30">
                        <div className="flex items-center gap-4">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <Train className="size-5" />
                          </div>
                          <div>
                            <h2 className="font-black text-foreground tracking-tight">
                              {selectedTrain.train_name} <span className="text-muted-foreground font-normal">&bull;</span> {selectedTrain.from_station} &rarr; {selectedTrain.to_station}
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{selectedTrain.departure_date} &bull; {passengers.length} Identities Scanned</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                           <PremiumButton className="h-9 px-4 text-[10px] shadow-sm">
                             Export Manifest
                           </PremiumButton>
                        </div>
                      </div>

                      {/* Data Grid */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-secondary/50 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                              <th className="px-8 py-4 border-b border-border">Identity Index</th>
                              <th className="px-8 py-4 border-b border-border">Passenger Entity</th>
                              <th className="px-8 py-4 border-b border-border">Class Vector</th>
                              <th className="px-8 py-4 border-b border-border">Mission Status</th>
                              <th className="px-8 py-4 border-b border-border">Payment Hook</th>
                              <th className="px-8 py-4 border-b border-border text-right">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {passengers.map((p, i) => (
                              <motion.tr 
                                key={p.booking_id} 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="hover:bg-secondary/20 transition-colors group"
                              >
                                <td className="px-8 py-5 text-muted-foreground/60 font-mono text-[11px]">[{String(i + 1).padStart(3, '0')}]</td>
                                <td className="px-8 py-5">
                                  <p className="font-bold text-foreground text-sm">{p.name}</p>
                                  <p className="text-[10px] text-muted-foreground font-medium group-hover:text-primary transition-colors">{p.email}</p>
                                </td>
                                <td className="px-8 py-5">
                                  <span className={cn("inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border", CLASS_COLOR[p.seat_class] || 'text-muted-foreground border-border')}>
                                    {p.seat_class}
                                  </span>
                                </td>
                                <td className="px-8 py-5">
                                  {STATUS_CONFIG[p.status] ? (
                                    <span className={cn("inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm", STATUS_CONFIG[p.status].color)}>
                                      {STATUS_CONFIG[p.status].label}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground text-[10px] uppercase font-bold">{p.status}</span>
                                  )}
                                </td>
                                <td className="px-8 py-5">
                                  {p.paid ? (
                                    <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                      <div className="size-1.5 rounded-full bg-emerald-500 shadow-sm" />
                                      Verified
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest">
                                      <div className="size-1.5 rounded-full bg-muted-foreground/20" />
                                      Unlinked
                                    </div>
                                  )}
                                </td>
                                <td className="px-8 py-5 text-right font-mono text-[11px] text-muted-foreground/50">
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

