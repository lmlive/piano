import { useState, useRef, useCallback, useEffect } from 'react';
import { useMetronome } from './hooks/useMetronome';
import { Pendulum } from './components/Pendulum';
import { SpeedTrainer } from './components/SpeedTrainer';
import { PianoKeyboard } from './components/PianoKeyboard';
import { TimerPanel } from './components/TimerPanel';
import { SOUNDS, SUBDIVISIONS } from './types';

// Lucide Icons
import {
  Play,
  Pause,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  Music,
  Info,
  Sliders,
  HelpCircle,
  TrendingUp,
  Cpu,
  Drum,
  Sparkles,
  ChevronRight,
  RefreshCcw,
} from 'lucide-react';

export default function App() {
  const {
    bpm,
    setBpm,
    beatsPerBar,
    setBeatsPerBar,
    subdivision,
    setSubdivision,
    sound,
    setSound,
    volume,
    setVolume,
    isPlaying,
    currentBeat,
    currentSubdivisionStep,
    tempoMarking,
    trainerConfig,
    setTrainerConfig,
    togglePlay,
    playPianoNote,
    initAudio,
  } = useMetronome();

  // Volume backup to restore after unmute
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [prevVolume, setPrevVolume] = useState<number>(75);

  // Tap-tempo tracking states
  const tapTimesRef = useRef<number[]>([]);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Render C4-E4-G4-C5 rolled chord when practice session completes
  const playVictoryArpeggio = useCallback(() => {
    const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, index) => {
      setTimeout(() => {
        playPianoNote(freq);
      }, index * 120); // 120ms staggered chord arpeggio
    });
  }, [playPianoNote]);

  // Handle Mute Button toggle
  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  // Sync mute state on volume adjustment
  const handleVolumeSlide = (val: number) => {
    setVolume(val);
    if (val > 0) {
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  // Precise Tap-Tempo algorithm
  const handleTapTempo = () => {
    initAudio(); // Warm-up AudioContext on gesture
    const now = performance.now();
    const cleanTimeout = 2500; // Let 2.5 seconds of inactivity clear previous taps (24 BPM limit)

    // filter out ancient taps if last tap occurred ages ago
    if (tapTimesRef.current.length > 0 && now - tapTimesRef.current[tapTimesRef.current.length - 1] > cleanTimeout) {
      tapTimesRef.current = [];
    }

    tapTimesRef.current.push(now);

    // Maintain only the last 5 taps for moving average window
    if (tapTimesRef.current.length > 5) {
      tapTimesRef.current.shift();
    }

    if (tapTimesRef.current.length >= 2) {
      const intervalsSum = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervalsSum.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avgIntervalMs = intervalsSum.reduce((sum, val) => sum + val, 0) / intervalsSum.length;
      const computedBpm = Math.round(60000 / avgIntervalMs);
      setBpm(computedBpm);
    }
  };

  return (
    <div className="radial-gradient-bg text-[#E0E2E6] min-h-screen py-6 sm:py-10 px-3 sm:px-8 selection:bg-amber-500/30 font-sans relative">
      <div className="absolute inset-0 bg-radial pointer-events-none opacity-20" />

      {/* Main Container Core */}
      <div className="max-w-6.5xl mx-auto flex flex-col gap-6 sm:gap-8 relative z-10">
        
        {/* Dynamic header navigation in Acoustical Style */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 sm:pb-8">
          <div className="flex flex-col">
            <h1 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-amber-500 opacity-85 mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Acoustic Precision
            </h1>
            <p className="text-xl sm:text-3xl font-light tracking-tight text-white">
              钢琴专业高精度节拍器 
              <span className="opacity-40 font-serif italic text-sm sm:text-lg ml-2">v4.2 WebAudio</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="glass-panel px-4 sm:px-5 py-2 sm:py-2.5 rounded-full flex items-center gap-2 sm:gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="font-mono tracking-widest text-[9px] sm:text-[10px] uppercase text-gray-400">
                <span className="hidden sm:inline">参考音准阻抗:</span> Standard 440Hz
              </span>
            </div>

            <button
              id="help-toggle-btn"
              onClick={() => setShowHelp(!showHelp)}
              className="glass-panel hover:bg-white/5 text-gray-300 hover:text-white rounded-full px-4 py-2 sm:py-2.5 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>{showHelp ? '收起面板' : '使用指南'}</span>
            </button>
          </div>
        </header>

        {/* Practice Helper Alert/Tip when active */}
        {showHelp && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-yellow-100/90 rounded-2xl p-4 text-xs animate-fadeIn flex items-start gap-3">
            <Info className="w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">💡 科学练琴与节拍节奏进位说明：</p>
              <p>1. **无感防止时钟滞后**：由于传统的 JavaScript 定时器频繁受到后台休眠和重绘进程的干扰而导致时钟漂移，我们利用原生的 Web Audio API 高精度时钟进行提前调度计划（Look-ahead Scheduler），为你保证绝对一致的机械精准音轨。</p>
              <p>2. **渐进加速（Speed Trainer）的使用**：练习哈农（Hanon）、车尔尼（Czerny）练习曲或复杂复调琶音时，建议使用下方中部的**变速训练器**，设定如：从 60 BPM 启动，每 2 个小节自动 +4 BPM，能无级平滑地过渡技巧瓶颈速度。</p>
              <p>3. **切面音色选择**：钢琴等中低频共鸣乐器建议使用 **木鱼/古典木刻（Woodblock）** 音色，其高通指向过滤极强，能完美穿透高分贝弹奏的琴声鸣响而不喧宾夺主。</p>
            </div>
          </div>
        )}

        {/* SECTION 1: Top Dashboard - Metronome Main Console & Vertical Pendulum */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Controls Card Column */}
          <main className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Upper warm decorative rim */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            
            <div className="space-y-6">
              
              {/* Tempo Marking Display Tag */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-0">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 opacity-60">
                  当前速度术语 (TEMPO SCALING)
                </span>
                <div id="tempo-marking-badge" className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 self-start sm:self-auto ${tempoMarking.color}`}>
                  {tempoMarking.name} ({tempoMarking.en})
                </div>
              </div>

              {/* Huge Numeric BPM Speed Display */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 py-6 sm:py-8 border-y border-white/5">
                {/* Large BPM Number */}
                <div className="text-center">
                  <div id="tempo-bpm-value" className="text-7xl sm:text-9xl font-light font-sans tracking-tighter text-amber-500 glow-amber leading-none select-none">
                    {bpm}
                  </div>
                  <div className="text-[10px] font-mono tracking-[0.3em] text-gray-500 font-bold uppercase mt-3">
                    BEATS PER MINUTE
                  </div>
                </div>

                {/* Fine adjustments buttons stacking */}
                <div className="flex sm:flex-col gap-2.5 justify-center">
                  <div className="flex gap-2">
                    <button
                      id="bpm-decrease-5"
                      onClick={() => setBpm(bpm - 5)}
                      className="w-12 h-11 sm:w-11 sm:h-9 rounded-xl bg-white/5 hover:bg-white/10 text-xs sm:text-[10px] font-bold text-gray-300 cursor-pointer transition-all border border-white/5 flex items-center justify-center"
                      title="-5 BPM"
                    >
                      -5
                    </button>
                    <button
                      id="bpm-increase-5"
                      onClick={() => setBpm(bpm + 5)}
                      className="w-12 h-11 sm:w-11 sm:h-9 rounded-xl bg-white/5 hover:bg-white/10 text-xs sm:text-[10px] font-bold text-gray-300 cursor-pointer transition-all border border-white/5 flex items-center justify-center"
                      title="+5 BPM"
                    >
                      +5
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      id="bpm-decrease-1"
                      onClick={() => setBpm(bpm - 1)}
                      className="w-12 h-11 sm:w-11 sm:h-9 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-200 cursor-pointer transition-all border border-white/5 flex items-center justify-center"
                      title="-1 BPM"
                    >
                      <Minus className="w-3.5 h-3.5 mx-auto" />
                    </button>
                    <button
                      id="bpm-increase-1"
                      onClick={() => setBpm(bpm + 1)}
                      className="w-12 h-11 sm:w-11 sm:h-9 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-200 cursor-pointer transition-all border border-white/5 flex items-center justify-center"
                      title="+1 BPM"
                    >
                      <Plus className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Slider Input with micro tick markers */}
              <div className="space-y-2">
                <input
                  id="tempo-bpm-slider"
                  type="range"
                  min={30}
                  max={280}
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                  className="w-full accent-amber-500 h-2 bg-gray-850 rounded-lg cursor-pointer transition-all"
                />
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 px-1">
                  <span>Largo 30</span>
                  <span>Andante 80</span>
                  <span>Allegro 120</span>
                  <span>Presto 200+</span>
                  <span>280</span>
                </div>
              </div>

              {/* Row: Beats, Subdivision config */}
              <div className="grid grid-cols-2 gap-4">
                {/* Time Signature Numerator / Beats per Measure */}
                <div className="glass-panel rounded-2xl p-4 space-y-1.5 flex flex-col justify-between">
                  <span className="text-[10px] text-gray-450 uppercase font-mono tracking-wider block">
                    拍号设置 (BEATS / BAR)
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      id="beats-signature-select"
                      value={beatsPerBar}
                      onChange={(e) => setBeatsPerBar(parseInt(e.target.value) || 4)}
                      className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-100 outline-none focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 12].map((num) => (
                        <option key={num} value={num}>
                          {num} 拍每小节 ({num} / 4)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Rhythm subdivision selector */}
                <div className="glass-panel rounded-2xl p-4 space-y-1.5 flex flex-col justify-between">
                  <span className="text-[10px] text-gray-450 uppercase font-mono tracking-wider block">
                    节奏细分 (SUBDIVISION)
                  </span>
                  <select
                    id="subdivision-rhythm-select"
                    value={subdivision}
                    onChange={(e) => setSubdivision(parseInt(e.target.value) as any || 1)}
                    className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-100 outline-none focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer"
                  >
                    {SUBDIVISIONS.map((sub) => (
                      <option key={sub.value} value={sub.value}>
                        {sub.name} ({sub.label})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Volume & Sound Options Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sounds select */}
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase font-mono block">
                    专业音色选择 (SOUND ENGINE)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {SOUNDS.map((s) => (
                      <button
                        key={s.id}
                        id={`sound-select-btn-${s.id}`}
                        onClick={() => {
                          initAudio();
                          setSound(s.id);
                        }}
                        className={`py-2.5 sm:py-2 px-1 rounded-xl border text-[11px] sm:text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                          sound === s.id
                            ? 'bg-amber-500 text-gray-950 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10'
                        }`}
                      >
                        {s.id === 'woodblock' && <Drum className="w-3.5 h-3.5 shrink-0" />}
                        {s.id === 'digital' && <Cpu className="w-3.5 h-3.5 shrink-0" />}
                        {s.id === 'piano' && <Music className="w-3.5 h-3.5 shrink-0" />}
                        {s.id === 'drum' && <Sparkles className="w-3.5 h-3.5 shrink-0" />}
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Master Volume with Mute Capability */}
                <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-450 uppercase font-mono font-bold tracking-wider">
                      输出音量控制 (MASTER VOL)
                    </span>
                    <span className="text-xs font-mono font-semibold text-amber-500">{volume}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      id="volume-mute-toggle"
                      onClick={toggleMute}
                      className="text-gray-450 hover:text-white transition-colors p-1"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-amber-500" />}
                    </button>
                    <input
                      id="master-volume-slider"
                      type="range"
                      min={0}
                      max={100}
                      value={volume}
                      onChange={(e) => handleVolumeSlide(parseInt(e.target.value) || 0)}
                      className="flex-1 accent-amber-500 h-2 bg-white/10 rounded-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* MASTER TRIGGER PANEL - Play/Pause and Tap Tempo */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-8 border-t border-white/5 pt-6">
              
              {/* Play Pause Circular Big Button */}
              <button
                id="master-play-toggle-btn"
                onClick={togglePlay}
                className={`flex-1 py-4 sm:py-4.5 px-6 rounded-full cursor-pointer transition-all flex items-center justify-center gap-3 font-semibold text-xs sm:text-sm tracking-widest ${
                  isPlaying
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.3)]'
                    : 'bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-[0_0_30px_rgba(245,158,11,0.35)] font-bold'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 stroke-[2.5]" />
                    <span>静止 (PAUSE ENGINE)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 stroke-[2.5] fill-current" />
                    <span>启动节拍 (START SOUND)</span>
                  </>
                )}
              </button>

              {/* TAP TEMPO Tapping Button */}
              <button
                id="tap-tempo-click-pad"
                onClick={handleTapTempo}
                className="glass-panel hover:bg-white/10 text-gray-100 py-3.5 sm:py-4.5 px-6 rounded-full text-xs font-bold font-mono tracking-widest cursor-pointer transition-all uppercase whitespace-nowrap text-center"
              >
                Tap Tempo
              </button>

            </div>

          </main>

          {/* Pendulum Swing Column */}
          <section className="lg:col-span-5 flex flex-col justify-between">
            <Pendulum
              bpm={bpm}
              currentBeat={currentBeat}
              beatsPerBar={beatsPerBar}
              subdivision={subdivision}
              currentSubdivisionStep={currentSubdivisionStep}
              isPlaying={isPlaying}
            />
          </section>

        </div>

        {/* SECTION 2: Practice Companions - Speed Trainer & Chamber Timer (Bento Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Progressive Speed Trainer */}
          <section>
            <SpeedTrainer
              config={trainerConfig}
              onChange={setTrainerConfig}
              currentBpm={bpm}
              isPlaying={isPlaying}
              setBpm={setBpm}
            />
          </section>

          {/* Practice Timer */}
          <section>
            <TimerPanel
              onTimerEnd={() => {
                // Actions when practice window closes: play rolled piano arpeggio chord, or silent stop
                playVictoryArpeggio();
              }}
            />
          </section>

        </div>

        {/* SECTION 3: Standard Piano Auxiliary Pitch Reference Keyboard */}
        <section>
          <PianoKeyboard onPlayNote={playPianoNote} />
        </section>

        {/* Soft, beautiful footer copyright */}
        <footer className="text-center text-[10px] text-gray-600 font-mono py-8 border-t border-gray-900">
          <span>PIANO MASTERPIECE ESSENTIALS © 2026. PROFESSIONAL STUDIO SERIES.</span>
          <span className="mx-2">•</span>
          <span>HIGH FIDELITY SCHEDULED AUDIO LOGIC</span>
        </footer>

      </div>
    </div>
  );
}
