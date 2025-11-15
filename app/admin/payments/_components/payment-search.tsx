"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon, FilterIcon, XIcon } from "lucide-react";

interface PaymentSearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: { status?: string; category?: string }) => void;
  categories: string[];
  statuses: string[];
}

export function PaymentSearch({ onSearch, onFilter, categories, statuses }: PaymentSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all-statuses");
  const [selectedCategory, setSelectedCategory] = useState<string>("all-categories");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    onFilter({ 
      status: status === "all-statuses" ? undefined : status, 
      category: selectedCategory === "all-categories" ? undefined : selectedCategory 
    });
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    onFilter({ 
      status: selectedStatus === "all-statuses" ? undefined : selectedStatus, 
      category: category === "all-categories" ? undefined : category 
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all-statuses");
    setSelectedCategory("all-categories");
    onSearch("");
    onFilter({});
  };

  const hasActiveFilters = searchQuery || selectedStatus !== "all-statuses" || selectedCategory !== "all-categories";

  return (
    <div className="space-y-3 md:space-y-0 md:flex md:items-center md:gap-4 mb-4 md:mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
        <Input
          placeholder="Search by participant name, email, or event..."
          className="pl-8 md:pl-10 text-xs md:text-sm"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      
      {/* Filters Row */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 md:w-48 text-xs md:text-sm">
            <FilterIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-statuses">All Statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40 md:w-48 text-xs md:text-sm">
            <FilterIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-categories">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs md:text-sm">
            <XIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>
    </div>
  );
}