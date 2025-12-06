import React from 'react';
import { StitchResult } from '../types';
import { X, Trash2, Calendar, ChevronRight, History } from 'lucide-react';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: StitchResult[];
  onSelect: (item: StitchResult) => void;
  onDelete: (id: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onSelect, 
  onDelete 
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-full md:w-96 bg-space-900 border-l border-space-700 z-50 transform transition-transform duration-300 ease-out shadow-2xl
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-space-700 flex justify-between items-center bg-space-900/95 backdrop-blur">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="text-sage-400" size={20} />
              <span>History</span>
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-space-800 rounded-full text-space-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center text-space-500 p-6 border-2 border-dashed border-space-800 rounded-xl">
                <History className="w-12 h-12 mb-4 opacity-20" />
                <p>No stitches saved yet.</p>
                <p className="text-xs mt-2 text-space-600">Create something to see it here.</p>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-space-800 border border-space-700 rounded-xl overflow-hidden hover:border-sage-500/50 transition-all group shadow-lg"
                >
                  <div 
                    className="p-3 flex gap-3 cursor-pointer hover:bg-space-700/30 transition-colors"
                    onClick={() => onSelect(item)}
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-black rounded-lg overflow-hidden shrink-0 border border-space-700 relative">
                      {item.generatedImageUrl ? (
                        <img src={item.generatedImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-space-800 text-space-600 text-xs">No Img</div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-semibold text-gray-200 truncate pr-4 text-sm">{item.title}</h3>
                      <p className="text-xs text-space-400 line-clamp-2 mt-1 mb-2 leading-relaxed">{item.synthesis}</p>
                      <div className="flex items-center gap-1 text-[10px] text-space-500 font-mono">
                        <Calendar size={10} />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-space-900/50 p-2 flex justify-between items-center border-t border-space-700/50">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                      className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-900/20 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button 
                       onClick={() => onSelect(item)}
                       className="text-sage-400 hover:text-sage-300 text-xs flex items-center gap-1 px-3 py-1 hover:bg-sage-900/20 rounded transition-colors font-medium"
                    >
                      Load <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
