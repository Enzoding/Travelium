"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { Book, Podcast } from "@/types"
import GlobeMap from "@/components/map/globe-map"
import { AddContentForm } from "@/components/forms/add-content-form"
import { AppMenubar } from "@/components/layout/app-menubar"

export default function Home() {
  const { user } = useAuth()
  const { 
    books, 
    podcasts, 
    countries, 
    addBook, 
    addPodcast, 
    isLoading,
    fetchBooks,
    fetchPodcasts,
    fetchCountries
  } = useData()
  
  const [showUserItems, setShowUserItems] = useState(false)
  const [showBooks, setShowBooks] = useState(true)
  const [showPodcasts, setShowPodcasts] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addContentType, setAddContentType] = useState<"book" | "podcast" | null>(null)
  const [selectedItem, setSelectedItem] = useState<{
    type: "book" | "podcast";
    item: Book | Podcast;
  } | null>(null)
  
  // 使用 ref 来跟踪数据是否已加载，避免重复加载
  const dataLoadedRef = useRef(false)
  
  // 当用户登录状态变化时加载数据，使用 ref 避免重复加载
  useEffect(() => {
    // 只在用户存在且数据未加载时加载数据
    if (user && !dataLoadedRef.current) {
      console.log("用户已登录，开始加载数据...", user.id)
      
      // 标记数据已开始加载
      dataLoadedRef.current = true
      
      // 创建一个异步函数来处理数据加载
      const loadData = async () => {
        try {
          // 按顺序加载数据，避免并发请求过多
          await fetchCountries()
          await fetchBooks()
          await fetchPodcasts()
          console.log("数据加载完成")
        } catch (error) {
          console.error("数据加载失败:", error)
          // 如果加载失败，重置标记以便下次可以重试
          dataLoadedRef.current = false
        }
      }
      
      // 执行数据加载
      loadData()
    }
  }, [user, fetchBooks, fetchPodcasts, fetchCountries])
  
  // 过滤用户的书籍和播客
  const userBooks = showUserItems && user ? books.filter(book => book.userId === user.id) : books
  const userPodcasts = showUserItems && user ? podcasts.filter(podcast => podcast.userId === user.id) : podcasts
  
  // 根据显示选项过滤内容
  const filteredBooks = showBooks ? userBooks : []
  const filteredPodcasts = showPodcasts ? userPodcasts : []
  
  // 所有要显示的国家代码
  const countriesToShow = new Set<string>()
  
  if (showBooks) {
    filteredBooks.forEach(book => {
      // 从城市中获取国家代码
      book.cities.forEach(city => {
        countriesToShow.add(city.country_code)
      })
    })
  }
  
  if (showPodcasts) {
    filteredPodcasts.forEach(podcast => {
      // 从城市中获取国家代码
      podcast.cities.forEach(city => {
        countriesToShow.add(city.country_code)
      })
    })
  }
  
  // 处理添加书籍
  const handleAddBook = async (book: any) => {
    if (!user) return
    await addBook(book)
    setAddContentType(null)
    setAddDialogOpen(false)
  }
  
  // 处理添加播客
  const handleAddPodcast = async (podcast: any) => {
    if (!user) return
    await addPodcast(podcast)
    setAddContentType(null)
    setAddDialogOpen(false)
  }
  
  // 打开添加内容对话框
  const openAddDialog = () => {
    setAddContentType("book")
    setAddDialogOpen(true)
  }
  
  // 关闭添加对话框
  const closeAddDialog = () => {
    setAddDialogOpen(false)
    setAddContentType(null)
  }
  
  // 处理表单提交
  const handleFormSubmit = (data: any) => {
    if (addContentType === "book") {
      handleAddBook(data)
    } else if (addContentType === "podcast") {
      handleAddPodcast(data)
    }
  }
  
  // 处理国家点击
  const handleCountryClick = (countryCode: string) => {
    console.log("点击了国家:", countryCode)
    
    // 查找与该国家相关的书籍和播客（通过城市的国家代码）
    const relatedBooks = filteredBooks.filter(book => 
      book.cities.some(city => city.country_code === countryCode)
    )
    
    const relatedPodcasts = filteredPodcasts.filter(podcast => 
      podcast.cities.some(city => city.country_code === countryCode)
    )
    
    // 这里可以显示相关内容列表或其他交互
    console.log(`相关书籍: ${relatedBooks.length}, 相关播客: ${relatedPodcasts.length}`)
  }
  
  // 处理国家悬停
  const handleCountryHover = (countryCode: string) => {
    console.log("悬停在国家:", countryCode)
    // 这里可以显示国家名称或相关信息的提示
  }

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 relative overflow-hidden">
        {/* 标题放在地球仪画布左上方 */}
        <div className="absolute top-4 left-4 z-10">
          <h1 className="text-2xl font-bold text-primary">
            Travelium
          </h1>
        </div>
        
        <GlobeMap 
          books={filteredBooks}
          podcasts={filteredPodcasts}
          showUserItems={showUserItems}
          onMarkerClick={(type, item) => setSelectedItem({ type, item })}
          countryCodes={Array.from(countriesToShow)}
          onCountryClick={handleCountryClick}
          onCountryHover={handleCountryHover}
          className="w-full h-full"
        />
        
        {/* 使用新的MenuBar组件 */}
        <AppMenubar 
          onAddBook={() => {
            setAddContentType("book")
            setAddDialogOpen(true)
          }}
          onAddPodcast={() => {
            setAddContentType("podcast")
            setAddDialogOpen(true)
          }}
        />
      </main>
      
      {/* 添加内容表单 */}
      {addDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="w-full max-w-md">
            <AddContentForm
              type={addContentType || "book"}
              isOpen={addDialogOpen}
              onClose={closeAddDialog}
              onSubmit={handleFormSubmit}
              countries={countries}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
      
      {/* 显示选中内容的详情 */}
      {selectedItem && (
        <div className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 z-10">
          <h3 className="text-lg font-medium mb-2">{selectedItem.item.title}</h3>
          <p className="text-sm text-gray-500 mb-4">
            {selectedItem.type === "book" 
              ? `作者: ${(selectedItem.item as Book).author || "未知"}` 
              : `描述: ${(selectedItem.item as Podcast).description || "无描述"}`
            }
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedItem.item.cities.map(city => (
              <span key={city.id} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {city.name} ({city.country_name})
              </span>
            ))}
          </div>
          <button 
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={() => setSelectedItem(null)}
          >
            关闭
          </button>
        </div>
      )}
    </div>
  )
}
