import { Database } from "./supabase";

export type Country = {
  code: string;
  name: string;
};

export type Book = {
  id: string;
  title: string;
  author?: string;
  description?: string;
  url?: string;
  coverUrl?: string;
  countries: Country[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  status: number;
};

export type Podcast = {
  id: string;
  title: string;
  url?: string;
  description?: string;
  coverUrl?: string;
  audioUrl?: string;
  countries: Country[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  status: number;
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// 修改这些类型定义，使其与实际使用一致
export type BookWithoutId = {
  title: string;
  author?: string;
  description?: string;
  url?: string;
  coverUrl?: string;
  countries: Country[];
};

export type PodcastWithoutId = {
  title: string;
  url?: string;
  description?: string;
  coverUrl?: string;
  audioUrl?: string;
  countries: Country[];
};
