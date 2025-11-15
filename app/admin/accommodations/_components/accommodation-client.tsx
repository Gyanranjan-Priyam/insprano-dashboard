"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Hotel,
  UtensilsCrossed,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  IndianRupee,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { CreateStayDialog } from "./create-stay-dialog";
import { CreateFoodDialog } from "./create-food-dialog";
import { EditStayDialog } from "./edit-stay-dialog";
import { EditFoodDialog } from "./edit-food-dialog";
import { deleteStay, deleteFood } from "../actions";
import { toast } from "sonner";

interface Stay {
  id: string;
  imageKey: string;
  roomPrice: number;
  place: string;
  createdAt: Date;
  updatedAt: Date;
}

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

interface AccommodationStatistics {
  totalStays: number;
  totalFoodItems: number;
  avgStayPrice: number;
}

interface AccommodationPageClientProps {
  stays: Stay[];
  foods: Food[];
  statistics: AccommodationStatistics;
  error?: string;
}

const WEEK_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER"];

export default function AccommodationPageClient({ 
  stays, 
  foods, 
  statistics, 
  error 
}: AccommodationPageClientProps) {
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isCreateStayOpen, setIsCreateStayOpen] = useState(false);
  const [isCreateFoodOpen, setIsCreateFoodOpen] = useState(false);
  const [isEditStayOpen, setIsEditStayOpen] = useState(false);
  const [isEditFoodOpen, setIsEditFoodOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  const formatWeekDay = (day: string) => {
    return day.charAt(0) + day.slice(1).toLowerCase();
  };

  const formatMealType = (meal: string) => {
    return meal.charAt(0) + meal.slice(1).toLowerCase();
  };

  const toggleDayExpansion = (day: string) => {
    const newExpandedDays = new Set(expandedDays);
    if (expandedDays.has(day)) {
      newExpandedDays.delete(day);
    } else {
      newExpandedDays.add(day);
    }
    setExpandedDays(newExpandedDays);
  };

  const handleDeleteStay = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stay?")) return;
    
    setIsLoading(true);
    try {
      const result = await deleteStay(id);
      if (result.status === "success") {
        toast.success("Stay deleted successfully");
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete stay");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFood = async (id: string) => {
    if (!confirm("Are you sure you want to delete this food item?")) return;
    
    setIsLoading(true);
    try {
      const result = await deleteFood(id);
      if (result.status === "success") {
        toast.success("Food item deleted successfully");
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete food item");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Accommodations Management</h1>
          <div className="text-red-600 text-sm md:text-base">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 md:py-6 space-y-4 md:space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold truncate">Accommodations Management</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage stay and food accommodations for events
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 bg-muted/50 px-3 py-2 rounded-lg">
          <Hotel className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-xs md:text-sm font-medium">
            {stays.length + foods.length} Items
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Hotel className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-semibold text-lg text-blue-600">{statistics.totalStays}</div>
                <div className="text-xs text-muted-foreground">Total Stays</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-green-600" />
              <div>
                <div className="font-semibold text-lg text-green-600">{statistics.totalFoodItems}</div>
                <div className="text-xs text-muted-foreground">Food Options</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-purple-600" />
              <div>
                <div className="font-semibold text-lg text-purple-600">₹{statistics.avgStayPrice}</div>
                <div className="text-xs text-muted-foreground">Avg Stay Price</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="stays" className="space-y-4">
        <TabsList className="grid w-full h-15 grid-cols-2">
          <TabsTrigger value="stays" className="flex items-center gap-2 text-xl">
            <Hotel className="w-4 h-4" />
            Stays ({stays.length})
          </TabsTrigger>
          <TabsTrigger value="foods" className="flex items-center gap-2 text-xl">
            <UtensilsCrossed className="w-4 h-4" />
            Foods ({foods.length})
          </TabsTrigger>
        </TabsList>

        {/* Stays Tab */}
        <TabsContent value="stays" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg md:text-xl">Stay Accommodations</CardTitle>
                <CardDescription className="text-sm">
                  Manage room bookings and stay options
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateStayOpen(true)} className="shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Add Stay
              </Button>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              {stays.length === 0 ? (
                <div className="text-center py-8 md:py-12 px-4">
                  <Hotel className="w-10 h-10 md:w-12 md:h-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">No stays yet</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Add your first stay accommodation to get started
                  </p>
                  <Button onClick={() => setIsCreateStayOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stay
                  </Button>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden space-y-3 p-4">
                    {stays.map((stay) => (
                      <Card key={stay.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={`https://registration.t3.storage.dev/${stay.imageKey}`}
                                alt={stay.place}
                                fill
                                className="object-cover"
                                priority
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{stay.place}</h4>
                              <div className="text-sm text-muted-foreground">
                                Added {formatDate(stay.createdAt)}
                              </div>
                              <div className="text-lg font-semibold text-green-600 mt-1">
                                ₹{stay.roomPrice}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedStay(stay);
                                    setIsEditStayOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteStay(stay.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">Image</TableHead>
                          <TableHead>Place</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stays.map((stay) => (
                          <TableRow key={stay.id}>
                            <TableCell>
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                                <Image
                                  src={`https://registration.t3.storage.dev/${stay.imageKey}`}
                                  alt={stay.place}
                                  fill
                                  className="object-cover"
                                  priority
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{stay.place}</div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  Location
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-green-600">₹{stay.roomPrice}</div>
                              <div className="text-xs text-muted-foreground">per room</div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{formatDate(stay.createdAt)}</div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedStay(stay);
                                      setIsEditStayOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteStay(stay.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Foods Tab */}
        <TabsContent value="foods" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg md:text-xl">Food Options</CardTitle>
                <CardDescription className="text-sm">
                  Manage daily meal plans and food items
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreateFoodOpen(true)} className="shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Add Food
              </Button>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              {foods.length === 0 ? (
                <div className="text-center py-8 md:py-12 px-4">
                  <UtensilsCrossed className="w-10 h-10 md:w-12 md:h-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">No food options yet</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Add your first food option to get started
                  </p>
                  <Button onClick={() => setIsCreateFoodOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Food
                  </Button>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden space-y-3 p-4">
                    {foods.map((food) => (
                      <Card key={food.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={`https://registration.t3.storage.dev/${food.imageKey}`}
                                alt={`${food.weekDay} ${food.mealType}`}
                                fill
                                className="object-cover"
                                priority
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{formatWeekDay(food.weekDay)}</Badge>
                                <Badge variant="secondary">{formatMealType(food.mealType)}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {food.foodItems.length} items
                              </div>
                              <div className="text-lg font-semibold text-green-600 mt-1">
                                ₹{food.pricePerDay}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedFood(food);
                                    setIsEditFoodOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteFood(food.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-2">
                            <div className="text-xs font-medium mb-1">Food Items:</div>
                            <div className="text-xs text-muted-foreground">
                              {food.foodItems.join(", ")}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Sl No.</TableHead>
                          <TableHead>Day</TableHead>
                          <TableHead>Total Price</TableHead>
                          <TableHead className="w-20">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {WEEK_DAYS.map((day, dayIndex) => {
                          const dayFoods = foods.filter(food => food.weekDay === day);
                          const totalDayPrice = dayFoods.reduce((sum, food) => sum + food.pricePerDay, 0);
                          const isExpanded = expandedDays.has(day);
                          
                          return (
                            <>
                              {/* Main Day Row */}
                              <TableRow key={day} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleDayExpansion(day)}>
                                <TableCell className="font-medium">
                                  {dayIndex + 1}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {dayFoods.length > 0 ? (
                                      isExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                      )
                                    ) : (
                                      <div className="w-4 h-4" />
                                    )}
                                    <div className="font-semibold text-base">
                                      {formatWeekDay(day)}
                                    </div>
                                    {dayFoods.length > 0 && (
                                      <Badge variant="outline" className="text-xs ml-2">
                                        {dayFoods.length} meal{dayFoods.length !== 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {dayFoods.length > 0 ? (
                                    <div className="font-bold text-xl text-green-600">
                                      ₹{totalDayPrice}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-muted-foreground italic">
                                      No meals planned
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {dayFoods.length === 0 && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setIsCreateFoodOpen(true);
                                      }}
                                      className="text-xs"
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add Meal
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                              
                              {/* Expanded Meal Details */}
                              {isExpanded && dayFoods.length > 0 && (
                                <TableRow>
                                  <TableCell colSpan={4} className="p-0">
                                    <div className="bg-muted/10 p-4 space-y-3">
                                      {dayFoods.map((food) => (
                                        <div key={food.id} className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                                            <Image
                                              src={`https://registration.t3.storage.dev/${food.imageKey}`}
                                              alt={`${food.weekDay} ${food.mealType}`}
                                              fill
                                              className="object-cover"
                                              priority
                                            />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Badge variant="secondary" className="text-xs">
                                                {formatMealType(food.mealType)}
                                              </Badge>
                                            </div>
                                            <div className="space-y-1">
                                              <div className="text-sm font-medium text-muted-foreground">Food Items:</div>
                                              <div className="text-sm">
                                                {food.foodItems.join(", ")}
                                              </div>
                                              <div className="text-lg font-semibold text-green-600 mt-2">
                                                ₹{food.pricePerDay}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="shrink-0">
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                  <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem 
                                                  onClick={() => {
                                                    setSelectedFood(food);
                                                    setIsEditFoodOpen(true);
                                                  }}
                                                >
                                                  <Edit className="w-4 h-4 mr-2" />
                                                  Edit {formatMealType(food.mealType)}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                  onClick={() => handleDeleteFood(food.id)}
                                                  className="text-red-600"
                                                >
                                                  <Trash2 className="w-4 h-4 mr-2" />
                                                  Delete {formatMealType(food.mealType)}
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateStayDialog 
        isOpen={isCreateStayOpen}
        onClose={() => setIsCreateStayOpen(false)}
      />
      
      <CreateFoodDialog 
        isOpen={isCreateFoodOpen}
        onClose={() => setIsCreateFoodOpen(false)}
      />
      
      {selectedStay && (
        <EditStayDialog 
          stay={selectedStay}
          isOpen={isEditStayOpen}
          onClose={() => {
            setIsEditStayOpen(false);
            setSelectedStay(null);
          }}
        />
      )}
      
      {selectedFood && (
        <EditFoodDialog 
          food={selectedFood}
          isOpen={isEditFoodOpen}
          onClose={() => {
            setIsEditFoodOpen(false);
            setSelectedFood(null);
          }}
        />
      )}
    </div>
  );
}