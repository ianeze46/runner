import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Player } from './Player';
import { Environment } from './Environment';
import { GateManager } from './GateManager';
import { useGameStore } from '../../store/gameStore';

function GameLoop() {
  const status = useGameStore((state) => state.status);
  const updateDistance = useGameStore((state) => state.updateDistance);

  useFrame((_, delta) => {
    // Cap delta to prevent massive jumps when tab is inactive
    const safeDelta = Math.min(delta, 0.1); 
    if (status === 'playing') {
      updateDistance(safeDelta);
    }
  });

  return null;
}

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    // Move the camera further back and slightly higher up to see more track
    camera.position.set(0, 7, 14);
    // Look further ahead and slightly up to shift player and track down the screen,
    // getting them away from the top-left UI.
    camera.lookAt(0, 2, -20);
  }, [camera]);
  return null;
}

export function GameScene() {
  return (
    <Canvas 
      camera={{ position: [0, 6, 12], fov: 60 }} 
      shadows
      gl={{ antialias: true }}
    >
      <CameraSetup />
      {/* Sky/Fog setup based on theme '#87CEEB' or a stylized sky gradient. We'll use the clear sky color. */}
      <color attach="background" args={['#87CEEB']} />
      <fog attach="fog" args={['#87CEEB', 20, 90]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.2} 
        castShadow 
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={20} // increase shadow draw distance
        shadow-camera-bottom={-20}
      />

      {/* Game Entities */}
      <Player />
      <Environment />
      <GateManager />
      <GameLoop />
    </Canvas>
  );
}
