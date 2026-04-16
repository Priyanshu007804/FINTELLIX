"use client";

import { useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/* =================== 3D ICON SHAPES =================== */

function TorusKnotIcon({ hovered }: { hovered: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.rotation.x = t * (hovered ? 0.8 : 0.3);
    ref.current.rotation.y = t * (hovered ? 0.6 : 0.2);
    ref.current.scale.setScalar(hovered ? 1.25 : 1);
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.6, 0.2, 128, 32]} />
      <MeshDistortMaterial
        color="#22d3ee"
        emissive="#0e7490"
        emissiveIntensity={hovered ? 0.8 : 0.3}
        roughness={0.3}
        metalness={0.8}
        distort={hovered ? 0.3 : 0.15}
        speed={2}
        wireframe
      />
    </mesh>
  );
}

function IcosahedronIcon({ hovered }: { hovered: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.rotation.x = t * (hovered ? 0.6 : 0.2);
    ref.current.rotation.z = t * (hovered ? 0.5 : 0.15);
    ref.current.scale.setScalar(hovered ? 1.3 : 1);
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.8, 1]} />
      <MeshDistortMaterial
        color="#a78bfa"
        emissive="#7c3aed"
        emissiveIntensity={hovered ? 0.8 : 0.3}
        roughness={0.2}
        metalness={0.9}
        distort={hovered ? 0.25 : 0.1}
        speed={3}
        wireframe
      />
    </mesh>
  );
}

function BoxIcon({ hovered }: { hovered: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.rotation.x = t * (hovered ? 0.7 : 0.25);
    ref.current.rotation.y = t * (hovered ? 0.5 : 0.15);
    ref.current.scale.setScalar(hovered ? 1.2 : 1);
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={hovered ? 0.6 : 0.2}
          wireframe
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh scale={0.7} rotation={[0.5, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#0891b2"
          emissiveIntensity={hovered ? 0.5 : 0.15}
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

function DodecahedronIcon({ hovered }: { hovered: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * (hovered ? 0.6 : 0.2);
    ref.current.rotation.z = t * (hovered ? 0.4 : 0.1);
    const pulse = 1 + Math.sin(t * 2) * (hovered ? 0.1 : 0.04);
    ref.current.scale.setScalar(pulse * (hovered ? 1.2 : 1));
  });
  return (
    <mesh ref={ref}>
      <dodecahedronGeometry args={[0.75, 0]} />
      <MeshDistortMaterial
        color="#34d399"
        emissive="#059669"
        emissiveIntensity={hovered ? 0.7 : 0.25}
        roughness={0.3}
        metalness={0.8}
        distort={hovered ? 0.2 : 0.08}
        speed={2.5}
        wireframe
      />
    </mesh>
  );
}

const iconComponents = [TorusKnotIcon, IcosahedronIcon, BoxIcon, DodecahedronIcon];

/* =================== 3D FEATURE CARD =================== */

interface FeatureCard3DProps {
  index: number;
  title: string;
  description: string;
  icon: React.ReactNode; // fallback SVG icon
}

export default function FeatureCard3D({ index, title, description, icon }: FeatureCard3DProps) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  }, [mouseX, mouseY]);

  const IconComponent = iconComponents[index % iconComponents.length];

  return (
    <motion.div
      ref={cardRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0, x: index % 2 === 0 ? -60 : 60 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.6, ease: "easeOut" as const },
        },
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group glass-card rounded-2xl p-7 transition-all duration-300 cursor-default relative overflow-hidden"
    >
      {/* Hover glow effect */}
      <div
        className={`absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.06) 0%, transparent 70%)",
        }}
      />

      {/* 3D Icon Canvas */}
      <div
        className="w-20 h-20 mb-5 rounded-xl relative"
        style={{ transform: "translateZ(40px)" }}
      >
        <Canvas
          camera={{ position: [0, 0, 3], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[3, 3, 3]} intensity={1} color="#22d3ee" />
          <pointLight position={[-3, -3, 2]} intensity={0.5} color="#a78bfa" />
          <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
            <IconComponent hovered={hovered} />
          </Float>
        </Canvas>

        {/* Fallback SVG (visible until canvas loads, provides accessibility) */}
        <div className="absolute inset-0 flex items-center justify-center text-cyan-400 opacity-0 pointer-events-none">
          {icon}
        </div>
      </div>

      <h3
        className="text-lg font-semibold mb-2 transition-colors duration-300 group-hover:text-cyan-300"
        style={{ transform: "translateZ(20px)" }}
      >
        {title}
      </h3>
      <p
        className="text-slate-400 text-sm leading-relaxed"
        style={{ transform: "translateZ(10px)" }}
      >
        {description}
      </p>
    </motion.div>
  );
}
