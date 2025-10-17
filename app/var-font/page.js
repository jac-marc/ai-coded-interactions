// pages/index.js
"use client"
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function Home() {
  const [fontWeight, setFontWeight] = useState(100);
  const [isListening, setIsListening] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);
  const prevVolumeRef = useRef(0);
  const targetWeightRef = useRef(100);
  const currentWeightRef = useRef(100);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Create analyser node with optimized settings for faster response
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.6; // Reduced for quicker response
      
      // Connect microphone to analyser
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      
      setIsListening(true);
      
      // Start analyzing audio
      analyzeAudio();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Unable to access microphone. Please ensure you've granted permission.");
    }
  };

  const stopListening = () => {
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsListening(false);
    setFontWeight(100);
    targetWeightRef.current = 100;
    currentWeightRef.current = 100;
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume level with weighted emphasis on mid-range frequencies
    let sum = 0;
    const relevantBins = Math.floor(dataArray.length * 0.3);
    for (let i = 0; i < relevantBins; i++) {
      sum += dataArray[i];
    }
    const currentVolume = sum / relevantBins;
    
    // Apply smoothing with faster response time
    const smoothingFactor = 0.65; // Reduced for quicker response
    const smoothedVolume = prevVolumeRef.current * smoothingFactor + currentVolume * (1 - smoothingFactor);
    prevVolumeRef.current = smoothedVolume;
    
    // Map volume to font weight with better scaling
    const normVolume = Math.min(1, Math.pow(smoothedVolume / 80, 0.8));
    const newTargetWeight = 100 + Math.round(normVolume * 800);
    
    targetWeightRef.current = newTargetWeight;
    
    // Faster interpolation for snappier response
    const interpolationSpeed = 0.35; // Increased for faster tracking
    currentWeightRef.current += (targetWeightRef.current - currentWeightRef.current) * interpolationSpeed;
    
    // Update more frequently with smaller increments
    const roundedWeight = Math.round(currentWeightRef.current / 5) * 5; // Snap to increments of 5
    if (Math.abs(fontWeight - roundedWeight) >= 5) {
      setFontWeight(roundedWeight);
    }
    
    // Continue analyzing
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (microphoneRef.current) {
        microphoneRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Head>
        <title>Audio-Responsive Font</title>
      </Head>
      
      <div 
        className="text-center mb-16"
        style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontWeight: fontWeight,
          fontSize: "16vw",
          transition: "font-weight 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)", // Faster transition
          willChange: "font-weight",
          fontVariationSettings: `'wght' ${fontWeight}`
        }}
      >
        make me fat
      </div>

      <div className="fixed bottom-8">
        {!isListening ? (
          <button 
            onClick={startListening}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-150 ease-in-out shadow-lg"
          >
            Start Microphone
          </button>
        ) : (
          <button 
            onClick={stopListening}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition duration-150 ease-in-out shadow-lg"
          >
            Stop Microphone
          </button>
        )}
      </div>
      
      {isListening && (
        <div className="fixed top-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
          <div>Current weight: {fontWeight}</div>
          <div>Volume: {((fontWeight - 100) / 800 * 100).toFixed(0)}%</div>
        </div>
      )}
      
      {/* Add Noto Sans JP variable font for smoother transitions */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap');
      `}</style>
    </div>
  );
}
