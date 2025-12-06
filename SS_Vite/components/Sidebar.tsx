import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Mic, Image as ImageIcon, X, Paperclip, ShieldCheck, Sparkles, Zap, Smartphone, Headphones, FileText, MessageSquare, Smile } from 'lucide-react';
import { PostType, PostCategory } from '../types';

interface SidebarProps {
  currentPersona: string;
  onUpdatePersona: (newPersona: string) => void;
  onRefresh: () => void;
  isGenerating: boolean;
  selectedTypes: PostType[];
  onToggleType: (type: PostType) => void;
  selectedCategories: PostCategory[];
  onToggleCategory: (category: PostCategory) => void;
}

// Custom Logo Component for the Randomizer Button
const SageSpaceLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="sageGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6" />
        <stop offset="1" stopColor="#d946ef" />
      </linearGradient>
    </defs>
    <g stroke="url(#sageGradient)" strokeWidth="8" strokeLinecap="round">
       <path d="M50 50m -35 0a 35 35 0 1 0 70 0a 35 35 0 1 0 -70 0" strokeOpacity="0.2" />
       <path d="M50 15 C 70 15, 85 30, 85 50" />
       <path d="M85 50 C 85 70, 70 85, 50 85" />
       <path d="M15 50 C 15 30, 30 15, 50 15" transform="rotate(45 50 50)" />
    </g>
    <circle cx="50" cy="50" r="8" fill="url(#sageGradient)" />
  </svg>
);

