"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { updateFood } from "../actions";
import { toast } from "sonner";
import { MultipleUploader } from "@/components/file-uploader/MultipleUploader";

interface Food {
  id: string;
  weekDay: string;
  mealType: string;
  foodItems: string[];
  imageKey: string;
  pricePerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

interface EditFoodDialogProps {
  food: Food;
  isOpen: boolean;
  onClose: () => void;
}

const WEEK_DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const MEAL_TYPES = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
];

export function EditFoodDialog({ food, isOpen, onClose }: EditFoodDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    weekDay: "",
    mealType: "",
    pricePerDay: "",
    imageKey: "",
  });
  const [foodItems, setFoodItems] = useState<string[]>([]);
  const [newFoodItem, setNewFoodItem] = useState("");

  useEffect(() => {
    if (food) {
      setFormData({
        weekDay: food.weekDay,
        mealType: food.mealType,
        pricePerDay: food.pricePerDay.toString(),
        imageKey: food.imageKey,
      });
      setFoodItems(food.foodItems);
    }
  }, [food]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.weekDay || !formData.mealType || !formData.pricePerDay || !formData.imageKey || foodItems.length === 0) {
      toast.error("Please fill all fields, add food items, and upload an image");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateFood(food.id, {
        weekDay: formData.weekDay,
        mealType: formData.mealType,
        foodItems,
        pricePerDay: parseInt(formData.pricePerDay),
        imageKey: formData.imageKey,
      });

      if (result.status === "success") {
        toast.success("Food option updated successfully");
        onClose();
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update food option");
    } finally {
      setIsLoading(false);
    }
  };

  const addFoodItem = () => {
    if (newFoodItem.trim() && !foodItems.includes(newFoodItem.trim())) {
      setFoodItems([...foodItems, newFoodItem.trim()]);
      setNewFoodItem("");
    }
  };

  const removeFoodItem = (item: string) => {
    setFoodItems(foodItems.filter(food => food !== item));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFoodItem();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Food Option</DialogTitle>
          <DialogDescription>
            Update food option details
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weekDay">Week Day</Label>
              <Select value={formData.weekDay} onValueChange={(value) => setFormData(prev => ({ ...prev, weekDay: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {WEEK_DAYS.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mealType">Meal Type</Label>
              <Select value={formData.mealType} onValueChange={(value) => setFormData(prev => ({ ...prev, mealType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meal" />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPES.map((meal) => (
                    <SelectItem key={meal.value} value={meal.value}>
                      {meal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricePerDay">Price Per Day (₹)</Label>
            <Input
              id="pricePerDay"
              type="number"
              value={formData.pricePerDay}
              onChange={(e) => setFormData(prev => ({ ...prev, pricePerDay: e.target.value }))}
              placeholder="Enter price per day"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foodItems">Food Items</Label>
            <div className="flex gap-2">
              <Input
                id="foodItems"
                value={newFoodItem}
                onChange={(e) => setNewFoodItem(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter food item name"
              />
              <Button type="button" onClick={addFoodItem} variant="outline">
                Add
              </Button>
            </div>
            {foodItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {foodItems.map((item) => (
                  <Badge key={item} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => removeFoodItem(item)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Food Image</Label>
            <MultipleUploader
              value={formData.imageKey ? [formData.imageKey] : []}
              onChange={(keys) => setFormData(prev => ({ ...prev, imageKey: keys[0] || "" }))}
              maxFiles={1}
              minFiles={1}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Food Option"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}