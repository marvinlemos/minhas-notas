import React, { useState } from 'react';
import { X, Send, Bot, Loader2 } from 'lucide-react';
import { askStudyAssistant } from '../services/geminiService';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AssistantModal: React.FC<AssistantModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const answer = await askStudyAssistant(query);
    setResponse(answer);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
                <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-800">Assistente de Estudo</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {!response && !loading && (
            <div className="text-center text-slate-400 py-8">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Pergunte sobre conceitos, termos técnicos ou peça dicas de leitura rápida.</p>
            </div>
          )}

          {query && response && (
            <div className="space-y-4">
               <div className="flex justify-end">
                   <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm text-sm max-w-[85%]">
                       {query}
                   </div>
               </div>
               <div className="flex justify-start">
                   <div className="bg-white border border-gray-200 text-slate-700 px-5 py-3 rounded-2xl rounded-tl-sm text-sm max-w-[90%] shadow-sm leading-relaxed whitespace-pre-wrap">
                       {response}
                   </div>
               </div>
            </div>
          )}
           
          {loading && (
             <div className="flex justify-center py-8">
                 <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
             </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Como funciona a leitura dinâmica?"
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssistantModal;