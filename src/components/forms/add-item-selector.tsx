"use client"

import { motion } from "framer-motion"
import { BookOpen, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface AddItemSelectorProps {
  onSelectType: (type: "book" | "podcast") => void
}

export default function AddItemSelector({ onSelectType }: AddItemSelectorProps) {
  const options = [
    {
      type: "book" as const,
      title: "添加书籍",
      description: "记录您阅读过的书籍，并将它与国家关联起来",
      icon: BookOpen,
    },
    {
      type: "podcast" as const,
      title: "添加播客",
      description: "记录您听过的播客，并将它与国家关联起来",
      icon: Headphones,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <DialogHeader className="mb-6">
        <DialogTitle>添加新内容</DialogTitle>
        <DialogDescription>
          选择您想要添加的内容类型
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 gap-4">
        {options.map((option) => (
          <Button
            key={option.type}
            variant="outline"
            className={cn(
              "flex flex-col items-start justify-start h-auto p-6 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200 group",
              "text-left space-y-2"
            )}
            onClick={() => onSelectType(option.type)}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                <option.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium">{option.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{option.description}</p>
          </Button>
        ))}
      </div>
    </motion.div>
  )
}
