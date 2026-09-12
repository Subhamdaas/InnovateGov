"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Rocket, Sparkles, Flame } from "lucide-react";

export function CoffeeCup3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Subtle 3D tilt calculation
    const rotX = (mouseY / (rect.height / 2)) * -20;
    const rotY = (mouseX / (rect.width / 2)) * 20;

    setRotate({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-72 h-80 flex items-center justify-center cursor-pointer select-none perspective-1000"
    >
      {/* Dynamic Floor Shadow */}
      <motion.div
        animate={{
          scale: isHovered ? [1, 1.15, 1] : [1, 1.08, 1],
          opacity: isHovered ? [0.4, 0.6, 0.4] : [0.3, 0.5, 0.3],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
        }}
        className="absolute bottom-6 w-48 h-8 bg-black/60 rounded-full blur-xl transform rotate-x-60 pointer-events-none"
      />

      {/* Floating 3D Cup Container */}
      <motion.div
        animate={{
          y: isHovered ? [-8, 8, -8] : [-12, 12, -12],
          rotateZ: isHovered ? [-2, 2, -2] : [-1, 1, -1],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut",
        }}
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: "transform 0.15s ease-out",
        }}
        className="relative w-44 h-56 flex flex-col items-center justify-end"
      >
        {/* Steam Particles rising up */}
        <div className="absolute -top-12 inset-x-0 flex justify-center gap-3 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [-5, -35, -50],
                opacity: [0, 0.7, 0],
                scale: [0.6, 1.2, 1.8],
                x: [0, (i - 1) * 10, (i - 1) * 20],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.8 + i * 0.4,
                delay: i * 0.7,
                ease: "easeOut",
              }}
              className="w-3 h-8 bg-gradient-to-t from-amber-200/40 via-white/30 to-transparent rounded-full blur-sm"
            />
          ))}
        </div>

        {/* Coffee Rim & Liquid Surface */}
        <div className="absolute top-0 w-36 h-10 bg-slate-900 rounded-[50%] border-4 border-amber-950/80 shadow-inner overflow-hidden z-20 flex items-center justify-center">
          {/* Coffee Surface */}
          <div className="w-[92%] h-[85%] bg-gradient-to-b from-[#2C1810] via-[#1E0F0A] to-[#120805] rounded-[50%] relative flex items-center justify-center border border-amber-900/40">
            {/* Crema swirl ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="w-20 h-5 border border-amber-600/30 rounded-[50%] blur-[0.5px]"
            />
            {/* Rocket Latte Art */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-amber-200/60 rotate-45 transform -scale-x-100" />
            </div>
          </div>
        </div>

        {/* Cup Ceramic Body */}
        <div className="relative w-36 h-44 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 rounded-b-[40px] rounded-t-[18px] border-t-2 border-slate-700/60 shadow-2xl overflow-hidden flex flex-col items-center justify-center z-10 border-x border-b border-slate-700/40">
          {/* Specular Highlight Overlay */}
          <div className="absolute inset-y-0 left-3 w-4 bg-gradient-to-r from-white/20 to-transparent rounded-full blur-[1px] pointer-events-none" />
          <div className="absolute inset-y-0 right-4 w-6 bg-gradient-to-l from-black/50 to-transparent pointer-events-none" />

          {/* Central Rocket Insignia (As seen in 1st reference picture) */}
          <motion.div
            animate={{
              scale: isHovered ? 1.08 : 1,
            }}
            className="relative z-10 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-lg backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30">
              <Rocket className="w-6 h-6 text-slate-950 transform -rotate-45" />
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase">
                BUILD 3D
              </span>
            </div>
          </motion.div>

          {/* Bottom Ceramic Base Accent */}
          <div className="absolute bottom-0 inset-x-0 h-3 bg-gradient-to-t from-amber-600/20 to-transparent border-t border-amber-500/20" />
        </div>

        {/* 3D Handle (Right Side) */}
        <div className="absolute right-[-24px] top-12 w-12 h-24 border-[7px] border-slate-800 rounded-r-[30px] border-l-0 shadow-xl z-0 transform rotate-y-12 bg-gradient-to-r from-slate-900 to-slate-800" />

        {/* Floating 3D Badge Pill tag overlay */}
        <motion.div
          animate={{
            y: [-4, 4, -4],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          }}
          className="absolute -right-8 top-4 px-3 py-1.5 rounded-full bg-amber-500/90 text-slate-950 text-[10px] font-extrabold shadow-xl backdrop-blur-sm border border-amber-300 flex items-center gap-1 z-30"
        >
          <Flame className="w-3 h-3 fill-slate-950" />
          <span>3D Rocket Cup</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
