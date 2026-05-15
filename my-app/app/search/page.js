"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Calendar as CalendarIcon, MapPin, ArrowRightRight } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import StationAutocomplete from "@/components/StationAutocomplete";
import { GlassCard } from "@/components/design-system/GlassCard";
import { PremiumButton } from "@/components/design-system/PremiumButton";

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    from_station: "",
    to_station: "",
    date: new Date(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date: date || new Date(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = { ...formData };
    if (urlParams.date) {
      urlParams.date = format(urlParams.date, "yyyy-MM-dd");
    }
    const url = new URLSearchParams(urlParams).toString();
    router.push(`/train?${url}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-4">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 size-[500px] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 size-[500px] rounded-full bg-orange-600/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-500"
          >
            Smart Mobility Engine
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-4xl font-extrabold text-white sm:text-5xl"
          >
            Where are you headed?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-slate-400"
          >
            Enter your route and discover a fair way to travel.
          </motion.p>
        </div>

        <GlassCard className="p-1 md:p-2 overflow-visible border-white/5 bg-white/5 backdrop-blur-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="relative z-20 grid grid-cols-1 md:grid-cols-12 gap-1 p-2">
            
            {/* From Station */}
            <div className="md:col-span-4 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-slate-500 group-focus-within:text-orange-500 transition-colors">
                <MapPin className="size-5" />
              </div>
              <StationAutocomplete
                id="from_station"
                name="from_station"
                value={formData.from_station}
                onChange={handleChange}
                placeholder="From Station"
                className="pl-12 h-16 rounded-2xl bg-white/5 border-transparent focus:border-orange-500/50 text-white placeholder:text-slate-500 transition-all"
              />
            </div>

            {/* Switch Icon (Mobile only) */}
            <div className="md:hidden flex justify-center py-2">
               <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                 <Search className="size-4 text-slate-500" />
               </div>
            </div>

            {/* To Station */}
            <div className="md:col-span-4 relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-slate-500 group-focus-within:text-orange-500 transition-colors">
                <MapPin className="size-5" />
              </div>
              <StationAutocomplete
                id="to_station"
                name="to_station"
                value={formData.to_station}
                onChange={handleChange}
                placeholder="To Station"
                className="pl-12 h-16 rounded-2xl bg-white/5 border-transparent focus:border-orange-500/50 text-white placeholder:text-slate-500 transition-all"
              />
            </div>

            {/* Date Picker */}
            <div className="md:col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full h-16 items-center gap-3 rounded-2xl border border-transparent bg-white/5 px-4 text-left font-medium text-white transition hover:bg-white/10 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10"
                  >
                    <CalendarIcon className="size-5 text-slate-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 leading-none mb-1">Departure Date</span>
                      <span className="text-sm">{formData.date ? format(formData.date, "dd MMM, yyyy") : "Select Date"}</span>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-900 border-white/10" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-1">
              <button
                type="submit"
                className="flex size-full h-16 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 hover:shadow-orange-500/50"
              >
                <Search className="size-6" />
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Ticket, title: "Fair Allocation", desc: "Our lottery system ensures equal opportunity for everyone." },
            { icon: Search, title: "Smart Routing", desc: "Find the fastest and most efficient premium routes." },
            { icon: MapPin, title: "Live Tracking", desc: "Real-time updates on train positions and availability." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <GlassCard className="h-full border-white/5 bg-white/5 text-center p-6">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 mb-4">
                  <feature.icon className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

