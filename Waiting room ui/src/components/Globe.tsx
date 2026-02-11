import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

const GLOBE_RADIUS = 2;
const NODE_COUNT = 60;
const CONNECTION_DISTANCE = 1.2;

function Nodes({ onHover }: { onHover: (hovered: boolean) => void }) {
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

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
      // Mouse interaction for tilt
      const { x, y } = state.mouse;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, y * 0.2, 0.1);
      groupRef.current.rotation.y += x * 0.005;
    }
  });

  return (
    <group ref={groupRef}>
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
      {points.map((point, i) => (
        <mesh 
            key={i} 
            position={point}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; onHover(true); }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; onHover(false); }}
        >
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color={i % 5 === 0 ? "#FF8800" : "#00CCFF"} />
        </mesh>
      ))}

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
    </group>
  );
}

export default function Globe() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="w-full h-full absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00CCFF" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF8800" />
            <Nodes onHover={setHovered} />
            <Html position={[0, -2.5, 0]} center>
                <div className={`transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'} text-primary font-bold text-sm bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-primary/30`}>
                    CONNECTING...
                </div>
            </Html>
        </Canvas>
    </div>
  );
}
