import { useRef, useState, Component, ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import type { Aisle, ShelfSlot } from "../data/mockData";

class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const STOCK_COLORS = {
  full: "#06b6d4",
  low: "#f59e0b",
  empty: "#ef4444",
};

function Product({ slot, x, y, z, onHover, onLeave, onClick, isSelected }: {
  slot: ShelfSlot; x: number; y: number; z: number;
  onHover: (slot: ShelfSlot) => void; onLeave: () => void;
  onClick: (slot: ShelfSlot) => void; isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (isSelected) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 1.5;
    } else {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
    }
    const targetScale = hovered || isSelected ? 1.1 : 1;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.15));
  });

  const color = STOCK_COLORS[slot.stock];
  const fillRatio = slot.quantity / slot.maxQuantity;
  const height = slot.stock === "empty" ? 0.02 : 0.35 * fillRatio + 0.05;

  if (slot.stock === "empty") {
    return (
      <group position={[x, y, z]}>
        <mesh>
          <boxGeometry args={[0.28, 0.02, 0.28]} />
          <meshStandardMaterial color="#1e293b" opacity={0.5} transparent />
        </mesh>
        <Text position={[0, 0.09, 0]} fontSize={0.06} color="#ef4444" anchorX="center" anchorY="middle">
          EMPTY
        </Text>
      </group>
    );
  }

  return (
    <group
      position={[x, y + height / 2 - 0.2, z]}
      onPointerEnter={() => { setHovered(true); onHover(slot); }}
      onPointerLeave={() => { setHovered(false); onLeave(); }}
      onClick={() => onClick(slot)}
    >
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.28, height, 0.28]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={hovered || isSelected ? 0.5 : 0.15}
        />
      </mesh>
      {(hovered || isSelected) && (
        <Text
          position={[0, height / 2 + 0.1, 0]}
          fontSize={0.06}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineColor="black"
          outlineWidth={0.005}
        >
          {slot.quantity}/{slot.maxQuantity}
        </Text>
      )}
    </group>
  );
}

function ShelfUnit({ aisle, onSlotHover, onSlotLeave, onSlotClick, selectedSlot }: {
  aisle: Aisle; onSlotHover: (s: ShelfSlot) => void; onSlotLeave: () => void;
  onSlotClick: (s: ShelfSlot) => void; selectedSlot: ShelfSlot | null;
}) {
  const COLS = 8; const ROWS = 3;
  const COL_WIDTH = 0.38; const ROW_HEIGHT = 0.5;
  const SHELF_DEPTH = 0.4;
  const totalWidth = COLS * COL_WIDTH;
  const totalHeight = ROWS * ROW_HEIGHT;

  return (
    <group>
      {/* Back */}
      <mesh position={[totalWidth / 2 - COL_WIDTH / 2, totalHeight / 2, -SHELF_DEPTH / 2]} receiveShadow>
        <boxGeometry args={[totalWidth + 0.05, totalHeight + 0.1, 0.04]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.5} emissive="#06b6d4" emissiveIntensity={0.02} />
      </mesh>
      {/* Sides */}
      {[0, totalWidth].map((xPos, i) => (
        <mesh key={i} position={[xPos - COL_WIDTH / 2 + (i === 0 ? -0.02 : 0.02), totalHeight / 2, 0]}>
          <boxGeometry args={[0.04, totalHeight + 0.1, SHELF_DEPTH]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.6} />
        </mesh>
      ))}
      {/* Shelf boards */}
      {Array.from({ length: ROWS + 1 }).map((_, rowIdx) => (
        <mesh key={rowIdx} position={[totalWidth / 2 - COL_WIDTH / 2, rowIdx * ROW_HEIGHT, 0]} receiveShadow>
          <boxGeometry args={[totalWidth + 0.04, 0.04, SHELF_DEPTH]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.5} emissive="#06b6d4" emissiveIntensity={0.04} />
        </mesh>
      ))}
      {/* Products */}
      {aisle.slots.map((slot) => (
        <Product
          key={slot.id}
          slot={slot}
          x={slot.col * COL_WIDTH}
          y={slot.row * ROW_HEIGHT + 0.2}
          z={0}
          onHover={onSlotHover}
          onLeave={onSlotLeave}
          onClick={onSlotClick}
          isSelected={selectedSlot?.id === slot.id}
        />
      ))}
    </group>
  );
}

