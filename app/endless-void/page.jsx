'use client';

import { useEffect, useRef, useState } from 'react';
import { Star } from './Star';
import { StarWarsCrawl } from './StarWarsCrawl';
import { WarpControls } from './WarpControls';

export default function StarWarpEffect() {
  const canvasRef = useRef(null);
  const crawlRef = useRef(null);
  const starsRef = useRef([]);
  const speedRef = useRef(0);
  const targetSpeedRef = useRef(0);
  const animationFrameRef = useRef(null);
  const lastScrollRef = useRef(0);
  const speedDisplayRef = useRef(null);
  
  const [speedMultiplier, setSpeedMultiplier] = useState(0.5);
  const [trailAmount, setTrailAmount] = useState(0.3);
  const [starCount, setStarCount] = useState(400);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCrawl, setShowCrawl] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const handleResize = () => {
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    };

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const delta = Math.abs(currentScroll - lastScrollRef.current);
      lastScrollRef.current = currentScroll;
      
      targetSpeedRef.current = Math.min(delta * speedMultiplier, 50);
      
      if (crawlRef.current && showCrawl) {
        const scrollProgress = currentScroll * 0.5;
        crawlRef.current.style.transform = `
          perspective(400px) 
          rotateX(25deg) 
          translateY(${100 - scrollProgress}vh)
        `;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speedMultiplier, showCrawl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    starsRef.current = Array.from({ length: starCount }, () => 
      new Star(canvas.width, canvas.height)
    );
  }, [starCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const animate = () => {
      speedRef.current += (targetSpeedRef.current - speedRef.current) * 0.1;
      targetSpeedRef.current *= 0.92;
      
      if (speedDisplayRef.current) {
        speedDisplayRef.current.textContent = (Math.round(speedRef.current * 10) / 10).toFixed(1);
      }
      
      ctx.fillStyle = `rgba(0, 0, 0, ${trailAmount})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      starsRef.current.forEach(star => {
        star.update(speedRef.current, canvas.width, canvas.height);
        star.draw(ctx, canvas.width, canvas.height, centerX, centerY, 1);
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [trailAmount]);

  return (
    <div className="relative min-h-[500vh] bg-black">
      {/* Fixed Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0"
      />
      
      {/* Star Wars Crawl Text */}
      {showCrawl && <StarWarsCrawl crawlRef={crawlRef} />}
      
      {/* Control Sidebar */}
      <WarpControls
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showCrawl={showCrawl}
        setShowCrawl={setShowCrawl}
        speedMultiplier={speedMultiplier}
        setSpeedMultiplier={setSpeedMultiplier}
        trailAmount={trailAmount}
        setTrailAmount={setTrailAmount}
        starCount={starCount}
        setStarCount={setStarCount}
        speedDisplayRef={speedDisplayRef}
      />

      {/* Invisible content for endless scroll */}
      <div className="relative z-10 pointer-events-none" />
    </div>
  );
}
