import './globals.css'
import { Inter } from 'next/font/google'
import { HabitProvider } from '@/contexts/HabitContext'

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
        <HabitProvider>
          {children}
        </HabitProvider>
      </body>
    </html>
  )
}