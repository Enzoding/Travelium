// Mapbox 服务用于获取地理数据
import { City, Country } from "@/types"

// Mapbox API 接口
interface MapboxFeature {
  id: string
  place_name: string
  place_type: string[]
  properties: {
    short_code?: string
    wikidata?: string
  }
  text: string
  center: [number, number]
  context?: {
    id: string
    text: string
    wikidata?: string
    short_code?: string
  }[]
}

interface MapboxResponse {
  features: MapboxFeature[]
}

// 默认的 Mapbox 访问令牌，应该从环境变量中获取
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""

export class MapboxService {
  private accessToken: string

  constructor(accessToken: string = MAPBOX_ACCESS_TOKEN) {
    this.accessToken = accessToken
    console.log("Mapbox 服务初始化，Token 长度:", this.accessToken ? this.accessToken.length : 0)
  }

  /**
   * 搜索国家和城市
   * @param query 搜索关键词
   * @param types 搜索类型，可以是 country, place 等
   * @param limit 返回结果数量限制
   * @returns 国家和城市数据
   */
  async searchLocations(
    query: string,
    types: string[] = ["country", "place"],
    limit: number = 10
  ): Promise<{ countries: Country[], cities: City[] }> {
    try {
      if (!query.trim()) {
        return { countries: [], cities: [] }
      }

      if (!this.accessToken) {
        console.error("Mapbox Token 未配置")
        throw new Error("Mapbox Token 未配置")
      }

      const typesParam = types.join(",")
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${this.accessToken}&types=${typesParam}&limit=${limit}`

      console.log("Mapbox API 请求 URL:", url.replace(this.accessToken, "TOKEN_HIDDEN"))

      const response = await fetch(url)
      console.log("Mapbox API 响应状态:", response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Mapbox API 错误响应:", errorText)
        throw new Error(`Mapbox API 请求失败: ${response.statusText}`)
      }

      const data: MapboxResponse = await response.json()
      console.log("Mapbox API 响应数据:", JSON.stringify(data).substring(0, 200) + "...")
      
      // 解析结果
      const countries: Country[] = []
      const cities: City[] = []

      data.features.forEach(feature => {
        if (feature.place_type.includes("country")) {
          // 处理国家
          const countryCode = feature.properties.short_code?.toUpperCase()
          if (countryCode) {
            countries.push({
              code: countryCode,
              name: feature.text
            })
          }
        } else if (feature.place_type.includes("place")) {
          // 处理城市
          // 从上下文中找到国家信息
          const countryContext = feature.context?.find(ctx => 
            ctx.id.startsWith("country.")
          )
          
          if (countryContext) {
            const countryCode = countryContext.short_code?.toUpperCase()
            const countryName = countryContext.text
            
            if (countryCode && countryName) {
              cities.push({
                id: feature.id,
                name: feature.text,
                country_code: countryCode,
                country_name: countryName
              })
            }
          }
        }
      })

      console.log(`搜索结果: ${countries.length} 个国家, ${cities.length} 个城市`)
      return { countries, cities }
    } catch (error) {
      console.error("搜索地点时出错:", error)
      throw error
    }
  }

  /**
   * 获取所有国家
   * @returns 国家列表
   */
  async getAllCountries(): Promise<Country[]> {
    try {
      if (!this.accessToken) {
        console.error("Mapbox Token 未配置")
        throw new Error("Mapbox Token 未配置")
      }

      // 使用 Mapbox 的 Geocoding API 获取国家列表
      // 注意：这个方法可能不是最佳实践，因为 Mapbox 没有专门的 API 来获取所有国家
      // 实际应用中可能需要使用其他数据源或缓存国家列表
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/.json?access_token=${this.accessToken}&types=country&limit=200`
      
      console.log("获取国家列表 API 请求 URL:", url.replace(this.accessToken, "TOKEN_HIDDEN"))

      const response = await fetch(url)
      console.log("获取国家列表 API 响应状态:", response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("获取国家列表 API 错误响应:", errorText)
        throw new Error(`Mapbox API 请求失败: ${response.statusText}`)
      }

      const data: MapboxResponse = await response.json()
      
      const countries = data.features
        .filter(feature => feature.properties.short_code)
        .map(feature => ({
          code: feature.properties.short_code!.toUpperCase(),
          name: feature.text
        }))

      console.log(`获取到 ${countries.length} 个国家`)
      return countries
    } catch (error) {
      console.error("获取国家列表时出错:", error)
      throw error
    }
  }

