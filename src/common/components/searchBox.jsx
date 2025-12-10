// export default SearchBox;
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import Image from "next/image";
import { useGetSearchProductsQuery } from "../../redux/productApi/productApi";
import { getImageUrl } from "../../redux/baseUrl";

function SearchBox({
  placeholder = "Search products by Name,Tags or Description",
  handleSearch,
  searchServices = [],
  searchType = "products", // "products" or "services"
}) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [imageErrors, setImageErrors] = useState(new Set());

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Product search API call
  const {
    data: productSearchData,
    isLoading: isProductLoading,
    error: productError,
  } = useGetSearchProductsQuery(
    { search: debouncedSearchTerm },
    {
      skip: !debouncedSearchTerm || searchType !== "products",
    }
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Immediately clear suggestions if input is empty
    if (!value.trim()) {
      setSuggestions([]);
      setDebouncedSearchTerm("");
      return;
    }

    if (searchType === "services") {
      // Handle service search
      const filteredSuggestions = searchServices.filter((service) =>
        service.serviceName.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(value ? filteredSuggestions : []);
    }
    // For products, suggestions will be set via useEffect when debounced term updates
  };

  // Update suggestions when product search data changes
  useEffect(() => {
    if (searchType === "products" && productSearchData?.data?.result) {
      setSuggestions(productSearchData.data.result);
      // Clear image errors when new suggestions load
      setImageErrors(new Set());
    } else if (searchType === "products" && !debouncedSearchTerm) {
      setSuggestions([]);
      setImageErrors(new Set());
    }
  }, [productSearchData, searchType, debouncedSearchTerm]);

  const handleSelectSuggestion = (suggestion) => {
    if (searchType === "services") {
      setInputValue(suggestion.serviceName);
      setSuggestions([]);
      handleSearch?.(suggestion.serviceName);
    } else {
      setInputValue(suggestion.name);
      setSuggestions([]);
      handleSearch?.(suggestion.name);
    }
  };

  const onSearchClick = () => {
    handleSearch?.(inputValue);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearchClick();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="relative flex w-full">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-l-md focus:outline-none bg-gray-100 focus:ring-1 focus:ring-gray-500"
        />
        <button
          onClick={onSearchClick}
          className="bg-kappes px-3 sm:px-4 lg:px-6 text-white rounded-r-md flex items-center justify-center cursor-pointer min-w-[44px] sm:min-w-[50px]"
          aria-label="Search"
        >
          <FiSearch className="text-white text-base sm:text-lg" />
        </button>
        {suggestions.length > 0 && inputValue.trim() ? (
          <ul className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <Link
                href={
                  searchType === "services"
                    ? `/trades-&-services/services/${suggestion.id}`
                    : `/product-page/${suggestion._id}`
                }
                key={suggestion._id || suggestion.id}
                onClick={() => {
                  // Clear everything when navigating
                  setSuggestions([]);
                  setInputValue("");
                  setDebouncedSearchTerm("");
                  setImageErrors(new Set());
                }}
              >
                <li className="px-4 py-2 text-sm sm:text-base cursor-pointer hover:bg-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {searchType === "products" && (
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={
                            imageErrors.has(suggestion._id)
                              ? "/assets/placeholder-product.png"
                              : suggestion.images?.[0]?.startsWith("http")
                              ? suggestion.images[0]
                              : suggestion.images?.[0]
                              ? `${getImageUrl}${
                                  suggestion.images[0].startsWith("/")
                                    ? suggestion.images[0].slice(1)
                                    : suggestion.images[0]
                                }`
                              : "/assets/placeholder-product.png"
                          }
                          alt={suggestion.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <span>
                      {searchType === "services"
                        ? suggestion.serviceName
                        : suggestion.name}
                    </span>
                  </div>
                  {searchType === "products" && (
                    <span className="text-xs text-gray-500 font-medium">
                      ${suggestion.basePrice}
                    </span>
                  )}
                </li>
              </Link>
            ))}
          </ul>
        ) : inputValue.trim() && debouncedSearchTerm && !isProductLoading ? (
          <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <p className="px-4 py-2 text-sm sm:text-base text-gray-500">
              No {searchType === "services" ? "services" : "products"} found for
              "{inputValue}"
            </p>
          </div>
        ) : inputValue.trim() && isProductLoading ? (
          <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <p className="px-4 py-2 text-sm sm:text-base text-gray-500">
              Searching...
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SearchBox;
