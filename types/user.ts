export interface UserProfile {
  id: string
  name?: string
  profession?: string // e.g., 'microbiologist', 'student', 'gamer', 'software engineer'
  interests?: string[] // e.g., ['wellness', 'career', 'fun', 'gaming', 'science']
  goals?: string[] // optional goals
  email?: string
  avatarUrl?: string
}

