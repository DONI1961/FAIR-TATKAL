import React from 'react';
import { motion } from 'framer-motion';

export const TrainAnimation = () => {
  return (
    <div className="relative h-64 w-full overflow-hidden">
      {/* Railway Track */}
      <div className="absolute bottom-10 h-1 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Futuristic Train */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-8 flex items-end"
      >
        {/* Engine */}
        <div className="relative h-12 w-40 rounded-r-full bg-gradient-to-r from-slate-700 to-slate-400 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          {/* Windows */}
          <div className="absolute right-4 top-2 h-4 w-12 rounded-r-full bg-blue-400/50 blur-[2px]" />
          {/* Headlight */}
          <div className="absolute right-0 top-4 h-4 w-4 rounded-full bg-white blur-[8px]" />
          <div className="absolute -right-20 top-2 h-10 w-40 bg-gradient-to-r from-white/20 to-transparent blur-[20px]" />
        </div>
        
        {/* Bogies */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="ml-1 h-10 w-32 rounded-sm bg-gradient-to-b from-slate-600 to-slate-800 border-t border-white/10">
            <div className="mt-2 flex gap-2 px-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-2 w-4 rounded-sm bg-blue-400/20" />
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Speed Lines */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{ x: ['100%', '-100%'] }}
          transition={{ duration: 1 + i, repeat: Infinity, ease: "linear" }}
          className="absolute h-[1px] w-40 bg-white/10"
          style={{ top: `${20 + i * 15}%` }}
        />
      ))}
    </div>
  );
};
