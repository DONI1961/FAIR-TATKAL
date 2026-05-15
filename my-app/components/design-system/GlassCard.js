import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const GlassCard = ({ children, className, hover = true, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover ? { y: -5, transition: { duration: 0.3 } } : {}}
      className={cn(
        "glass-card relative overflow-hidden rounded-3xl",
        className
      )}
    >
      {/* Ambient Glow - Soft Blue/Orange accents */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-accent/5 dark:bg-accent/10 blur-[80px]" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary/5 dark:bg-primary/10 blur-[80px]" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
