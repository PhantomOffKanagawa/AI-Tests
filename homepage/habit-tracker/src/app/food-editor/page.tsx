"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Food {
  name: string
  cost: number
  calories: number
  carbs: number
  fat: number
  protein: number
  min_serving: number
  max_serving: number
  serving_step: number
  group: string
  display_group: string
  required: boolean
  enabled: boolean
}

const initialForm = {
  name: '',
  cost: 0,
  calories: 0,
  carbs: 0,
  fat: 0,
  protein: 0,
  min_serving: 1,
  max_serving: 1,
  serving_step: 0.5,
  group: '',
  display_group: '',
  required: false,
  enabled: true,
}

export default function FoodsEditor() {
  const [foods, setFoods] = useState<{[key: string]: Food}>({})
  const [form, setForm] = useState<Food>(initialForm)

  useEffect(() => {
    const storedFoods = localStorage.getItem('foods')
    if (storedFoods) {
      setFoods(JSON.parse(storedFoods))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newFoods = { ...foods, [form.name]: form }
    setFoods(newFoods)
    localStorage.setItem('foods', JSON.stringify(newFoods))
    setForm(initialForm)
  }

  const loadFood = (name: string) => {
    setForm(foods[name])
  }

  const deleteFood = (name: string) => {
    const newFoods = { ...foods }
    delete newFoods[name]
    setFoods(newFoods)
    localStorage.setItem('foods', JSON.stringify(newFoods))
  }

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(foods))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "foods.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file && file.type === "application/json") {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string)
          setFoods(jsonData)
          localStorage.setItem('foods', JSON.stringify(jsonData))
          alert("File parsed successfully!")
        } catch (error) {
          alert("Error parsing JSON: " + error)
        }
      }
      reader.readAsText(file)
    } else {
      alert("Please drop a valid JSON file.")
    }
  }

  return (
    <div className="container my-5">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <Label htmlFor="name">Name:</Label>
            <Input type="text" id="name" name="name" value={form.name} onChange={handleInputChange} required placeholder="Hamburger" />
          </div>
          <div className="col-md-3">
            <Label htmlFor="cost">Cost:</Label>
            <Input type="number" id="cost" name="cost" value={form.cost} onChange={handleInputChange} required step="0.01" placeholder="1.99" />
          </div>
          <div className="col-md-3">
            <Label htmlFor="calories">Calories:</Label>
            <Input type="number" id="calories" name="calories" value={form.calories} onChange={handleInputChange} required min="0" placeholder="0" />
          </div>
        </div>
        <div className="row g-3 mt-2">
          <div className="col-md-4">
            <Label htmlFor="carbs">Carbs (g):</Label>
            <Input type="number" id="carbs" name="carbs" value={form.carbs} onChange={handleInputChange} required min="0" step="0.1" placeholder="0" />
          </div>
          <div className="col-md-4">
            <Label htmlFor="fat">Fat (g):</Label>
            <Input type="number" id="fat" name="fat" value={form.fat} onChange={handleInputChange} required min="0" step="0.1" placeholder="0" />
          </div>
          <div className="col-md-4">
            <Label htmlFor="protein">Protein (g):</Label>
            <Input type="number" id="protein" name="protein" value={form.protein} onChange={handleInputChange} required min="0" step="0.1" placeholder="0" />
          </div>
        </div>
        <div className="row g-3 mt-2">
          <div className="col-md-4">
            <Label htmlFor="min_serving">Min Servings:</Label>
            <Input type="number" id="min_serving" name="min_serving" value={form.min_serving} onChange={handleInputChange} min="0.5" step="0.5" placeholder="1" />
          </div>
          <div className="col-md-4">
            <Label htmlFor="max_serving">Max Servings:</Label>
            <Input type="number" id="max_serving" name="max_serving" value={form.max_serving} onChange={handleInputChange} min="0.5" step="0.5" placeholder="1" />
          </div>
          <div className="col-md-4">
            <Label htmlFor="serving_step">Serving Step:</Label>
            <Input type="number" id="serving_step" name="serving_step" value={form.serving_step} onChange={handleInputChange} min="0.5" step="0.5" placeholder="0.5" />
          </div>
        </div>
        <div className="row g-3 mt-2">
          <div className="col-md-4">
            <Label htmlFor="group">Group:</Label>
            <Input type="text" id="group" name="group" value={form.group} onChange={handleInputChange} placeholder="proteinBar" />
          </div>
          <div className="col-md-4">
            <Label htmlFor="display_group">Display Group:</Label>
            <Input type="text" id="display_group" name="display_group" value={form.display_group} onChange={handleInputChange} placeholder="Dinner" list="display-groups" />
            <datalist id="display-groups">
              <option value="Breakfast" />
              <option value="Lunch" />
              <option value="Dinner" />
              <option value="Morning snack" />
              <option value="Afternoon snack" />
              <option value="Evening snack" />
            </datalist>
          </div>
          <div className="col-md-2">
            <div className="form-check mt-4">
              <Checkbox id="required" name="required" checked={form.required} onCheckedChange={(checked) => setForm(prev => ({ ...prev, required: checked as boolean }))} />
              <Label htmlFor="required" className="form-check-label">Required</Label>
            </div>
          </div>
          <div className="col-md-2">
            <div className="form-check mt-4">
              <Checkbox id="enabled" name="enabled" checked={form.enabled} onCheckedChange={(checked) => setForm(prev => ({ ...prev, enabled: checked as boolean }))} />
              <Label htmlFor="enabled" className="form-check-label">Enabled</Label>
            </div>
          </div>
        </div>
        <Button type="submit" className="btn btn-primary mt-3">Add/Update Food</Button>
      </form>

      <div className="sticky-button">
        <Button className="btn btn-primary mt-1" onClick={downloadJSON}>
          Download JSON
        </Button>
        <Button className="btn btn-primary mt-1" onClick={() => localStorage.setItem('foods', JSON.stringify(foods))}>
          Save to Browser
        </Button>
      </div>

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
              <TableCell>{food.cost}</TableCell>
              <TableCell>{food.calories}</TableCell>
              <TableCell>{food.carbs}</TableCell>
              <TableCell>{food.fat}</TableCell>
              <TableCell>{food.protein}</TableCell>
              <TableCell>
                <Button onClick={() => loadFood(name)} className="btn btn-secondary btn-sm me-2">Edit</Button>
                <Button onClick={() => deleteFood(name)} className="btn btn-danger btn-sm">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div 
        className="drop-zone py-4 mt-4" 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
      >
        Drop JSON files here
      </div>
    </div>
  )
}