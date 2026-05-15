"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/components/auth-provider";
import { format } from "date-fns";
import { 
  Train, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  Timer, 
  AlertCircle, 
  CheckCircle2, 
  Ticket, 
  IndianRupee, 
  Map, 
  ArrowRight,
  ShieldAlert,
  Zap,
  ChevronRight,
  Info
} from "lucide-react";

import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/design-system/GlassCard";
import { PremiumButton } from "@/components/design-system/PremiumButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FormSectionHeader = ({ icon: Icon, title, desc, color = "text-blue-500" }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className={cn("size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center", color)}>
      <Icon className="size-6" />
    </div>
    <div>
      <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{desc}</p>
    </div>
  </div>
);

const DatePickerField = ({ label, name, value, onChange }) => (
  <div className="space-y-2">
    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</Label>
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-4 flex items-center gap-3 text-white font-bold hover:bg-white/10 transition-all text-left">
          <CalendarIcon className="size-4 text-blue-500" />
          <span className="text-sm">
            {value ? format(new Date(value), "PPP") : "Select Date"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-white/10 bg-slate-900 backdrop-blur-3xl" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          onSelect={(date) => onChange(name, date)}
          initialFocus
          className="bg-transparent text-white"
        />
      </PopoverContent>
    </Popover>
  </div>
);

const TimePickerField = ({ label, name, value, onChange, required = false }) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</Label>
    <div className="relative">
      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-blue-500 pointer-events-none" />
      <Input
        type="time"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="h-14 w-full pl-12 rounded-2xl border-white/10 bg-white/5 font-bold text-white focus:ring-blue-500/20"
      />
    </div>
  </div>
);

const InputField = ({ label, name, value, onChange, placeholder, icon: Icon, type = "text" }) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</Label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-blue-500 pointer-events-none" />}
      <Input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className={cn(
          "h-14 rounded-2xl border-white/10 bg-white/5 font-bold text-white focus:ring-blue-500/20 placeholder:text-slate-600",
          Icon ? "pl-12" : "px-6"
        )}
      />
    </div>
  </div>
);

