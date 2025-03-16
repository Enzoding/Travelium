import { createBrowserSupabaseClient } from "./config";
import { Book, BookWithoutId, Country, Podcast, PodcastWithoutId, City } from "@/types";
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

      const booksWithLocations: Book[] = [];

      for (const book of books) {
        // 获取书籍关联的城市
        const { data: bookCities, error: citiesError } = await this.supabase
          .from("book_cities")
          .select("city_id")
          .eq("book_id", book.id);

        if (citiesError) throw citiesError;

        const cityIds = bookCities.map((bc) => bc.city_id);

        // 获取城市详情
        const { data: cities, error: cityError } = await this.supabase
          .from("cities")
          .select("*, countries!inner(*)")
          .in("id", cityIds);

        if (cityError) throw cityError;

        // 从城市数据中提取国家信息
        const countries = cities.reduce((acc: Country[], city) => {
          const country = {
            code: city.countries.code,
            name: city.countries.name
          };
          
          // 确保不重复添加相同的国家
          if (!acc.some(c => c.code === country.code)) {
            acc.push(country);
          }
          
          return acc;
        }, []);

        booksWithLocations.push({
          id: book.id,
          title: book.title,
          author: book.author || undefined,
          description: book.description || undefined,
          url: book.url || undefined,
          coverUrl: book.cover_url || undefined,
          countries,
          cities: cities.map((c) => ({
            id: c.id,
            name: c.name,
            country_code: c.countries.code,
            country_name: c.countries.name
          })),
          createdAt: book.created_at,
          updatedAt: book.updated_at,
          userId: book.user_id,
          status: book.book_status,
        });
      }

      return booksWithLocations;
    } catch (error) {
      console.error("获取书籍列表时出错:", error);
      throw error;
    }
  }

  async addBook(book: BookWithoutId, userId: string): Promise<Book> {
    try {
      console.log("开始添加书籍:", book.title);
      const bookId = uuidv4();
      const now = new Date().toISOString();

      // 添加书籍
      console.log("添加书籍到 books 表:", { title: book.title, userId });
      
      // 检查 books 表是否有 book_status 字段
      const { data: bookColumns, error: columnsError } = await this.supabase
        .from('books')
        .select('*')
        .limit(1);
        
      if (columnsError) {
        console.error("获取书籍表结构时出错:", columnsError);
      }
      
      // 准备插入数据
      const bookData: any = {
        id: bookId,
        title: book.title,
        author: book.author || null,
        description: book.description || null,
        url: book.url || null,
        cover_url: book.coverUrl || null,
        user_id: userId,
        created_at: now,
        updated_at: now,
      };
      
      // 如果表中存在 book_status 字段，则添加该字段
      const hasStatusField = !columnsError && bookColumns && 
        (bookColumns.length === 0 || 'book_status' in bookColumns[0]);
        
      if (hasStatusField) {
        console.log("书籍表包含 book_status 字段，添加默认值 0");
        bookData.book_status = 0;
      } else {
        console.log("书籍表不包含 book_status 字段，跳过该字段");
      }
      
      const { error: bookError, data: bookInserted } = await this.supabase
        .from("books")
        .insert(bookData)
        .select();

      if (bookError) {
        console.error("添加书籍到 books 表时出错:", bookError);
        throw bookError;
      }
      
      console.log("书籍添加成功:", bookInserted);

      // 添加书籍与城市的关联
      if (book.cities && book.cities.length > 0) {
        console.log("开始处理城市关联:", book.cities);
        
        // 确保所有城市都已存在于数据库中
        for (const city of book.cities) {
          console.log("处理城市:", city);
          
          try {
            // 检查国家是否存在
            console.log("检查国家是否存在:", city.country_code);
            const { data: existingCountry, error: countryCheckError } = await this.supabase
              .from("countries")
              .select("code")
              .eq("code", city.country_code)
              .single();
              
            if (countryCheckError && countryCheckError.code !== "PGRST116") {
              console.error("检查国家时出错:", countryCheckError);
              throw countryCheckError;
            }
            
            console.log("国家检查结果:", existingCountry);
              
            // 如果国家不存在，先创建国家
            if (!existingCountry) {
              console.log("创建国家:", { code: city.country_code, name: city.country_name });
              const { error: countryError, data: countryData } = await this.supabase
                .from("countries")
                .insert({
                  code: city.country_code,
                  name: city.country_name,
                }).select();
                
              if (countryError) {
                console.error(`创建国家 ${city.country_name} 时出错:`, countryError);
                throw countryError;
              }
              
              console.log("国家创建成功:", countryData);
            }
            
            // 检查城市是否存在
            console.log("检查城市是否存在:", city.id);
            const { data: existingCity, error: cityCheckError } = await this.supabase
              .from("cities")
              .select("id")
              .eq("id", city.id)
              .single();
              
            if (cityCheckError && cityCheckError.code !== "PGRST116") {
              console.error("检查城市时出错:", cityCheckError);
              throw cityCheckError;
            }
            
            console.log("城市检查结果:", existingCity);
              
            // 如果城市不存在，先创建城市
            if (!existingCity) {
              console.log("创建城市:", { id: city.id, name: city.name, country_code: city.country_code });
              const { error: cityError, data: cityData } = await this.supabase
                .from("cities")
                .insert({
                  id: city.id,
                  name: city.name,
                  country_code: city.country_code,
                }).select();
                
              if (cityError) {
                console.error(`创建城市 ${city.name} 时出错:`, cityError);
                throw cityError;
              }
              
              console.log("城市创建成功:", cityData);
            }
          } catch (error) {
            console.error("处理城市数据时出错:", error);
            throw error;
          }
        }

        // 创建书籍与城市的关联
        console.log("创建书籍与城市的关联");
        const bookCities = book.cities.map((city) => ({
          book_id: bookId,
          city_id: city.id,
        }));

        console.log("插入 book_cities 数据:", bookCities);
        const { error: citiesError, data: citiesData } = await this.supabase
          .from("book_cities")
          .insert(bookCities)
          .select();

        if (citiesError) {
          console.error("添加书籍与城市关联时出错:", citiesError);
          throw citiesError;
        }
        
        console.log("书籍与城市关联创建成功:", citiesData);
      }

      return {
        id: bookId,
        title: book.title,
        author: book.author,
        description: book.description,
        url: book.url,
        coverUrl: book.coverUrl,
        countries: book.countries || [],
        cities: book.cities || [],
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

      // 删除旧的城市关联
      const { error: deleteError } = await this.supabase
        .from("book_cities")
        .delete()
        .eq("book_id", id);

      if (deleteError) throw deleteError;

      // 添加新的城市关联
      if (book.cities && book.cities.length > 0) {
        const bookCities = book.cities.map((city) => ({
          book_id: id,
          city_id: city.id,
        }));

        const { error: citiesError } = await this.supabase
          .from("book_cities")
          .insert(bookCities);

        if (citiesError) throw citiesError;
      }

      return {
        id,
        title: book.title,
        author: book.author,
        description: book.description,
        url: book.url,
        coverUrl: book.coverUrl,
        countries: book.countries || [],
        cities: book.cities || [],
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

      const podcastsWithLocations: Podcast[] = [];

      for (const podcast of podcasts) {
        // 获取播客关联的城市
        const { data: podcastCities, error: citiesError } = await this.supabase
          .from("podcast_cities")
          .select("city_id")
          .eq("podcast_id", podcast.id);

        if (citiesError) throw citiesError;

        const cityIds = podcastCities.map((pc) => pc.city_id);

        // 获取城市详情
        const { data: cities, error: cityError } = await this.supabase
          .from("cities")
          .select("*, countries!inner(*)")
          .in("id", cityIds);

        if (cityError) throw cityError;

        // 从城市数据中提取国家信息
        const countries = cities.reduce((acc: Country[], city) => {
          const country = {
            code: city.countries.code,
            name: city.countries.name
          };
          
          // 确保不重复添加相同的国家
          if (!acc.some(c => c.code === country.code)) {
            acc.push(country);
          }
          
          return acc;
        }, []);

        podcastsWithLocations.push({
          id: podcast.id,
          title: podcast.title,
          description: podcast.description || undefined,
          url: podcast.url || undefined,
          coverUrl: podcast.cover_url || undefined,
          audioUrl: podcast.audio_url || undefined,
          countries,
          cities: cities.map((c) => ({
            id: c.id,
            name: c.name,
            country_code: c.countries.code,
            country_name: c.countries.name
          })),
          createdAt: podcast.created_at,
          updatedAt: podcast.updated_at,
          userId: podcast.user_id,
          status: podcast.podcast_status,
        });
      }

      return podcastsWithLocations;
    } catch (error) {
      console.error("获取播客列表时出错:", error);
      throw error;
    }
  }

  async addPodcast(podcast: PodcastWithoutId, userId: string): Promise<Podcast> {
    try {
      console.log("开始添加播客:", podcast.title);
      const podcastId = uuidv4();
      const now = new Date().toISOString();

      // 添加播客
      console.log("添加播客到 podcasts 表:", { title: podcast.title, userId });
      
      // 检查 podcasts 表是否有 podcast_status 字段
      const { data: podcastColumns, error: columnsError } = await this.supabase
        .from('podcasts')
        .select('*')
        .limit(1);
        
      if (columnsError) {
        console.error("获取播客表结构时出错:", columnsError);
      }
      
      // 准备插入数据
      const podcastData: any = {
        id: podcastId,
        title: podcast.title,
        description: podcast.description || null,
        url: podcast.url || null,
        cover_url: podcast.coverUrl || null,
        audio_url: podcast.audioUrl || null,
        user_id: userId,
        created_at: now,
        updated_at: now,
      };
      
      // 如果表中存在 podcast_status 字段，则添加该字段
      const hasStatusField = !columnsError && podcastColumns && 
        (podcastColumns.length === 0 || 'podcast_status' in podcastColumns[0]);
        
      if (hasStatusField) {
        console.log("播客表包含 podcast_status 字段，添加默认值 0");
        podcastData.podcast_status = 0;
      } else {
        console.log("播客表不包含 podcast_status 字段，跳过该字段");
      }
      
      const { error: podcastError, data: insertedPodcast } = await this.supabase
        .from("podcasts")
        .insert(podcastData)
        .select();

      if (podcastError) {
        console.error("添加播客到 podcasts 表时出错:", podcastError);
        throw podcastError;
      }
      
      console.log("播客添加成功:", insertedPodcast);

      // 添加播客与城市的关联
      if (podcast.cities && podcast.cities.length > 0) {
        console.log("开始处理城市关联:", podcast.cities);
        
        // 创建一个数组来存储成功关联的城市
        const successfulCities = [];
        
        // 确保所有城市都已存在于数据库中
        for (const city of podcast.cities) {
          console.log("处理城市:", city);
          
          try {
            // 首先检查城市是否已存在
            console.log("检查城市是否存在:", city.id);
            const { data: existingCity, error: cityCheckError } = await this.supabase
              .from("cities")
              .select("id, country_code")
              .eq("id", city.id)
              .maybeSingle();
              
            if (cityCheckError && cityCheckError.code !== "PGRST116") {
              console.error("检查城市时出错:", cityCheckError);
              continue; // 跳过这个城市，继续处理其他城市
            }
            
            console.log("城市检查结果:", existingCity);
            
            // 如果城市已存在，添加到成功列表
            if (existingCity) {
              successfulCities.push(city);
              continue;
            }
            
            // 检查国家是否存在
            console.log("检查国家是否存在:", city.country_code);
            const { data: existingCountry, error: countryCheckError } = await this.supabase
              .from("countries")
              .select("code")
              .eq("code", city.country_code)
              .maybeSingle();
              
            if (countryCheckError && countryCheckError.code !== "PGRST116") {
              console.error("检查国家时出错:", countryCheckError);
              continue; // 跳过这个城市，继续处理其他城市
            }
            
            console.log("国家检查结果:", existingCountry);
              
            // 如果国家不存在，尝试创建国家
            let countryExists = !!existingCountry;
            
            if (!countryExists) {
              try {
                console.log("创建国家:", { code: city.country_code, name: city.country_name });
                const { error: countryError, data: countryData } = await this.supabase
                  .from("countries")
                  .upsert({
                    code: city.country_code,
                    name: city.country_name,
                  }, { onConflict: 'code' })
                  .select();
                  
                if (countryError) {
                  console.error(`创建国家 ${city.country_name} 时出错:`, countryError);
                  console.log("尝试继续执行，假设国家已存在");
                  // 尝试再次检查国家是否存在
                  const { data: recheckedCountry } = await this.supabase
                    .from("countries")
                    .select("code")
                    .eq("code", city.country_code)
                    .maybeSingle();
                    
                  countryExists = !!recheckedCountry;
                } else {
                  console.log("国家创建成功:", countryData);
                  countryExists = true;
                }
              } catch (countryCreateError) {
                console.error(`创建国家 ${city.country_name} 时出现异常:`, countryCreateError);
                console.log("尝试继续执行，假设国家已存在");
                // 尝试再次检查国家是否存在
                const { data: recheckedCountry } = await this.supabase
                  .from("countries")
                  .select("code")
                  .eq("code", city.country_code)
                  .maybeSingle();
                  
                countryExists = !!recheckedCountry;
              }
            }
            
            // 如果国家存在或已创建，尝试创建城市
            if (countryExists) {
              try {
                console.log("创建城市:", { id: city.id, name: city.name, country_code: city.country_code });
                const { error: cityError, data: cityData } = await this.supabase
                  .from("cities")
                  .upsert({
                    id: city.id,
                    name: city.name,
                    country_code: city.country_code,
                  }, { onConflict: 'id' })
                  .select();
                  
                if (cityError) {
                  console.error(`创建城市 ${city.name} 时出错:`, cityError);
                  console.log("尝试继续执行，假设城市已存在");
                  
                  // 尝试再次检查城市是否存在
                  const { data: recheckedCity } = await this.supabase
                    .from("cities")
                    .select("id")
                    .eq("id", city.id)
                    .maybeSingle();
                    
                  if (recheckedCity) {
                    successfulCities.push(city);
                  }
                } else {
                  console.log("城市创建成功:", cityData);
                  successfulCities.push(city);
                }
              } catch (cityCreateError) {
                console.error(`创建城市 ${city.name} 时出现异常:`, cityCreateError);
                console.log("尝试继续执行，假设城市已存在");
                
                // 尝试再次检查城市是否存在
                const { data: recheckedCity } = await this.supabase
                  .from("cities")
                  .select("id")
                  .eq("id", city.id)
                  .maybeSingle();
                  
                if (recheckedCity) {
                  successfulCities.push(city);
                }
              }
            }
          } catch (error) {
            console.error("处理城市数据时出错:", error);
            // 继续处理其他城市，不中断整个流程
          }
        }

        // 只为成功创建或已存在的城市创建关联
        if (successfulCities.length > 0) {
          console.log("创建播客与城市的关联，成功的城市数量:", successfulCities.length);
          const podcastCities = successfulCities.map((city) => ({
            podcast_id: podcastId,
            city_id: city.id,
          }));

          console.log("插入 podcast_cities 数据:", podcastCities);
          const { error: citiesError, data: citiesData } = await this.supabase
            .from("podcast_cities")
            .insert(podcastCities)
            .select();

          if (citiesError) {
            console.error("添加播客与城市关联时出错:", citiesError);
            // 不抛出错误，继续返回播客数据
          } else {
            console.log("播客与城市关联创建成功:", citiesData);
          }
        } else {
          console.log("没有成功创建或找到任何城市，跳过创建关联");
        }
      }

      return {
        id: podcastId,
        title: podcast.title,
        description: podcast.description,
        url: podcast.url,
        coverUrl: podcast.coverUrl,
        audioUrl: podcast.audioUrl,
        countries: podcast.countries || [],
        cities: podcast.cities || [],
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

      // 删除旧的城市关联
      const { error: deleteError } = await this.supabase
        .from("podcast_cities")
        .delete()
        .eq("podcast_id", id);

      if (deleteError) throw deleteError;

      // 添加新的城市关联
      if (podcast.cities && podcast.cities.length > 0) {
        const podcastCities = podcast.cities.map((city) => ({
          podcast_id: id,
          city_id: city.id,
        }));

        const { error: citiesError } = await this.supabase
          .from("podcast_cities")
          .insert(podcastCities);

        if (citiesError) throw citiesError;
      }

      return {
        id,
        title: podcast.title,
        description: podcast.description,
        url: podcast.url,
        coverUrl: podcast.coverUrl,
        audioUrl: podcast.audioUrl,
        countries: podcast.countries || [],
        cities: podcast.cities || [],
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

  // 城市相关方法
  async getCities(): Promise<City[]> {
    try {
      const { data, error } = await this.supabase
        .from("cities")
        .select("*, countries!inner(*)")
        .order("name");

      if (error) throw error;

      return data.map((city) => ({
        id: city.id,
        name: city.name,
        country_code: city.countries.code,
        country_name: city.countries.name
      }));
    } catch (error) {
      console.error("获取城市列表时出错:", error);
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
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
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
