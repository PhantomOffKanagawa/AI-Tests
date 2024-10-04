"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, X, RotateCcw, Download, Copy } from "lucide-react";

// @ts-ignore
import solver from "javascript-lp-solver";

interface Food {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cost: number;
  servings: number;
  min_serving: number;
  max_serving: number;
  serving_step: number;
  enabled: boolean;
  required: boolean;
  display_group: string;
  group: string;
  inMeal: boolean;
}

interface Meal {
  id: number;
  name: string;
  items: Food[];
}

interface Range {
  min: number;
  max: number;
  total: number;
}

export default function MealPlanGenerator() {
  const [foods, setFoods] = useState<{ [key: string]: Food }>({});
  const [ranges, setRanges] = useState<{ [key: string]: Range }>({
    Calories: { min: 1700, max: 1800, total: 0 },
    Fat: { min: 30, max: 55, total: 0 },
    Carbs: { min: 120, max: 200, total: 0 },
    Protein: { min: 190, max: 210, total: 0 },
  });
  const [meals, setMeals] = useState<Meal[]>([
    { id: 1, name: "Breakfast", items: [] },
    { id: 3, name: "Lunch", items: [] },
    { id: 5, name: "Dinner", items: [] },
  ]);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const storedFoods = localStorage.getItem("foods");
    const storedRanges = localStorage.getItem("ranges");
    if (storedFoods) setFoods(JSON.parse(storedFoods));
    if (storedRanges) setRanges(JSON.parse(storedRanges));
  }, []);

  useEffect(() => {
    updateRanges();
  }, [meals]);

  const updateRanges = useCallback(() => {
    const newRanges = { ...ranges };
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalPrice = 0;

    meals.forEach((meal) => {
      meal.items.forEach((item) => {
        totalCalories += item.calories * item.servings;
        totalProtein += item.protein * item.servings;
        totalCarbs += item.carbs * item.servings;
        totalFat += item.fat * item.servings;
        totalPrice += item.cost * item.servings;
      });
    });

    newRanges.Calories.total = totalCalories;
    newRanges.Protein.total = totalProtein;
    newRanges.Carbs.total = totalCarbs;
    newRanges.Fat.total = totalFat;
    setRanges(newRanges);
    setPrice(totalPrice);
  }, [meals, ranges]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    const newFoods = { ...foods };
    const newMeals = [...meals];

    const getFood = (id: string, index: number): Food => {
      if (id === "all-foods" || id === "required-foods") {
        return Object.values(foods).filter(
          (f) => f.required === (id === "required-foods")
        )[index];
      }
      const meal = meals.find((m) => m.id === parseInt(id));
      return meal ? meal.items[index] : Object.values(foods)[0];
    };

    const foodItem = getFood(sourceId, source.index);

    // Update food properties based on destination
    if (destId === "required-foods") {
      newFoods[foodItem.name].required = true;
      newFoods[foodItem.name].enabled = true;
    } else if (destId === "all-foods") {
      newFoods[foodItem.name].required = false;
      newFoods[foodItem.name].enabled = true;
      newFoods[foodItem.name].inMeal = false;
    } else {
      // Dropped into a meal
      const mealIndex = newMeals.findIndex((m) => m.id === parseInt(destId));
      if (mealIndex !== -1) {
        const newFood = { ...foodItem, servings: 1, inMeal: true };
        newMeals[mealIndex].items.splice(destination.index, 0, newFood);
        newFoods[foodItem.name].inMeal = true;
      }
    }

    // Remove from source if it's a meal
    if (sourceId !== "all-foods" && sourceId !== "required-foods") {
      const sourceMealIndex = newMeals.findIndex(
        (m) => m.id === parseInt(sourceId)
      );
      if (sourceMealIndex !== -1) {
        newMeals[sourceMealIndex].items.splice(source.index, 1);
        newFoods[foodItem.name].inMeal = false;
      }
    }

    setFoods(newFoods);
    setMeals(newMeals);
  };

  const removeFromMeal = (item: Food, meal: Meal) => {
    const newMeals = meals.map((m) => {
      if (m.id === meal.id) {
        return { ...m, items: m.items.filter((i) => i.name !== item.name) };
      }
      return m;
    });
    const newFoods = { ...foods };
    newFoods[item.name].inMeal = false;
    setMeals(newMeals);
    setFoods(newFoods);
  };

  const disableFood = (item: Food, meal?: Meal) => {
    if (meal) {
      removeFromMeal(item, meal);
    }
    const newFoods = { ...foods };
    newFoods[item.name].enabled = false;
    newFoods[item.name].inMeal = false;
    setFoods(newFoods);
  };

  const enabledFoods = Object.values(foods).filter(
    (food) => food.enabled && !food.required
  );
  const disabledFoods = Object.values(foods).filter((food) => !food.enabled);
  const requiredFoods = Object.values(foods).filter(
    (food) => food.enabled && food.required
  );

  const toggleRequired = (item: Food) => {
    const newFoods = { ...foods };
    newFoods[item.name].required = !newFoods[item.name].required;
    setFoods(newFoods);
  };

  const enableFood = (item: Food) => {
    const newFoods = { ...foods };
    newFoods[item.name].enabled = true;
    setFoods(newFoods);
  };

  const updateTarget = (
    nutrient: string,
    event: React.FocusEvent<HTMLSpanElement>,
    key: "min" | "max"
  ) => {
    const newTarget = parseFloat(event.target.textContent || "0");
    if (!isNaN(newTarget)) {
      const newRanges = { ...ranges };
      if (key === "min" && newTarget > newRanges[nutrient].max) {
        newRanges[nutrient][key] = newRanges[nutrient].max;
      } else if (key === "max" && newTarget < newRanges[nutrient].min) {
        newRanges[nutrient][key] = newRanges[nutrient].min;
      } else {
        newRanges[nutrient][key] = newTarget;
      }
      setRanges(newRanges);
      updateRanges();
    }
  };

  const getProgressPercentage = (quota: Range) => {
    return Math.min((quota.total / quota.max) * 100, 100);
  };

  const getProgressColor = (quota: Range) => {
    if (quota.total < quota.min) {
      return "bg-yellow-500";
    } else if (quota.total <= quota.max) {
      return "bg-green-500";
    } else {
      return "bg-red-500";
    }
  };

  const preprocessFoodsByGroup = (
    foods: { [key: string]: Food },
    heuristic: (a: Food, b: Food) => boolean
  ) => {
    let selectedFoods: { [key: string]: Food } = {};
    const groupFoods: { [key: string]: Food[] } = {};

    for (const [food, food_data] of Object.entries(foods)) {
      if (!food_data.enabled) continue;

      const group = food_data.group;
      if (group === "") {
        selectedFoods[food] = food_data;
        continue;
      }

      if (!groupFoods[group]) {
        groupFoods[group] = [];
      }
      groupFoods[group].push({ ...food_data, name: food });
    }

    for (const [group, foodsInGroup] of Object.entries(groupFoods)) {
      let bestFood = foodsInGroup[0];

      for (const foodData of foodsInGroup) {
        if (heuristic(foodData, bestFood)) {
          bestFood = foodData;
        }
      }

      selectedFoods[bestFood.name] = bestFood;
    }

    return selectedFoods;
  };

  const lowestProteinCostHeuristic = (currentFood: Food, bestFood: Food) => {
    return (
      currentFood.protein / currentFood.cost > bestFood.protein / bestFood.cost
    );
  };

  const solveMealPlan = (foods: { [key: string]: Food }) => {
    let problem = {
      optimize: "cost",
      opType: "min",
      constraints: {
        calories: {
          min: ranges.Calories.min,
          max: ranges.Calories.max,
        },
        fat: {
          min: ranges.Fat.min,
          max: ranges.Fat.max,
        },
        carbs: {
          min: ranges.Carbs.min,
          max: ranges.Carbs.max,
        },
        protein: {
          min: ranges.Protein.min,
          max: ranges.Protein.max,
        },
      },
      variables: {} as any,
      ints: {} as any,
    };

    const selectedFoods = preprocessFoodsByGroup(
      foods,
      lowestProteinCostHeuristic
    );

    const display_groups = [
      "Morning snack",
      "Breakfast",
      "Afternoon snack",
      "Lunch",
      "Evening snack",
      "Dinner",
    ];

    for (const [food, food_data] of Object.entries(selectedFoods)) {
      if (!food_data.enabled) continue;

      const inMeal = meals.some((meal) =>
        meal.items.some((data) => data.name === food)
      );

      problem.variables[food] = {
        calories: food_data.calories * food_data.serving_step,
        fat: food_data.fat * food_data.serving_step,
        carbs: food_data.carbs * food_data.serving_step,
        protein: food_data.protein * food_data.serving_step,
        cost: food_data.cost * food_data.serving_step,
      };

      problem.variables[food][food] = food_data.serving_step;

      const min_serving = food_data.required ? food_data.min_serving : 0;
      const max_serving = food_data.max_serving;

      if (!inMeal) {
        problem.constraints[food] = {
          min: min_serving,
          max: max_serving,
        };
      } else {
        problem.constraints[food] = {
          equal: food_data.servings,
        };
      }
      problem.ints[`${food}`] = 1;

      if (
        food_data.display_group &&
        !display_groups.includes(food_data.display_group)
      ) {
        display_groups.push(food_data.display_group);
      }
    }

    const solution = solver.Solve(problem);
    console.log(problem);
    console.log(solution);

    displayMealPlan(solution, foods);
  };

  const displayMealPlan = (solution: any, foods: { [key: string]: Food }) => {
    const newMeals = meals.map((meal) => ({ ...meal, items: [] }));

    if (!solution.feasible) {
      console.log("No solution was found, displaying best idea");
      alert("No solution was found, displaying best idea");
      return;
    }

    const predefinedGroupOrder = [
      "Breakfast",
      "Morning snack",
      "Lunch",
      "Afternoon snack",
      "Dinner",
      "Evening snack",
    ];

    const foodsByGroup: { [key: string]: Food[] } = {};

    const sortedFoods = Object.entries(foods).sort(([foodA], [foodB]) =>
      foodA.localeCompare(foodB)
    );

    for (const [food, foodData] of sortedFoods) {
      const servings = solution[food] * foodData.serving_step;
      if (servings && servings !== 0) {
        const group = foodData.display_group || "Ungrouped";

        if (!foodsByGroup[group]) {
          foodsByGroup[group] = [];
        }

        foodsByGroup[group].push({
          ...foodData,
          name: food,
          servings: parseFloat(servings.toFixed(2)),
          calories: foodData.calories * servings,
          fat: foodData.fat * servings,
          carbs: foodData.carbs * servings,
          protein: foodData.protein * servings,
          cost: foodData.cost * servings,
        });
      }
    }

    const remainingGroups = Object.keys(foodsByGroup)
      .filter(
        (group) =>
          !predefinedGroupOrder.includes(group) && group !== "Ungrouped"
      )
      .sort();

    const groupOrder = [
      ...predefinedGroupOrder,
      ...remainingGroups,
      "Ungrouped",
    ];

    groupOrder.forEach((group) => {
      if (!foodsByGroup[group]) return;

      let meal = newMeals.find((meal) => meal.name === group);
      if (!meal) {
        meal = {
          id: newMeals.length + 1,
          name: group,
          items: [],
        };
        newMeals.push(meal);
      }

      foodsByGroup[group].forEach((food) => {
        const newFood = { ...foods[food.name], servings: food.servings };
        meal!.items.push(newFood);
      });
    });

    setMeals(newMeals);
  };

  const startSolve = () => {
    solveMealPlan(foods);
  };

  const saveToLocalStorage = () => {
    localStorage.setItem("foods", JSON.stringify(foods));
    localStorage.setItem("ranges", JSON.stringify(ranges));
  };

  const copyForTodoist = () => {
    let allItems = "";
    meals.forEach((meal) => {
      meal.items.forEach((food) => {
        allItems += `${food.name} x${food.servings.toFixed(1)}\n`;
      });
    });
    navigator.clipboard.writeText(allItems).then(
      () => {
        alert("Copied to clipboard");
      },
      () => {
        alert("Failed to copy");
      }
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Enhanced Meal Planner</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <Card>
              <CardHeader>
                <CardTitle>Meals (Total: ${price.toFixed(2)})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {meals.map((meal) => (
                    <div key={meal.id} className="mb-6">
                      <h3 className="text-xl font-semibold mb-2">
                        {meal.name}
                      </h3>
                      <Droppable droppableId={meal.id.toString()}>
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                          >
                            {meal.items.map((item, index) => (
                              <Draggable
                                key={item.name}
                                draggableId={item.name}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-secondary p-3 rounded-md"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium">
                                        {item.name}
                                      </span>
                                      <div className="flex items-center space-x-2">
                                        <Input
                                          type="number"
                                          value={item.servings}
                                          min={item.min_serving}
                                          max={item.max_serving}
                                          step={item.serving_step}
                                          onChange={(e) => {
                                            const newMeals = [...meals];
                                            const mealIndex =
                                              newMeals.findIndex(
                                                (m) => m.id === meal.id
                                              );
                                            const itemIndex = newMeals[
                                              mealIndex
                                            ].items.findIndex(
                                              (i) => i.name === item.name
                                            );
                                            newMeals[mealIndex].items[
                                              itemIndex
                                            ].servings = parseFloat(
                                              e.target.value
                                            );
                                            setMeals(newMeals);
                                          }}
                                          className="w-20"
                                        />
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() =>
                                            disableFood(item, meal)
                                          }
                                        >
                                          <Minus className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() =>
                                            removeFromMeal(item, meal)
                                          }
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      Calories: {item.calories}, Carbs:{" "}
                                      {item.carbs}g, Protein: {item.protein}g,
                                      Fat: {item.fat}g
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
            <Button onClick={startSolve} className="w-full mt-4">
              Generate Meal Plan
            </Button>
          </div>
          <div className="w-full lg:w-1/3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Required Foods</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <Droppable droppableId="required-foods">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {requiredFoods.map((item, index) => (
                          <Draggable
                            key={item.name}
                            draggableId={item.name}
                            index={index}
                            isDragDisabled={item.inMeal}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-secondary p-2 rounded-md flex justify-between items-center ${
                                  item.inMeal ? "opacity-50" : ""
                                }`}
                              >
                                <span>
                                  {item.name} - Calories: {item.calories}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleRequired(item)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Foods</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <Droppable droppableId="all-foods">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {enabledFoods.map((item, index) => (
                          <Draggable
                            key={item.name}
                            draggableId={item.name}
                            index={index}
                            isDragDisabled={item.inMeal}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-secondary p-2 rounded-md flex justify-between items-center ${
                                  item.inMeal ? "opacity-50" : ""
                                }`}
                              >
                                <span>
                                  {item.name} - Calories: {item.calories}
                                </span>
                                <div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => toggleRequired(item)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => disableFood(item)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disabled Foods</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {disabledFoods.map((item) => (
                      <div
                        key={item.name}
                        className="bg-secondary p-2 rounded-md flex justify-between items-center"
                      >
                        <span>
                          {item.name} - Calories: {item.calories}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => enableFood(item)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nutrition Quota</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(ranges).map(([key, quotas]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{key}</span>
                        <div className="text-sm">
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateTarget(key, e, "min")}
                            className="px-1 rounded bg-secondary"
                          >
                            {quotas.min}
                          </span>
                          <span> / {quotas.total.toFixed(2)} / </span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updateTarget(key, e, "max")}
                            className="px-1 rounded bg-secondary"
                          >
                            {quotas.max}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={getProgressPercentage(quotas)}
                        className={getProgressColor(quotas)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="fixed bottom-4 right-4 flex space-x-2">
          <Button onClick={saveToLocalStorage}>
            <Download className="h-4 w-4 mr-2" />
            Save to Browser
          </Button>
          <Button onClick={copyForTodoist}>
            <Copy className="h-4 w-4 mr-2" />
            Copy for Todoist
          </Button>
        </div>
      </div>
    </DragDropContext>
  );
}
