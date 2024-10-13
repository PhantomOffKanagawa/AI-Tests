"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/Layout";

interface FoodItem {
  id: string;
  name: string;
  type: 'basic' | 'recipe' | 'meal';
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
}

interface MealPlan {
  [day: string]: {
    breakfast: FoodItem | null;
    lunch: FoodItem | null;
    dinner: FoodItem | null;
    snacks: FoodItem[];
  };
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MealPlanner() {
  const [foods, setFoods] = useState<{ [key: string]: FoodItem }>({});
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [calorieGoal, setCalorieGoal] = useState(2000);

  useEffect(() => {
    const storedFoods = localStorage.getItem("foods");
    if (storedFoods) {
      setFoods(JSON.parse(storedFoods));
    }

    const storedMealPlan = localStorage.getItem("mealPlan");
    if (storedMealPlan) {
      setMealPlan(JSON.parse(storedMealPlan));
    } else {
      const initialMealPlan: MealPlan = {};
      DAYS_OF_WEEK.forEach(day => {
        initialMealPlan[day] = {
          breakfast: null,
          lunch: null,
          dinner: null,
          snacks: []
        };
      });
      setMealPlan(initialMealPlan);
    }
  }, []);

  const updateMeal = (day: string, mealType: 'breakfast' | 'lunch' | 'dinner', foodId: string) => {
    const updatedMealPlan = {
      ...mealPlan,
      [day]: {
        ...mealPlan[day],
        [mealType]: foods[foodId]
      }
    };
    setMealPlan(updatedMealPlan);
    localStorage.setItem("mealPlan", JSON.stringify(updatedMealPlan));
  };

  const addSnack = (day: string, foodId: string) => {
    const updatedMealPlan = {
      ...mealPlan,
      [day]: {
        ...mealPlan[day],
        snacks: [...mealPlan[day].snacks, foods[foodId]]
      }
    };
    setMealPlan(updatedMealPlan);
    localStorage.setItem("mealPlan", JSON.stringify(updatedMealPlan));
  };

  const removeSnack = (day: string, index: number) => {
    const updatedMealPlan = {
      ...mealPlan,
      [day]: {
        ...mealPlan[day],
        snacks: mealPlan[day].snacks.filter((_, i) => i !== index)
      }
    };
    setMealPlan(updatedMealPlan);
    localStorage.setItem("mealPlan", JSON.stringify(updatedMealPlan));
  };

  const calculateDailyNutrition = (day: string) => {
    const meals = [mealPlan[day].breakfast, mealPlan[day].lunch, mealPlan[day].dinner, ...mealPlan[day].snacks];
    return meals.reduce((acc, meal) => {
      if (meal) {
        acc.calories += meal.calories;
        acc.carbs += meal.carbs;
        acc.fat += meal.fat;
        acc.protein += meal.protein;
      }
      return acc;
    }, { calories: 0, carbs: 0, fat: 0, protein: 0 });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Meal Planner</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Daily Calorie Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(parseInt(e.target.value))}
                className="w-24"
              />
              <span>calories</span>
            </div>
          </CardContent>
        </Card>

        {DAYS_OF_WEEK.map(day => (
          <Card key={day} className="mb-8">
            <CardHeader>
              <CardTitle>{day}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['breakfast', 'lunch', 'dinner'].map(mealType => (
                  <div key={mealType}>
                    <Label>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Label>
                    <Select onValueChange={(value) => updateMeal(day, mealType as 'breakfast' | 'lunch' | 'dinner', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${mealType}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(foods).map(([id, food]) => (
                          <SelectItem key={id} value={id}>{food.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {mealPlan[day][mealType as 'breakfast' | 'lunch' | 'dinner'] && (
                      <p className="mt-2">Calories: {mealPlan[day][mealType as 'breakfast' | 'lunch' | 'dinner']!.calories}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Label>Snacks</Label>
                <div className="flex items-center space-x-2">
                  <Select onValueChange={(value) => addSnack(day, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add a snack" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(foods).map(([id, food]) => (
                        <SelectItem key={id} value={id}>{food.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {mealPlan[day].snacks.map((snack, index) => (
                  <div key={index} className="flex items-center justify-between mt-2">
                    <span>{snack.name} - {snack.calories} calories</span>
                    <Button onClick={() => removeSnack(day, index)} variant="destructive" size="sm">Remove</Button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <h3 className="font-bold">Daily Totals</h3>
                {(() => {
                  const totals = calculateDailyNutrition(day);
                  return (
                    <div>
                      <p>Calories: {totals.calories} / {calorieGoal}</p>
                      <p>Carbs: {totals.carbs}g</p>
                      <p>Fat: {totals.fat}g</p>
                      <p>Protein: {totals.protein}g</p>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
}