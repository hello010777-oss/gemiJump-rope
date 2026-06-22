import React, { useState, useEffect, useRef } from 'react';
import { Camera, Volume2, VolumeX, RefreshCw, Trophy, ArrowLeft, Star, Heart, Sparkles, Smile, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playBoing, playSuccess, playSwoosh, startRhythmBeat, stopRhythmBeat, playPop, playGrandCelebration } from '../utils/audio';

interface Props {
  onBack: () => void;
  cameraStream: MediaStream | null;
  cameraState: 'requesting' | 'active' | 'error' | 'fallback';
}

export default function CameraPractice({ onBack, cameraStream, cameraState }: Props) {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [count, setCount] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Custom snapshot highlight
  const [photoCountdown, setPhotoCountdown] = useState<number | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const photoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Rope rendering state
  const ropeAngleRef = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Get BPM by speed
  const getBpm = () => {
    if (speed === 'slow') return 75;
    if (speed === 'fast') return 115;
    return 95;
  };

  // Turn on/off Web audio metronome beat
  useEffect(() => {
    if (isPlaying && soundEnabled && !showCelebration) {
      startRhythmBeat(getBpm());
    } else {
      stopRhythmBeat();
    }
    return () => stopRhythmBeat();
  }, [isPlaying, soundEnabled, speed, showCelebration]);

  // Handle active camera streaming from shared parent props
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => console.warn(err));
    }
  }, [cameraStream, cameraState]);

  // Rhythm swing sound trigger matching the bpm (no auto count increment!)
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && !showCelebration) {
      const msPerJump = (60 / getBpm()) * 1000;
      interval = setInterval(() => {
        if (soundEnabled) {
          playBoing();
        }
      }, msPerJump);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, speed, showCelebration, soundEnabled]);

  // Rope loop draw loop
  useEffect(() => {
    let animId: number;

    const renderRopeOverCamera = (timestamp: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Calculate swing frequency
      const bpm = getBpm();
      const degPerSec = (bpm / 60) * 360;

      // Only move the rope when playing AND not celebrating!
      if (isPlaying && !showCelebration) {
        ropeAngleRef.current = (ropeAngleRef.current + degPerSec * deltaTime) % 360;

        // Trigger swing swoosh audio sync
        const prevNormalized = (ropeAngleRef.current - degPerSec * deltaTime) % 360;
        if (prevNormalized < 270 && ropeAngleRef.current >= 270) {
          if (soundEnabled) playSwoosh();
        }
      } else if (showCelebration) {
        // Safe cozy bottom smiling arc curve (90 degrees makes it curve straight down)
        ropeAngleRef.current = 90;
      }

      // Draw virtual canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const cx = canvas.width / 2;
          const cy = canvas.height / 2 + 50;

          // Compute rope curvature coordinate
          const angleRad = (ropeAngleRef.current * Math.PI) / 180;
          
          // Width and height of swing orbit
          const rX = canvas.width * 0.46; // Extended width to reach closer to camera border edges
          const rY = canvas.height * 0.45; // Perfect vertical circular swing amplitude

          const handleY = cy - 80;

          // Draw neon chroma-key virtual rope as a uniform circular sine-harmonic sweep
          ctx.beginPath();
          const steps = 40;
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const rx = (cx - rX) + (2 * rX) * t;
            const sag = rY * Math.sin(Math.PI * t);
            const ry = handleY + sag * Math.sin(angleRad);
            if (i === 0) {
              ctx.moveTo(rx, ry);
            } else {
              ctx.lineTo(rx, ry);
            }
          }

          // Soft green/cyan glow shadow
          ctx.shadowColor = '#00ffcc';
          ctx.shadowBlur = 12;
          ctx.strokeStyle = '#00ffcc'; // Magical chroma green-cyan
          ctx.lineWidth = 10;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          // Sparkle line core
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Hand Handle Anchors (cute yellow balls)
          ctx.fillStyle = '#ffde59';
          ctx.beginPath();
          ctx.arc(cx - rX, handleY, 12, 0, 2 * Math.PI);
          ctx.arc(cx + rX, handleY, 12, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(renderRopeOverCamera);
    };

    animId = requestAnimationFrame(renderRopeOverCamera);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed, soundEnabled, showCelebration]);

  // Start jumping training session
  const handleStartPractice = () => {
    playPop();
    setCount(0);
    setCountdown(3);
    const countTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(countTimer);
          setIsPlaying(true);
          playSuccess();
          return null;
        }
        playPop();
        return prev - 1;
      });
    }, 1000);
  };

  const triggerFireworks = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleFinishPractice = () => {
    setIsPlaying(false);
    setShowCelebration(true);
    setShowSuccessBanner(true);
    playGrandCelebration();
    triggerFireworks();

    // Auto-hide the success banner after 4.5 seconds so they can capture clear photo
    setTimeout(() => {
      setShowSuccessBanner(false);
    }, 4500);
  };

  const handleStopPractice = () => {
    setIsPlaying(false);
    playPop();
  };

  // Snap photo with virtual frames after 3, 2, 1 countdown
  const handleTakeSnapshot = () => {
    if (photoCountdown !== null) return;
    playPop();
    setPhotoCountdown(3);

    let current = 3;
    const interval = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setPhotoCountdown(current);
        playPop();
      } else {
        clearInterval(interval);
        setPhotoCountdown(null);

        // Draw snapshot immediately
        const video = videoRef.current;
        const canvas = photoCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw raw video stream
        if (cameraState === 'active' && video) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        setCapturedPhoto(canvas.toDataURL('image/png'));
        playSuccess();
      }
    }, 1000);
  };

  const handleDownloadPhoto = () => {
    if (!capturedPhoto) return;
    const link = document.createElement('a');
    link.download = `photo_${Date.now()}.png`;
    link.href = capturedPhoto;
    link.click();
    playPop();
  };

  return (
    <div className="flex flex-col items-center glass-panel min-h-screen pb-12 w-full max-w-none xl:max-w-[95%] mx-auto rounded-[3.5rem] shadow-2xl p-4 md:p-6 relative overflow-hidden bg-white/35 backdrop-blur-md">
      
      {/* Huge Step Banner */}
      <div className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xl md:text-2xl py-3.5 px-6 rounded-3xl border-2 border-white shadow-md text-center mb-5 animate-pulse animate-duration-3000">
        🎈 3단계: 실전 줄넘기 트레이닝 👑
      </div>
      
      {/* Background decorations */}
      <div className="absolute top-10 right-10 text-pink-300 pointer-events-none opacity-40">
        <Sparkles className="w-24 h-24 stroke-current fill-current" />
      </div>

      {/* Top action header bar */}
      <div className="flex justify-between w-full items-center mb-6 z-10">
        <button
          onClick={() => {
            playPop();
            onBack();
          }}
          className="bg-rose-100 text-[#c23b22] hover:bg-rose-200 font-bold px-5 py-2.5 rounded-2xl flex items-center gap-1.5 transition text-base border-2 border-white cursor-pointer shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>뒤로 가기</span>
        </button>

        <div className="bg-[#FFE569]/90 text-[#333333] px-5 py-2 rounded-full font-display border-2 border-white text-base font-extrabold flex items-center gap-1.5 shadow-sm">
          <Trophy className="w-5 h-5 text-amber-600 fill-amber-500" />
          <span>3단계 도전 줄넘기 👑</span>
        </div>
      </div>

      {/* Main Practice Core Stage */}
      <div className="flex flex-col gap-6 w-full z-10">
        
        {/* Center / Camera Render Frame Viewports */}
        <div className="w-full flex flex-col gap-4">
          
          <div className="relative w-full h-[60vh] md:h-[72vh] lg:h-[78vh] min-h-[580px] max-h-[1100px] bg-slate-950 rounded-[36px] overflow-hidden border-[6px] border-white shadow-2xl">
            
            {/* Real Web camera screen or animated fallback avatar */}
            {cameraState === 'active' ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]" // mirror effect
              />
            ) : cameraState === 'requesting' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900 gap-3">
                <Camera className="w-12 h-12 text-yellow-400 animate-spin" />
                <span className="text-lg font-bold font-display">카메라 요정을 준비하고 있어요... 🧚</span>
              </div>
            ) : (
              // Cute fallback cartoon character exercising if no hardware camera
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-8 text-center text-white">
                <div className="relative w-28 h-28 mb-4">
                  <div className="absolute inset-0 bg-pink-500/20 rounded-full animate-ping" />
                  <div className="w-28 h-28 bg-[#ff7043] rounded-full flex items-center justify-center text-5xl border-4 border-white animate-bounce">
                    🐱
                  </div>
                </div>
                <h5 className="text-xl font-display font-black text-yellow-300 mb-1">
                  가상 인형과 연습 모드 가동!
                </h5>
                <p className="text-sm opacity-85 max-w-sm">
                  카메라가 없거나 꺼져 있어도 화면 속 가상 점프 루프 타이밍에 맞춰서 즐겁게 실내 줄넘기 놀이를 할 수 있답니다!
                </p>
              </div>
            )}

            {/* Overlap neon rope Canvas */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Huge Overlay Countdown timer */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="bg-[#ff4081] text-white rounded-full w-36 h-36 flex items-center justify-center border-8 border-white animate-ping">
                  <span className="text-7xl font-display font-black text-white">{countdown}</span>
                </div>
              </div>
            )}

            {/* Photo Countdown Overlay */}
            {photoCountdown !== null && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30 animate-fade-in">
                <div className="text-yellow-300 font-display font-black text-2xl md:text-3xl mb-4 tracking-tight animate-bounce">
                  📸 치~즈! 멋진 포즈 준비! ✌️
                </div>
                <div className="bg-pink-500 text-white rounded-full w-40 h-40 flex items-center justify-center border-8 border-white shadow-2xl animate-pulse">
                  <span className="text-8xl font-display font-black text-white">{photoCountdown}</span>
                </div>
              </div>
            )}



            {/* Live Count Counter top bar overlay */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-5 py-2.5 rounded-full backdrop-blur-xs flex items-center gap-2 border border-white/20">
              <div className="w-4 h-4 rounded-full bg-red-500 animate-ping" />
              <span className="text-sm font-bold">카운트:</span>
              <span className="text-3xl font-display font-black text-yellow-300 leading-none">{count}개</span>
              <span className="text-xs opacity-70">/ 30개 목표</span>
            </div>

            {/* Floating Celebration Success Elements over camera */}
            {showSuccessBanner && (
              <div className="absolute inset-x-4 top-[15%] md:top-[25%] bg-black/85 backdrop-blur-md rounded-[2.5rem] border-4 border-yellow-300 p-6 text-center z-20 animate-bounce text-white shadow-2xl max-w-lg mx-auto pointer-events-none">
                <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center text-4xl border-2 border-white mx-auto mb-3 shadow-md">
                  🥇
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-black text-yellow-300 drop-shadow-md mb-2 leading-tight">
                  축하해!! 줄넘기 마스터 등극! 🎉
                </h3>
                <p className="text-xs md:text-sm font-bold opacity-90 leading-relaxed">
                  3단계 실전 줄넘기 연습 미션 클리어! ⭐<br/>
                  몸도 마음도 무럭무럭 자라는 점프 대장 튼튼이! 💪<br/>
                  멋진 포즈를 취하고 아래 <span className="text-yellow-300 font-extrabold">기념 촬영 📸</span> 버튼을 눌러보세요!
                </p>
              </div>
            )}

            {/* Persistent celebratory pill when completed */}
            {showCelebration && !showSuccessBanner && (
              <div className="absolute top-[80px] left-4 bg-gradient-to-r from-amber-500/95 to-yellow-500/95 text-white border-2 border-white px-4 py-2 rounded-2xl shadow-lg z-20 pointer-events-none flex items-center gap-1.5 text-xs font-black animate-pulse animate-duration-3000">
                <Trophy className="w-4 h-4 text-white fill-white animate-spin duration-10000" />
                <span>👑 줄넘기 마스터 미션성공!</span>
              </div>
            )}

          </div>

          {/* Action Trigger Pad bar with Speed Controls at the Bottom */}
          <div className="flex flex-col gap-6 w-full bg-white/45 p-6 md:p-8 rounded-[2.5rem] border-2 border-white shadow-xs items-center">
            
            {/* Speed & Sound Controls side-by-side with classroom interactive triggers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-4xl">
              
              {/* Left Column: Speed & Sound Settings */}
              <div className="flex flex-col items-center gap-3 bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100/60 shadow-xs">
                <span className="text-emerald-950 font-black text-xs md:text-sm flex items-center gap-1 bg-white/80 px-4 py-1.5 rounded-full shadow-2xs">
                  ⚡ 줄넘기 가상 속도 및 구령 조절
                </span>
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  <button
                    onClick={() => {
                      setSpeed('slow');
                      playPop();
                    }}
                    className={`py-2.5 px-3 rounded-2xl border-4 text-xs font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 ${
                      speed === 'slow' 
                        ? 'bg-amber-300 border-white text-green-955 font-black scale-102 shadow-md ring-4 ring-amber-400/20' 
                        : 'bg-white border-emerald-200 text-[#004d40] hover:bg-emerald-50/30'
                    }`}
                  >
                    <span className="text-lg">🐌</span> 느리게
                  </button>

                  <button
                    onClick={() => {
                      setSpeed('normal');
                      playPop();
                    }}
                    className={`py-2.5 px-3 rounded-2xl border-4 text-xs font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 ${
                      speed === 'normal' 
                        ? 'bg-orange-300 border-white text-green-955 font-black scale-102 shadow-md ring-4 ring-orange-400/20' 
                        : 'bg-white border-emerald-200 text-[#004d40] hover:bg-emerald-50/30'
                    }`}
                  >
                    <span className="text-lg">🐰</span> 보통
                  </button>

                  <button
                    onClick={() => {
                      setSpeed('fast');
                      playPop();
                    }}
                    className={`py-2.5 px-3 rounded-2xl border-4 text-xs font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 ${
                      speed === 'fast' 
                        ? 'bg-pink-300 border-white text-green-955 font-black scale-102 shadow-md ring-4 ring-pink-400/20' 
                        : 'bg-white border-emerald-200 text-[#004d40]'
                    }`}
                  >
                    <span className="text-lg">🐆</span> 빠르게
                  </button>

                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      playPop();
                    }}
                    className={`py-2.5 px-3 rounded-2xl border-4 text-xs font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 ${
                      soundEnabled 
                        ? 'bg-emerald-500 border-white text-white scale-102 shadow-md ring-4 ring-emerald-400/20' 
                        : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    {soundEnabled ? (
                      <>
                        <Volume2 className="w-4 h-4 text-emerald-100 animate-pulse" />
                        <span>구령 소리 On</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-4 h-4 text-stone-400" />
                        <span>구령 소리 Off</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Key Classroom Interaction (Click-when-jumped-well & custom snapshot) */}
              <div className="flex flex-col items-center gap-3 bg-blue-50/50 p-4 rounded-3xl border border-blue-100/60 shadow-xs">
                <span className="text-blue-950 font-black text-xs md:text-sm flex items-center gap-1 bg-white/80 px-4 py-1.5 rounded-full shadow-2xs">
                  🎯 실시간 점수 & 촬영 제어
                </span>
                <div className="grid grid-cols-2 gap-2.5 w-full h-full">
                  {/* Human parent booster trigger to increment points manually */}
                  <button
                    onClick={() => {
                      setCount(prev => {
                        const val = prev + 1;
                        playBoing();
                        if (val >= 30) handleFinishPractice();
                        return val;
                      });
                    }}
                    className="bg-blue-400 border-b-6 border-blue-700 hover:bg-blue-505 hover:bg-blue-500 text-white font-display font-black text-xs sm:text-sm p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-md tactile-btn-primary"
                  >
                    <span className="text-xl">⭐</span>
                    <span className="leading-tight">잘 뛰었을 때 터치!</span>
                  </button>

                  {/* Photography stamp capture */}
                  <button
                    onClick={handleTakeSnapshot}
                    className="bg-purple-400 border-b-6 border-purple-700 hover:bg-purple-505 hover:bg-purple-500 text-white font-display font-black text-xs sm:text-sm p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-md tactile-btn-purple"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="leading-tight">찰칵! 기념 촬영</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Row: Large Success/Reset actions directly underneath */}
            <div className="flex justify-center w-full max-w-4xl border-t border-dashed border-stone-200/60 pt-4">
              {showCelebration ? (
                <button
                  onClick={() => {
                    setShowCelebration(false);
                    setShowSuccessBanner(false);
                    setCount(0);
                    setIsPlaying(true);
                    playPop();
                  }}
                  className="bg-emerald-500 border-b-8 border-emerald-700 hover:bg-emerald-600 text-white font-display font-black text-xl py-5 rounded-3xl flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-md tactile-btn-success w-full justify-center"
                >
                  <RefreshCw className="w-5 h-5 animate-spin duration-3000" />
                  <span>🔄 다시 줄 돌리기 & 연습 시작!</span>
                </button>
              ) : (
                <button
                  onClick={handleFinishPractice}
                  className="bg-[#D81B60] border-b-8 border-pink-700 hover:bg-pink-600 text-white font-display font-black text-xl py-5 rounded-3xl flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-md tactile-btn-pink w-full justify-center"
                >
                  <span>🏆 미션 성공!</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Hidden photo canvas for generating high-quality snapshot certificates */}
      <canvas
        ref={photoCanvasRef}
        width={640}
        height={480}
        className="hidden"
      />

      {/* Custom Captured Snapshot Modal Popup preview with frosted glass styling */}
      {capturedPhoto && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-lg rounded-[2.5rem] border-4 border-white p-6 max-w-lg w-full text-center relative shadow-2xl">
            
            <h4 className="text-2xl font-display font-black text-[#5d4037] mb-1 flex items-center justify-center gap-2">
              📸 줄넘기 대장 기념사진 완성!
            </h4>
            
            <p className="text-sm font-bold text-amber-800 mb-4">
              멋진 모습이 박자에 맞춰 담겼어요! 디바이스에 저장해 자랑해 보세요.
            </p>

            <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-lg mb-6 max-w-md mx-auto aspect-video">
              <img 
                src={capturedPhoto} 
                alt="Captured Jump Rope badge"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDownloadPhoto}
                className="bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 text-white font-bold py-2.5 px-6 rounded-2xl flex items-center gap-2 transition active:scale-95 cursor-pointer text-sm shadow-md tactile-btn-success"
              >
                <Download className="w-4 h-4" />
                <span>기기 백업 / 다운로드</span>
              </button>
              
              <button
                onClick={() => {
                  setCapturedPhoto(null);
                  playPop();
                }}
                className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold py-2.5 px-6 rounded-2xl transition active:scale-95 cursor-pointer text-sm"
              >
                다시 찍기 위해 닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
