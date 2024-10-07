"use client";

import React, { useState, useEffect, useCallback, useRef, ReactElement } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Plus,
  Minus,
  X,
  RotateCcw,
  Download,
  Copy,
  Save,
  Utensils,
  Lock,
  Heart,
  Computer,
  Search,
  Drumstick,
  Salad,
  Hand,
} from "lucide-react";
import Layout from "@/components/Layout";

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
  meal_display_group: string;
  group: string;
  key: string; // Used for React key
  draggable_id: string; // Used for Draggable key
  inMeal: boolean; // Used to track if food dragged in meal
  mealReason: string; // Used to track how food got to meal
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

  // Handle search states
  const [activeMealSearch, setActiveMealSearch] = useState<number | null>(null);
  const [allFoodsSearchTerm, setAllFoodsSearchTerm] = useState("");
  const [showAllFoodsSearch, setShowAllFoodsSearch] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const allFoodsSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedFoods = localStorage.getItem("foods");
    const storedRanges = localStorage.getItem("ranges");

    var foodsWithIds: { [key: string]: any } = {};
    if (storedFoods) {
      foodsWithIds = JSON.parse(storedFoods);
      // Convert the names to safe draggable IDs

      for (let key in foodsWithIds) {
        foodsWithIds[key].name = key;

        // const draggableId = foodName.replace(/\s+/g, "_");
        const draggableId = encodeURIComponent(key);

        foodsWithIds[key].key = draggableId;
        foodsWithIds[key].draggable_id = draggableId;
      }
    }

    // if (storedFoods) setFoods(JSON.parse(storedFoods));
    if (storedFoods) setFoods(foodsWithIds);
    if (storedRanges) setRanges(JSON.parse(storedRanges));
  }, []);

  useEffect(() => {
    updateRanges();
  }, [meals]);

  useEffect(() => {
    if (activeMealSearch !== null && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [activeMealSearch]);

  useEffect(() => {
    if (showAllFoodsSearch && allFoodsSearchInputRef.current) {
      allFoodsSearchInputRef.current.focus();
    }
  }, [showAllFoodsSearch]);

  const restrictToNumbers = (event: KeyboardEvent) => {
    // Allow control keys like backspace, delete, arrow keys
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
    ];

    // Allow numeric keys and period for decimals
    const isNumber =
      (event.key >= "0" && event.key <= "9") || event.key === ".";

    // If the key pressed is not a number and not allowed control keys, prevent it
    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  };

  const clearMeals = () => {
    const newMeals = [
      { id: 1, name: "Breakfast", items: [] },
      { id: 3, name: "Lunch", items: [] },
      { id: 5, name: "Dinner", items: [] },
    ];

    const newFoods = { ...foods };
    for (const key in newFoods) {
      newFoods[key].inMeal = false;
      newFoods[key].servings = newFoods[key].min_serving;
    }

    setMeals(newMeals);
    setFoods(foods);
  };

  // ! Will break if allow drag multiple instances of food
  const updateServings = (e: any, meal: Meal, food: Food) => {
    const newMeals = [...meals];
    const newFoods = { ...foods };

    const mealIndex = newMeals.findIndex((m) => m.id === meal.id);
    const itemIndex = newMeals[mealIndex].items.findIndex(
      (i) => i.name === food.name
    );
    const newServings: number = e.target.value
      ? parseFloat(parseFloat(e.target.value).toFixed(2))
      : 0;
    newMeals[mealIndex].items[itemIndex].servings = newServings;
    newMeals[mealIndex].items[itemIndex].mealReason = "manual";

    newFoods[food.name].servings = e.target.value;
    newFoods[food.name].mealReason = "manual";

    setMeals(newMeals);
    setFoods(newFoods);
  };

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
    const { source, destination, draggableId } = result;

    // console.log(result);

    if (!destination) {
      return;
    }

    // Get source & destination IDs
    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    // Keep local edited copies of foods and meals
    const newFoods = { ...foods };
    const newMeals = [...meals];

    // Function to get food item from a given droppable
    const getFood = (id: string, index: number): Food => {
      if (id === "required-foods") {
        const filteredFoods: Food[] = requiredFoods;
        return filteredFoods[index]; // Use filtered array and index properly
      } else if (id === "all-foods") {
        const filteredFoods: Food[] = filteredAllFoods;
        return filteredFoods[index]; // Use filtered array and index properly
      } else if (id === "disabled-foods") {
        const filteredFoods: Food[] = disabledFoods;
        return filteredFoods[index]; // Use filtered array and index properly
      }
      const meal = meals.find((m) => m.id === parseInt(id));
      return meal ? meal.items[index] : Object.values(foods)[0];
    };

    // Get the foodItem from the droppable
    const foodItem = getFood(sourceId, source.index);
    // const foodItem = foods[decodeURIComponent(draggableId)]

    // Update food properties based on destination
    // If not dropping into a meal
    const destMealIndex = newMeals.findIndex((m) => m.id === parseInt(destId));
    const sourceMealIndex = newMeals.findIndex(
      (m) => m.id === parseInt(sourceId)
    );
    if (destMealIndex === -1) {
      newFoods[foodItem.name].inMeal = false;

      if (destId === "required-foods") {
        newFoods[foodItem.name].required = true;
        newFoods[foodItem.name].enabled = true;
      } else if (destId === "all-foods") {
        newFoods[foodItem.name].required = false;
        newFoods[foodItem.name].enabled = true;
      } else if (destId === "disabled-foods") {
        newFoods[foodItem.name].enabled = false;
      }
    } else {
      // Dropped into a meal
      newFoods[foodItem.name].meal_display_group = newMeals[destMealIndex].name;
      newFoods[foodItem.name].mealReason = "manual";
      foodItem.mealReason = "manual";
      if (sourceMealIndex == -1)
        // If source was not a meal
        newFoods[foodItem.name].servings = foodItem.min_serving;
      // newFoods[foodItem.name].mealReason = "manual";
      if (sourceId === destId) {
        // If dragging within the same meal, rearrange the item
        const currentItems = newMeals[destMealIndex].items;
        const movedItem = currentItems[source.index]; // Get the item being dragged
        currentItems.splice(source.index, 1); // Remove it from the original position
        currentItems.splice(destination.index, 0, movedItem); // Insert it into the new position
        // newFoods[foodItem.name].inMeal = true;
      } else {
        // If dragging to a different meal
        const newFood = { ...foodItem, servings: 1, inMeal: true };
        newMeals[destMealIndex].items.splice(destination.index, 0, newFood);
        newFoods[foodItem.name].inMeal = true;
      }
    }

    // Remove from source if it's from a meal and not the same meal
    if (sourceMealIndex !== -1 && sourceId != destId) {
      newMeals[sourceMealIndex].items.splice(source.index, 1);
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

  const enabledFoods = Object.values(foods)
    .filter((food) => food.enabled && !food.required && !food.inMeal)
    .sort((foodA, foodB) => foodA.name.localeCompare(foodB.name));

  const disabledFoods = Object.values(foods)
    .filter((food) => !food.enabled && !food.inMeal)
    .sort((foodA, foodB) => foodA.name.localeCompare(foodB.name));
  const requiredFoods = Object.values(foods)
    .filter((food) => food.enabled && food.required && !food.inMeal)
    .sort((foodA, foodB) => foodA.name.localeCompare(foodB.name));

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

  const getSegments = (quota: Range) => {
    const segments = [];
    if (quota.total > quota.min)
      segments.push({
        value: (Math.min(quota.total, quota.max) / quota.max) * 100,
        color: quota.total < quota.max ? "bg-green-500" : "bg-red-500",
      });
    segments.push({
      value: Math.min(
        (Math.min(quota.min, quota.total) / quota.max) * 100,
        100
      ),
      // color: (quota.total < quota.min) ? 'bg-yellow-500' : 'bg-neutral-500'
      color: "bg-yellow-500",
    });
    return segments;
  };

  const addElement = (originalElement : ReactElement, newElement : ReactElement) => {
    return (
      <>
        {originalElement}
        {newElement}
      </>
    );
  }

  const getIcon = (food: Food) => {
    let icon = <></>;

    if (!food.enabled) {
      icon = <Lock className="h-4 w-4 inline me-2" />;
    } else if (food.required) {
      icon = <Heart className="h-4 w-4 inline me-2" />;
    }

    if (food.inMeal && food.mealReason == "generated") {
      icon = addElement(<Computer className="h-4 w-4 inline me-2" />, icon);
    }

    // if (food.inMeal) {
    //   icon = addElement(<Salad className="h-4 w-4 inline me-2" />, icon);
    // }

    // if (food.mealReason == "manual") {
    //   icon = addElement(<Hand className="h-4 w-4 inline me-2" />, icon);
    // }

    return icon;
  };

  const preprocessFoodsByGroup = (
    foods: { [key: string]: Food },
    heuristic: (a: Food, b: Food) => boolean
  ) => {
    let selectedFoods: { [key: string]: Food } = {};
    const groupFoods: { [key: string]: Food[] } = {};

    for (const [food, food_data] of Object.entries(foods)) {
      if (!food_data.enabled && !food_data.inMeal) continue;

      const group = food_data.group;
      // If no group, add by default
      if (group === "") {
        selectedFoods[food] = food_data;
        continue;
      }

      // Add group if not already there
      if (!groupFoods[group]) {
        groupFoods[group] = [];
      }
      groupFoods[group].push({ ...food_data, name: food });
    }

    for (const [group, foodsInGroup] of Object.entries(groupFoods)) {
      let bestFood = foodsInGroup[0];
      let wasFoodInMeal = false;

      // Add all foods added by user
      // If there isn't a food added by user then choose best by heuristic
      for (const foodData of foodsInGroup) {
        if (foodData.inMeal) {
          console.log(`${foodData.name} was inMeal`);
          wasFoodInMeal = true;
          selectedFoods[foodData.name] = foodData;
        } else if (heuristic(foodData, bestFood)) {
          bestFood = foodData;
        }
      }

      console.log(`${bestFood.name} was best food and added ${!wasFoodInMeal}`);
      if (!wasFoodInMeal) selectedFoods[bestFood.name] = bestFood;
    }

    return selectedFoods;
  };

  const lowestProteinCostHeuristic = (currentFood: Food, bestFood: Food) => {
    return (
      currentFood.protein / currentFood.cost > bestFood.protein / bestFood.cost
    );
  };

  const solveMealPlan = (foods: { [key: string]: Food }) => {
    let problem: { optimize: string, opType: string, constraints: { [key: string]: { min?: number; max?: number, equal?: number } }, "variables": any, "ints": any } = {
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
      variables: {},
      ints: {},
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
      // if (!food_data.enabled && !food_data.inMeal) continue; // Handeled in Preprocess

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
          min: min_serving as number,
          max: max_serving as number,
        };
      } else {
        problem.constraints[food] = {
          equal: food_data.servings as number,
        };
      }
      problem.ints[`${food}`] = 1;

      if (
        food_data.inMeal &&
        !display_groups.includes(food_data.meal_display_group)
      )
        display_groups.push(food_data.meal_display_group);
      else if (
        food_data.display_group &&
        !display_groups.includes(food_data.display_group)
      ) {
        display_groups.push(food_data.display_group);
      }
    }

    
    const solution = solver.Solve(problem); // Can't find a way to fix as the library can't be imported to react, different lib?
    console.log(problem);
    console.log(solution);

    displayMealPlan(solution, foods);
  };

  const displayMealPlan = (solution: any, foods: { [key: string]: Food }) => {
    const newMeals = meals.map((meal) => ({ ...meal, items: [] }));
    const newFoods = { ...foods };

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
        const group = foodData.mealReason == "manual"
          ? foodData.meal_display_group
          : foodData.display_group || "Ungrouped";

        if (!foodsByGroup[group]) {
          foodsByGroup[group] = [];
        }

        const mealReason =
          !("mealReason" in newFoods[food]) ||
          newFoods[food].mealReason != "manual"
            ? "generated"
            : newFoods[food].mealReason;

        foodsByGroup[group].push({
          ...foodData,
          name: food,
          servings: parseFloat(servings.toFixed(2)),
          inMeal: true,
          mealReason: mealReason,
        });

        newFoods[food].servings = parseFloat(servings.toFixed(2));
        newFoods[food].inMeal = true;
        newFoods[food].mealReason = mealReason;
      } else {
        newFoods[food].inMeal = false;
      }
    }

    const remainingGroups = Object.keys(foodsByGroup)
      .filter((group) => !predefinedGroupOrder.includes(group))
      .sort();

    const groupOrder = [...predefinedGroupOrder, ...remainingGroups];

    groupOrder.forEach((group) => {
      if (!foodsByGroup[group]) return;

      let meal = newMeals.find((meal) => meal.name === group);
      if (!meal) {
        meal = {
          // ! Figure out this bs
          id: newMeals.length + 10,
          name: group,
          items: [],
        };
        newMeals.push(meal);
      }

      console.log(`Meal: ${meal.name} is id: ${meal.id}`);
      meal.items = [];
      foodsByGroup[group].forEach((food) => {
        if (!meal.items.some((item: Food) => item.name === food.name)) {
          meal.items.push(food as never); // Lol how does this work
        }
      });
    });

    setMeals(newMeals);
    setFoods(newFoods);
    console.log(foods);
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

  const handleSearch = (mealId: number) => {
    if (activeMealSearch === mealId) {
      setActiveMealSearch(null);
    } else {
      setActiveMealSearch(mealId);
    }
  };

  const addFoodToMeal = (food: Food, mealId: number) => {
    const newMeals = meals.map((meal) => {
      if (meal.id === mealId) {
        return {
          ...meal,
          items: [...meal.items, { ...food, servings: 1, inMeal: true }],
        };
      }
      return meal;
    });
    const newFoods = { ...foods };
    newFoods[food.name].inMeal = true;
    setMeals(newMeals);
    setFoods(newFoods);
    setActiveMealSearch(null);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setActiveMealSearch(null);
    }
  };

  const filteredFoods = Object.values(foods).filter(
    (food) => food.enabled && !food.inMeal
  );

  const filteredAllFoods = enabledFoods.filter((food) =>
    food.name.toLowerCase().includes(allFoodsSearchTerm.toLowerCase())
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <script src="/js/solver.js"></script>
      <Layout>
        <div className="container mx-auto px-4 py-8 max-h-screen">
          <h1 className="text-3xl font-bold mb-6">
            Enhanced Enhanced Meal Planner
          </h1>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3 h-full">
              <Card>
                <CardHeader className="bg-primary text-primary-foreground mb-4 rounded">
                  <CardTitle className="text-2xl flex items-center justify-between">
                    <span>Meals</span>
                    <span className="text-xl font-normal">
                      Total: ${price.toFixed(2)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] h-full pr-4">
                    {meals.map((meal) => (
                      <div key={meal.id} className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                            <Utensils className="mr-2 h-5 w-5" />
                            {meal.name}
                          </h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSearch(meal.id)}
                            className="flex items-center"
                          >
                            {activeMealSearch === meal.id ? (
                              <X className="h-4 w-4 mr-1" />
                            ) : (
                              <Plus className="h-4 w-4 mr-1" />
                            )}
                            {activeMealSearch === meal.id ? "Close" : "Add"}
                          </Button>
                        </div>
                        <Droppable droppableId={meal.id.toString()}>
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="min-h-20 bg-secondary rounded-md relative"
                            >
                              {activeMealSearch === meal.id && (
                                // Add "absolute if want overlay food items"
                                <div className="w-full z-20">
                                  <Command
                                    onKeyDown={handleSearchKeyDown}
                                    className="border"
                                  >
                                    <CommandInput
                                      placeholder="Search..."
                                      ref={searchInputRef}
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        No results found.
                                      </CommandEmpty>
                                      {filteredFoods.map((food, index) => (
                                        <CommandItem
                                          key={food.name}
                                          onSelect={() =>
                                            addFoodToMeal(food, meal.id)
                                          }
                                        >
                                          {food.name}
                                        </CommandItem>
                                      ))}
                                    </CommandList>
                                  </Command>
                                </div>
                              )}
                              {meal.items.map((item, index) => (
                                <Draggable
                                  key={item.draggable_id}
                                  draggableId={item.draggable_id + "_meal"}
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
                                          {getIcon(item)}
                                          {item.name}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                          <Input
                                            type="number"
                                            value={item.servings}
                                            // # Limit by min/max or no?
                                            // min={item.min_serving}
                                            // max={item.max_serving}
                                            min={0}
                                            max={9999}
                                            step={item.serving_step}
                                            onChange={(e) =>
                                              updateServings(e, meal, item)
                                            }
                                            className="w-20"
                                          />
                                          <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() =>
                                              disableFood(item, meal)
                                            }
                                          >
                                            <Minus className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            size="icon"
                                            variant="outline"
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
                                      {/* <span>Calories: {item.calories}</span>
                                      <span>Carbs: {item.carbs}g</span>
                                      <span>Protein: {item.protein}g</span>
                                      <span>Fat: {item.fat}g</span> */}
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
              <Button
                onClick={startSolve}
                className="w-full mt-4 transition-colors duration-200"
              >
                Generate Meal Plan
              </Button>
            </div>
            <div className="w-full lg:w-1/3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>All Foods</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAllFoodsSearch(!showAllFoodsSearch)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {showAllFoodsSearch && (
                    <div className="mb-4">
                      <Input
                        type="text"
                        placeholder="Search foods..."
                        value={allFoodsSearchTerm}
                        onChange={(e) => setAllFoodsSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key == "Escape") {
                            setShowAllFoodsSearch(false);
                          }
                        }}
                        className="w-full"
                        ref={allFoodsSearchInputRef}
                      />
                    </div>
                  )}
                  <ScrollArea className="h-[200px]">
                    <Droppable droppableId="all-foods">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2 h-full"
                        >
                          {filteredAllFoods.map((item, index) => (
                            <Draggable
                              key={item.draggable_id}
                              draggableId={item.draggable_id}
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
                                  <span>
                                    {getIcon(item)}
                                    {item.name}
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
                  </ScrollArea>
                </CardContent>
              </Card>

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
                          className="h-full space-y-2"
                        >
                          {requiredFoods.map((item, index) => (
                            <Draggable
                              key={item.draggable_id}
                              draggableId={item.draggable_id}
                              index={index}
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
                                    {getIcon(item)}
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
                  <CardTitle>Disabled Foods</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[100px]">
                    <Droppable droppableId="disabled-foods">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2 h-full"
                        >
                          {disabledFoods.map((item, index) => (
                            <Draggable
                              key={item.draggable_id}
                              draggableId={item.draggable_id}
                              index={index}
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
                                    {getIcon(item)}
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
                              )}
                            </Draggable>
                          ))}
                        </div>
                      )}
                    </Droppable>
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
                              onKeyDown={(e) => restrictToNumbers(e as unknown as KeyboardEvent)} // This is insane but what I want
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
                        <Progress segments={getSegments(quotas)} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="fixed bottom-4 right-4 flex space-x-2 z-50">
            <Button onClick={saveToLocalStorage}>
              <Copy className="h-4 w-4 mr-2" />
              Save to Browser
            </Button>
            <Button onClick={copyForTodoist}>
              <Copy className="h-4 w-4 mr-2" />
              Copy for Todoist
            </Button>
          </div>
        </div>
      </Layout>
    </DragDropContext>
  );
}
