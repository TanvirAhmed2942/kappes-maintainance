"use client";
import Banner from "../components/Home/Banner/banner";
import PopularCategories from "../components/Home/Popular Categories/popularCategories";
import ProductRecomendation from "../components/Home/Recomendation/productRecomendation";
import TrendingProduct from "../components/Home/Trending Products/trendingProduct";
import AdvertisementBanner from "../components/Home/AdvertisementBanner/AdvertisementBanner";
import { withAuth } from "../Providers/AuthGuard";

function Home() {
  return (
    <div className="h-100vh w-100vw ">
      <Banner />
      <PopularCategories />
      <AdvertisementBanner />
      <ProductRecomendation />
      <TrendingProduct />
    </div>
  );
}

export default withAuth(Home, null, ["VENDOR", "SHOP ADMIN"]);
