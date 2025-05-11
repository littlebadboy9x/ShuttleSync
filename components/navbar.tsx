"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M17 3h4v4" />
            <path d="M14 7 21 0" />
            <path d="M3 21h4v-4" />
            <path d="M0 3h4v4" />
            <path d="M14 17l7 7" />
            <path d="M3 3l18 18" />
          </svg>
          <span className="font-bold">ShuttleSync</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
            Trang Chủ
          </Link>
          <Link href="/courts" className="text-sm font-medium hover:underline underline-offset-4">
            Sân Cầu Lông
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
            Bảng Giá
          </Link>
          <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
            Giới Thiệu
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <div className="hidden md:flex gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Đăng Nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Đăng Ký</Button>
            </Link>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="container md:hidden py-4 grid gap-4">
          <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
            Trang Chủ
          </Link>
          <Link href="/courts" className="text-sm font-medium hover:underline underline-offset-4">
            Sân Cầu Lông
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
            Bảng Giá
          </Link>
          <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
            Giới Thiệu
          </Link>
          <div className="flex gap-2 pt-2">
            <Link href="/login" className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                Đăng Nhập
              </Button>
            </Link>
            <Link href="/register" className="w-full">
              <Button size="sm" className="w-full">
                Đăng Ký
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
