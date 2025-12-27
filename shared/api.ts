/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}



/**
 * Auth-related shared types
 */
export type AuthRole = "admin" | "user";

export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
  username?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  user: AuthUser;
}

/**
 * Dars (Lesson) related types
 */
export interface Attachment {
  id: string;
  name: string;
  url: string;
}

export interface DarsItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "article" | "video";
  image: string;
  videoUrl?: string;
  content?: string;
  teacher: string;
  duration: string;
  attachments?: Attachment[];
  createdAt?: string;
  seriesId?: string;
  seriesOrder?: number;
}

export interface Series {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

/**
 * QnA related types
 */
export interface Answer {
  id: string;
  questionId: string;
  content: string;
  answeredBy: string;
  date: string;
  isOfficial: boolean;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  askedBy: string;
  date: string;
  category: string;
  answers: Answer[];
  likes: number;
  attachments?: Attachment[];
}

/**
 * Saved Items types
 */
export interface SavedItem {
  id: string;
  userId: string;
  itemId: string;
  itemType: "dars" | "question" | "series";
  listType: "favorite" | "read_later";
  createdAt: string;
}

export interface AddSavedItemRequest {
  itemId: string;
  itemType: "dars" | "question";
  listType: "favorite" | "read_later";
}

export interface RemoveSavedItemRequest {
  itemId: string;
  listType: "favorite" | "read_later";
}

/**
 * Islamic Events related types
 */
export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  eventDate: string; // ISO date string
  location?: string;
  organizer?: string;
  category: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EventCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
}
