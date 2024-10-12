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
import { Plus, Minus, Save } from "lucide-react";
import Layout from "@/components/Layout";

interface BasicFood {
  id: string;
  name: string;
  type: 'basic';
  cost: number;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
}

interface Recipe {
  id: string;
  name: string;
  type: 'recipe';
  ingredients: Array<{
    item: BasicFood | Recipe;
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

type FoodItem = BasicFood | Recipe;

export default function FoodsEditor() {
  const [foods, setFoods] = useState<{ [key: string]: FoodItem }>({});
  const [currentItem, setCurrentItem] = useState<FoodItem | null>(null);
  const [ingredients, setIngredients] = useState<Recipe['ingredients']>([]);
  const [instruction, setInstruction] = useState("");

  useEffect(() => {
    const storedFoods = localStorage.getItem("foods");
    if (storedFoods) {
      setFoods(JSON.parse(storedFoods));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentItem(prev => prev ? { ...prev, [name]: value } : null);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { item: {} as BasicFood, quantity: 1, unit: 'g' }]);
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    if (currentItem && currentItem.type === 'recipe') {
      setCurrentItem({
        ...currentItem,
        instructions: [...currentItem.instructions, instruction]
      });
      setInstruction("");
    }
  };

  const calculateNutrition = () => {
    if (currentItem && currentItem.type === 'recipe') {
      const totalNutrition = ingredients.reduce((acc, ing) => {
        const item = ing.item;
        const quantity = ing.quantity;
        return {
          cost: acc.cost + (item.cost * quantity),
          calories: acc.calories + (item.calories * quantity),
          carbs: acc.carbs + (item.carbs * quantity),
          fat: acc.fat + (item.fat * quantity),
          protein: acc.protein + (item.protein * quantity),
        };
      }, { cost: 0, calories: 0, carbs: 0, fat: 0, protein: 0 });

      setCurrentItem({
        ...currentItem,
        ...totalNutrition,
        ingredients: ingredients
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
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Food and Recipe Editor</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{currentItem?.type === 'recipe' ? 'Recipe Editor' : 'Food Editor'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={currentItem?.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {currentItem?.type === 'recipe' && (
                <>
                  <div>
                    <Label>Ingredients</Label>
                    {ingredients.map((ing, index) => (
                      <div key={index} className="flex items-center space-x-2 mt-2">
                        <select
                          value={ing.item.id}
                          onChange={(e) => updateIngredient(index, 'item', foods[e.target.value])}
                          className="flex-grow"
                        >
                          <option value="">Select an ingredient</option>
                          {Object.entries(foods).map(([id, food]) => (
                            <option key={id} value={id}>{food.name}</option>
                          ))}
                        </select>
                        <Input
                          type="number"
                          value={ing.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                          className="w-20"
                        />
                        <Input
                          value={ing.unit}
                          onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                          className="w-20"
                        />
                        <Button type="button" onClick={() => removeIngredient(index)} variant="destructive" size="icon">
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" onClick={addIngredient} className="mt-2">
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
                    {currentItem.instructions.map((inst, index) => (
                      <p key={index} className="mt-2">{index + 1}. {inst}</p>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="servings">Servings</Label>
                    <Input
                      type="number"
                      id="servings"
                      name="servings"
                      value={currentItem.servings}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <Button type="button" onClick={calculateNutrition}>
                    Calculate Nutrition
                  </Button>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    type="number"
                    id="calories"
                    name="calories"
                    value={currentItem?.calories || 0}
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
                    value={currentItem?.cost || 0}
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
                    value={currentItem?.carbs || 0}
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
                    value={currentItem?.fat || 0}
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
                    value={currentItem?.protein || 0}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <Button type="submit">
                <Save className="h-4 w-4 mr-2" /> Save Item
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Food and Recipe List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Calories</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(foods).map(([id, item]) => (
                  <TableRow key={id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.calories}</TableCell>
                    <TableCell>${item.cost.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button onClick={() => setCurrentItem(item)} variant="outline" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}