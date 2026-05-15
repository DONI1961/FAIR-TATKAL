"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from "framer-motion"
import { CheckCircle2, QrCode, ArrowLeft, Home, Share2 } from "lucide-react"
import { GlassCard } from './design-system/GlassCard'
import { PremiumButton } from './design-system/PremiumButton'

export default function LotteryDone() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            <CheckCircle2 className="size-10" />
          </motion.div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">Entry Confirmed</h1>
          <p className="text-muted-foreground font-medium tracking-wide">Your position in the fair allocation queue is secure.</p>
        </div>

        <div className="relative">
          {/* Ticket Body */}
          <GlassCard className="p-0 overflow-hidden border-border bg-card/50 backdrop-blur-3xl shadow-2xl relative">
            <div className="p-8 border-b border-dashed border-border">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Entry
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Reference</p>
                  <p className="text-xs font-mono text-foreground font-bold">#TRN-992-041</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-center py-4 bg-secondary/50 rounded-2xl border border-border">
                  <QrCode className="size-32 text-foreground opacity-80" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-widest">Notification Alert</p>
                  <p className="text-sm text-foreground font-medium">We'll notify you via email and dashboard when the allocation window concludes.</p>
                </div>
              </div>
            </div>

            {/* Ticket Bottom */}
            <div className="p-8 bg-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                   <Share2 className="size-4" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entry Shared</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Queue Priority</p>
                <p className="text-sm font-black text-primary uppercase">Standard Tier</p>
              </div>
            </div>

            {/* Ticket Notches */}
            <div className="absolute top-[280px] -left-4 size-8 rounded-full bg-background border border-border" />
            <div className="absolute top-[280px] -right-4 size-8 rounded-full bg-background border border-border" />
          </GlassCard>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/" className="flex-1">
            <PremiumButton className="w-full py-4 text-xs font-black uppercase tracking-widest bg-secondary border-border hover:bg-secondary/80">
              <Home className="size-4" />
              Main Dashboard
            </PremiumButton>
          </Link>
          <Link href="/tickets" className="flex-1">
             <PremiumButton className="w-full py-4 text-xs font-black uppercase tracking-widest">
               View My Entries
             </PremiumButton>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