export default function AddTrain() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "admin")) {
      router.push("/");
    }
  }, [session, status, router]);

  const [train, setTrain] = useState({
    train_number: "",
    train_name: "",
    from_station: "",
    to_station: "",
    departure_date: "",
    departure_time: "",
    arrival_date: "",
    arrival_time: "",
    duration: "",
    takkal: false,
    opening_date: "",
    opening_time: "",
    closing_date: "",
    closing_time: "",
    classes: {
      economy: { seats: 0, fare: 0 },
      business: { seats: 0, fare: 0 },
      first: { seats: 0, fare: 0 }
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTrain(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleDateChange = (name, date) => {
    setTrain(prev => ({ ...prev, [name]: date ? format(date, "yyyy-MM-dd") : "" }));
  };

  const handleClassField = (className, field, value) => {
    if (isNaN(value)) return;
    setTrain(prev => ({
      ...prev,
      classes: {
        ...prev.classes,
        [className]: { ...prev.classes[className], [field]: Number(value) }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...train,
      train_number: Number(train.train_number),
      duration: Number(train.duration),
      opening_time: train.opening_time ? `${train.opening_time}:00` : "",
      closing_time: train.closing_time ? `${train.closing_time}:00` : "",
      seats: [train.classes.economy.seats, train.classes.business.seats, train.classes.first.seats],
      fare: [train.classes.economy.fare, train.classes.business.fare, train.classes.first.fare]
    }

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/add_train', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNotification({ type: "success", title: "Deployment Successful", message: "Train route active in neural network." });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      setNotification({ type: "error", title: "Deployment Failed", message: "Connection error. Re-sync required." });
    }
  };

  if (status !== "authenticated") return null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20 pt-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16"
      >
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
            Admin Command Center
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
            Fleet <span className="text-orange-500">Expansion</span>
          </h1>
          <p className="mt-4 text-slate-400 font-medium max-w-md">
            Deploy new routes, configure seating availability, and manage allocation windows with surgical precision.
          </p>
        </div>

        <GlassCard className="py-6 px-8 flex items-center gap-4 border-orange-500/10 bg-orange-500/5">
           <ShieldAlert className="size-8 text-orange-500" />
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Authorization</p>
             <p className="text-lg font-black text-white uppercase tracking-tighter">Level 4 Admin</p>
           </div>
        </GlassCard>
      </motion.div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className={cn(
              "p-6 rounded-2xl flex items-start gap-4",
              notification.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border border-rose-500/20 text-rose-500"
            )}>
              <Info className="size-6 shrink-0" />
              <div>
                <h4 className="font-black uppercase tracking-widest text-xs mb-1">{notification.title}</h4>
                <p className="text-sm font-medium opacity-80">{notification.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identity & Route */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-8 border-white/5 bg-white/5">
            <FormSectionHeader icon={Ticket} title="Vessel Identity" desc="Primary identifiers" />
            <div className="grid grid-cols-1 gap-6">
              <InputField label="Train Number" name="train_number" value={train.train_number} onChange={handleChange} icon={Zap} placeholder="e.g. 12045" />
              <InputField label="Vessel Name" name="train_name" value={train.train_name} onChange={handleChange} icon={Train} placeholder="e.g. Hyperion Express" />
            </div>
          </GlassCard>

          <GlassCard className="p-8 border-white/5 bg-white/5">
            <FormSectionHeader icon={Map} title="Route Geometry" desc="Spatial nodes" color="text-indigo-500" />
            <div className="flex flex-col gap-6">
              <InputField label="Origin Station" name="from_station" value={train.from_station} onChange={handleChange} icon={MapPin} placeholder="Search station..." />
              <div className="flex justify-center -my-2 relative z-10">
                 <div className="size-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center">
                    <ChevronRight className="size-4 text-slate-500 rotate-90 lg:rotate-0" />
                 </div>
              </div>
              <InputField label="Destination Station" name="to_station" value={train.to_station} onChange={handleChange} icon={MapPin} placeholder="Search station..." />
            </div>
          </GlassCard>
        </div>

        {/* Schedule */}
        <GlassCard className="p-8 border-white/5 bg-white/5">
          <FormSectionHeader icon={CalendarIcon} title="Temporal Coordinates" desc="Departure & Arrival nodes" color="text-emerald-500" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DatePickerField label="Departure Date" name="departure_date" value={train.departure_date} onChange={handleDateChange} />
            <TimePickerField label="Departure Time" name="departure_time" value={train.departure_time} onChange={handleChange} required />
            <DatePickerField label="Arrival Date" name="arrival_date" value={train.arrival_date} onChange={handleDateChange} />
            <TimePickerField label="Arrival Time" name="arrival_time" value={train.arrival_time} onChange={handleChange} required />
          </div>
          <div className="mt-8 max-w-xs">
            <InputField label="Journey Duration (Min)" name="duration" value={train.duration} onChange={handleChange} icon={Timer} placeholder="e.g. 330" type="number" />
          </div>
        </GlassCard>

        {/* Allocation Window */}
        <GlassCard className={cn(
          "p-8 border-white/5 bg-white/5 transition-all duration-500",
          train.takkal && "border-orange-500/20 bg-orange-500/5 shadow-[0_0_50px_rgba(249,115,22,0.1)]"
        )}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <FormSectionHeader icon={AlertCircle} title="Allocation Engine" desc="Lottery window configuration" color="text-orange-500" />
            <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
              <Checkbox 
                id="takkal" 
                checked={train.takkal} 
                onCheckedChange={(c) => setTrain(p => ({ ...p, takkal: !!c }))}
                className="size-5 border-white/20 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label htmlFor="takkal" className="text-xs font-black uppercase tracking-widest text-white cursor-pointer select-none">Activate Priority Quota</Label>
            </div>
          </div>
          
          <AnimatePresence>
            {train.takkal && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-white/5"
              >
                <DatePickerField label="Opening Date" name="opening_date" value={train.opening_date} onChange={handleDateChange} />
                <TimePickerField label="Opening Time" name="opening_time" value={train.opening_time} onChange={handleChange} />
                <DatePickerField label="Closing Date" name="closing_date" value={train.closing_date} onChange={handleDateChange} />
                <TimePickerField label="Closing Time" name="closing_time" value={train.closing_time} onChange={handleChange} />
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Configurations */}
        <GlassCard className="p-8 border-white/5 bg-white/5">
          <FormSectionHeader icon={IndianRupee} title="Class Matrix" desc="Inventory & Pricing" color="text-slate-400" />
          <div className="space-y-6">
            {Object.entries(train.classes).map(([key, info]) => (
              <div key={key} className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                <div className="md:col-span-4 flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs text-white">
                    {key === 'economy' ? 'EC' : key === 'business' ? 'BS' : 'FC'}
                  </div>
                  <span className="font-black text-white uppercase tracking-widest">{key}</span>
                </div>
                <div className="md:col-span-4">
                   <InputField label="Capacity" name={`${key}-seats`} value={info.seats} onChange={(e) => handleClassField(key, "seats", e.target.value)} placeholder="0" type="number" />
                </div>
                <div className="md:col-span-4">
                   <InputField label="Unit Fare (₹)" name={`${key}-fare`} value={info.fare} onChange={(e) => handleClassField(key, "fare", e.target.value)} placeholder="0" type="number" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <PremiumButton
          type="submit"
          className="w-full py-6 text-sm font-black uppercase tracking-widest shadow-[0_0_30px_rgba(59,130,246,0.3)]"
        >
          <Zap className="size-5" />
          Synchronize Route to Mainframe
        </PremiumButton>
      </form>
    </div>
  );
}
