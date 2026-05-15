import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const PremiumButton = ({ children, className, onClick, variant = 'primary' }) => {
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-lg hover:shadow-primary/40",
    secondary: "bg-secondary text-secondary-foreground border border-border backdrop-blur-md hover:opacity-90",
    accent: "bg-accent text-accent-foreground shadow-lg hover:shadow-accent/40",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
