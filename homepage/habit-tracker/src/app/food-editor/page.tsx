"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Minus, X, RotateCcw, Download, Copy, Save } from "lucide-react";
import Layout from "@/components/Layout";

interface Food {
  name: string;
  cost: number;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  min_serving: number;
  max_serving: number;
  serving_step: number;
  group: string;
  display_group: string;
  required: boolean;
  enabled: boolean;
}

const initialForm = {
  name: "",
  cost: 0,
  calories: 0,
  carbs: 0,
  fat: 0,
  protein: 0,
  min_serving: 1,
  max_serving: 1,
  serving_step: 0.5,
  group: "",
  display_group: "",
  required: false,
  enabled: true,
};

export default function FoodsEditor() {
  const [foods, setFoods] = useState<{ [key: string]: Food }>({});
  const [form, setForm] = useState<Food>(initialForm);

  useEffect(() => {
    const storedFoods = localStorage.getItem("foods");
    if (storedFoods) {
      setFoods(JSON.parse(storedFoods));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFoods = { ...foods, [form.name]: form };
    setFoods(newFoods);
    localStorage.setItem("foods", JSON.stringify(newFoods));
    setForm(initialForm);
  };

  const loadFood = (name: string) => {
    setForm(foods[name]);
  };

  const deleteFood = (name: string) => {
    const newFoods = { ...foods };
    delete newFoods[name];
    setFoods(newFoods);
    localStorage.setItem("foods", JSON.stringify(newFoods));
  };

  const downloadJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(foods));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "foods.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          setFoods(jsonData);
          localStorage.setItem("foods", JSON.stringify(jsonData));
          alert("File parsed successfully!");
        } catch (error) {
          alert("Error parsing JSON: " + error);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please drop a valid JSON file.");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Food Editor</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add/Edit Food</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Hamburger"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    type="number"
                    id="cost"
                    name="cost"
                    value={form.cost}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    placeholder="1.99"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    type="number"
                    id="calories"
                    name="calories"
                    value={form.calories}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    type="number"
                    id="carbs"
                    name="carbs"
                    value={form.carbs}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    type="number"
                    id="fat"
                    name="fat"
                    value={form.fat}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    type="number"
                    id="protein"
                    name="protein"
                    value={form.protein}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.1"
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="min_serving">Min Servings</Label>
                  <Input
                    type="number"
                    id="min_serving"
                    name="min_serving"
                    value={form.min_serving}
                    onChange={handleInputChange}
                    min="0.5"
                    step="0.5"
                    placeholder="1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="max_serving">Max Servings</Label>
                  <Input
                    type="number"
                    id="max_serving"
                    name="max_serving"
                    value={form.max_serving}
                    onChange={handleInputChange}
                    min="0.5"
                    step="0.5"
                    placeholder="1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="serving_step">Serving Step</Label>
                  <Input
                    type="number"
                    id="serving_step"
                    name="serving_step"
                    value={form.serving_step}
                    onChange={handleInputChange}
                    min="0.5"
                    step="0.5"
                    placeholder="0.5"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="group">Group</Label>
                  <Input
                    type="text"
                    id="group"
                    name="group"
                    value={form.group}
                    onChange={handleInputChange}
                    placeholder="proteinBar"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="display_group">Display Group</Label>
                  <Input
                    type="text"
                    id="display_group"
                    name="display_group"
                    value={form.display_group}
                    onChange={handleInputChange}
                    placeholder="Dinner"
                    list="display-groups"
                    className="mt-1"
                  />
                  <datalist id="display-groups">
                    <option value="Breakfast" />
                    <option value="Lunch" />
                    <option value="Dinner" />
                    <option value="Morning snack" />
                    <option value="Afternoon snack" />
                    <option value="Evening snack" />
                  </datalist>
                </div>
                <div className="flex items-center space-x-4 mt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="required"
                      name="required"
                      checked={form.required}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          required: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="required">Required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enabled"
                      name="enabled"
                      checked={form.enabled}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          enabled: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="enabled">Enabled</Label>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto">
                Add/Update Food
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Food List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Calories</TableHead>
                    <TableHead>Carbs</TableHead>
                    <TableHead>Fat</TableHead>
                    <TableHead>Protein</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(foods).map(([name, food]) => (
                    <TableRow key={name}>
                      <TableCell>{name}</TableCell>
                      <TableCell>${food.cost.toFixed(2)}</TableCell>
                      <TableCell>{food.calories}</TableCell>
                      <TableCell>{food.carbs}g</TableCell>
                      <TableCell>{food.fat}g</TableCell>
                      <TableCell>{food.protein}g</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => loadFood(name)}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => deleteFood(name)}
                            variant="destructive"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div
          className="mt-8 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
        >
          <p className="text-lg text-gray-600">
            Drop JSON files here to import
          </p>
        </div>

        <div className="fixed bottom-4 right-4 flex space-x-2">
          <Button onClick={downloadJSON}>
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
          <Button
            onClick={() => localStorage.setItem("foods", JSON.stringify(foods))}
          >
            <Save className="h-4 w-4 mr-2" />
            Save to Browser
          </Button>
        </div>
      </div>
    </Layout>
  );
}
