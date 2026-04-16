"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 120, mouse }: { count?: number; mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const mesh = useRef<THREE.Points>(null!);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      velocities[i * 3] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return { positions, velocities };
  }, [count]);

  const linePositions = useMemo(() => new Float32Array(count * count * 3 * 2), [count]);
  const lineRef = useRef<THREE.LineSegments>(null!);

  // Convert mouse screen coords (-1 to 1) into 3D world position
  const { viewport } = useThree();

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const posArray = mesh.current.geometry.attributes.position.array as Float32Array;
    const time = clock.getElapsedTime();

    // Mouse position in 3D world space
    const mx = (mouse.current.x * viewport.width) / 2;
    const my = (mouse.current.y * viewport.height) / 2;

    for (let i = 0; i < count; i++) {
      posArray[i * 3] += velocities[i * 3] + Math.sin(time * 0.3 + i) * 0.001;
      posArray[i * 3 + 1] += velocities[i * 3 + 1] + Math.cos(time * 0.2 + i) * 0.001;
      posArray[i * 3 + 2] += velocities[i * 3 + 2];

      // Mouse interaction: repel particles near cursor
      const dx = posArray[i * 3] - mx;
      const dy = posArray[i * 3 + 1] - my;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);
      const interactionRadius = 2.5;

      if (distToMouse < interactionRadius && distToMouse > 0.01) {
        const force = (1 - distToMouse / interactionRadius) * 0.04;
        posArray[i * 3] += (dx / distToMouse) * force;
        posArray[i * 3 + 1] += (dy / distToMouse) * force;
      }

      // Boundary wrap
      for (let axis = 0; axis < 3; axis++) {
        const bound = axis === 2 ? 3 : axis === 1 ? 4 : 6;
        if (posArray[i * 3 + axis] > bound) posArray[i * 3 + axis] = -bound;
        if (posArray[i * 3 + axis] < -bound) posArray[i * 3 + axis] = bound;
      }
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;

    // Draw connections between nearby particles
    if (lineRef.current) {
      let lineIdx = 0;
      const maxDist = 2.2;
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = posArray[i * 3] - posArray[j * 3];
          const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
          const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < maxDist) {
            linePositions[lineIdx++] = posArray[i * 3];
            linePositions[lineIdx++] = posArray[i * 3 + 1];
            linePositions[lineIdx++] = posArray[i * 3 + 2];
            linePositions[lineIdx++] = posArray[j * 3];
            linePositions[lineIdx++] = posArray[j * 3 + 1];
            linePositions[lineIdx++] = posArray[j * 3 + 2];
          }
        }
      }
      for (let i = lineIdx; i < linePositions.length; i++) {
        linePositions[i] = 0;
      }
      lineRef.current.geometry.attributes.position.needsUpdate = true;
      lineRef.current.geometry.setDrawRange(0, lineIdx / 3);
    }

    // Gentle camera sway
    mesh.current.rotation.y = Math.sin(time * 0.15) * 0.1;
    mesh.current.rotation.x = Math.cos(time * 0.1) * 0.05;
    if (lineRef.current) {
      lineRef.current.rotation.y = mesh.current.rotation.y;
      lineRef.current.rotation.x = mesh.current.rotation.x;
    }
  });

  return (
    <>
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={count}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#22d3ee"
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <lineSegments ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
            count={linePositions.length / 3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </>
  );
}

export default function ParticleField() {
  const mouseRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Normalize to -1 to 1
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }, []);

  return (
    <div
      className="absolute inset-0 z-0"
      style={{ pointerEvents: "auto" }}
      onMouseMove={handleMouseMove}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <Particles count={100} mouse={mouseRef} />
      </Canvas>
    </div>
  );
}
