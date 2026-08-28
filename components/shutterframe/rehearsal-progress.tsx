'use client';

import React, { useEffect, useState } from 'react';

const STAGES = [
  { id: 1, title: 'PR fetched', time: '00:00:05', position: 8, color: '#F6C143' },
  { id: 2, title: 'Neon branch\ncreated', time: '00:00:32', position: 23, color: '#F3AA3B' },
  { id: 3, title: 'Sandbox\nstarted', time: '00:01:12', position: 38, color: '#F07542' },
  { id: 4, title: 'Migration\napplied', time: '00:03:15', position: 53, color: '#EA5455' },
  { id: 5, title: 'Integrity\nchecks', time: 'Pending', position: 68, color: '#EEF3F6' },
  { id: 6, title: 'Rollback\ntest', time: 'Pending', position: 83, color: '#EEF3F6' },
  { id: 7, title: 'Awaiting\napproval', time: 'Pending', position: 93, color: '#EEF3F6' },
];

const TARGET_PROGRESS = 53;
const DURATION = 2600;

function easeOutQuart(x: number) {
  return 1 - Math.pow(1 - x, 4);
}

export function RehearsalProgress() {
  const [progressPercent, setProgressPercent] = useState(0);
  const [reachedStages, setReachedStages] = useState(new Set<number>());
  const [isFinished, setIsFinished] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    setIsStarted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    if (mediaQuery.matches) {
      setProgressPercent(TARGET_PROGRESS);
      setReachedStages(new Set(STAGES.filter(m => TARGET_PROGRESS >= m.position).map(m => m.id)));
      setIsFinished(true);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / DURATION, 1);
      const easedProgress = easeOutQuart(rawProgress);

      const currentPercent = easedProgress * TARGET_PROGRESS;

      setProgressPercent(currentPercent);

      setReachedStages(prev => {
        const newReached = new Set(prev);
        let changed = false;
        STAGES.forEach(m => {
          if (currentPercent >= m.position && !newReached.has(m.id)) {
            newReached.add(m.id);
            changed = true;
          }
        });
        return changed ? newReached : prev;
      });

      if (rawProgress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setIsFinished(true);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="w-full bg-white flex flex-col justify-center pt-3 pb-3 sm:pt-4 sm:pb-4 md:pt-5 md:pb-5 px-4 sm:px-5 md:px-6 font-sans rounded-xl">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pop {
          0% { transform: scale(1); }
          45% { transform: scale(1.15); }
          70% { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        @keyframes starPop {
          0% { transform: scale(0.8) rotate(-8deg); }
          45% { transform: scale(1.18) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes sparkle {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
          20% { opacity: 1; transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1); }
          100% { opacity: 0; transform: translate(calc(-50% + var(--tx) * 1.5), calc(-50% + var(--ty) * 1.5)) scale(0); }
        }
        .animate-pop {
          animation: pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-starPop {
          animation: starPop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-sparkle {
          animation: sparkle 600ms ease-out forwards;
        }
        .glow-finish {
          animation: finishGlow 400ms ease-out forwards;
        }
        .scale-finish {
          animation: finishScale 400ms ease-out forwards;
        }
        @keyframes finishGlow {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.15) drop-shadow(0 0 8px rgba(234,84,85,0.4)); }
          100% { filter: brightness(1); }
        }
        @keyframes finishScale {
          0% { transform: scale(1); }
          50% { transform: scale(1.025); }
          100% { transform: scale(1); }
        }
      `}} />

      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-2 sm:mb-3 px-1">
          <h1 className="text-base sm:text-lg md:text-xl font-normal text-[#2C3135] tracking-tight flex flex-wrap items-center">
            Current:
            <span
              className={`font-semibold text-[#EA5455] ml-2 inline-block origin-left transition-all duration-700 ease-out ${isStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${isFinished && !reducedMotion ? 'scale-finish' : ''}`}
            >
              Migration applied
            </span>
            <span className={`text-[#AAB5BA] text-xs sm:text-sm md:text-base ml-2 sm:ml-3 font-normal transition-opacity duration-700 delay-300 ${isStarted ? 'opacity-100' : 'opacity-0'}`}>
              · Step 4 of 7
            </span>
          </h1>
          <div className={`mt-0.5 text-[#8A99A2] text-xs font-normal transition-opacity duration-700 delay-500 ${isStarted ? 'opacity-100' : 'opacity-0'}`}>
            00:03:15 elapsed
          </div>
        </div>

        {/* Progress Tracker Container */}
        <div className="w-full pb-1 pt-1">
          <div className="relative w-full h-[68px] sm:h-[76px] md:h-[82px] px-2 sm:px-4">

            {/* Background Track (Pill cap extends from left-0 to right-0) */}
            <div className="absolute top-[10px] sm:top-[12px] md:top-[14px] left-0 right-0 h-[10px] sm:h-[12px] md:h-[14px] bg-[#EEF3F6] rounded-full" />

            {/* Active Track */}
            <div
              className={`absolute top-[10px] sm:top-[12px] md:top-[14px] left-0 h-[10px] sm:h-[12px] md:h-[14px] rounded-full ${isFinished && !reducedMotion ? 'glow-finish' : ''}`}
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(to right, #F6C143 0%, #F3AA3B 30%, #F07542 60%, #EA5455 100%)',
                backgroundSize: progressPercent > 0 ? `${10000 / progressPercent}% 100%` : '100% 100%',
                backgroundRepeat: 'no-repeat'
              }}
            />

            {/* Milestones */}
            {STAGES.map((stage) => {
              const isReached = reachedStages.has(stage.id);

              return (
                <div
                  key={stage.id}
                  className="absolute top-0 flex flex-col items-center z-10"
                  style={{ left: `${stage.position}%`, transform: 'translateX(-50%)' }}
                >
                  {/* Circle Ring (Cutout effect) */}
                  <div className={`w-[30px] h-[30px] sm:w-[36px] sm:h-[36px] md:w-[42px] md:h-[42px] rounded-full bg-white flex items-center justify-center relative ${isReached && !reducedMotion ? 'animate-pop' : ''}`}>

                    {/* Sparkles */}
                    {isReached && !reducedMotion && (
                      <div className="absolute left-1/2 top-1/2 pointer-events-none">
                        {[...Array(5)].map((_, i) => {
                          const angle = (i * 72) * (Math.PI / 180);
                          const distance = 16 + Math.random() * 5;
                          const tx = Math.cos(angle) * distance;
                          const ty = Math.sin(angle) * distance;
                          return (
                            <div
                              key={i}
                              className="absolute w-1 h-1 rounded-full animate-sparkle opacity-0"
                              style={{
                                backgroundColor: stage.color,
                                animationDelay: `${Math.random() * 0.15}s`,
                                '--tx': `${tx}px`,
                                '--ty': `${ty}px`,
                              } as React.CSSProperties}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Inner Circle */}
                    <div
                      className="w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] md:w-[34px] md:h-[34px] rounded-full flex items-center justify-center text-white transition-colors duration-300"
                      style={{
                        backgroundColor: isReached ? stage.color : '#EEF3F6',
                      }}
                    >
                      <StarIcon
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 transition-opacity duration-300 ${isReached && !reducedMotion ? 'animate-starPop' : ''}`}
                        style={{
                          opacity: isReached ? 1 : 0.8,
                          color: isReached ? 'white' : '#AAB5BA'
                        }}
                      />
                    </div>
                  </div>

                  {/* Label */}
                  <div className="mt-1 flex flex-col items-center text-center">
                    <div
                      className="text-[10px] sm:text-[11px] md:text-xs leading-tight font-medium whitespace-pre-line transition-colors duration-300 max-w-[75px] sm:max-w-[95px]"
                      style={{ color: isReached ? stage.color : '#AAB5BA' }}
                    >
                      {stage.title}
                    </div>
                    <div
                      className="mt-0.5 text-[9px] sm:text-[10px] font-normal transition-colors duration-300"
                      style={{ color: isReached ? stage.color : '#AAB5BA', opacity: isReached ? 0.7 : 0.8 }}
                    >
                      {stage.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StarIcon({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M12 2.5L14.85 8.75L21.5 9.5L16.5 14.1L17.9 20.5L12 17.1L6.1 20.5L7.5 14.1L2.5 9.5L9.15 8.75L12 2.5Z"
      />
    </svg>
  );
}

export default RehearsalProgress;
