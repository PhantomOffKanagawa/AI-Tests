"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Minus, Save, ChevronRight, ChevronDown } from "lucide-react";
import Layout from "@/components/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicFood {
  id: string;
  name: string;
  type: "basic";
  cost: number;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
}

interface Recipe {
  id: string;
  name: string;
  type: "recipe";
  ingredients: Array<{
    item: FoodItem;
    quantity: number;
    unit: string;
  }>;
  instructions: string[];
  servings: number;
  cost: number;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
}

interface Meal {
  id: string;
  name: string;
  type: "meal";
  components: Array<{
    item: FoodItem;
    quantity: number;
  }>;
  cost: number;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
}

type FoodItem = BasicFood | Recipe | Meal;

export default function FoodsEditor() {
  const [foods, setFoods] = useState<{ [key: string]: FoodItem }>({});
  const [currentItem, setCurrentItem] = useState<FoodItem | null>(null);
  const [ingredients, setIngredients] = useState<Recipe["ingredients"]>([]);
  const [mealComponents, setMealComponents] = useState<Meal["components"]>([]);
  const [instruction, setInstruction] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    const storedFoods = localStorage.getItem("foods");
    if (storedFoods) {
      setFoods(JSON.parse(storedFoods));
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentItem((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { item: {} as BasicFood, quantity: 1, unit: "g" },
    ]);
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addMealComponent = () => {
    setMealComponents([
      ...mealComponents,
      { item: {} as FoodItem, quantity: 1 },
    ]);
  };

  const updateMealComponent = (index: number, field: string, value: any) => {
    const newComponents = [...mealComponents];
    newComponents[index] = { ...newComponents[index], [field]: value };
    setMealComponents(newComponents);
  };

  const removeMealComponent = (index: number) => {
    setMealComponents(mealComponents.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    if (currentItem && currentItem.type === "recipe") {
      setCurrentItem({
        ...currentItem,
        instructions: [...currentItem.instructions, instruction],
      });
      setInstruction("");
    }
  };

  const calculateNutrition = () => {
    if (currentItem) {
      let totalNutrition = {
        cost: 0,
        calories: 0,
        carbs: 0,
        fat: 0,
        protein: 0,
      };
      let items = currentItem.type === "recipe" ? ingredients : mealComponents;

      items.forEach((item) => {
        const quantity = item.quantity;
        totalNutrition.cost += item.item.cost * quantity;
        totalNutrition.calories += item.item.calories * quantity;
        totalNutrition.carbs += item.item.carbs * quantity;
        totalNutrition.fat += item.item.fat * quantity;
        totalNutrition.protein += item.item.protein * quantity;
      });

      if (currentItem.type === "recipe") {
        const servings = (currentItem as Recipe).servings;
        Object.keys(totalNutrition).forEach((key) => {
          totalNutrition[key as keyof typeof totalNutrition] /= servings;
        });
      }

      setCurrentItem({
        ...currentItem,
        ...totalNutrition,
        [currentItem.type === "recipe" ? "ingredients" : "components"]: items,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentItem) {
      const newFoods = { ...foods, [currentItem.id]: currentItem };
      setFoods(newFoods);
      localStorage.setItem("foods", JSON.stringify(newFoods));
      setCurrentItem(null);
      setIngredients([]);
      setMealComponents([]);
    }
  };

  const createNewItem = (type: "basic" | "recipe" | "meal") => {
    const id = Date.now().toString();
    const newItem: FoodItem = {
      id,
      name: "",
      type,
      cost: 0,
      calories: 0,
      carbs: 0,
      fat: 0,
      protein: 0,
      ...(type === "recipe"
        ? { ingredients: [], instructions: [], servings: 1 }
        : {}),
      ...(type === "meal" ? { components: [] } : {}),
    };
    setCurrentItem(newItem);
    if (type === "recipe") setIngredients([]);
    if (type === "meal") setMealComponents([]);
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderFoodItem = (item: FoodItem, depth = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    return (
      <div key={item.id} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="flex items-center">
          {(item.type === "recipe" || item.type === "meal") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpand(item.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          <span>
            {item.name} ({item.type})
          </span>
        </div>
        {isExpanded && (item.type === "recipe" || item.type === "meal") && (
          <div className="ml-4">
            {item.type === "recipe" &&
              (item as Recipe).ingredients.map((ing) =>
                renderFoodItem(ing.item, depth + 1)
              )}
            {item.type === "meal" &&
              (item as Meal).components.map((comp) =>
                renderFoodItem(comp.item, depth + 1)
              )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Food, Recipe, and Meal Editor
        </h1>

        <div className="mb-4 space-x-2">
          <Button onClick={() => createNewItem("basic")}>New Basic Food</Button>
          <Button onClick={() => createNewItem("recipe")}>New Recipe</Button>
          <Button onClick={() => createNewItem("meal")}>New Meal</Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {currentItem
                ? `${
                    currentItem.type.charAt(0).toUpperCase() +
                    currentItem.type.slice(1)
                  } Editor`
                : "Editor"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentItem && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={currentItem.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {currentItem.type === "recipe" && (
                  <>
                    <div>
                      <Label>Ingredients</Label>
                      {ingredients.map((ing, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 mt-2"
                        >
                          <Select
                            onValueChange={(value) =>
                              updateIngredient(index, "item", foods[value])
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select ingredient" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(foods).map(([id, food]) => (
                                <SelectItem key={id} value={id}>
                                  {food.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            value={ing.quantity}
                            onChange={(e) =>
                              updateIngredient(
                                index,
                                "quantity",
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-20"
                          />
                          <Input
                            value={ing.unit}
                            onChange={(e) =>
                              updateIngredient(index, "unit", e.target.value)
                            }
                            className="w-20"
                          />
                          <Button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            variant="destructive"
                            size="icon"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={addIngredient}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Ingredient
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="instructions">Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        className="mb-2"
                      />
                      <Button type="button" onClick={addInstruction}>
                        <Plus className="h-4 w-4 mr-2" /> Add Instruction
                      </Button>
                      {(currentItem as Recipe).instructions.map(
                        (inst, index) => (
                          <p key={index} className="mt-2">
                            {index + 1}. {inst}
                          </p>
                        )
                      )}
                    </div>

                    <div>
                      <Label htmlFor="servings">Servings</Label>
                      <Input
                        type="number"
                        id="servings"
                        name="servings"
                        value={(currentItem as Recipe).servings}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </>
                )}

                {currentItem.type === "meal" && (
                  <div>
                    <Label>Meal Components</Label>
                    {mealComponents.map((comp, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 mt-2"
                      >
                        <Select
                          onValueChange={(value) =>
                            updateMealComponent(index, "item", foods[value])
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select component" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(foods).map(([id, food]) => (
                              <SelectItem key={id} value={id}>
                                {food.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={comp.quantity}
                          onChange={(e) =>
                            updateMealComponent(
                              index,
                              "quantity",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-20"
                        />
                        <Button
                          type="button"
                          onClick={() => removeMealComponent(index)}
                          variant="destructive"
                          size="icon"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={addMealComponent}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Component
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      type="number"
                      id="calories"
                      name="calories"
                      value={currentItem.calories}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost">Cost</Label>
                    <Input
                      type="number"
                      id="cost"
                      name="cost"
                      value={currentItem.cost}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      type="number"
                      id="carbs"
                      name="carbs"
                      value={currentItem.carbs}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      type="number"
                      id="fat"
                      name="fat"
                      value={currentItem.fat}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      type="number"
                      id="protein"
                      name="protein"
                      value={currentItem.protein}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {(currentItem.type === "recipe" ||
                  currentItem.type === "meal") && (
                  <Button type="button" onClick={calculateNutrition}>
                    Calculate Nutrition
                  </Button>
                )}

                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" /> Save Item
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Food, Recipe, and Meal List</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {Object.values(foods).map((item) => renderFoodItem(item))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
