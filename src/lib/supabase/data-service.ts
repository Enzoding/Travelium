import { createBrowserSupabaseClient } from "./config";
import { Book, BookWithoutId, Country, Podcast, PodcastWithoutId } from "@/types";
import { v4 as uuidv4 } from "uuid";

export class DataService {
  private supabase = createBrowserSupabaseClient();

  // 书籍相关方法
  async getBooks(userId: string): Promise<Book[]> {
    try {
      const { data: books, error: booksError } = await this.supabase
        .from("books")
        .select("*")
        .eq("user_id", userId)
        .eq("book_status", 0)
        .order("created_at", { ascending: false });

      if (booksError) throw booksError;

      const booksWithCountries: Book[] = [];

      for (const book of books) {
        const { data: bookCountries, error: countriesError } = await this.supabase
          .from("book_countries")
          .select("country_code")
          .eq("book_id", book.id);

        if (countriesError) throw countriesError;

        const countryCodes = bookCountries.map((bc) => bc.country_code);

        const { data: countries, error: countryError } = await this.supabase
          .from("countries")
          .select("*")
          .in("code", countryCodes);

        if (countryError) throw countryError;

        booksWithCountries.push({
          id: book.id,
          title: book.title,
          author: book.author || undefined,
          description: book.description || undefined,
          url: book.url || undefined,
          coverUrl: book.cover_url || undefined,
          countries: countries.map((c) => ({ code: c.code, name: c.name })),
          createdAt: book.created_at,
          updatedAt: book.updated_at,
          userId: book.user_id,
          status: book.book_status,
        });
      }

      return booksWithCountries;
    } catch (error) {
      console.error("获取书籍列表时出错:", error);
      throw error;
    }
  }

  async addBook(book: BookWithoutId, userId: string): Promise<Book> {
    try {
      const bookId = uuidv4();
      const now = new Date().toISOString();

      // 添加书籍
      const { error: bookError } = await this.supabase.from("books").insert({
        id: bookId,
        title: book.title,
        author: book.author || null,
        description: book.description || null,
        url: book.url || null,
        cover_url: book.coverUrl || null,
        user_id: userId,
        created_at: now,
        updated_at: now,
        book_status: 0,
      });

      if (bookError) throw bookError;

      // 添加书籍与国家的关联
      const bookCountries = book.countries.map((country) => ({
        book_id: bookId,
        country_code: country.code,
      }));

      const { error: countriesError } = await this.supabase
        .from("book_countries")
        .insert(bookCountries);

      if (countriesError) throw countriesError;

      return {
        id: bookId,
        title: book.title,
        author: book.author,
        description: book.description,
        url: book.url,
        coverUrl: book.coverUrl,
        countries: book.countries,
        createdAt: now,
        updatedAt: now,
        userId,
        status: 0,
      };
    } catch (error) {
      console.error("添加书籍时出错:", error);
      throw error;
    }
  }

  async updateBook(id: string, book: BookWithoutId, userId: string): Promise<Book> {
    try {
      const now = new Date().toISOString();

      // 更新书籍
      const { error: bookError } = await this.supabase
        .from("books")
        .update({
          title: book.title,
          author: book.author || null,
          description: book.description || null,
          url: book.url || null,
          cover_url: book.coverUrl || null,
          updated_at: now,
        })
        .eq("id", id)
        .eq("user_id", userId);

      if (bookError) throw bookError;

      // 删除旧的国家关联
      const { error: deleteError } = await this.supabase
        .from("book_countries")
        .delete()
        .eq("book_id", id);

      if (deleteError) throw deleteError;

      // 添加新的国家关联
      const bookCountries = book.countries.map((country) => ({
        book_id: id,
        country_code: country.code,
      }));

      const { error: countriesError } = await this.supabase
        .from("book_countries")
        .insert(bookCountries);

      if (countriesError) throw countriesError;

      return {
        id,
        title: book.title,
        author: book.author,
        description: book.description,
        url: book.url,
        coverUrl: book.coverUrl,
        countries: book.countries,
        createdAt: "", // 这些值会在服务器端设置
        updatedAt: now,
        userId,
        status: 0,
      };
    } catch (error) {
      console.error("更新书籍时出错:", error);
      throw error;
    }
  }

  async deleteBook(id: string, userId: string): Promise<void> {
    try {
      // 逻辑删除书籍
      const { error: bookError } = await this.supabase
        .from("books")
        .update({ book_status: 1 })
        .eq("id", id)
        .eq("user_id", userId);

      if (bookError) throw bookError;
    } catch (error) {
      console.error("删除书籍时出错:", error);
      throw error;
    }
  }

