"use client"

import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BookOpen, Headphones, User, Globe } from "lucide-react"

interface ItemFilterProps {
  showUserItems: boolean
  onToggleUserItems: (value: boolean) => void
  showBooks: boolean
  onToggleBooks: (value: boolean) => void
  showPodcasts: boolean
  onTogglePodcasts: (value: boolean) => void
}

function ItemFilter({
  showUserItems,
  onToggleUserItems,
  showBooks,
  onToggleBooks,
  showPodcasts,
  onTogglePodcasts,
}: ItemFilterProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">显示:</span>
        <ToggleGroup type="single" value={showUserItems ? "user" : "all"}>
          <ToggleGroupItem 
            value="user" 
            aria-label="只显示我的内容"
            onClick={() => onToggleUserItems(true)}
          >
            <User className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">我的</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="all" 
            aria-label="显示所有内容"
            onClick={() => onToggleUserItems(false)}
          >
            <Globe className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">全部</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">类型:</span>
        <ToggleGroup type="multiple">
          <ToggleGroupItem 
            value="books" 
            aria-label="显示书籍"
            data-state={showBooks ? "on" : "off"}
            onClick={() => onToggleBooks(!showBooks)}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">书籍</span>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="podcasts" 
            aria-label="显示播客"
            data-state={showPodcasts ? "on" : "off"}
            onClick={() => onTogglePodcasts(!showPodcasts)}
          >
            <Headphones className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">播客</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}

export default ItemFilter
