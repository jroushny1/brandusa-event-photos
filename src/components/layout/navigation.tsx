'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, Image, BarChart3, Settings, Home, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/auth'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Gallery', href: '/gallery', icon: Image },
  { name: 'Setup', href: '/setup', icon: Settings },
]

interface NavigationProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Image className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">
                Brand USA Event Photos
              </span>
            </Link>

            <div className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className={cn(
                        'flex items-center space-x-2',
                        isActive && 'bg-blue-600 text-white hover:bg-blue-700'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user && (
              <>
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  <span>{user.name || user.email}</span>
                </div>
                <form
                  action={async () => {
                    'use server'
                    await signOut({ redirectTo: '/auth/signin' })
                  }}
                >
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">Sign Out</span>
                  </Button>
                </form>
              </>
            )}
            <Link href="/upload">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-1 overflow-x-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'flex items-center space-x-2 whitespace-nowrap',
                      isActive && 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}