"use client";

import { useState, useMemo } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { safetyData, type SafetyNode } from "./SafetyOrbit";
import { Loader } from "@/components/ui/Loader";

const SafetyOrbit = dynamic(() => import("./SafetyOrbit"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <Loader text="MOUNTING 3D" />
    </div>
  ),
});

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const categoryMeta = {
  scam: {
    label: "How People Get Scammed",
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    icon: "🔴",
    dotColor: "bg-red-400",
  },
  motive: {
    label: "Scammer Motives",
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    icon: "🟡",
    dotColor: "bg-amber-400",
  },
  precaution: {
    label: "RBI Safety Precautions",
    color: "text-cyan-400",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    icon: "🟢",
    dotColor: "bg-cyan-400",
  },
};

export default function SafetySection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const hoveredNode = useMemo(
    () => safetyData.find((n) => n.id === hoveredId) || null,
    [hoveredId]
  );

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24">
      {/* Section Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="text-center mb-12"
      >
        <motion.p
          variants={fadeUp}
          custom={0}
          className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-3"
        >
          Stay Safe
        </motion.p>
        <motion.h2
          variants={fadeUp}
          custom={1}
          className="text-3xl md:text-4xl font-bold tracking-tight"
        >
          Protect Yourself from Online Fraud
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={2}
          className="mt-4 text-slate-400 max-w-2xl mx-auto"
        >
          Every year, thousands of Indians lose crores to digital fraud. Hover over the shield nodes
          to learn how scammers operate and what RBI recommends to keep your money safe.
        </motion.p>
      </motion.div>

      {/* Legend bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-6 mb-8"
      >
        {(["scam", "motive", "precaution"] as const).map((cat) => {
          const meta = categoryMeta[cat];
          return (
            <div key={cat} className="flex items-center gap-2 text-sm">
              <span className={`w-3 h-3 rounded-full ${meta.dotColor}`} />
              <span className={`${meta.color} font-medium`}>{meta.label}</span>
            </div>
          );
        })}
      </motion.div>

      {/* Desktop: 3D Orbit + Info Card */}
      <div className="hidden md:block relative" style={{ height: "550px" }}>
        <SafetyOrbit
          hoveredId={hoveredId}
          onHover={(id) => setHoveredId(id)}
          onUnhover={() => setHoveredId(null)}
        />

        {/* Floating Info Card */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              key={hoveredNode.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-8 right-8 w-80 rounded-2xl ${categoryMeta[hoveredNode.category].bg} ${categoryMeta[hoveredNode.category].border} border p-5 backdrop-blur-md`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span>{categoryMeta[hoveredNode.category].icon}</span>
                <span className={`text-xs font-semibold uppercase tracking-wider ${categoryMeta[hoveredNode.category].color}`}>
                  {categoryMeta[hoveredNode.category].label}
                </span>
              </div>
              <h4 className="text-white font-bold text-lg mb-2">{hoveredNode.label}</h4>
              <p className="text-slate-300 text-sm leading-relaxed">{hoveredNode.description}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center label */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-xs text-slate-500">Hover over the glowing nodes to explore</p>
        </div>
      </div>

      {/* Mobile: Card Grid Fallback */}
      <div className="md:hidden space-y-4">
        {(["scam", "motive", "precaution"] as const).map((category) => {
          const meta = categoryMeta[category];
          const nodes = safetyData.filter((n) => n.category === category);
          return (
            <div key={category}>
              <h3 className={`${meta.color} font-semibold text-base mb-3 flex items-center gap-2`}>
                {meta.icon} {meta.label}
              </h3>
              <div className="grid gap-3">
                {nodes.map((node) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`rounded-xl ${meta.bg} ${meta.border} border p-4`}
                  >
                    <h4 className="text-white font-semibold text-sm mb-1">{node.label}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{node.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
