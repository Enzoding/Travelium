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
  isLoading: externalLoading = false
}: AddContentFormProps) {
  // 城市搜索状态
  const [selectedCities, setSelectedCities] = useState<City[]>([])
  
  // 搜索状态
  const [citySearchTerm, setCitySearchTerm] = useState("")
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [isSearchingCity, setIsSearchingCity] = useState(false)
  const [citySearchError, setCitySearchError] = useState<string | null>(null)
  const [showCityResults, setShowCityResults] = useState(false)
  
  // 本地加载状态
  const [localLoading, setLocalLoading] = useState(false)
  
  // 强制重置外部加载状态的影响
  const [forceReady, setForceReady] = useState(false)
  
  // 计算实际的加载状态
  const isActuallyLoading = forceReady ? localLoading : (externalLoading || localLoading)

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

  // 初始化时重置表单和状态
  useEffect(() => {
    if (isOpen) {
      if (type === "book") {
        bookForm.reset()
      } else {
        podcastForm.reset()
      }
      setSelectedCities([])
      setCitySearchError(null)
      setLocalLoading(false)
      
      // 打开弹窗时强制重置加载状态
      setForceReady(true)
    }
  }, [type, isOpen])

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
        // 搜索所有城市
        const result = await mapboxService.searchLocations(citySearchTerm, ["place"])
        const cities = result.cities
        
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
  }, [citySearchTerm, selectedCities])

  // 选择城市
  const handleSelectCity = (city: City) => {
    setSelectedCities(prev => [...prev, city])
    setCitySearchTerm("")
    setShowCityResults(false)
    
    // 更新表单值
    const updatedCities = [...selectedCities, city]
    if (type === "book") {
      bookForm.setValue("cities", updatedCities)
      bookForm.trigger("cities")
    } else {
      podcastForm.setValue("cities", updatedCities)
      podcastForm.trigger("cities")
    }
  }

  // 移除已选择的城市
  const handleRemoveCity = (cityId: string) => {
    const updatedCities = selectedCities.filter(city => city.id !== cityId)
    setSelectedCities(updatedCities)
    
    // 更新表单值
    if (type === "book") {
      bookForm.setValue("cities", updatedCities)
      bookForm.trigger("cities")
    } else {
      podcastForm.setValue("cities", updatedCities)
      podcastForm.trigger("cities")
    }
  }

  // 处理表单提交
  const handleSubmit = (data: BookFormValues | PodcastFormValues) => {
    // 确保城市数据正确
    const formData = {
      ...data,
      cities: selectedCities
    }
    setLocalLoading(true)
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-sky-50 to-indigo-50">
          <h2 className="text-xl font-semibold text-gray-800">
            {type === "book" ? "添加书籍" : "添加播客"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-200/70">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-5">
          <form onSubmit={type === "book" ? bookForm.handleSubmit(handleSubmit) : podcastForm.handleSubmit(handleSubmit)}>
            {/* 标题字段 */}
            <div className="mb-5">
              <Label htmlFor="title" className="flex items-center text-sm font-medium text-gray-700">
                标题
                <span className="text-red-500 ml-1">*</span>
                <span className="ml-1 text-xs text-gray-400">(必填)</span>
              </Label>
              <Input
                id="title"
                {...(type === "book" ? bookForm.register("title") : podcastForm.register("title"))}
                className="mt-1.5 border-gray-300 focus:border-primary focus:ring-primary"
                placeholder="输入标题"
              />
              {type === "book" && bookForm.formState.errors.title && (
                <p className="text-red-500 text-sm mt-1.5 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {bookForm.formState.errors.title.message}
                </p>
              )}
              {type === "podcast" && podcastForm.formState.errors.title && (
                <p className="text-red-500 text-sm mt-1.5 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {podcastForm.formState.errors.title.message}
                </p>
              )}
            </div>
            
            {/* 作者字段 (仅书籍) */}
            {type === "book" && (
              <div className="mb-5">
                <Label htmlFor="author" className="text-sm font-medium text-gray-700">作者</Label>
                <Input
                  id="author"
                  {...bookForm.register("author")}
                  className="mt-1.5 border-gray-300 focus:border-primary focus:ring-primary"
                  placeholder="输入作者"
                />
                {bookForm.formState.errors.author && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center">
                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                    {bookForm.formState.errors.author.message}
                  </p>
                )}
              </div>
            )}
            
            {/* 描述字段 */}
            <div className="mb-5">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">描述</Label>
              <Textarea
                id="description"
                {...(type === "book" ? bookForm.register("description") : podcastForm.register("description"))}
                className="mt-1.5 border-gray-300 focus:border-primary focus:ring-primary min-h-[100px]"
                placeholder="输入描述"
              />
            </div>
            
            {/* URL字段 */}
            <div className="mb-5">
              <Label htmlFor="url" className="text-sm font-medium text-gray-700">链接</Label>
              <Input
                id="url"
                {...(type === "book" ? bookForm.register("url") : podcastForm.register("url"))}
                className="mt-1.5 border-gray-300 focus:border-primary focus:ring-primary"
                placeholder="输入链接"
              />
            </div>
            
            {/* 关联地点 */}
            <div className="mb-5">
              <Label className="flex items-center text-sm font-medium text-gray-700">
                关联地点
                <span className="text-red-500 ml-1">*</span>
                <span className="ml-1 text-xs text-gray-400">(必填)</span>
              </Label>
              
              {/* 城市搜索 */}
              <div className="mt-1.5 relative">
                <div className="relative">
                  <Input
                    placeholder="搜索城市..."
                    value={citySearchTerm}
                    onChange={(e) => {
                      setCitySearchTerm(e.target.value)
                      if (e.target.value.length >= 2) {
                        setShowCityResults(true)
                      } else {
                        setShowCityResults(false)
                      }
                    }}
                    onFocus={() => citySearchTerm.length >= 2 && setShowCityResults(true)}
                    onBlur={() => setTimeout(() => setShowCityResults(false), 200)}
                    className="pr-10 border-gray-300 focus:border-primary focus:ring-primary"
                  />
                  {isSearchingCity && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* 城市搜索结果 */}
                {showCityResults && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {isSearchingCity && (
                      <div className="p-3 text-center text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                        搜索中...
                      </div>
                    )}
                    
                    {citySearchError && (
                      <div className="p-3 text-center text-red-500">
                        <AlertCircle className="h-5 w-5 inline mr-2" />
                        {citySearchError}
                      </div>
                    )}
                    
                    {!isSearchingCity && !citySearchError && filteredCities.length === 0 && citySearchTerm.length >= 2 && (
                      <div className="p-3 text-center text-gray-500">
                        未找到匹配的城市
                      </div>
                    )}
                    
                    {filteredCities.map((city) => (
                      <div
                        key={city.id}
                        className="p-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                        onMouseDown={() => handleSelectCity(city)}
                      >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-gray-500">{city.country_name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 已选择的城市 */}
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedCities.map((city) => (
                  <Badge 
                    key={city.id} 
                    variant="secondary" 
                    className="flex items-center gap-1 bg-gradient-to-r from-sky-50 to-indigo-50 text-gray-700 border border-gray-200 py-1.5 px-3"
                  >
                    <span className="font-medium">{city.name}</span>
                    <span className="text-gray-500 text-xs">{city.country_name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 ml-1 hover:bg-gray-200/70 rounded-full"
                      onClick={() => handleRemoveCity(city.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              
              {/* 城市验证错误 */}
              {type === "book" && bookForm.formState.errors.cities && (
                <p className="text-red-500 text-sm mt-1.5 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {bookForm.formState.errors.cities.message}
                </p>
              )}
              {type === "podcast" && podcastForm.formState.errors.cities && (
                <p className="text-red-500 text-sm mt-1.5 flex items-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  {podcastForm.formState.errors.cities.message}
                </p>
              )}
            </div>
            
            {/* 提交按钮 */}
            <div className="mt-6">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-medium py-2.5" 
                disabled={isActuallyLoading}
              >
                {isActuallyLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    保存
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
