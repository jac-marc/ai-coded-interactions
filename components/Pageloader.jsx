// components/PageLoader.jsx
import { BaseNeue } from '@/app/fonts';
import localFont from 'next/font/local';
import React, { useState, useEffect } from 'react';



const PageLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  
  // Smooth out the display number with animation
  useEffect(() => {
    // Update display number smoothly to match actual progress
    const smoothenNumber = () => {
      if (displayProgress < progress) {
        setDisplayProgress(prev => {
          const diff = progress - prev;
          const increment = diff > 1 ? 1 : 0.1;
          return Math.min(prev + increment, progress);
        });
        requestAnimationFrame(smoothenNumber);
      }
    };
    
    requestAnimationFrame(smoothenNumber);
  }, [progress, displayProgress]);
  
  // Handle completion
  useEffect(() => {
    if (progress >= 100 && displayProgress >= 100) {
      setCompleted(true);
      
      // Wait for 1 second before triggering fadeout
      setTimeout(() => {
        setFadeOut(true);
      }, 1000);
      
      // Wait for fadeout to complete before signaling completion
      setTimeout(() => {
        onComplete && onComplete();
      }, 1500); // 1000ms pause + 500ms for fade out
    }
  }, [progress, displayProgress, onComplete]);
  
  useEffect(() => {
    // Only run this once at component mount
    const simulateRealisticLoading = () => {
      let currentProgress = 0;
      
      const incrementProgress = () => {
        // If we're at 100%, stop
        if (currentProgress >= 100) return;
        
        // Calculate a random increment between 1-5%
        const increment = Math.floor(Math.random() * 5) + 1;
        currentProgress = Math.min(currentProgress + increment, 100);
        setProgress(currentProgress);
        
        // Calculate a random pause duration based on the current progress
        let pauseDuration;
        if (currentProgress < 30) {
          // Fast at the beginning (50-200ms)
          pauseDuration = Math.floor(Math.random() * 150) + 50;
        } else if (currentProgress < 70) {
          // Medium in the middle (100-500ms)
          pauseDuration = Math.floor(Math.random() * 400) + 100;
        } else if (currentProgress < 90) {
          // Slower near end (300-1000ms)
          pauseDuration = Math.floor(Math.random() * 700) + 300;
        } else {
          // Very slow at the very end (500-2000ms)
          pauseDuration = Math.floor(Math.random() * 1500) + 500;
        }
        
        // Add occasional longer pauses (20% chance of a longer pause)
        if (Math.random() < 0.2) {
          pauseDuration += Math.floor(Math.random() * 1500) + 1000;
        }
        
        // Schedule the next increment
        if (currentProgress < 100) {
          setTimeout(incrementProgress, pauseDuration);
        }
      };
      
      // Start the process
      incrementProgress();
    };
    
    simulateRealisticLoading();
  }, []);
  
  return (
    <div 
      className={`fixed inset-0 w-full h-screen bg-white flex items-center justify-center overflow-hidden ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ transition: 'opacity 500ms ease-in-out' }}
    >
      {/* Progress bar container - full width */}
      <div className="absolute top-0 left-0 w-full h-screen bg-gray-200">
        {/* Black progress bar */}
        <div 
          className="absolute top-0 left-0 h-full bg-black transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Percentage text with mix-blend-mode */}
      <div className="absolute inset-0 flex items-center">
        <span className={`text-white pl-8 transition-all duration-200`}
          style={{ 
            fontSize: '100vh',
            mixBlendMode: 'difference',
            lineHeight: '1'
          }}
        >
          {Math.round(displayProgress)}
        </span>
      </div>
    </div>
  );
};

export default PageLoader;