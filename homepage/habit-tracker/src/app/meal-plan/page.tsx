"use client"

import { useState } from "react"
import { Bell, Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHabitContext } from "@/contexts/HabitContext"

interface Meal {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface DailyMealPlan {
  breakfast: Meal
  lunch: Meal
  dinner: Meal
  snacks: Meal[]
}

export default function MealPlanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [calories, setCalories] = useState(2000)
  const [dietType, setDietType] = useState("balanced")
  const [mealPlan, setMealPlan] = useState<DailyMealPlan | null>(null)
  const { habitData } = useHabitContext()

  const generateMealPlan = () => {
    // This is a mock meal plan generation. In a real application, you would call an API or use a more sophisticated algorithm.
    const mockMealPlan: DailyMealPlan = {
      breakfast: { name: "Oatmeal with fruits", calories: 300, protein: 10, carbs: 50, fat: 5 },
      lunch: { name: "Grilled chicken salad", calories: 400, protein: 30, carbs: 20, fat: 15 },
      dinner: { name: "Salmon with roasted vegetables", calories: 500, protein: 35, carbs: 30, fat: 20 },
      snacks: [
        { name: "Greek yogurt with berries", calories: 150, protein: 15, carbs: 20, fat: 5 },
        { name: "Mixed nuts", calories: 200, protein: 5, carbs: 5, fat: 18 },
      ],
    }
    setMealPlan(mockMealPlan)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-center h-16 bg-gray-900 text-white">
            <h1 className="text-xl font-bold">Habit Tracker</h1>
          </div>
          <nav className="flex-1 overflow-y-auto">
            <ul className="p-4 space-y-2">
              <li>
                <Link href="/" className="block px-4 py-2 rounded-md hover:bg-gray-100">Dashboard</Link>
              </li>
              <li>
                <Link href="/data-entry" className="block px-4 py-2 rounded-md hover:bg-gray-100">Data Entry</Link>
              </li>
              <li>
                <Link href="/meal-plan" className="block px-4 py-2 rounded-md hover:bg-gray-100">Meal Plan</Link>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100">Settings</a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 w-64"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">John Doe</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        john@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Meal Plan Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <Card>
            <CardHeader>
              <CardTitle>Meal Plan Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="calories">Daily Calorie Goal</Label>
                  <Input
                    type="number"
                    id="calories"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="dietType">Diet Type</Label>
                  <Select value={dietType} onValueChange={setDietType}>
                    <SelectTrigger id="dietType">
                      <SelectValue placeholder="Select a diet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="lowCarb">Low Carb</SelectItem>
                      <SelectItem value="highProtein">High Protein</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={generateMealPlan}>Generate Meal Plan</Button>
              </div>

              {mealPlan && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Your Meal Plan</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Breakfast</h4>
                      <p>{mealPlan.breakfast.name} - {mealPlan.breakfast.calories} calories</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Lunch</h4>
                      <p>{mealPlan.lunch.name} - {mealPlan.lunch.calories} calories</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Dinner</h4>
                      <p>{mealPlan.dinner.name} - {mealPlan.dinner.calories} calories</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Snacks</h4>
                      {mealPlan.snacks.map((snack, index) => (
                        <p key={index}>{snack.name} - {snack.calories} calories</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}