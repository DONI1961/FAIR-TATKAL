import React from 'react';
import { motion } from 'framer-motion';

export const ProbabilityMeter = ({ value, label = "Winning Chance" }) => {
  const percentage = Math.min(100, Math.max(0, value));
  
  const getColor = (val) => {
    if (val < 30) return "from-red-500 to-orange-500";
    if (val < 70) return "from-orange-500 to-yellow-500";
    return "from-green-500 to-emerald-500";
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-sm font-black text-foreground">{percentage}%</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary border border-border shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${getColor(percentage)} shadow-lg shadow-primary/20`}
        />
        {/* Glow effect */}
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-white/20 blur-sm pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
