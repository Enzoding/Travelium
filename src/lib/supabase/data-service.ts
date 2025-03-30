import { createBrowserSupabaseClient } from "./config";
import { Book, BookWithoutId, City, Content, ContentType, ContentWithoutId, Country, ExternalResource, Podcast, PodcastWithoutId, Profile } from "@/types";
import { v4 as uuidv4 } from "uuid";

export class DataService {
  private supabase = createBrowserSupabaseClient();

  // 获取用户配置文件
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("获取用户配置文件时出错:", error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error("获取用户配置文件时出错:", error);
      return null;
    }
  }

  // 更新用户配置文件
  async updateProfile(userId: string, profile: Partial<Profile>): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .update(profile)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("更新用户配置文件时出错:", error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error("更新用户配置文件时出错:", error);
      return null;
    }
  }

  // 获取内容列表
  async getContents(userId: string, type?: ContentType): Promise<Content[]> {
    try {
      let query = this.supabase
        .from("contents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (type) {
        query = query.eq("type", type);
      }

      const { data: contents, error } = await query;

      if (error) throw error;

      const contentsWithLocations: Content[] = [];

      for (const content of contents) {
        // 获取内容关联的城市
        const { data: contentCities, error: citiesError } = await this.supabase
          .from("content_locations")
          .select("city_id")
          .eq("content_id", content.id);

        if (citiesError) throw citiesError;

        const cityIds = contentCities.map((cl) => cl.city_id);

        // 获取城市详情
        let cities: City[] = [];
        let countries: Country[] = [];
        
        if (cityIds.length > 0) {
          const { data: citiesData, error: cityError } = await this.supabase
            .from("cities")
            .select("*, countries(*)")
            .in("id", cityIds);

          if (cityError) throw cityError;

          cities = citiesData.map((c) => ({
            id: c.id,
            name: c.name,
            country_id: c.country_id,
            country_name: c.countries?.name,
            country_code: c.countries?.code,
            mapbox_id: c.mapbox_id,
            place_type: c.place_type,
            longitude: c.longitude,
            latitude: c.latitude,
            bbox: c.bbox,
            region: c.region,
            district: c.district,
            place_formatted: c.place_formatted,
            created_at: c.created_at,
            updated_at: c.updated_at
          }));

          // 从城市数据中提取国家信息
          countries = citiesData.reduce((acc: Country[], city) => {
            if (city.countries) {
              const country = {
                id: city.countries.id,
                code: city.countries.code,
                name: city.countries.name,
                created_at: city.countries.created_at
              };
              
              // 确保不重复添加相同的国家
              if (!acc.some(c => c.id === country.id)) {
                acc.push(country);
              }
            }
            
            return acc;
          }, []);
        }

        // 获取外部资源
        const { data: externalResources, error: resourcesError } = await this.supabase
          .from("external_resources")
          .select("*")
          .eq("content_id", content.id);

        if (resourcesError) throw resourcesError;

        contentsWithLocations.push({
          ...content,
          countries,
          cities,
          external_resources: externalResources
        });
      }

      return contentsWithLocations;
    } catch (error) {
      console.error("获取内容列表时出错:", error);
      throw error;
    }
  }

  // 获取书籍列表 (向后兼容)
  async getBooks(userId: string): Promise<Book[]> {
    try {
      const contents = await this.getContents(userId, ContentType.Book);
      
      return contents.map(content => this.contentToBook(content));
    } catch (error) {
      console.error("获取书籍列表时出错:", error);
      throw error;
    }
  }

  // 获取播客列表 (向后兼容)
  async getPodcasts(userId: string): Promise<Podcast[]> {
    try {
      const contents = await this.getContents(userId, ContentType.Podcast);
      
      return contents.map(content => this.contentToPodcast(content));
    } catch (error) {
      console.error("获取播客列表时出错:", error);
      throw error;
    }
  }

  // 添加内容
  async addContent(content: ContentWithoutId, userId: string): Promise<Content> {
    console.log("开始添加内容:", content.title);
    
    try {
      // 基本内容数据
      const now = new Date().toISOString();
      const contentData = {
        user_id: userId,
        type: content.type,
        title: content.title,
        subtitle: content.subtitle || undefined,
        orig_title: content.orig_title || undefined,
        description: content.description || undefined,
        cover_image_url: content.cover_image_url || undefined,
        
        // API兼容字段
        uuid: content.uuid || undefined,
        url: content.url || undefined,
        api_url: content.api_url || undefined,
        category: content.category || undefined,
        parent_uuid: content.parent_uuid || undefined,
        display_title: content.display_title || undefined,
        
        // 书籍特有字段
        author: content.author || undefined,
        translator: content.translator || undefined,
        language: content.language || undefined,
        pub_house: content.pub_house || undefined,
        pub_year: content.pub_year || undefined,
        pub_month: content.pub_month || undefined,
        binding: content.binding || undefined,
        price: content.price || undefined,
        pages: content.pages || undefined,
        series: content.series || undefined,
        imprint: content.imprint || undefined,
        isbn: content.isbn || undefined,
        
        created_at: now,
        updated_at: now
      };
      
      // 添加内容
      const { data: contentResult, error: contentError } = await this.supabase
        .from("contents")
        .insert(contentData)
        .select()
        .single();
      
      if (contentError) {
        console.error("添加内容时出错:", contentError);
        throw contentError;
      }
      
      if (!contentResult) {
        throw new Error("添加内容失败，未返回内容数据");
      }
      
      const contentId = contentResult.id;
      
      // 处理外部资源
      if (content.external_resources && content.external_resources.length > 0) {
        try {
          const externalResourcesData = content.external_resources.map(resource => ({
            content_id: contentId,
            url: resource.url
          }));
          
          const { error: resourcesError } = await this.supabase
            .from("external_resources")
            .insert(externalResourcesData);
          
          if (resourcesError) {
            console.error("添加外部资源时出错:", resourcesError);
            // 不抛出异常，继续处理
          }
        } catch (error) {
          console.error("处理外部资源时出错:", error);
          // 不抛出异常，继续处理
        }
      }
      
      // 处理城市和国家数据
      if (content.cities && content.cities.length > 0) {
        try {
          await this.processCitiesForContent(contentId, content.cities);
        } catch (error) {
          console.error("处理城市数据时出错:", error);
          // 不抛出异常，继续处理
        }
      }
      
      // 返回完整内容
      return this.getContentById(contentId, userId);
    } catch (error) {
      console.error("添加内容时出错:", error);
      throw error;
    }
  }

  // 添加书籍 (向后兼容)
  async addBook(book: BookWithoutId, userId: string): Promise<Book> {
    try {
      // 将BookWithoutId转换为ContentWithoutId
      const content: ContentWithoutId = {
        type: ContentType.Book,
        title: book.title,
        description: book.description,
        cover_image_url: book.coverUrl,
        url: book.url,
        author: book.author ? [book.author] : undefined,
        cities: book.cities || [],
        countries: book.countries || []
      };
      
      // 添加内容
      const result = await this.addContent(content, userId);
      
      // 转换为Book类型返回
      return this.contentToBook(result);
    } catch (error) {
      console.error("添加书籍时出错:", error);
      // 返回一个基本的错误对象，而不是抛出异常
      return {
        id: "error",
        title: book.title,
        author: book.author,
        description: book.description || "",
        url: book.url,
        coverUrl: book.coverUrl,
        countries: book.countries || [],
        cities: book.cities || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: userId,
        status: 0
      };
    }
  }

  // 更新书籍 (向后兼容)
  async updateBook(id: string, book: BookWithoutId, userId: string): Promise<Book> {
    try {
      // 获取现有内容
      const existingContent = await this.getContentById(id);
      
      if (existingContent.user_id !== userId) {
        throw new Error("无权更新此书籍");
      }
      
      const now = new Date().toISOString();
      
      // 准备更新数据
      const contentData = {
        title: book.title,
        description: book.description,
        cover_image_url: book.coverUrl,
        url: book.url,
        author: book.author ? [book.author] : existingContent.author,
        updated_at: now
      };
      
      // 更新内容
      const { error: contentError } = await this.supabase
        .from("contents")
        .update(contentData)
        .eq("id", id)
        .eq("user_id", userId);
      
      if (contentError) {
        console.error("更新书籍时出错:", contentError);
        throw contentError;
      }
      
      // 如果有新的城市，先删除旧的关联，再添加新的
      if (book.cities && book.cities.length > 0) {
        // 删除旧的关联
        const { error: deleteError } = await this.supabase
          .from("content_locations")
          .delete()
          .eq("content_id", id);
        
        if (deleteError) {
          console.error("删除旧的城市关联时出错:", deleteError);
          throw deleteError;
        }
        
        // 添加新的关联
        await this.processCitiesForContent(id, book.cities);
      }
      
      // 获取更新后的内容
      const updatedContent = await this.getContentById(id);
      return this.contentToBook(updatedContent);
    } catch (error) {
      console.error("更新书籍时出错:", error);
      throw error;
    }
  }
  
  // 删除书籍 (向后兼容)
  async deleteBook(id: string, userId: string): Promise<void> {
    try {
      // 检查是否有权限删除
      const { data, error: checkError } = await this.supabase
        .from("contents")
        .select("id")
        .eq("id", id)
        .eq("user_id", userId)
        .single();
      
      if (checkError) {
        console.error("检查书籍权限时出错:", checkError);
        throw checkError;
      }
      
      if (!data) {
        throw new Error("无权删除此书籍");
      }
      
      // 删除内容与城市的关联
      const { error: locationError } = await this.supabase
        .from("content_locations")
        .delete()
        .eq("content_id", id);
      
      if (locationError) {
        console.error("删除内容与城市关联时出错:", locationError);
        throw locationError;
      }
      
      // 删除外部资源
      const { error: resourceError } = await this.supabase
        .from("external_resources")
        .delete()
        .eq("content_id", id);
      
      if (resourceError) {
        console.error("删除外部资源时出错:", resourceError);
        throw resourceError;
      }
      
      // 删除内容
      const { error: contentError } = await this.supabase
        .from("contents")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      
      if (contentError) {
        console.error("删除书籍时出错:", contentError);
        throw contentError;
      }
    } catch (error) {
      console.error("删除书籍时出错:", error);
      throw error;
    }
  }

  // 添加播客 (向后兼容)
  async addPodcast(podcast: PodcastWithoutId, userId: string): Promise<Podcast> {
    try {
      const content: ContentWithoutId = {
        type: ContentType.Podcast,
        title: podcast.title,
        description: podcast.description,
        cover_image_url: podcast.coverUrl,
        url: podcast.url,
        external_resources: podcast.audioUrl ? [{ url: podcast.audioUrl }] as any : undefined,
        cities: podcast.cities,
        countries: podcast.countries
      };
      
      const result = await this.addContent(content, userId);
      return this.contentToPodcast(result);
    } catch (error) {
      console.error("添加播客时出错:", error);
      throw error;
    }
  }
  
  // 更新播客 (向后兼容)
  async updatePodcast(id: string, podcast: PodcastWithoutId, userId: string): Promise<Podcast> {
    try {
      // 获取现有内容
      const existingContent = await this.getContentById(id);
      
      if (existingContent.user_id !== userId) {
        throw new Error("无权更新此播客");
      }
      
      const now = new Date().toISOString();
      
      // 准备更新数据
      const contentData = {
        title: podcast.title,
        description: podcast.description,
        cover_image_url: podcast.coverUrl,
        url: podcast.url,
        updated_at: now
      };
      
      // 更新内容
      const { error: contentError } = await this.supabase
        .from("contents")
        .update(contentData)
        .eq("id", id)
        .eq("user_id", userId);
      
      if (contentError) {
        console.error("更新播客时出错:", contentError);
        throw contentError;
      }
      
      // 如果有新的音频URL，更新外部资源
      if (podcast.audioUrl) {
        // 删除旧的外部资源
        const { error: deleteError } = await this.supabase
          .from("external_resources")
          .delete()
          .eq("content_id", id);
        
        if (deleteError) {
          console.error("删除旧的外部资源时出错:", deleteError);
          throw deleteError;
        }
        
        // 添加新的外部资源
        const { error: resourceError } = await this.supabase
          .from("external_resources")
          .insert({
            content_id: id,
            url: podcast.audioUrl
          });
        
        if (resourceError) {
          console.error("添加新的外部资源时出错:", resourceError);
          throw resourceError;
        }
      }
      
      // 如果有新的城市，先删除旧的关联，再添加新的
      if (podcast.cities && podcast.cities.length > 0) {
        // 删除旧的关联
        const { error: deleteError } = await this.supabase
          .from("content_locations")
          .delete()
          .eq("content_id", id);
        
        if (deleteError) {
          console.error("删除旧的城市关联时出错:", deleteError);
          throw deleteError;
        }
        
        // 添加新的关联
        await this.processCitiesForContent(id, podcast.cities);
      }
      
      // 获取更新后的内容
      const updatedContent = await this.getContentById(id);
      return this.contentToPodcast(updatedContent);
    } catch (error) {
      console.error("更新播客时出错:", error);
      throw error;
    }
  }
  
  // 删除播客 (向后兼容)
  async deletePodcast(id: string, userId: string): Promise<void> {
    try {
      // 检查是否有权限删除
      const { data, error: checkError } = await this.supabase
        .from("contents")
        .select("id")
        .eq("id", id)
        .eq("user_id", userId)
        .single();
      
      if (checkError) {
        console.error("检查播客权限时出错:", checkError);
        throw checkError;
      }
      
      if (!data) {
        throw new Error("无权删除此播客");
      }
      
      // 删除内容与城市的关联
      const { error: locationError } = await this.supabase
        .from("content_locations")
        .delete()
        .eq("content_id", id);
      
      if (locationError) {
        console.error("删除内容与城市关联时出错:", locationError);
        throw locationError;
      }
      
      // 删除外部资源
      const { error: resourceError } = await this.supabase
        .from("external_resources")
        .delete()
        .eq("content_id", id);
      
      if (resourceError) {
        console.error("删除外部资源时出错:", resourceError);
        throw resourceError;
      }
      
      // 删除内容
      const { error: contentError } = await this.supabase
        .from("contents")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      
      if (contentError) {
        console.error("删除播客时出错:", contentError);
        throw contentError;
      }
    } catch (error) {
      console.error("删除播客时出错:", error);
      throw error;
    }
  }

  // 获取单个内容
  async getContentById(contentId: string, userId?: string): Promise<Content> {
    try {
      const query = this.supabase
        .from("contents")
        .select("*")
        .eq("id", contentId);
      
      // 如果提供了userId，则添加用户ID过滤
      if (userId) {
        query.eq("user_id", userId);
      }
      
      const { data: content, error } = await query.single();

      if (error) throw error;
      if (!content) throw new Error(`未找到ID为 ${contentId} 的内容`);

      // 获取关联的国家
      const { data: countries, error: countriesError } = await this.supabase
        .from("countries")
        .select("*")
        .in("id", await this.getContentCountryIds(contentId));

      if (countriesError) {
        console.error("获取国家数据时出错:", countriesError);
      }

      // 获取关联的城市
      const { data: cities, error: citiesError } = await this.supabase
        .from("cities")
        .select("*")
        .in("id", await this.getContentCityIds(contentId));

      if (citiesError) {
        console.error("获取城市数据时出错:", citiesError);
      }

      // 获取外部资源
      const { data: externalResources, error: resourcesError } = await this.supabase
        .from("external_resources")
        .select("*")
        .eq("content_id", contentId);

      if (resourcesError) {
        console.error("获取外部资源时出错:", resourcesError);
      }

      // 返回完整内容
      return {
        ...content,
        countries: countries || [],
        cities: cities || [],
        external_resources: externalResources || []
      } as Content;
    } catch (error) {
      console.error("获取内容详情时出错:", error);
      throw error;
    }
  }

  // 获取单个书籍 (向后兼容)
  async getBookById(id: string, userId?: string): Promise<Book> {
    try {
      const content = await this.getContentById(id, userId);
      return this.contentToBook(content);
    } catch (error) {
      console.error("获取书籍时出错:", error);
      throw error;
    }
  }

  // 获取单个播客 (向后兼容)
  async getPodcastById(id: string, userId?: string): Promise<Podcast> {
    try {
      const content = await this.getContentById(id, userId);
      return this.contentToPodcast(content);
    } catch (error) {
      console.error("获取播客时出错:", error);
      throw error;
    }
  }

  // 处理城市数据
  private async processCitiesForContent(contentId: string, cities: City[]): Promise<void> {
    try {
      for (const city of cities) {
        console.log("处理城市:", city.name || "未命名城市");
        
        try {
          // 检查国家是否存在
          let countryId = city.country_id;
          
          // 如果没有国家ID但有国家代码，尝试查找或创建国家
          if (!countryId && city.country_code) {
            const { data: existingCountry, error: countryCheckError } = await this.supabase
              .from("countries")
              .select("id")
              .eq("code", city.country_code)
              .maybeSingle();
              
            if (countryCheckError) {
              console.error(`检查国家代码 ${city.country_code} 时出错:`, countryCheckError);
              continue; // 跳过此城市
            }
              
            // 如果国家不存在，先创建国家
            if (!existingCountry) {
              if (!city.country_name) {
                console.error("创建国家时缺少国家名称，跳过此城市");
                continue; // 跳过此城市
              }
              
              const { error: countryError, data: countryData } = await this.supabase
                .from("countries")
                .insert({
                  code: city.country_code,
                  name: city.country_name,
                }).select();
                
              if (countryError) {
                console.error(`创建国家 ${city.country_name} 时出错:`, countryError);
                continue; // 跳过此城市
              }
              
              countryId = countryData[0].id;
            } else {
              countryId = existingCountry.id;
            }
          }
          
          if (!countryId) {
            console.error("处理城市时缺少国家ID，跳过此城市");
            continue; // 跳过此城市
          }
          
          // 处理城市
          let cityId: string;
          
          // 如果有城市ID，检查是否存在
          if (city.id) {
            // 检查ID是否为有效的UUID格式
            const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(city.id);
            
            if (isValidUuid) {
              const { data: existingCity, error: cityCheckError } = await this.supabase
                .from("cities")
                .select("id")
                .eq("id", city.id)
                .maybeSingle();
                
              if (cityCheckError) {
                console.error(`检查城市ID ${city.id} 时出错:`, cityCheckError);
                // 如果检查出错，我们将创建一个新城市
              } else if (existingCity) {
                // 如果城市存在，使用现有ID
                cityId = existingCity.id;
                
                // 创建内容与城市的关联
                const { error: locationError } = await this.supabase
                  .from("content_locations")
                  .insert({
                    content_id: contentId,
                    city_id: cityId,
                  });
                  
                if (locationError) {
                  console.error("添加内容与城市关联时出错:", locationError);
                }
                
                // 继续处理下一个城市
                continue;
              }
            } else {
              console.log(`城市ID ${city.id} 不是有效的UUID格式，将创建新城市`);
              // 如果ID不是有效的UUID格式，我们将创建一个新城市
            }
            // 如果城市不存在，将创建一个新城市
          }
          
          // 创建新城市
          const newCityData: any = {
            name: city.name || "未命名城市",
            country_id: countryId
          };
          
          // 添加Mapbox相关字段
          if (city.mapbox_id) newCityData.mapbox_id = city.mapbox_id;
          if (city.place_type) newCityData.place_type = city.place_type;
          if (city.longitude) newCityData.longitude = city.longitude;
          if (city.latitude) newCityData.latitude = city.latitude;
          if (city.bbox) newCityData.bbox = city.bbox;
          if (city.region) newCityData.region = city.region;
          if (city.district) newCityData.district = city.district;
          if (city.place_formatted) newCityData.place_formatted = city.place_formatted;
          
          const { error: cityError, data: newCity } = await this.supabase
            .from("cities")
            .insert(newCityData)
            .select();
            
          if (cityError) {
            console.error(`创建城市 ${city.name || "未命名城市"} 时出错:`, cityError);
            continue; // 跳过此城市
          }
          
          cityId = newCity[0].id;
          
          // 创建内容与城市的关联
          const { error: locationError } = await this.supabase
            .from("content_locations")
            .insert({
              content_id: contentId,
              city_id: cityId,
            });
            
          if (locationError) {
            console.error("添加内容与城市关联时出错:", locationError);
          }
        } catch (error) {
          console.error(`处理城市 ${city.name || "未命名城市"} 时出错:`, error);
          // 继续处理其他城市
        }
      }
    } catch (error) {
      console.error("处理城市数据时出错:", error);
      // 不抛出异常，让内容创建继续进行
    }
  }

  // 获取国家列表
  async getCountries(): Promise<Country[]> {
    try {
      const { data, error } = await this.supabase
        .from("countries")
        .select("*")
        .order("name");
        
      if (error) throw error;
      
      return data as Country[];
    } catch (error) {
      console.error("获取国家列表时出错:", error);
      throw error;
    }
  }

  // 获取内容关联的国家ID列表
  private async getContentCountryIds(contentId: string): Promise<string[]> {
    try {
      // 首先获取内容关联的城市ID
      const cityIds = await this.getContentCityIds(contentId);
      
      if (cityIds.length === 0) {
        return [];
      }
      
      // 根据城市ID获取国家ID
      const { data, error } = await this.supabase
        .from("cities")
        .select("country_id")
        .in("id", cityIds);
      
      if (error) {
        console.error("获取内容关联的国家ID时出错:", error);
        return [];
      }
      
      // 提取唯一的国家ID
      const countryIds = [...new Set(data.map(item => item.country_id))];
      return countryIds;
    } catch (error) {
      console.error("获取内容关联的国家ID时出错:", error);
      return [];
    }
  }
  
  // 获取内容关联的城市ID列表
  private async getContentCityIds(contentId: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from("content_locations")
        .select("city_id")
        .eq("content_id", contentId);
      
      if (error) {
        console.error("获取内容关联的城市ID时出错:", error);
        return [];
      }
      
      return data.map(item => item.city_id);
    } catch (error) {
      console.error("获取内容关联的城市ID时出错:", error);
      return [];
    }
  }

  // 将Content转换为Book (向后兼容)
  private contentToBook(content: Content): Book {
    return {
      id: content.id,
      title: content.title,
      author: content.author ? content.author.join(", ") : undefined,
      description: content.description,
      url: content.url,
      coverUrl: content.cover_image_url,
      countries: content.countries || [],
      cities: content.cities || [],
      createdAt: content.created_at,
      updatedAt: content.updated_at,
      userId: content.user_id
    };
  }

  // 将Content转换为Podcast (向后兼容)
  private contentToPodcast(content: Content): Podcast {
    return {
      id: content.id,
      title: content.title,
      description: content.description,
      url: content.url,
      coverUrl: content.cover_image_url,
      audioUrl: content.external_resources && content.external_resources.length > 0 
        ? content.external_resources[0].url 
        : undefined,
      countries: content.countries || [],
      cities: content.cities || [],
      createdAt: content.created_at,
      updatedAt: content.updated_at,
      userId: content.user_id
    };
  }
}
