// import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
// import { Toaster } from 'sonner'
// import { ThemeProvider } from './components/providers/ThemeProvider'
// import './globals.css'


// const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = {
//   title: 'Smart Project & Task Collaboration System',
//   description: 'Modern project management and team collaboration platform',
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={inter.className}>
//         <ThemeProvider>
//           {children}
//           <Toaster position="top-right" richColors />
//         </ThemeProvider>
//       </body>
//     </html>
//   )
// }

'use client'

import { Inter } from 'next/font/google'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import './globals.css'

import { Toaster } from 'sonner'
import { Navbar } from './components/layout/Navbar'
import { Sidebar } from './components/layout/Sidebar'
import { ThemeProvider } from './components/providers/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const isAuthPage = pathname === '/auth/login' || pathname === '/auth/register'
  const isHomePage = pathname === '/'

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const result = await response.json()
      setIsAuthenticated(result.success)
    } catch (error) {
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  // Redirect to login if not authenticated and not on public pages
  if (!loading && !isAuthenticated && !isAuthPage && !isHomePage) {
    router.push('/auth/login')
    return null
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {isAuthPage || isHomePage || !isAuthenticated ? (
            <>{children}</>
          ) : (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Sidebar />
              <Navbar />
              <main className="pt-16 transition-all duration-300" style={{ marginLeft: '16rem' }}>
                <div className="p-6">
                  {children}
                </div>
              </main>
            </div>
          )}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}