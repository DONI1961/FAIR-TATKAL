'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Timer,
  Clock,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlassCard } from './design-system/GlassCard';
import { PremiumButton } from './design-system/PremiumButton';

const TicketCard = ({ train, booking }) => {
  const router = useRouter();
  const {
    train_number,
    train_name,
    from_station,
    to_station,
    departure_time,
    departure_date,
    arrival_time,
    arrival_date,
    takkal,
    duration,
  } = train;

  const { id, status, seat_class, paid, selected_at } = booking;

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const handlePayClick = (bookingId) => {
    const query = new URLSearchParams({ bookingId: bookingId });
    router.push(`/pay?${query.toString()}`);
  };

  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!selected_at || !['selected', 'payment_pending', 'payment_failed'].includes(status)) return;

    const selectedTime = new Date(selected_at);
    const expiryTime = new Date(selectedTime.getTime() + 5 * 60 * 1000);

    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [selected_at, status]);

  const formatCountdown = (seconds) => {
    if (seconds === null) return '05:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isExpiringSoon = timeLeft !== null && timeLeft < 60;

  const statusConfig = {
    pending: {
      label: 'PENDING',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      glow: 'shadow-sm',
      icon: Clock
    },
    selected: {
      label: 'ACTION REQUIRED',
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      glow: 'shadow-md',
      icon: Sparkles
    },
    confirmed: {
      label: 'CONFIRMED',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'shadow-sm',
      icon: ShieldCheck
    },
    notselected: {
      label: 'NOT SELECTED',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      glow: '',
      icon: XCircle
    },
    payment_failed: {
      label: 'PAYMENT FAILED',
      color: 'text-accent',
      bg: 'bg-accent/10',
      border: 'border-accent/20',
      glow: 'shadow-sm',
      icon: AlertTriangle
    },
    expired: {
      label: 'EXPIRED',
      color: 'text-muted-foreground',
      bg: 'bg-secondary',
      border: 'border-border',
      glow: '',
      icon: XCircle
    }
  };

  const cfg = statusConfig[status] || statusConfig.pending;
  const showPayButton = ['selected', 'payment_pending', 'payment_failed'].includes(status) && !paid;

  return (
    <GlassCard className="p-0 overflow-hidden border-border bg-card shadow-2xl group">
      {/* Top Status Bar */}
      <div className={`h-1 w-full ${cfg.bg.replace('/10', '')}`} />
      
      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary shadow-sm">
              <Ticket className="size-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">{train_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">#{train_number}</span>
                {takkal && (
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[8px] font-black uppercase tracking-widest text-accent">
                    TATKAL
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${cfg.bg} ${cfg.border} ${cfg.color} ${cfg.glow} text-[10px] font-black uppercase tracking-widest`}>
            <cfg.icon className="size-3" />
            {cfg.label}
          </div>
        </div>

        {/* Journey Details */}
        <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-4 py-4 border-y border-border">
          <div className="md:col-span-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <MapPin className="size-3" /> Origin
            </p>
            <p className="text-3xl font-black text-foreground tabular-nums tracking-tighter">{departure_time}</p>
            <p className="text-sm font-bold text-muted-foreground/80 mt-1">{from_station}</p>
            <p className="text-[10px] font-bold text-primary mt-1">{departure_date}</p>
          </div>

          <div className="md:col-span-3 flex flex-col items-center justify-center gap-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{formatDuration(duration)}</span>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full bg-primary shadow-sm" />
            </div>
            <ArrowRight className="size-4 text-muted-foreground/30" />
          </div>

          <div className="md:col-span-4 text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center justify-end gap-2">
              Destination <MapPin className="size-3" />
            </p>
            <p className="text-3xl font-black text-foreground tabular-nums tracking-tighter">{arrival_time}</p>
            <p className="text-sm font-bold text-muted-foreground/80 mt-1">{to_station}</p>
            <p className="text-[10px] font-bold text-primary mt-1">{arrival_date || departure_date}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Class</p>
              <p className="text-sm font-black text-foreground uppercase tracking-wider">{seat_class}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Booking ID</p>
              <p className="text-sm font-mono text-muted-foreground/60">#{id.toString().padStart(6, '0')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <AnimatePresence>
              {showPayButton && timeLeft !== null && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    isExpiringSoon ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}
                >
                  <Timer className="size-3" />
                  Expires In {formatCountdown(timeLeft)}
                </motion.div>
              )}
            </AnimatePresence>

            {showPayButton ? (
              <PremiumButton
                onClick={() => handlePayClick(id)}
                className="py-3 px-8 text-[10px] font-black uppercase tracking-widest min-w-[140px] shadow-lg"
              >
                <CreditCard className="size-4" />
                Complete Payment
              </PremiumButton>
            ) : status === 'confirmed' ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="size-4" />
                Verified & Paid
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TicketCard;