  /**
   * 获取国家的主要城市
   * @param countryCode 国家代码
   * @param limit 返回结果数量限制
   * @returns 城市列表
   */
  async getCitiesByCountry(countryCode: string, limit: number = 20): Promise<City[]> {
    try {
      if (!this.accessToken) {
        console.error("Mapbox Token 未配置")
        throw new Error("Mapbox Token 未配置")
      }

      // 使用 Mapbox 的 Geocoding API 获取国家的主要城市
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${countryCode}.json?access_token=${this.accessToken}&types=place&limit=${limit}`
      
      console.log("获取城市列表 API 请求 URL:", url.replace(this.accessToken, "TOKEN_HIDDEN"))

      const response = await fetch(url)
      console.log("获取城市列表 API 响应状态:", response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("获取城市列表 API 错误响应:", errorText)
        throw new Error(`Mapbox API 请求失败: ${response.statusText}`)
      }

      const data: MapboxResponse = await response.json()
      
      // 找到国家名称
      const countryFeature = data.features.find(f => 
        f.place_type.includes("country") && 
        f.properties.short_code?.toUpperCase() === countryCode
      )
      
      if (!countryFeature) {
        console.log(`未找到国家代码为 ${countryCode} 的国家`)
        return []
      }
      
      const countryName = countryFeature.text
      
      // 过滤出城市
      const cities = data.features
        .filter(feature => feature.place_type.includes("place"))
        .map(feature => ({
          id: feature.id,
          name: feature.text,
          country_code: countryCode,
          country_name: countryName
        }))

      console.log(`获取到 ${cities.length} 个城市，国家: ${countryName}`)
      return cities
    } catch (error) {
      console.error(`获取 ${countryCode} 的城市列表时出错:`, error)
      throw error
    }
  }

  /**
   * 根据国家代码和查询词搜索城市
   * @param countryCode 国家代码
   * @param query 搜索关键词
   * @param limit 返回结果数量限制
   * @returns 城市列表
   */
  async getCitiesByCountryAndQuery(countryCode: string, query: string, limit: number = 10): Promise<City[]> {
    try {
      if (!this.accessToken) {
        console.error("Mapbox Token 未配置")
        throw new Error("Mapbox Token 未配置")
      }

      // 使用 Mapbox 的 Geocoding API 获取符合查询条件的城市，并限制在指定国家内
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.accessToken}&types=place&country=${countryCode.toLowerCase()}&limit=${limit}`
      
      console.log("根据国家和查询词搜索城市 API 请求 URL:", url.replace(this.accessToken, "TOKEN_HIDDEN"))

      const response = await fetch(url)
      console.log("根据国家和查询词搜索城市 API 响应状态:", response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("根据国家和查询词搜索城市 API 错误响应:", errorText)
        throw new Error(`Mapbox API 请求失败: ${response.statusText}`)
      }

      const data: MapboxResponse = await response.json()
      
      // 解析城市数据
      const cities: City[] = []
      
      data.features.forEach(feature => {
        if (feature.place_type.includes("place")) {
          // 从上下文中找到国家信息
          const countryContext = feature.context?.find(ctx => 
            ctx.id.startsWith("country.")
          )
          
          if (countryContext) {
            const countryCode = countryContext.short_code?.toUpperCase()
            const countryName = countryContext.text
            
            if (countryCode && countryName) {
              cities.push({
                id: feature.id,
                name: feature.text,
                country_code: countryCode,
                country_name: countryName
              })
            }
          }
        }
      })

      console.log(`根据国家 ${countryCode} 和查询词 "${query}" 搜索到 ${cities.length} 个城市`)
      return cities
    } catch (error) {
      console.error(`根据国家 ${countryCode} 和查询词 "${query}" 搜索城市时出错:`, error)
      throw error
    }
  }
}

// 创建单例实例
export const mapboxService = new MapboxService()
