"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Country, City } from "@/types"
import { cn } from "@/lib/utils"
import { MultiSelect } from "@/components/ui/multi-select"
import { mapboxService } from "@/lib/mapbox/mapbox-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [activeTab, setActiveTab] = useState<string>(type)
  const [selectedLocations, setSelectedLocations] = useState<{ label: string; value: string; type: "city" | "country"; country_code?: string; country_name?: string }[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredLocations, setFilteredLocations] = useState<{ label: string; value: string; type: "city" | "country"; country_code?: string; country_name?: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [allLocations, setAllLocations] = useState<{ label: string; value: string; type: "city" | "country"; country_code?: string; country_name?: string }[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)

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

  // 初始化国家和城市数据
  useEffect(() => {
    // 将国家数据转换为下拉选项格式
    const countryOptions = countries.map(country => ({
      label: `${country.name} (国家)`,
      value: country.code,
      type: "country" as const
    }))
    
    setAllLocations(countryOptions)
    setFilteredLocations(countryOptions)
  }, [countries])

  // 搜索地点
  useEffect(() => {
    // 重置错误状态
    setSearchError(null)
    
    const searchLocations = async () => {
      if (searchTerm.trim().length < 2) {
        // 如果搜索词太短，只显示国家列表
        setFilteredLocations(allLocations)
        return
      }
      
      setIsSearching(true)
      
      try {
        // 使用 Mapbox 服务搜索地点
        const { countries, cities } = await mapboxService.searchLocations(searchTerm)
        
        // 转换为选项格式
        const countryOptions = countries.map(country => ({
          label: `${country.name} (国家)`,
          value: country.code,
          type: "country" as const
        }))
        
        const cityOptions = cities.map(city => ({
          label: `${city.name}, ${city.country_name} (城市)`,
          value: city.id,
          type: "city" as const,
          country_code: city.country_code,
          country_name: city.country_name
        }))
        
        // 合并结果并过滤掉已选择的项
        const searchResults = [...countryOptions, ...cityOptions]
          .filter(option => !selectedLocations.some(selected => selected.value === option.value))
        
        // 如果没有搜索结果，则显示所有国家
        if (searchResults.length === 0) {
          setFilteredLocations(allLocations.filter(
            option => option.label.toLowerCase().includes(searchTerm.toLowerCase())
          ))
        } else {
          setFilteredLocations(searchResults)
        }
      } catch (error) {
        console.error("搜索地点时出错:", error)
        // 设置错误信息
        setSearchError(error instanceof Error ? error.message : "搜索地点时出错")
        // 出错时显示本地过滤结果
        setFilteredLocations(allLocations.filter(
          option => option.label.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      } finally {
        setIsSearching(false)
      }
    }
    
    // 使用防抖处理搜索
    const debounceTimeout = setTimeout(searchLocations, 300)
    
    return () => clearTimeout(debounceTimeout)
  }, [searchTerm, allLocations, selectedLocations])

  // 当选项卡变更时，重置表单
  useEffect(() => {
    if (activeTab === "book") {
      bookForm.reset()
    } else {
      podcastForm.reset()
    }
    setSelectedLocations([])
    setSearchError(null)
  }, [activeTab])

  // 处理表单提交
  const handleSubmit = (formData: any) => {
    // 将选中的地点转换为需要的格式
    const cities = selectedLocations
      .filter(item => item.type === "city")
      .map(item => ({
        id: item.value,
        name: item.label.split(',')[0].trim(),
        country_code: item.country_code || "",
        country_name: item.country_name || ""
      }))
    
    // 对于国家，找到该国家的所有城市
    const countryCodes = selectedLocations
      .filter(item => item.type === "country")
      .map(item => item.value)
    
    // 添加该国家的所有城市
    const citiesFromCountries = cities.length > 0 
      ? [] 
      : cities.concat(
          cities.filter(city => 
            countryCodes.includes(city.country_code) && 
            !cities.some(c => c.id === city.id)
          )
        )
    
    const formattedData = {
      ...formData,
      cities: cities.length > 0 ? cities : citiesFromCountries
    }
    
    onSubmit(formattedData)
  }

  // 处理多选变更
  const handleMultiSelectChange = (selected: { label: string; value: string; type: "city" | "country"; country_code?: string; country_name?: string }[]) => {
    setSelectedLocations(selected)
    
    // 更新表单的 cities 字段
    const cities = selected
      .filter(item => item.type === "city")
      .map(item => ({
        id: item.value,
        name: item.label.split(',')[0].trim(),
        country_code: item.country_code || "",
        country_name: item.country_name || ""
      }))
    
    if (activeTab === "book") {
      bookForm.setValue("cities", cities)
    } else {
      podcastForm.setValue("cities", cities)
    }
  }

  // 加载国家的城市
  const loadCitiesForCountry = async (countryCode: string, countryName: string) => {
    try {
      setIsSearching(true)
      setSearchError(null)
      
      const cities = await mapboxService.getCitiesByCountry(countryCode)
      
      // 转换为选项格式
      const cityOptions = cities.map(city => ({
        label: `${city.name}, ${city.country_name} (城市)`,
        value: city.id,
        type: "city" as const,
        country_code: city.country_code,
        country_name: city.country_name
      }))
      
      // 过滤掉已选择的项
      const filteredCities = cityOptions.filter(
        option => !selectedLocations.some(selected => selected.value === option.value)
      )
      
      // 更新过滤后的地点列表
      setFilteredLocations(filteredCities)
    } catch (error) {
      console.error(`加载 ${countryName} 的城市时出错:`, error)
      setSearchError(`加载 ${countryName} 的城市时出错`)
    } finally {
      setIsSearching(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">
            {activeTab === "book" ? "添加书籍" : "添加播客"}
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
        
        <Tabs
          defaultValue={type}
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="book" className="z-50">书籍</TabsTrigger>
            <TabsTrigger value="podcast" className="z-50">播客</TabsTrigger>
          </TabsList>
          
          <TabsContent value="book" className="z-40">
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
              
              <div className="space-y-2">
                <Label>关联地点 *</Label>
                <div className="relative">
                  <div className="relative">
                    <Input
                      placeholder="搜索国家或城市..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-2"
                    />
                    {isSearching && (
                      <div className="absolute right-2 top-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {searchError && (
                    <Alert variant="destructive" className="mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{searchError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="z-40 relative">
                    <MultiSelect
                      options={filteredLocations}
                      selected={selectedLocations}
                      onChange={handleMultiSelectChange}
                    />
                  </div>
                </div>
                {bookForm.formState.errors.cities && (
                  <p className="text-sm text-red-500">{bookForm.formState.errors.cities.message}</p>
                )}
                <p className="text-xs text-gray-500">可以选择城市或国家，选择国家将关联该国家的所有城市</p>
                
                {/* 显示已选择的国家，并提供加载该国家城市的按钮 */}
                {selectedLocations.filter(item => item.type === "country").length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">已选择的国家:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedLocations
                        .filter(item => item.type === "country")
                        .map(country => (
                          <Button
                            key={country.value}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs py-0 h-6"
                            onClick={() => loadCitiesForCountry(country.value, country.label.split(' ')[0])}
                            disabled={isSearching}
                          >
                            加载 {country.label.split(' ')[0]} 的城市
                            {isSearching && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(isLoading && "opacity-70 cursor-not-allowed")}
                >
                  {isLoading ? "提交中..." : "确认"}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="podcast" className="z-40">
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
              
              <div className="space-y-2">
                <Label>关联地点 *</Label>
                <div className="relative">
                  <div className="relative">
                    <Input
                      placeholder="搜索国家或城市..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-2"
                    />
                    {isSearching && (
                      <div className="absolute right-2 top-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {searchError && (
                    <Alert variant="destructive" className="mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{searchError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="z-40 relative">
                    <MultiSelect
                      options={filteredLocations}
                      selected={selectedLocations}
                      onChange={handleMultiSelectChange}
                    />
                  </div>
                </div>
                {podcastForm.formState.errors.cities && (
                  <p className="text-sm text-red-500">{podcastForm.formState.errors.cities.message}</p>
                )}
                <p className="text-xs text-gray-500">可以选择城市或国家，选择国家将关联该国家的所有城市</p>
                
                {/* 显示已选择的国家，并提供加载该国家城市的按钮 */}
                {selectedLocations.filter(item => item.type === "country").length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">已选择的国家:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedLocations
                        .filter(item => item.type === "country")
                        .map(country => (
                          <Button
                            key={country.value}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs py-0 h-6"
                            onClick={() => loadCitiesForCountry(country.value, country.label.split(' ')[0])}
                            disabled={isSearching}
                          >
                            加载 {country.label.split(' ')[0]} 的城市
                            {isSearching && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(isLoading && "opacity-70 cursor-not-allowed")}
                >
                  {isLoading ? "提交中..." : "确认"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
