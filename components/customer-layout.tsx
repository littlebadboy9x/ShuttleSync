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
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-gradient-to-b from-card to-card/95 shadow-lg pt-5 rounded-r-xl overflow-hidden">
          <div className="flex items-center flex-shrink-0 px-6 py-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-primary/10 p-2 rounded-lg shadow-md group-hover:shadow-primary/20 transition-all duration-300">
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
                  className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300"
                >
                  <path d="M17 3h4v4" />
                  <path d="M14 7 21 0" />
                  <path d="M3 21h4v-4" />
                  <path d="M0 3h4v4" />
                  <path d="M14 17l7 7" />
                  <path d="M3 3l18 18" />
                </svg>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">ShuttleSync</span>
            </Link>
          </div>
          <div className="mt-6 flex-1 flex flex-col overflow-y-auto px-3">
            <div className="space-y-1.5">
              <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Danh mục
              </h3>
              <nav className="flex-1 space-y-1.5">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-foreground hover:bg-muted hover:shadow-sm"
                      }`}
                    >
                      <div className={`mr-3 p-1 rounded-md ${isActive ? "bg-primary-foreground/20" : "bg-background/50 group-hover:bg-background"}`}>
                        <item.icon
                          className={`h-5 w-5 ${
                            isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                          } transition-colors`}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-5 rounded-full bg-primary-foreground/30"></span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="p-4 mt-auto">
              <div className="bg-muted/50 p-3 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Khách hàng</p>
                      <p className="text-xs text-muted-foreground">Người dùng</p>
                    </div>
                  </div>
                  <ModeToggle />
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 border-dashed" asChild>
                  <Link href="/login" className="flex items-center justify-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${isSidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-card shadow-2xl transform transition-transform duration-300 ease-in-out">
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
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
                  className="h-6 w-6 text-primary"
                >
                  <path d="M17 3h4v4" />
                  <path d="M14 7 21 0" />
                  <path d="M3 21h4v-4" />
                  <path d="M0 3h4v4" />
                  <path d="M14 17l7 7" />
                  <path d="M3 3l18 18" />
                </svg>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">ShuttleSync</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="rounded-full hover:bg-muted">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="px-3 py-4 space-y-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-2.5 text-base font-medium rounded-lg ${
                    isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <div className={`mr-3 p-1 rounded-md ${isActive ? "bg-primary-foreground/20" : "bg-background/50"}`}>
                    <item.icon
                      className={`h-5 w-5 ${
                        isActive ? "text-primary-foreground" : "text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="p-4 mt-auto border-t">
            <div className="bg-muted/50 p-3 rounded-lg mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Khách hàng</p>
                  <p className="text-xs text-muted-foreground">Người dùng</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start border-dashed" asChild>
              <Link href="/login">
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-72 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-card/80 backdrop-blur-md border-b shadow-sm">
          <button 
            type="button" 
            className="px-4 md:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/30 rounded-md" 
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
            <span className="sr-only">Mở sidebar</span>
          </button>
          <div className="flex-1 px-4 flex justify-end">
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              <Button variant="ghost" size="icon" className="rounded-full">
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
                  className="h-5 w-5"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </Button>
              <div className="hidden md:flex">
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 bg-muted/40">{children}</main>
      </div>
    </div>
  )
}
