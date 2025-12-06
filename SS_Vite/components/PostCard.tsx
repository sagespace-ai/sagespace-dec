import React, { useState, useEffect, useRef } from 'react';
import { PostData, PostType, PostCategory, Comment } from '../types';
import { Heart, MessageCircle, Share2, Bookmark, ExternalLink, Check, Sparkles, ShieldCheck, Zap, UserCheck, Send, Film, Loader2, Twitter, Linkedin, Copy, Play, Pause, Volume2, VolumeX, Mic, Square, ThumbsUp, Reply } from 'lucide-react';
import { generateVideoFromPost } from '../services/geminiService';

interface PostCardProps {
  post: PostData;
}

const MAX_COMMENT_LENGTH = 280;

// Custom Video Player Component
const CustomVideoPlayer = ({ src, isShort }: { src: string; isShort: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Attempt auto-play
    if (videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        setIsPlaying(false);
        setIsMuted(true); 
      });
    }
  }, []);

  const togglePlay = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
        const nextMute = !isMuted;
        videoRef.current.muted = nextMute;
        setIsMuted(nextMute);
        if (nextMute) setVolume(0);
        else setVolume(1);
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const val = parseFloat(e.target.value);
      setVolume(val);
      if (videoRef.current) {
          videoRef.current.volume = val;
          videoRef.current.muted = val === 0;
          setIsMuted(val === 0);
      }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(isNaN(p) ? 0 : p);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = x / rect.width;
      videoRef.current.currentTime = pct * videoRef.current.duration;
    }
  };

  return (
    <div 
      role="button"
      aria-label={isPlaying ? "Pause video" : "Play video"}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePlay(e); } }}
      className={`relative rounded-lg overflow-hidden bg-black mb-3 border border-zinc-800 animate-in zoom-in duration-500 group ${isShort ? 'aspect-[9/16]' : 'aspect-video'}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        muted={isMuted}
        loop
        playsInline
      />
      
      {/* Center Play Button Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all">
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transform transition-transform hover:scale-110">
            <Play size={28} className="fill-white text-white ml-1" />
          </div>
        </div>
      )}

      {/* Controls Container */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Progress Bar */}
        <div 
          role="slider"
          aria-label="Video progress"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          className="relative w-full h-1.5 bg-zinc-700/50 rounded-full mb-4 cursor-pointer group/progress" 
          onClick={handleSeek}
        >
            <div 
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-100" 
              style={{ width: `${progress}%` }} 
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${progress}%` }} 
            />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
             {/* Play/Pause Small */}
             <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"} className="text-zinc-200 hover:text-white transition-colors">
                {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
             </button>

             {/* Volume Control */}
             <div className="flex items-center space-x-2 group/vol">
                <button onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"} className="text-zinc-200 hover:text-white transition-colors">
                   {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input 
                  type="range" 
                  min="0" max="1" step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume control"
                  className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                />
             </div>
          </div>
          
          <div className="text-[10px] font-mono text-zinc-400">
             VEO • AI VIDEO
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to decode PCM and play it (since Gemini TTS returns raw PCM)
const playPcmAudio = async (base64Data: string, audioContextRef: React.MutableRefObject<AudioContext | null>, sourceRef: React.MutableRefObject<AudioBufferSourceNode | null>, onEnded: () => void) => {
  try {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    
    // Decode base64 to binary
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create buffer (PCM 16-bit to Float32)
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length;
    const audioBuffer = ctx.createBuffer(1, frameCount, 24000); // Mono, 24kHz (Gemini default)
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }

    // Play
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.onended = onEnded;
    source.start();
    sourceRef.current = source;

  } catch (e) {
    console.error("Error playing PCM", e);
    onEnded();
  }
};

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const isImage = post.type === PostType.IMAGE || post.type === PostType.MEME || post.type === PostType.SHORT;
  const isArticle = post.type === PostType.ARTICLE;
  const isShort = post.type === PostType.SHORT;
  const isAudio = post.type === PostType.AUDIO;

  // Local state for immediate interaction feedback
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Share state
  const [isShared, setIsShared] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // Comment section state
  const [showComments, setShowComments] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(post.commentsList || []);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [newComment, setNewComment] = useState('');
  const commentInputRef = useRef<HTMLInputElement>(null);
  
  // Audio Comment Recording State
  const [isRecordingComment, setIsRecordingComment] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Audio Comment Playback State
  const [playingCommentId, setPlayingCommentId] = useState<string | null>(null);
  const commentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [commentAudioProgress, setCommentAudioProgress] = useState(0);

  // Video Generation State
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const getShareContent = () => {
    return isArticle 
      ? `${post.title} - ${post.urlSource}\nSummary: ${post.abstract}`
      : `${post.authorName} (@${post.authorHandle}): ${post.content}`;
  };

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareContent());
      setIsShared(true);
      setShowShareMenu(false);
      setTimeout(() => {
        setIsShared(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(getShareContent().substring(0, 280));
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const handleLinkedInShare = () => {
    const text = encodeURIComponent(getShareContent());
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, '_blank');
    setShowShareMenu(false);
  };
  
  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const userComment: Comment = {
      id: Math.random().toString(),
      author: 'You',
      text: newComment,
      timestamp: 'Just now',
      isVerifiedHuman: true,
      likes: 0,
      isLiked: false
    };

    setLocalComments(prev => [...prev, userComment]);
    setCommentCount(prev => prev + 1);
    setNewComment('');
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const userComment: Comment = {
            id: Math.random().toString(),
            author: 'You',
            text: '🎤 Audio Note',
            timestamp: 'Just now',
            isVerifiedHuman: true,
            audioUrl: audioUrl,
            likes: 0,
            isLiked: false
        };
        
        setLocalComments(prev => [...prev, userComment]);
        setCommentCount(prev => prev + 1);
        
        // Cleanup tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingComment(true);
    } catch (err) {
      console.error("Microphone access failed", err);
      alert("Could not access microphone.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecordingComment) {
      mediaRecorderRef.current.stop();
      setIsRecordingComment(false);
    }
  };

  const handlePlayCommentAudio = (url: string, id: string) => {
    if (playingCommentId === id) {
        // Stop
        if (commentAudioRef.current) {
            commentAudioRef.current.pause();
            commentAudioRef.current.currentTime = 0;
        }
        setPlayingCommentId(null);
        setCommentAudioProgress(0);
    } else {
        // Play new
        if (commentAudioRef.current) {
            commentAudioRef.current.pause();
        }
        const audio = new Audio(url);
        
        // Update progress while playing
        audio.ontimeupdate = () => {
           if (audio.duration && !isNaN(audio.duration)) {
              setCommentAudioProgress((audio.currentTime / audio.duration) * 100);
           }
        };

        audio.onended = () => {
            setPlayingCommentId(null);
            setCommentAudioProgress(0);
        };

        audio.play();
        commentAudioRef.current = audio;
        setPlayingCommentId(id);
    }
  };

  const handleGenerateVideo = async () => {
    if (isGeneratingVideo) return;

    // Check for Paid API Key selection for Veo
    if ((window as any).aistudio && !(await (window as any).aistudio.hasSelectedApiKey())) {
       await (window as any).aistudio.openSelectKey();
    }

    setIsGeneratingVideo(true);
    const url = await generateVideoFromPost(post);
    if (url) {
      setVideoUrl(url);
    }
    setIsGeneratingVideo(false);
  };

  const toggleAudio = () => {
    if (isPlayingAudio) {
       // Stop
       if (audioSourceRef.current) {
         audioSourceRef.current.stop();
         audioSourceRef.current = null;
       }
       setIsPlayingAudio(false);
    } else if (post.audioUrl) {
       // Play
       setIsPlayingAudio(true);
       playPcmAudio(post.audioUrl, audioContextRef, audioSourceRef, () => setIsPlayingAudio(false));
    }
  };
  
  const handleLikeComment = (commentId: string) => {
    setLocalComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const nextIsLiked = !c.isLiked;
        return {
          ...c,
          isLiked: nextIsLiked,
          likes: nextIsLiked ? c.likes + 1 : c.likes - 1
        };
      }
      return c;
    }));
  };

  const handleReplyComment = (author: string) => {
    setNewComment(`@${author} `);
    commentInputRef.current?.focus();
  };

  // Helper for Authenticity/Category Badge
  const getCategoryBadge = () => {
    switch (post.category) {
      case PostCategory.REALITY:
        return (
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium tracking-wide" title="Grounded in fact or scientific principle">
            <ShieldCheck size={12} />
            <span>REALITY</span>
          </div>
        );
      case PostCategory.HYPOTHETICAL:
        return (
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 text-[10px] font-medium tracking-wide" title="Speculative scenario or thought experiment">
            <Sparkles size={12} />
            <span>WHAT-IF</span>
          </div>
        );
      case PostCategory.SATIRE:
        return (
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-medium tracking-wide" title="Creative, humor, or meme">
            <Zap size={12} />
            <span>CREATIVE</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-surface border border-surfaceHighlight rounded-xl overflow-hidden mb-6 transition-all hover:border-zinc-700 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isShort ? 'max-w-sm mx-auto' : ''}`}>
      {/* Header */}
      <div className="p-4 flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden shadow-inner transform transition-transform hover:scale-105 cursor-pointer shrink-0 border border-white/10">
          <img 
            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(post.authorHandle)}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
            alt={post.authorName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="font-semibold text-zinc-100 leading-tight cursor-pointer hover:text-primary transition-colors truncate pr-2">{post.authorName}</h3>
            {getCategoryBadge()}
          </div>
          <p className="text-xs text-zinc-500 truncate">{post.authorHandle} • {post.timestamp} • {post.type}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        {/* Text Content */}
        {!isArticle && <p className="text-zinc-300 text-sm mb-3 whitespace-pre-wrap leading-relaxed select-text">{isImage ? post.title : post.content}</p>}
        
        {/* Generated Video Player */}
        {videoUrl && (
          <CustomVideoPlayer src={videoUrl} isShort={isShort} />
        )}

        {/* Audio Player */}
        {isAudio && post.audioUrl && (
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mb-3 flex items-center space-x-4">
             <button 
               onClick={toggleAudio}
               aria-label={isPlayingAudio ? "Pause audio snippet" : "Play audio snippet"}
               className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition-colors shadow-lg shadow-primary/20 shrink-0"
             >
                {isPlayingAudio ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
             </button>
             <div className="flex-1 overflow-hidden">
                <div className="flex items-center space-x-2 text-xs text-zinc-400 mb-1">
                   <Volume2 size={12} />
                   <span>Audio Snippet</span>
                </div>
                {/* Visualizer Placeholder */}
                <div className="h-8 flex items-end space-x-0.5 opacity-50">
                   {[...Array(20)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1 bg-primary rounded-t-sm transition-all duration-300 ${isPlayingAudio ? 'animate-pulse' : ''}`}
                        style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }}
                      />
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* Image/Short Content (and Placeholder) */}
        {isImage && !videoUrl && (
          <div className={`rounded-lg overflow-hidden bg-black/50 border border-zinc-800 relative group/image ${isShort ? 'aspect-[9/16]' : 'aspect-video'}`}>
             {post.content && post.content.startsWith('data:') ? (
                <img src={post.content} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105" />
             ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 relative overflow-hidden">
                   {/* Background Pulse */}
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-800/10 to-transparent animate-pulse" />
                   
                   {/* Icon Animation */}
                   <div className="relative z-10 mb-3">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                      <Loader2 size={32} className="text-zinc-600 animate-spin duration-[3000ms]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={14} className="text-zinc-400 animate-pulse" />
                      </div>
                   </div>
                   
                   {/* Text */}
                   <span className="relative z-10 text-xs font-medium text-zinc-500 uppercase tracking-widest animate-pulse">
                     Generating Visual...
                   </span>
                </div>
             )}
             {post.type === PostType.MEME && (
               <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs font-mono text-yellow-400 backdrop-blur-sm shadow-sm z-20">
                 ORIGINAL CONTENT
               </div>
             )}
             {isShort && (
               <div className="absolute top-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs font-bold text-white backdrop-blur-sm z-20">
                 SHORT
               </div>
             )}
          </div>
        )}

        {/* Article Content */}
        {isArticle && (
          <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800 mt-2 hover:bg-zinc-900 transition-colors cursor-pointer group/article">
            <h4 className="font-bold text-lg text-zinc-100 mb-2 group-hover/article:text-primary transition-colors">{post.title}</h4>
            <p className="text-sm text-zinc-400 mb-3 line-clamp-3">{post.abstract}</p>
            <div className="flex items-center text-xs text-zinc-500 space-x-2">
              <ExternalLink size={12} className="group-hover/article:translate-x-0.5 transition-transform" />
              <span className="truncate max-w-[200px] hover:underline decoration-zinc-700">{post.urlSource || 'scholar.google.com'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-2">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="text-xs text-primary/80 hover:text-primary cursor-pointer hover:underline decoration-primary/30 transition-all hover:scale-105 inline-block">
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-surfaceHighlight flex items-center justify-between text-zinc-500 select-none">
        
        {/* Like Button */}
        <button 
          onClick={handleLike}
          className={`flex items-center space-x-2 transition-colors duration-300 group active:scale-95 outline-none ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
          aria-label="Like post"
        >
          <div className={`relative transition-transform duration-300 ${isLiked ? 'scale-125' : 'group-hover:scale-125'}`}>
             <Heart size={18} className={`transition-all duration-300 ${isLiked ? 'fill-current' : ''}`} />
          </div>
          <span className="text-xs font-medium tabular-nums">{likeCount.toLocaleString()}</span>
        </button>

        {/* Comment Button */}
        <button 
          onClick={handleToggleComments}
          className={`flex items-center space-x-2 transition-colors duration-300 group active:scale-95 outline-none ${showComments ? 'text-blue-500' : 'hover:text-blue-500'}`}
          aria-label="Comment"
        >
          <MessageCircle size={18} className={`transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 ${showComments ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium tabular-nums">{commentCount.toLocaleString()}</span>
        </button>

        {/* Generate Video Button (Veo) */}
        {!videoUrl && !isAudio && (
          <button 
            onClick={handleGenerateVideo}
            disabled={isGeneratingVideo}
            className={`flex items-center space-x-2 transition-colors duration-300 group active:scale-95 outline-none ${isGeneratingVideo ? 'text-fuchsia-500' : 'hover:text-fuchsia-500'}`}
            title="Generate Video with Veo"
            aria-label={isGeneratingVideo ? "Generating video" : (isShort ? "Animate Short" : "Generate Video with Veo")}
          >
            {isGeneratingVideo ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Film size={18} className="transition-transform duration-300 group-hover:scale-110" />
            )}
            <span className="hidden sm:inline text-xs font-medium">
                {isGeneratingVideo ? 'Creating...' : (isShort ? 'Animate Short' : 'Watch')}
            </span>
          </button>
        )}

        {/* Share Button with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowShareMenu(!showShareMenu)}
            className={`flex items-center space-x-2 transition-colors duration-300 group active:scale-95 outline-none ${isShared || showShareMenu ? 'text-green-500' : 'hover:text-green-500'}`}
            aria-label="Share options"
          >
            {isShared ? (
               <Check size={18} className="animate-in fade-in zoom-in duration-300" />
            ) : (
               <Share2 size={18} className={`transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 ${showShareMenu ? 'rotate-12 scale-110' : ''}`} />
            )}
          </button>

          {/* Share Popup Menu */}
          {showShareMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="py-1">
                <button 
                  onClick={handleCopyClipboard}
                  className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-[#27272a] text-zinc-300 hover:text-white transition-colors text-xs font-medium"
                  aria-label="Copy to Clipboard"
                >
                  <Copy size={14} />
                  <span>Copy to Clipboard</span>
                </button>
                <button 
                  onClick={handleTwitterShare}
                  className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-[#27272a] text-zinc-300 hover:text-white transition-colors text-xs font-medium border-t border-zinc-800"
                  aria-label="Share on X (Twitter)"
                >
                  <Twitter size={14} />
                  <span>Share on X</span>
                </button>
                <button 
                  onClick={handleLinkedInShare}
                  className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-[#27272a] text-zinc-300 hover:text-white transition-colors text-xs font-medium border-t border-zinc-800"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin size={14} />
                  <span>Share on LinkedIn</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bookmark Button */}
        <button 
          onClick={handleBookmark}
          className={`flex items-center space-x-2 transition-colors duration-300 group active:scale-95 outline-none ${isBookmarked ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
          aria-label="Bookmark post"
        >
          <Bookmark size={18} className={`transition-all duration-300 ${isBookmarked ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
        </button>
      </div>

      {/* Verified Human Comments Section */}
      {showComments && (
        <div className="bg-[#0f0f11] border-t border-surfaceHighlight p-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
             <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Verified Human Responses</h4>
             <span className="text-[10px] text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
               No AI Agents allowed
             </span>
          </div>

          <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
            {localComments.length === 0 ? (
               <p className="text-xs text-zinc-600 italic">No human interaction yet. Be the first.</p>
            ) : (
               localComments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 group">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold shrink-0">
                    {comment.author.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-zinc-200">{comment.author}</span>
                      {comment.isVerifiedHuman && (
                        <div className="flex items-center text-[10px] text-blue-400 bg-blue-500/10 px-1.5 rounded-full border border-blue-500/20" title="Verified Human">
                          <UserCheck size={10} className="mr-0.5" />
                          <span>Human</span>
                        </div>
                      )}
                      <span className="text-[10px] text-zinc-600">{comment.timestamp}</span>
                    </div>
                    
                    {comment.audioUrl ? (
                        <div className="mt-2 flex items-center space-x-3 bg-zinc-900/80 rounded-lg p-2 max-w-[200px] border border-zinc-800 transition-colors hover:border-zinc-700">
                           <button 
                             onClick={() => handlePlayCommentAudio(comment.audioUrl!, comment.id)}
                             aria-label={playingCommentId === comment.id ? "Pause audio comment" : "Play audio comment"}
                             className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition-colors shadow-lg shadow-primary/10 shrink-0"
                           >
                             {playingCommentId === comment.id ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
                           </button>
                           <div className="flex-1 flex flex-col justify-center min-w-0">
                               {/* Waveform Visualizer */}
                               <div className="flex items-end space-x-[2px] h-6 overflow-hidden">
                                 {[...Array(20)].map((_, i) => {
                                    // Deterministic height pattern for waveform visualization
                                    const heightPercent = 30 + (Math.abs(Math.sin(i * 12.34)) * 70);
                                    // Bar is "active" if it's within the progress range
                                    const isActive = playingCommentId === comment.id && ((i / 20) * 100) < commentAudioProgress;
                                    
                                    return (
                                        <div 
                                          key={i}
                                          className={`w-1 rounded-t-sm transition-all duration-75 ${isActive ? 'bg-primary shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'bg-zinc-700/50'}`}
                                          style={{ height: `${heightPercent}%` }}
                                        />
                                    );
                                 })}
                               </div>
                               <div className="text-[9px] text-zinc-500 uppercase font-bold mt-1">Audio Note</div>
                           </div>
                        </div>
                    ) : (
                        <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{comment.text}</p>
                    )}

                    {/* Like and Reply Actions */}
                    <div className="flex items-center space-x-4 mt-2">
                      <button 
                        onClick={() => handleLikeComment(comment.id)}
                        aria-label={`Like comment by ${comment.author}`}
                        className={`flex items-center space-x-1 text-[10px] transition-colors group/like ${comment.isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-red-400'}`}
                      >
                         <Heart size={10} className={`${comment.isLiked ? 'fill-current' : ''} group-hover/like:scale-110 transition-transform`} />
                         <span className="font-medium">{comment.likes}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleReplyComment(comment.author)}
                        aria-label={`Reply to ${comment.author}`}
                        className="flex items-center space-x-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                         <Reply size={10} />
                         <span>Reply</span>
                      </button>
                    </div>
                    
                  </div>
                </div>
               ))
            )}
          </div>

          {/* Comment Input */}
          <div className="space-y-3">
             <form onSubmit={handleSubmitComment} className="relative">
                <input 
                  ref={commentInputRef}
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={MAX_COMMENT_LENGTH}
                  placeholder="Add a comment as a human..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-4 pr-20 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-zinc-600"
                />
                <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">
                  {newComment.length}/{MAX_COMMENT_LENGTH}
                </span>
                <button 
                  type="submit" 
                  disabled={!newComment.trim()}
                  className="absolute right-1 top-1 p-1.5 bg-zinc-800 text-zinc-400 rounded-full hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400 transition-all"
                  aria-label="Send comment"
                >
                  <Send size={14} />
                </button>
             </form>
             
             {/* Reply with Audio */}
             <div className="flex justify-start">
               {!isRecordingComment ? (
                   <button 
                     onClick={handleStartRecording}
                     className="flex items-center space-x-2 text-xs text-zinc-500 hover:text-primary transition-colors px-2 py-1 rounded hover:bg-zinc-900"
                     aria-label="Reply with voice"
                   >
                     <Mic size={14} />
                     <span>Reply with Audio</span>
                   </button>
               ) : (
                   <button 
                     onClick={handleStopRecording}
                     className="flex items-center space-x-2 text-white bg-red-500/80 hover:bg-red-500 transition-colors px-3 py-1 rounded-full animate-pulse"
                     aria-label="Stop recording"
                   >
                     <Square size={12} className="fill-current" />
                     <span className="font-semibold">Recording... Tap to Send</span>
                   </button>
               )}
             </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default PostCard;
