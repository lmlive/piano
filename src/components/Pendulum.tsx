import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Activity } from 'lucide-react';

interface PendulumProps {
  bpm: number;
  currentBeat: number;
  beatsPerBar: number;
  subdivision: number;
  currentSubdivisionStep: number;
  isPlaying: boolean;
}

export const Pendulum: React.FC<PendulumProps> = ({
  bpm,
  currentBeat,
  beatsPerBar,
  subdivision,
  currentSubdivisionStep,
  isPlaying,
}) => {
  const [angle, setAngle] = useState(0);

  // Sync pendulum angle with beat occurrences
  useEffect(() => {
    if (!isPlaying) {
      setAngle(0);
      return;
    }

    // Swing left on odd beats, right on even beats
    // Sub-adjust angle slightly during subdivisions for fine organic feedback
    const baseAngle = currentBeat % 2 === 0 ? 26 : -26;
    const subOffset = subdivision > 1 ? (currentSubdivisionStep - 1) * (10 / subdivision) : 0;
    const finalAngle = currentBeat % 2 === 0 ? baseAngle - subOffset : baseAngle + subOffset;

    setAngle(finalAngle);
  }, [currentBeat, currentSubdivisionStep, subdivision, isPlaying]);

  // Transition speed corresponds directly to dynamic BPM
  // A standard transition duration is somewhat less than the beat interval to ensure snappy arrival
  const beatIntervalSeconds = 60 / bpm;
  const transitionDuration = Math.min(0.25, beatIntervalSeconds * 0.4);

  return (
    <div id="pendulum-container" className="relative flex flex-col items-center glass-panel rounded-3xl p-6 shadow-2xl overflow-hidden w-full max-w-sm mx-auto">
      {/* Absolute ambient lights */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      
      {/* Main Beat Pulse Headers */}
      <div className="w-full flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-1.5">
          <Activity className={`w-4 h-4 text-emerald-400 ${isPlaying ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray-450">
            {isPlaying ? '实时视觉同步' : '节拍器静置 (就绪)'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-amber-500 pb-0.5">BEAT {currentBeat}</span>
          <span className="text-[10px] font-mono text-gray-600">/</span>
          <span className="text-[10px] font-mono text-gray-450">{beatsPerBar}</span>
        </div>
      </div>

      {/* Mechanical Cabinet Vector Background */}
      <div className="relative w-48 h-64 flex justify-center bg-white/3 border border-white/5 rounded-2xl shadow-inner overflow-hidden mb-6">
        {/* Curved pyramid cabinet guides */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-950/10 via-transparent to-transparent opacity-40" />
        
        {/* Center scale line */}
        <div className="absolute top-2 bottom-6 w-0.5 bg-white/5" />
        <div className="absolute top-1/4 w-32 border-b border-white/5" />
        <div className="absolute top-2/4 w-40 border-b border-white/5" />
        <div className="absolute top-3/4 w-44 border-b border-white/5" />

        {/* BPM Calibration scale ticks */}
        {[60, 90, 120, 150, 180, 210, 240].map((tickBpm, index) => {
          const topPercent = 10 + index * 12;
          return (
            <div
              key={tickBpm}
              style={{ top: `${topPercent}%` }}
              className="absolute flex items-center justify-between w-28 text-[8px] font-mono text-gray-600/80"
            >
              <span>•</span>
              <span className="opacity-40">{tickBpm}</span>
              <span>•</span>
            </div>
          );
        })}

        {/* Pendulum Body Arm with Pivot Point */}
        <div className="absolute bottom-6 w-full h-full flex justify-center origin-bottom">
          <motion.div
            id="metronome-pendulum-arm"
            animate={{ rotate: angle }}
            transition={{
              type: 'spring',
              stiffness: isPlaying ? 300 : 120,
              damping: 24,
              mass: 0.8,
            }}
            className="relative w-1.5 h-[190px] bg-gradient-to-b from-gray-300 via-gray-400 to-amber-600 origin-bottom"
            style={{
              transformOrigin: '50% calc(100% - 10px)',
            }}
          >
            {/* Sliding weight marker (Gold/Brass Accent) */}
            {/* Height moves up or down based on BPM (faster BPM = lower weight, slower = higher) */}
            <div
              style={{
                top: `${Math.max(10, Math.min(150, 150 - ((bpm - 30) / 250) * 140))}px`,
                transform: 'translateX(-50%)',
              }}
              className="absolute left-1/2 w-7 h-5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 rounded border border-amber-600 shadow-md flex flex-col justify-between p-0.5"
            >
              <div className="w-full h-0.5 bg-amber-800/40" />
              <div className="w-full h-px bg-yellow-100" />
              <div className="w-full h-0.5 bg-amber-800/40" />
            </div>

            {/* Glowing active weight pointer */}
            <div
              style={{
                top: `${Math.max(10, Math.min(150, 150 - ((bpm - 30) / 250) * 140)) + 8}px`,
                transform: 'translateX(-50%)',
              }}
              className={`absolute left-1/2 w-2 h-2 rounded-full ${
                isPlaying ? 'bg-amber-400 animate-ping' : 'bg-transparent'
              }`}
            />
          </motion.div>
        </div>

        {/* Pivot Center Cap Cap (Bronze/Brass circle at the base of rotation) */}
        <div className="absolute bottom-4 w-5 h-5 bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-800 rounded-full border border-amber-900 shadow-lg flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-900 rounded-full" />
        </div>
      </div>

      {/* Grid Display representing Bar Progress (Lamps) */}
      <div className="w-full flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-wider text-gray-500 uppercase">
            拍号步进指示
          </span>
          {isPlaying && currentBeat === 1 && currentSubdivisionStep === 1 && (
            <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3" /> 重音拍
            </span>
          )}
        </div>

        {/* Beats Grid Lamps */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${beatsPerBar}, minmax(0, 1fr))` }}>
          {Array.from({ length: beatsPerBar }).map((_, beatIdx) => {
            const beatNumber = beatIdx + 1;
            const isFirstBeat = beatNumber === 1;
            const isActive = isPlaying && currentBeat === beatNumber;
            const isMainSubStep = currentSubdivisionStep === 1;

            return (
              <div key={beatIdx} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-full h-2.5 rounded-full transition-all duration-100 ${
                    isActive
                      ? isFirstBeat
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(251,191,36,0.85)] scale-y-110'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]'
                      : 'bg-[#15161A] border border-white/5'
                  }`}
                />
                
                {/* Subdivision Indicator mini-dots inside each beat */}
                <div className="flex gap-1 justify-center">
                  {Array.from({ length: subdivision }).map((_, subIdx) => {
                    const stepNum = subIdx + 1;
                    const isSubStepActive = isPlaying && currentBeat === beatNumber && currentSubdivisionStep === stepNum;
                    
                    return (
                      <div
                        key={subIdx}
                        className={`w-1 h-1 rounded-full transition-colors duration-75 ${
                          isSubStepActive
                            ? isFirstBeat
                              ? 'bg-amber-400' 
                              : 'bg-emerald-400'
                            : 'bg-gray-700/60'
                        }`}
                      />
                    );
                  })}
                </div>
                
                <span className={`text-[9px] font-mono mt-1 ${isActive ? 'text-gray-200 font-bold' : 'text-gray-600'}`}>
                  {beatNumber}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
