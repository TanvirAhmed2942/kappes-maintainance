"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import provideIcon from "../../common/components/provideIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

// All locations data with flags
const locationsData = {
  province: [
    {
      id: 1,
      name: "British Columbia",
      image: "/assets/province/britshColumbia.png",
    },
    { id: 2, name: "Alberta", image: "/assets/province/alberta.png" },
    { id: 3, name: "Manitoba", image: "/assets/province/manitoba.png" },
    { id: 4, name: "Saskatchewan", image: "/assets/province/saskatchewan.png" },
    { id: 5, name: "Ontario", image: "/assets/province/ontario.png" },
    { id: 6, name: "Quebec", image: "/assets/province/quebec.png" },
    {
      id: 7,
      name: "New Brunswick",
      image: "/assets/province/newBrunswick.png",
    },
    { id: 8, name: "Nova Scotia", image: "/assets/province/novaScotia.png" },
    {
      id: 9,
      name: "Prince Edward Island",
      image: "/assets/province/princeEdwardIsland.png",
    },
    {
      id: 10,
      name: "Newfoundland",
      image: "/assets/province/newFoundland.png",
    },
  ],
  territory: [
    { id: 1, name: "Yukon", image: "/assets/city/Yukon.png" },
    {
      id: 2,
      name: "Northwest Territories",
      image: "/assets/city/Northwest Territories.png",
    },
    { id: 3, name: "Nunavut", image: "/assets/city/Nunavut.png" },
  ],
  city: [
    { id: 1, name: "Toronto", image: "/assets/province/ontario.png" },
    { id: 2, name: "Vancouver", image: "/assets/province/britshColumbia.png" },
    { id: 3, name: "Montreal", image: "/assets/province/quebec.png" },
    { id: 4, name: "Calgary", image: "/assets/province/alberta.png" },
    { id: 5, name: "Edmonton", image: "/assets/province/alberta.png" },
    { id: 6, name: "Ottawa", image: "/assets/province/ontario.png" },
    { id: 7, name: "Winnipeg", image: "/assets/province/manitoba.png" },
    { id: 8, name: "Halifax", image: "/assets/province/novaScotia.png" },
  ],
};

