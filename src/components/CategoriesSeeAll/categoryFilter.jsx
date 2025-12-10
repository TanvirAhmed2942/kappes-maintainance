"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCategory } from "../../features/filterSlice";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { useGetCategoryQuery } from "../../redux/productApi/productApi";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { Button } from "../ui/button";
import { FiFilter } from "react-icons/fi";

function CategoryFilterContent() {
  const dispatch = useDispatch();
  const { selectedCategory } = useSelector((state) => state.filter);

  // Fetch categories from API
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetCategoryQuery();

  // Extract categories from API response (note: API uses "categorys" not "categories")
  const categories = categoriesData?.data?.categorys || [];

  const handleCategoryChange = (categoryId) => {
    // Update Redux directly when user clicks checkbox
    const newSelectedCategories = selectedCategory.includes(categoryId)
      ? selectedCategory.filter((c) => c !== categoryId)
      : [...selectedCategory, categoryId];

    dispatch(setSelectedCategory(newSelectedCategories));
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="pt-4">
        <Label className="text-base font-medium">Category</Label>
        <ScrollArea className="h-64 w-full mt-2 pr-4">
          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Loading categories...</div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">
                No categories available
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category._id} className="flex items-center space-x-2">
                  <Checkbox
                    className="data-[state=checked]:bg-red-700 data-[state=checked]:border-none"
                    id={`category-filter-${category._id}`}
                    checked={selectedCategory.includes(category._id)}
                    onCheckedChange={() => handleCategoryChange(category._id)}
                  />
                  <label
                    htmlFor={`category-filter-${category._id}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function CategoryFilter() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block w-60">
        <CategoryFilterContent />
      </div>

      {/* Mobile and Tablet View - Drawer */}
      <div className="lg:hidden">
        <Drawer direction="left" open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="mb-4 lg:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              <FiFilter className="w-4 h-4 mr-2" />
              Filter Categories
            </Button>
          </DrawerTrigger>

          <DrawerContent className="h-full w-80 fixed inset-y-0 left-0 mt-0 rounded-none">
            <div className="p-4 overflow-y-auto max-h-full">
              <CategoryFilterContent />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}

export default CategoryFilter;
