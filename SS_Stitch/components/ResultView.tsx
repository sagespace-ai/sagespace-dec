import React from 'react';
import { StitchResult } from '../types';
import { Sparkles, Download, Share2 } from 'lucide-react';

interface ResultViewProps {
  result: StitchResult;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onReset }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="bg-space-800 border border-sage-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-sage-900/20">
        {/* Header */}
        <div className="bg-space-900 p-6 border-b border-space-700 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-sage-400 w-5 h-5" />
              <span className="text-sage-400 font-mono text-xs tracking-wider uppercase">Stitch Complete</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{result.title}</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onReset}
              className="px-4 py-2 rounded-lg bg-space-800 border border-space-600 text-gray-300 hover:text-white hover:border-sage-500 transition-all text-sm"
            >
              New Stitch
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Visual Side */}
          <div className="relative bg-black min-h-[400px] flex items-center justify-center border-b md:border-b-0 md:border-r border-space-700 p-4">
             {result.generatedImageUrl ? (
               <img 
                 src={result.generatedImageUrl} 
                 alt={result.title}
                 className="w-full h-full object-contain rounded-lg shadow-lg"
               />
             ) : (
               <div className="flex flex-col items-center gap-4 text-space-500 animate-pulse">
                 <div className="w-16 h-16 rounded-full border-2 border-space-700 border-t-sage-500 animate-spin"></div>
                 <span className="font-mono text-sm">Rendering Visualization...</span>
               </div>
             )}
          </div>

          {/* Text Side */}
          <div className="p-8 flex flex-col justify-center">
             <div className="prose prose-invert prose-sage max-w-none">
                <h3 className="text-lg font-semibold text-sage-200 mb-4 font-mono uppercase tracking-widest text-xs border-b border-space-700 pb-2">Synthesis</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {result.synthesis}
                </p>

                <div className="mt-8 pt-6 border-t border-space-700">
                  <h3 className="text-lg font-semibold text-space-400 mb-2 font-mono uppercase tracking-widest text-xs">Visual Prompt DNA</h3>
                  <p className="text-space-500 font-mono text-xs leading-relaxed bg-space-900/50 p-4 rounded-lg border border-space-700/50">
                    {result.visualPrompt}
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
