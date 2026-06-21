import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, RefreshCw, Star, ArrowRight, Award } from 'lucide-react';
import { playPop, playSuccess, playSwoosh } from '../utils/audio';

interface Props {
  onSuccess: () => void;
  onReset?: () => void;
  isCompleted: boolean;
  cameraStream: MediaStream | null;
  cameraState: 'requesting' | 'active' | 'error' | 'fallback';
}

export default function WristRotationPractice({ onSuccess, onReset, isCompleted, cameraStream, cameraState }: Props) {
  const [rotations, setRotations] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [successCelebration, setSuccessCelebration] = useState<boolean>(isCompleted);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastAngleRef = useRef<number | null>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);
  const countRef = useRef<number>(0);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => console.warn(err));
    }
  }, [cameraStream, cameraState]);

  // Sync state if parent isCompleted state resets
  useEffect(() => {
    setSuccessCelebration(isCompleted);
    if (!isCompleted) {
      setRotations(0);
      countRef.current = 0;
    }
  }, [isCompleted]);

  // Restart training
  const handleReset = () => {
    setRotations(0);
    countRef.current = 0;
    setSuccessCelebration(false);
    playPop();
    if (onReset) onReset();
  };

  // Track rotational angle relative to center
  const calculateAngle = (clientX: number, clientY: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    centerRef.current = { x: cx, y: cy };

    const dx = clientX - cx;
    const dy = clientY - cy;
    // Calculate angle in radians
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += 2 * Math.PI;
    return angle;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (successCelebration) return;
    setIsRotating(true);
    const client = 'touches' in e ? e.touches[0] : e;
    const angle = calculateAngle(client.clientX, client.clientY);
    lastAngleRef.current = angle;
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isRotating || successCelebration) return;
    const client = 'touches' in e ? e.touches[0] : e;
    const angle = calculateAngle(client.clientX, client.clientY);

    if (lastAngleRef.current !== null) {
      let diff = angle - lastAngleRef.current;
      
      // Handle the 0 <-> 2PI wrap boundary
      if (diff > Math.PI) diff -= 2 * Math.PI;
      if (diff < -Math.PI) diff += 2 * Math.PI;

      // Detect clockwise rotation (positive diff)
      if (diff > 0.1 && diff < 1.0) {
        // Accumulate a bit
        lastAngleRef.current = angle;
      } else if (diff < -0.1 && diff > -1.0) {
        // Counter clockwise is also okay but guide towards clockwise info
        lastAngleRef.current = angle;
      }
      
      // We can count one rotation when user completes ~2PI cumulative change.
      // For simplicity, we can do a simpler tracking: when angle crosses 0 degrees, or count by time-based movement,
      // but let's do a cumulative angle tracker!
      
      // Let's increment rotation progress based on small ticks
      const progressValue = Math.abs(diff) / (2 * Math.PI);
      countRef.current += progressValue;
      
      const roundedCount = Math.floor(countRef.current);
      if (roundedCount > rotations) {
        setRotations(roundedCount);
        playSwoosh();
        
        if (roundedCount >= 10) {
          setIsRotating(false);
          setSuccessCelebration(true);
          playSuccess();
          onSuccess();
        }
      }
    }
  };

  const handleEnd = () => {
    setIsRotating(false);
    lastAngleRef.current = null;
  };

  useEffect(() => {
    const handleGlobalEnd = () => handleEnd();
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchend', handleGlobalEnd);
    return () => {
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, []);

  const progressPercentage = Math.min((rotations / 10) * 100, 100);

  return (
    <div id="wrist-rotation-practice" className="flex flex-col items-center glass-panel p-4 md:p-6 rounded-[3.5rem] shadow-2xl w-full max-w-none xl:max-w-[95%] mx-auto relative overflow-hidden bg-white/35 backdrop-blur-md">
      
      {/* Huge Step Banner */}
      <div className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xl md:text-2xl py-3.5 px-6 rounded-3xl border-2 border-white shadow-md text-center mb-5 animate-pulse animate-duration-3000">
        🎈 1단계: 가볍게 팔을 벌려 손목 돌리기 🔄
      </div>

      {/* Camera Live Interactive Box (MAXIMIZED VIEWPORT FOR 50/65-INCH WHITEBOARD) */}
      <div className="relative w-full h-[60vh] md:h-[72vh] lg:h-[78vh] min-h-[580px] max-h-[1100px] bg-slate-950 rounded-[2.5rem] overflow-hidden border-[6px] border-white shadow-2xl mb-6">
        {cameraState === 'active' ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        ) : cameraState === 'requesting' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900 gap-2">
            <span className="text-4xl animate-spin">🧚</span>
            <span className="text-xl font-bold">카메라를 가져오는 중...</span>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-4 text-center text-white">
            <span className="text-7xl mb-3 animate-bounce">🐹</span>
            <span className="text-2xl font-black">카메라 안전 가동 중!</span>
          </div>
        )}

        {/* Track Progress implicitly within timing helper */}
        {!successCelebration && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#FF8B13] text-white border-2 border-white px-5 py-2.5 rounded-full shadow-lg z-20 pointer-events-none">
            <span className="text-sm font-black">미션 성공 횟수: {rotations} / 10 ⭐</span>
          </div>
        )}

        {/* Custom Visual Hand Zones over camera stream */}
        <div className="absolute top-1/4 left-8 md:left-20 w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-dashed border-amber-300 flex flex-col items-center justify-center animate-pulse bg-amber-500/15 backdrop-blur-xs z-20 animate-duration-3000">
          <span className="text-xs font-black text-white bg-amber-500 px-2 py-1 rounded-full absolute -top-4 shadow-sm">왼손 돌리기</span>
          <span className={`text-2xl animate-spin ${
            speed === 'slow' ? 'duration-5000' : speed === 'fast' ? 'duration-1500' : 'duration-3000'
          }`}>🍥</span>
        </div>

        <div className="absolute top-1/4 right-8 md:right-20 w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-dashed border-pink-300 flex flex-col items-center justify-center animate-pulse bg-pink-500/15 backdrop-blur-xs z-20 animate-duration-3000">
          <span className="text-xs font-black text-white bg-pink-500 px-2 py-1 rounded-full absolute -top-4 shadow-sm">오른손 돌리기</span>
          <span className={`text-2xl animate-spin ${
            speed === 'slow' ? 'duration-5000' : speed === 'fast' ? 'duration-1500' : 'duration-3000'
          }`}>🍥</span>
        </div>
      </div>

      {/* Interactive Controls & Progress row */}
      <div className="flex flex-col xl:flex-row items-center justify-center gap-6 w-full bg-white/50 p-6 rounded-[2.5rem] border-2 border-white">
        
        {/* Success/Cheat & Reset Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
          {!successCelebration && (
            <button
              onClick={() => {
                setRotations(10);
                setSuccessCelebration(true);
                playSuccess();
                onSuccess();
              }}
              className="bg-[#2e7d32] hover:bg-emerald-700 text-white font-black px-6 py-4 rounded-2xl text-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg border-b-4 border-emerald-950 tactile-btn-success"
            >
              <span>⭐ 미션 성공완료!</span>
              <ArrowRight className="w-5 h-5 animate-pulse" />
            </button>
          )}

          <button
            onClick={handleReset}
            className="bg-white/90 text-stone-750 hover:bg-white font-black px-5 py-4 rounded-2xl text-sm border-2 border-stone-300 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>다시 연습하기</span>
          </button>
        </div>

      </div>

    </div>
  );
}