function AlertIndicators({ aisle }: { aisle: Aisle }) {
  const ref = useRef<THREE.Group>(null);
  const emptySlots = aisle.slots.filter(s => s.stock === "empty");

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissiveIntensity = 0.5 + 0.5 * Math.sin(clock.getElapsedTime() * 3 + i);
        }
      });
    }
  });

  return (
    <group ref={ref}>
      {emptySlots.map((slot) => (
        <Float key={slot.id} speed={2} rotationIntensity={0} floatIntensity={0.4}>
          <mesh position={[slot.col * 0.38, slot.row * 0.5 + 0.75, 0.2]}>
            <octahedronGeometry args={[0.07]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.9} roughness={0} metalness={0.5} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Scene({ aisle, onSlotHover, onSlotLeave, onSlotClick, selectedSlot }: {
  aisle: Aisle; onSlotHover: (s: ShelfSlot) => void; onSlotLeave: () => void;
  onSlotClick: (s: ShelfSlot) => void; selectedSlot: ShelfSlot | null;
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[-2, 4, 3]} intensity={2} color="#06b6d4" />
      <pointLight position={[5, 4, 3]} intensity={1.5} color="#8b5cf6" />
      <directionalLight position={[0, 6, 4]} intensity={0.8} castShadow />
      <ShelfUnit aisle={aisle} onSlotHover={onSlotHover} onSlotLeave={onSlotLeave} onSlotClick={onSlotClick} selectedSlot={selectedSlot} />
      <AlertIndicators aisle={aisle} />
      <OrbitControls enablePan={true} enableZoom={true} minDistance={2} maxDistance={10}
        maxPolarAngle={Math.PI / 1.8} target={[1.3, 0.8, 0]} />
    </>
  );
}

function ShelfFallback2D({ aisle, selectedSlot, onSlotSelect }: Shelf3DProps) {
  const COLS = 8; const ROWS = 3;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 gap-4">
      <p className="text-white/30 text-xs">Interactive 3D View</p>
      <div className="space-y-2">
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} className="flex gap-1.5">
            {Array.from({ length: COLS }, (_, col) => {
              const slot = aisle.slots.find(s => s.row === row && s.col === col);
              if (!slot) return <div key={col} className="w-14 h-12 rounded bg-slate-800" />;
              const isSelected = selectedSlot?.id === slot.id;
              const bg = slot.stock === "full" ? "#06b6d4" : slot.stock === "low" ? "#f59e0b" : "#ef4444";
              return (
                <button
                  key={col}
                  onClick={() => onSlotSelect(isSelected ? null : slot)}
                  className={`w-14 h-12 rounded text-xs flex flex-col items-center justify-center transition-all ${isSelected ? "ring-2 ring-white scale-105" : "hover:scale-105"}`}
                  style={{ background: `${bg}22`, border: `1px solid ${bg}55`, boxShadow: isSelected ? `0 0 12px ${bg}66` : undefined }}
                >
                  <span className="font-bold" style={{ color: bg }}>{slot.quantity}</span>
                  <span className="text-white/40 text-[9px]">{slot.stock}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

interface Shelf3DProps {
  aisle: Aisle;
  selectedSlot: ShelfSlot | null;
  onSlotSelect: (slot: ShelfSlot | null) => void;
}

export default function Shelf3D({ aisle, selectedSlot, onSlotSelect }: Shelf3DProps) {
  const [hoveredSlot, setHoveredSlot] = useState<ShelfSlot | null>(null);

  return (
    <div className="relative w-full h-full canvas-container">
      <WebGLErrorBoundary fallback={<ShelfFallback2D aisle={aisle} selectedSlot={selectedSlot} onSlotSelect={onSlotSelect} />}>
        <Canvas shadows camera={{ position: [1.3, 1.5, 4.5], fov: 50 }}
          style={{ background: "linear-gradient(180deg, #050b14 0%, #0a1628 100%)" }}>
          <Scene
            aisle={aisle}
            onSlotHover={setHoveredSlot}
            onSlotLeave={() => setHoveredSlot(null)}
            onSlotClick={(slot) => onSlotSelect(selectedSlot?.id === slot.id ? null : slot)}
            selectedSlot={selectedSlot}
          />
        </Canvas>
      </WebGLErrorBoundary>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-3 glass rounded-lg px-3 py-2 border border-white/10">
        {[{ label: "Full", color: "#06b6d4" }, { label: "Low", color: "#f59e0b" }, { label: "Empty", color: "#ef4444" }].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color, boxShadow: `0 0 6px ${color}88` }} />
            <span className="text-xs text-white/60">{label}</span>
          </div>
        ))}
      </div>

      {hoveredSlot && !selectedSlot && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 glass border border-white/15 text-white text-xs rounded-xl px-4 py-2.5 pointer-events-none shadow-xl">
          <div className="font-bold">{hoveredSlot.name}</div>
          <div className="text-white/50 mt-0.5">{hoveredSlot.sku} · ${hoveredSlot.price} · {hoveredSlot.compliant ? "✓ Compliant" : "✗ Violation"}</div>
        </div>
      )}

      <div className="absolute top-3 right-3 glass border border-white/10 text-xs text-white/30 rounded-lg px-2 py-1">
        Drag · Zoom · Click
      </div>
    </div>
  );
}
