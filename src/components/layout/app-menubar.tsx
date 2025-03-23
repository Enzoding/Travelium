"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Search, User, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { cn } from "@/lib/utils"

interface AppMenubarProps {
  onAddBook?: () => void
  onAddPodcast?: () => void
}

export function AppMenubar({ onAddBook, onAddPodcast }: AppMenubarProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  
  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }
  
  const handleDashboardClick = () => {
    router.push('/dashboard')
  }
  
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <Menubar className="px-4 py-2 bg-white/90 backdrop-blur-md shadow-lg rounded-full border border-gray-200">
        <MenubarMenu>
          <MenubarTrigger className="cursor-pointer px-3">
            <PlusCircle className="h-5 w-5 mr-1" />
            <span>添加</span>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={onAddBook}>添加书籍</MenubarItem>
            <MenubarItem onClick={onAddPodcast}>添加播客</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        
        <MenubarMenu>
          <MenubarTrigger className="cursor-pointer px-3">
            <Search className="h-5 w-5 mr-1" />
            <span>搜索</span>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem>搜索功能即将上线</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        
        <MenubarMenu>
          <MenubarTrigger className="cursor-pointer px-3">
            <User className="h-5 w-5 mr-1" />
            <span>个人</span>
          </MenubarTrigger>
          <MenubarContent>
            {user ? (
              <>
                <MenubarItem className="font-medium">{user.email || '用户'}</MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={handleDashboardClick}>仪表盘</MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  退出登录
                </MenubarItem>
              </>
            ) : (
              <>
                <MenubarItem onClick={() => router.push('/signin')}>登录</MenubarItem>
                <MenubarItem onClick={() => router.push('/signup')}>注册</MenubarItem>
              </>
            )}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  )
}
