"use client"

import { createContext, useContext, useState } from "react"
import { DataService } from "@/lib/supabase/data-service"
import { Book, BookWithoutId, Country, Podcast, PodcastWithoutId } from "@/types"
import { useAuth } from "./auth-context"

interface DataContextProps {
  // 书籍相关
  books: Book[]
  isLoadingBooks: boolean
  fetchBooks: () => Promise<void>
  addBook: (book: BookWithoutId) => Promise<void>
  updateBook: (id: string, book: BookWithoutId) => Promise<void>
  deleteBook: (id: string) => Promise<void>
  
  // 播客相关
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
}

const DataContext = createContext<DataContextProps | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const dataService = new DataService()
  const { user } = useAuth()
  
  // 书籍状态
  const [books, setBooks] = useState<Book[]>([])
  const [isLoadingBooks, setIsLoadingBooks] = useState(false)
  
  // 播客状态
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [isLoadingPodcasts, setIsLoadingPodcasts] = useState(false)
  
  // 国家状态
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  
  // 错误状态
  const [error, setError] = useState<string | null>(null)
  
  // 获取书籍列表
  const fetchBooks = async () => {
    if (!user) return
    
    setIsLoadingBooks(true)
    setError(null)
    try {
      const books = await dataService.getBooks(user.id)
      setBooks(books)
    } catch (error) {
      console.error("获取书籍列表时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoadingBooks(false)
    }
  }
  
  // 添加书籍
  const addBook = async (book: BookWithoutId) => {
    if (!user) return
    
    setIsLoadingBooks(true)
    setError(null)
    try {
      const newBook = await dataService.addBook(book, user.id)
      setBooks((prev) => [newBook, ...prev])
    } catch (error) {
      console.error("添加书籍时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoadingBooks(false)
    }
  }
  
  // 更新书籍
  const updateBook = async (id: string, book: BookWithoutId) => {
    if (!user) return
    
    setIsLoadingBooks(true)
    setError(null)
    try {
      const updatedBook = await dataService.updateBook(id, book, user.id)
      setBooks((prev) => prev.map((b) => (b.id === id ? updatedBook : b)))
    } catch (error) {
      console.error("更新书籍时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoadingBooks(false)
    }
  }
  
  // 删除书籍
  const deleteBook = async (id: string) => {
    if (!user) return
    
    setIsLoadingBooks(true)
    setError(null)
    try {
      await dataService.deleteBook(id, user.id)
      setBooks((prev) => prev.filter((b) => b.id !== id))
    } catch (error) {
      console.error("删除书籍时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoadingBooks(false)
    }
  }
  
  // 获取播客列表
  const fetchPodcasts = async () => {
    if (!user) return
    
    setIsLoadingPodcasts(true)
    setError(null)
    try {
      const podcasts = await dataService.getPodcasts(user.id)
      setPodcasts(podcasts)
    } catch (error) {
      console.error("获取播客列表时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoadingPodcasts(false)
    }
  }
  
  // 添加播客
  const addPodcast = async (podcast: PodcastWithoutId) => {
    if (!user) return
    
    setIsLoadingPodcasts(true)
    setError(null)
    try {
      const newPodcast = await dataService.addPodcast(podcast, user.id)
      setPodcasts((prev) => [newPodcast, ...prev])
    } catch (error) {
      console.error("添加播客时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoadingPodcasts(false)
    }
  }
  
  // 更新播客
  const updatePodcast = async (id: string, podcast: PodcastWithoutId) => {
    if (!user) return
    
    setIsLoadingPodcasts(true)
    setError(null)
    try {
      const updatedPodcast = await dataService.updatePodcast(id, podcast, user.id)
      setPodcasts((prev) => prev.map((p) => (p.id === id ? updatedPodcast : p)))
    } catch (error) {
      console.error("更新播客时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoadingPodcasts(false)
    }
  }
  
  // 删除播客
  const deletePodcast = async (id: string) => {
    if (!user) return
    
    setIsLoadingPodcasts(true)
    setError(null)
    try {
      await dataService.deletePodcast(id, user.id)
      setPodcasts((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("删除播客时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoadingPodcasts(false)
    }
  }
  
  // 获取国家列表
  const fetchCountries = async () => {
    setIsLoadingCountries(true)
    setError(null)
    try {
      const countries = await dataService.getCountries()
      setCountries(countries)
    } catch (error) {
      console.error("获取国家列表时出错:", error)
      setError((error as Error).message)
    } finally {
      setIsLoadingCountries(false)
    }
  }
  
  const value = {
    // 书籍相关
    books,
    isLoadingBooks,
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
    
    // 播客相关
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
