"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { Book, Podcast } from "@/types"
import GlobeMap from "@/components/map/globe-map"
import UserNav from "@/components/nav/user-nav"
import { AddButton } from "@/components/ui/add-button"
import { AddContentForm } from "@/components/forms/add-content-form"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { user } = useAuth()
  const { books, podcasts, countries, addBook, addPodcast, isLoading } = useData()
  
  const [showUserItems, setShowUserItems] = useState(false)
  const [showBooks, setShowBooks] = useState(true)
  const [showPodcasts, setShowPodcasts] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addContentType, setAddContentType] = useState<"book" | "podcast" | null>(null)
  const [selectedItem, setSelectedItem] = useState<{
    type: "book" | "podcast";
    item: Book | Podcast;
  } | null>(null)
  
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
      book.countries.forEach(country => {
        countriesToShow.add(country.code)
      })
    })
  }
  
  if (showPodcasts) {
    filteredPodcasts.forEach(podcast => {
      podcast.countries.forEach(country => {
        countriesToShow.add(country.code)
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
  
  // 打开添加书籍对话框
  const openAddBookDialog = () => {
    setAddContentType("book")
    setAddDialogOpen(true)
  }
  
  // 打开添加播客对话框
  const openAddPodcastDialog = () => {
    setAddContentType("podcast")
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
    
    // 查找与该国家相关的书籍和播客
    const relatedBooks = filteredBooks.filter(book => 
      book.countries.some(country => country.code === countryCode)
    )
    
    const relatedPodcasts = filteredPodcasts.filter(podcast => 
      podcast.countries.some(country => country.code === countryCode)
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
      <header className="border-b py-2 px-4 flex justify-between items-center bg-white/80 backdrop-blur-sm z-10">
        <h1 className="text-xl font-bold text-primary">Travelium</h1>
        <div className="flex items-center gap-2">
          <UserNav />
        </div>
      </header>
      
      <main className="flex-1 relative overflow-hidden">
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
        
        {/* 添加按钮 - 仅在用户登录时显示 */}
        {user && (
          <AddButton
            onAddBook={openAddBookDialog}
            onAddPodcast={openAddPodcastDialog}
          />
        )}
      </main>
      
      {/* 添加内容表单 */}
      {addDialogOpen && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md pointer-events-auto">
          <AddContentForm
            type={addContentType || "book"}
            isOpen={addDialogOpen}
            onClose={closeAddDialog}
            onSubmit={handleFormSubmit}
            countries={countries}
            isLoading={isLoading}
          />
        </div>
      )}
      
      {/* 显示选中内容的详情 */}
      {selectedItem && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg p-4 z-10">
          <h3 className="text-lg font-medium mb-2">{selectedItem.item.title}</h3>
          <p className="text-sm text-gray-500 mb-4">
            {selectedItem.type === "book" 
              ? `作者: ${(selectedItem.item as Book).author || "未知"}` 
              : `描述: ${(selectedItem.item as Podcast).description || "无描述"}`
            }
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedItem.item.countries.map(country => (
              <span key={country.code} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {country.name}
              </span>
            ))}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500" 
            onClick={() => setSelectedItem(null)}
          >
            关闭
          </Button>
        </div>
      )}
    </div>
  )
}
