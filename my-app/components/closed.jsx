"use client"

import React from 'react';
import { motion } from "framer-motion"
import { CalendarX2, Clock, AlertCircle } from 'lucide-react';
import { GlassCard } from './design-system/GlassCard';

const WindowClosed = ({
  title = "Booking Window Closed",
  message = "The allocation window for this session has officially concluded. Please monitor your dashboard for upcoming opportunities."
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto py-12 flex flex-col items-center">
      <GlassCard className="w-full p-10 md:p-14 border-orange-500/10 bg-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 left-0 size-full pointer-events-none">
          <div className="absolute -top-24 -right-24 size-64 bg-orange-600/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -left-24 size-64 bg-slate-600/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex size-20 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.2)]"
          >
            <CalendarX2 className="size-10" strokeWidth={1.5} />
          </motion.div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              <AlertCircle className="size-3 text-orange-500" />
              Window Terminated
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
              {title}
            </h2>
            <p className="text-sm md:text-base font-medium text-slate-400 leading-relaxed max-w-sm mx-auto">
              {message}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 bg-white/5 px-6 py-3 rounded-xl border border-white/5">
            <Clock className="size-4 text-orange-500" />
            <span>Next session initializing soon</span>
          </div>
        </div>
      </GlassCard>
      
      <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 text-center">
        Smart Rail Neural Link • Operational Status: Offline
      </p>
    </div>
  );
};

export default WindowClosed;

