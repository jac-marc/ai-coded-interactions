'use client';

import { useEffect, useRef } from 'react';
import { Roboto_Flex } from 'next/font/google';

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  axes: ['wdth', 'slnt'],
  display: 'swap',
});

export default function Home() {
  const containerRef = useRef(null);
  const letterRefs = useRef([]);
  const mouseXRef = useRef(0);
  const rafRef = useRef();
  
  // Store random behaviors for each letter (persists across renders)
  const letterBehaviors = useRef([]);
  
  const text = 'change';
  
  // Initialize random behaviors once
  useEffect(() => {
    letterBehaviors.current = text.split('').map(() => ({
      scaleDirection: Math.random() > 0.5 ? 1 : -1, // 1 = scale up, -1 = scale down
      weightDirection: Math.random() > 0.5 ? 1 : -1, // 1 = increase weight, -1 = decrease
      slantDirection: (Math.random() - 0.5) * 2, // Random value between -1 and 1
      scaleIntensity: 0.2 + Math.random() * 0.3, // Random between 0.2 and 0.5
    }));
  }, []);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseXRef.current = e.clientX;
    };
    
    const animate = () => {
      const x = mouseXRef.current;
      
      letterRefs.current.forEach((letter, index) => {
        if (!letter || !letterBehaviors.current[index]) return;
        
        const letterRect = letter.getBoundingClientRect();
        const letterCenterX = letterRect.left + letterRect.width / 2;
        const distance = Math.abs(x - letterCenterX);
        
        const maxDistance = 400;
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        const eased = Math.pow(normalizedDistance, 5);
        
        const behavior = letterBehaviors.current[index];
        
        // RANDOMIZED WEIGHT: Some letters get bolder, others get lighter
        let weight;
        if (behavior.weightDirection > 0) {
          // Normal: lighter when far, bolder when close
          weight = 1000 - (eased * 900);
        } else {
          // Inverted: bolder when far, lighter when close
          weight = 100 + (eased * 900);
        }
        
        // Width variation
        const width = 150 - (eased * 90);
        
        // RANDOMIZED SLANT: Each letter has its own slant behavior
        const baseDirection = x < letterCenterX ? -1 : 1;
        const slant = baseDirection * behavior.slantDirection * (1 - eased) * 25;
        
        // RANDOMIZED SCALE: Some scale up, others scale down
        let scale;
        if (behavior.scaleDirection > 0) {
          // Normal: scale up when close
          scale = 1 + ((1 - eased) * behavior.scaleIntensity);
        } else {
          // Inverted: scale down when close
          scale = 1 - ((1 - eased) * behavior.scaleIntensity * 0.5);
        }
        
        letter.style.fontVariationSettings = `'wght' ${weight}, 'wdth' ${width}, 'slnt' ${slant}`;
        letter.style.transform = `scale(${scale})`;
      });
      
      rafRef.current = requestAnimationFrame(animate);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  return (
    <main className={`min-h-screen bg-black flex items-center justify-center overflow-hidden ${robotoFlex.className}`}>
      <div ref={containerRef} className="relative px-8">
        <h1 className="text-[120px] sm:text-[160px] md:text-[200px] lg:text-[260px] xl:text-[320px] text-white font-bold tracking-tight select-none leading-none">
          {text.split('').map((char, index) => (
            <span
              key={index}
              ref={(el) => {
                letterRefs.current[index] = el;
              }}
              className="inline-block will-change-[font-variation-settings,transform]"
              style={{
                fontVariationSettings: "'wght' 100, 'wdth' 100, 'slnt' 0",
                transform: 'scale(1)',
                transition: 'font-variation-settings 0.08s cubic-bezier(0.33, 1, 0.68, 1), transform 0.08s cubic-bezier(0.33, 1, 0.68, 1)',
              }}
            >
              {char}
            </span>
          ))}
        </h1>
      </div>
    </main>
  );
}
