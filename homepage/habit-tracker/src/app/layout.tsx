import './globals.css'
import { Inter } from 'next/font/google'
import { HabitProvider } from '@/contexts/HabitContext'
import { ThemeProvider } from 'next-themes'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Habit Tracker',
  description: 'Track your daily habits and progress',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <HabitProvider>
          {children}
        </HabitProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}