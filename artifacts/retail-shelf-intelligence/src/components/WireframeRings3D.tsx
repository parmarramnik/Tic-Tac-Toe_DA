import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Component, ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}

function Ring({ radius, tube, speed, tiltX, tiltZ, color }: {
  radius: number; tube: number; speed: number; tiltX: number; tiltZ: number; color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * speed;
    }
  });
  return (
    <mesh ref={ref} rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, tube, 3, 80]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.7}
        roughness={0}
        metalness={1}
        transparent
        opacity={0.6}
        wireframe={false}
      />
    </mesh>
  );
}

function CoreSphere() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + 0.3 * Math.sin(t * 2);
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.5, 2]} />
      <meshStandardMaterial
        color="#06b6d4"
        emissive="#06b6d4"
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const positions = new Float32Array(150 * 3);
  for (let i = 0; i < 150; i++) {
    const r = 2.5 + Math.random() * 1.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.05;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#06b6d4" size={0.05} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function WireframeRings3D({ className = "" }: { className?: string }) {
  return (
    <ErrorBoundary fallback={<div className={className} />}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
        className={className}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[2, 2, 2]} intensity={2} color="#06b6d4" />
        <pointLight position={[-2, -2, 1]} intensity={1.5} color="#8b5cf6" />
        <CoreSphere />
        <Ring radius={1.2} tube={0.015} speed={0.4} tiltX={Math.PI / 4} tiltZ={0} color="#06b6d4" />
        <Ring radius={1.6} tube={0.01} speed={-0.3} tiltX={-Math.PI / 6} tiltZ={Math.PI / 5} color="#8b5cf6" />
        <Ring radius={2.0} tube={0.008} speed={0.2} tiltX={Math.PI / 3} tiltZ={-Math.PI / 4} color="#22d3ee" />
        <Ring radius={2.4} tube={0.006} speed={-0.15} tiltX={0} tiltZ={Math.PI / 3} color="#a78bfa" />
        <Particles />
      </Canvas>
    </ErrorBoundary>
  );
}
