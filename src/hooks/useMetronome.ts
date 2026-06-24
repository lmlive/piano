import { useEffect, useRef, useState, useCallback } from 'react';
import { MetronomeSound, Subdivision, SpeedTrainerConfig, TEMPO_MARKINGS, TempoMarking } from '../types';

export function useMetronome() {
  const [bpm, setBpmState] = useState<number>(120);
  const [beatsPerBar, setBeatsPerBar] = useState<number>(4);
  const [subdivision, setSubdivision] = useState<Subdivision>(1);
  const [sound, setSound] = useState<MetronomeSound>('woodblock');
  const [volume, setVolume] = useState<number>(75); // 0 - 100
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [currentSubdivisionStep, setCurrentSubdivisionStep] = useState<number>(1);

  // Speed Trainer State
  const [trainerConfig, setTrainerConfig] = useState<SpeedTrainerConfig>({
    isActive: false,
    startBpm: 60,
    targetBpm: 120,
    increaseAmount: 4,
    increaseInterval: 2, // measures
    currentMeasures: 0,
  });

  // Native Web Audio Context References
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0.0);
  const timerIdRef = useRef<number | null>(null);
  const lastStateUpdateRef = useRef<number>(0);

  // Keep latest state in refs for scheduling thread
  const stateRef = useRef({
    bpm,
    beatsPerBar,
    subdivision,
    sound,
    volume,
    isPlaying,
    currentStep: 0, // total steps in current bar
    trainerConfig,
  });

  // Track total steps
  useEffect(() => {
    stateRef.current = {
      bpm,
      beatsPerBar,
      subdivision,
      sound,
      volume,
      isPlaying,
      currentStep: stateRef.current.currentStep,
      trainerConfig,
    };
  }, [bpm, beatsPerBar, subdivision, sound, volume, isPlaying, trainerConfig]);

  // Handle BPM adjustments safely within boundaries
  const setBpm = useCallback((newBpm: number) => {
    const clamped = Math.max(30, Math.min(280, Math.round(newBpm)));
    setBpmState(clamped);
  }, []);

  const getTempoMarking = useCallback((currentBpm: number): TempoMarking => {
    return (
      TEMPO_MARKINGS.find((m) => currentBpm >= m.min && currentBpm <= m.max) || {
        name: '中等',
        en: 'Moderato',
        min: 100,
        max: 120,
        color: 'text-teal-400 bg-teal-500/10',
      }
    );
  }, []);

  // Initialize Audio Context on demand (complies with browser-gesture safety)
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      // Clean fallback for older browsers
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Synth sounds generator
  const playClick = useCallback((time: number, isFirstBeat: boolean, isMainBeat: boolean, selectedSound: MetronomeSound, vol: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // Direct master gain node to prevent clipping
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    // Scaling overall volume
    const masterVolume = (vol / 100) * 0.45; // peak limit 0.45

    if (selectedSound === 'digital') {
      const osc = ctx.createOscillator();
      osc.connect(gainNode);

      let freq = 1000; // Regular main beat
      let gainVal = 1.0;

      if (isFirstBeat && isMainBeat) {
        freq = 1600; // Accent first beat
        gainVal = 1.2;
      } else if (!isMainBeat) {
        freq = 750; // Subdivision tick
        gainVal = 0.55;
      }

      osc.frequency.setValueAtTime(freq, time);
      gainNode.gain.setValueAtTime(0.01, time);
      gainNode.gain.exponentialRampToValueAtTime(gainVal * masterVolume, time + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

      osc.start(time);
      osc.stop(time + 0.1);
    } 
    else if (selectedSound === 'woodblock') {
      // Woodblock uses a rapid resonant filter bandpass on square waves/sine waves for organic woody click
      const osc = ctx.createOscillator();
      const bandpass = ctx.createBiquadFilter();
      
      osc.type = 'triangle';
      bandpass.type = 'bandpass';

      osc.connect(bandpass);
      bandpass.connect(gainNode);

      let freq = 1100;
      let qVal = 5.0;
      let gainVal = 1.0;

      if (isFirstBeat && isMainBeat) {
        freq = 1500;
        qVal = 6.0;
        gainVal = 1.2;
      } else if (!isMainBeat) {
        freq = 850;
        qVal = 4.0;
        gainVal = 0.5;
      }

      osc.frequency.setValueAtTime(freq, time);
      bandpass.frequency.setValueAtTime(freq, time);
      bandpass.Q.setValueAtTime(qVal, time);

      gainNode.gain.setValueAtTime(0.001, time);
      gainNode.gain.linearRampToValueAtTime(gainVal * masterVolume, time + 0.002);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);

      osc.start(time);
      osc.stop(time + 0.08);
    } 
    else if (selectedSound === 'piano') {
      // Simulates a resonant physical hammer strike with rich harmonics
      const baseFreq = isFirstBeat && isMainBeat ? 523.25 : !isMainBeat ? 329.63 : 261.63; // C5, E4, C4
      const gainVal = isFirstBeat ? 1.2 : !isMainBeat ? 0.35 : 0.8;
      
      // Create three partials for some basic key vibration
      const oscillators = [1, 2, 3].map((harmonic, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        
        osc.frequency.setValueAtTime(baseFreq * harmonic, time);
        
        // Slightly detune partials for rich warmth
        if (idx === 1) osc.detune.setValueAtTime(4, time);
        if (idx === 2) osc.detune.setValueAtTime(-6, time);

        // Individual volume ratios
        const ratio = idx === 0 ? 1.0 : idx === 1 ? 0.3 : 0.15;
        oscGain.gain.setValueAtTime(0.001, time);
        oscGain.gain.linearRampToValueAtTime(ratio * gainVal * masterVolume, time + 0.005);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, time + (idx === 0 ? 0.35 : 0.15));

        return osc;
      });

      oscillators.forEach(osc => {
        osc.start(time);
        osc.stop(time + 0.4);
      });
    } 
    else if (selectedSound === 'drum') {
      if (isFirstBeat && isMainBeat) {
        // High rimshot / snare click
        const osc = ctx.createOscillator();
        const noise = ctx.createOscillator(); // Or filtered noise, let's use high tone triangle
        osc.type = 'triangle';
        osc.connect(gainNode);
        osc.frequency.setValueAtTime(450, time);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.03);

        gainNode.gain.setValueAtTime(0.001, time);
        gainNode.gain.linearRampToValueAtTime(1.1 * masterVolume, time + 0.002);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

        osc.start(time);
        osc.stop(time + 0.1);
      } else if (isMainBeat) {
        // Bass kick drum
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.connect(gainNode);
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.04);

        gainNode.gain.setValueAtTime(0.001, time);
        gainNode.gain.linearRampToValueAtTime(1.3 * masterVolume, time + 0.003);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

        osc.start(time);
        osc.stop(time + 0.15);
      } else {
        // Hi hat closed
        const noiseNode = ctx.createBufferSource();
        // Create 0.04s white noise buffer
        const bufferSize = ctx.sampleRate * 0.04;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        noiseNode.buffer = buffer;

        // Bandpass at 10kHz to get crisp metal tick
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(11000, time);
        filter.Q.setValueAtTime(4.0, time);

        noiseNode.connect(filter);
        filter.connect(gainNode);

        gainNode.gain.setValueAtTime(0.001, time);
        gainNode.gain.linearRampToValueAtTime(0.4 * masterVolume, time + 0.001);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);

        noiseNode.start(time);
        noiseNode.stop(time + 0.04);
      }
    }
  }, []);

  // Professional Piano Key Synthesizer (used by PianoKeyboard)
  const playPianoNote = useCallback((frequency: number) => {
    const ctx = initAudio();
    if (!ctx) return;

    const gainNode = ctx.createGain();
    const convolver = ctx.createBiquadFilter(); // Soft high cut to simulate piano warmth
    convolver.type = 'lowpass';
    convolver.frequency.setValueAtTime(1800, ctx.currentTime);

    gainNode.connect(convolver);
    convolver.connect(ctx.destination);

    const masterVol = (volume / 100) * 0.55;

    // Piano key trigger: standard string decay
    // Consists of 4 oscillators (harmonic overtones) to rebuild rich sound stage
    const partials = [1, 2, 3, 4];
    const amplitudes = [1.0, 0.45, 0.25, 0.1];
    const decays = [1.5, 0.8, 0.4, 0.15];

    partials.forEach((partial, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.connect(oscGain);
      oscGain.connect(gainNode);

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(frequency * partial, ctx.currentTime);
      
      // Detunes for warm stereo and chorus effect
      if (idx === 1) osc.detune.setValueAtTime(5, ctx.currentTime);
      if (idx === 2) osc.detune.setValueAtTime(-4, ctx.currentTime);

      oscGain.gain.setValueAtTime(0.001, ctx.currentTime);
      oscGain.gain.linearRampToValueAtTime(amplitudes[idx] * masterVol, ctx.currentTime + 0.008);
      oscGain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + decays[idx]);

      osc.start();
      osc.stop(ctx.currentTime + decays[idx] + 0.1);
    });
  }, [initAudio, volume]);

  // Main high-precision scheduler loop
  const scheduleNextNotes = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const lookAheadTime = 0.12; // 120ms schedule queue window
    const schedulerInterval = 35; // 35ms resolution

    while (nextNoteTimeRef.current < ctx.currentTime + lookAheadTime) {
      const scheduledTime = nextNoteTimeRef.current;
      const currentBpm = stateRef.current.bpm;
      const currentSignature = stateRef.current.beatsPerBar;
      const currentSub = stateRef.current.subdivision;
      const currentSound = stateRef.current.sound;
      const currentVol = stateRef.current.volume;
      const trainer = stateRef.current.trainerConfig;

      // Current step in subdivisions
      const step = stateRef.current.currentStep;
      
      const beatsCount = Math.floor(step / currentSub);
      const isMainBeat = (step % currentSub) === 0;
      const beatIndex = beatsCount + 1; // 1-indexed
      const subIndex = (step % currentSub) + 1; // 1-indexed

      // Play click at the scheduled absolute time
      const isFirstBeat = beatIndex === 1;
      playClick(scheduledTime, isFirstBeat, isMainBeat, currentSound, currentVol);

      // Program React State Updates exactly synced to audio playheads
      const delayMs = Math.max(0, (scheduledTime - ctx.currentTime) * 1000);
      setTimeout(() => {
        if (!stateRef.current.isPlaying) return;
        
        setCurrentBeat(beatIndex);
        setCurrentSubdivisionStep(subIndex);

        // Speed Trainer: logic when measure completes
        if (beatIndex === currentSignature && subIndex === currentSub) {
          // Finished this measure! Take action
          if (trainer.isActive) {
            setTrainerConfig((prev) => {
              const nextMeasures = prev.currentMeasures + 1;
              if (nextMeasures >= prev.increaseInterval) {
                // Time to increase BPM
                const nextBpm = Math.min(prev.targetBpm, stateRef.current.bpm + prev.increaseAmount);
                if (nextBpm !== stateRef.current.bpm) {
                  setBpmState(nextBpm);
                  stateRef.current.bpm = nextBpm; // Immediate update for next notes schedulers
                }
                return { ...prev, currentMeasures: 0 };
              }
              return { ...prev, currentMeasures: nextMeasures };
            });
          }
        }
      }, delayMs);

      // Advance nextNoteTime by 1 subdivision length
      const subdivisionInterval = 60.0 / currentBpm / currentSub;
      nextNoteTimeRef.current += subdivisionInterval;

      // Cycle step index
      const stepsInMeasure = currentSignature * currentSub;
      stateRef.current.currentStep = (step + 1) % stepsInMeasure;
    }
    
    // Schedule subsequent pass
    timerIdRef.current = window.setTimeout(scheduleNextNotes, schedulerInterval);
  }, [playClick]);

  // Start Metronome
  const start = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;

    if (isPlaying) return;

    // Reset step
    stateRef.current.currentStep = 0;
    stateRef.current.isPlaying = true;
    setIsPlaying(true);
    
    // Set note starting point slightly in the future
    nextNoteTimeRef.current = ctx.currentTime + 0.05;

    // If speed trainer is entering fresh state, reset current measure counts to 0
    if (trainerConfig.isActive) {
      setBpmState(trainerConfig.startBpm);
      setTrainerConfig(prev => ({ ...prev, currentMeasures: 0 }));
      stateRef.current.bpm = trainerConfig.startBpm;
    }

    // Begin schedule loop
    scheduleNextNotes();
  }, [initAudio, isPlaying, scheduleNextNotes, trainerConfig]);

  // Stop Metronome
  const stop = useCallback(() => {
    stateRef.current.isPlaying = false;
    setIsPlaying(false);

    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }

    setCurrentBeat(1);
    setCurrentSubdivisionStep(1);
    stateRef.current.currentStep = 0;
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  // Safe reset when state like time signature or subdivision changes while playing, to prevent rhythm breaks
  useEffect(() => {
    if (isPlaying) {
      // Safely restart the loop synchronized
      stop();
      // Resume instantly
      setTimeout(() => {
        start();
      }, 30);
    }
  }, [beatsPerBar, subdivision]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
      }
    };
  }, []);

  return {
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
    tempoMarking: getTempoMarking(bpm),
    trainerConfig,
    setTrainerConfig,
    togglePlay,
    playPianoNote,
    initAudio,
  };
}
