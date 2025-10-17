// pages/index.js
"use client"
import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [blurAmount, setBlurAmount] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [proximity, setProximity] = useState(0);
  
  const wordFrom = "Vague";
  const wordTo = "Sharp";
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      const centerX = windowWidth / 2;
      const centerY = windowHeight / 2;
      
      const normX = (e.clientX - centerX) / centerX;
      const normY = (e.clientY - centerY) / centerY;
      
      const effectiveWidth = windowWidth - 200;
      const effectiveHeight = windowHeight - 200;
      
      const clampedX = Math.max(-effectiveWidth/2, Math.min(effectiveWidth/2, e.clientX - centerX));
      const clampedY = Math.max(-effectiveHeight/2, Math.min(effectiveHeight/2, e.clientY - centerY));
      
      const distanceFromCenter = Math.sqrt(
        Math.pow(clampedX, 2) + 
        Math.pow(clampedY, 2)
      );
      
      const maxDistance = Math.sqrt(
        Math.pow(effectiveWidth/2, 2) + 
        Math.pow(effectiveHeight/2, 2)
      );
      
      const proximityValue = 1 - (distanceFromCenter / maxDistance);
      setProximity(proximityValue);
      
      const blurValue = (1 - proximityValue) * 3;
      setBlurAmount(blurValue);
      
      setPosition({
        x: -normX * 20,
        y: -normY * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  const renderAnimatedText = () => {
    // Use the maximum length to handle words of different lengths
    const maxLength = Math.max(wordFrom.length, wordTo.length);
    const letters = [];
    
    for (let i = 0; i < maxLength; i++) {
      const fromChar = i < wordFrom.length ? wordFrom[i] : '';
      const toChar = i < wordTo.length ? wordTo[i] : '';
      
      // Calculate individual letter transition
      const transitionStart = i / maxLength * 0.8;
      const transitionEnd = (i + 1) / maxLength * 0.8;
      
      let letterProgress = 0;
      if (proximity > transitionStart) {
        letterProgress = Math.min(1, (proximity - transitionStart) / (transitionEnd - transitionStart));
      }
      
      letters.push(
        <span 
          key={i} 
          style={{
            display: 'inline-block',
            position: 'relative',
            width: '100%',
            textAlign: 'center'
          }}
        >
          <span 
            style={{
              position: 'absolute',
              left: 0,
              opacity: 1 - letterProgress,
              transform: `translateY(${letterProgress * 20}px)`,
              transition: 'opacity 0.3s, transform 0.3s'
            }}
          >
            {fromChar}
          </span>
          <span 
            style={{
              position: 'absolute',
              left: 0,
              opacity: letterProgress,
              transform: `translateY(${(letterProgress - 1) * 20}px)`,
              transition: 'opacity 0.3s, transform 0.3s'
            }}
          >
            {toChar}
          </span>
          {/* Invisible character to maintain spacing */}
          <span style={{ visibility: 'hidden' }}>{fromChar || toChar}</span>
        </span>
      );
    }
    
    return letters;
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
      <Head>
        <title>Text Effect</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@700&display=swap" rel="stylesheet" />
      </Head>
      
      <div 
        className="text-6xl font-bold select-none"
        style={{ 
          fontFamily: "'Noto Sans', sans-serif",
          filter: `blur(${blurAmount}px)`,
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: 'filter 0.1s ease-out, transform 0.1s ease-out',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {renderAnimatedText()}
      </div>
    </div>
  );
}