function BottomNav() {
  const [selectedType, setSelectedType] = useState("province");
  const [selectedLocation, setSelectedLocation] = useState("");
  const router = useRouter();
  const currentPath = usePathname();

  // Helper function to check if a path is active
  const isActive = (href) => {
    if (!currentPath) return false;
    // Normalize paths to handle trailing slashes
    const normalizedCurrentPath = currentPath.split("?")[0].replace(/\/$/, "");
    const normalizedHref = href.replace(/\/$/, "");

    // For home page, only match exactly
    if (normalizedHref === "" || normalizedHref === "/") {
      return normalizedCurrentPath === "" || normalizedCurrentPath === "/";
    }

    // For other routes, check if current path starts with the href and either:
    // 1. They are exactly equal, or
    // 2. The next character after href in currentPath is "/" (to avoid partial matches)
    return (
      normalizedCurrentPath === normalizedHref ||
      (normalizedCurrentPath.startsWith(normalizedHref) &&
        (normalizedCurrentPath.charAt(normalizedHref.length) === "/" ||
          normalizedCurrentPath.charAt(normalizedHref.length) === ""))
    );
  };

  // Helper function to get link classes based on active state
  const getLinkClasses = (href, baseClasses = "") => {
    const active = isActive(href);
    return `${baseClasses} transition-all duration-300 ease-in-out relative ${
      active ? "" : ""
    }`;
  };

  // Custom Link component with hover animation
  const AnimatedLink = ({ href, children, className = "" }) => {
    const active = isActive(href);

    return (
      <Link href={href} className={`${className} relative group`}>
        {children}
        {/* Active state underline */}
        {active && (
          <div className="absolute bottom-[-4px] left-0 h-[2px] bg-white w-full" />
        )}
        {/* Hover state underline */}
        {!active && (
          <div className="absolute bottom-[-4px] left-0 h-[2px] bg-white w-0 group-hover:w-full transition-all duration-300 ease-in-out" />
        )}
      </Link>
    );
  };

  // Custom Shop Dropdown Button with hover animation
  const ShopDropdownButton = React.forwardRef((props, ref) => {
    const active = isShopActive();

    return (
      <button
        ref={ref}
        {...props}
        className={`bg-transparent px-2 flex gap-2 items-center transition-all duration-300 ease-in-out relative group cursor-pointer text-white ${
          active ? "" : ""
        }`}
      >
        <span>{provideIcon({ name: "shop" })}</span>
        <span>Shop</span>
        {/* Active state underline */}
        {active && (
          <div className="absolute bottom-[-4px] left-0 h-[2px] bg-white w-full" />
        )}
        {/* Hover state underline */}
        {!active && (
          <div className="absolute bottom-[-4px] left-0 h-[2px] bg-white w-0 group-hover:w-full transition-all duration-300 ease-in-out" />
        )}
      </button>
    );
  });

  ShopDropdownButton.displayName = "ShopDropdownButton";

  // Helper function specifically for drawer menu items
  const getDrawerLinkClasses = (href, baseClasses = "") => {
    const active = isActive(href);
    return `${baseClasses} ${
      active ? "text-red-800 font-semibold" : "hover:text-red-700"
    }`;
  };

  // Helper function for drawer submenu items (More section)
  const getDrawerSubLinkClasses = (href, baseClasses = "") => {
    const active = isActive(href);
    return `${baseClasses} ${
      active ? "text-red-800 font-semibold" : "hover:text-red-700"
    }`;
  };

  const links = [
    { id: 1, link: "Home", href: "/" },
    {
      id: 2,
      link: "Shop",
      href: "/shop",
      subLinks: [
        { id: 1, link: "All Products", href: "/shop" },
        { id: 2, link: "Shop By Province", href: "/shop-by-province" },
        { id: 3, link: "Shop By Territory", href: "/shop-by-territory" },
        { id: 4, link: "Shop By Store", href: "/shop-by-store" },
        { id: 5, link: "Trades & Services", href: "/trades-&-services" },
        { id: 6, link: "Deals & Offers", href: "/deals-&-offers" },
      ],
    },
    { id: 3, link: "About Us", href: "/about-us" },
    { id: 4, link: "Contact Us", href: "/contact-us" },
    { id: 5, link: "Become a Seller", href: "/auth/become-seller-login" },
    {
      id: 6,
      link: "More",
      href: "/",
      subLinks: [
        { id: 1, link: "FAQs", href: "/faq" },
        { id: 2, link: "T&C", href: "/terms-&-condition" },
        { id: 3, link: "Privacy Policy", href: "/privacy-policy" },
        { id: 4, link: "About Us", href: "/about-us" },
      ],
    },
  ];

  // Check if any shop item is active
  const isShopActive = () => {
    if (!currentPath) return false;
    const shopPaths = [
      "/shop",
      "/shop-by-province",
      "/shop-by-territory",
      "/shop-by-store",
    ];
    return shopPaths.some((path) => isActive(path));
  };

  // Check if any "More" item is active
  const isMoreActive = () => {
    if (!currentPath) return false;
    const morePaths = ["/faq", "/terms-&-condition", "/privacy-policy"];
    return morePaths.some((path) => isActive(path));
  };

  // Get all locations for dropdown
  const allLocations = [
    ...locationsData.province.map((loc) => ({ ...loc, type: "province" })),
    ...locationsData.territory.map((loc) => ({ ...loc, type: "territory" })),
    ...locationsData.city.map((loc) => ({ ...loc, type: "city" })),
  ];

  // Handle location selection from dropdown
  const handleLocationSelect = (locationName, locationType) => {
    const encodedLocation = encodeURIComponent(locationName);
    router.push(
      `/shop-by-province?type=${locationType}&location=${encodedLocation}`
    );
  };

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.25, // delay between each drop
      },
    },
  };

  // Each word drops in from the top
  const itemVariants = {
    initial: { opacity: 0, y: -30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300 },
    },
  };
  return (
    <div>
      <div className="flex items-center justify-between w-full py-4 border-b border-gray-300 bg-kappes  lg:px-32 text-white font-comfortaa">
        {/* Mobile Menu Drawer - stays on left */}
        <div className="md:hidden flex items-center">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto w-auto mt-1">
                {provideIcon({ name: "menu" })}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-w-full">
              <DrawerHeader>
                <DrawerTitle>Menu</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <Link
                  href="/"
                  className={getDrawerLinkClasses("/", "block py-2")}
                >
                  Home
                </Link>

                <Link
                  href="/trades-&-services"
                  className={getDrawerLinkClasses(
                    "/trades-&-services",
                    "block py-2"
                  )}
                >
                  Trades & Services
                </Link>

                {/* Shop Section with Sub-items */}
                <div className="space-y-2">
                  <p
                    className={`font-medium flex gap-2 items-center ${
                      isShopActive() ? "text-red-800" : ""
                    }`}
                  >
                    <span>{provideIcon({ name: "shop" })}</span>
                    <span>Shop</span>
                  </p>
                  <Link
                    href="/shop"
                    className={getDrawerSubLinkClasses(
                      "/shop",
                      "block py-1 pl-4"
                    )}
                  >
                    All Products
                  </Link>
                  <Link
                    href="/shop-by-province"
                    className={getDrawerSubLinkClasses(
                      "/shop-by-province",
                      "block py-1 pl-4"
                    )}
                  >
                    Shop By Province, Territory, City
                  </Link>

                  <Link
                    href="/shop-by-store"
                    className={getDrawerSubLinkClasses(
                      "/shop-by-store",
                      "block py-1 pl-4"
                    )}
                  >
                    Shop By Store
                  </Link>
                </div>

                <Link
                  href="/deals-&-offers"
                  className={getDrawerLinkClasses(
                    "/deals-&-offers",
                    "block py-2"
                  )}
                >
                  Deals & Offers
                </Link>

                <Link
                  href="/auth/become-seller-login"
                  className={getDrawerLinkClasses(
                    "/auth/become-seller-login",
                    "block py-2"
                  )}
                >
                  Become a Seller
                </Link>
                <div className="space-y-2">
                  <p
                    className={`font-medium ${
                      isMoreActive() ? "text-red-800" : ""
                    }`}
                  >
                    More
                  </p>
                  <Link
                    href="/faq"
                    className={getDrawerSubLinkClasses(
                      "/faq",
                      "block py-1 pl-4"
                    )}
                  >
                    FAQs
                  </Link>
                  <Link
                    href="/terms-&-condition"
                    className={getDrawerSubLinkClasses(
                      "/terms-&-condition",
                      "block py-1 pl-4"
                    )}
                  >
                    T&C
                  </Link>
                  <Link
                    href="/privacy-policy"
                    className={getDrawerSubLinkClasses(
                      "/privacy-policy",
                      "block py-1 pl-4"
                    )}
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/about-us"
                    className={getDrawerSubLinkClasses(
                      "/about-us",
                      "block py-1 pl-4"
                    )}
                  >
                    About Us
                  </Link>
                </div>
              </div>
              <div className="p-4 border-t">
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">
                    Close
                  </Button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {/* Desktop Navigation - centered */}
        <div className="hidden md:flex items-center flex-1 justify-center space-x-8">
          <AnimatedLink href="/" className={getLinkClasses("/")}>
            Home
          </AnimatedLink>
          <AnimatedLink
            href="/trades-&-services"
            className={getLinkClasses("/trades-&-services")}
          >
            Trades & Services
          </AnimatedLink>

          {/* Shop Dropdown moved to middle */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <ShopDropdownButton />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link
                    href="/shop"
                    className={`flex items-center gap-2 ${
                      isActive("/shop")
                        ? "bg-kappes text-white font-semibold"
                        : ""
                    }`}
                  >
                    {provideIcon({ name: "shop" })} All Products
                  </Link>
                </DropdownMenuItem>

                {/* Nested Dropdown for Shop By Province/Territory/City */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-red-700 hover:text-white ${
                        isActive("/shop-by-province")
                          ? "bg-kappes text-white font-semibold"
                          : ""
                      }`}
                    >
                      {provideIcon({ name: "searchByProvince" })}
                      <span>Shop By Province, Territory, City</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 max-h-[500px] overflow-y-scroll"
                    side="right"
                    align="start"
                  >
                    <DropdownMenuGroup>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground ">
                        Provinces
                      </div>
                      {locationsData.province.map((location) => (
                        <DropdownMenuItem
                          key={`province-${location.id}`}
                          onClick={() =>
                            handleLocationSelect(location.name, "province")
                          }
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              src={location.image}
                              alt={location.name}
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                            <span>{location.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                        Territories
                      </div>
                      {locationsData.territory.map((location) => (
                        <DropdownMenuItem
                          key={`territory-${location.id}`}
                          onClick={() =>
                            handleLocationSelect(location.name, "territory")
                          }
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              src={location.image}
                              alt={location.name}
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                            <span>{location.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                        Cities
                      </div>
                      {locationsData.city.map((location) => (
                        <DropdownMenuItem
                          key={`city-${location.id}`}
                          onClick={() =>
                            handleLocationSelect(location.name, "city")
                          }
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              src={location.image}
                              alt={location.name}
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                            <span>{location.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenuItem asChild>
                  <Link
                    href="/shop-by-store"
                    className={`flex items-center gap-2 ${
                      isActive("/shop-by-store")
                        ? "bg-kappes text-white font-semibold"
                        : ""
                    }`}
                  >
                    {provideIcon({ name: "shopByStore" })} Shop By Store
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <AnimatedLink
            href="/deals-&-offers"
            className={getLinkClasses("/deals-&-offers")}
          >
            Deals & Offers
          </AnimatedLink>

          <AnimatedLink
            href="/auth/become-seller-login"
            className={`font-semibold shadow-none border-none rounded-md flex gap-2 items-center transition-all duration-300 ease-in-out ${
              isActive("/auth/become-seller-login") ? "" : ""
            }`}
          >
            Become a Seller
          </AnimatedLink>
        </div>

        {/* Empty div for layout balance */}
        <div className="w-6 md:w-0"></div>
      </div>
    </div>
  );
}

export default BottomNav;
