import React, { useState, useEffect } from 'react';
import { InputData, StitchResult, StitchState } from './types';
import { geminiService } from './services/gemini';
import { historyService } from './services/history';
import { InputCard } from './components/InputCard';
import { ResultView } from './components/ResultView';
import { HistorySidebar } from './components/HistorySidebar';
import { BrainCircuit, Loader2, Sparkles, History } from 'lucide-react';

const initialInput = (id: string): InputData => ({
  id,
  text: '',
  image: null,
  imageUrl: null
});

function App() {
  const [inputA, setInputA] = useState<InputData>(initialInput('A'));
  const [inputB, setInputB] = useState<InputData>(initialInput('B'));
  const [status, setStatus] = useState<StitchState>(StitchState.IDLE);
  const [result, setResult] = useState<StitchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // History State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<StitchResult[]>([]);

  useEffect(() => {
    setHistoryItems(historyService.getHistory());
  }, []);

  const canStitch = (inputA.text || inputA.image) && (inputB.text || inputB.image);

  const handleStitch = async () => {
    if (!canStitch) return;

    setStatus(StitchState.ANALYZING);
    setError(null);

    try {
      // Step 1: Analyze and Text Synthesis
      const analysis = await geminiService.analyzeAndStitch(inputA, inputB);
      
      const intermediateResult: StitchResult = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        title: analysis.title,
        synthesis: analysis.synthesis,
        visualPrompt: analysis.visualPrompt,
        inputs: { a: inputA, b: inputB }
      };

      setResult(intermediateResult);
      setStatus(StitchState.GENERATING_IMAGE);

      // Step 2: Generate Image
      let finalResult = intermediateResult;
      try {
        const imageUrl = await geminiService.generateStitchedImage(analysis.visualPrompt);
        finalResult = { ...intermediateResult, generatedImageUrl: imageUrl };
        setResult(finalResult);
      } catch (imgErr) {
        console.warn("Image generation failed, but synthesis is complete", imgErr);
        // We proceed with the text-only result if image generation fails
      }

      setStatus(StitchState.COMPLETE);
      
      // Save to history automatically
      const updatedHistory = historyService.saveStitch(finalResult);
      setHistoryItems(updatedHistory);

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Something went wrong during the stitching process.");
      setStatus(StitchState.ERROR);
    }
  };

  const handleReset = () => {
    setInputA(initialInput('A'));
    setInputB(initialInput('B'));
    setResult(null);
    setStatus(StitchState.IDLE);
    setError(null);
  };

  const handleHistorySelect = (item: StitchResult) => {
    setResult(item);
    // Restore inputs text only (images are not persisted in history)
    setInputA({ ...initialInput('A'), text: item.inputs.a.text });
    setInputB({ ...initialInput('B'), text: item.inputs.b.text });
    setStatus(StitchState.COMPLETE);
    setHistoryOpen(false);
  };

  const handleHistoryDelete = (id: string) => {
    const updated = historyService.deleteStitch(id);
    setHistoryItems(updated);
    // If the currently viewed result is deleted, decide if we should clear it. 
    // For now, let's keep it visible until user resets.
  };

  return (
    <div className="min-h-screen bg-space-900 text-gray-100 flex flex-col font-sans selection:bg-sage-500/30 selection:text-sage-200">
      
      {/* Header */}
      <header className="border-b border-space-700 bg-space-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center shadow-lg shadow-sage-500/20">
              <BrainCircuit className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">SageSpace <span className="font-light text-sage-400">Stitch</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono text-space-500 hidden md:block">
              Gemini Powered Synthesis Engine v2.5
            </div>
            <div className="h-6 w-px bg-space-700 hidden md:block"></div>
            <button 
              onClick={() => setHistoryOpen(true)}
              className="p-2 text-space-400 hover:text-sage-400 hover:bg-space-800 rounded-lg transition-all relative group"
              title="History"
            >
              <History size={20} />
              {historyItems.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-sage-500 rounded-full border border-space-900"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      <HistorySidebar 
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        items={historyItems}
        onSelect={handleHistorySelect}
        onDelete={handleHistoryDelete}
      />

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sage-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>

        {status === StitchState.IDLE || status === StitchState.ERROR ? (
          <div className="w-full max-w-6xl z-10 flex flex-col gap-8 items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* Hero Text */}
             <div className="text-center mb-8 max-w-2xl">
               <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-sage-100 to-sage-400">
                 Weave New Realities
               </h2>
               <p className="text-space-400 text-lg font-light">
                 Combine concepts, blend images, and generate novel ideas. 
                 Enter two distinct inputs below to stitch them together.
               </p>
             </div>

             {/* Input Grid */}
             <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 w-full h-[500px]">
               <InputCard 
                 label="Thread A" 
                 data={inputA} 
                 onChange={setInputA} 
               />
               
               {/* Center Action */}
               <div className="flex flex-col items-center justify-center gap-4 px-2">
                 <div className="h-full w-px bg-gradient-to-b from-transparent via-space-700 to-transparent hidden md:block"></div>
                 <button
                   onClick={handleStitch}
                   disabled={!canStitch}
                   className={`
                     group relative flex items-center justify-center w-24 h-24 rounded-full 
                     transition-all duration-300 ease-out shadow-2xl z-20
                     ${canStitch 
                       ? 'bg-sage-600 hover:bg-sage-500 hover:scale-110 active:scale-95 shadow-sage-500/20 hover:shadow-sage-500/50 cursor-pointer' 
                       : 'bg-space-800 border border-space-700 cursor-not-allowed opacity-50'}
                   `}
                 >
                   <span className={`absolute inset-0 rounded-full border border-white/10 transition-transform duration-500 ${canStitch ? 'group-hover:scale-125' : ''}`}></span>
                   {canStitch ? (
                     <Sparkles className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-300" />
                   ) : (
                     <BrainCircuit className="w-8 h-8 text-space-600" />
                   )}
                 </button>
                 <div className="h-full w-px bg-gradient-to-b from-transparent via-space-700 to-transparent hidden md:block"></div>
               </div>

               <InputCard 
                 label="Thread B" 
                 data={inputB} 
                 onChange={setInputB} 
               />
             </div>

             {error && (
               <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 text-red-200 rounded-lg text-sm max-w-md text-center animate-in fade-in slide-in-from-top-2">
                 {error}
               </div>
             )}
          </div>
        ) : (
          <div className="w-full max-w-6xl z-10">
            {status === StitchState.ANALYZING && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse-slow">
                 <Loader2 className="w-16 h-16 text-sage-500 animate-spin mb-6" />
                 <h3 className="text-2xl font-light text-white">Analyzing Threads...</h3>
                 <p className="text-space-400 mt-2 font-mono text-sm">Finding latent connections between A and B</p>
              </div>
            )}
            
            {(status === StitchState.GENERATING_IMAGE || status === StitchState.COMPLETE) && result && (
               <ResultView result={result} onReset={handleReset} />
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
