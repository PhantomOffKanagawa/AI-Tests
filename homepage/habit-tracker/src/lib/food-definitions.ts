export enum GenerateType {
  OnlyIncrease = "increase",
  OnlyDecrease = "decrease",
  KeepEqual = "equal",
  AnyWithinBounds = "bounded-any",
}

export enum MealReason {
  Manual = "manual",
  Generated = "generated",
}

export enum FoodType {
  Ingredient = "ingredient",
  Food = "Food",
  Recipe = "Recipe",
  Meal = "Meal",
}

interface PersistentGeneratable {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cost: number;
  // store: string; //! ??
  min_serving: number;
  max_serving: number;
  serving_step: number;
  enabled: boolean;
  required: boolean;
  display_group: string;
  group: string; //! Rename generate_group
}

interface LocalGeneratable extends PersistentGeneratable {
  key: string; //! Used for React key (generated)
  draggable_id: string; //! Used for Draggable key (generated)
  servings: number; //* Number of servings generated (local)
  meal_display_group: string; //* Group that food is dragged into (local)
  inMeal: boolean; //* Used to track if food dragged in meal (local)
  mealReason: MealReason; //* Used to track how food got to meal (local)
  generateType: GenerateType; //* Track what changes to make to food in generation, to be enum (local) ?
}

export interface BasicFood extends LocalGeneratable {
  type: FoodType.Food;
}

export interface Recipe extends LocalGeneratable {
  type: FoodType.Recipe;
  ingredients: Array<{
    item: BasicFood | Recipe;
    quantity: number;
    unit: string;
  }>;
  instructions: string[];
  //   servings: number; // How many it makes
}

export interface Meal extends LocalGeneratable {
  type: FoodType.Meal;
  components: Array<{
    item: BasicFood | Recipe | Meal;
    quantity: number;
  }>;
}

export type FoodItem = BasicFood | Recipe | Meal;

export interface GeneratorList {
  id: number;
  name: string;
  items: FoodItem[];
}

export interface Range {
  min: number;
  max: number;
  total: number;
}

export type GoalOptions = "Calories" | "Fat" | "Carbs" | "Protein";

export type GoalRanges = {
    [key in GoalOptions]: Range;
};

// {
//   Calories: Range;
//   Fat: Range;
//   Carbs: Range;
//   Protein: Range;
// }
