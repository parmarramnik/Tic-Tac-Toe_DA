import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Text } from "@react-three/drei";
import * as THREE from "three";
import { Component, ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}

const PRODUCTS = [
  { label: "SKU-001", color: "#06b6d4", pos: [-3, 1.5, -1] as [number, number, number], scale: 0.55, speed: 1.2 },
  { label: "SKU-007", color: "#8b5cf6", pos: [3, 0.5, -0.5] as [number, number, number], scale: 0.45, speed: 0.9 },
  { label: "SKU-012", color: "#22d3ee", pos: [-2.5, -1.5, 0] as [number, number, number], scale: 0.4, speed: 1.5 },
  { label: "SKU-003", color: "#a78bfa", pos: [2.5, 1.8, -1] as [number, number, number], scale: 0.5, speed: 1.1 },
  { label: "SKU-008", color: "#06b6d4", pos: [-1.5, 2.2, -0.5] as [number, number, number], scale: 0.35, speed: 1.4 },
  { label: "SKU-005", color: "#8b5cf6", pos: [1.2, -2, 0.5] as [number, number, number], scale: 0.42, speed: 0.8 },
];

function ProductBox({ label, color, pos, scale, speed }: typeof PRODUCTS[0]) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.x = t * speed * 0.3;
    meshRef.current.rotation.y = t * speed * 0.4;
    meshRef.current.rotation.z = t * speed * 0.15;
  });

  return (
    <Float speed={speed} rotationIntensity={0} floatIntensity={0.6}>
      <group position={pos} scale={scale}>
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={[1, 1.4, 0.5]} />
          <meshStandardMaterial
            color={color}
            roughness={0.1}
            metalness={0.6}
            emissive={color}
            emissiveIntensity={0.25}
            transparent
            opacity={0.85}
          />
        </mesh>
        <Text
          position={[0, 0, 0.26]}
          fontSize={0.18}
          color="white"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {label}
        </Text>
        {/* Glow sphere */}
        <mesh>
          <sphereGeometry args={[0.65, 16, 16]} />
          <meshStandardMaterial color={color} transparent opacity={0.04} />
        </mesh>
      </group>
    </Float>
  );
}

function OrbitalRing({ radius, speed, color, tilt }: { radius: number; speed: number; color: string; tilt: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.006, 8, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.4} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 5]} intensity={1.5} color="#06b6d4" />
      <pointLight position={[0, 5, -2]} intensity={1} color="#8b5cf6" />
      {PRODUCTS.map((p) => <ProductBox key={p.label} {...p} />)}
      <OrbitalRing radius={3.5} speed={0.1} color="#06b6d4" tilt={0.4} />
      <OrbitalRing radius={2.8} speed={-0.15} color="#8b5cf6" tilt={-0.6} />
      <OrbitalRing radius={4.2} speed={0.08} color="#22d3ee" tilt={1.0} />
    </>
  );
}

export default function FloatingProducts3D({ className = "" }: { className?: string }) {
  return (
    <ErrorBoundary fallback={<div className={className} />}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
        className={className}
      >
        <Scene />
      </Canvas>
    </ErrorBoundary>
  );
}
