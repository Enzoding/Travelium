"use client"

import { createContext, useContext, useState } from "react"
import { DataService } from "@/lib/supabase/data-service"
import { Book, BookWithoutId, Content, ContentType, ContentWithoutId, Country, Podcast, PodcastWithoutId, Profile } from "@/types"
import { useAuth } from "./auth-context"

interface DataContextProps {
  // 内容相关
  contents: Content[]
  isLoadingContents: boolean
  fetchContents: (type?: ContentType) => Promise<void>
  addContent: (content: ContentWithoutId) => Promise<void>
  
  // 用户配置文件相关
  profile: Profile | null
  isLoadingProfile: boolean
  fetchProfile: () => Promise<void>
  updateProfile: (profile: Partial<Profile>) => Promise<void>
  
  // 书籍相关 (向后兼容)
  books: Book[]
  isLoadingBooks: boolean
  fetchBooks: () => Promise<void>
  addBook: (book: BookWithoutId) => Promise<void>
  updateBook: (id: string, book: BookWithoutId) => Promise<void>
  deleteBook: (id: string) => Promise<void>
  
  // 播客相关 (向后兼容)
  podcasts: Podcast[]
  isLoadingPodcasts: boolean
  fetchPodcasts: () => Promise<void>
  addPodcast: (podcast: PodcastWithoutId) => Promise<void>
  updatePodcast: (id: string, podcast: PodcastWithoutId) => Promise<void>
  deletePodcast: (id: string) => Promise<void>
  
  // 国家相关
  countries: Country[]
  isLoadingCountries: boolean
  fetchCountries: () => Promise<void>
  
  // 错误处理
  error: string | null
  
  // 通用加载状态
  isLoading: boolean
}

