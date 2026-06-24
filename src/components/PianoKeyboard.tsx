import React, { useState } from 'react';
import { Music, Eye, EyeOff } from 'lucide-react';

interface PianoKeyboardProps {
  onPlayNote: (frequency: number) => void;
}

interface PianoKey {
  note: string;
  label: string;
  doReMi: string;
  freq: number;
  isBlack: boolean;
  offset?: string; // custom design offset for black keys to overlap correctly
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ onPlayNote }) => {
  const [showLabels, setShowLabels] = useState<'alpha' | 'doReMi' | 'none'>('alpha');
  const [pressedNote, setPressedNote] = useState<string | null>(null);

  // Generate 17 precise chromatic piano keys from C4 (Middle C) to E5
  const keys: PianoKey[] = [
    { note: 'C4', label: 'C4', doReMi: 'Do', freq: 261.63, isBlack: false },
    { note: 'C#4', label: 'C#4', doReMi: '什Do', freq: 277.18, isBlack: true, offset: 'left-[22px] sm:left-[30px]' },
    { note: 'D4', label: 'D4', doReMi: 'Re', freq: 293.66, isBlack: false },
    { note: 'D#4', label: 'D#4', doReMi: '什Re', freq: 311.13, isBlack: true, offset: 'left-[62px] sm:left-[82px]' },
    { note: 'E4', label: 'E4', doReMi: 'Mi', freq: 329.63, isBlack: false },
    
    { note: 'F4', label: 'F4', doReMi: 'Fa', freq: 349.23, isBlack: false },
    { note: 'F#4', label: 'F#4', doReMi: '什Fa', freq: 369.99, isBlack: true, offset: 'left-[142px] sm:left-[186px]' },
    { note: 'G4', label: 'G4', doReMi: 'Sol', freq: 392.00, isBlack: false },
    { note: 'G#4', label: 'G#4', doReMi: '什So', freq: 415.30, isBlack: true, offset: 'left-[182px] sm:left-[238px]' },
    { note: 'A4', label: 'A4', doReMi: 'La', freq: 440.00, isBlack: false },
    { note: 'A#4', label: 'A#4', doReMi: '什La', freq: 466.16, isBlack: true, offset: 'left-[222px] sm:left-[290px]' },
    { note: 'B4', label: 'B4', doReMi: 'Si', freq: 493.88, isBlack: false },
    
    { note: 'C5', label: 'C5', doReMi: 'Do', freq: 523.25, isBlack: false },
    { note: 'C#5', label: 'C#5', doReMi: '什Do', freq: 554.37, isBlack: true, offset: 'left-[302px] sm:left-[394px]' },
    { note: 'D5', label: 'D5', doReMi: 'Re', freq: 587.33, isBlack: false },
    { note: 'D#5', label: 'D#5', doReMi: '什Re', freq: 622.25, isBlack: true, offset: 'left-[342px] sm:left-[446px]' },
    { note: 'E5', label: 'E5', doReMi: 'Mi', freq: 659.25, isBlack: false },
  ];

  const handleKeyPress = (key: PianoKey) => {
    setPressedNote(key.note);
    onPlayNote(key.freq);
    setTimeout(() => setPressedNote(null), 180);
  };

  // Separate white keys and black keys to construct a beautiful overlay grid
  const whiteKeys = keys.filter((k) => !k.isBlack);
  const blackKeys = keys.filter((k) => k.isBlack);

  return (
    <div id="piano-keyboard-widget" className="glass-panel rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      
      {/* Wooden Piano Finish Header Rim */}
      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-red-950/80 via-amber-950/60 to-red-950/80 border-b border-amber-950 shadow-inner" />

      {/* Control row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 mt-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
            <Music className="w-4 h-4 text-amber-500" />
            钢琴调音及测音参考键盘 (Keyboard Reference)
          </h2>
          <p className="text-[11px] text-gray-450 mt-0.5">
            1.5个八度标准唱名参考，支持音准对位、音阶试奏
          </p>
        </div>

        {/* Labels Overlay Switch */}
        <div className="flex items-center gap-1 glass-panel p-1 rounded-xl self-start sm:self-center">
          <button
            id="piano-label-alpha"
            onClick={() => setShowLabels('alpha')}
            className={`px-3 py-1.5 text-[10px] rounded-lg cursor-pointer transition-all font-mono font-bold ${
              showLabels === 'alpha' ? 'bg-amber-500 text-gray-950 shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            CDEFG
          </button>
          <button
            id="piano-label-doremi"
            onClick={() => setShowLabels('doReMi')}
            className={`px-3 py-1.5 text-[10px] rounded-lg cursor-pointer transition-all font-bold ${
              showLabels === 'doReMi' ? 'bg-amber-500 text-gray-950 shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            DoReMi
          </button>
          <button
            id="piano-label-none"
            onClick={() => setShowLabels('none')}
            className={`px-3 py-1.5 text-[10px] rounded-lg cursor-pointer transition-all font-medium ${
              showLabels === 'none' ? 'bg-amber-500 text-gray-950 shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            无字
          </button>
        </div>
      </div>

      {/* Real Piano Visual Chassis */}
      <div className="relative flex justify-center w-full overflow-x-auto py-1 scrollbar-thin">
        {/* Ivory and Ebony Keybed Frame */}
        <div id="piano-keybed" className="relative flex min-w-[340px] sm:min-w-[510px] h-32 sm:h-40 bg-gray-950 border-r border-[#1a1714] p-1.5 rounded-xl shadow-2xl">
          
          {/* 1. White keys underlying row */}
          <div className="flex w-full h-full relative z-10">
            {whiteKeys.map((key) => {
              const isPressed = pressedNote === key.note;
              return (
                <button
                  key={key.note}
                  id={`key-${key.note}`}
                  onMouseDown={() => handleKeyPress(key)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleKeyPress(key);
                  }}
                  className={`flex flex-col justify-end items-center pb-2.5 w-[34px] sm:w-[51px] h-full border-r border-b-4 border-gray-300 rounded-b-md transition-all cursor-pointer select-none ${
                    isPressed
                      ? 'bg-gradient-to-b from-gray-200 to-amber-100 border-b-0 shadow-inner mt-px transform translate-y-0.5'
                      : 'bg-gradient-to-b from-white via-gray-50 to-gray-200 hover:from-gray-100 hover:to-white hover:shadow-lg'
                  }`}
                >
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-gray-600 select-none">
                    {showLabels === 'alpha' ? key.label : showLabels === 'doReMi' ? key.doReMi : ''}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 2. Black keys floating row overlaid */}
          <div className="absolute top-0 inset-x-0 h-2/3 pointer-events-none z-20">
            {blackKeys.map((key) => {
              const isPressed = pressedNote === key.note;
              return (
                <button
                  key={key.note}
                  id={`key-${key.note}`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleKeyPress(key);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleKeyPress(key);
                  }}
                  style={{ width: '22px' }}
                  className={`absolute h-full ${key.offset} bg-gradient-to-b from-gray-900 via-gray-950 to-black hover:from-black hover:to-gray-900 border-r border-b-[6px] border-black rounded-b rounded-r-sm cursor-pointer pointer-events-auto select-none transition-all flex flex-col justify-end items-center pb-1.5 shadow-md ${
                    isPressed
                      ? 'border-b-0 brightness-110 mt-px transform translate-y-0.5'
                      : 'active:bg-gray-900'
                  }`}
                >
                  <span className="text-[7px] sm:text-[8px] font-sans text-gray-400 font-medium scale-90 select-none mb-1">
                    {showLabels === 'alpha' ? key.label : showLabels === 'doReMi' ? key.doReMi : ''}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
