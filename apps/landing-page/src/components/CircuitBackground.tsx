"use client";

import { motion } from "framer-motion";
import { useId } from "react";

interface CircuitBackgroundProps {
  variant?: "hero" | "features" | "social" | "workflow" | "products" | "testimonial" | "cta";
  className?: string;
}

function generateCircuitPaths(variant: string): { d: string; duration: number; delay: number }[] {
  const paths: { d: string; duration: number; delay: number }[] = [];

  if (variant === "hero") {
    paths.push(
      { d: "M -50 120 L 200 120 L 200 280 L 380 280", duration: 4, delay: 0 },
      { d: "M -50 180 L 120 180 L 120 350 L 300 350 L 300 500", duration: 5, delay: 0.5 },
      { d: "M 80 -50 L 80 200 L 250 200 L 250 400", duration: 4.5, delay: 1 },
      { d: "M 1300 150 L 1050 150 L 1050 300 L 900 300 L 900 450", duration: 5, delay: 0.3 },
      { d: "M 1300 250 L 1100 250 L 1100 400 L 950 400", duration: 4, delay: 0.8 },
      { d: "M 1150 -50 L 1150 180 L 1000 180 L 1000 350", duration: 4.5, delay: 1.2 },
      { d: "M 400 700 L 400 550 L 600 550 L 600 450 L 800 450", duration: 5, delay: 0.6 },
      { d: "M 700 700 L 700 600 L 500 600 L 500 500", duration: 4, delay: 1.5 },
      { d: "M 350 -50 L 350 100 L 500 100 L 500 250 L 650 250", duration: 5.5, delay: 0.2 },
      { d: "M 850 -50 L 850 80 L 700 80 L 700 200 L 550 200", duration: 4.5, delay: 0.9 },
    );
  } else if (variant === "features") {
    paths.push(
      { d: "M -50 100 L 150 100 L 150 250 L 350 250 L 350 400", duration: 5, delay: 0 },
      { d: "M -50 300 L 100 300 L 100 450 L 280 450", duration: 4.5, delay: 0.4 },
      { d: "M 1300 200 L 1100 200 L 1100 350 L 950 350 L 950 500", duration: 5, delay: 0.6 },
      { d: "M 1300 400 L 1050 400 L 1050 250 L 900 250", duration: 4, delay: 1 },
      { d: "M 600 -50 L 600 80 L 450 80 L 450 200 L 300 200", duration: 4.5, delay: 0.3 },
      { d: "M 750 -50 L 750 120 L 900 120 L 900 280", duration: 5, delay: 0.8 },
    );
  } else if (variant === "products") {
    paths.push(
      { d: "M -50 80 L 180 80 L 180 220 L 350 220 L 350 380", duration: 5, delay: 0 },
      { d: "M -50 250 L 100 250 L 100 400 L 250 400 L 250 550", duration: 4.5, delay: 0.3 },
      { d: "M 1300 100 L 1050 100 L 1050 260 L 880 260 L 880 420", duration: 5, delay: 0.5 },
      { d: "M 1300 300 L 1100 300 L 1100 180 L 950 180", duration: 4, delay: 0.8 },
      { d: "M 500 -50 L 500 120 L 350 120 L 350 280", duration: 4.5, delay: 0.2 },
      { d: "M 800 -50 L 800 100 L 950 100 L 950 250", duration: 5, delay: 0.6 },
    );
  } else {
    paths.push(
      { d: "M -50 150 L 150 150 L 150 300 L 300 300 L 300 450", duration: 5, delay: 0 },
      { d: "M 1300 120 L 1100 120 L 1100 280 L 950 280", duration: 4.5, delay: 0.4 },
      { d: "M 400 -50 L 400 100 L 250 100 L 250 250", duration: 4, delay: 0.7 },
      { d: "M 900 -50 L 900 80 L 1050 80 L 1050 220", duration: 4.5, delay: 0.2 },
      { d: "M 600 600 L 600 480 L 450 480 L 450 350", duration: 5, delay: 0.9 },
    );
  }

  return paths;
}

function generateNodes(variant: string): { cx: number; cy: number; delay: number }[] {
  if (variant === "hero") {
    return [
      { cx: 200, cy: 120, delay: 0.5 }, { cx: 200, cy: 280, delay: 1 },
      { cx: 120, cy: 180, delay: 0.8 }, { cx: 80, cy: 200, delay: 1.2 },
      { cx: 1050, cy: 150, delay: 0.6 }, { cx: 1050, cy: 300, delay: 1.1 },
      { cx: 500, cy: 100, delay: 0.7 }, { cx: 700, cy: 80, delay: 1.0 },
      { cx: 600, cy: 450, delay: 0.8 },
    ];
  }
  return [
    { cx: 150, cy: 150, delay: 0.3 }, { cx: 150, cy: 300, delay: 0.8 },
    { cx: 1100, cy: 120, delay: 0.5 }, { cx: 1100, cy: 280, delay: 1.1 },
    { cx: 400, cy: 100, delay: 0.6 }, { cx: 600, cy: 480, delay: 0.9 },
  ];
}

export default function CircuitBackground({ variant = "hero", className = "" }: CircuitBackgroundProps) {
  const id = useId();
  const paths = generateCircuitPaths(variant);
  const nodes = generateNodes(variant);

  const glowColor = "rgba(255, 255, 255, 0.6)";
  const staticColor = "rgba(255, 255, 255, 0.04)";
  const nodeColor = "rgba(255, 255, 255, 0.4)";
  const nodeGlowColor = "rgba(255, 255, 255, 0.5)";

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 600">
        <defs>
          {paths.map((_, i) => (
            <linearGradient key={`grad-${id}-${i}`} id={`flow-${id}-${i}`}>
              <stop offset="0%" stopColor="transparent" />
              <stop offset="40%" stopColor="transparent" />
              <stop offset="50%" stopColor={glowColor} />
              <stop offset="60%" stopColor="transparent" />
              <stop offset="100%" stopColor="transparent" />
              <animate attributeName="x1" values="-100%;100%" dur={`${paths[i].duration}s`} begin={`${paths[i].delay}s`} repeatCount="indefinite" />
              <animate attributeName="x2" values="0%;200%" dur={`${paths[i].duration}s`} begin={`${paths[i].delay}s`} repeatCount="indefinite" />
            </linearGradient>
          ))}
          <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {paths.map((path, i) => (
          <path key={`static-${i}`} d={path.d} fill="none" stroke={staticColor} strokeWidth="1" strokeLinecap="round" />
        ))}

        {paths.map((path, i) => (
          <motion.path key={`flow-${i}`} d={path.d} fill="none" stroke={`url(#flow-${id}-${i})`} strokeWidth="1.5" strokeLinecap="round" filter={`url(#glow-${id})`} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, delay: path.delay }} />
        ))}

        {nodes.map((node, i) => (
          <motion.g key={`node-${i}`}>
            <motion.circle cx={node.cx} cy={node.cy} r="4" fill="none" stroke={nodeGlowColor} strokeWidth="1" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: [0.5, 1.5, 0.5], opacity: [0, 0.4, 0] }} transition={{ duration: 3, delay: node.delay + 1, repeat: Infinity, ease: "easeInOut" }} />
            <motion.circle cx={node.cx} cy={node.cy} r="2" fill="rgba(255, 255, 255, 0.08)" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: node.delay }} />
            <motion.circle cx={node.cx} cy={node.cy} r="1.5" fill={nodeColor} initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0] }} transition={{ duration: 2.5, delay: node.delay + 0.5, repeat: Infinity, ease: "easeInOut" }} />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
