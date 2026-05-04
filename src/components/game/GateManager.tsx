import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import { LANE_WIDTH } from './Player';
import * as THREE from 'three';

interface Entity {
  id: number;
  pairId?: number;
  z: number;
  lane: number;
  value: number;
  isMulti: boolean;
  hit: boolean;
  type: 'gate' | 'enemy';
}

const SPAWN_Z = -80; // How far ahead to spawn
const HIT_Z = 0.5; // Z position of the player

const evalGate = (g: { isMulti: boolean, value: number }, current: number) => {
    if (g.isMulti) {
        return g.value === 0 ? Math.floor(current / 2) : current * g.value;
    }
    return current + g.value;
};

export function GateManager() {
  const entitiesRef = useRef<Entity[]>([]);
  const nextSpawnDistanceRef = useRef(10);
  const lastEnemyDistanceRef = useRef(-100);
  
  const status = useGameStore((state) => state.status);
  const speed = useGameStore((state) => state.speed);
  const distance = useGameStore((state) => state.distance);
  const playerLane = useGameStore((state) => state.lane);
  const addLevel = useGameStore((state) => state.addLevel);

  const [, setFrame] = useState(0);

  useFrame((_, delta) => {
    if (status === 'playing' && distance < 5 && nextSpawnDistanceRef.current > 30) {
      entitiesRef.current = [];
      nextSpawnDistanceRef.current = 10;
      lastEnemyDistanceRef.current = -100;
      setFrame(f => f + 1);
    }

    if (status !== 'playing') {
      if (status === 'menu' && entitiesRef.current.length > 0) {
        entitiesRef.current = [];
        nextSpawnDistanceRef.current = 10;
        lastEnemyDistanceRef.current = -100;
        setFrame(f => f + 1);
      }
      return;
    }

    const moveDistance = speed * delta;
    let needsRender = false;

    // Move entities
    for (let i = entitiesRef.current.length - 1; i >= 0; i--) {
      const entity = entitiesRef.current[i];
      const oldZ = entity.z;
      entity.z += moveDistance;
      const newZ = entity.z;

      // Check collision precisely crossing the HIT_Z boundary
      if (!entity.hit && oldZ <= HIT_Z && newZ >= HIT_Z) {
         if (entity.type === 'enemy' || entity.lane === playerLane) {
            entity.hit = true;
            addLevel(entity.value, entity.isMulti);
            
            // If hitting a gate, remove both gates (sibling)
            if (entity.type === 'gate' && entity.pairId) {
                const sibling = entitiesRef.current.find(e => e.pairId === entity.pairId && e.id !== entity.id);
                if (sibling) sibling.hit = true;
            }
         }
      }

      // Remove entities behind player
      if (entity.z > 5) {
        entitiesRef.current.splice(i, 1);
        needsRender = true;
      }
    }

    // Spawn new entities based on distance traveled
    if (distance > nextSpawnDistanceRef.current) {
      nextSpawnDistanceRef.current = distance + 15 + (speed * 0.2);
      
      // Accurately simulate maximum player level by iterating through the remaining upcoming challenges
      let simulatedLevel = useGameStore.getState().level;
      const zGroups = new Map<number, Entity[]>();
      for (const e of entitiesRef.current) {
          if (!e.hit && e.z < HIT_Z) {
              const key = e.pairId || e.id; 
              if (!zGroups.has(key)) zGroups.set(key, []);
              zGroups.get(key)!.push(e);
          }
      }
      
      // Sort groups by Z (descending from player to far away)
      const sortedGroups = Array.from(zGroups.values()).sort((a,b) => b[0].z - a[0].z);

      for (const group of sortedGroups) {
          if (group[0].type === 'enemy') {
              simulatedLevel = Math.max(1, simulatedLevel + group[0].value); // value is negative
          } else {
              let best = -Infinity;
              for (const g of group) {
                  const res = evalGate({ isMulti: g.isMulti, value: g.value }, simulatedLevel);
                  if (res > best) best = res;
              }
              simulatedLevel = best;
          }
      }

      let isEnemySpawn = distance > 50 && (distance - lastEnemyDistanceRef.current) > 100 && Math.random() > 0.7;
      
      if (isEnemySpawn && simulatedLevel <= 3) {
           isEnemySpawn = false; 
      }

      if (isEnemySpawn) {
        // Enemy shouldn't kill player if they followed the ideal path
        // Make enemies stronger. Roughly 85% of simulated level + small flat amount.
        let damage = Math.floor(simulatedLevel * (0.8 + Math.random() * 0.1)) + Math.floor(distance/300) + 2;
        if (damage >= simulatedLevel) {
             damage = Math.max(1, simulatedLevel - 1);
        }
        
        lastEnemyDistanceRef.current = distance;

        entitiesRef.current.push({
          id: distance,
          pairId: distance,
          z: SPAWN_Z,
          lane: 0,
          value: -damage,
          isMulti: false,
          hit: false,
          type: 'enemy'
        });
      } else {
        // Gates logic with mathematical evaluation
        const generateGate = (currentLevel: number) => {
             const isMulti = Math.random() > 0.85 && distance > 50;
             let val = 0;
             if (isMulti) {
                 val = Math.random() > 0.4 ? (Math.random() > 0.7 ? 3 : 2) : 0; // 0 means divide-by-2
             } else {
                 const isGood = Math.random() > 0.45;
                 if (isGood) {
                     val = Math.floor(Math.random() * 10) + 2 + Math.floor(distance/100);
                     if (currentLevel > 20 && Math.random() > 0.6) {
                         val += Math.floor(currentLevel * 0.2); // occasional scaling boost
                     }
                 } else {
                     const baseBad = Math.floor(Math.random() * 15) + 5 + Math.floor(distance/80);
                     const scaleBad = Math.floor(currentLevel * (0.1 + Math.random() * 0.3));
                     val = -(baseBad + scaleBad);
                 }
             }
             return { isMulti, value: val };
        };

        let leftGate = generateGate(simulatedLevel);
        let rightGate = generateGate(simulatedLevel);

        let leftResult = evalGate({ isMulti: leftGate.isMulti, value: leftGate.value }, simulatedLevel);
        let rightResult = evalGate({ isMulti: rightGate.isMulti, value: rightGate.value }, simulatedLevel);

        // If best choice kills player, force one to save them
        if (Math.max(leftResult, rightResult) <= 0) {
             rightGate.isMulti = false;
             rightGate.value = Math.floor(Math.random() * 8) + 3 + Math.floor(distance/100); 
        }

        const pairId = distance;

        entitiesRef.current.push({
          id: distance - 10,
          pairId,
          z: SPAWN_Z,
          lane: -1,
          value: leftGate.value,
          isMulti: leftGate.isMulti,
          hit: false,
          type: 'gate'
        });
        entitiesRef.current.push({
          id: distance + 10,
          pairId,
          z: SPAWN_Z,
          lane: 1,
          value: rightGate.value,
          isMulti: rightGate.isMulti,
          hit: false,
          type: 'gate'
        });
      }
      needsRender = true;
    }

    if (needsRender) {
      setFrame(f => f + 1);
    }
  });

  return (
    <group>
      {entitiesRef.current.map((entity) => {
        if (entity.hit) return null; 

        if (entity.type === 'enemy') {
            const enemyLevel = Math.abs(entity.value);
            return (
              <group key={entity.id} position={[0, 0.5, entity.z]}>
                {/* Enemy Character Base */}
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[4.0, 1.5, 1.5]} />
                  <meshStandardMaterial color="#E91E63" />
                </mesh>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[4.2, 1.6, 1.4]} />
                  <meshBasicMaterial color="#333" side={THREE.BackSide} />
                </mesh>
                {/* Angry Eyes */}
                <group position={[0, 0.3, 0.76]}>
                  <mesh position={[-0.8, 0, 0]} rotation={[0, 0, -0.2]}>
                    <planeGeometry args={[0.5, 0.15]} />
                    <meshBasicMaterial color="black" />
                  </mesh>
                  <mesh position={[0.8, 0, 0]} rotation={[0, 0, 0.2]}>
                    <planeGeometry args={[0.5, 0.15]} />
                    <meshBasicMaterial color="black" />
                  </mesh>
                </group>
                {/* Level Tag overhead */}
                <Text
                  position={[0, 1.8, 0]}
                  fontSize={0.6}
                  color="white"
                  anchorX="center"
                  anchorY="bottom"
                  outlineWidth={0.08}
                  outlineColor="#333"
                  fontWeight="900"
                >
                  DANGER: -{enemyLevel}
                </Text>
              </group>
            );
        }

        // Gate rendering
        const isGood = entity.value >= 0 && !(entity.isMulti && entity.value === 0);
        const color = isGood ? "#4CAF50" : "#F44336";
        const borderColor = isGood ? "#2E7D32" : "#C62828";
        const opStr = entity.isMulti ? (entity.value === 0 ? "÷" : "×") : (entity.value >= 0 ? "+" : "-");
        const textStr = `${opStr}${Math.abs(entity.value)}`;
        const text = entity.isMulti && entity.value === 0 ? "÷2" : textStr;

        return (
          <group key={entity.id} position={[entity.lane * LANE_WIDTH, 1.5, entity.z]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[LANE_WIDTH * 1.8, 3.5, 0.4]} />
              <meshStandardMaterial 
                color={color} 
                transparent 
                opacity={0.85} 
                roughness={0.5}
              />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[LANE_WIDTH * 1.8 + 0.2, 3.7, 0.2]} />
              <meshStandardMaterial color={borderColor} />
            </mesh>
            <Text
              position={[0, 0.2, 0.25]}
              fontSize={1.4}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.06}
              outlineColor={borderColor}
              fontWeight="900"
            >
              {text}
            </Text>
            <Text
              position={[0, -0.8, 0.25]}
              fontSize={0.5}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.04}
              outlineColor={borderColor}
              fontWeight="bold"
              letterSpacing={0.1}
            >
              {isGood ? "LEVEL UP" : "LEVEL DOWN"}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
