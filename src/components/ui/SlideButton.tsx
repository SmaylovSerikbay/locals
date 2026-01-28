'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

interface SlideButtonProps {
  text: string;
  onSuccess: () => void;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export default function SlideButton({ text, onSuccess, className = '', icon, disabled }: SlideButtonProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Since we can't easily implement drag in a simple component without 
  // complex libraries, we'll make a sleek hold-to-confirm button
  // which is more reliable on mobile web than slide-to-unlock.
  
  const [progress, setProgress] = useState(0);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleStart = () => {
    if (disabled || isCompleted) return;
    
    // Fast fill (approx 800ms)
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          handleComplete();
          return 100;
        }
        return p + 4; // ~25 ticks
      });
    }, 20);
  };

  const handleEnd = () => {
    if (isCompleted) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progress < 100) {
      setProgress(0); // Reset if not finished
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      onSuccess();
      // Optional: Reset after success if needed, but usually we navigate away or change state
    }, 300);
  };

  return (
    <div 
      className={`relative w-full h-[64px] rounded-[32px] overflow-hidden select-none touch-none bg-gray-100 shadow-inner border border-gray-200 group cursor-pointer ${className}`}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
    >
      {/* Progress Bar Background */}
      <motion.div 
        className="absolute inset-0 bg-black z-0"
        style={{ width: `${progress}%` }}
        transition={{ type: 'tween', ease: 'linear', duration: 0 }}
      />
      
      {/* Success State Background */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 bg-green-500 z-10 flex items-center justify-center gap-2"
          >
             <Check className="w-6 h-6 text-white stroke-[4]" />
             <span className="text-white font-black text-lg uppercase tracking-wider">Success</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Label */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none mix-blend-difference text-white">
         <span className={`font-black text-lg tracking-tight transition-opacity ${progress > 10 ? 'opacity-100' : 'opacity-0'}`}>
            {isCompleted ? '' : 'HOLD TO CONFIRM'}
         </span>
      </div>

      {/* Default Label (Visible when not holding) */}
      <div className={`absolute inset-0 flex items-center justify-between px-2 z-10 transition-opacity duration-200 ${progress > 0 || isCompleted ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center">
             {icon || <ArrowRight className="w-5 h-5 text-gray-900" />}
          </div>
          <span className="flex-1 text-center font-bold text-gray-900 text-lg pr-12">
             {text}
          </span>
      </div>

      {/* Hint animation */}
      {!isCompleted && progress === 0 && (
         <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-1">
             <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-pulse"></div>
             <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-pulse delay-75"></div>
             <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-pulse delay-150"></div>
         </div>
      )}
    </div>
  );
}