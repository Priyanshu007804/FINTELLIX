"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export function TemporalScrollbar() {
  const { scrollYProgress } = useScroll();
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Smooth the scroll progress so the glowing thumb doesn't jump abruptly
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Calculate dynamic line height based on scroll progress (0vh to 100vh)
  const lineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    // Detect mobile touch devices since custom scrollbars can interrupt touch flows
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsScrolling(false);
      }, 500); // Glow fades out 500ms after scrolling stops
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  // Avoid overriding mobile standard touch patterns
  if (isMobile) return null;

  return (
    <div
      className="fixed top-0 right-0 bottom-0 w-3 z-[9999] group flex justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Track (barely visible until interacted) */}
      <div 
        className={`absolute top-0 bottom-0 w-[2px] bg-slate-800 transition-opacity duration-300 ${
          isHovered || isScrolling ? "opacity-50" : "opacity-0"
        }`} 
      />

      {/* The Temporal Thread (glowing line trailing the thumb) */}
      <motion.div
        className="absolute top-0 w-[2px] bg-gradient-to-b from-cyan-600 to-cyan-400"
        style={{ height: lineHeight }}
      />

      {/* The Glow Particle (Thumb) */}
      <motion.div
        className="absolute w-[6px] h-[30px] rounded-full bg-cyan-300 pointer-events-none"
        style={{
          // Move from 0% (top) to 100% (bottom of screen), offset by thumb height to stay on screen
          top: useTransform(smoothProgress, [0, 1], ["0%", "calc(100% - 30px)"]),
          boxShadow: isScrolling || isHovered
            ? "0 0 10px 2px rgba(34, 211, 238, 0.6), 0 0 20px 4px rgba(34, 211, 238, 0.4)"
            : "0 0 5px 1px rgba(34, 211, 238, 0.3)",
        }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}
