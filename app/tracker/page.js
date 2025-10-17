app/components/HandWriter.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

type Point = { x: number; y: number };

export default function HandWriter() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null); // drawing layer
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [drawing, setDrawing] = useState(true);
  const [pinching, setPinching] = useState(false);
  const lastPointRef = useRef<Point | null>(null);
  const rafRef = useRef<number | null>(null);

  // Tune pinch threshold (normalized distance in [0..1]).
  const PINCH_THRESHOLD = 0.05;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let canceled = false;

    async function setup() {
      try {
        // 1) Camera: front camera request
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });

        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Ensure canvas sizes match video
        const width = videoRef.current.videoWidth || 640;
        const height = videoRef.current.videoHeight || 480;
        if (canvasRef.current) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
        }
        if (overlayRef.current) {
          overlayRef.current.width = width;
          overlayRef.current.height = height;
        }

        // 2) Load MediaPipe Tasks Vision wasm + Hand Landmarker
        const vision = await FilesetResolver.forVisionTasks('/wasm');
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/hand_landmarker.task',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        handLandmarkerRef.current = handLandmarker;
        setIsReady(true);

        // 3) Render loop
        const loop = () => {
          if (!videoRef.current || !canvasRef.current || !overlayRef.current) {
            rafRef.current = requestAnimationFrame(loop);
            return;
          }
          const video = videoRef.current;
          const base = canvasRef.current;
          const overlay = overlayRef.current;
          const baseCtx = base.getContext('2d')!;
          const drawCtx = overlay.getContext('2d')!;

          // Draw mirrored video frame for selfie view
          baseCtx.save();
          baseCtx.scale(-1, 1);
          baseCtx.drawImage(video, -base.width, 0, base.width, base.height);
          baseCtx.restore();

          // Hand landmarks
          const hl = handLandmarkerRef.current!;
          const result = hl.detectForVideo(video, performance.now());

          // Clear landmark overlay each frame
          drawCtx.save();
          drawCtx.globalCompositeOperation = 'source-over';

          // Draw landmarks with bright colors
          if (result && result.landmarks) {
            result.landmarks.forEach((hand) => {
              // Bright cyan circles for all landmarks
              hand.forEach((lm) => {
                const px = (1 - lm.x) * base.width; // mirror x
                const py = lm.y * base.height;
                drawCtx.beginPath();
                drawCtx.arc(px, py, 6, 0, Math.PI * 2);
                drawCtx.fillStyle = '#00FFFF';
                drawCtx.fill();
              });

              // Pinch detection: thumb tip (4) and index tip (8)
              const thumb = hand[4];
              const index = hand[8];

              const tx = thumb.x;
              const ty = thumb.y;
              const ix = index.x;
              const iy = index.y;
              const dx = tx - ix;
              const dy = ty - iy;
              const dist = Math.hypot(dx, dy);

              const isPinch = dist < PINCH_THRESHOLD;

              // Visualize pinch with connecting line (yellow)
              const thumbPx = (1 - tx) * base.width;
              const thumbPy = ty * base.height;
              const indexPx = (1 - ix) * base.width;
              const indexPy = iy * base.height;
              drawCtx.beginPath();
              drawCtx.moveTo(thumbPx, thumbPy);
              drawCtx.lineTo(indexPx, indexPy);
              drawCtx.strokeStyle = isPinch ? '#FFFF00' : 'rgba(255,255,0,0.3)';
              drawCtx.lineWidth = isPinch ? 4 : 2;
              drawCtx.stroke();

              // Writing: follow the index tip while pinching
              if (drawing) {
                if (isPinch) {
                  if (!pinching) {
                    setPinching(true);
                    lastPointRef.current = { x: indexPx, y: indexPy };
                  } else {
                    const last = lastPointRef.current;
                    if (last) {
                      drawCtx.beginPath();
                      drawCtx.moveTo(last.x, last.y);
                      drawCtx.lineTo(indexPx, indexPy);
                      drawCtx.strokeStyle = '#FF2D55'; // bright pink ink
                      drawCtx.lineWidth = 6;
                      drawCtx.lineCap = 'round';
                      drawCtx.stroke();
                      lastPointRef.current = { x: indexPx, y: indexPy };
                    }
                  }
                } else if (pinching) {
                  setPinching(false);
                  lastPointRef.current = null;
                }
              }
            });
          }

          drawCtx.restore();
          rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        console.error(e);
      }
    }

    setup();

    return () => {
      canceled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
        handLandmarkerRef.current = null;
      }
    };
  }, []);

  const clearInk = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d')!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 p-4">
      <div className="relative w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden">
        {/* Base video (mirrored in drawing step) */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />
        {/* Base canvas for video frame (mirrored image) */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {/* Overlay canvas for landmarks + ink */}
        <canvas ref={overlayRef} className="absolute inset-0 w-full h-full" />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setDrawing((d) => !d)}
          className={`px-4 py-2 rounded-md text-white ${drawing ? 'bg-emerald-600' : 'bg-slate-600'}`}
        >
          {drawing ? 'Drawing: On' : 'Drawing: Off'}
        </button>
        <button
          onClick={clearInk}
          className="px-4 py-2 rounded-md bg-rose-600 text-white"
        >
          Clear
        </button>
        <span className="text-sm text-slate-500">
          {isReady ? 'Camera and model ready' : 'Initializing...'}
        </span>
      </div>
    </div>
  );
}
