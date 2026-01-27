'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';

interface SlideButtonProps {
  onSuccess: () => void;
  text?: string;
  className?: string;
  icon?: React.ReactNode;
}

export default function SlideButton({ onSuccess, text = "Slide to confirm", className = "", icon }: SlideButtonProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Maximum drag distance (container width - handle width - padding)
  // We'll estimate or calculate dynamically. For now, let's assume a fixed width logic or percentage.
  // Better to use constraints.
  
  const handleDragEnd = async (_: any, info: any) => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const handleWidth = 56; // h-14 w-14
    const threshold = containerWidth - handleWidth - 10;

    if (x.get() > threshold * 0.9) {
      // Success
      setIsCompleted(true);
      controls.start({ x: threshold });
      if (navigator.vibrate) navigator.vibrate(50);
      onSuccess();
    } else {
      // Reset
      controls.start({ x: 0 });
    }
  };

  const bgOpacity = useTransform(x, [0, 200], [0.5, 1]);
  const textOpacity = useTransform(x, [0, 150], [1, 0]);

  return (
    <div 
      ref={containerRef}
      className={`relative h-16 bg-gray-100 rounded-full overflow-hidden select-none touch-none ${className}`}
    >
      {/* Success State */}
      {isCompleted ? (
         <div className="absolute inset-0 bg-green-500 flex items-center justify-center text-white font-bold text-lg animate-in fade-in duration-300">
            <Check className="w-6 h-6 mr-2" />
            Success!
         </div>
      ) : (
        <>
            {/* Background Fill Track */}
            <motion.div 
                style={{ opacity: bgOpacity, width: x }}
                className="absolute left-0 top-0 bottom-0 bg-black/10"
            />
            
            {/* Text Label */}
            <motion.div 
                style={{ opacity: textOpacity }}
                className="absolute inset-0 flex items-center justify-center text-gray-500 font-semibold pointer-events-none"
            >
                {text}
            </motion.div>

            {/* Draggable Handle */}
            <motion.div
                drag="x"
                dragConstraints={containerRef}
                dragElastic={0.1}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
                className="absolute top-1 left-1 bottom-1 w-14 bg-black rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing z-10"
            >
                {icon || <ChevronRight className="w-8 h-8 text-white" />}
            </motion.div>
        </>
      )}
    </div>
  );
}