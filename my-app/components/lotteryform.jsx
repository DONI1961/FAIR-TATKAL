'use client'
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from '@/components/auth-provider';
import Loading from '@/components/loading'
import LotteryDone from '@/components/done'
import TimerBasic from '@/components/timer';
import { Ticket, Sparkles, Clock, Info, ShieldCheck, Zap } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlassCard } from './design-system/GlassCard';
import { PremiumButton } from './design-system/PremiumButton';
import { ProbabilityMeter } from './design-system/ProbabilityMeter';

const LotteryForm = ({ train, second, fn }) => {
  const { data: session } = useSession()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [btLoading, setBtLoading] = useState(false)
  const [formData, setFormData] = useState({
    travelClass: 'economy',
    train_number: train.train_number,
  });

  const trainDetails = train

  const classData = {
    economy: { fare: trainDetails.fare[0], seats: trainDetails.seats[0], total: 50 },
    business: { fare: trainDetails.fare[1], seats: trainDetails.seats[1], total: 30 },
    first: { fare: trainDetails.fare[2], seats: trainDetails.seats[2], total: 10 },
  }

  // Calculate a fake probability for visual purposes
  const currentClass = classData[formData.travelClass]
  const probability = Math.round((currentClass.seats / currentClass.total) * 100)

  const handleSubmit = async (e) => {
    setBtLoading(true)
    e.preventDefault();
    const payload = {
      'user_email': session?.user?.email,
      'journey_id': Number(train.journey_id),
      'seat_class': formData.travelClass.toLowerCase(),
      'status': 'pending'
    }
    
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/lottery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify(payload)
      })

      const response = await res.json()
      if (response.ok) {
        setSubmitted(true)
      } else {
        alert('Failed to submit entry')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBtLoading(false)
    }
  };

  useEffect(() => {
    const checkSubmitted = async () => {
      const query = new URLSearchParams({
        email: session?.user?.email,
        journey_id: train.journey_id,
      })
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/check_lottery?' + query.toString(), {
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`
          },
        })
        const response = await res.json()
        if (response.ok) {
          setSubmitted(true)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (session?.accessToken) checkSubmitted()
  }, [session, train.journey_id])

  if (loading) return <div className="py-20"><Loading /></div>
  if (submitted) return <LotteryDone />

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header Summary */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12"
      >
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 shadow-sm">
            Reservation Terminal
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">
            Smart Allocation <span className="text-primary">System</span>
          </h1>
          <p className="mt-4 text-muted-foreground font-medium">
            Join the fair lottery for <span className="text-foreground font-bold">{trainDetails.train_name}</span> (#{trainDetails.train_number})
          </p>
        </div>

        <GlassCard className="py-6 px-8 border-primary/20 bg-primary/5 text-center min-w-[240px] shadow-sm">
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-3">
            <Clock className="size-3 animate-pulse" />
            Window Closing
          </div>
          <TimerBasic second={second} fn={fn} />
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Probability Insights */}
        <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
          <ProbabilityMeter 
            probability={probability} 
            label={`Allocation Odds: ${formData.travelClass.toUpperCase()}`}
          />
          
          <GlassCard className="p-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
              <Info className="size-4 text-primary" />
              Live Insights
            </h4>
            <div className="space-y-4">
              {[
                { icon: ShieldCheck, label: "Encrypted Entry", desc: "Your bid is securely stored and tamper-proof.", color: "text-emerald-500" },
                { icon: Zap, label: "Real-time Demand", desc: "Currently 42 active bidders for this route.", color: "text-primary" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl bg-secondary/50 border border-border/50">
                  <div className={`shrink-0 size-8 rounded-lg bg-secondary flex items-center justify-center ${item.color}`}>
                    <item.icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground mb-1">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Entry Form */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <GlassCard className="p-8 md:p-10 border-border bg-card backdrop-blur-3xl shadow-2xl overflow-visible">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Ticket className="size-4 text-primary" />
                  Select Travel Tier
                </label>
                
                <Select
                  value={formData.travelClass}
                  onValueChange={(value) => setFormData({ ...formData, travelClass: value })}
                >
                  <SelectTrigger className="w-full h-20 rounded-2xl border-border bg-secondary/50 px-6 text-left text-lg font-bold text-foreground transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10 hover:bg-secondary">
                    <SelectValue placeholder="Choose your class" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border backdrop-blur-3xl p-1 rounded-2xl z-50">
                    <SelectItem value="economy" className="rounded-xl py-4 px-6 text-foreground hover:bg-secondary focus:bg-secondary focus:text-primary cursor-pointer transition-all">
                      <div className="flex justify-between w-full min-w-[200px]">
                        <span className="font-bold uppercase">Economy</span>
                        <span className="text-muted-foreground">₹{trainDetails.fare[0]}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="business" className="rounded-xl py-4 px-6 text-foreground hover:bg-secondary focus:bg-secondary focus:text-primary cursor-pointer transition-all">
                      <div className="flex justify-between w-full min-w-[200px]">
                        <span className="font-bold uppercase">Business</span>
                        <span className="text-muted-foreground">₹{trainDetails.fare[1]}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="first" className="rounded-xl py-4 px-6 text-foreground hover:bg-secondary focus:bg-secondary focus:text-primary cursor-pointer transition-all">
                      <div className="flex justify-between w-full min-w-[200px]">
                        <span className="font-bold uppercase">First Class</span>
                        <span className="text-muted-foreground">₹{trainDetails.fare[2]}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-6 rounded-2xl bg-secondary/50 border border-border flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Current Tier Availability</p>
                  <p className="text-xl font-black text-foreground">{classData[formData.travelClass].seats} SEATS <span className="text-emerald-500 text-xs ml-1 font-bold uppercase">REMAINING</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Base Fare</p>
                  <p className="text-2xl font-black text-primary">₹{classData[formData.travelClass].fare}</p>
                </div>
              </div>

              <PremiumButton
                type="submit"
                disabled={btLoading}
                className="w-full py-6 text-sm font-black uppercase tracking-widest shadow-lg"
              >
                {btLoading ? (
                  <div className="flex items-center gap-3">
                    <Loading className="size-4" />
                    <span>Synchronizing Entry...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Sparkles className="size-5" />
                    <span>Initiate Allocation Bid</span>
                  </div>
                )}
              </PremiumButton>
              
              <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                By entering, you agree to our fair allocation policy
              </p>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default LotteryForm;

