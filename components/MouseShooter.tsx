
import React, { useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import '../types';

interface ProjectileData {
    id: number;
    position: [number, number, number];
    velocity: [number, number, number];
    active: boolean;
}

const BULLET_POOL_SIZE = 24;

const MouseShooter: React.FC = () => {
  const { camera, pointer } = useThree();
  const [bullets, setBullets] = useState<ProjectileData[]>(() => 
    Array.from({ length: BULLET_POOL_SIZE }, (_, i) => ({
        id: i,
        position: [0, -100, 0], // Spawn far away initially
        velocity: [0, 0, 0],
        active: false
    }))
  );
  const nextBulletIdx = useRef(0);

  const shoot = () => {
    const vector = new THREE.Vector3(pointer.x, pointer.y, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const impulse = 90;
    const vel = dir.multiplyScalar(impulse);

    setBullets(prev => {
        const newBullets = [...prev];
        newBullets[nextBulletIdx.current] = {
            id: nextBulletIdx.current,
            position: [camera.position.x, camera.position.y, camera.position.z],
            velocity: [vel.x, vel.y, vel.z],
            active: true
        };
        nextBulletIdx.current = (nextBulletIdx.current + 1) % BULLET_POOL_SIZE;
        return newBullets;
    });
  };

  useEffect(() => {
    const handleDown = (e: PointerEvent) => {
        if (e.button === 0) shoot();
    };
    window.addEventListener('pointerdown', handleDown);
    return () => window.removeEventListener('pointerdown', handleDown);
  }, [camera, pointer]);

  return (
    <>
      {bullets.map(b => (
        <Bullet key={b.id} data={b} />
      ))}
    </>
  );
};

const Bullet: React.FC<{ data: ProjectileData }> = ({ data }) => {
    const ref = useRef<RapierRigidBody>(null);
    const lastActive = useRef(false);

    // Imperatively update velocity only when the bullet is "re-activated" from the pool
    useFrame(() => {
        if (data.active && !lastActive.current && ref.current) {
            ref.current.setTranslation(new THREE.Vector3(...data.position), true);
            ref.current.setLinvel(new THREE.Vector3(...data.velocity), true);
            lastActive.current = true;
        } else if (!data.active) {
            lastActive.current = false;
        }
    });

    return (
        <RigidBody 
            ref={ref} 
            position={data.position} 
            colliders="ball" 
            restitution={0.6} 
            density={4.0}
            linearDamping={0.1}
            includeInvisible={false}
        >
            <mesh castShadow>
                <sphereGeometry args={[0.35, 12, 12]} />
                <meshStandardMaterial 
                    color="#00ffff" 
                    emissive="#00ffff" 
                    emissiveIntensity={4}
                    toneMapped={false}
                />
            </mesh>
            <pointLight distance={6} intensity={8} color="#00ffff" />
        </RigidBody>
    );
}

export default MouseShooter;
