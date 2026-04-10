import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Component, ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}

const SHELF_DATA = [
  [1, 0.4, 1, 0.8, 0.2, 1, 0.6, 1],
  [0.9, 1, 0.3, 1, 1, 0.5, 0.9, 0.7],
  [1, 0.7, 0.8, 0.2, 0.9, 1, 0.4, 1],
];

const COLORS = ["#06b6d4", "#8b5cf6", "#22d3ee", "#a78bfa", "#ef4444", "#f59e0b"];

function ShelfProduct({ x, y, fill, colorIdx }: { x: number; y: number; fill: number; colorIdx: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = fill < 0.3 ? "#ef4444" : fill < 0.6 ? "#f59e0b" : COLORS[colorIdx % COLORS.length];
  const height = fill < 0.1 ? 0.05 : fill * 0.4 + 0.05;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = y + height / 2 - 0.2 + Math.sin(clock.getElapsedTime() * 0.5 + x) * 0.005;
  });

  if (fill < 0.05) return null;
  return (
    <mesh ref={meshRef} position={[x, y + height / 2 - 0.2, 0]} castShadow>
      <boxGeometry args={[0.26, height, 0.26]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.3}
        emissive={color}
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

function FloatingOrb({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 0.7 + position[0]) * 0.15;
    ref.current.rotation.z = clock.getElapsedTime() * 0.3;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <MeshDistortMaterial color={color} distort={0.4} speed={2} roughness={0} metalness={0.5} emissive={color} emissiveIntensity={0.4} />
    </mesh>
  );
}

function AnimatedShelf() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.15;
    groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.03;
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* Shelf frame */}
      {[0, 1, 2, 3].map((row) => (
        <mesh key={row} position={[1.38, row * 0.5 - 0.3, 0]}>
          <boxGeometry args={[3.2, 0.04, 0.4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.8} emissive="#06b6d4" emissiveIntensity={0.05} />
        </mesh>
      ))}
      {/* Products */}
      {SHELF_DATA.map((row, rowIdx) =>
        row.map((fill, colIdx) => (
          <ShelfProduct
            key={`${rowIdx}-${colIdx}`}
            x={colIdx * 0.38 - 0.01}
            y={rowIdx * 0.5}
            fill={fill}
            colorIdx={colIdx + rowIdx}
          />
        ))
      )}
      {/* Floating orbs */}
      <FloatingOrb position={[-1, 2, 0.5]} color="#06b6d4" scale={0.8} />
      <FloatingOrb position={[3, 2.2, 0.3]} color="#8b5cf6" scale={0.6} />
      <FloatingOrb position={[1, 2.5, 0.6]} color="#22d3ee" scale={0.5} />
    </group>
  );
}

function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[-2, 3, 3]} intensity={2} color="#06b6d4" />
      <pointLight position={[4, 3, 2]} intensity={1.5} color="#8b5cf6" />
      <directionalLight position={[0, 5, 5]} intensity={0.8} castShadow />
      <AnimatedShelf />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.8}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

function Fallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-8 gap-1.5 p-6">
        {SHELF_DATA.flat().map((fill, i) => (
          <div
            key={i}
            className="w-8 h-10 rounded transition-all"
            style={{
              background: fill < 0.3 ? "#ef4444" : fill < 0.6 ? "#f59e0b" : "#06b6d4",
              opacity: fill < 0.05 ? 0.2 : 0.6 + fill * 0.4,
              boxShadow: `0 0 8px ${fill < 0.3 ? "#ef4444" : "#06b6d4"}44`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function HeroShelf3D() {
  return (
    <ErrorBoundary fallback={<Fallback />}>
      <Canvas
        camera={{ position: [1.5, 1.5, 5], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <HeroScene />
      </Canvas>
    </ErrorBoundary>
  );
}
