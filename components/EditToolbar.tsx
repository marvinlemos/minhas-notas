import React from 'react';
import { Pen, Eye, Eraser, Save } from 'lucide-react';
import { AppMode, PenSettings, EraserSettings, DrawingTool } from '../types';

interface EditToolbarProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  penSettings: PenSettings;
  onPenSettingsChange: (settings: PenSettings) => void;
  isScrolling: boolean;
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  eraserSettings: EraserSettings;
  onEraserSettingsChange: (settings: EraserSettings) => void;
  onSave: () => void;
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#1e293b'];
const PEN_WIDTHS = [2, 4, 6, 8];
const ERASER_WIDTHS = [10, 20, 30, 40]; // Pixel sizes for eraser

const EditToolbar: React.FC<EditToolbarProps> = ({ 
  mode, 
  onModeChange, 
  penSettings, 
  onPenSettingsChange,
  isScrolling,
  activeTool,
  onToolChange,
  eraserSettings,
  onEraserSettingsChange,
  onSave
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm sticky top-0 z-50 overflow-x-auto no-scrollbar">
      
      <div className="flex items-center gap-4">
        {/* Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
            <button
            onClick={() => onModeChange(AppMode.VIEW)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === AppMode.VIEW 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
            >
            <Eye className="w-4 h-4" />
            Ler
            </button>
            <button
            onClick={() => !isScrolling && onModeChange(AppMode.EDIT)}
            disabled={isScrolling}
            title={isScrolling ? "Pause o scroll para ativar o modo de edição" : "Ativar modo de edição"}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === AppMode.EDIT 
                ? 'bg-white text-blue-600 shadow-sm' 
                : isScrolling 
                    ? 'text-slate-300 cursor-not-allowed' 
                    : 'text-slate-500 hover:text-slate-700'
            }`}
            >
            <Pen className="w-4 h-4" />
            Anotar
            </button>
        </div>

        {/* Save Button */}
        <button 
            onClick={onSave}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            title="Salvar como .note"
        >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Salvar</span>
        </button>
      </div>

      {/* Edit Controls */}
      {mode === AppMode.EDIT && (
        <div className="flex items-center gap-4 animate-fade-in-right overflow-x-auto ml-4">
          
          <div className="h-6 w-px bg-gray-300 shrink-0"></div>

          {/* Tools Toggle */}
           <div className="flex bg-slate-100 p-0.5 rounded-lg shrink-0">
             <button
               onClick={() => onToolChange(DrawingTool.PEN)}
               className={`p-1.5 rounded-md transition-all ${
                 activeTool === DrawingTool.PEN ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
               }`}
               title="Caneta"
             >
               <Pen className="w-4 h-4" />
             </button>
             <button
               onClick={() => onToolChange(DrawingTool.ERASER)}
               className={`p-1.5 rounded-md transition-all ${
                 activeTool === DrawingTool.ERASER ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
               }`}
               title="Borracha"
             >
               <Eraser className="w-4 h-4" />
             </button>
           </div>

           <div className="h-6 w-px bg-gray-300 shrink-0"></div>

          {/* PEN: Colors */}
          {activeTool === DrawingTool.PEN && (
            <div className="flex items-center gap-2 shrink-0">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => onPenSettingsChange({ ...penSettings, color })}
                  className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                    penSettings.color === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Cor ${color}`}
                />
              ))}
            </div>
          )}

          {/* SHARED: Widths (Contextual) */}
          <div className="flex items-center gap-3 shrink-0">
             {(activeTool === DrawingTool.PEN ? PEN_WIDTHS : ERASER_WIDTHS).map(width => (
                 <button
                    key={width}
                    onClick={() => {
                        if (activeTool === DrawingTool.PEN) {
                            onPenSettingsChange({ ...penSettings, width });
                        } else {
                            onEraserSettingsChange({ ...eraserSettings, width });
                        }
                    }}
                    className={`rounded-full flex items-center justify-center w-8 h-8 transition-colors ${
                        (activeTool === DrawingTool.PEN ? penSettings.width : eraserSettings.width) === width ? 'bg-slate-200' : 'hover:bg-slate-100'
                    }`}
                    title={activeTool === DrawingTool.ERASER ? `Tamanho borracha: ${width}px` : `Espessura: ${width}px`}
                 >
                     <div 
                        className={`rounded-full ${activeTool === DrawingTool.ERASER ? 'bg-white border border-slate-400' : 'bg-slate-800'}`}
                        style={{ 
                            width: activeTool === DrawingTool.ERASER ? width / 2 : width, 
                            height: activeTool === DrawingTool.ERASER ? width / 2 : width 
                        }}
                     />
                 </button>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditToolbar;