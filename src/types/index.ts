import { Database } from "./supabase";

export type Country = {
  code: string;
  name: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  countries: Country[];
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type Podcast = {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  audioUrl: string;
  countries: Country[];
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type BookWithoutId = Omit<Book, "id" | "createdAt" | "updatedAt" | "userId">;
export type PodcastWithoutId = Omit<Podcast, "id" | "createdAt" | "updatedAt" | "userId">;
