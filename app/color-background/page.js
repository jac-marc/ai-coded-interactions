'use client';

import { useEffect, useRef } from 'react';
import styles from './color-background.module.css';

export default function ColorBackgroundPage() {
  const containerRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const windowSizeRef = useRef({ width: 0, height: 0 });
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      windowSizeRef.current = { width: window.innerWidth, height: window.innerHeight };
    };

    const handleMouseMove = (e) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    handleResize();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const updateBackgroundColor = () => {
      if (containerRef.current) {
        const width = windowSizeRef.current.width || window.innerWidth || 1;
        const height = windowSizeRef.current.height || window.innerHeight || 1;

        const xPercent = mousePositionRef.current.x / width;
        const yPercent = mousePositionRef.current.y / height;

        const r = Math.floor(110 + (xPercent * 145)); // 110 to 255
        const g = Math.floor(238 - (yPercent * 100)); // 238 to 138
        const b = Math.floor(251 - (xPercent * 100)); // 251 to 151

        containerRef.current.style.background = `rgb(${r}, ${g}, ${b})`;
      }

      animationFrameRef.current = requestAnimationFrame(updateBackgroundColor);
    };

    animationFrameRef.current = requestAnimationFrame(updateBackgroundColor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={styles.container}
      style={{ background: 'rgb(110, 238, 251)' }}
    >
      <div className={styles.animatedBackground}></div>
    </div>
  );
}
