"use client";

import React from "react";
import "./loader.css";

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export function Loader({ text = "ANALYZING", fullScreen = false }: LoaderProps) {
  return (
    <div className={`fintellix-loader-container ${fullScreen ? "fixed inset-0 z-[100] bg-[#020617]" : "relative w-full h-full"}`}>
      <div className="core-socket">
        {/* Outer Orbiting Ring */}
        <div className="orbital-ring"></div>
        
        {/* Hexagon Sub-Nodes */}
        <div className="hex-grid">
          <div className="hex-node hex-center"></div>
          <div className="hex-node hex-t-l"></div>
          <div className="hex-node hex-t-r"></div>
          <div className="hex-node hex-r"></div>
          <div className="hex-node hex-b-r"></div>
          <div className="hex-node hex-b-l"></div>
          <div className="hex-node hex-l"></div>
        </div>

        {/* Loading Text */}
        <div className="scan-text">{text}...</div>
      </div>
    </div>
  );
}
