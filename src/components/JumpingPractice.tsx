import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Star, Play, Pause, Award, HelpCircle, ArrowRight } from 'lucide-react';
import { playBoing, playSuccess, playPop } from '../utils/audio';

interface Props {
  onSuccess: () => void;
  onReset?: () => void;
  isCompleted: boolean;
  cameraStream: MediaStream | null;
  cameraState: 'requesting' | 'active' | 'error' | 'fallback';
}

export default function JumpingPractice({ onSuccess, onReset, isCompleted, cameraStream, cameraState }: Props) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [feedbacks, setFeedbacks] = useState<string>('음악 박자에 맞춰 사뿐사뿐 뛰어보아요! 🐰');
  const [companionState, setCompanionState] = useState<'idle' | 'jumping' | 'perfect'>('idle');
  const [successCelebration, setSuccessCelebration] = useState<boolean>(isCompleted);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const getBpm = () => {
    if (speed === 'slow') return 75;
    if (speed === 'fast') return 115;
    return 95;
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const beatTimerRef = useRef<any>(null);
  const beatProgressRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

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
      setSuccessCount(0);
      setIsPlaying(true);
    }
  }, [isCompleted]);

  // Synchronized animation loop using requestAnimationFrame
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Pulse effect score helper
  const isTargetHitWindowRef = useRef<boolean>(false);

  // Jump score tracker
  const scoreRef = useRef<number>(0);

  // Ensure isPlaying is accessible in event handlers inside key listeners
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    
    if (isPlaying && !successCelebration) {
      // Setup rhythmic beat tracker
      const beatInterval = (60 / getBpm()) * 1000;
      
      const trackBeat = () => {
        // Trigger visual boom/beat effect
        beatProgressRef.current = 1;
        setCompanionState('jumping');
        playBoing();

        // 200ms Hit score window
        isTargetHitWindowRef.current = true;
        
        setTimeout(() => {
          isTargetHitWindowRef.current = false;
          setCompanionState('idle');
        }, 220);

        beatTimerRef.current = setTimeout(trackBeat, beatInterval);
      };

      trackBeat();
    } else {
      if (beatTimerRef.current) {
        clearTimeout(beatTimerRef.current);
      }
      setCompanionState('idle');
    }

    return () => {
      if (beatTimerRef.current) {
        clearTimeout(beatTimerRef.current);
      }
    };
  }, [isPlaying, speed, successCelebration]);

  // Handle human jump trigger (clicking space or tapping Jump)
  const handleJumpTrigger = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      setFeedbacks('쿵작 쿵작! 박자에 맞춰 화면을 톡톡 뛰어요!');
      return;
    }

    if (successCelebration) return;

    // Trigger local audio feedback immediately
    playBoing();
    setCompanionState('perfect');
    
    // Check if within jump beat hit window
    if (isTargetHitWindowRef.current) {
      const compliments = ['우와!! 최고에요! 👍', '쿵짝! 박자가 딱 맞아요! ⭐', '대단해! 점프 천재! 🎉', '너무 귀여운 바운스! 🐰'];
      const randomMsg = compliments[Math.floor(Math.random() * compliments.length)];
      setFeedbacks(randomMsg);
      
      const nextCount = successCount + 1;
      setSuccessCount(nextCount);

      if (nextCount >= 8) {
        setIsPlaying(false);
        setSuccessCelebration(true);
        playSuccess();
        onSuccess();
      }
    } else {
      setFeedbacks('아차! 조금만 기다렸다가 비트와 함께 폴짝! 뛰어봐요 🐇');
    }

    setTimeout(() => {
      if (isPlayingRef.current) setCompanionState('idle');
    }, 150);
  };

  // Keyboard shortcut listener for spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJumpTrigger();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, successCount, successCelebration]);

  const handleReset = () => {
    setSuccessCount(0);
    setSuccessCelebration(false);
    setIsPlaying(true);
    setFeedbacks('새롭게 도전! 다시 박자에 몸을 실어볼까요?');
    playPop();
    if (onReset) onReset();
  };

  return (
    <div id="jumping-practice" className="flex flex-col items-center glass-panel p-4 md:p-6 rounded-[3.5rem] shadow-2xl w-full max-w-none xl:max-w-[95%] mx-auto relative overflow-hidden bg-white/35 backdrop-blur-md">
      
      {/* Huge Step Banner */}
      <div className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-black text-xl md:text-2xl py-3.5 px-6 rounded-3xl border-2 border-white shadow-md text-center mb-5 animate-pulse animate-duration-3000">
        🎈 2단계: 발꿈치를 들고 사뿐사뿐 점프하기 🐰
      </div>

      {/* Jumping Visual Area containing Live Camera (MAXIMIZED VIEWPORT FOR 50/65-INCH WHITEBOARD) */}
      <div 
        onClick={handleJumpTrigger}
        className="relative w-full h-[60vh] md:h-[72vh] lg:h-[78vh] min-h-[580px] max-h-[1100px] bg-slate-950 rounded-[2.5rem] border-[6px] border-white flex flex-col items-center justify-end p-6 overflow-hidden mb-6 shadow-2xl cursor-pointer"
      >
        
        {/* Background Video Mirror */}
        {cameraState === 'active' ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1] opacity-75 animate-fade-in pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pointer-events-none" />
        )}

        {/* Sky Clouds decoration */}
        <div className="absolute top-4 left-6 w-16 h-8 bg-white opacity-40 rounded-full animate-pulse z-10 pointer-events-none" />
        <div className="absolute top-8 right-10 w-20 h-10 bg-white opacity-40 rounded-full animate-bounce duration-5000 z-10 pointer-events-none" />

        {/* Bouncing Circle Guide representing beat */}
        {isPlaying && !successCelebration && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-emerald-500 text-white border-2 border-white px-5 py-2 rounded-full animate-bounce shadow-lg z-25 pointer-events-none">
            <span className="w-3.5 h-3.5 rounded-full bg-yellow-300 animate-ping" />
            <span className="text-sm font-black">음악 박자에 맞춰 점프! 🎶</span>
          </div>
        )}

        {/* Main Companion Character (Cute Jumping Rabbit) */}
        <div 
          className="relative transition-all duration-100 flex flex-col items-center justify-center select-none mb-4 z-20"
          style={{
            transform: companionState === 'jumping' 
              ? 'translateY(-80px) scaleY(1.05)' 
              : companionState === 'perfect' 
              ? 'translateY(-100px) scaleY(1.1) rotate(5deg)' 
              : 'translateY(0px) scaleY(0.95)',
          }}
        >
          {/* Bunny Ears */}
          <div className="flex gap-4 -mb-2">
            <div className="w-4 h-12 bg-pink-100 border-4 border-[#f8bbd0] rounded-t-full origin-bottom rotate-12" />
            <div className="w-4 h-12 bg-pink-100 border-4 border-[#f8bbd0] rounded-t-full origin-bottom -rotate-12" />
          </div>

          {/* Bunny Head & Body */}
          <div className="w-24 h-24 bg-white border-4 border-pink-200 rounded-full shadow-lg flex items-center justify-center relative">
            {/* Blushing cheeks */}
            <div className="absolute bottom-5 left-3 w-5 h-5 bg-pink-300 rounded-full blur-xs opacity-60" />
            <div className="absolute bottom-5 right-3 w-5 h-5 bg-pink-300 rounded-full blur-xs opacity-60" />

            {/* Cute eyes */}
            <div className="flex gap-5 mb-2">
              <span className="text-xl font-bold">●</span>
              <span className="text-xl font-bold">●</span>
            </div>
            
            {/* Cute Mouth */}
            <span className="absolute bottom-6 text-[#ff8a80] text-base font-black">ㅅ</span>

            {/* Body Star Logo */}
            <div className="absolute bottom-2.5 w-6 h-6 bg-yellow-400 rotate-12 rounded-full flex items-center justify-center text-xs text-white font-extrabold">
              ★
            </div>
          </div>

          {/* Jump dust clouds (only visible when jumping/perfect) */}
          {(companionState === 'jumping' || companionState === 'perfect') && (
            <div className="absolute -bottom-4 flex gap-2 animate-ping">
              <span className="w-4 h-2 bg-white rounded-full opacity-70" />
              <span className="w-6 h-2 bg-white rounded-full opacity-80" />
              <span className="w-4 h-2 bg-white rounded-full opacity-70" />
            </div>
          )}

          <div className="text-xs font-black text-pink-500 mt-2 bg-white px-4 py-1 rounded-full border border-pink-200 shadow-md">
            {companionState === 'perfect' ? '폴짝 성공! 💫' : '껑충! 🐰'}
          </div>
        </div>

        {/* Floor Grass Deco */}
        <div className="w-full h-8 bg-gradient-to-t from-[#81c784] to-[#a5d6a7] rounded-full border-t border-white pointer-events-none" />

      </div>

      {/* Control Buttons Panel */}
      <div className="flex flex-col gap-6 w-full bg-white/45 p-6 md:p-8 rounded-[2.5rem] border-2 border-white items-center">
        
        {/* Speed Controls (3배로 대형화 및 가로 중앙 정렬) */}
        <div className="flex flex-col items-center gap-3 w-full bg-orange-100/40 p-5 rounded-3xl border border-orange-200/60 shadow-xs max-w-2xl mx-auto">
          <span className="text-[#d84315] font-black text-xs md:text-sm flex items-center gap-1 bg-white/80 px-4 py-1.5 rounded-full shadow-2xs">
            🐰 연습 점프 속도 조절
          </span>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button 
              onClick={(e) => { e.stopPropagation(); setSpeed('slow'); playPop(); }}
              className={`flex-1 py-3.5 px-6 rounded-2xl border-4 text-sm md:text-base font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                speed === 'slow' 
                  ? 'bg-amber-300 border-white text-amber-955 font-black scale-102 shadow-md ring-4 ring-amber-400/20' 
                  : 'bg-white/95 border-orange-150 text-[#d84315] hover:bg-white'
              }`}
            >
              <span className="text-xl">🐌</span> 느리게
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setSpeed('normal'); playPop(); }}
              className={`flex-1 py-3.5 px-6 rounded-2xl border-4 text-sm md:text-base font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                speed === 'normal' 
                  ? 'bg-orange-300 border-white text-orange-955 font-black scale-102 shadow-md ring-4 ring-orange-400/20' 
                  : 'bg-white/95 border-orange-150 text-[#d84315] hover:bg-white'
              }`}
            >
              <span className="text-xl">🐰</span> 보통
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setSpeed('fast'); playPop(); }}
              className={`flex-1 py-3.5 px-6 rounded-2xl border-4 text-sm md:text-base font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                speed === 'fast' 
                  ? 'bg-pink-300 border-white text-pink-955 font-black scale-102 shadow-md ring-4 ring-pink-400/20' 
                  : 'bg-white/95 border-orange-150 text-[#d84315] hover:bg-white'
              }`}
            >
              <span className="text-xl">🐆</span> 빠르게
            </button>
          </div>
        </div>

        {/* Simplified buttons row matching steps 1 and 3 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
          {!successCelebration && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSuccessCount(8);
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
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="bg-white hover:bg-stone-50 text-stone-700 font-extrabold px-5 py-4 rounded-2xl text-sm border-2 border-stone-300 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>다시 연습하기</span>
          </button>
        </div>

      </div>

    </div>
  );
}
