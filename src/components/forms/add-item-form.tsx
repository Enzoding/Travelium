"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { BookWithoutId, Country, PodcastWithoutId } from "@/types"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MultiSelect } from "@/components/ui/multi-select"
import { BookOpen, Headphones } from "lucide-react"

const bookSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  author: z.string().min(1, "作者不能为空"),
  description: z.string().min(1, "描述不能为空"),
  coverUrl: z.string().url("请输入有效的URL").optional(),
  countries: z.array(z.object({
    code: z.string(),
    name: z.string()
  })).min(1, "至少选择一个国家")
})

const podcastSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  author: z.string().min(1, "作者不能为空"),
  description: z.string().min(1, "描述不能为空"),
  coverUrl: z.string().url("请输入有效的URL").optional(),
  audioUrl: z.string().url("请输入有效的URL"),
  countries: z.array(z.object({
    code: z.string(),
    name: z.string()
  })).min(1, "至少选择一个国家")
})

interface AddItemFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddBook: (book: BookWithoutId) => Promise<void>
  onAddPodcast: (podcast: PodcastWithoutId) => Promise<void>
  countries: Country[]
  isLoading: boolean
}

function AddItemForm({
  open,
  onOpenChange,
  onAddBook,
  onAddPodcast,
  countries,
  isLoading
}: AddItemFormProps) {
  const [activeTab, setActiveTab] = useState<"book" | "podcast">("book")
  
  const bookForm = useForm<z.infer<typeof bookSchema>>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      coverUrl: "",
      countries: []
    }
  })
  
  const podcastForm = useForm<z.infer<typeof podcastSchema>>({
    resolver: zodResolver(podcastSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      coverUrl: "",
      audioUrl: "",
      countries: []
    }
  })
  
  const onBookSubmit = async (data: z.infer<typeof bookSchema>) => {
    await onAddBook(data)
    bookForm.reset()
    onOpenChange(false)
  }
  
  const onPodcastSubmit = async (data: z.infer<typeof podcastSchema>) => {
    await onAddPodcast(data)
    podcastForm.reset()
    onOpenChange(false)
  }
  
  const countryOptions = countries.map(country => ({
    label: country.name,
    value: country.code
  }))
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>添加新内容</DialogTitle>
          <DialogDescription>
            添加您阅读过的书籍或听过的播客，并将它们与国家关联起来。
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "book" | "podcast")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="book" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              书籍
            </TabsTrigger>
            <TabsTrigger value="podcast" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              播客
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="book">
            <Form {...bookForm}>
              <form onSubmit={bookForm.handleSubmit(onBookSubmit)} className="space-y-4">
                <FormField
                  control={bookForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>书名</FormLabel>
                      <FormControl>
                        <Input placeholder="输入书名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookForm.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>作者</FormLabel>
                      <FormControl>
                        <Input placeholder="输入作者" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>描述</FormLabel>
                      <FormControl>
                        <Textarea placeholder="输入描述" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookForm.control}
                  name="coverUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>封面URL</FormLabel>
                      <FormControl>
                        <Input placeholder="输入封面图片URL（可选）" {...field} />
                      </FormControl>
                      <FormDescription>
                        提供一个指向书籍封面图片的URL链接
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={bookForm.control}
                  name="countries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>相关国家</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={countryOptions}
                          selected={field.value.map(country => ({
                            label: country.name,
                            value: country.code
                          }))}
                          onChange={(selected) => {
                            field.onChange(
                              selected.map(item => ({
                                code: item.value,
                                name: item.label
                              }))
                            )
                          }}
                          placeholder="选择相关国家"
                        />
                      </FormControl>
                      <FormDescription>
                        选择与这本书相关的国家
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "添加中..." : "添加书籍"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="podcast">
            <Form {...podcastForm}>
              <form onSubmit={podcastForm.handleSubmit(onPodcastSubmit)} className="space-y-4">
                <FormField
                  control={podcastForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>播客名称</FormLabel>
                      <FormControl>
                        <Input placeholder="输入播客名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={podcastForm.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>作者/主持人</FormLabel>
                      <FormControl>
                        <Input placeholder="输入作者或主持人" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={podcastForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>描述</FormLabel>
                      <FormControl>
                        <Textarea placeholder="输入描述" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={podcastForm.control}
                  name="coverUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>封面URL</FormLabel>
                      <FormControl>
                        <Input placeholder="输入封面图片URL（可选）" {...field} />
                      </FormControl>
                      <FormDescription>
                        提供一个指向播客封面图片的URL链接
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={podcastForm.control}
                  name="audioUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>音频URL</FormLabel>
                      <FormControl>
                        <Input placeholder="输入音频URL" {...field} />
                      </FormControl>
                      <FormDescription>
                        提供一个指向播客音频文件的URL链接
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={podcastForm.control}
                  name="countries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>相关国家</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={countryOptions}
                          selected={field.value.map(country => ({
                            label: country.name,
                            value: country.code
                          }))}
                          onChange={(selected) => {
                            field.onChange(
                              selected.map(item => ({
                                code: item.value,
                                name: item.label
                              }))
                            )
                          }}
                          placeholder="选择相关国家"
                        />
                      </FormControl>
                      <FormDescription>
                        选择与这个播客相关的国家
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "添加中..." : "添加播客"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default AddItemForm
