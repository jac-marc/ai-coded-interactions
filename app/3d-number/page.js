"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text3D, Center, MeshTransmissionMaterial, Environment, Float } from "@react-three/drei";
import * as THREE from "three";

const FONT_URL = "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json";

function LensAndNumber() {
  const lensRef = useRef();
  const numberRef = useRef();
  const { viewport } = useThree();
  
  const lensInput = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 }); 
  const rotation = useRef({ x: 0, y: 0 }); 

  useEffect(() => {
    const handleMouseMove = (e) => {
      lensInput.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      lensInput.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleOrientation = (e) => {
      if (!e.gamma && !e.beta) return;
      lensInput.current.x = THREE.MathUtils.clamp(e.gamma / 45, -1, 1);
      lensInput.current.y = THREE.MathUtils.clamp((e.beta - 45) / 45, -1, 1);
    };

    const handlePointerDown = (e) => {
      isDragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      velocity.current = { x: 0, y: 0 }; 
    };

    const handlePointerMove = (e) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - lastPointer.current.x;
      const deltaY = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      
      const sensitivity = 0.0008;
      velocity.current.x += deltaY * sensitivity; 
      velocity.current.y += deltaX * sensitivity; 
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointerleave", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointerleave", handlePointerUp);
    };
  }, []);

  useFrame((state) => {
    if (lensRef.current) {
      const targetX = lensInput.current.x * (viewport.width / 4);
      const targetY = lensInput.current.y * (viewport.height / 4);
      lensRef.current.position.x = THREE.MathUtils.lerp(lensRef.current.position.x, targetX, 0.1);
      lensRef.current.position.y = THREE.MathUtils.lerp(lensRef.current.position.y, targetY, 0.1);
    }

    if (numberRef.current) {
      const maxSpeed = 0.1;
      velocity.current.x = THREE.MathUtils.clamp(velocity.current.x, -maxSpeed, maxSpeed);
      velocity.current.y = THREE.MathUtils.clamp(velocity.current.y, -maxSpeed, maxSpeed);

      rotation.current.x += velocity.current.x;
      rotation.current.y += velocity.current.y;

      if (!isDragging.current) {
        velocity.current.x *= 0.92;
        velocity.current.y *= 0.92;
      }

      numberRef.current.rotation.x = rotation.current.x;
      numberRef.current.rotation.y = rotation.current.y;
    }
  });

  return (
    <>
      <Float floatIntensity={0.5} speed={2}>
        <group ref={numberRef}>
          <Center position={[0, 0, -1.5]}>
            <Text3D 
              castShadow 
              receiveShadow
              font={FONT_URL} 
              size={5} 
              height={1} 
              curveSegments={24}
              bevelEnabled
              bevelThickness={0.05}
              bevelSize={0.05}
              bevelOffset={0}
              bevelSegments={5}
            >
              5
              {/* Front and Back Faces */}
              <meshStandardMaterial 
                attach="material-0" 
                color="#ff3333" 
                emissive="#330000" // Reduced emissive so shadows show
                emissiveIntensity={0.1}
                roughness={0.3}
                metalness={0}
              />
              
              {/* Sides/Extrusion */}
              <meshStandardMaterial 
                attach="material-1" 
                color="#4a0000"
                roughness={0.5}
              />
            </Text3D>
          </Center>
        </group>
      </Float>

      <mesh ref={lensRef} position={[0, 0, 3]} scale={[1, 1, 0.4]}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <MeshTransmissionMaterial
          backside={true}
          samples={16} 
          resolution={1024} 
          transmission={1}
          roughness={0.0}
          thickness={3.0}
          ior={1.5}
          chromaticAberration={0.15}
          anisotropy={0}
          distortion={0}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#ffffff"
          color="#ffffff"
          background={new THREE.Color('#000000')}
        />
      </mesh>
    </>
  );
}

export default function Page() {
  const requestAccess = () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().catch(console.error);
    }
  };

  return (
    <main className="w-full h-screen bg-black overflow-hidden relative touch-none" onClick={requestAccess}>
      <div className="absolute top-5 left-0 w-full text-center text-white/30 z-10 pointer-events-none font-sans text-sm">
        <p>Tilt to move Lens • Swipe to spin Number</p>
      </div>

      <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        
        {/* Soft ambient light */}
        <ambientLight intensity={0.3} />
        
        {/* MAIN SHADOW CASTER: Soft white directional light from top-right */}
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={3}
          color="#ffffff"
          castShadow 
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0001}
        />
        
        {/* Fill light from opposite side (no shadows, just softens the look) */}
        <directionalLight 
          position={[-3, 2, -3]} 
          intensity={1}
          color="#ffffff"
        />
        
        {/* Accent red point light to keep the red glow */}
        <pointLight position={[-10, -5, -5]} intensity={3} color="#ff0000" />
        <LensAndNumber />
      </Canvas>
    </main>
  );
}