"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Calendar, History, Home, LogOut, Menu, User, X } from "lucide-react"
import { CreditCard } from 'lucide-react';
import { Store } from 'lucide-react';

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navigation = [
    { name: "Trang Chủ", href: "/customer/dashboard", icon: Home },
    { name: "Đặt Sân", href: "/customer/booking", icon: Calendar },
    { name: "Lịch Sử Đặt Sân", href: "/customer/bookings", icon: History },
    { name: "Hồ Sơ", href: "/customer/profile", icon: User },
    { name: "Dịch Vụ", href: "/customer/services", icon: Store},
    { name: "Hóa Đơn", href: "/customer/invoices", icon: CreditCard},
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar cho desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-card pt-5">
          <div className="flex items-center flex-shrink-0 px-4">
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
          </div>
          <div className="mt-5 flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 mt-auto">
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${isSidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/30" onClick={() => setIsSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-card">
          <div className="flex items-center justify-between h-16 px-4 border-b">
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
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="p-4 mt-auto border-t">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/login">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-card border-b">
          <button type="button" className="px-4 md:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-6 w-6" aria-hidden="true" />
            <span className="sr-only">Mở sidebar</span>
          </button>
          <div className="flex-1 px-4 flex justify-end">
            <div className="ml-4 flex items-center md:ml-6">
              <ModeToggle />
            </div>
          </div>
        </div>

        <main className="flex-1 bg-muted/40">{children}</main>
      </div>
    </div>
  )
}
