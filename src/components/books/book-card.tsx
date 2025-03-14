"use client"

import { useState } from "react"
import Image from "next/image"
import { Book, Country } from "@/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface BookCardProps {
  book: Book
  onEdit: (book: Book) => void
  onDelete: (id: string) => void
  onHighlight: (countries: Country[]) => void
}

export function BookCard({ book, onEdit, onDelete, onHighlight }: BookCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    onDelete(book.id)
    setIsDeleteDialogOpen(false)
    toast({
      title: "删除成功",
      description: `《${book.title}》已被删除`,
    })
  }

  const handleHighlight = () => {
    onHighlight(book.countries)
    toast({
      title: "已在地图上高亮显示",
      description: `《${book.title}》相关的国家已在地图上高亮显示`,
    })
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="line-clamp-1">{book.title}</CardTitle>
        <CardDescription>作者: {book.author}</CardDescription>
      </CardHeader>
      <CardContent>
        {book.coverUrl && (
          <div className="relative h-48 w-full mb-4 overflow-hidden rounded-md">
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-3">{book.description}</p>
          <div className="flex flex-wrap gap-1">
            {book.countries.map((country) => (
              <span
                key={country.code}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
              >
                {country.name}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(book)}>
            编辑
          </Button>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                删除
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>确认删除</DialogTitle>
                <DialogDescription>
                  您确定要删除《{book.title}》吗？此操作无法撤销。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  取消
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  删除
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Button variant="secondary" size="sm" onClick={handleHighlight}>
          在地图上显示
        </Button>
      </CardFooter>
    </Card>
  )
}
