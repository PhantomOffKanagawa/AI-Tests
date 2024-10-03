"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, Menu, Search, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import Link from "next/link";

interface HabitData {
  date: string;
  calories: number;
  minutesActive: number;
  weight: number;
  teethBrushed: boolean;
  workedOut: boolean;
  pictureTaken: boolean;
  image?: string;
  review: {
    overall: number;
    energy: number;
    mood: number;
    productivity: number;
  };
}

export default function DataEntryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [habitData, setHabitData] = useState<HabitData[]>([]);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formData, setFormData] = useState<HabitData>({
    date: currentDate,
    calories: 0,
    minutesActive: 0,
    weight: 0,
    teethBrushed: false,
    workedOut: false,
    pictureTaken: false,
    review: {
      overall: 0,
      energy: 0,
      mood: 0,
      productivity: 0,
    },
  });

  useEffect(() => {
    const storedHabitData = localStorage.getItem("habitData");
    if (storedHabitData) {
      setHabitData(JSON.parse(storedHabitData));
    }
  }, []);

  useEffect(() => {
    const existingData = habitData.find((d) => d.date === currentDate);
    if (existingData) {
      setFormData(existingData);
    } else {
      setFormData({
        date: currentDate,
        calories: 0,
        minutesActive: 0,
        weight: 0,
        teethBrushed: false,
        workedOut: false,
        pictureTaken: false,
        review: {
          overall: 0,
          energy: 0,
          mood: 0,
          productivity: 0,
        },
      });
    }
  }, [currentDate, habitData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  const handleReviewChange = (category: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      review: {
        ...prev.review,
        [category]: value,
      },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHabitData = habitData.filter((d) => d.date !== currentDate);
    newHabitData.push(formData);
    newHabitData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setHabitData(newHabitData);
    localStorage.setItem("habitData", JSON.stringify(newHabitData));
    alert("Data saved successfully!");
  };

  const handleDelete = (date: string) => {
    const newHabitData = habitData.filter((d) => d.date !== date);
    setHabitData(newHabitData);
    localStorage.setItem("habitData", JSON.stringify(newHabitData));
  };

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

        {/* Data Entry Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Data Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="date"
                    id="date"
                    name="date"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    type="number"
                    id="calories"
                    name="calories"
                    value={formData.calories}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="minutesActive">Minutes Active</Label>
                  <Input
                    type="number"
                    id="minutesActive"
                    name="minutesActive"
                    value={formData.minutesActive}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="teethBrushed"
                    name="teethBrushed"
                    checked={formData.teethBrushed}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        teethBrushed: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="teethBrushed">Teeth Brushed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="workedOut"
                    name="workedOut"
                    checked={formData.workedOut}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        workedOut: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="workedOut">Worked Out</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pictureTaken"
                    name="pictureTaken"
                    checked={formData.pictureTaken}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        pictureTaken: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="pictureTaken">Picture Taken</Label>
                </div>
                <div>
                  <Label htmlFor="image">Upload Image</Label>
                  <Input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                {formData.image && (
                  <div>
                    <img
                      src={formData.image}
                      alt="Uploaded"
                      className="max-w-full h-auto"
                    />
                  </div>
                )}
                <div>
                  <Label>Review</Label>
                  <div className="space-y-2">
                    {["overall", "energy", "mood", "productivity"].map(
                      (category) => (
                        <div
                          key={category}
                          className="flex items-center space-x-2"
                        >
                          <span className="capitalize">{category}:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() =>
                                  handleReviewChange(category, value)
                                }
                                className={`text-2xl ${
                                  value <=
                                  formData.review[
                                    category as keyof typeof formData.review
                                  ]
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <Button type="submit">Save Data</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Calories</TableHead>
                    <TableHead>Minutes Active</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Teeth Brushed</TableHead>
                    <TableHead>Worked Out</TableHead>
                    <TableHead>Picture Taken</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {habitData.map((data) => (
                    <TableRow key={data.date}>
                      <TableCell>{data.date}</TableCell>
                      <TableCell>{data.calories}</TableCell>
                      <TableCell>{data.minutesActive}</TableCell>
                      <TableCell>{data.weight}</TableCell>
                      <TableCell>{data.teethBrushed ? "Yes" : "No"}</TableCell>
                      <TableCell>{data.workedOut ? "Yes" : "No"}</TableCell>
                      <TableCell>{data.pictureTaken ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentDate(data.date)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(data.date)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
