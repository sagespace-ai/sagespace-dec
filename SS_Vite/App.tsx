import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import PostCard from './components/PostCard';
import { generateFeedPlan, generatePostContent } from './services/geminiService';
import { PostData, GenerationPlan, PostType, PostCategory } from './types';

// Default Persona from user request
const DEFAULT_PERSONA = `A microbiologist with specific focus on inclusion bodies. 
Interests: TEM/SEM microscopy images, academic journal articles about bacterial genetics, podcasts on science history.
Humor: Nonsense memes, "chicken banana" memes, absurd scientific shitposting.`;

const App: React.FC = () => {
  const [persona, setPersona] = useState(DEFAULT_PERSONA);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  // Filtering State
  const [filterTypes, setFilterTypes] = useState<PostType[]>([]);
  const [filterCategories, setFilterCategories] = useState<PostCategory[]>([]);
  
  // Use a ref to prevent double-firing on strict mode mount if we wanted auto-start
  // But we'll wait for user action or initial load
  const hasLoadedInitial = useRef(false);

  const handleToggleType = (type: PostType) => {
    setFilterTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleToggleCategory = (cat: PostCategory) => {
    setFilterCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleGenerateFeed = useCallback(async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setLoadingMessage("Analyzing persona & planning content...");

    try {
      // 1. Generate the plan with filters
      // Requesting 3 items to stay within quota limits more easily
      const plans: GenerationPlan[] = await generateFeedPlan(persona, filterTypes, filterCategories, 3);
      
      if (plans.length === 0) {
        setLoadingMessage("Failed to generate plan. Please try again.");
        setIsGenerating(false);
        return;
      }

      setLoadingMessage(`Generating ${plans.length} items...`);

      // 2. Clear old posts (optional, or prepend)
      // Let's prepend to create an infinite feed feel, but for this demo, maybe reset or prepend.
      // Prepending is better UX.
      
      const newPostsPlaceholder: PostData[] = plans.map(p => ({
        id: Math.random().toString(),
        type: p.type,
        category: p.category,
        authorName: "Agent Working...",
        authorHandle: "...",
        content: "",
        timestamp: "Generating...",
        likes: 0,
        comments: 0,
        commentsList: [],
        tags: []
      }));

      // Add placeholders immediately
      setPosts(prev => [...newPostsPlaceholder, ...prev]);

      // 3. Generate content for each plan item SEQUENTIALLY
      // Executing sequentially to prevent hitting 429 Resource Exhausted errors.
      
      const generateAndReplace = async (plan: GenerationPlan, index: number) => {
         const postContent = await generatePostContent(plan);
         // Find the placeholder and replace it
         setPosts(currentPosts => {
            const updated = [...currentPosts];
            // We find the specific placeholder by ID match from the placeholder array
            const placeholderId = newPostsPlaceholder[index].id;
            return updated.map(p => (p.id === placeholderId ? postContent : p));
         });
      };

      for (let i = 0; i < plans.length; i++) {
        try {
          await generateAndReplace(plans[i], i);
          
          // Artificial delay between heavy generation requests to respect API quota
          // Increased to 8 seconds to be very safe against image generation limits
          if (i < plans.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 8000));
          }
        } catch (error) {
          console.error(`Failed to generate item ${i}`, error);
        }
      }

    } catch (error) {
      console.error("Feed generation error", error);
      setLoadingMessage("Error generating feed. Please try again.");
    } finally {
      setIsGenerating(false);
      setLoadingMessage("");
    }
  }, [isGenerating, persona, filterTypes, filterCategories]);

  // Initial load
  useEffect(() => {
    if (!hasLoadedInitial.current) {
      hasLoadedInitial.current = true;
      handleGenerateFeed();
    }
  }, [handleGenerateFeed]);

  return (
    <div className="min-h-screen bg-background font-sans text-zinc-100">
      <Sidebar 
        currentPersona={persona} 
        onUpdatePersona={setPersona} 
        onRefresh={handleGenerateFeed}
        isGenerating={isGenerating}
        selectedTypes={filterTypes}
        onToggleType={handleToggleType}
        selectedCategories={filterCategories}
        onToggleCategory={handleToggleCategory}
      />
      
      <main className="lg:pl-80 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-8 lg:py-12">
          
          {/* Mobile Header */}
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500">SageSpace</h1>
            <div className="text-xs text-zinc-500">{posts.length} posts</div>
          </div>

          {/* Feed Status */}
          {loadingMessage && (
             <div className="mb-6 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 text-sm animate-pulse">
               {loadingMessage}
             </div>
          )}

          {/* Empty State */}
          {!isGenerating && posts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-zinc-500">Feed is empty. Adjust your persona or hit generate.</p>
            </div>
          )}

          {/* Feed List */}
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Bottom Loader trigger if we had infinite scroll, or just a button */}
          {!isGenerating && posts.length > 0 && (
            <div className="mt-8 text-center">
               <button 
                onClick={handleGenerateFeed}
                className="text-zinc-500 hover:text-primary text-sm font-medium transition-colors"
               >
                 Load more synthetic thoughts...
               </button>
            </div>
          )}
          
          <div className="h-20" /> {/* Spacer */}
        </div>
      </main>
    </div>
  );
};

export default App;
