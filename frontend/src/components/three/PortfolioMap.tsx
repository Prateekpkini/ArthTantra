"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

interface HoldingData {
  name: string;
  sector: string;
  value: number;
  returns: number;
  allocation: number;
}

interface PortfolioMapProps {
  holdings?: HoldingData[];
}

/* ─── Terrain Mesh ────────────────────────────────────────────────── */
function Terrain({ holdings }: { holdings: HoldingData[] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const segments = 64;

  const { geometry, colorArray, peakPositions } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(10, 10, segments, segments);
    const positions = geo.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    // Create height data from holdings
    const peaks: { x: number; z: number; height: number; holding: HoldingData }[] = [];
    holdings.forEach((h, i) => {
      const angle = (i / holdings.length) * Math.PI * 2;
      const radius = 2 + (h.allocation / 30) * 2;
      peaks.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        height: (h.value / 250000) * 2,
        holding: h,
      });
    });

    // Displace vertices
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getY(i); // PlaneGeometry Y = world Z after rotation
      let height = 0;

      // Gaussian peaks for each holding
      for (const peak of peaks) {
        const dx = x - peak.x;
        const dz = z - peak.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const sigma = 1.2;
        height += peak.height * Math.exp(-(dist * dist) / (2 * sigma * sigma));
      }

      // Add some Perlin-like noise for texture
      height += Math.sin(x * 2) * Math.cos(z * 2) * 0.05;
      height += Math.sin(x * 5 + z * 3) * 0.02;

      positions.setZ(i, height);

      // Color based on height
      const t = Math.min(height / 2, 1);
      if (t < 0.2) {
        colors[i * 3] = 0.06;     // R - deep blue
        colors[i * 3 + 1] = 0.09;
        colors[i * 3 + 2] = 0.25;
      } else if (t < 0.5) {
        colors[i * 3] = 0.06 + t * 0.3;
        colors[i * 3 + 1] = 0.2 + t * 0.5;
        colors[i * 3 + 2] = 0.8;
      } else if (t < 0.8) {
        colors[i * 3] = 0.1 + t * 0.5;
        colors[i * 3 + 1] = 0.7;
        colors[i * 3 + 2] = 0.4;
      } else {
        colors[i * 3] = 0.9;
        colors[i * 3 + 1] = 0.3 + (1 - t) * 0.5;
        colors[i * 3 + 2] = 0.1;
      }
    }

    geo.computeVertexNormals();
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return {
      geometry: geo,
      colorArray: colors,
      peakPositions: peaks,
    };
  }, [holdings]);

  // Subtle animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
      >
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          wireframe={false}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Contour wireframe overlay */}
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.48, 0]}
      >
        <meshBasicMaterial
          wireframe
          color="#8B5CF6"
          opacity={0.08}
          transparent
        />
      </mesh>

      {/* Peak labels */}
      {peakPositions.map((peak, i) => (
        <Html
          key={i}
          position={[peak.x, peak.height + 0.3, -peak.z]}
          center
          distanceFactor={8}
        >
          <div
            className="text-center pointer-events-none select-none"
            style={{
              background: "rgba(10, 14, 26, 0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: "8px",
              padding: "4px 8px",
              whiteSpace: "nowrap",
            }}
          >
            <p
              className="text-[10px] font-semibold"
              style={{
                color: peak.holding.returns >= 0 ? "#10B981" : "#F43F5E",
              }}
            >
              {peak.holding.returns >= 0 ? "▲" : "▼"}{" "}
              {Math.abs(peak.holding.returns)}%
            </p>
            <p
              className="text-[9px]"
              style={{ color: "var(--text-secondary)" }}
            >
              {peak.holding.name.length > 15
                ? peak.holding.name.slice(0, 15) + "…"
                : peak.holding.name}
            </p>
            <p
              className="text-[10px] font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              ₹{(peak.holding.value / 1000).toFixed(0)}K
            </p>
          </div>
        </Html>
      ))}
    </group>
  );
}

/* ─── Main Component ──────────────────────────────────────────────── */
const defaultHoldings: HoldingData[] = [
  { name: "Nifty 50 Index", sector: "index", value: 250000, returns: 14.2, allocation: 25 },
  { name: "HDFC Bank", sector: "banking", value: 120000, returns: 8.5, allocation: 12 },
  { name: "Infosys", sector: "tech", value: 95000, returns: 22.1, allocation: 9.5 },
  { name: "Reliance", sector: "conglomerate", value: 85000, returns: -3.2, allocation: 8.5 },
  { name: "TCS", sector: "tech", value: 78000, returns: 11.7, allocation: 7.8 },
  { name: "SBI", sector: "banking", value: 65000, returns: 18.4, allocation: 6.5 },
  { name: "Bajaj Finance", sector: "finance", value: 55000, returns: -8.1, allocation: 5.5 },
  { name: "PPF", sector: "fixed", value: 80000, returns: 7.1, allocation: 8 },
  { name: "Gold ETF", sector: "commodity", value: 60000, returns: 24.5, allocation: 6 },
  { name: "Crypto", sector: "crypto", value: 17000, returns: 45.2, allocation: 1.7 },
];

export default function PortfolioMap({ holdings }: PortfolioMapProps) {
  const data = holdings || defaultHoldings;
  const totalValue = data.reduce((sum, h) => sum + h.value, 0);

  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
            style={{ background: "rgba(6, 182, 212, 0.15)" }}
          >
            🌐
          </div>
          <h3
            className="text-sm font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Spatial Portfolio Map
          </h3>
        </div>
        <div className="text-right">
          <p
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Total Value
          </p>
          <p
            className="text-sm font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--accent-cyan)" }}
          >
            ₹{(totalValue / 100000).toFixed(1)}L
          </p>
        </div>
      </div>

      <div
        className="three-canvas-container flex-1 rounded-xl"
        style={{ minHeight: "250px" }}
      >
        <Canvas
          camera={{ position: [6, 5, 6], fov: 45 }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={0.8} />
          <pointLight position={[-3, 5, -3]} intensity={0.3} color="#8B5CF6" />
          <pointLight position={[3, 4, 3]} intensity={0.2} color="#06B6D4" />
          <Terrain holdings={data} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={4}
            maxDistance={12}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate
            autoRotateSpeed={0.5}
          />
          {/* Grid helper */}
          <gridHelper args={[10, 20, "#1e293b", "#1e293b"]} position={[0, -0.5, 0]} />
        </Canvas>
      </div>
    </div>
  );
}
