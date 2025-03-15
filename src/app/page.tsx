"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { Book, Country, Podcast } from "@/types"
import GlobeMap from "@/components/map/globe-map"
import UserNav from "@/components/nav/user-nav"
import AddItemForm from "@/components/forms/add-item-form"
import ItemCard from "@/components/cards/item-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Plus } from "lucide-react"

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
    <div className="flex flex-col h-screen">
      <header className="absolute top-0 right-0 z-30 p-4">
        <UserNav />
      </header>
      
      <main className="flex-1 relative">
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
            className="absolute bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-30"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </main>
      
      {/* 添加新内容对话框 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen} modal={false}>
        <DialogContent className="sm:max-w-[500px] z-50 overflow-y-auto max-h-[90vh] bg-white border-none shadow-2xl">
          <AddItemForm 
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            onAddBook={handleAddBook}
            onAddPodcast={handleAddPodcast}
            countries={countries}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
      
      {/* 显示选中项目的对话框 */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)} modal={false}>
        <DialogContent className="sm:max-w-[500px] z-50 bg-white border-none shadow-2xl">
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
