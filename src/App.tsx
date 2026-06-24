import React, { useState, useEffect } from 'react';
import { Trophy, Star, Sparkles, Smile, Award, CheckCircle2, Flame, Heart, Play } from 'lucide-react';
import { playPop, playSuccess } from './utils/audio';
import { AppMode } from './types';
import WristRotationPractice from './components/WristRotationPractice';
import JumpingPractice from './components/JumpingPractice';
import CameraPractice from './components/CameraPractice';

export default function App() {
  const [mode, setMode] = useState<AppMode>('tutorial');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [succeededSteps, setSucceededSteps] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
  });

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'requesting' | 'active' | 'error' | 'fallback'>('requesting');

  useEffect(() => {
    let active = true;
    async function setupCamera() {
      try {
        setCameraState('requesting');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        if (active) {
          setCameraStream(stream);
          setCameraState('active');
        }
      } catch (err) {
        console.warn('Camera failed', err);
        if (active) {
          setCameraState('fallback');
        }
      }
    }
    setupCamera();
    return () => {
      active = false;
    };
  }, []);

  const handleStepSuccess = (stepId: number) => {
    setSucceededSteps(prev => ({ ...prev, [stepId]: true }));
    
    // Auto advance to next step after a tiny delay for feel-good celebration
    if (stepId === 1) {
      // Clear Step 2 completed state so it starts fresh when transitioning!
      setSucceededSteps(prev => ({ ...prev, 1: true, 2: false }));
      setTimeout(() => {
        setActiveStep(2);
      }, 2000);
    } else if (stepId === 2) {
      // Step 2 automatically transitions to Step 3 (Real Practice) after completing successfully
      setSucceededSteps(prev => ({ ...prev, 2: true, 3: false }));
      setTimeout(() => {
        setMode('camera');
        setActiveStep(3);
      }, 2000);
    }
  };

  const handleStartRealPractice = () => {
    playSuccess();
    setMode('camera');
    setActiveStep(3);
  };

  const allCompleted = succeededSteps[1] && succeededSteps[2];

  return (
    <div className="min-h-screen py-6 px-4 flex flex-col items-center select-none font-sans relative w-full max-w-none xl:max-w-[95%] mx-auto">
      
      {/* Background Blurry Glowing Frosted Blobs */}
      <div className="bg-blob w-80 h-80 bg-orange-300 top-10 left-12" />
      <div className="bg-blob w-96 h-96 bg-purple-300 bottom-10 right-10" />
      <div className="bg-blob w-72 h-72 bg-pink-300 top-1/2 left-1/3" />
      
      {/* Playful Floating Stars Deco */}
      <div className="fixed top-12 left-12 text-[#ffbe54] opacity-30 pointer-events-none animate-bounce">
        <Sparkles className="w-16 h-16 fill-current" />
      </div>
      <div className="fixed bottom-12 right-12 text-pink-400 opacity-30 pointer-events-none cute-bounce">
        <Heart className="w-16 h-16 fill-current" />
      </div>

      <div className="w-full flex flex-col items-center gap-4 z-10">
        
        {/* Title + Stepper in one single row at the very top */}
        <div className="w-full bg-white/45 backdrop-blur-md border-[4px] border-white p-3 md:py-2.5 md:px-5 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 z-10 select-none mb-2">
          {/* Title on left */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#FFD93D] rounded-xl flex items-center justify-center shadow-md transform rotate-6 animate-pulse animate-duration-3000">
              <span className="text-xl">⭐</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-black text-[#FF8B13] tracking-tight whitespace-nowrap">
              3단계 도전 줄넘기
            </h1>
          </div>

          {/* Stepper buttons including direct access to live mode */}
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <button
              onClick={() => {
                playPop();
                setMode('tutorial');
                setActiveStep(1);
                // Reset this step's completed status so they can practice again
                setSucceededSteps(prev => ({ ...prev, 1: false }));
              }}
              className={`flex-1 md:flex-initial py-3 px-5 rounded-full font-display font-black text-sm md:text-base flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border-2 shadow-sm whitespace-nowrap ${
                mode === 'tutorial' && activeStep === 1 
                  ? 'bg-amber-300 border-white text-amber-955 scale-102 shadow-md' 
                  : succeededSteps[1] 
                  ? 'bg-emerald-100/60 border-white/40 text-emerald-800' 
                  : 'bg-white/35 border-transparent text-stone-600'
              }`}
            >
              <span>🔄 1단계: 손목돌리기</span>
            </button>

            <button
              onClick={() => {
                playPop();
                setMode('tutorial');
                setActiveStep(2);
                // Reset this step's completed status so they can practice again
                setSucceededSteps(prev => ({ ...prev, 2: false }));
              }}
              className={`flex-1 md:flex-initial py-3 px-5 rounded-full font-display font-black text-sm md:text-base flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border-2 shadow-sm whitespace-nowrap ${
                mode === 'tutorial' && activeStep === 2 
                  ? 'bg-orange-300 border-white text-orange-955 scale-102 shadow-md' 
                  : succeededSteps[2] 
                  ? 'bg-emerald-100/60 border-white/40 text-emerald-800' 
                  : 'bg-white/35 border-transparent text-stone-600'
              }`}
            >
              <span>🐰 2단계: 점프연습</span>
            </button>

            <button
              onClick={() => {
                playPop();
                setMode('camera');
                setActiveStep(3);
                // Reset this step's completed status so they can practice again
                setSucceededSteps(prev => ({ ...prev, 3: false }));
              }}
              className={`flex-1 md:flex-initial py-3 px-5 rounded-full font-display font-black text-sm md:text-base flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer border-2 shadow-sm whitespace-nowrap ${
                mode === 'camera' && activeStep === 3
                  ? 'bg-emerald-500 border-white text-white scale-102 shadow-md animate-pulse animate-duration-3000' 
                  : succeededSteps[3] 
                  ? 'bg-emerald-100/60 border-white/40 text-emerald-800' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent'
              }`}
            >
              <span>👑 3단계: 실전연습</span>
            </button>
          </div>
        </div>

        {/* Active Tutorial Stage / Camera Module directly below the header */}
        <div className="w-full transition-all duration-300 transform">
          {mode === 'tutorial' ? (
            <>
              {activeStep === 1 && (
                <WristRotationPractice 
                  onSuccess={() => handleStepSuccess(1)} 
                  onReset={() => setSucceededSteps(prev => ({ ...prev, 1: false }))}
                  isCompleted={succeededSteps[1]} 
                  cameraStream={cameraStream}
                  cameraState={cameraState}
                />
              )}
              {activeStep === 2 && (
                <JumpingPractice 
                  onSuccess={() => handleStepSuccess(2)} 
                  onReset={() => setSucceededSteps(prev => ({ ...prev, 2: false }))}
                  isCompleted={succeededSteps[2]} 
                  cameraStream={cameraStream}
                  cameraState={cameraState}
                />
              )}
            </>
          ) : (
            <CameraPractice 
              onBack={() => {
                setMode('tutorial');
                setActiveStep(2);
              }} 
              cameraStream={cameraStream}
              cameraState={cameraState}
            />
          )}
        </div>



      </div>

    </div>
  );
}
