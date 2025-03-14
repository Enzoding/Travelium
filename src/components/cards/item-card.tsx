"use client"

import { Book, Podcast } from "@/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ItemCardProps {
  type: "book" | "podcast"
  item: Book | Podcast
  onClose?: () => void
}

function ItemCard({ type, item, onClose }: ItemCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>作者: {item.author}</CardDescription>
          </div>
          {item.coverUrl && (
            <div className="relative h-16 w-16 overflow-hidden rounded-md">
              <Image
                src={item.coverUrl}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
        <div className="mt-4">
          <h4 className="text-sm font-medium">相关国家:</h4>
          <div className="mt-1 flex flex-wrap gap-1">
            {item.countries.map((country) => (
              <span
                key={country.code}
                className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {country.name}
              </span>
            ))}
          </div>
        </div>
        {type === "podcast" && "audioUrl" in item && (
          <div className="mt-4">
            <h4 className="text-sm font-medium">播客音频:</h4>
            <audio
              controls
              className="mt-2 w-full"
              src={(item as Podcast).audioUrl}
            >
              您的浏览器不支持音频元素
            </audio>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onClose} className="w-full">
          关闭
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ItemCard
