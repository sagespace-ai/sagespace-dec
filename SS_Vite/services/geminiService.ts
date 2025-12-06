import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { PostType, GenerationPlan, PostData, PostCategory } from "../types";

// Initialize the client
// NOTE: We are strictly following the guide to use process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the engine of "SageSpace", a self-generative social media feed.
Your goal is to create content that perfectly matches a specific user persona.
You must distinctively categorize content into:
1. 'REALITY': Authentically grounded facts, research, or observations.
2. 'HYPOTHETICAL': "What-if" scenarios, speculative science, or creative imagination.
3. 'SATIRE': Memes, absurdity, or humor.

The user persona might be highly technical, absurd, or a mix of both.
`;

// Helper for Rate Limit Backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wrapper for generateContent that handles 429/Quota errors with exponential backoff.
 */
const generateWithRetry = async (params: any, retries = 5) => {
  let attempt = 0;
  while (true) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      // Enhanced error detection for nested API error objects
      const errorCode = error?.status || error?.code || error?.error?.code;
      const errorMessage = error?.message || error?.error?.message || JSON.stringify(error);
      const errorStatus = error?.status || error?.error?.status;

      const isRateLimit = 
        errorCode === 429 || 
        errorCode === 503 || 
        errorStatus === "RESOURCE_EXHAUSTED" || 
        (errorMessage && (
           errorMessage.includes('429') || 
           errorMessage.includes('quota') || 
           errorMessage.includes('RESOURCE_EXHAUSTED')
        ));
      
      if (isRateLimit && attempt < retries) {
        attempt++;
        // Increased Backoff Strategy: 4s, 8s, 16s, 32s, 64s
        const waitTime = 4000 * Math.pow(2, attempt); 
        console.warn(`[Gemini Service] Quota exceeded. Retrying in ${waitTime/1000}s... (Attempt ${attempt}/${retries})`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
};

/**
 * Step 1: Generate a "Plan" for the next batch of posts.
 * This determines WHAT to post (Topic, Type, Author Vibe) but not the full content yet.
 */
export const generateFeedPlan = async (
  userDescription: string,
  allowedTypes: PostType[] = [],
  allowedCategories: PostCategory[] = [],
  count: number = 3
): Promise<GenerationPlan[]> => {
  const model = "gemini-2.5-flash";

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          enum: [PostType.IMAGE, PostType.ARTICLE, PostType.MEME, PostType.TWEET, PostType.SHORT, PostType.AUDIO],
          description: "The format of the post. SHORT is a vertical video concept. AUDIO is a sound bite or podcast clip."
        },
        category: {
          type: Type.STRING,
          enum: [PostCategory.REALITY, PostCategory.HYPOTHETICAL, PostCategory.SATIRE],
          description: "The nature of the authenticity. REALITY=Facts/Science, HYPOTHETICAL=What-If/Speculation, SATIRE=Humor/Memes."
        },
        topic: {
          type: Type.STRING,
          description: "A specific, creative topic for this post based on user interests."
        },
        mood: {
          type: Type.STRING,
          description: "The emotional tone (e.g., 'Scientific', 'Unhinged', 'Educational', 'Sarcastic')."
        },
        authorPersona: {
          type: Type.STRING,
          description: "A short description of who is writing this post (e.g. 'Dr. Bacteria', 'MemeLord99')."
        }
      },
      required: ["type", "category", "topic", "mood", "authorPersona"],
    },
  };

  try {
    let constraints = "";
    if (allowedTypes.length > 0) {
      constraints += `\nSTRICTLY RESTRICT 'type' to one of: ${allowedTypes.join(', ')}.`;
    }
    if (allowedCategories.length > 0) {
      constraints += `\nSTRICTLY RESTRICT 'category' to one of: ${allowedCategories.join(', ')}.`;
    }

    const prompt = `
      User Persona/Interests: "${userDescription}".
      
      Generate a list of ${count} distinct social media post ideas.
      ${constraints}
      
      CRITICAL INSTRUCTION:
      - You MUST include a mix of allowed content types.
      ${allowedTypes.length === 0 ? "- Include at least one SHORT (vertical visual) or AUDIO (sound/voice) concept if appropriate." : ""}
      ${allowedCategories.length === 0 ? "- You MUST include a mix of FACTUAL (REALITY) content and CREATIVE (HYPOTHETICAL/SATIRE) content." : ""}
      
      For 'HYPOTHETICAL', the topic should be a "What-if" scenario or a futuristic concept.
      For 'REALITY', the topic should be based on real principles, news, or history.
    `;

    const response = await generateWithRetry({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as GenerationPlan[];
  } catch (error) {
    console.error("Error generating feed plan:", error);
    return [];
  }
};

/**
 * Step 2: Execute a specific plan item to generate the final content.
 */
export const generatePostContent = async (plan: GenerationPlan): Promise<PostData> => {
  const id = Math.random().toString(36).substring(7);
  const timestamp = "Just now";
  
  // Default structure
  let post: PostData = {
    id,
    type: plan.type,
    category: plan.category,
    content: "",
    authorName: "Loading...",
    authorHandle: "@loading",
    timestamp,
    likes: 0,
    comments: 0,
    commentsList: [],
    tags: []
  };

  try {
    if (plan.type === PostType.IMAGE || plan.type === PostType.MEME || plan.type === PostType.SHORT) {
      // Image Generation Path (Shorts are treated as vertical images initially)
      const imageModel = "gemini-2.5-flash-image"; 
      
      let visualContext = "";
      if (plan.category === PostCategory.REALITY) {
        visualContext = "Photorealistic, accurate, scientific visualization, documentary style.";
      } else if (plan.category === PostCategory.HYPOTHETICAL) {
        visualContext = "Concept art, futuristic, surreal but detailed, dreamlike.";
      } else {
        visualContext = "Internet meme style, crude or funny composition.";
      }

      // Configure Aspect Ratio for Shorts
      const isShort = plan.type === PostType.SHORT;
      const aspectRatio = isShort ? "9:16" : "1:1"; 

      const imagePrompt = `
        Generate a ${plan.mood} ${isShort ? 'vertical 9:16 image for a mobile story' : 'image'} about: ${plan.topic}.
        Context: The user is interested in ${plan.authorPersona}.
        Category: ${plan.category} (${visualContext}).
        Do NOT include any code or json, just the image.
      `;

      // Use generateWithRetry
      const response = await generateWithRetry({
        model: imageModel,
        contents: imagePrompt,
        config: {
          imageConfig: { aspectRatio: aspectRatio }
        }
      });

      // Extract image
      let imageUrl = "";
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      // Generate accompanying text metadata AND comments
      const textResponse = await generateWithRetry({
        model: "gemini-2.5-flash",
        contents: `Generate a short JSON for an ${isShort ? 'vertical video caption' : 'image post'} about "${plan.topic}" by author "${plan.authorPersona}".
        Category: ${plan.category}.
        
        INSTRUCTIONS:
        1. If category is REALITY, the caption must be educational and accurate.
        2. If category is HYPOTHETICAL, the caption should start with "What if" or "Imagine".
        3. GENERATE 3-5 REALISTIC HUMAN COMMENTS.
        
        Fields: authorName, authorHandle, caption, tags (array), comments (array of objects with author, text).`,
        config: { responseMimeType: "application/json" }
      });
      
      const meta = JSON.parse(textResponse.text || "{}");
      const generatedComments = (meta.comments || []).map((c: any) => ({
        id: Math.random().toString(36).substring(7),
        author: c.author || "User",
        text: c.text || "...",
        timestamp: "2m ago",
        isVerifiedHuman: true,
        likes: Math.floor(Math.random() * 50),
        isLiked: false
      }));

      post = {
        ...post,
        content: imageUrl,
        title: meta.caption || plan.topic,
        authorName: meta.authorName || "AI Artist",
        authorHandle: meta.authorHandle || "@neural_art",
        tags: meta.tags || ["#ai", "#generated"],
        commentsList: generatedComments,
        comments: generatedComments.length + Math.floor(Math.random() * 20),
        likes: Math.floor(Math.random() * 5000)
      };

    } else if (plan.type === PostType.AUDIO) {
      // Audio Generation Path
      const textModel = "gemini-2.5-flash";
      
      // 1. Generate the script/transcript
      const scriptPrompt = `
        Write a short spoken-word script (approx 2 sentences) for a social media audio snippet.
        Topic: ${plan.topic}
        Mood: ${plan.mood}
        Category: ${plan.category}
        Author: ${plan.authorPersona}
        
        Return JSON:
        - authorName
        - authorHandle
        - script (the text to be spoken)
        - transcript (display text for the post, can include hashtags)
        - tags
        - comments
      `;

      const scriptResponse = await generateWithRetry({
        model: textModel,
        contents: scriptPrompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(scriptResponse.text || "{}");
      
      // 2. Generate Audio from Script
      const ttsModel = "gemini-2.5-flash-preview-tts";
      let audioDataUrl = "";
      
      try {
        const audioResp = await generateWithRetry({
          model: ttsModel,
          contents: { parts: [{ text: data.script || plan.topic }] },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        });
        
        const base64Audio = audioResp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
           audioDataUrl = base64Audio; 
        }
      } catch (e) {
        console.error("TTS generation failed", e);
      }

      const generatedComments = (data.comments || []).map((c: any) => ({
        id: Math.random().toString(36).substring(7),
        author: c.author || "User",
        text: c.text || "...",
        timestamp: "5m ago",
        isVerifiedHuman: true,
        likes: Math.floor(Math.random() * 30),
        isLiked: false
      }));

      post = {
        ...post,
        content: data.transcript || data.script,
        authorName: data.authorName,
        authorHandle: data.authorHandle,
        tags: data.tags || [],
        commentsList: generatedComments,
        comments: generatedComments.length + Math.floor(Math.random() * 50),
        likes: Math.floor(Math.random() * 2000),
        audioUrl: audioDataUrl // Raw base64 PCM
      };

    } else {
      // Text / Article / Tweet Path
      const textModel = "gemini-2.5-flash";
      
      const prompt = `
        Draft a social media post.
        Type: ${plan.type}
        Topic: ${plan.topic}
        Mood: ${plan.mood}
        Category: ${plan.category}
        Author Persona: ${plan.authorPersona}

        INSTRUCTIONS BASED ON CATEGORY:
        - If 'REALITY': Content must be grounded, sound like a real expert, and feel authentic. cite plausible sources.
        - If 'HYPOTHETICAL': Content must clearly be a thought experiment. Use phrases like "Consider this scenario", "What if", "In a parallel universe".
        - If 'SATIRE': Be funny, informal, potentially unhinged.

        INSTRUCTIONS FOR COMMENTS:
        - Generate 3-5 Comments from REAL HUMANS.
        - They must NOT sound like AI.
        
        Return JSON with fields:
        - authorName (string)
        - authorHandle (string)
        - title (string, for articles only)
        - content (string, the main body text or tweet)
        - abstract (string, for articles only, a summary)
        - urlSource (string, fake url for articles)
        - tags (string array)
        - comments (array of objects with author, text)
      `;

      const response = await generateWithRetry({
        model: textModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || "{}");
      const generatedComments = (data.comments || []).map((c: any) => ({
        id: Math.random().toString(36).substring(7),
        author: c.author || "User",
        text: c.text || "...",
        timestamp: "5m ago",
        isVerifiedHuman: true,
        likes: Math.floor(Math.random() * 20),
        isLiked: false
      }));

      post = {
        ...post,
        content: data.content,
        authorName: data.authorName,
        authorHandle: data.authorHandle,
        title: data.title,
        abstract: data.abstract,
        urlSource: data.urlSource,
        tags: data.tags || [],
        commentsList: generatedComments,
        comments: generatedComments.length + Math.floor(Math.random() * 50),
        likes: Math.floor(Math.random() * 2000)
      };
    }

  } catch (err) {
    console.error("Failed to generate post content", err);
    post.content = "Error generating content. Please try again later.";
    post.authorName = "System Error";
  }

  return post;
};

/**
 * Generate a short video using Veo based on the post.
 */
export const generateVideoFromPost = async (post: PostData): Promise<string | null> => {
  try {
    // Create a new instance to ensure we use the latest API key if selected via dialog
    const aiVideo = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let operation;
    const moodDesc = post.category === PostCategory.SATIRE ? 'Chaotic, funny, meme-style, fast-paced' : 
                     post.category === PostCategory.REALITY ? 'Documentary style, realistic, high definition, slow pan' : 
                     'Sci-fi, dreamlike, futuristic, ethereal';

    // If it's an image post (or SHORT), animate the image
    const isVisual = post.type === PostType.IMAGE || post.type === PostType.MEME || post.type === PostType.SHORT;
    
    if (isVisual && post.content.startsWith('data:')) {
       const matches = post.content.match(/^data:(.+);base64,(.+)$/);
       if (matches) {
          const mimeType = matches[1];
          const imageBytes = matches[2];
          
          // Use 9:16 for Shorts, 16:9 for others
          const aspectRatio = post.type === PostType.SHORT ? '9:16' : '16:9';

          operation = await aiVideo.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: `Cinematic motion. ${post.title || 'Bring this scene to life'}. Mood: ${moodDesc}`,
            image: {
              imageBytes,
              mimeType
            },
            config: {
              numberOfVideos: 1,
              resolution: '720p',
              aspectRatio: aspectRatio
            }
          });
       }
    }

    // Fallback or Text-to-Video
    if (!operation) {
       operation = await aiVideo.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Cinematic video about: ${post.title || post.content.slice(0, 50)}. Context: ${post.content.slice(0, 200)}. Mood: ${moodDesc}`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: post.type === PostType.SHORT ? '9:16' : '16:9'
        }
      });
    }

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await aiVideo.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return null;

    // Fetch the MP4 bytes using the key
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Video generation failed", error);
    return null;
  }
};
