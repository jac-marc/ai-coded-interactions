'use client';

import { useEffect, useRef, useState } from 'react';

export default function Page() {
  const containerRef = useRef(null);
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const [granted, setGranted] = useState(false);

  // Motion vector from sensors
  const motionRef = useRef({ mx: 0, my: 0 });

  // Ghost trail state
  const ghostsRef = useRef([]);
  const idRef = useRef(0);
  const lastTimeRef = useRef(null);
  const rafRef = useRef(null);
  const [, setTick] = useState(0);

  // iOS permission check
  useEffect(() => {
    const needs =
      typeof window !== 'undefined' &&
      typeof window.DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function';
    setPermissionNeeded(!!needs);
  }, []);

  const requestIOSPermission = async () => {
    try {
      if (typeof DeviceMotionEvent?.requestPermission === 'function') {
        const res = await DeviceMotionEvent.requestPermission();
        setGranted(res === 'granted');
      } else {
        setGranted(true);
      }
    } catch {
      setGranted(false);
    }
  };

  useEffect(() => {
    function onDeviceMotion(e) {
      const ax = (e.accelerationIncludingGravity && e.accelerationIncludingGravity.x) || 0;
      const ay = (e.accelerationIncludingGravity && e.accelerationIncludingGravity.y) || 0;
      const clampG = (v) => Math.max(-9.8, Math.min(9.8, v));
      motionRef.current.mx = clampG(ax) / 9.8;
      motionRef.current.my = clampG(ay) / 9.8;
    }

    function onDeviceOrientation(e) {
      const gamma = e.gamma || 0;
      const beta = e.beta || 0;
      const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
      motionRef.current.mx = clamp(gamma / 45, -1, 1);
      motionRef.current.my = clamp(beta / 45, -1, 1);
    }

    const attach = () => {
      window.addEventListener('devicemotion', onDeviceMotion, { passive: true });
      window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
    };

    if (!permissionNeeded || granted) attach();
    return () => {
      window.removeEventListener('devicemotion', onDeviceMotion);
      window.removeEventListener('deviceorientation', onDeviceOrientation);
    };
  }, [permissionNeeded, granted]);

  useEffect(() => {
    const spawnInterval = 40; // ms between ghost spawns
    let spawnAccumulator = 0;

    const baseSpeed = 90;   // px/s baseline forward
    const tiltSpeed = 180;  // px/s additional from tilt
    const fadeRate = 0.5;   // alpha per second
    const outwardBias = 0.35;

    const step = (t) => {
      if (lastTimeRef.current == null) lastTimeRef.current = t;
      const dt = Math.min(0.05, (t - lastTimeRef.current) / 1000);
      lastTimeRef.current = t;

      // Spawn near center, moving outward according to tilt
      spawnAccumulator += dt * 1000;
      while (spawnAccumulator >= spawnInterval) {
        spawnAccumulator -= spawnInterval;

        const { mx, my } = motionRef.current;
        const mag = Math.min(1, Math.hypot(mx, my));
        const forwardVx = (mx || my) ? mx * tiltSpeed * mag : 0;
        const forwardVy = (mx || my) ? my * tiltSpeed * mag : 0;

        // Constant forward drift to imply motion even at rest
        const baselineVx = 0;
        const baselineVy = baseSpeed;

        // Slight randomized outward bias for organic feel
        const rand = (min, max) => Math.random() * (max - min) + min;
        const rAngle = rand(0, Math.PI * 2);
        const outwardVx = Math.cos(rAngle) * outwardBias * baseSpeed * 0.25;
        const outwardVy = Math.sin(rAngle) * outwardBias * baseSpeed * 0.25;

        const vx = baselineVx + forwardVx + outwardVx;
        const vy = baselineVy + forwardVy + outwardVy;

        // IMPORTANT: do not rotate with tilt; keep a tiny random jitter only
        const tinyJitter = rand(-0.05, 0.05);

        ghostsRef.current.push({
          id: idRef.current++,
          x: 0,
          y: 0,
          life: 1,
          scale: rand(0.92, 1.12),
          rotation: tinyJitter, // no tilt-based rotation
          vx,
          vy,
        });
      }

      // Integrate ghosts
      for (let i = ghostsRef.current.length - 1; i >= 0; i--) {
        const o = ghostsRef.current[i];
        o.x += o.vx * dt;
        o.y += o.vy * dt;
        o.life -= fadeRate * dt;
        if (o.life <= 0) ghostsRef.current.splice(i, 1);
      }

      setTick((v) => (v + 1) % 1000000);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex h-dvh w-dvw items-center justify-center overflow-hidden bg-black text-white"
    >
      {/* Permission UI for iOS */}
      {permissionNeeded && !granted && (
        <button
          onClick={requestIOSPermission}
          className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-xs tracking-wide text-white backdrop-blur hover:bg-white/20"
        >
          Enable Motion Access
        </button>
      )}

      {/* Anchor word - never rotates or moves */}
      <div className="pointer-events-none select-none">
        <span className="text-6xl md:text-7xl lg:text-8xl font-light tracking-widest">
          infinite
        </span>
      </div>

      {/* Ghost layer - starts at exact center; only ghosts move */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2">
          {ghostsRef.current.map((g) => (
            <span
              key={g.id}
              className="absolute text-6xl md:text-7xl lg:text-8xl font-light tracking-widest will-change-transform"
              style={{
                transform: `translate(${g.x}px, ${g.y}px) rotate(${g.rotation}rad) scale(${g.scale}) translate(-50%, -50%)`,
                opacity: g.life,
                filter: `blur(${(1 - g.life) * 1.6}px)`,
                mixBlendMode: 'screen',
              }}
            >
              infinite
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