const RANDOM_PERSONAS = [
  "A chaotic time-traveler stuck in 2024 who is obsessed with ancient memes and warns everyone about 'The Great Digital Crunch' of 2038.",
  "A stoic architectural critic who only reviews bird nests and beaver dams with high-brow academic language.",
  "An overly optimistic AI that misunderstands human idioms and tries to give life advice based on software engineering principles.",
  "A marine biologist who is secretly convinced that octopuses are running the stock market.",
  "A cyberpunk street artist from Neo-Tokyo posting glitched manifestos and neon-soaked philosophy.",
  "A 19th-century ghost trying to understand TikTok trends and complaining about the lack of candlelight.",
  "A theoretical physicist who uses baking analogies to explain quantum entanglement.",
  "A minimal techno DJ who communicates primarily in emojis and obscure music production references."
];

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPersona, 
  onUpdatePersona, 
  onRefresh, 
  isGenerating,
  selectedTypes,
  onToggleType,
  selectedCategories,
  onToggleCategory
}) => {
  const [prompt, setPrompt] = useState(currentPersona);
  const [isListening, setIsListening] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      // If an image is attached, we append a note to the prompt for the AI to see (simulated)
      const finalPrompt = attachedImage 
        ? `${prompt}\n\n[Context: User uploaded an image related to this persona]`
        : prompt;
      onUpdatePersona(finalPrompt);
    }, 500);
    return () => clearTimeout(timer);
  }, [prompt, attachedImage, onUpdatePersona]);

  const handleRandomize = () => {
    // Pick a random persona to simulate "past preferences" algorithm
    const randomChoice = RANDOM_PERSONAS[Math.floor(Math.random() * RANDOM_PERSONAS.length)];
    setPrompt(randomChoice);
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(prev => prev + (prev ? " " : "") + transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedImage(file.name);
    }
  };

  return (
    <div className="w-full lg:w-80 lg:h-screen lg:fixed lg:left-0 top-0 bg-surface border-r border-surfaceHighlight flex flex-col z-10 font-sans shadow-2xl">
      {/* Brand Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-surfaceHighlight rounded-full p-2 shadow-lg shadow-primary/10">
            <SageSpaceLogo className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">SageSpace</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Tuner</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 flex flex-col overflow-y-auto custom-scrollbar pb-20">
        
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">
          Who are you today?
        </label>
        
        <div className="relative min-h-[160px] flex flex-col mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none placeholder:text-zinc-700 leading-relaxed custom-scrollbar min-h-[120px]"
            placeholder="Describe the persona you want to see... (e.g., 'A sarcastic robot interested in 18th century pottery')"
          />
          
          {/* Attached Image Indicator */}
          {attachedImage && (
            <div className="absolute bottom-4 left-4 right-4 bg-zinc-800 rounded-lg p-2 flex items-center justify-between border border-zinc-700 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center space-x-2 text-xs text-zinc-300 truncate">
                <Paperclip size={12} />
                <span className="truncate">{attachedImage}</span>
              </div>
              <button onClick={() => setAttachedImage(null)} className="text-zinc-500 hover:text-white">
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-3 mb-8">
          {/* Mic */}
          <button 
            onClick={handleMicClick}
            className={`p-3 rounded-xl border flex items-center justify-center transition-all duration-200 ${isListening ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
            title="Voice Input"
          >
            <Mic size={20} />
          </button>

          {/* Image Upload */}
          <div className="relative">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden" 
              accept="image/*"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all duration-200"
              title="Upload Image Context"
            >
              <ImageIcon size={20} />
            </button>
          </div>

          {/* Random / SageSpace Button */}
          <button 
            onClick={handleRandomize}
            className="flex-1 p-3 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 flex items-center justify-center space-x-2 transition-all duration-200 group relative overflow-hidden"
            title="Surprise Me (Random Prompt)"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <SageSpaceLogo className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
            <span className="text-sm font-semibold text-primary/90 group-hover:text-primary">Surprise Me</span>
          </button>
        </div>

        {/* Filter Section */}
        <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">
                Format
              </label>
              <div className="flex flex-wrap gap-2">
                 {[
                   { type: PostType.IMAGE, icon: ImageIcon, label: 'Image' },
                   { type: PostType.ARTICLE, icon: FileText, label: 'Article' },
                   { type: PostType.AUDIO, icon: Headphones, label: 'Audio' },
                   { type: PostType.SHORT, icon: Smartphone, label: 'Short' },
                   { type: PostType.MEME, icon: Smile, label: 'Meme' },
                   { type: PostType.TWEET, icon: MessageSquare, label: 'Text' },
                 ].map((item) => {
                    const isActive = selectedTypes.includes(item.type);
                    return (
                      <button
                        key={item.type}
                        onClick={() => onToggleType(item.type)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 border transition-all duration-200 ${isActive ? 'bg-zinc-100 text-black border-transparent shadow-lg shadow-white/10' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}
                      >
                         <item.icon size={14} />
                         <span>{item.label}</span>
                      </button>
                    )
                 })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">
                Vibe
              </label>
              <div className="flex flex-wrap gap-2">
                 {[
                   { cat: PostCategory.REALITY, icon: ShieldCheck, label: 'Reality', color: 'text-emerald-500' },
                   { cat: PostCategory.HYPOTHETICAL, icon: Sparkles, label: 'What-If', color: 'text-fuchsia-500' },
                   { cat: PostCategory.SATIRE, icon: Zap, label: 'Creative', color: 'text-amber-500' },
                 ].map((item) => {
                    const isActive = selectedCategories.includes(item.cat);
                    return (
                      <button
                        key={item.cat}
                        onClick={() => onToggleCategory(item.cat)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 border transition-all duration-200 ${isActive ? 'bg-zinc-800 border-zinc-600 text-white shadow-lg' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}
                      >
                         <item.icon size={14} className={isActive ? item.color : ''} />
                         <span>{item.label}</span>
                      </button>
                    )
                 })}
              </div>
            </div>
        </div>

      </div>

      {/* Footer Action */}
      <div className="p-6 border-t border-surfaceHighlight bg-surface">
        <button
          onClick={onRefresh}
          disabled={isGenerating}
          className={`w-full py-4 bg-zinc-100 hover:bg-white text-black rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shadow-white/5 active:scale-[0.98] ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="animate-spin mr-2" size={18} />
              Generating Feed...
            </>
          ) : (
            <>
              Generate Feed
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
