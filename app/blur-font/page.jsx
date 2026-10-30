"use client";

import React, { useState, useEffect } from 'react';
import { Noto_Sans } from 'next/font/google';

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
});

const WORD_FROM = "Vague";
const WORD_TO = "Sharp";

export default function BlurVariableFontPage() {
  const [motion, setMotion] = useState({
    proximity: 0,
    position: { x: 0, y: 0 },
  });

  const blurAmount = (1 - motion.proximity) * 3;

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

      const clampedX = Math.max(-effectiveWidth / 2, Math.min(effectiveWidth / 2, e.clientX - centerX));
      const clampedY = Math.max(-effectiveHeight / 2, Math.min(effectiveHeight / 2, e.clientY - centerY));

      const distanceFromCenter = Math.sqrt(
        Math.pow(clampedX, 2) + Math.pow(clampedY, 2)
      );

      const maxDistance = Math.sqrt(
        Math.pow(effectiveWidth / 2, 2) + Math.pow(effectiveHeight / 2, 2)
      );

      const proximityValue = 1 - (distanceFromCenter / maxDistance);

      setMotion({
        proximity: proximityValue,
        position: {
          x: -normX * 20,
          y: -normY * 20,
        },
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const renderAnimatedText = () => {
    const maxLength = Math.max(WORD_FROM.length, WORD_TO.length);
    const letters = [];

    for (let i = 0; i < maxLength; i++) {
      const fromChar = i < WORD_FROM.length ? WORD_FROM[i] : '';
      const toChar = i < WORD_TO.length ? WORD_TO[i] : '';

      const transitionStart = (i / maxLength) * 0.8;
      const transitionEnd = ((i + 1) / maxLength) * 0.8;

      let letterProgress = 0;
      if (motion.proximity > transitionStart) {
        letterProgress = Math.min(
          1,
          (motion.proximity - transitionStart) / (transitionEnd - transitionStart)
        );
      }

      letters.push(
        <span
          key={i}
          style={{
            display: 'inline-block',
            position: 'relative',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 0,
              opacity: 1 - letterProgress,
              transform: `translateY(${letterProgress * 20}px)`,
              transition: 'opacity 0.3s, transform 0.3s',
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
              transition: 'opacity 0.3s, transform 0.3s',
            }}
          >
            {toChar}
          </span>
          <span style={{ visibility: 'hidden' }}>{fromChar || toChar}</span>
        </span>
      );
    }

    return letters;
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
      <div
        className={`text-6xl font-bold select-none ${notoSans.className}`}
        style={{
          filter: `blur(${blurAmount}px)`,
          transform: `translate(${motion.position.x}px, ${motion.position.y}px)`,
          transition: 'filter 0.1s ease-out, transform 0.1s ease-out',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {renderAnimatedText()}
      </div>
    </div>
  );
}
