import React from 'react';
import { Play, Pause, FastForward, Rewind, Settings } from 'lucide-react';
import { ScrollSettings } from '../types';

interface ControlBarProps {
  settings: ScrollSettings;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
  show: boolean;
}

const ControlBar: React.FC<ControlBarProps> = ({ settings, onTogglePlay, onSpeedChange, show }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
      <div className="bg-slate-900/90 backdrop-blur-md text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-6 border border-slate-700/50">
        
        {/* Play/Pause Button */}
        <button
          onClick={onTogglePlay}
          className={`p-3 rounded-full transition-all duration-300 ${
            settings.isPlaying 
              ? 'bg-red-500 hover:bg-red-600 rotate-0' 
              : 'bg-green-500 hover:bg-green-600 rotate-0'
          }`}
          aria-label={settings.isPlaying ? "Pausar Scroll" : "Iniciar Scroll"}
        >
          {settings.isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-1" />
          )}
        </button>

        <div className="flex flex-col gap-1 w-48">
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>Lento</span>
            <span>Velocidade: {settings.speed.toFixed(1)}x</span>
            <span>Rápido</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="5"
            step="0.1"
            value={settings.speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
          />
        </div>
        
        <div className="border-l border-slate-700 pl-4">
            <Rewind className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white" onClick={() => onSpeedChange(Math.max(0.2, settings.speed - 0.5))} />
        </div>
        <div>
            <FastForward className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white" onClick={() => onSpeedChange(Math.min(5, settings.speed + 0.5))} />
        </div>
      </div>
    </div>
  );
};

export default ControlBar;