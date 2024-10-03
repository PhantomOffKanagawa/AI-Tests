"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  Menu,
  Mic,
  Search,
  User,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useHabitContext } from "@/contexts/HabitContext";

const TABS = ["Daily Tasks", "Daily Food Items", "To Do"];

export default function HabitDashboard() {
  const {
    habitData,
    setHabitData,
    todoLists,
    setTodoLists,
    calendar,
    setCalendar,
    goals,
    setGoals,
    newGoal,
    setNewGoal,
  } = useHabitContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newTodo, setNewTodo] = useState("");
  const [activeTab, setActiveTab] = useState(TABS[0]);

  //   useEffect(() => {
  //     const storedTodoLists = localStorage.getItem('todoLists')
  //     const storedCalendar = localStorage.getItem('calendar')
  //     const storedHabitData = localStorage.getItem('habitData')
  //     const storedGoals = localStorage.getItem('goals')
  //     if (storedTodoLists) setTodoLists(JSON.parse(storedTodoLists))
  //     if (storedCalendar) setCalendar(JSON.parse(storedCalendar))
  //     if (storedHabitData) setHabitData(JSON.parse(storedHabitData))
  //     if (storedGoals) setGoals(JSON.parse(storedGoals))
  //   }, [])

  //   useEffect(() => {
  //     localStorage.setItem('todoLists', JSON.stringify(todoLists))
  //     localStorage.setItem('calendar', JSON.stringify(calendar))
  //     localStorage.setItem('habitData', JSON.stringify(habitData))
  //     localStorage.setItem('goals', JSON.stringify(goals))
  //   }, [todoLists, calendar, habitData, goals])

  const addTodo = () => {
    if (newTodo.trim() !== "") {
      const newItem: TodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
      };
      setTodoLists((prev) => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), newItem],
      }));
      setNewTodo("");
    }
  };

  const toggleTodo = (id: string) => {
    setTodoLists((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab]
        .map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
        .sort((a, b) => {
          if (a.completed === b.completed) return 0;
          return a.completed ? 1 : -1;
        }),
    }));
  };

  const deleteTodo = (id: string) => {
    setTodoLists((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((item) => item.id !== id),
    }));
  };

  const toggleCalendarDay = (date: string) => {
    setCalendar((prev) =>
      prev.map((day) =>
        day.date === date ? { ...day, completed: !day.completed } : day
      )
    );
  };

  const addGoal = () => {
    if (newGoal.name && newGoal.target > 0) {
      setGoals((prev) => [...prev, { ...newGoal, id: Date.now().toString() }]);
      setNewGoal({ id: "", name: "", target: 0, current: 0, unit: "" });
    }
  };

  const updateGoalProgress = (id: string, value: number) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? { ...goal, current: Math.min(value, goal.target) }
          : goal
      )
    );
  };

  const getStreak = (habit: keyof HabitData) => {
    let streak = 0;
    for (let i = habitData.length - 1; i >= 0; i--) {
      if (habitData[i][habit]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getWeeklySummary = () => {
    const lastWeek = habitData.slice(-7);
    return {
      avgCalories: Math.round(
        lastWeek.reduce((sum, day) => sum + day.calories, 0) / 7
      ),
      avgMinutesActive: Math.round(
        lastWeek.reduce((sum, day) => sum + day.minutesActive, 0) / 7
      ),
      workoutDays: lastWeek.filter((day) => day.workedOut).length,
    };
  };

  const weeklySummary = getWeeklySummary();

  const generateHabitSuggestions = () => {
    const suggestions = [];
    if (weeklySummary.avgCalories > 2500) {
      suggestions.push("Consider reducing your daily calorie intake.");
    }
    if (weeklySummary.avgMinutesActive < 30) {
      suggestions.push(
        "Try to increase your daily active minutes. Aim for at least 30 minutes per day."
      );
    }
    if (weeklySummary.workoutDays < 3) {
      suggestions.push("Aim for at least 3 workout days per week.");
    }
    return suggestions;
  };

  const habitSuggestions = generateHabitSuggestions();

  const today = new Date().toISOString().split("T")[0];

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
                <Link
                  href="/"
                  className="block px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/data-entry"
                  className="block px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Data Entry
                </Link>
              </li>
              <li>
                <Link
                  href="/meal-plan"
                  className="block px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Meal Plan
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Analytics
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Settings
                </a>
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
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        John Doe
                      </p>
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

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* Help Section */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-2xl font-bold mb-2">Hey, Need help? 👋</h2>
            <p className="text-gray-600">Just ask me anything!</p>
            <div className="mt-4 flex items-center">
              <Input
                placeholder="Type your question here..."
                className="flex-grow mr-2"
              />
              <Button variant="outline" size="icon">
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Weekly Summary */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Avg. Calories</p>
                  <p className="text-2xl font-bold">
                    {weeklySummary.avgCalories}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Avg. Active Minutes</p>
                  <p className="text-2xl font-bold">
                    {weeklySummary.avgMinutesActive}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Workout Days</p>
                  <p className="text-2xl font-bold">
                    {weeklySummary.workoutDays}/7
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar and Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <Card className="col-span-1 row-span-2">
              <CardHeader>
                <CardTitle>October 2024</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {calendar.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => toggleCalendarDay(day.date)}
                      className={`aspect-square flex items-center justify-center rounded-full ${
                        day.completed
                          ? "bg-green-500 text-white"
                          : day.date === today
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {parseInt(day.date.split("-")[2])}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Workout Streak
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {getStreak("workedOut")} days
                </div>
                <p className="text-xs text-muted-foreground">Keep it up!</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Calorie Intake
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 18V6M8 6v12" />
                  <rect width="20" height="12" x="2" y="6" rx="2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {habitData.length > 0
                    ? Math.round(
                        habitData.reduce((sum, d) => sum + d.calories, 0) /
                          habitData.length
                      )
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Calories per day
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Minutes Active
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {habitData.length > 0
                    ? Math.round(
                        habitData.reduce((sum, d) => sum + d.minutesActive, 0) /
                          habitData.length
                      )
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">Minutes per day</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Chart and Todo List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-4">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Monthly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={habitData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="weight"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="calories"
                        stroke="#82ca9d"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Todo Lists</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    {TABS.map((tab) => (
                      <TabsTrigger key={tab} value={tab}>
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {TABS.map((tab) => (
                    <TabsContent key={tab} value={tab}>
                      <div className="flex mb-4">
                        <Input
                          placeholder={`Add a new ${tab.toLowerCase()} item`}
                          value={newTodo}
                          onChange={(e) => setNewTodo(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addTodo()}
                          className="mr-2"
                        />
                        <Button onClick={addTodo}>Add</Button>
                      </div>
                      <ul className="space-y-2">
                        {todoLists[tab]?.map((todo) => (
                          <li
                            key={todo.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => toggleTodo(todo.id)}
                                className="mr-2"
                              />
                              <span
                                className={
                                  todo.completed
                                    ? "line-through text-gray-500"
                                    : ""
                                }
                              >
                                {todo.text}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTodo(todo.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Habit Completion and Goals */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Habit Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Habit</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-right">Completion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Workout</TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{
                              width: `${
                                (habitData.filter((d) => d.workedOut).length /
                                  habitData.length) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {Math.round(
                          (habitData.filter((d) => d.workedOut).length /
                            habitData.length) *
                            100
                        )}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Teeth Brushing
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{
                              width: `${
                                (habitData.filter((d) => d.teethBrushed)
                                  .length /
                                  habitData.length) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {Math.round(
                          (habitData.filter((d) => d.teethBrushed).length /
                            habitData.length) *
                            100
                        )}
                        %
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Picture Taken
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-yellow-600 h-2.5 rounded-full"
                            style={{
                              width: `${
                                (habitData.filter((d) => d.pictureTaken)
                                  .length /
                                  habitData.length) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {Math.round(
                          (habitData.filter((d) => d.pictureTaken).length /
                            habitData.length) *
                            100
                        )}
                        %
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Goals</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Goal</DialogTitle>
                        <DialogDescription>
                          Set a new goal to track your progress.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={newGoal.name}
                            onChange={(e) =>
                              setNewGoal({ ...newGoal, name: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="target" className="text-right">
                            Target
                          </Label>
                          <Input
                            id="target"
                            type="number"
                            value={newGoal.target}
                            onChange={(e) =>
                              setNewGoal({
                                ...newGoal,
                                target: Number(e.target.value),
                              })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="unit" className="text-right">
                            Unit
                          </Label>
                          <Input
                            id="unit"
                            value={newGoal.unit}
                            onChange={(e) =>
                              setNewGoal({ ...newGoal, unit: e.target.value })
                            }
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={addGoal}>
                          Add Goal
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{goal.name}</p>
                        <Progress
                          value={(goal.current / goal.target) * 100}
                          className="h-2"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={goal.current}
                          onChange={(e) =>
                            updateGoalProgress(goal.id, Number(e.target.value))
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">
                          / {goal.target} {goal.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Habit Suggestions */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Habit Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {habitSuggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
