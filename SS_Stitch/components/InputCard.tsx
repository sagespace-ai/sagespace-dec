import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, FileText, Camera, AlertCircle } from 'lucide-react';
import { InputData } from '../types';

interface InputCardProps {
  label: string;
  data: InputData;
  onChange: (data: InputData) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const InputCard: React.FC<InputCardProps> = ({ label, data, onChange, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...data, text: e.target.value });
    if (error) setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError("Image exceeds 5MB limit");
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setError(null);
      const url = URL.createObjectURL(file);
      onChange({ ...data, image: file, imageUrl: url });
    }
  };

  const clearImage = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    onChange({ ...data, image: null, imageUrl: null });
    setError(null);
  };

  // Camera Functions
  const startCamera = async () => {
    if (disabled) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.error("Failed to access camera", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the current frame
        ctx.drawImage(videoRef.current, 0, 0);
        
        // Convert to Blob/File
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            const url = URL.createObjectURL(file);
            onChange({ ...data, image: file, imageUrl: url });
            setError(null);
            stopCamera();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  // Attach stream to video element
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-space-800 border border-space-700 rounded-xl overflow-hidden transition-all duration-300 hover:border-sage-700/50 group relative">
      <div className="bg-space-900/50 p-3 border-b border-space-700 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sage-400">
          <span className="bg-sage-900/50 text-sage-400 text-xs font-mono px-2 py-0.5 rounded border border-sage-800">
            {label}
          </span>
        </div>
        {!data.image && !isCameraActive && (
          <div className="flex gap-2">
             <button 
              onClick={startCamera}
              className="text-space-600 hover:text-sage-400 transition-colors"
              disabled={disabled}
              title="Take Photo"
            >
              <Camera size={18} />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-space-600 hover:text-sage-400 transition-colors"
              disabled={disabled}
              title="Upload Image"
            >
              <ImageIcon size={18} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 p-2 flex items-center justify-between text-xs text-red-200 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="hover:text-white transition-colors">
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Camera Overlay */}
        {isCameraActive && (
          <div className="absolute inset-0 z-20 bg-black flex flex-col">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="flex-1 w-full h-full object-cover" 
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-8 pb-2">
               <button 
                 onClick={stopCamera}
                 className="p-3 rounded-full bg-red-500/20 text-red-200 hover:bg-red-500/40 backdrop-blur-md transition-all"
                 title="Cancel"
               >
                 <X size={24} />
               </button>
               <button 
                 onClick={capturePhoto}
                 className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 backdrop-blur-md transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                 title="Capture"
               >
                 <div className="w-12 h-12 bg-white rounded-full"></div>
               </button>
            </div>
          </div>
        )}

        {/* Image Preview Area */}
        {data.imageUrl && !isCameraActive && (
          <div className="relative h-48 bg-black/40 shrink-0">
            <img 
              src={data.imageUrl} 
              alt="Input" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
            />
            <button 
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-900/80 transition-colors backdrop-blur-sm"
              disabled={disabled}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Text Area */}
        <textarea
          className="flex-1 bg-transparent p-4 resize-none focus:outline-none text-sage-100 placeholder-space-600 font-light leading-relaxed"
          placeholder={`Enter concept for ${label}...`}
          value={data.text}
          onChange={handleTextChange}
          disabled={disabled}
        />
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        {/* Empty State visual indicator if nothing is there */}
        {!data.text && !data.image && !isCameraActive && (
           <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <FileText className="text-space-700 w-16 h-16" />
           </div>
        )}
      </div>
    </div>
  );
};
