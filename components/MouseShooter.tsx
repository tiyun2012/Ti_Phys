import React, { useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

const MouseShooter: React.FC = () => {
  const { camera, pointer } = useThree();
  
  // Using a list to manage projectiles
  const [bullets, setBullets] = React.useState<{ id: number; startPos: THREE.Vector3; direction: THREE.Vector3 }[]>([]);

  React.useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
        // Only shoot on left click
        if (e.button !== 0) return;

        const vector = new THREE.Vector3(pointer.x, pointer.y, 0.5);
        vector.unproject(camera);
        
        const dir = vector.sub(camera.position).normalize();
        const force = 80; // Higher force for "high p" feel
        const velocity = dir.multiplyScalar(force);

        const id = Date.now();
        
        setBullets(prev => [
            ...prev.slice(-15), // Keep last 15
            { id, startPos: camera.position.clone(), direction: velocity }
        ]);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [camera, pointer]);

  return (
    <>
      {bullets.map(b => (
        <Bullet key={b.id} position={b.startPos} velocity={b.direction} />
      ))}
    </>
  );
};

interface BulletProps {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
}

const Bullet: React.FC<BulletProps> = ({ position, velocity }) => {
    const ref = useRef<RapierRigidBody>(null);
    
    React.useEffect(() => {
        if (ref.current) {
            ref.current.setLinvel(velocity, true);
        }
    }, []);

    return (
        <RigidBody 
            ref={ref} 
            position={[position.x, position.y, position.z]} 
            colliders="ball" 
            restitution={0.5} 
            density={2.0} // Heavier bullet
        >
            <mesh castShadow>
                <sphereGeometry args={[0.4]} />
                <meshStandardMaterial 
                    color="#00ffff" 
                    emissive="#00ffff" 
                    emissiveIntensity={2}
                    toneMapped={false}
                />
            </mesh>
            <pointLight distance={5} intensity={5} color="#00ffff" />
        </RigidBody>
    );
}

export default MouseShooter;