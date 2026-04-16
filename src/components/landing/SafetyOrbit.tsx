"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* =================== DATA =================== */

export interface SafetyNode {
  id: string;
  label: string;
  description: string;
  category: "scam" | "motive" | "precaution";
}

export const safetyData: SafetyNode[] = [
  // Outer Ring — How People Get Scammed (Red/Orange)
  { id: "s1", label: "Phishing Links", description: "Fake emails & SMS with links that look like your bank's website. They steal your login credentials the moment you type them.", category: "scam" },
  { id: "s2", label: "OTP Sharing", description: "Scammers pose as bank officials and urgently ask for your OTP. No real bank employee will ever ask for your OTP.", category: "scam" },
  { id: "s3", label: "Fake UPI QR Codes", description: "Fraudsters send 'payment request' QR codes. Scanning them SENDS money instead of receiving it.", category: "scam" },
  { id: "s4", label: "SIM Swap Attacks", description: "Scammers convince your telecom provider to transfer your number to a new SIM, intercepting all your OTPs.", category: "scam" },
  { id: "s5", label: "Fake Customer Care", description: "Searching Google for bank helpline numbers often shows fake sponsored results controlled by scammers.", category: "scam" },
  { id: "s6", label: "Social Engineering", description: "Scammers build trust over days or weeks, posing as friends, relatives, or officials before making their move.", category: "scam" },

  // Middle Ring — Scammer Motives (Amber)
  { id: "m1", label: "Identity Theft", description: "Your KYC documents are used to open fake bank accounts and take loans in your name.", category: "motive" },
  { id: "m2", label: "Fund Transfer", description: "Direct unauthorized transfers from your bank account or UPI to untraceable accounts.", category: "motive" },
  { id: "m3", label: "Data Harvesting", description: "Your personal data is sold on the dark web — phone numbers, Aadhaar, PAN, and banking details.", category: "motive" },
  { id: "m4", label: "Account Takeover", description: "Full control of your bank or trading account, draining investments and savings silently.", category: "motive" },

  // Inner Ring — RBI Precautions (Green/Cyan)
  { id: "p1", label: "Never Share OTP", description: "RBI Guideline: Never share your OTP, PIN, CVV, or password with anyone — not even bank staff.", category: "precaution" },
  { id: "p2", label: "Verify UPI IDs", description: "Always verify the UPI ID and receiver name before confirming any transaction.", category: "precaution" },
  { id: "p3", label: "Official Apps Only", description: "Download banking apps only from official app stores. Verify the developer name before installing.", category: "precaution" },
  { id: "p4", label: "Enable Alerts", description: "Set up SMS and email alerts for every transaction. Set daily transaction limits with your bank.", category: "precaution" },
  { id: "p5", label: "Report Within 3 Days", description: "RBI mandates: Report unauthorized transactions within 3 working days to limit your liability to zero.", category: "precaution" },
  { id: "p6", label: "RBI Sachet Portal", description: "File complaints on sachet.rbi.org.in — the official RBI grievance platform for banking fraud.", category: "precaution" },
];

const categoryColors = {
  scam: { main: "#ef4444", emissive: "#dc2626", glow: "rgba(239, 68, 68, 0.3)" },
  motive: { main: "#f59e0b", emissive: "#d97706", glow: "rgba(245, 158, 11, 0.3)" },
  precaution: { main: "#22d3ee", emissive: "#06b6d4", glow: "rgba(34, 211, 238, 0.3)" },
};

/* =================== 3D NODE =================== */

function OrbitalNode({
  position,
  color,
  emissiveColor,
  isHovered,
  onHover,
  onUnhover,
}: {
  position: [number, number, number];
  color: string;
  emissiveColor: string;
  isHovered: boolean;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    const targetScale = isHovered ? 1.8 : 1;
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(); }}
      onPointerOut={onUnhover}
    >
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
        emissiveIntensity={isHovered ? 1.5 : 0.5}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={isHovered ? 1 : 0.85}
      />
    </mesh>
  );
}

