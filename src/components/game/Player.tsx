import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Group, Vector3, BackSide } from 'three';
import { Text } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';

export const LANE_WIDTH = 2.5;

export function Player() {
  const playerRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const textGroupRef = useRef<Group>(null);
  
  const lane = useGameStore((state) => state.lane);
  const status = useGameStore((state) => state.status);
  const speed = useGameStore((state) => state.speed);
  const level = useGameStore((state) => state.level);
  
  useFrame((state, delta) => {
    if (!playerRef.current || !bodyRef.current) return;
    
    // Smoothly interpolate to the target lane
    const targetX = lane * LANE_WIDTH;
    playerRef.current.position.x = MathUtils.lerp(playerRef.current.position.x, targetX, 10 * delta);
    
    // Scale based on level
    const targetScale = Math.min(2.5, Math.max(0.5, 0.8 + (level * 0.05)));
    bodyRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), 8 * delta);

    // Bouncing animation while running
    if (status === 'playing') {
      const time = state.clock.getElapsedTime();
      // Slide instead of jump
      bodyRef.current.position.y = 0.5 * targetScale;
      bodyRef.current.rotation.x = MathUtils.lerp(bodyRef.current.rotation.x, 0, 10 * delta);
      
      // Slight leaning when switching lanes
      const currentX = playerRef.current.position.x;
      const xDiff = targetX - currentX;
      playerRef.current.rotation.z = MathUtils.lerp(playerRef.current.rotation.z, -xDiff * 0.2, 10 * delta);
    } else if (status === 'gameover') {
      // Fall down on game over
      bodyRef.current.position.y = MathUtils.lerp(bodyRef.current.position.y, 0.2, 5 * delta);
      bodyRef.current.rotation.x = MathUtils.lerp(bodyRef.current.rotation.x, Math.PI / 2, 5 * delta);
    } else {
      // Idle bounce
      const time = state.clock.getElapsedTime();
      bodyRef.current.position.y = Math.sin(time * 3) * 0.1 + 0.5 * targetScale;
      bodyRef.current.rotation.x = 0;
      playerRef.current.rotation.z = 0;
    }
    if (textGroupRef.current) {
        textGroupRef.current.position.y = bodyRef.current.position.y + 0.7 * targetScale;
    }
  });

  return (
    <group ref={playerRef} position={[0, 0, 0]}>
      {/* Floating Level Text */}
      <group ref={textGroupRef}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.06}
          outlineColor="#333"
          fontWeight="900"
        >
          LVL {level}
        </Text>
      </group>

      <group ref={bodyRef}>
        {/* Main Body */}
        <mesh castShadow>
          <boxGeometry args={[0.8, 1, 0.6]} />
          <meshStandardMaterial color="#FF9800" />
        </mesh>
        
        {/* Outlines (using a slightly larger box with backside rendering or simply dark material parts, but for simplicity a rim or shadow) - Let's just represent the dark border with some dark accent meshes */}
        <mesh position={[0, 0, 0]}>
             <boxGeometry args={[0.85, 1.05, 0.55]} />
             <meshBasicMaterial color="#333" side={BackSide} />
        </mesh>

        {/* Eyes (Simple characterization) */}
        <group position={[0, 0.2, 0.31]}>
          <mesh position={[-0.2, 0, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="white" />
          </mesh>
          <mesh position={[-0.2, 0, 0.12]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color="black" />
          </mesh>
          
          <mesh position={[0.2, 0, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="white" />
          </mesh>
          <mesh position={[0.2, 0, 0.12]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color="black" />
          </mesh>
        </group>
        
        {/* Mouth */}
        <mesh position={[0, -0.2, 0.31]}>
           <capsuleGeometry args={[0.05, 0.1, 4, 8]} />
           <meshBasicMaterial color="black" />
        </mesh>
      </group>
    </group>
  );
}
