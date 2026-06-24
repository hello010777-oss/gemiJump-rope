import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Play } from 'lucide-react';
import { playPop, stopAllAudio } from './utils/audio';
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

  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const setupCamera = async () => {
    try {
      setCameraState('requesting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      setCameraStream(stream);
      setCameraState('active');
      setHasStarted(true);
    } catch (err) {
      console.warn('Camera failed', err);
      setCameraState('fallback');
      setHasStarted(true);
    }
  };

  useEffect(() => {
    // We will wait for user interaction to start camera
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleStepSuccess = (stepId: number) => {
    setSucceededSteps(prev => ({ ...prev, [stepId]: true }));
    
    // Auto advance to next step after a tiny delay for feel-good celebration
    if (stepId === 1) {
      // Clear Step 2 completed state so it starts fresh when transitioning!
      setSucceededSteps(prev => ({ ...prev, 1: true, 2: false }));
      setTimeout(() => {
        stopAllAudio();
        setActiveStep(2);
      }, 2000);
    } else if (stepId === 2) {
      // Step 2 automatically transitions to Step 3 (Real Practice) after completing successfully
      setSucceededSteps(prev => ({ ...prev, 2: true, 3: false }));
      setTimeout(() => {
        stopAllAudio();
        setMode('camera');
        setActiveStep(3);
      }, 2000);
    }
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-8 border-4 border-white flex flex-col items-center text-center gap-6">
          <div className="w-24 h-24 bg-amber-100 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner animate-bounce">
            🎈
          </div>
          <h1 className="text-3xl font-display font-black text-orange-600 tracking-tight">
            3단계 도전 줄넘기
          </h1>
          <p className="text-stone-600 font-medium leading-relaxed">
            안녕하세요! 아이들을 위한 재미있는 가상 줄넘기 놀이방입니다. <br/>
            화면 위에 가상 줄넘기 선을 보여주기 위해 카메라 권한이 필요해요.
          </p>
          <div className="w-full bg-orange-50 border-2 border-orange-100 rounded-3xl p-4 text-left text-sm text-stone-600 leading-relaxed">
            <p className="font-black text-orange-700 mb-2">카메라 안전 안내</p>
            <p>카메라 영상은 이 기기의 브라우저 안에서만 표시됩니다.</p>
            <p>서버, AI API, 외부 서비스로 영상이나 사진을 보내지 않습니다.</p>
            <p>기념 사진은 다운로드 버튼을 눌렀을 때만 기기에 저장됩니다.</p>
          </div>
          <button
            onClick={setupCamera}
            className="w-full bg-[#FF8B13] hover:bg-orange-500 text-white font-black text-xl py-5 rounded-3xl transition active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-2"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>시작하기!</span>
          </button>
          <a
            href="/privacy.html"
            className="text-xs text-stone-500 underline underline-offset-4 hover:text-orange-600"
          >
            개인정보 및 카메라 사용 안내 보기
          </a>
        </div>
      </div>
    );
  }

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
                stopAllAudio();
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
                stopAllAudio();
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
                stopAllAudio();
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
                stopAllAudio();
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
