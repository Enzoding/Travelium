"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AddButtonProps {
  onAddBook: () => void
  onAddPodcast: () => void
  className?: string
}

export function AddButton({ onAddBook, onAddPodcast, className }: AddButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleAddBook = () => {
    onAddBook()
    setIsOpen(false)
  }

  const handleAddPodcast = () => {
    onAddPodcast()
    setIsOpen(false)
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="absolute bottom-16 right-0 flex flex-col gap-2 items-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={handleAddBook}
                variant="secondary"
                className="shadow-md bg-white text-gray-900"
              >
                添加书籍
              </Button>
              <Button
                onClick={handleAddPodcast}
                variant="secondary"
                className="shadow-md bg-white text-gray-900"
              >
                添加播客
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <Button
        onClick={toggleMenu}
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg bg-white text-gray-900"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
