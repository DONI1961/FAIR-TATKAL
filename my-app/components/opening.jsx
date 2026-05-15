"use client"

import React from 'react';
import { motion } from "framer-motion"
import { Hourglass, Lock, Clock } from 'lucide-react';
import TimerBasic from '@/components/timer';
import { GlassCard } from './design-system/GlassCard';

const WindowOpening = ({
  title = "Booking Window Opens Soon",
  message = "The lottery window for this premium route will activate shortly. Please remain on standby.",
  second,
  fn
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto py-12 flex flex-col items-center">
      <GlassCard className="w-full p-10 md:p-14 border-border bg-card/50 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 left-0 size-full pointer-events-none">
          <div className="absolute -top-24 -left-24 size-64 bg-primary/10 rounded-full blur-[80px]" />
          <div className="absolute -bottom-24 -right-24 size-64 bg-accent/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <motion.div
            animate={{ 
              rotate: [0, 180, 180, 360],
              scale: [1, 1.1, 1.1, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_30px_rgba(59,130,246,0.2)]"
          >
            <Hourglass className="size-10" strokeWidth={1.5} />
          </motion.div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              <Lock className="size-3 text-primary" />
              System Standby
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">
              {title}
            </h2>
            <p className="text-sm md:text-base font-medium text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {message}
            </p>
          </div>

          <GlassCard className="py-6 px-10 border-border bg-secondary/50 flex flex-col items-center gap-2 shadow-inner">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              <Clock className="size-3" />
              Countdown to Activation
            </div>
            <TimerBasic second={second} fn={fn}/>
          </GlassCard>
        </div>
      </GlassCard>
      
      <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 text-center">
        Smart Rail Neural Link • V4.0.2 Active
      </p>
    </div>
  );
};

export default WindowOpening;

