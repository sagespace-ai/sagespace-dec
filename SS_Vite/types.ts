export enum PostType {
  IMAGE = 'IMAGE',
  ARTICLE = 'ARTICLE',
  MEME = 'MEME',
  TWEET = 'TWEET',
  SHORT = 'SHORT',
  AUDIO = 'AUDIO'
}

export enum PostCategory {
  REALITY = 'REALITY',         // Grounded in fact, science, or news
  HYPOTHETICAL = 'HYPOTHETICAL', // "What-if" scenarios, sci-fi concepts
  SATIRE = 'SATIRE'            // Memes, jokes, shitposting
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isVerifiedHuman: boolean;
  audioUrl?: string;
  likes: number;
  isLiked?: boolean;
}

export interface PostData {
  id: string;
  type: PostType;
  category: PostCategory;
  title?: string;
  content: string; // Text content or Image URL
  authorName: string;
  authorHandle: string;
  timestamp: string;
  likes: number;
  comments: number;
  commentsList: Comment[]; // Generated human comments
  tags: string[];
  // For Articles
  urlSource?: string;
  abstract?: string;
  // For Audio
  audioUrl?: string;
}

export interface GenerationPlan {
  type: PostType;
  category: PostCategory;
  topic: string;
  mood: string;
  authorPersona: string;
}

export interface UserPersona {
  description: string;
  interests: string[];
}
