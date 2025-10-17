'use client'

import { useState, useEffect } from 'react';
import Navbar from '../navigation';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate mouse position as a percentage of the viewport
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Calculate image position (center is neutral, moves in opposite direction)
  const imagePositionX = (0.5 - mousePosition.x) * 20; // 20px max movement horizontally
  const imagePositionY = (0.5 - mousePosition.y) * 20; // 20px max movement vertically
  
  // Calculate image tilt (center is neutral)
  const tiltX = (mousePosition.y - 0.5) * 15; // 5 degrees max tilt on X axis (vertical mouse movement)
  const tiltY = (mousePosition.x - 0.5) * 15; // 5 degrees max tilt on Y axis (horizontal mouse movement)
  
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: "url('/pexels-soner-arkan-18986320.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translate(${imagePositionX}px, ${imagePositionY}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease-out',
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      />
      
      
    </div>
  );
}