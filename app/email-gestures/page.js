'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// SVG Icons accurately matching Figma specifications
function BackIcon({ className = 'w-[24px] h-[24px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeleteIcon({ className = 'w-[24px] h-[24px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H21M9 6V3H15V6M5 6L6 21H18L19 6M10 10V17M14 10V17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocumentIcon({ className = 'w-[24px] h-[30px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 9L14 1H3V29H22V9ZM14 1V9H22M7 16H17M7 21H15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ReplyIcon({ className = 'w-[24px] h-[24px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 17L4 12L9 7M4 12H13C17 12 20 15 20 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ForwardIcon({ className = 'w-[24px] h-[24px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12H19M12 19L19 12L12 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AiSummaryIcon({ className = 'w-[16px] h-[16px]' }) {
  return (
    <div className={`relative shrink-0 ${className} opacity-60`}>
      <svg className="absolute left-0 top-[3px] w-[11px] h-[11px]" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 0C7 4.2 7.8 5 12 6C7.8 7 7 7.8 6 12C5 7.8 4.2 7 0 6C4.2 5 5 4.2 6 0Z" fill="currentColor" />
      </svg>
      <svg className="absolute right-0 top-0 w-[6px] h-[6px]" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 0C3.5 2.1 3.9 2.5 6 3C3.9 3.5 3.5 3.9 3 6C2.5 3.9 2.1 3.5 0 3C2.1 2.5 2.5 2.1 3 0Z" fill="currentColor" />
      </svg>
    </div>
  );
}

export default function EmailGesturesPage() {
  // Navigation / stage: 1 = email view, 2 = reply view, 3 = inbox with confirmation
  const [stage, setStage] = useState(1);
  const [replyText, setReplyText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [isNotificationFading, setIsNotificationFading] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [showSendAlert, setShowSendAlert] = useState(false);

  const lastGestureTimeRef = useRef(0);
  const betaHistoryRef = useRef([]);
  const stageRef = useRef(stage);
  const permissionRequestedRef = useRef(false);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  // Handle 3s fade out for email sent notification in stage 3
  useEffect(() => {
    if (stage === 3) {
      setShowNotification(true);
      setIsNotificationFading(false);
      const fadeTimer = setTimeout(() => {
        setIsNotificationFading(true);
      }, 3000);
      const removeTimer = setTimeout(() => {
        setShowNotification(false);
      }, 3700);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    } else {
      setShowNotification(true);
      setIsNotificationFading(false);
    }
  }, [stage]);

  // Trigger stage change with haptic feedback
  const triggerSnapUp = useCallback(() => {
    const now = Date.now();
    if (now - lastGestureTimeRef.current < 650) return;
    lastGestureTimeRef.current = now;

    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);

    if (stageRef.current === 1) {
      setStage(2);
    }
  }, []);

  const triggerSnapDown = useCallback(() => {
    const now = Date.now();
    if (now - lastGestureTimeRef.current < 650) return;
    lastGestureTimeRef.current = now;

    if (navigator.vibrate) navigator.vibrate([60, 40, 60]);

    if (stageRef.current === 2) {
      setShowSendAlert(true);
    }
  }, []);

  const startMotionListeners = useCallback(() => {
    // 1. DeviceMotionEvent: detects rapid rotation rate or acceleration jerk
    const handleDeviceMotion = (e) => {
      const now = Date.now();
      if (now - lastGestureTimeRef.current < 600) return;

      const rotBeta = e.rotationRate?.beta;
      const rotGamma = e.rotationRate?.gamma;
      const accY = e.acceleration?.y ?? e.accelerationIncludingGravity?.y;
      const accZ = e.acceleration?.z ?? e.accelerationIncludingGravity?.z;

      // Check angular velocity snap threshold (deg/s)
      if (rotBeta !== null && rotBeta !== undefined) {
        if (rotBeta < -80) {
          triggerSnapUp();
          return;
        }
        if (rotBeta > 80) {
          triggerSnapDown();
          return;
        }
      }

      // Check linear acceleration spike if rotationRate is not available
      if (accY !== undefined && accZ !== undefined) {
        if ((accZ > 6 && accY < -3) || accZ > 9 || accY < -7) {
          triggerSnapUp();
        } else if ((accZ < -6 && accY > 3) || accZ < -8 || accY > 6) {
          triggerSnapDown();
        }
      }
    };

    // 2. DeviceOrientationEvent: detects rapid angle delta changes
    const handleDeviceOrientation = (e) => {
      const beta = e.beta; // Front-to-back tilt in degrees [-180, 180]
      if (beta === null || beta === undefined) return;

      const now = Date.now();
      const history = betaHistoryRef.current;
      history.push({ beta, time: now });

      while (history.length > 0 && now - history[0].time > 300) {
        history.shift();
      }

      if (now - lastGestureTimeRef.current < 600) return;

      if (history.length >= 2) {
        const oldest = history[0];
        const deltaBeta = beta - oldest.beta;
        const deltaTime = now - oldest.time;

        if (deltaTime > 30 && deltaTime <= 300) {
          if (deltaBeta < -16) {
            triggerSnapUp();
            betaHistoryRef.current = [];
          } else if (deltaBeta > 18) {
            triggerSnapDown();
            betaHistoryRef.current = [];
          }
        }
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
    window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [triggerSnapUp, triggerSnapDown]);

  // Request motion permission and dismiss prompt
  const handleEnableMotion = useCallback(async () => {
    try {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
          permissionRequestedRef.current = true;
          startMotionListeners();
        }
      } else {
        permissionRequestedRef.current = true;
        startMotionListeners();
      }
    } catch {
      permissionRequestedRef.current = true;
      startMotionListeners();
    }
    setShowPermissionPrompt(false);
  }, [startMotionListeners]);

  // Prompt user to enable motion sensors when loaded from a device
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || 
        ('ontouchstart' in window) || 
        (navigator.maxTouchPoints > 0);

      if (isMobileDevice) {
        setShowPermissionPrompt(true);
      } else {
        startMotionListeners();
      }
    }
  }, [startMotionListeners]);

  return (
    <div
      className="min-h-screen bg-[#111111] text-black flex flex-col items-center justify-start py-4 px-2 sm:px-4 font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif]"
    >
      {/* Mobile Frame Container */}
      <div className="w-full max-w-[390px] min-h-[780px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col relative border border-[#e0e3e5]">

        {/* Device Motion Permission Prompt */}
        {showPermissionPrompt && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[20px] p-[24px] w-full max-w-[320px] text-black shadow-2xl flex flex-col items-center text-center gap-[16px] border border-[#e0e3e5]">
              <div className="w-[44px] h-[44px] rounded-full bg-[#c0dec2] flex items-center justify-center text-[20px]">
                📱
              </div>
              <div className="flex flex-col gap-[6px]">
                <h3 className="text-[19px] font-medium leading-[24px]">Enable Motion Sensors</h3>
                <p className="text-[14px] text-neutral-600 leading-[20px]">
                  Enable motion sensors to use snap gestures for replying and sending emails.
                </p>
              </div>
              <div className="flex flex-col gap-[8px] w-full pt-1">
                <button
                  onClick={handleEnableMotion}
                  className="w-full bg-black hover:bg-neutral-800 text-white py-[12px] px-[16px] rounded-[12px] text-[15px] font-medium transition cursor-pointer"
                >
                  Enable Motion
                </button>
                <button
                  onClick={() => {
                    setShowPermissionPrompt(false);
                    startMotionListeners();
                  }}
                  className="text-[13px] text-neutral-400 hover:text-black py-1 transition cursor-pointer"
                >
                  Continue without motion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send Email Confirmation Alert (Yes/No CTAs) */}
        {showSendAlert && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-[20px] p-[24px] w-full max-w-[320px] shadow-2xl border border-[#e0e3e5] flex flex-col gap-[16px]">
              <div className="flex flex-col gap-[6px]">
                <h3 className="text-[19px] font-medium text-black leading-[24px]">Send email?</h3>
                <p className="text-[14px] text-neutral-600 leading-[20px]">
                  Are you ready to send your reply to <span className="text-black font-medium">marco.rossi@eurac.edu</span>?
                </p>
              </div>
              <div className="flex gap-[10px] w-full pt-1">
                <button
                  onClick={() => setShowSendAlert(false)}
                  className="flex-1 py-[12px] px-[14px] rounded-[12px] border border-[#d9dbe0] text-black text-[15px] font-medium hover:bg-neutral-50 transition cursor-pointer text-center"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    setShowSendAlert(false);
                    setStage(3);
                  }}
                  className="flex-1 py-[12px] px-[14px] rounded-[12px] bg-black text-white text-[15px] font-medium hover:bg-neutral-800 transition cursor-pointer text-center"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- STAGE 1: EMAIL VIEW (365:2) ----------------- */}
        {stage === 1 && (
          <div className="bg-white flex flex-col gap-[20px] items-start p-[24px] w-full flex-1" data-node-id="365:2" data-name="1. Email · Eurac colleague">
            {/* Email Toolbar */}
            <div className="border-[#e0e3e5] border-b pb-[12px] flex items-center justify-between w-full" data-node-id="369:2">
              <button
                onClick={() => setStage(3)}
                className="flex h-[48px] items-center justify-center w-[44px] text-black hover:opacity-70 transition cursor-pointer"
                data-node-id="369:6"
                aria-label="Back"
              >
                <BackIcon />
              </button>
              <button
                className="flex h-[48px] items-center justify-center w-[44px] text-black hover:opacity-70 transition cursor-pointer"
                data-node-id="369:9"
                aria-label="Delete"
              >
                <DeleteIcon />
              </button>
            </div>

            {/* Subject and Sender */}
            <div className="border-[#e0e3e5] border-b pb-[20px] flex flex-col gap-[24px] text-black w-full" data-node-id="369:3">
              <p className="leading-[32px] text-[24px] font-normal" data-node-id="369:12">
                Quick catch-up tomorrow?
              </p>
              <div className="flex flex-col gap-[6px] w-full" data-node-id="369:13">
                <p className="text-[16px] font-normal" data-node-id="369:14">
                  From: marco.rossi@eurac.edu
                </p>
                <p className="opacity-60 text-[14px] font-normal" data-node-id="369:15">
                  14 Nov 2026, 09:41
                </p>
              </div>
            </div>

            {/* Email Message & Attachment */}
            <div className="flex flex-1 flex-col gap-[16px] w-full" data-node-id="369:4">
              <div className="bg-[#fafafa] border border-[#e0e3e5] rounded-[10px] p-[16px] w-full" data-node-id="372:2">
                <div className="text-[16px] font-normal leading-[25px] text-black whitespace-pre-wrap" data-node-id="369:16">
                  <p className="mb-0">Hi,</p>
                  <p className="mb-0">&nbsp;</p>
                  <p className="mb-0">Do you have a few minutes tomorrow to go over the project updates? Let me know what time works for you.</p>
                  <p className="mb-0">&nbsp;</p>
                  <p className="mb-0">Thanks,</p>
                  <p>Marco</p>
                </div>
              </div>

              {/* Attachment */}
              <div className="flex flex-col gap-[8px] w-full" data-node-id="375:2">
                <p className="text-[14px] font-normal leading-[20px] text-black" data-node-id="375:3">
                  1 attachment
                </p>
                <div className="bg-white border border-[#d9dbe0] rounded-[8px] px-[12px] py-[8px] flex items-center gap-[8px] w-full" data-node-id="375:4">
                  <div className="text-black shrink-0" data-node-id="375:5">
                    <DocumentIcon />
                  </div>
                  <div className="flex flex-1 flex-col gap-[3px]" data-node-id="375:7">
                    <p className="text-[16px] font-normal leading-[22px] text-black" data-node-id="375:8">
                      Project updates.pdf
                    </p>
                    <p className="text-[14px] text-[#a3a3a3] leading-[20px]" data-node-id="375:9">
                      PDF document
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="border-[#e0e3e5] border-t pt-[20px] flex gap-[12px] w-full" data-node-id="369:5">
              <button
                onClick={triggerSnapUp}
                className="bg-black text-white rounded-[12px] px-[16px] py-[14px] flex items-center justify-center gap-[10px] flex-1 hover:bg-neutral-800 transition cursor-pointer"
                data-node-id="369:17"
              >
                <ReplyIcon className="w-[24px] h-[24px] text-white" />
                <span className="text-[16px] font-normal">Reply</span>
              </button>
              <button
                className="bg-white border border-black text-black rounded-[12px] px-[16px] py-[14px] flex items-center justify-center gap-[10px] flex-1 hover:bg-neutral-50 transition cursor-pointer"
                data-node-id="369:21"
              >
                <ForwardIcon className="w-[24px] h-[24px] text-black" />
                <span className="text-[16px] font-normal">Forward</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------- STAGE 2: REPLY VIEW (373:2) ----------------- */}
        {stage === 2 && (
          <div className="bg-white flex flex-col gap-[20px] items-start p-[24px] w-full flex-1" data-node-id="373:2" data-name="2. Email · Reply">
            {/* Reply Toolbar */}
            <div className="border-[#e0e3e5] border-b pb-[12px] flex items-center justify-between w-full" data-node-id="373:3">
              <button
                onClick={() => setStage(1)}
                className="flex h-[48px] items-center justify-center w-[44px] text-black hover:opacity-70 transition cursor-pointer"
                data-node-id="373:4"
                aria-label="Back"
              >
                <BackIcon />
              </button>
              <button
                onClick={() => setStage(1)}
                className="flex h-[48px] items-center justify-center w-[44px] text-black hover:opacity-70 transition cursor-pointer"
                data-node-id="373:7"
                aria-label="Delete"
              >
                <DeleteIcon />
              </button>
            </div>

            {/* Replying Status Tag */}
            <div className="bg-[#c0dec2] px-[8px] py-[4px] rounded-[4px] shrink-0" data-node-id="374:3">
              <span className="text-[12px] font-normal text-black uppercase tracking-normal" data-node-id="374:4">
                REPLY
              </span>
            </div>

            {/* Subject and Recipient */}
            <div className="border-[#e0e3e5] border-b pb-[16px] flex flex-col gap-[24px] w-full" data-node-id="373:10">
              <div className="w-full" data-node-id="374:2">
                <p className="text-[24px] font-normal leading-[32px] text-black" data-node-id="373:11">
                  Re: Quick catch-up tomorrow?
                </p>
              </div>
              <div className="flex flex-col gap-[16px] w-full" data-node-id="383:13">
                <div className="w-full" data-node-id="373:12">
                  <p className="text-[16px] font-normal text-black" data-node-id="373:13">
                    To: marco.rossi@eurac.edu
                  </p>
                </div>
                <div className="bg-[#e0e3e5] h-px w-full" data-node-id="383:12" />
                <div className="w-full" data-node-id="383:8">
                  <p className="text-[16px] font-normal text-black" data-node-id="383:9">
                    Cc:
                  </p>
                </div>
              </div>
            </div>

            {/* Your Answer Textarea Container */}
            <div className="bg-[#fafafa] border border-[#e0e3e5] rounded-[10px] p-[16px] w-full min-h-[160px] h-[240px] flex flex-col relative" data-node-id="373:28">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full h-full bg-transparent text-[16px] leading-[24px] text-black font-normal resize-none focus:outline-none caret-black"
                data-node-id="373:29"
                autoFocus
              />
              {!replyText && !isFocused && (
                <div className="absolute top-[18px] left-[16px] pointer-events-none flex items-center">
                  <span className="inline-block w-[1.5px] h-[20px] bg-black animate-pulse" />
                </div>
              )}
            </div>

            {/* Quoted Previous Email */}
            <div className="flex flex-1 flex-col w-full pb-4" data-node-id="373:15">
              <div className="border-[#e0e3e5] border-l-2 pl-[16px] flex flex-col gap-[14px] text-black w-full" data-node-id="373:30">
                <div className="opacity-60 text-[14px] font-normal leading-[21px]" data-node-id="373:31">
                  <p className="mb-0">From: marco.rossi@eurac.edu</p>
                  <p>14 Nov 2026, 09:41</p>
                </div>
                <div className="text-[16px] font-normal leading-[25px] whitespace-pre-wrap" data-node-id="373:32">
                  <p className="mb-0">Hi,</p>
                  <p className="mb-0">&nbsp;</p>
                  <p className="mb-0">Do you have a few minutes tomorrow to go over the project updates? Let me know what time works for you.</p>
                  <p className="mb-0">&nbsp;</p>
                  <p className="mb-0">Thanks,</p>
                  <p>Marco</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- STAGE 3: INBOX WITH CONFIRMATION (384:2) ----------------- */}
        {stage === 3 && (
          <div className="bg-white flex flex-col gap-[20px] items-start p-[24px] w-full flex-1" data-node-id="384:2" data-name="3. Email · Inbox with sent confirmation">
            {/* Sent Notification Banner */}
            {showNotification && (
              <div
                className={`w-full transition-all duration-700 ease-out overflow-hidden ${isNotificationFading
                  ? 'opacity-0 max-h-0 -translate-y-2 pointer-events-none'
                  : 'opacity-100 max-h-[140px]'
                  }`}
              >
                <div className="bg-[#c0dec2] rounded-[10px] px-[16px] py-[14px] flex items-center gap-[12px] text-black w-full" data-node-id="386:2">
                  <span className="text-[20px] font-normal leading-none" data-node-id="386:3">
                    ✓
                  </span>
                  <div className="flex flex-1 flex-col gap-[4px]" data-node-id="386:4">
                    <p className="text-[16px] font-semibold leading-[22px]" data-node-id="386:5">
                      Email sent
                    </p>
                    <div className="text-[14px] font-normal leading-[20px]" data-node-id="386:6">
                      <p className="mb-0">Your reply was sent to</p>
                      <p>marco.rossi@eurac.edu</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inbox Header */}
            <div className="flex items-center justify-between w-full" data-node-id="386:7">
              <p className="text-[24px] font-normal text-black" data-node-id="386:8">
                Inbox
              </p>
              <div className="bg-black text-white rounded-[8px] px-[16px] py-[8px] cursor-pointer" data-node-id="386:9">
                <span className="text-[16px] font-normal leading-[22px]" data-node-id="386:10">
                  New email
                </span>
              </div>
            </div>

            {/* Search Box */}
            <div className="bg-[#fafafa] border border-[#e0e3e5] rounded-[10px] h-[44px] px-[14px] flex items-center w-full" data-node-id="386:11">
              <span className="text-[16px] font-normal opacity-60 text-black" data-node-id="386:12">
                Search emails
              </span>
            </div>

            {/* Email Inbox List */}
            <div className="flex flex-col w-full" data-node-id="386:13">
              {/* Email 1: Marco Rossi (Clickable to restart flow) */}
              <div
                onClick={() => setStage(1)}
                className="border-[#e0e3e5] border-b py-[14px] flex flex-col gap-[5px] w-full cursor-pointer hover:bg-neutral-50 transition rounded-lg px-1 -mx-1"
                data-node-id="386:14"
              >
                <div className="flex items-center justify-between text-black w-full" data-node-id="386:15">
                  <p className="text-[16px] font-semibold leading-[22px]" data-node-id="386:16">
                    Marco Rossi
                  </p>
                  <p className="text-[14px] opacity-60 font-normal leading-[20px]" data-node-id="386:17">
                    09:41
                  </p>
                </div>
                <p className="text-[16px] font-normal leading-[22px] text-black" data-node-id="386:18">
                  Quick catch-up tomorrow?
                </p>
                <div className="flex items-start gap-[6px] w-full" data-node-id="389:56">
                  <AiSummaryIcon />
                  <p className="text-[14px] opacity-60 font-normal leading-[20px] text-black flex-1" data-node-id="386:19">
                    Project catch-up tomorrow; reply sent.
                  </p>
                </div>
              </div>

              {/* Email 2: Research team */}
              <div className="border-[#e0e3e5] border-b py-[14px] flex flex-col gap-[5px] w-full" data-node-id="386:20">
                <div className="flex items-center justify-between text-black w-full" data-node-id="386:21">
                  <p className="text-[16px] font-semibold leading-[22px]" data-node-id="386:22">
                    Research team
                  </p>
                  <p className="text-[14px] opacity-60 font-normal leading-[20px]" data-node-id="386:23">
                    09:15
                  </p>
                </div>
                <p className="text-[16px] font-normal leading-[22px] text-black" data-node-id="386:24">
                  Weekly project update
                </p>
                <div className="flex items-start gap-[6px] w-full" data-node-id="389:57">
                  <AiSummaryIcon />
                  <p className="text-[14px] opacity-60 font-normal leading-[20px] text-black flex-1" data-node-id="386:25">
                    Weekly project updates ready for review.
                  </p>
                </div>
              </div>

              {/* Email 3: Anna Weber */}
              <div className="border-[#e0e3e5] border-b py-[14px] flex flex-col gap-[5px] w-full" data-node-id="386:26">
                <div className="flex items-center justify-between text-black w-full" data-node-id="386:27">
                  <p className="text-[16px] font-normal leading-[22px]" data-node-id="386:28">
                    Anna Weber
                  </p>
                  <p className="text-[14px] opacity-60 font-normal leading-[20px]" data-node-id="386:29">
                    Yesterday
                  </p>
                </div>
                <p className="text-[16px] font-normal leading-[22px] text-black" data-node-id="386:30">
                  Notes from our meeting
                </p>
                <div className="flex items-start gap-[6px] w-full" data-node-id="389:64">
                  <AiSummaryIcon />
                  <p className="text-[14px] opacity-60 font-normal leading-[20px] text-black flex-1" data-node-id="386:31">
                    Meeting notes shared after the discussion.
                  </p>
                </div>
              </div>

              {/* Email 4: IT Services */}
              <div className="border-[#e0e3e5] border-b py-[14px] flex flex-col gap-[5px] w-full" data-node-id="386:32">
                <div className="flex items-center justify-between text-black w-full" data-node-id="386:33">
                  <p className="text-[16px] font-normal leading-[22px]" data-node-id="386:34">
                    IT Services
                  </p>
                  <p className="text-[14px] opacity-60 font-normal leading-[20px]" data-node-id="386:35">
                    Yesterday
                  </p>
                </div>
                <p className="text-[16px] font-normal leading-[22px] text-black" data-node-id="386:36">
                  Your account update
                </p>
                <div className="flex items-start gap-[6px] w-full" data-node-id="389:71">
                  <AiSummaryIcon />
                  <p className="text-[14px] opacity-60 font-normal leading-[20px] text-black flex-1" data-node-id="386:37">
                    Your account settings were updated.
                  </p>
                </div>
              </div>

              {/* Email 5: Eurac Research */}
              <div className="border-[#e0e3e5] border-b py-[14px] flex flex-col gap-[5px] w-full" data-node-id="386:38">
                <div className="flex items-center justify-between text-black w-full" data-node-id="386:39">
                  <p className="text-[16px] font-semibold leading-[22px]" data-node-id="386:40">
                    Eurac Research
                  </p>
                  <p className="text-[14px] opacity-60 font-normal leading-[20px]" data-node-id="386:41">
                    12 Nov
                  </p>
                </div>
                <p className="text-[16px] font-normal leading-[22px] text-black" data-node-id="386:42">
                  Upcoming events
                </p>
                <div className="flex items-start gap-[6px] w-full" data-node-id="389:78">
                  <AiSummaryIcon />
                  <p className="text-[14px] opacity-60 font-normal leading-[20px] text-black flex-1" data-node-id="386:43">
                    Roundup of this month’s upcoming events.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
