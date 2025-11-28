import React from 'react';
import { BookOpen, FileText, Clock, Star, Settings } from 'lucide-react';

interface SidebarProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeFile: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onFileSelect, activeFile }) => {
  return (
    <div className="w-20 md:w-64 bg-note-sidebar border-r border-gray-200 h-full flex flex-col justify-between hidden sm:flex">
      <div>
        <div className="p-6 flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden md:block">NoteFlow</h1>
        </div>

        <nav className="px-3 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3 hidden md:block">Biblioteca</div>
          
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${!activeFile ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:bg-white/50'}`}>
            <FileText className="w-5 h-5" />
            <span className="font-medium hidden md:block">Todos os PDFs</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-white/50 transition-colors">
            <Clock className="w-5 h-5" />
            <span className="font-medium hidden md:block">Recentes</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-white/50 transition-colors">
            <Star className="w-5 h-5" />
            <span className="font-medium hidden md:block">Favoritos</span>
          </button>
        </nav>
      </div>

      <div className="p-4 space-y-3">
        <label className="flex items-center gap-3 px-3 py-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 cursor-pointer transition-all active:scale-95 justify-center md:justify-start">
            <input 
                type="file" 
                accept="application/pdf,.note" 
                onChange={onFileSelect} 
                className="hidden" 
            />
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span className="font-medium hidden md:block">Importar PDF</span>
        </label>
      </div>
    </div>
  );
};

export default Sidebar;