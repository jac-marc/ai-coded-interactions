'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './color-background.module.css';

export default function ColorBackgroundPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [backgroundColor, setBackgroundColor] = useState({ r: 110, g: 238, b: 251 });
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Handle mouse move event
  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };
  
  // Handle window resize
  const handleResize = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  };
  
  // Update background color based on mouse position
  const updateBackgroundColor = () => {
    if (!containerRef.current) return;
    
    // Calculate color based on mouse position
    // Map mouse position to color values (0-255)
    const xPercent = mousePosition.x / windowSize.width;
    const yPercent = mousePosition.y / windowSize.height;
    
    // Create a smooth color transition
    // Use different color models for x and y to create more variety
    const r = Math.floor(110 + (xPercent * 145)); // 110 to 255
    const g = Math.floor(238 - (yPercent * 100)); // 238 to 138
    const b = Math.floor(251 - (xPercent * 100)); // 251 to 151
    
    // Apply the new color with a smooth transition
    setBackgroundColor({ r, g, b });
    
    // Continue animation
    animationFrameRef.current = requestAnimationFrame(updateBackgroundColor);
  };
  
  // Initialize
  useEffect(() => {
    // Set initial window size
    handleResize();
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    // Start animation
    animationFrameRef.current = requestAnimationFrame(updateBackgroundColor);
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePosition, windowSize.width, windowSize.height]);
  
  // Calculate background style
  const getBackgroundStyle = () => {
    return {
      background: `rgb(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b})`,
    };
  };
  
  return (
    <div 
      ref={containerRef}
      className={styles.container}
      style={getBackgroundStyle()}
    >
      <div className={styles.animatedBackground}></div>
    </div>
  );
} 