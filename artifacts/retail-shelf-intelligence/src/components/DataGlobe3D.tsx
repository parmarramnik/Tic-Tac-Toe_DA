import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Component, ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? this.props.fallback : this.props.children; }
}

const DATA_POINTS = Array.from({ length: 40 }, (_, i) => {
  const phi = Math.acos(-1 + (2 * i) / 40);
  const theta = Math.sqrt(40 * Math.PI) * phi;
  return {
    x: Math.sin(phi) * Math.cos(theta),
    y: Math.sin(phi) * Math.sin(theta),
    z: Math.cos(phi),
    color: i % 3 === 0 ? "#06b6d4" : i % 3 === 1 ? "#8b5cf6" : "#22d3ee",
    size: Math.random() * 0.05 + 0.03,
  };
});

function GlobeCore() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.18;
      groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.15;
    }
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + 0.2 * Math.sin(t * 1.5);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.3;
      ringRef.current.rotation.x = t * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.2;
      ring2Ref.current.rotation.y = t * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Globe wireframe */}
      <mesh>
        <sphereGeometry args={[1.2, 24, 24]} />
        <meshStandardMaterial color="#06b6d4" wireframe opacity={0.12} transparent />
      </mesh>

      {/* Core sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial
          color="#050b14"
          emissive="#06b6d4"
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Data points */}
      {DATA_POINTS.map((p, i) => (
        <mesh key={i} position={[p.x * 1.22, p.y * 1.22, p.z * 1.22]}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={0.8}
            roughness={0}
          />
        </mesh>
      ))}

      {/* Orbit ring 1 */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.012, 8, 80]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.6} />
      </mesh>

      {/* Orbit ring 2 */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.9, 0.008, 8, 80]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} />
      </mesh>

      {/* Connecting lines (simulated as cylinders) */}
      {DATA_POINTS.slice(0, 12).map((p, i) => {
        const next = DATA_POINTS[(i + 7) % DATA_POINTS.length];
        const start = new THREE.Vector3(p.x * 1.22, p.y * 1.22, p.z * 1.22);
        const end = new THREE.Vector3(next.x * 1.22, next.y * 1.22, next.z * 1.22);
        const mid = start.clone().lerp(end, 0.5);
        const len = start.distanceTo(end);
        const dir = end.clone().sub(start).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        return (
          <mesh key={`line-${i}`} position={[mid.x, mid.y, mid.z]} quaternion={q}>
            <cylinderGeometry args={[0.004, 0.004, len, 4]} />
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.4} transparent opacity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function DataGlobe3D({ className = "" }: { className?: string }) {
  return (
    <ErrorBoundary fallback={
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="w-32 h-32 rounded-full border-2 border-cyan-500/30 animate-spin" style={{ borderTopColor: "#06b6d4" }} />
      </div>
    }>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
        className={className}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[3, 3, 3]} intensity={2} color="#06b6d4" />
        <pointLight position={[-3, -2, -2]} intensity={1.5} color="#8b5cf6" />
        <GlobeCore />
      </Canvas>
    </ErrorBoundary>
  );
}
