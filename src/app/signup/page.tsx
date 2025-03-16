"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { useAuth } from "@/contexts/auth-context"

export default function SignUpPage() {
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
        <SignUpForm />
      </div>
    </div>
  )
}
