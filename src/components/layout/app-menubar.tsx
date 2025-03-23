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
  const [openMenus, setOpenMenus] = useState<{[key: string]: boolean}>({
    add: false,
    search: false,
    profile: false
  })
  
  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }
  
  const handleDashboardClick = () => {
    router.push('/dashboard')
  }
  
  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => {
      // 关闭所有其他菜单
      const newState = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {} as {[key: string]: boolean});
      
      // 切换当前菜单状态
      newState[menu] = !prev[menu];
      return newState;
    });
  }
  
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <Menubar className="px-4 py-2 bg-white/90 backdrop-blur-md shadow-lg rounded-full border border-gray-200 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-1">
          {/* 添加菜单 */}
          <div className="relative">
            <button 
              onClick={() => toggleMenu('add')} 
              className="cursor-pointer px-3 py-1 rounded-sm flex items-center text-sm font-medium transition-all duration-200 ease-in-out hover:opacity-80 focus:outline-none"
            >
              <PlusCircle className="h-5 w-5 mr-1 transition-transform duration-200 group-hover:scale-110" />
              <span>添加</span>
            </button>
            {openMenus.add && (
              <div className="absolute left-0 bottom-full mb-1 w-36 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 py-1 animate-in fade-in-50 slide-in-from-bottom-2 duration-150">
                <button 
                  className="text-left w-full px-3 py-1.5 text-sm transition-opacity duration-150 hover:bg-gray-100"
                  onClick={() => {
                    if (onAddBook) onAddBook();
                    toggleMenu('add');
                  }}
                >
                  添加书籍
                </button>
                <button 
                  className="text-left w-full px-3 py-1.5 text-sm transition-opacity duration-150 hover:bg-gray-100"
                  onClick={() => {
                    if (onAddPodcast) onAddPodcast();
                    toggleMenu('add');
                  }}
                >
                  添加播客
                </button>
              </div>
            )}
          </div>
          
          {/* 搜索菜单 */}
          <div className="relative">
            <button 
              onClick={() => toggleMenu('search')} 
              className="cursor-pointer px-3 py-1 rounded-sm flex items-center text-sm font-medium transition-all duration-200 ease-in-out hover:opacity-80 focus:outline-none"
            >
              <Search className="h-5 w-5 mr-1 transition-transform duration-200 group-hover:scale-110" />
              <span>搜索</span>
            </button>
            {openMenus.search && (
              <div className="absolute left-0 bottom-full mb-1 w-36 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 py-1 animate-in fade-in-50 slide-in-from-bottom-2 duration-150">
                <div className="px-3 py-1.5 text-sm transition-opacity duration-150">
                  搜索功能即将上线
                </div>
              </div>
            )}
          </div>
          
          {/* 个人菜单 */}
          <div className="relative">
            <button 
              onClick={() => toggleMenu('profile')} 
              className="cursor-pointer px-3 py-1 rounded-sm flex items-center text-sm font-medium transition-all duration-200 ease-in-out hover:opacity-80 focus:outline-none"
            >
              <User className="h-5 w-5 mr-1 transition-transform duration-200 group-hover:scale-110" />
              <span>我的</span>
            </button>
            {openMenus.profile && (
              <div className="absolute left-0 bottom-full mb-1 w-36 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 py-1 animate-in fade-in-50 slide-in-from-bottom-2 duration-150">
                {user ? (
                  <>
                    <div className="px-3 py-1.5 text-sm font-medium border-b border-gray-100">
                      {user.email || '用户'}
                    </div>
                    <button 
                      className="text-left w-full px-3 py-1.5 text-sm transition-opacity duration-150 hover:bg-gray-100"
                      onClick={() => {
                        handleDashboardClick();
                        toggleMenu('profile');
                      }}
                    >
                      仪表盘
                    </button>
                    <button 
                      className="text-left w-full px-3 py-1.5 text-sm transition-opacity duration-150 hover:bg-gray-100 flex items-center"
                      onClick={() => {
                        handleLogout();
                        toggleMenu('profile');
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      退出登录
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="text-left w-full px-3 py-1.5 text-sm transition-opacity duration-150 hover:bg-gray-100"
                      onClick={() => {
                        router.push('/signin');
                        toggleMenu('profile');
                      }}
                    >
                      登录
                    </button>
                    <button 
                      className="text-left w-full px-3 py-1.5 text-sm transition-opacity duration-150 hover:bg-gray-100"
                      onClick={() => {
                        router.push('/signup');
                        toggleMenu('profile');
                      }}
                    >
                      注册
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </Menubar>
    </div>
  )
}
