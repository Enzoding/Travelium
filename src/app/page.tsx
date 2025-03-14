"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { Book, Country, Podcast } from "@/types"
import GlobeMap from "@/components/map/globe-map"
import UserNav from "@/components/nav/user-nav"
import ItemFilter from "@/components/filters/item-filter"
import AddItemForm from "@/components/forms/add-item-form"
import ItemCard from "@/components/cards/item-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const { user } = useAuth()
  const { books, podcasts, countries, addBook, addPodcast, isLoading } = useData()
  
  const [showUserItems, setShowUserItems] = useState(false)
  const [showBooks, setShowBooks] = useState(true)
  const [showPodcasts, setShowPodcasts] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{
    type: "book" | "podcast";
    item: Book | Podcast;
  } | null>(null)

  // 根据筛选条件过滤书籍和播客
  const filteredBooks = books.filter(book => 
    (showBooks) && 
    (!showUserItems || (user && book.userId === user.id))
  )
  
  const filteredPodcasts = podcasts.filter(podcast => 
    (showPodcasts) && 
    (!showUserItems || (user && podcast.userId === user.id))
  )

  // 处理标记点击事件
  const handleMarkerClick = (type: "book" | "podcast", item: Book | Podcast) => {
    setSelectedItem({ type, item })
  }

  // 添加新书籍
  const handleAddBook = async (book: {
    title: string;
    author: string;
    description: string;
    coverUrl?: string;
    countries: Country[];
  }) => {
    if (!user) return
    await addBook(book)
  }

  // 添加新播客
  const handleAddPodcast = async (podcast: {
    title: string;
    author: string;
    description: string;
    coverUrl?: string;
    audioUrl: string;
    countries: Country[];
  }) => {
    if (!user) return
    await addPodcast(podcast)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-xl font-bold">Travelium</span>
        </Link>
        <nav className="ml-auto">
          <UserNav />
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
          <div className="mb-4 flex flex-col sm:flex-row justify-between gap-4">
            <h1 className="text-2xl font-bold">探索世界各地的书籍和播客</h1>
            <ItemFilter 
              showUserItems={showUserItems}
              onToggleUserItems={setShowUserItems}
              showBooks={showBooks}
              onToggleBooks={setShowBooks}
              showPodcasts={showPodcasts}
              onTogglePodcasts={setShowPodcasts}
            />
          </div>
          
          <div className="relative flex-1 rounded-lg overflow-hidden">
            <GlobeMap 
              books={filteredBooks}
              podcasts={filteredPodcasts}
              showUserItems={showUserItems}
              onMarkerClick={handleMarkerClick}
              className="w-full h-full"
            />
            
            {user && (
              <Button 
                size="icon" 
                className="absolute bottom-4 right-4 rounded-full h-12 w-12 shadow-lg"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </main>
      
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date().getFullYear()} Travelium. 保留所有权利。
        </p>
      </footer>
      
      {/* 添加新内容对话框 */}
      <AddItemForm 
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAddBook={handleAddBook}
        onAddPodcast={handleAddPodcast}
        countries={countries}
        isLoading={isLoading}
      />
      
      {/* 显示选中项目的对话框 */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedItem && (
            <ItemCard 
              type={selectedItem.type}
              item={selectedItem.item}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
