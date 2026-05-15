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
        <span className="text-sm font-medium text-white/70">{label}</span>
        <span className="text-sm font-bold text-white">{percentage}%</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${getColor(percentage)} shadow-[0_0_15px_rgba(249,115,22,0.3)]`}
        />
        {/* Glow effect */}
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-white/20 blur-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