/* =================== RING GROUP =================== */

function OrbitalRing({
  radius,
  tilt,
  nodes,
  color,
  emissiveColor,
  hoveredId,
  onHover,
  onUnhover,
  rotationSpeed,
}: {
  radius: number;
  tilt: [number, number, number];
  nodes: SafetyNode[];
  color: string;
  emissiveColor: string;
  hoveredId: string | null;
  onHover: (id: string) => void;
  onUnhover: () => void;
  rotationSpeed: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  // Generate positions around the ring
  const positions = useMemo(() => {
    return nodes.map((_, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      return [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.3, // Flatten vertically
        Math.sin(angle) * radius,
      ] as [number, number, number];
    });
  }, [nodes, radius]);

  useFrame(({ clock }) => {
    groupRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed;
  });

  return (
    <group ref={groupRef} rotation={tilt}>
      {/* Ring wire */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.008, 8, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={0.4}
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <OrbitalNode
          key={node.id}
          position={positions[i]}
          color={color}
          emissiveColor={emissiveColor}
          isHovered={hoveredId === node.id}
          onHover={() => onHover(node.id)}
          onUnhover={onUnhover}
        />
      ))}
    </group>
  );
}

/* =================== CENTRAL CORE =================== */

function ShieldCore() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 1.5) * 0.08;
    ref.current.scale.setScalar(pulse);
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.35, 2]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#06b6d4"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={1}
          wireframe
        />
      </mesh>
      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.8}
          transparent
          opacity={0.15}
        />
      </mesh>
    </Float>
  );
}

/* =================== MAIN SCENE =================== */

function OrbitalScene({
  hoveredId,
  onHover,
  onUnhover,
}: {
  hoveredId: string | null;
  onHover: (id: string) => void;
  onUnhover: () => void;
}) {
  const scamNodes = safetyData.filter((n) => n.category === "scam");
  const motiveNodes = safetyData.filter((n) => n.category === "motive");
  const precautionNodes = safetyData.filter((n) => n.category === "precaution");

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#22d3ee" />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#a78bfa" />
      <pointLight position={[0, 0, 0]} intensity={1} color="#22d3ee" distance={5} />

      <ShieldCore />

      {/* Outer Ring: Scams (Red) */}
      <OrbitalRing
        radius={3}
        tilt={[0.3, 0, 0.1]}
        nodes={scamNodes}
        color={categoryColors.scam.main}
        emissiveColor={categoryColors.scam.emissive}
        hoveredId={hoveredId}
        onHover={onHover}
        onUnhover={onUnhover}
        rotationSpeed={0.08}
      />

      {/* Middle Ring: Motives (Amber) */}
      <OrbitalRing
        radius={2}
        tilt={[-0.2, 0.5, -0.15]}
        nodes={motiveNodes}
        color={categoryColors.motive.main}
        emissiveColor={categoryColors.motive.emissive}
        hoveredId={hoveredId}
        onHover={onHover}
        onUnhover={onUnhover}
        rotationSpeed={-0.12}
      />

      {/* Inner Ring: Precautions (Cyan) */}
      <OrbitalRing
        radius={1.2}
        tilt={[0.15, -0.3, 0.2]}
        nodes={precautionNodes}
        color={categoryColors.precaution.main}
        emissiveColor={categoryColors.precaution.emissive}
        hoveredId={hoveredId}
        onHover={onHover}
        onUnhover={onUnhover}
        rotationSpeed={0.15}
      />
    </>
  );
}

/* =================== EXPORTED COMPONENT =================== */

export default function SafetyOrbit({
  hoveredId,
  onHover,
  onUnhover,
}: {
  hoveredId: string | null;
  onHover: (id: string) => void;
  onUnhover: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 6], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <OrbitalScene hoveredId={hoveredId} onHover={onHover} onUnhover={onUnhover} />
    </Canvas>
  );
}
