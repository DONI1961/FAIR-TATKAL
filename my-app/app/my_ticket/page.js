'use client'

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"
import { Ticket, Search, Inbox, Filter } from "lucide-react";
import TicketCard from "@/components/ticket";
import { useSession } from "@/components/auth-provider";
import Loading from "@/components/loading";
import NotFound from "@/components/notfound";
import { GlassCard } from "@/components/design-system/GlassCard";

export default function MyTicket() {
  const [trains, setTrains] = useState([])
  const [bookings, setBookings] = useState([])
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      if (!session?.user?.email) return;
      
      const query = new URLSearchParams({
        email: session.user.email
      })
      try {
        setLoading(true)
        const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/my_ticket?' + query.toString(), {
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`
          }
        })
        const data = await res.json()
        if (data.ok) {
          setTrains(data.trains)
          setBookings(data.booking)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (status === 'authenticated' && session?.user?.email) {
      fetchTickets()
    }
  }, [status, session?.user?.email])

  if (loading) return <div className="py-20"><Loading /></div>

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 pb-20">
      {/* Cinematic Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16"
      >
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
            User Terminal
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">
            Travel <span className="text-primary">Vault</span>
          </h1>
          <p className="mt-4 text-muted-foreground font-medium max-w-md">
            Review every allocation result, payment status, and upcoming journey in your secure railway ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <GlassCard className="py-6 px-8 text-center min-w-[160px] border-border shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Entries</p>
            <p className="text-3xl font-black text-foreground">{trains.length}</p>
          </GlassCard>
          <GlassCard className="py-6 px-8 text-center min-w-[160px] border-primary/10 bg-primary/5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Confirmed</p>
            <p className="text-3xl font-black text-foreground">
              {bookings.filter(b => b.status === 'confirmed').length}
            </p>
          </GlassCard>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {trains.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-20"
            >
              <NotFound error={false} title="Vault Empty" message="Your vault is currently empty. Start your first journey below." />
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between px-4">
                 <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   <Inbox className="size-4" />
                   Recent Submissions
                 </h2>
                 <div className="flex items-center gap-4">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Search className="size-4" />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Filter className="size-4" />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {trains.map((t, idx) => (
                  <motion.div
                    key={bookings[idx]?.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <TicketCard train={t} booking={bookings[idx]} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Ambience */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none opacity-20">
        <div className="w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px]" />
      </div>
    </div>
  )
}

