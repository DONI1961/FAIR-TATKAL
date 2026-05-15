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
    <GlassCard className="group p-0 overflow-hidden border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-500">
      <div className="flex flex-col lg:flex-row">
        
        {/* Left Section: Train Identity */}
        <div className="relative flex flex-col justify-between p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-white/5 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-500">
                <Train className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors truncate">{trainDetails.train_name}</h3>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">#{trainDetails.train_number}</p>
              </div>
            </div>
            {trainDetails.takkal && (
              <div className="bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                Tatkal
              </div>
            )}
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">
              <Zap className="size-3 text-blue-500" />
              <span>98% Punctuality Rating</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">
              <ShieldCheck className="size-3 text-emerald-500" />
              <span>Verified Journey</span>
            </div>
          </div>
        </div>

        {/* Middle Section: Route & Schedule */}
        <div className="flex flex-1 flex-col justify-center p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-3xl font-black text-white tracking-tighter">{trainDetails.departure_time}</p>
              <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-slate-400">{trainDetails.from_station}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-1">{trainDetails.departure_date}</p>
            </div>

            <div className="relative flex flex-1 flex-col items-center px-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                {formatDuration(trainDetails.duration)}
              </div>
              <div className="relative h-[2px] w-full bg-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                />
                <div className="absolute -top-1 left-0 size-2 rounded-full border border-orange-500/50 bg-slate-900" />
                <div className="absolute -top-1 right-0 size-2 rounded-full bg-orange-500" />
              </div>
              <Clock className="mt-2 size-4 text-slate-600" />
            </div>

            <div className="text-right">
              <p className="text-3xl font-black text-white tracking-tighter">{trainDetails.arrival_time}</p>
              <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-slate-400">{trainDetails.to_station}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-1">{trainDetails.arrival_date || "Same Day"}</p>
            </div>
          </div>
        </div>

        {/* Right Section: Classes & Booking */}
        <div className="flex flex-col justify-between p-6 lg:w-1/4 bg-white/5 border-t lg:border-t-0 lg:border-l border-white/5">
          {seat_cost && (
            <div className="space-y-3">
              {classPricing.map((cls) => (
                <div key={cls.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`size-1.5 rounded-full bg-gradient-to-r ${cls.color}`} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{cls.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-white tracking-tight">₹{cls.price}</span>
                    <p className={`text-[9px] font-black ${cls.seats > 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
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
                <div className="w-full py-3 text-center text-[11px] font-black uppercase tracking-widest text-slate-500 bg-white/5 border border-white/10 rounded-xl">
                  Lottery Closed
                </div>
              ) : (
                <PremiumButton 
                  onClick={handleClick}
                  className="w-full py-4 text-[11px] font-black uppercase tracking-widest"
                >
                  {name}
                  <ArrowRight className="size-3" />
                </PremiumButton>
              )
            ) : (
              <PremiumButton 
                onClick={handleClick}
                disabled={loading}
                className="w-full py-4 text-[11px] font-black uppercase tracking-widest"
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

