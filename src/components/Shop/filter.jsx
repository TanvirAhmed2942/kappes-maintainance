"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedCategory,
  setPriceRange,
  setLocation,
  resetFilters,
} from "../../features/filterSlice";
import { FaArrowRotateLeft } from "react-icons/fa6";
import { Card, CardContent } from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Slider } from "../../components/ui/slider";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "../../components/ui/drawer";
import { useGetCategoryQuery } from "../../redux/productApi/productApi";
import { useSearchParams } from "next/navigation";

const territoryList = ["Yukon", "Northwest Territories", "Nunavut"];
const provinceList = [
  "British Columbia",
  "Alberta",
  "Manitoba",
  "Saskatchewan",
  "Ontario",
  "Quebec",
  "New Brunswick",
  "Nova Scotia",
  "Prince Edward Island",
  "Newfoundland",
];
const cityList = ["city1", "city2", "city3", "city4"];

function MultiSelect({ label, options, selected, setSelected }) {
  const toggleOption = (value) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start bg-white text-left"
        >
          {selected.length > 0 ? selected.join(", ") : `Select ${label}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-h-60 overflow-y-auto">
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${label}-${option}`}
                checked={selected.includes(option)}
                onCheckedChange={() => toggleOption(option)}
                className="data-[state=checked]:bg-red-700 data-[state=checked]:border-none"
              />
              <label
                htmlFor={`${label}-${option}`}
                className="text-sm font-medium leading-none"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterContent() {
  const dispatch = useDispatch();
  const { selectedCategory, priceRangeLow, priceRangeHigh, location } =
    useSelector((state) => state.filter);
  const searchParams = useSearchParams();

  // Check if a specific category was selected from URL params
  const categoryParam = searchParams.get("category");
  const isSpecificCategorySelected = Boolean(categoryParam);

  // Fetch categories from API
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetCategoryQuery();

  // Extract categories from API response (note: API uses "categorys" not "categories")
  const categories = categoriesData?.data?.categorys || [];

  const [checkedCategories, setCheckedCategories] = useState(selectedCategory);
  const [priceRange, setPriceRangeState] = useState([
    priceRangeLow,
    priceRangeHigh,
  ]);
  const [territory, setTerritory] = useState(location.territory || []);
  const [province, setProvince] = useState(location.province || []);
  const [city, setCity] = useState(location.city || []);

  useEffect(() => {
    dispatch(setPriceRange({ low: priceRange[0], high: priceRange[1] }));
  }, [priceRange, dispatch]);

  useEffect(() => {
    dispatch(setSelectedCategory(checkedCategories));
  }, [checkedCategories, dispatch]);

  useEffect(() => {
    dispatch(setLocation({ territory, province, city }));
  }, [territory, province, city, dispatch]);

  const handleCategoryChange = (categoryId) => {
    setCheckedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleMinPriceChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      const numValue = value === "" ? 0 : parseInt(value, 10);
      const clampedValue = Math.max(
        0,
        Math.min(numValue, priceRange[1], 10000)
      );
      setPriceRangeState([clampedValue, priceRange[1]]);
    }
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      const numValue = value === "" ? 10000 : parseInt(value, 10);
      const clampedValue = Math.min(
        10000,
        Math.max(numValue, priceRange[0], 0)
      );
      setPriceRangeState([priceRange[0], clampedValue]);
    }
  };

  const handleMinPriceBlur = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    const clampedValue = Math.max(0, Math.min(value, priceRange[1], 10000));
    setPriceRangeState([clampedValue, priceRange[1]]);
  };

  const handleMaxPriceBlur = (e) => {
    const value = parseInt(e.target.value, 10) || 10000;
    const clampedValue = Math.min(10000, Math.max(value, priceRange[0], 0));
    setPriceRangeState([priceRange[0], clampedValue]);
  };

  const handleReset = () => {
    setCheckedCategories([]);
    setPriceRangeState([0, 10000]);
    setTerritory([]);
    setProvince([]);
    setCity([]);
    dispatch(resetFilters());
  };

  return (
    <div className="w-full max-w-md space-y-4 ">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Filter</h2>

        <FaArrowRotateLeft
          onClick={handleReset}
          className="cursor-pointer mr-4"
        />
      </div>
      <ScrollArea className="h-screen w-full mt-2 pr-4 flex flex-col gap-4">
        {/* Category Section - Hide when specific category is selected from URL */}
        <div className="h-full flex flex-col gap-4">
          {!isSpecificCategorySelected && (
            <Card className="border shadow-sm">
              <CardContent className="pt-4">
                <Label className="text-base font-medium">Category</Label>
                <ScrollArea className="h-64 w-full mt-2 pr-4">
                  {isLoadingCategories ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-gray-500">
                        Loading categories...
                      </div>
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
                        <div
                          key={category._id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            className="data-[state=checked]:bg-red-700 data-[state=checked]:border-none"
                            id={`category-${category._id}`}
                            checked={checkedCategories.includes(category._id)}
                            onCheckedChange={() =>
                              handleCategoryChange(category._id)
                            }
                          />
                          <label
                            htmlFor={`category-${category._id}`}
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
          )}

          {/* Price Range Section */}
          <Card className="border shadow-sm">
            <CardContent className="pt-4 pb-6">
              <Label className="text-base font-medium">Price Range</Label>

              {/* Input Fields for Min and Max Price */}
              <div className="mt-2 mb-4 flex items-center gap-2">
                <div className="flex-1">
                  <Label
                    htmlFor="min-price"
                    className="text-xs text-gray-500 mb-1 block"
                  >
                    Min
                  </Label>
                  <Input
                    id="min-price"
                    type="text"
                    inputMode="numeric"
                    value={priceRange[0]}
                    onChange={handleMinPriceChange}
                    onBlur={handleMinPriceBlur}
                    className="w-full p-1"
                    placeholder="0"
                  />
                </div>
                <div className="pt-6 px-2">
                  <span className="text-gray-400">-</span>
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="max-price"
                    className="text-xs text-gray-500 mb-1 block"
                  >
                    Max
                  </Label>
                  <Input
                    id="max-price"
                    type="text"
                    inputMode="numeric"
                    value={priceRange[1]}
                    onChange={handleMaxPriceChange}
                    onBlur={handleMaxPriceBlur}
                    className="w-full p-1"
                    placeholder="10000"
                  />
                </div>
              </div>

              {/* Slider */}
              <Slider
                value={priceRange}
                onValueChange={setPriceRangeState}
                min={0}
                max={10000}
                step={10}
                minStepsBetweenThumbs={1}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Location Section */}
          <Card className="border shadow-sm">
            <CardContent className="pt-4 space-y-3">
              <Label className="text-base font-medium">Location</Label>

              <MultiSelect
                label="Territory"
                options={territoryList}
                selected={territory}
                setSelected={setTerritory}
              />

              <MultiSelect
                label="Province"
                options={provinceList}
                selected={province}
                setSelected={setProvince}
              />

              <MultiSelect
                label="City"
                options={cityList}
                selected={city}
                setSelected={setCity}
              />
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}

function Filter({ filterVisible = true }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // Auto-open drawer on mobile when filterVisible becomes true
    const isMobile = window.innerWidth < 1024;
    if (isMobile && filterVisible) {
      setDrawerOpen(true);
    } else if (!filterVisible) {
      setDrawerOpen(false);
    }
  }, [filterVisible]);

  return (
    <>
      {/* Desktop View */}
      {filterVisible && (
        <div className="hidden lg:block w-60">
          <FilterContent />
        </div>
      )}

      {/* Mobile and Tablet View - Drawer only */}
      <div className="lg:hidden ">
        <Drawer direction="left" open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <div style={{ display: "none" }} />
          </DrawerTrigger>

          <DrawerContent className="h-full w-80 fixed inset-y-0 left-0 mt-0 rounded-none">
            <div className="p-4 overflow-y-auto max-h-full ">
              <FilterContent />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}

export default Filter;
