// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

// Note types
export interface Note {
  id: string;
  user_id: string;
  title: string;
  original_text?: string;
  summary?: string;
  file_url?: string;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
}

// Flashcard types
export interface Flashcard {
  id: string;
  note_id: string;
  user_id: string;
  question: string;
  answer: string;
  difficulty_level: number;
  mastery_level: number;
}