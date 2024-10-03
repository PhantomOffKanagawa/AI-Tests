import Dashboard from './dashboard'
import { HabitProvider } from '@/contexts/HabitContext'

function Home() {
  return (
    <HabitProvider>
      <Dashboard />
    </HabitProvider>
  )
}

export default Home
