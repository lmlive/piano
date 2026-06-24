import React from 'react';
import { SpeedTrainerConfig } from '../types';
import { Sparkles, ArrowRight, RefreshCw, Gauge } from 'lucide-react';

interface SpeedTrainerProps {
  config: SpeedTrainerConfig;
  onChange: (newConfig: SpeedTrainerConfig | ((prev: SpeedTrainerConfig) => SpeedTrainerConfig)) => void;
  currentBpm: number;
  isPlaying: boolean;
  setBpm: (bpm: number) => void;
}

export const SpeedTrainer: React.FC<SpeedTrainerProps> = ({
  config,
  onChange,
  currentBpm,
  isPlaying,
  setBpm,
}) => {
  const toggleTrainer = () => {
    onChange((prev) => {
      const nextActive = !prev.isActive;
      if (nextActive) {
        // Set BPM to start BPM when activated
        setBpm(prev.startBpm);
        return { ...prev, isActive: nextActive, currentMeasures: 0 };
      }
      return { ...prev, isActive: nextActive };
    });
  };

  const handleParamChange = (key: keyof SpeedTrainerConfig, val: number) => {
    onChange((prev) => {
      const next = { ...prev, [key]: val };
      // Make sure start < target
      if (key === 'startBpm' && val >= next.targetBpm) {
        next.targetBpm = Math.min(280, val + 20);
      }
      if (key === 'targetBpm' && val <= next.startBpm) {
        next.startBpm = Math.max(30, val - 20);
      }
      return next;
    });
  };

  // Quick Presets
  const applyPreset = (start: number, target: number, amount: number, measure: number) => {
    onChange({
      isActive: true,
      startBpm: start,
      targetBpm: target,
      increaseAmount: amount,
      increaseInterval: measure,
      currentMeasures: 0,
    });
    setBpm(start);
  };

  return (
    <div id="speed-trainer-card" className="glass-panel rounded-3xl p-6 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
      {/* Background glow when active */}
      {config.isActive && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-500" />
            渐进式变速训练器 (Speed Trainer)
          </h2>
          <p className="text-[11px] text-gray-450 mt-0.5">
            程序化逐级加速提升肌肉记忆，键盘练习及困难乐段克星
          </p>
        </div>

        {/* Master Toggle */}
        <button
          id="trainer-activation-toggle"
          onClick={toggleTrainer}
          className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
            config.isActive
              ? 'bg-amber-500 text-gray-950 shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:bg-amber-400'
              : 'glass-panel hover:bg-white/5 text-gray-300 hover:text-white'
          }`}
        >
          {config.isActive ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin duration-1000" />
              <span>训练开启中</span>
            </>
          ) : (
            '开启训练'
          )}
        </button>
      </div>

      {/* Preset Buttons */}
      <div className="mb-5">
        <label className="text-[10px] font-mono text-gray-550 uppercase block mb-2 tracking-wider">推荐练琴预设 (PRESET ESCALATIONS)</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            id="preset-escalation-1"
            onClick={() => applyPreset(60, 95, 3, 2)}
            className="bg-white/3 hover:bg-white/8 border border-white/5 text-left p-2.5 rounded-xl transition-all group cursor-pointer"
          >
            <div className="text-[10px] font-medium text-gray-300 group-hover:text-amber-500">慢起步热身</div>
            <div className="text-[9px] text-gray-500 font-mono mt-0.5">60→95BPM, +3/2节拍</div>
          </button>
          <button
            id="preset-escalation-2"
            onClick={() => applyPreset(80, 130, 4, 4)}
            className="bg-white/3 hover:bg-white/8 border border-white/5 text-left p-2.5 rounded-xl transition-all group cursor-pointer"
          >
            <div className="text-[10px] font-medium text-gray-300 group-hover:text-amber-500">中速平稳过渡</div>
            <div className="text-[9px] text-gray-500 font-mono mt-0.5">80→130BPM, +4/4节拍</div>
          </button>
          <button
            id="preset-escalation-3"
            onClick={() => applyPreset(100, 180, 5, 4)}
            className="bg-white/3 hover:bg-white/8 border border-white/5 text-left p-2.5 rounded-xl transition-all group cursor-pointer"
          >
            <div className="text-[10px] font-medium text-gray-300 group-hover:text-amber-500">高级突破训练</div>
            <div className="text-[9px] text-gray-500 font-mono mt-0.5">100→180BPM, +5/4节拍</div>
          </button>
        </div>
      </div>

      {/* Config Panels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {/* Start Bpm */}
        <div className="glass-panel rounded-2xl p-3">
          <label className="text-[10px] text-gray-500 block mb-1">起始速度 (BPM)</label>
          <input
            type="number"
            min={30}
            max={280}
            value={config.startBpm}
            onChange={(e) => handleParamChange('startBpm', parseInt(e.target.value) || 60)}
            disabled={isPlaying && config.isActive}
            className="w-full bg-transparent border-0 p-0 text-amber-500 text-lg font-mono font-bold focus:ring-0 focus:outline-none disabled:text-gray-500"
          />
        </div>

        {/* Target Bpm */}
        <div className="glass-panel rounded-2xl p-3">
          <label className="text-[10px] text-gray-500 block mb-1">目标最速限额</label>
          <input
            type="number"
            min={30}
            max={280}
            value={config.targetBpm}
            onChange={(e) => handleParamChange('targetBpm', parseInt(e.target.value) || 120)}
            disabled={isPlaying && config.isActive}
            className="w-full bg-transparent border-0 p-0 text-amber-500 text-lg font-mono font-bold focus:ring-0 focus:outline-none disabled:text-gray-500"
          />
        </div>

        {/* Increase BPM Amount */}
        <div className="glass-panel rounded-2xl p-3">
          <label className="text-[10px] text-gray-500 block mb-1">每次加速 (BPM)</label>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 text-sm font-bold font-mono">+</span>
            <input
              type="number"
              min={1}
              max={30}
              value={config.increaseAmount}
              onChange={(e) => handleParamChange('increaseAmount', parseInt(e.target.value) || 2)}
              disabled={isPlaying && config.isActive}
              className="w-full bg-transparent border-0 p-0 text-amber-500 text-lg font-mono font-bold focus:ring-0 focus:outline-none disabled:text-gray-500"
            />
          </div>
        </div>

        {/* Increase Interval Measures */}
        <div className="glass-panel rounded-2xl p-3">
          <label className="text-[10px] text-gray-500 block mb-1">加速周期</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={16}
              value={config.increaseInterval}
              onChange={(e) => handleParamChange('increaseInterval', parseInt(e.target.value) || 2)}
              disabled={isPlaying && config.isActive}
              className="w-full bg-transparent border-0 p-0 text-amber-500 text-lg font-mono font-bold focus:ring-0 focus:outline-none disabled:text-gray-500"
            />
            <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">小节</span>
          </div>
        </div>
      </div>

      {/* Dynamic Progress Monitor while active */}
      {config.isActive && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] text-amber-500 font-bold tracking-wide">练习加速计划正在运行</div>
              <div className="text-[9px] text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                <span>{config.startBpm} BPM</span>
                <ArrowRight className="w-2.5 h-2.5 text-amber-500/40" />
                <span className="text-gray-300 font-semibold">{currentBpm} BPM</span>
                <ArrowRight className="w-2.5 h-2.5 text-amber-500/40" />
                <span>{config.targetBpm} BPM</span>
              </div>
            </div>
          </div>

          {/* Graphical Measures Progress */}
          <div className="flex flex-col items-end gap-1 min-w-[120px]">
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${(config.currentMeasures / config.increaseInterval) * 100}%` }}
                className="bg-amber-500 h-full transition-all duration-300"
              />
            </div>
            <div className="text-[9px] font-mono text-gray-400 mt-0.5">
              小节进度: <span className="text-amber-500 font-bold">{config.currentMeasures}</span> / {config.increaseInterval}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
