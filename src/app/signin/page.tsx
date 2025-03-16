"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SignInForm } from "@/components/auth/sign-in-form"
import { useAuth } from "@/contexts/auth-context"

export default function SignInPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  return (
    <div className="flex h-screen w-full items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  )
}
