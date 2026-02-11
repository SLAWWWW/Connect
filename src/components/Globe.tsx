import { useRef, useMemo, useState, useEffect } from 'react';
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
const NODE_HIT_RADIUS = 0.13; // larger hover range to avoid flicker
const NODE_HOVER_SCALE = 1.8;

// Helper function to interpolate color from green to red based on score (0-1)
function getScoreColor(score: number): string {
  // Clamp score between 0 and 1
  const clampedScore = Math.max(0, Math.min(1, score));

  // Green (high match) to Yellow to Red (low match)
  // Green: rgb(34, 197, 94) - #22c55e
  // Yellow: rgb(234, 179, 8) - #eab308
  // Red: rgb(239, 68, 68) - #ef4444

  if (clampedScore > 0.5) {
    // Interpolate from yellow to green (score 0.5 to 1.0)
    const t = (clampedScore - 0.5) * 2; // normalize to 0-1, where 0=yellow, 1=green
    const r = Math.round(234 + (34 - 234) * t);
    const g = Math.round(179 + (197 - 179) * t);
    const b = Math.round(8 + (94 - 8) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Interpolate from red to yellow (score 0 to 0.5)
    const t = clampedScore * 2; // normalize to 0-1, where 0=red, 1=yellow
    const r = Math.round(239 + (234 - 239) * t);
    const g = Math.round(68 + (179 - 68) * t);
    const b = Math.round(68 + (8 - 68) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

function Nodes({
  groups,
  recommendedGroups,
  hoveredNodeIndex,
  setHoveredNodeIndex,
  isDraggingRef,
  onNodeClick,
}: {
  groups: Group[];
  recommendedGroups: GroupRecommendation[];
  hoveredNodeIndex: number | null;
  setHoveredNodeIndex: (i: number | null) => void;
  isDraggingRef: React.MutableRefObject<boolean>;
  onNodeClick?: (group: Group | null) => void;
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

  const liveGroups = useMemo(
    () => groups.filter((g) => g.members.length < g.max_members),
    [groups]
  );

  // Create a map of group ID to match score
  const groupScores = useMemo(() => {
    const scoreMap = new Map<string, number>();
    recommendedGroups.forEach(rec => {
      scoreMap.set(rec.id, rec.relevance_score ?? 0);
    });
    return scoreMap;
  }, [recommendedGroups]);

  const groupPerNode = useMemo(() => {
    if (liveGroups.length === 0) return () => null as Group | null;
    const shuffled = [...liveGroups].sort(() => Math.random() - 0.5);
    return (nodeIndex: number): Group | null =>
      shuffled[nodeIndex % shuffled.length] ?? null;
  }, [liveGroups]);

  const groupRef = useRef<THREE.Group>(null);
  const rotationX = useRef(0);
  const rotationY = useRef(0);
  const lastPointer = useRef({ x: 0, y: 0 });
  const pointerDownRef = useRef(false);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDownRef.current || !groupRef.current) return;
      isDraggingRef.current = true;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      rotationY.current += dx * DRAG_SENSITIVITY;
      rotationX.current += dy * DRAG_SENSITIVITY;
      rotationX.current = THREE.MathUtils.clamp(rotationX.current, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      pointerDownRef.current = false;
      isDraggingRef.current = false;
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointerleave', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointerleave', onPointerUp);
    };
  }, [isDraggingRef]);

  useFrame(() => {
    if (!groupRef.current) return;
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

      {/* Nodes — larger invisible hover target + visual dot */}
      {points.map((point, i) => {
        const assigned = groupPerNode(i);
        const matchScore = assigned ? (groupScores.get(assigned.id) ?? 0) : 0;
        const dotColor = getScoreColor(matchScore);
        const isHovered = hoveredNodeIndex === i;
        return (
          <group key={i} position={point}>
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
              onClick={(e) => {
                e.stopPropagation();
                if (!isDraggingRef.current && onNodeClick) {
                  onNodeClick(assigned);
                }
              }}
            >
              <sphereGeometry args={[NODE_HIT_RADIUS, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
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

      {/* Hover: single live room for this node */}
      {hoveredPoint !== null && (
        <Html
          position={hoveredPoint}
          center
          distanceFactor={8}
          style={{ transform: 'translate(28px, -22px)' }}
        >
          <div className="pointer-events-none min-w-[180px] rounded-lg border border-primary/40 bg-black/80 px-3 py-2 shadow-xl backdrop-blur-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Live room</div>
            {hoveredGroup === null ? (
              <div className="mt-1 text-xs text-white/70">No room here right now</div>
            ) : (
              <div className="mt-1 text-xs text-white/90">
                {hoveredGroup.name} ({hoveredGroup.members.length}/{hoveredGroup.max_members})
              </div>
            )}
            <div className="mt-1 text-[10px] text-primary/60 uppercase">Click to enter</div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function Globe({ onNodeClick }: { onNodeClick?: (group: Group | null) => void }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [hoveredNodeIndex, setHoveredNodeIndex] = useState<number | null>(null);
  const isDraggingRef = useRef(false);
  const [recommendedGroups, setRecommendedGroups] = useState<GroupRecommendation[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [groupsRes, recRes] = await Promise.all([
          api.get<Group[]>('/api/v1/groups/'),
          api.get<GroupRecommendation[]>('/api/v1/groups/recommended', { params: { limit: 12 } }),
        ]);
        setGroups(groupsRes.data ?? []);
        const sorted = (recRes.data ?? [])
          .slice()
          .sort((a, b) => (b.relevance_score ?? 0) - (a.relevance_score ?? 0));
        setRecommendedGroups(sorted);
      } catch {
        setGroups([]);
        setRecommendedGroups([]);
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
        <Nodes
          groups={groups}
          recommendedGroups={recommendedGroups}
          hoveredNodeIndex={hoveredNodeIndex}
          setHoveredNodeIndex={setHoveredNodeIndex}
          isDraggingRef={isDraggingRef}
          onNodeClick={onNodeClick}
        />
      </Canvas>
    </div>
  );
}
