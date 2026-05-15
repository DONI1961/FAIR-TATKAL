import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const PremiumButton = ({ children, className, onClick, variant = 'primary' }) => {
  const variants = {
    primary: "bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]",
    secondary: "bg-white/10 text-white border border-white/20 backdrop-blur-md hover:bg-white/20",
    outline: "bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-3 font-semibold transition-all duration-300",
        variants[variant],
        className
      )}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
};
