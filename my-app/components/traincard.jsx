"use client"

import React, { useState } from 'react';
import { Train, Clock, ArrowRight, Zap, Info, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { PremiumButton } from "./design-system/PremiumButton"
import { GlassCard } from "./design-system/GlassCard"
import { Spinner } from './ui/spinner';
import { Badge } from '@/components/ui/badge';

export default function TrainCard({ train, bnFunction, bnName, result }) {
  const [loading, setLoading] = useState(false)
  const [publish, setPublish] = useState(false)
  
  const trainDetails = train
  const name = bnName || 'Book'
  let seat_cost = result !== 1

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const handleClick = async () => {
    if (result === 1) {
      setLoading(true)
    }
    const res = await bnFunction()
    if (result === 1 && res) {
      setLoading(false)
      setPublish(true)
    }
    if (result === 1 && !res) {
      setLoading(false)
      setPublish(false)
    }
  }

  const classPricing = [
    { name: 'Economy', price: trainDetails.fare[0], seats: trainDetails.seats[0], color: "from-slate-400 to-slate-600" },
    { name: 'Business', price: trainDetails.fare[1], seats: trainDetails.seats[1], color: "from-blue-400 to-indigo-600" },
    { name: 'First Class', price: trainDetails.fare[2], seats: trainDetails.seats[2], color: "from-orange-400 to-amber-600" },
  ]

  return (
    <GlassCard className="group p-0 overflow-hidden border-border bg-card hover:bg-secondary/20 transition-all duration-500 shadow-sm">
      <div className="flex flex-col lg:flex-row">
        
        {/* Left Section: Train Identity */}
        <div className="relative flex flex-col justify-between p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-border bg-secondary/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Train className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">{trainDetails.train_name}</h3>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">#{trainDetails.train_number}</p>
              </div>
            </div>
            {trainDetails.takkal && (
              <div className="bg-accent text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-lg">
                Tatkal
              </div>
            )}
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              <Zap className="size-3 text-primary" />
              <span>98% Punctuality Rating</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              <ShieldCheck className="size-3 text-emerald-500" />
              <span>Verified Journey</span>
            </div>
          </div>
        </div>

        {/* Middle Section: Route & Schedule */}
        <div className="flex flex-1 flex-col justify-center p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-3xl font-black text-foreground tracking-tighter">{trainDetails.departure_time}</p>
              <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{trainDetails.from_station}</p>
              <p className="text-[10px] font-bold text-muted-foreground/60 mt-1">{trainDetails.departure_date}</p>
            </div>

            <div className="relative flex flex-1 flex-col items-center px-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                {formatDuration(trainDetails.duration)}
              </div>
              <div className="relative h-[2px] w-full bg-secondary">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-blue-500 shadow-sm"
                />
                <div className="absolute -top-1 left-0 size-2 rounded-full border border-primary/50 bg-background" />
                <div className="absolute -top-1 right-0 size-2 rounded-full bg-primary shadow-sm" />
              </div>
              <Clock className="mt-2 size-4 text-muted-foreground/40" />
            </div>

            <div className="text-right">
              <p className="text-3xl font-black text-foreground tracking-tighter">{trainDetails.arrival_time}</p>
              <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">{trainDetails.to_station}</p>
              <p className="text-[10px] font-bold text-muted-foreground/60 mt-1">{trainDetails.arrival_date || "Same Day"}</p>
            </div>
          </div>
        </div>

        {/* Right Section: Classes & Booking */}
        <div className="flex flex-col justify-between p-6 lg:w-1/4 bg-secondary/20 border-t lg:border-t-0 lg:border-l border-border">
          {seat_cost && (
            <div className="space-y-3">
              {classPricing.map((cls) => (
                <div key={cls.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`size-1.5 rounded-full bg-gradient-to-r ${cls.color}`} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{cls.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-foreground tracking-tight">₹{cls.price}</span>
                    <p className={`text-[9px] font-black ${cls.seats > 0 ? 'text-emerald-500' : 'text-primary'}`}>
                      {cls.seats} LEFT
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            {publish ? (
              <div className="w-full py-3 text-center text-[11px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                Published Successfully
              </div>
            ) : result !== 1 ? (
              trainDetails.published ? (
                <div className="w-full py-3 text-center text-[11px] font-black uppercase tracking-widest text-muted-foreground bg-secondary border border-border rounded-xl shadow-sm">
                  Lottery Closed
                </div>
              ) : (
                <PremiumButton 
                  onClick={handleClick}
                  className="w-full py-4 text-[11px] font-black uppercase tracking-widest shadow-lg"
                >
                  {name}
                  <ArrowRight className="size-3" />
                </PremiumButton>
              )
            ) : (
              <PremiumButton 
                onClick={handleClick}
                disabled={loading}
                className="w-full py-4 text-[11px] font-black uppercase tracking-widest shadow-lg"
              >
                {loading && <Spinner className="mr-2 h-3 w-3" />}
                {loading ? 'Publishing...' : 'Publish Route'}
              </PremiumButton>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

