export interface Teaching {
  id: string;
  letter: string;
  content: string;
  author?: string;
}

export interface Chapter {
  title: string;
  part1: Teaching[];
  part2: Teaching[];
  isIntroduction?: boolean;
  hasParts?: boolean;
  isNewMida?: boolean;
}

export interface BookData {
  chapters: Chapter[];
}

export interface Highlight {
  id: string;
  teachingId: string;
  text: string;
  date: number;
}

export enum ViewMode {
  READING = 'READING',
  SEARCH = 'SEARCH',
  BOOKMARKS = 'BOOKMARKS',
  HOME = 'HOME',
  RANDOM = 'RANDOM',
  CHAT = 'CHAT',
  ADMIN = 'ADMIN',
  ROUND_TABLE = 'ROUND_TABLE'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'user';
  lastActive: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ChatHistory {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

export interface ExpandedTeaching {
  id: string;
  chapterTitle: string;
  content: string;
  author: string;
  createdAt: number;
}

export interface DiscussionMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

export interface AdminLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: number;
}