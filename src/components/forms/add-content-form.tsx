"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, Loader2, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Country, City } from "@/types"
import { cn } from "@/lib/utils"
import { mapboxService } from "@/lib/mapbox/mapbox-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

// 书籍表单验证模式
const bookSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  author: z.string().optional(),
  description: z.string().optional(),
  url: z.string().optional(),
  cities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    country_code: z.string(),
    country_name: z.string()
  })).min(1, "至少选择一个地点")
})

// 播客表单验证模式
const podcastSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
  url: z.string().optional(),
  cities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    country_code: z.string(),
    country_name: z.string()
  })).min(1, "至少选择一个地点")
})

type BookFormValues = z.infer<typeof bookSchema>
type PodcastFormValues = z.infer<typeof podcastSchema>

interface AddContentFormProps {
  type: "book" | "podcast"
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: BookFormValues | PodcastFormValues) => void
  countries: Country[]
  isLoading?: boolean
}

export function AddContentForm({
  type,
  isOpen,
  onClose,
  onSubmit,
  countries,
  isLoading = false
}: AddContentFormProps) {
  // 国家和城市搜索状态
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string } | null>(null)
  const [selectedCities, setSelectedCities] = useState<City[]>([])
  
  // 搜索状态
  const [countrySearchTerm, setCountrySearchTerm] = useState("")
  const [citySearchTerm, setCitySearchTerm] = useState("")
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [isSearchingCountry, setIsSearchingCountry] = useState(false)
  const [isSearchingCity, setIsSearchingCity] = useState(false)
  const [countrySearchError, setCountrySearchError] = useState<string | null>(null)
  const [citySearchError, setCitySearchError] = useState<string | null>(null)
  const [showCountryResults, setShowCountryResults] = useState(false)
  const [showCityResults, setShowCityResults] = useState(false)

  // 书籍表单
  const bookForm = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      url: "",
      cities: []
    }
  })

  // 播客表单
  const podcastForm = useForm<PodcastFormValues>({
    resolver: zodResolver(podcastSchema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
      cities: []
    }
  })

  // 初始化时重置表单
  useEffect(() => {
    if (type === "book") {
      bookForm.reset()
    } else {
      podcastForm.reset()
    }
    setSelectedCountry(null)
    setSelectedCities([])
    setCountrySearchError(null)
    setCitySearchError(null)
  }, [type])

  // 搜索国家
  useEffect(() => {
    setCountrySearchError(null)
    
    const searchCountries = async () => {
      if (countrySearchTerm.trim().length < 2) {
        setFilteredCountries([])
        return
      }
      
      setIsSearchingCountry(true)
      
      try {
        // 本地过滤国家列表
        const filtered = countries.filter(country => 
          country.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
        )
        setFilteredCountries(filtered)
      } catch (error) {
        console.error("搜索国家时出错:", error)
        setCountrySearchError(error instanceof Error ? error.message : "搜索国家时出错")
        setFilteredCountries([])
      } finally {
        setIsSearchingCountry(false)
      }
    }
    
    const debounceTimeout = setTimeout(searchCountries, 200)
    return () => clearTimeout(debounceTimeout)
  }, [countrySearchTerm, countries])

  // 搜索城市
  useEffect(() => {
    setCitySearchError(null)
    
    const searchCities = async () => {
      if (citySearchTerm.trim().length < 2) {
        setFilteredCities([])
        return
      }
      
      setIsSearchingCity(true)
      
      try {
        let cities: City[] = []
        
        if (selectedCountry) {
          // 如果已选择国家，只搜索该国家内的城市
          cities = await mapboxService.getCitiesByCountryAndQuery(
            selectedCountry.code, 
            citySearchTerm,
            10 // 限制结果数量为10个
          )
        } else {
          // 否则搜索所有城市
          const result = await mapboxService.searchLocations(citySearchTerm, ["place"])
          cities = result.cities
        }
        
        // 过滤掉已选择的城市
        const filtered = cities.filter(city => 
          !selectedCities.some(selected => selected.id === city.id)
        )
        
        setFilteredCities(filtered)
      } catch (error) {
        console.error("搜索城市时出错:", error)
        setCitySearchError(error instanceof Error ? error.message : "搜索城市时出错")
        setFilteredCities([])
      } finally {
        setIsSearchingCity(false)
      }
    }
    
    const debounceTimeout = setTimeout(searchCities, 200)
    return () => clearTimeout(debounceTimeout)
  }, [citySearchTerm, selectedCountry, selectedCities])

  // 选择国家
  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country)
    setCountrySearchTerm("")
    setShowCountryResults(false)
    
    // 清空已选择的城市，因为国家变了
    setSelectedCities([])
    updateFormCities([])
  }

  // 选择城市
  const handleSelectCity = (city: City) => {
    // 如果城市已经被选中，不做任何操作
    if (selectedCities.some(selected => selected.id === city.id)) {
      return
    }
    
    const newSelectedCities = [...selectedCities, city]
    setSelectedCities(newSelectedCities)
    setCitySearchTerm("")
    setShowCityResults(false)
    
    // 如果没有选择国家，自动设置为该城市的国家
    if (!selectedCountry && city.country_code) {
      const cityCountry = countries.find(country => country.code === city.country_code)
      if (cityCountry) {
        setSelectedCountry(cityCountry)
      }
    }
    
    // 更新表单
    updateFormCities(newSelectedCities)
  }

  // 移除城市
  const handleRemoveCity = (cityId: string) => {
    const newSelectedCities = selectedCities.filter(city => city.id !== cityId)
    setSelectedCities(newSelectedCities)
    
    // 如果移除了所有城市，也清除国家选择
    if (newSelectedCities.length === 0) {
      setSelectedCountry(null)
    }
    
    // 更新表单
    updateFormCities(newSelectedCities)
  }

  // 更新表单中的城市
  const updateFormCities = (cities: City[]) => {
    if (type === "book") {
      bookForm.setValue("cities", cities)
      // 触发验证
      bookForm.trigger("cities")
    } else {
      podcastForm.setValue("cities", cities)
      // 触发验证
      podcastForm.trigger("cities")
    }
  }

  // 处理表单提交
  const handleSubmit = (formData: any) => {
    const formattedData = {
      ...formData,
      cities: selectedCities
    }
    
    onSubmit(formattedData)
  }

  if (!isOpen) return null

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">
            {type === "book" ? "添加书籍" : "添加播客"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {type === "book" ? (
          <form onSubmit={bookForm.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="book-title">名称 *</Label>
              <Input
                id="book-title"
                placeholder="输入书籍名称"
                {...bookForm.register("title")}
              />
              {bookForm.formState.errors.title && (
                <p className="text-sm text-red-500">{bookForm.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="book-author">作者</Label>
              <Input
                id="book-author"
                placeholder="输入作者名称"
                {...bookForm.register("author")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="book-description">描述</Label>
              <Textarea
                id="book-description"
                placeholder="输入书籍描述"
                className="resize-none"
                {...bookForm.register("description")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="book-url">链接</Label>
              <Input
                id="book-url"
                placeholder="输入书籍链接"
                {...bookForm.register("url")}
              />
            </div>
            
            <div className="space-y-4">
              <Label>关联地点 *</Label>
              
              {/* 国家搜索 */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder={selectedCountry ? selectedCountry.name : "搜索国家..."}
                    value={countrySearchTerm}
                    onChange={(e) => {
                      setCountrySearchTerm(e.target.value)
                      setShowCountryResults(true)
                    }}
                    onFocus={() => setShowCountryResults(true)}
                    className={selectedCountry ? "pl-8" : ""}
                  />
                  {selectedCountry && (
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                  {isSearchingCountry && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    </div>
                  )}
                </div>
                
                {countrySearchError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{countrySearchError}</AlertDescription>
                  </Alert>
                )}
                
                {/* 国家搜索结果 */}
                {showCountryResults && filteredCountries.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {filteredCountries.map((country) => (
                        <div
                          key={country.code}
                          className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                          onClick={() => handleSelectCountry(country)}
                        >
                          <span>{country.name}</span>
                          {selectedCountry?.code === country.code && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* 城市搜索 */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder={`搜索${selectedCountry ? selectedCountry.name + '的' : ''}城市...`}
                    value={citySearchTerm}
                    onChange={(e) => {
                      setCitySearchTerm(e.target.value)
                      setShowCityResults(true)
                    }}
                    onFocus={() => setShowCityResults(true)}
                  />
                  {isSearchingCity && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    </div>
                  )}
                </div>
                
                {citySearchError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{citySearchError}</AlertDescription>
                  </Alert>
                )}
                
                {/* 城市搜索结果 */}
                {showCityResults && filteredCities.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {filteredCities.map((city) => (
                        <div
                          key={city.id}
                          className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectCity(city)}
                        >
                          {city.name}, {city.country_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 已选择的城市列表 */}
                {selectedCities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCities.map((city) => (
                      <Badge key={city.id} variant="secondary" className="flex items-center gap-1">
                        {city.name}, {city.country_name}
                        <button
                          type="button"
                          onClick={() => handleRemoveCity(city.id)}
                          className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">移除 {city.name}</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  {selectedCountry 
                    ? `输入城市名称搜索${selectedCountry.name}的城市，至少输入2个字符` 
                    : "输入城市名称进行搜索，至少输入2个字符"}
                </p>
                
                {bookForm.formState.errors.cities && (
                  <p className="text-sm text-red-500 mt-1">{bookForm.formState.errors.cities.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : "确认"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={podcastForm.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="podcast-title">名称 *</Label>
              <Input
                id="podcast-title"
                placeholder="输入播客名称"
                {...podcastForm.register("title")}
              />
              {podcastForm.formState.errors.title && (
                <p className="text-sm text-red-500">{podcastForm.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="podcast-description">描述</Label>
              <Textarea
                id="podcast-description"
                placeholder="输入播客描述"
                className="resize-none"
                {...podcastForm.register("description")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="podcast-url">链接</Label>
              <Input
                id="podcast-url"
                placeholder="输入播客链接"
                {...podcastForm.register("url")}
              />
            </div>
            
            <div className="space-y-4">
              <Label>关联地点 *</Label>
              
              {/* 国家搜索 */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder={selectedCountry ? selectedCountry.name : "搜索国家..."}
                    value={countrySearchTerm}
                    onChange={(e) => {
                      setCountrySearchTerm(e.target.value)
                      setShowCountryResults(true)
                    }}
                    onFocus={() => setShowCountryResults(true)}
                    className={selectedCountry ? "pl-8" : ""}
                  />
                  {selectedCountry && (
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                  {isSearchingCountry && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    </div>
                  )}
                </div>
                
                {countrySearchError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{countrySearchError}</AlertDescription>
                  </Alert>
                )}
                
                {/* 国家搜索结果 */}
                {showCountryResults && filteredCountries.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {filteredCountries.map((country) => (
                        <div
                          key={country.code}
                          className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                          onClick={() => handleSelectCountry(country)}
                        >
                          <span>{country.name}</span>
                          {selectedCountry?.code === country.code && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* 城市搜索 */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder={`搜索${selectedCountry ? selectedCountry.name + '的' : ''}城市...`}
                    value={citySearchTerm}
                    onChange={(e) => {
                      setCitySearchTerm(e.target.value)
                      setShowCityResults(true)
                    }}
                    onFocus={() => setShowCityResults(true)}
                  />
                  {isSearchingCity && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    </div>
                  )}
                </div>
                
                {citySearchError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{citySearchError}</AlertDescription>
                  </Alert>
                )}
                
                {/* 城市搜索结果 */}
                {showCityResults && filteredCities.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {filteredCities.map((city) => (
                        <div
                          key={city.id}
                          className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectCity(city)}
                        >
                          {city.name}, {city.country_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 已选择的城市列表 */}
                {selectedCities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCities.map((city) => (
                      <Badge key={city.id} variant="secondary" className="flex items-center gap-1">
                        {city.name}, {city.country_name}
                        <button
                          type="button"
                          onClick={() => handleRemoveCity(city.id)}
                          className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">移除 {city.name}</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-1">
                  {selectedCountry 
                    ? `输入城市名称搜索${selectedCountry.name}的城市，至少输入2个字符` 
                    : "输入城市名称进行搜索，至少输入2个字符"}
                </p>
                
                {podcastForm.formState.errors.cities && (
                  <p className="text-sm text-red-500 mt-1">{podcastForm.formState.errors.cities.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : "确认"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
