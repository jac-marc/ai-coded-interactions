'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './particles.module.css';

export default function ParticlesPage() {
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size to window size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Create particles with different layers (depths)
    const createParticles = () => {
      const particles = [];
      const numParticles = 200;
      
      // Create particles for each layer (3 layers: far, medium, close)
      for (let i = 0; i < numParticles; i++) {
        // Randomly assign a layer (0: far, 1: medium, 2: close)
        const layer = Math.floor(Math.random() * 3);
        
        // Size and speed vary by layer
        const size = layer === 0 ? 1 : layer === 1 ? 2 : 3;
        const speed = layer === 0 ? 0.5 : layer === 1 ? 1 : 1.5;
        
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size,
          speed,
          layer,
          dx: (Math.random() - 0.5) * speed,
          dy: (Math.random() - 0.5) * speed,
        });
      }
      
      return particles;
    };
    
    particlesRef.current = createParticles();

    // Track mouse movement for focus effect only
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate focus based on mouse position
      // Mouse at left edge = 0 (focus on far particles), right edge = 1 (focus on close particles)
      const mouseXPercent = mousePosition.x / windowSize.width;
      
      // Update and draw particles
      particlesRef.current.forEach(particle => {
        // Update position - completely independent of mouse position
        particle.x += particle.dx;
        particle.y += particle.dy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.dx = -particle.dx;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.dy = -particle.dy;
        }
        
        // Calculate blur based on layer and mouse position
        // For far particles (layer 0): sharp when mouse is on left (0), blurred when mouse is on right (1)
        // For close particles (layer 2): sharp when mouse is on right (1), blurred when mouse is on left (0)
        let blurAmount = 0;
        
        if (particle.layer === 0) {
          // Far particles - sharp on left, blurred on right
          blurAmount = mouseXPercent * 5; // 0 to 5px blur
        } else if (particle.layer === 1) {
          // Medium particles - sharp in middle, blurred on edges
          blurAmount = Math.abs(mouseXPercent - 0.5) * 4; // 0 to 2px blur
        } else {
          // Close particles - sharp on right, blurred on left
          blurAmount = (1 - mouseXPercent) * 5; // 0 to 5px blur
        }
        
        // Draw particle with blur effect
        ctx.save();
        
        // Apply blur filter if needed
        if (blurAmount > 0) {
          ctx.filter = `blur(${blurAmount}px)`;
        }
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        
        ctx.restore();
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mousePosition, windowSize.width, windowSize.height]);

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