const DataContext = createContext<DataContextProps | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const dataService = new DataService()
  const { user } = useAuth()
  
  // 内容状态
  const [contents, setContents] = useState<Content[]>([])
  const [isLoadingContents, setIsLoadingContents] = useState(false)
  
  // 用户配置文件状态
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  
  // 书籍状态 (向后兼容)
  const [books, setBooks] = useState<Book[]>([])
  const [isLoadingBooks, setIsLoadingBooks] = useState(false)
  
  // 播客状态 (向后兼容)
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [isLoadingPodcasts, setIsLoadingPodcasts] = useState(false)
  
  // 国家状态
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  
  // 错误状态
  const [error, setError] = useState<string | null>(null)
  
  // 通用加载状态
  const [isLoading, setIsLoading] = useState(false)
  
  // 获取内容列表
  const fetchContents = async (type?: ContentType) => {
    if (!user) return
    
    setIsLoading(true)
    setIsLoadingContents(true)
    setError(null)
    try {
      const contents = await dataService.getContents(user.id, type)
      setContents(contents)
    } catch (error) {
      console.error("获取内容列表时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
      setIsLoadingContents(false)
    }
  }
  
  // 添加内容
  const addContent = async (content: ContentWithoutId) => {
    if (!user) return
    
    setIsLoading(true)
    setIsLoadingContents(true)
    setError(null)
    try {
      const newContent = await dataService.addContent(content, user.id)
      setContents((prev) => [newContent, ...prev])
      
      // 如果是书籍或播客，更新对应的状态
      if (content.type === ContentType.Book) {
        // 触发书籍列表更新
        fetchBooks()
      } else if (content.type === ContentType.Podcast) {
        // 触发播客列表更新
        fetchPodcasts()
      }
    } catch (error) {
      console.error("添加内容时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
      setIsLoadingContents(false)
    }
  }
  
  // 获取用户配置文件
  const fetchProfile = async () => {
    if (!user) return
    
    setIsLoading(true)
    setIsLoadingProfile(true)
    setError(null)
    try {
      const profile = await dataService.getProfile(user.id)
      setProfile(profile)
    } catch (error) {
      console.error("获取用户配置文件时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
      setIsLoadingProfile(false)
    }
  }
  
  // 更新用户配置文件
  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) return
    
    setIsLoading(true)
    setIsLoadingProfile(true)
    setError(null)
    try {
      const updatedProfile = await dataService.updateProfile(user.id, profileData)
      setProfile(updatedProfile)
    } catch (error) {
      console.error("更新用户配置文件时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
      setIsLoadingProfile(false)
    }
  }
  
  // 获取书籍列表 (向后兼容)
  const fetchBooks = async () => {
    if (!user) return
    
    setIsLoading(true)
    setIsLoadingBooks(true)
    setError(null)
    try {
      const books = await dataService.getBooks(user.id)
      setBooks(books)
    } catch (error) {
      console.error("获取书籍列表时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
      setIsLoadingBooks(false)
    }
  }
  
  // 添加书籍 (向后兼容)
  const addBook = async (book: BookWithoutId) => {
    if (!user) return
    
    setIsLoading(true)
    setIsLoadingBooks(true)
    setError(null)
    try {
      const newBook = await dataService.addBook(book, user.id)
      setBooks((prev) => [newBook, ...prev])
    } catch (error) {
      console.error("添加书籍时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
      setIsLoadingBooks(false)
    }
  }
  
  // 更新书籍 (向后兼容)
  const updateBook = async (id: string, book: BookWithoutId) => {
    if (!user) return
    
    setIsLoading(true)
    setIsLoadingBooks(true)
    setError(null)
    try {
      const updatedBook = await dataService.updateBook(id, book, user.id)
      setBooks((prev) => prev.map((b) => (b.id === id ? updatedBook : b)))
    } catch (error) {
      console.error("更新书籍时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
      setIsLoadingBooks(false)
    }
  }
  
  // 删除书籍 (向后兼容)
  const deleteBook = async (id: string) => {
    if (!user) return
    
    setIsLoading(true)
    setIsLoadingBooks(true)
    setError(null)
    try {
      await dataService.deleteBook(id, user.id)
      setBooks((prev) => prev.filter((b) => b.id !== id))
    } catch (error) {
      console.error("删除书籍时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
      setIsLoadingBooks(false)
    }
  }
  
  // 获取播客列表 (向后兼容)
  const fetchPodcasts = async () => {
    if (!user) return
    
    setIsLoading(true)
    setIsLoadingPodcasts(true)
    setError(null)
    try {
      const podcasts = await dataService.getPodcasts(user.id)
      setPodcasts(podcasts)
    } catch (error) {
      console.error("获取播客列表时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
      setIsLoadingPodcasts(false)
    }
  }
  
  // 添加播客 (向后兼容)
  const addPodcast = async (podcast: PodcastWithoutId) => {
    if (!user) return
    
    setIsLoading(true)
    setIsLoadingPodcasts(true)
    setError(null)
    try {
      const newPodcast = await dataService.addPodcast(podcast, user.id)
      setPodcasts((prev) => [newPodcast, ...prev])
    } catch (error) {
      console.error("添加播客时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
      setIsLoadingPodcasts(false)
    }
  }
  
  // 更新播客 (向后兼容)
  const updatePodcast = async (id: string, podcast: PodcastWithoutId) => {
    if (!user) return
    
    setIsLoading(true)
    setIsLoadingPodcasts(true)
    setError(null)
    try {
      const updatedPodcast = await dataService.updatePodcast(id, podcast, user.id)
      setPodcasts((prev) => prev.map((p) => (p.id === id ? updatedPodcast : p)))
    } catch (error) {
      console.error("更新播客时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
      setIsLoadingPodcasts(false)
    }
  }
  
  // 删除播客 (向后兼容)
  const deletePodcast = async (id: string) => {
    if (!user) return
    
    setIsLoading(true)
    setIsLoadingPodcasts(true)
    setError(null)
    try {
      await dataService.deletePodcast(id, user.id)
      setPodcasts((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("删除播客时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
      setIsLoadingPodcasts(false)
    }
  }
  
  // 获取国家列表
  const fetchCountries = async () => {
    setIsLoading(true)
    setIsLoadingCountries(true)
    setError(null)
    try {
      const countries = await dataService.getCountries()
      setCountries(countries)
    } catch (error) {
      console.error("获取国家列表时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
      setIsLoadingCountries(false)
    }
  }
  
  const value = {
    // 内容相关
    contents,
    isLoadingContents,
    fetchContents,
    addContent,
    
    // 用户配置文件相关
    profile,
    isLoadingProfile,
    fetchProfile,
    updateProfile,
    
    // 书籍相关 (向后兼容)
    books,
    isLoadingBooks,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    
    // 播客相关 (向后兼容)
    podcasts,
    isLoadingPodcasts,
    fetchPodcasts,
    addPodcast,
    updatePodcast,
    deletePodcast,
    
    // 国家相关
    countries,
    isLoadingCountries,
    fetchCountries,
    
    // 错误处理
    error,
    
    // 通用加载状态
    isLoading,
  }
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData 必须在 DataProvider 内部使用")
  }
  return context
}