  // 播客相关方法
  async getPodcasts(userId: string): Promise<Podcast[]> {
    try {
      const { data: podcasts, error: podcastsError } = await this.supabase
        .from("podcasts")
        .select("*")
        .eq("user_id", userId)
        .eq("podcast_status", 0)
        .order("created_at", { ascending: false });

      if (podcastsError) throw podcastsError;

      const podcastsWithCountries: Podcast[] = [];

      for (const podcast of podcasts) {
        const { data: podcastCountries, error: countriesError } = await this.supabase
          .from("podcast_countries")
          .select("country_code")
          .eq("podcast_id", podcast.id);

        if (countriesError) throw countriesError;

        const countryCodes = podcastCountries.map((pc) => pc.country_code);

        const { data: countries, error: countryError } = await this.supabase
          .from("countries")
          .select("*")
          .in("code", countryCodes);

        if (countryError) throw countryError;

        podcastsWithCountries.push({
          id: podcast.id,
          title: podcast.title,
          description: podcast.description || undefined,
          url: podcast.url || undefined,
          coverUrl: podcast.cover_url || undefined,
          audioUrl: podcast.audio_url || undefined,
          countries: countries.map((c) => ({ code: c.code, name: c.name })),
          createdAt: podcast.created_at,
          updatedAt: podcast.updated_at,
          userId: podcast.user_id,
          status: podcast.podcast_status,
        });
      }

      return podcastsWithCountries;
    } catch (error) {
      console.error("获取播客列表时出错:", error);
      throw error;
    }
  }

  async addPodcast(podcast: PodcastWithoutId, userId: string): Promise<Podcast> {
    try {
      const podcastId = uuidv4();
      const now = new Date().toISOString();

      // 添加播客
      const { error: podcastError } = await this.supabase.from("podcasts").insert({
        id: podcastId,
        title: podcast.title,
        description: podcast.description || null,
        url: podcast.url || null,
        cover_url: podcast.coverUrl || null,
        audio_url: podcast.audioUrl || null,
        user_id: userId,
        created_at: now,
        updated_at: now,
        podcast_status: 0,
      });

      if (podcastError) throw podcastError;

      // 添加播客与国家的关联
      const podcastCountries = podcast.countries.map((country) => ({
        podcast_id: podcastId,
        country_code: country.code,
      }));

      const { error: countriesError } = await this.supabase
        .from("podcast_countries")
        .insert(podcastCountries);

      if (countriesError) throw countriesError;

      return {
        id: podcastId,
        title: podcast.title,
        description: podcast.description,
        url: podcast.url,
        coverUrl: podcast.coverUrl,
        audioUrl: podcast.audioUrl,
        countries: podcast.countries,
        createdAt: now,
        updatedAt: now,
        userId,
        status: 0,
      };
    } catch (error) {
      console.error("添加播客时出错:", error);
      throw error;
    }
  }

  async updatePodcast(id: string, podcast: PodcastWithoutId, userId: string): Promise<Podcast> {
    try {
      const now = new Date().toISOString();

      // 更新播客
      const { error: podcastError } = await this.supabase
        .from("podcasts")
        .update({
          title: podcast.title,
          description: podcast.description || null,
          url: podcast.url || null,
          cover_url: podcast.coverUrl || null,
          audio_url: podcast.audioUrl || null,
          updated_at: now,
        })
        .eq("id", id)
        .eq("user_id", userId);

      if (podcastError) throw podcastError;

      // 删除旧的国家关联
      const { error: deleteError } = await this.supabase
        .from("podcast_countries")
        .delete()
        .eq("podcast_id", id);

      if (deleteError) throw deleteError;

      // 添加新的国家关联
      const podcastCountries = podcast.countries.map((country) => ({
        podcast_id: id,
        country_code: country.code,
      }));

      const { error: countriesError } = await this.supabase
        .from("podcast_countries")
        .insert(podcastCountries);

      if (countriesError) throw countriesError;

      return {
        id,
        title: podcast.title,
        description: podcast.description,
        url: podcast.url,
        coverUrl: podcast.coverUrl,
        audioUrl: podcast.audioUrl,
        countries: podcast.countries,
        createdAt: "", // 这些值会在服务器端设置
        updatedAt: now,
        userId,
        status: 0,
      };
    } catch (error) {
      console.error("更新播客时出错:", error);
      throw error;
    }
  }

  async deletePodcast(id: string, userId: string): Promise<void> {
    try {
      // 逻辑删除播客
      const { error: podcastError } = await this.supabase
        .from("podcasts")
        .update({ podcast_status: 1 })
        .eq("id", id)
        .eq("user_id", userId);

      if (podcastError) throw podcastError;
    } catch (error) {
      console.error("删除播客时出错:", error);
      throw error;
    }
  }

  // 国家相关方法
  async getCountries(): Promise<Country[]> {
    try {
      const { data, error } = await this.supabase
        .from("countries")
        .select("*")
        .order("name");

      if (error) throw error;

      return data.map((country) => ({
        code: country.code,
        name: country.name,
      }));
    } catch (error) {
      console.error("获取国家列表时出错:", error);
      throw error;
    }
  }

  // 用户资料相关方法
  async getProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("获取用户资料时出错:", error);
      throw error;
    }
  }

  async updateProfile(userId: string, profile: { username?: string; full_name?: string; avatar_url?: string }) {
    try {
      const { error } = await this.supabase
        .from("profiles")
        .update({
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("更新用户资料时出错:", error);
      throw error;
    }
  }
}
