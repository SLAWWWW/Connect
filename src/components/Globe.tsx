import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { api } from '@/lib/api';
import type { Group, GroupRecommendation } from '@/types';

const GLOBE_RADIUS = 2;
const NODE_COUNT = 60;
const CONNECTION_DISTANCE = 1.2;

const DRAG_SENSITIVITY = 0.004;
const NODE_RADIUS = 0.04;
const NODE_HIT_RADIUS = 0.13; // larger hover range
const NODE_HOVER_SCALE = 1.8;

function Nodes({
  groups,
  recommendedGroupIds,
}: {
  groups: Group[];
  recommendedGroupIds: Set<string>;
}) {
  const points = useMemo(() => {
    const temp: THREE.Vector3[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / NODE_COUNT);
      const theta = Math.sqrt(NODE_COUNT * Math.PI) * phi;
      const x = GLOBE_RADIUS * Math.cos(theta) * Math.sin(phi);
      const y = GLOBE_RADIUS * Math.sin(theta) * Math.sin(phi);
      const z = GLOBE_RADIUS * Math.cos(phi);
      temp.push(new THREE.Vector3(x, y, z));
    }
    return temp;
  }, []);

  const connections = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (points[i].distanceTo(points[j]) < CONNECTION_DISTANCE) {
          lines.push([points[i], points[j]]);
        }
      }
    }
    return lines;
  }, [points]);

  // One (random) room per dot, stable for this session.
  const liveGroups = useMemo(
    () => groups.filter((g) => g.members.length < g.max_members),
    [groups]
  );
  const groupPerNode = useMemo(() => {
    if (liveGroups.length === 0) return () => null as Group | null;
    const shuffled = [...liveGroups].sort(() => Math.random() - 0.5);
    return (nodeIndex: number): Group | null =>
      shuffled[nodeIndex % shuffled.length] ?? null;
  }, [liveGroups]);

  const [hoveredNodeIndex, setHoveredNodeIndex] = useState<number | null>(null);

  const groupRef = useRef<THREE.Group>(null);
  const rotationX = useRef(0);
  const rotationY = useRef(0);
  const lastPointer = useRef({ x: 0, y: 0 });
  const pointerDownRef = useRef(false);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDownRef.current || !groupRef.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      rotationY.current += dx * DRAG_SENSITIVITY;
      rotationX.current += dy * DRAG_SENSITIVITY;
      rotationX.current = THREE.MathUtils.clamp(
        rotationX.current,
        -Math.PI / 2 + 0.1,
        Math.PI / 2 - 0.1
      );
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      pointerDownRef.current = false;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointerleave', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointerleave', onPointerUp);
    };
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    // No auto movement at all; only drag updates these refs.
    groupRef.current.rotation.x = rotationX.current;
    groupRef.current.rotation.y = rotationY.current;
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    pointerDownRef.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const hoveredPoint = hoveredNodeIndex !== null ? points[hoveredNodeIndex] : null;
  const hoveredGroup = hoveredNodeIndex !== null ? groupPerNode(hoveredNodeIndex) : null;
  const hoveredTooltipPos = useMemo(() => {
    if (hoveredPoint === null) return null;
    // Nudge outward + sideways so the card is beside the dot (not covering it).
    const outward = hoveredPoint.clone().normalize().multiplyScalar(0.28);
    const side = new THREE.Vector3(0.18, 0.12, 0);
    return hoveredPoint.clone().add(outward).add(side);
  }, [hoveredPoint]);

  return (
    <group ref={groupRef}>
      {/* Invisible drag surface */} 
      <mesh onPointerDown={handlePointerDown}>
        <sphereGeometry args={[GLOBE_RADIUS + 0.2, 32, 32]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Globe Core */}
      <Sphere args={[GLOBE_RADIUS - 0.1, 32, 32]}>
        <meshStandardMaterial
          color="#0f172a"
          transparent
          opacity={0.8}
          roughness={0.7}
          metalness={0.5}
        />
      </Sphere>

      {/* Nodes */}
      {points.map((point, i) => {
        const assigned = groupPerNode(i);
        const isRecommended = assigned ? recommendedGroupIds.has(assigned.id) : false;
        const dotColor = isRecommended ? '#FF8800' : '#00CCFF';
        const isHovered = hoveredNodeIndex === i;

        return (
          <group key={i} position={point}>
            {/* Large invisible hit area to avoid twitchy hover */}
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
                setHoveredNodeIndex(i);
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
                setHoveredNodeIndex(null);
              }}
            >
              <sphereGeometry args={[NODE_HIT_RADIUS, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Visual dot */}
            <mesh scale={isHovered ? NODE_HOVER_SCALE : 1}>
              <sphereGeometry args={[NODE_RADIUS, 16, 16]} />
              <meshBasicMaterial color={dotColor} />
            </mesh>
          </group>
        );
      })}

      {/* Connections */}
      {connections.map((line, i) => (
        <Line
          key={i}
          points={line}
          color="#00CCFF"
          transparent
          opacity={0.15}
          lineWidth={1}
        />
      ))}

      {/* Hover: single live room for this node (beside the dot) */}
      {hoveredTooltipPos !== null && (
        <Html position={hoveredTooltipPos} center distanceFactor={8}>
          <div className="pointer-events-none min-w-[180px] rounded-lg border border-primary/40 bg-black/80 px-3 py-2 shadow-xl backdrop-blur-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Live room</div>
            {hoveredGroup === null ? (
              <div className="mt-1 text-xs text-white/70">No room here right now</div>
            ) : (
              <div className="mt-1 text-xs text-white/90">
                {hoveredGroup.name} ({hoveredGroup.members.length}/{hoveredGroup.max_members})
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function Globe() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [recommendedGroupIds, setRecommendedGroupIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const [groupsRes, recRes] = await Promise.all([
          api.get<Group[]>('/api/v1/groups/'),
          api.get<GroupRecommendation[]>('/api/v1/groups/recommended', { params: { limit: 12 } }),
        ]);

        setGroups(groupsRes.data ?? []);
        const ids = new Set<string>(
          (recRes.data ?? [])
            .slice()
            .sort((a, b) => (b.relevance_score ?? 0) - (a.relevance_score ?? 0))
            .map((g) => g.id)
        );
        setRecommendedGroupIds(ids);
      } catch {
        setGroups([]);
        setRecommendedGroupIds(new Set());
      }
    };
    load();
  }, []);

  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00CCFF" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF8800" />
        <Nodes groups={groups} recommendedGroupIds={recommendedGroupIds} />
      </Canvas>
    </div>
  );
}
