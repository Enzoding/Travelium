"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, signOut, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/auth")
    }
  }, [user, isLoading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth")
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">欢迎使用 Travelium</CardTitle>
          <CardDescription>
            您已成功登录，可以开始管理您的旅行内容
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">用户信息</h3>
              <p className="text-sm text-muted-foreground">邮箱: {user?.email}</p>
              <p className="text-sm text-muted-foreground">用户ID: {user?.id}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">功能导航</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <Button variant="outline" onClick={() => router.push("/books")}>
                  管理书籍
                </Button>
                <Button variant="outline" onClick={() => router.push("/podcasts")}>
                  管理播客
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={handleSignOut}>
            退出登录
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
