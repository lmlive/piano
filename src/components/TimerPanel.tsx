import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee, Bell } from 'lucide-react';

interface TimerPanelProps {
  onTimerEnd: () => void;
}

export const TimerPanel: React.FC<TimerPanelProps> = ({ onTimerEnd }) => {
  const [duration, setDuration] = useState<number>(15 * 60); // default 15 minutes
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionTotal, setSessionTotal] = useState<number>(0); // overall focus time logged
  const timerIntervalRef = useRef<number | null>(null);

  // Set preset
  const selectPreset = (minutes: number) => {
    setIsRunning(false);
    setDuration(minutes * 60);
    setTimeLeft(minutes * 60);
  };

  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            onTimerEnd(); // play chime / pause metronome
            return 0;
          }
          setSessionTotal(s => s + 1); // log 1 second
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRunning, onTimerEnd]);

  // Format MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const percentLeft = (timeLeft / duration) * 100;

  return (
    <div id="piano-timer-card" className="glass-panel rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
            <Timer className="w-4 h-4 text-amber-500" />
            练琴专注计时器 (Chamber Timer)
          </h2>
          <p className="text-[11px] text-gray-450 mt-0.5">
            设定阶段练习目标，劳逸结合防止关节疲劳
          </p>
        </div>
        
        {/* Total session logged */}
        {sessionTotal > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-[9px] font-mono">
            今日练琴: {Math.floor(sessionTotal / 60)}分{sessionTotal % 60}秒
          </div>
        )}
      </div>

      {/* Preset Quick Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {[5, 10, 15, 30, 45, 60].map((mins) => (
          <button
            key={mins}
            id={`timer-preset-${mins}`}
            onClick={() => selectPreset(mins)}
            className={`px-3 py-1.5 text-[10px] rounded-lg cursor-pointer transition-all ${
              duration === mins * 60
                ? 'bg-amber-500 text-gray-950 font-bold'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {mins}分钟
          </button>
        ))}
      </div>

      {/* Main Countdown Layout Grid */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        
        {/* Radial graphic circle indicator */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Foreground circle */}
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="#F59E0B"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={2 * Math.PI * 48 * (1 - percentLeft / 100)}
              className="transition-all duration-300"
            />
          </svg>
          
          <div className="absolute flex flex-col items-center">
            <span id="timer-display-string" className="text-xl font-mono font-bold text-white tracking-tight glow-amber">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[8px] font-mono text-amber-500/80 uppercase tracking-widest mt-1">
              {isRunning ? '专注中' : '已暂停'}
            </span>
          </div>
        </div>

        {/* Play and reset actions */}
        <div className="flex-1 flex flex-col justify-center gap-3 w-full">
          <div className="flex items-center gap-2">
            <button
              id="timer-play-toggle"
              onClick={toggleTimer}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                isRunning
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  : 'bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>暂停计时</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>开始计时</span>
                </>
              )}
            </button>

            <button
              id="timer-reset-btn"
              onClick={resetTimer}
              className="glass-panel hover:bg-white/5 text-gray-400 hover:text-white p-2.5 rounded-xl transition-all cursor-pointer"
              title="重置计时"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div id="rest-reminder-alert" className="border border-white/5 bg-white/1 rounded-xl p-2.5 text-[10px] text-gray-500 flex items-start gap-2">
            <Coffee className="w-3.5 h-3.5 text-amber-500/75 shrink-0 mt-0.5" />
            <span>
              科学练琴法：每连续练习 {Math.floor(duration / 60)} 分钟，建议起立活动手指、松弛颈肩 2-3 分钟，对提高练习效果大有裨益。
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
