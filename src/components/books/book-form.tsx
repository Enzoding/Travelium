"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Book, Country, BookWithoutId } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// 表单验证模式
const bookFormSchema = z.object({
  title: z.string().min(1, "书名不能为空"),
  author: z.string().min(1, "作者不能为空"),
  description: z.string().min(1, "描述不能为空"),
  coverUrl: z.string().url("请输入有效的URL").optional().or(z.literal("")),
  countryInput: z.string().optional(),
})

type BookFormValues = z.infer<typeof bookFormSchema>

interface BookFormProps {
  book?: Book
  isOpen: boolean
  onClose: () => void
  onSave: (book: BookWithoutId & { id?: string }) => void
  availableCountries: Country[]
}

export function BookForm({ book, isOpen, onClose, onSave, availableCountries }: BookFormProps) {
  const [selectedCountries, setSelectedCountries] = useState<Country[]>(book?.countries || [])

  // 默认值
  const defaultValues: Partial<BookFormValues> = {
    title: book?.title || "",
    author: book?.author || "",
    description: book?.description || "",
    coverUrl: book?.coverUrl || "",
    countryInput: "",
  }

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues,
  })

  function onSubmit(data: BookFormValues) {
    if (selectedCountries.length === 0) {
      toast({
        title: "错误",
        description: "请至少选择一个国家",
        variant: "destructive",
      })
      return
    }

    const bookData: BookWithoutId & { id?: string } = {
      id: book?.id,
      title: data.title,
      author: data.author,
      description: data.description,
      coverUrl: data.coverUrl || undefined,
      countries: selectedCountries,
      cities: [], // 添加空的城市数组作为默认值
    }

    onSave(bookData)
    onClose()
    toast({
      title: book ? "更新成功" : "添加成功",
      description: `《${data.title}》已${book ? "更新" : "添加"}`,
    })
  }

  const handleAddCountry = () => {
    const countryInput = form.getValues("countryInput")
    if (!countryInput) return

    // 查找匹配的国家
    const country = availableCountries.find(
      (c) => c.name.toLowerCase() === countryInput.toLowerCase() || 
             c.code.toLowerCase() === countryInput.toLowerCase()
    )

    if (country) {
      // 检查是否已经添加
      if (!selectedCountries.some((c) => c.code === country.code)) {
        setSelectedCountries([...selectedCountries, country])
        form.setValue("countryInput", "")
      } else {
        toast({
          title: "已存在",
          description: `${country.name} 已经添加`,
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "未找到",
        description: "未找到匹配的国家",
        variant: "destructive",
      })
    }
  }

  const handleRemoveCountry = (code: string) => {
    setSelectedCountries(selectedCountries.filter((c) => c.code !== code))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{book ? "编辑" : "添加"}书籍</DialogTitle>
          <DialogDescription>
            请填写书籍信息，带 * 的字段为必填项
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>书名 *</FormLabel>
                  <FormControl>
                    <Input placeholder="输入书名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>作者 *</FormLabel>
                  <FormControl>
                    <Input placeholder="输入作者" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述 *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="输入描述" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>封面图片URL</FormLabel>
                  <FormControl>
                    <Input placeholder="输入封面图片URL" {...field} />
                  </FormControl>
                  <FormDescription>
                    请输入有效的图片URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>相关国家 *</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="countryInput"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="输入国家名称或代码" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" onClick={handleAddCountry}>添加</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCountries.map((country) => (
                  <div
                    key={country.code}
                    className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    <span>{country.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCountry(country.code)}
                      className="rounded-full hover:bg-destructive/20 p-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {selectedCountries.length === 0 && (
                <p className="text-sm text-muted-foreground">请至少添加一个国家</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
