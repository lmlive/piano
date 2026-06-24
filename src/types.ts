export interface TempoMarking {
  name: string;
  en: string;
  min: number;
  max: number;
  color: string;
}

export type MetronomeSound = 'woodblock' | 'digital' | 'piano' | 'drum';

export interface SoundOption {
  id: MetronomeSound;
  name: string;
  icon: string;
}

export type Subdivision = 1 | 2 | 3 | 4;

export interface SubdivisionOption {
  value: Subdivision;
  name: string;
  label: string;
  icon: string;
}

export interface BeatState {
  currentBeat: number;
  currentSubdivision: number;
  playState: 'playing' | 'paused';
}

export interface SpeedTrainerConfig {
  isActive: boolean;
  startBpm: number;
  targetBpm: number;
  increaseAmount: number; // BPM to increase
  increaseInterval: number; // in measures (bars)
  currentMeasures: number;
}

export const TEMPO_MARKINGS: TempoMarking[] = [
  { name: '最缓板', en: 'Grave / Largo', min: 30, max: 59, color: 'text-rose-400 bg-rose-500/10' },
  { name: '宽广慢板', en: 'Lento', min: 60, max: 69, color: 'text-orange-400 bg-orange-500/10' },
  { name: '柔板', en: 'Adagio', min: 70, max: 79, color: 'text-amber-400 bg-amber-500/10' },
  { name: '行板', en: 'Andante', min: 80, max: 99, color: 'text-emerald-400 bg-emerald-500/10' },
  { name: '中庸的快板', en: 'Moderato', min: 100, max: 119, color: 'text-teal-400 bg-teal-500/10' },
  { name: '快板', en: 'Allegro', min: 120, max: 155, color: 'text-blue-400 bg-blue-500/10' },
  { name: '活泼板', en: 'Vivace', min: 156, max: 175, color: 'text-indigo-400 bg-indigo-500/10' },
  { name: '急板', en: 'Presto', min: 176, max: 200, color: 'text-purple-400 bg-purple-500/10' },
  { name: '极速板', en: 'Prestissimo', min: 201, max: 280, color: 'text-pink-400 bg-pink-500/10' },
];

export const SOUNDS: SoundOption[] = [
  { id: 'woodblock', name: '传统木鱼', icon: 'Drum' },
  { id: 'digital', name: '电子滴答', icon: 'Cpu' },
  { id: 'piano', name: '钢琴琴音', icon: 'Music' },
  { id: 'drum', name: '爵士鼓点', icon: 'Sparkles' },
];

export const SUBDIVISIONS: SubdivisionOption[] = [
  { value: 1, name: '四分音符', label: '1/1', icon: 'minus' },
  { value: 2, name: '八分音符', label: '1/2', icon: 'divide' },
  { value: 3, name: '三连音', label: '1/3', icon: 'percent' },
  { value: 4, name: '十六分音符', label: '1/4', icon: 'grid' },
];
