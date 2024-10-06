"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface HabitData {
  date: string
  calories: number
  minutesActive: number
  weight: number
  teethBrushed: boolean
  workedOut: boolean
  pictureTaken: boolean
}

export interface TodoItem {
  id: string
  text: string
  completed: boolean
}

export interface CalendarDay {
  date: string
  completed: boolean
}

export interface Goal {
    id: string
    name: string
    target: number
    current: number
    unit: string
  }

interface HabitContextType {
  habitData: HabitData[]
  setHabitData: React.Dispatch<React.SetStateAction<HabitData[]>>
  todoLists: { [key: string]: TodoItem[] }
  setTodoLists: React.Dispatch<React.SetStateAction<{ [key: string]: TodoItem[] }>>
  calendar: CalendarDay[]
  setCalendar: React.Dispatch<React.SetStateAction<CalendarDay[]>>
  goals: Goal[]
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>
  newGoal: Goal
  setNewGoal: React.Dispatch<React.SetStateAction<Goal>>
}

const HabitContext = createContext<HabitContextType | undefined>(undefined)

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [habitData, setHabitData] = useState<HabitData[]>([])
    const [todoLists, setTodoLists] = useState<{ [key: string]: TodoItem[] }>({})
    const [calendar, setCalendar] = useState<CalendarDay[]>([])
    const [goals, setGoals] = useState<Goal[]>([])
    const [newGoal, setNewGoal] = useState<Goal>({ id: '', name: '', target: 0, current: 0, unit: '' })
    const [initialLoadComplete, setInitialLoadComplete] = useState(false)  // New flag for initial load
  
    // Load data from localStorage on mount
    useEffect(() => {
      const storedHabitData = localStorage.getItem('habitData')
      const storedTodoLists = localStorage.getItem('todoLists')
      const storedCalendar = localStorage.getItem('calendar')
      const storedGoals = localStorage.getItem('goals')
  
      if (storedHabitData) setHabitData(JSON.parse(storedHabitData))
      if (storedTodoLists) setTodoLists(JSON.parse(storedTodoLists))
      if (storedCalendar) setCalendar(JSON.parse(storedCalendar))
      if (storedGoals) setGoals(JSON.parse(storedGoals))
  
      setInitialLoadComplete(true)  // Set flag to indicate that initial load is done
    }, [])
  
    // Save data to localStorage, but only after the initial load
    useEffect(() => {
      if (initialLoadComplete) {  // Only save to localStorage after initial data has been loaded
        localStorage.setItem('habitData', JSON.stringify(habitData))
        localStorage.setItem('todoLists', JSON.stringify(todoLists))
        localStorage.setItem('calendar', JSON.stringify(calendar))
        localStorage.setItem('goals', JSON.stringify(goals))
      }
    }, [habitData, todoLists, calendar, goals, initialLoadComplete])
  
    return (
      <HabitContext.Provider value={{ habitData, setHabitData, todoLists, setTodoLists, calendar, setCalendar, goals, setGoals, newGoal, setNewGoal }}>
        {children}
      </HabitContext.Provider>
    )
  }
  

export const useHabitContext = () => {
  const context = useContext(HabitContext)
  if (context === undefined) {
    throw new Error('useHabitContext must be used within a HabitProvider')
  }
  return context
}