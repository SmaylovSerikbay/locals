'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { ChevronRight, Check, ChevronsRight } from 'lucide-react';

interface SlideButtonProps {
  onSuccess: () => void;
  text?: string;
  className?: string;
  icon?: React.ReactNode;
  initialText?: string; // e.g. "Slide to respond"
}

export default function SlideButton({ onSuccess, text = "Slide to confirm", className = "", icon }: SlideButtonProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    if (containerRef.current) {
        setConstraints({
            left: 0,
            right: containerRef.current.offsetWidth - 64 // 64 is handle width (h-14 + padding) roughly
        });
    }
  }, []);

  const handleDragEnd = async (_: any, info: any) => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const handleWidth = 56; 
    const threshold = (containerWidth - handleWidth) * 0.75; // 75% to trigger (easier)

    if (x.get() > threshold) {
      setIsCompleted(true);
      await controls.start({ 
        x: containerWidth - handleWidth - 8,
        transition: { type: "spring", stiffness: 300, damping: 30 }
      }); // Snap to end with spring
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      setTimeout(() => onSuccess(), 200); // Small delay for visual feedback
    } else {
      controls.start({ 
        x: 0,
        transition: { type: "spring", stiffness: 400, damping: 30 }
      });
    }
  };

  // Transform opacity based on drag position
  const textOpacity = useTransform(x, [0, 100], [1, 0]);
  const chevronOpacity = useTransform(x, [0, 50], [1, 0]);
  const bgOpacity = useTransform(x, [0, 200], [0.1, 0.3]);

  return (
    <div 
      ref={containerRef}
      className={`relative h-[64px] bg-gray-100 rounded-[32px] overflow-hidden select-none touch-none w-full shadow-inner ${className}`}
    >
      {/* Success State Overlay */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: isCompleted ? 1 : 0 }}
         className="absolute inset-0 bg-black z-20 flex items-center justify-center text-white font-bold text-lg gap-2 pointer-events-none"
      >
         <Check className="w-6 h-6" />
         <span>Success!</span>
      </motion.div>

      {/* Shimmer / Hint Animation */}
      {!isCompleted && (
          <div className="absolute inset-0 z-0 overflow-hidden rounded-[32px]">
              <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1 }}
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
              />
          </div>
      )}

      {/* Progress Track */}
      <motion.div 
          style={{ 
            width: x,
            opacity: useTransform(x, [0, constraints.right], [0.1, 0.4])
          }}
          className="absolute left-0 top-0 bottom-0 bg-black z-0 rounded-l-[32px]"
      />
      
      {/* Text Label */}
      <motion.div 
          style={{ opacity: textOpacity }}
          className="absolute inset-0 flex items-center justify-center text-gray-900 font-bold text-[17px] pointer-events-none z-10 pl-8"
      >
          {text}
          <motion.div 
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="ml-2 opacity-50"
          >
             <ChevronsRight className="w-5 h-5" />
          </motion.div>
      </motion.div>

      {/* Draggable Handle */}
      <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: constraints.right }}
          dragElastic={0.05}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{ x }}
          whileTap={{ scale: 1.05 }}
          className="absolute top-1 left-1 bottom-1 w-[56px] h-[56px] bg-white rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.15)] cursor-grab active:cursor-grabbing z-20 border border-gray-100"
      >
          {icon || <ChevronRight className="w-8 h-8 text-black stroke-[3]" />}
      </motion.div>
    </div>
  );
}