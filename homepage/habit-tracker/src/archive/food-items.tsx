// // Meal Food Item Simple-ish

// <div
// ref={provided.innerRef}
// {...provided.draggableProps}
// {...provided.dragHandleProps}
// className="bg-secondary p-3 rounded-md"
// >
// <div className="flex justify-between items-center">
//   <span className="font-medium">
//     {getIcon(item)}
//     {item.name}
//   </span>
//   <div className="flex items-center space-x-2">
//     <Input
//       type="number"
//       value={item.servings}
//       // # Limit by min/max or no?
//       // min={item.min_serving}
//       // max={item.max_serving}
//       min={0}
//       max={9999}
//       step={item.serving_step}
//       onChange={(e) =>
//         updateServings(e, meal, item)
//       }
//       className="w-20"
//     />
//     <Button
//       size="icon"
//       variant="outline"
//       onClick={() =>
//         disableFood(item, meal)
//       }
//     >
//       <Minus className="h-4 w-4" />
//     </Button>
//     <Button
//       size="icon"
//       variant="outline"
//       onClick={() =>
//         removeFromMeal(item, meal)
//       }
//     >
//       <X className="h-4 w-4" />
//     </Button>
//   </div>
// </div>
// <div className="text-sm text-muted-foreground mt-1">
//   Calories: {item.calories}, Carbs:{" "}
//   {item.carbs}g, Protein: {item.protein}g,
//   Fat: {item.fat}g
// </div>
// {/* <span>Calories: {item.calories}</span>
// <span>Carbs: {item.carbs}g</span>
// <span>Protein: {item.protein}g</span>
// <span>Fat: {item.fat}g</span> */}
// </div>