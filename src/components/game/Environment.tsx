import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

const ROAD_LENGTH = 100;

export function Environment() {
  const roadRef1 = useRef<THREE.Group>(null);
  const roadRef2 = useRef<THREE.Group>(null);
  
  const status = useGameStore((state) => state.status);
  const speed = useGameStore((state) => state.speed);

  useFrame((_, delta) => {
    if (status !== 'playing') return;
    
    const moveDistance = speed * delta;
    
    // Move roads towards the player (simulating running forward)
    if (roadRef1.current && roadRef2.current) {
      roadRef1.current.position.z += moveDistance;
      roadRef2.current.position.z += moveDistance;

      // Reset positions to loop infinitely
      if (roadRef1.current.position.z > ROAD_LENGTH) {
        roadRef1.current.position.z = roadRef2.current.position.z - ROAD_LENGTH;
      }
      if (roadRef2.current.position.z > ROAD_LENGTH) {
        roadRef2.current.position.z = roadRef1.current.position.z - ROAD_LENGTH;
      }
    }
  });

  const RoadSegment = () => (
    <group>
      {/* Main road base */}
      <mesh receiveShadow position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, ROAD_LENGTH]} />
        <meshStandardMaterial color="#555555" roughness={0.8} />
      </mesh>
      {/* Left yellow border */}
      <mesh receiveShadow position={[-5, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, ROAD_LENGTH]} />
        <meshStandardMaterial color="#FFD700" roughness={0.8} />
      </mesh>
      {/* Right yellow border */}
      <mesh receiveShadow position={[5, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, ROAD_LENGTH]} />
        <meshStandardMaterial color="#FFD700" roughness={0.8} />
      </mesh>
      {/* Dashed line in the middle separating 2 lanes */}
      <mesh receiveShadow position={[0, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, ROAD_LENGTH]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} roughness={0.8} />
      </mesh>
    </group>
  );

  return (
    <group>
      {/* Grass/Scenery Base */}
      <mesh receiveShadow position={[0, -0.3, -50]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#4CAF50" roughness={1} />
      </mesh>

      {/* Road Segment 1 */}
      <group ref={roadRef1} position={[0, 0, -ROAD_LENGTH/2]}>
         <RoadSegment />
      </group>
      
      {/* Road Segment 2 */}
      <group ref={roadRef2} position={[0, 0, -ROAD_LENGTH * 1.5]}>
         <RoadSegment />
      </group>
    </group>
  );
}
