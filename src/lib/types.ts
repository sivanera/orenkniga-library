
export type UserRole = 'reader' | 'author';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
}

export interface Book {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
  };
  cover?: string;
  description: string;
  genres: string[];
  rating: number;
  reviewCount: number;
  publishedDate: string;
  content?: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  date: string;
}

export interface ReadingProgress {
  bookId: string;
  position: number;
  lastRead: string;
}

export interface Bookmark {
  id: string;
  bookId: string;
  position: number;
  text?: string;
  note?: string;
  createdAt: string;
}

export interface BookList {
  id: string;
  name: string;
  books: string[];
}

export type ReaderSettings = {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  theme: 'light' | 'dark' | 'sepia';
  margins: number;
};
