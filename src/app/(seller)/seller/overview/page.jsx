"use client";

import { useSearchParams } from 'next/navigation';
import MonthlyEarningChart from '../../../../components/SellerDahsboard/overview/MonthlyEarningChart';
import StatCards from '../../../../components/SellerDahsboard/overview/StatCards';
import TotalOrderChart from '../../../../components/SellerDahsboard/overview/TotalOrderChart';
import { useGetOverviewQuery } from '../../../../redux/sellerApi/overview/overviewApi';

const Page = () => {
  const searchParams = useSearchParams();
  const shop = searchParams.get("shop");
  const localShop = typeof window !== 'undefined' ? localStorage.getItem('shop') : null;
  const shopId = shop || localShop;
  const { data, isLoading } = useGetOverviewQuery(shopId, { skip: !shopId });

  console.log("overview value", data);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!data?.data) {
    return <div className="p-6">No data available</div>;
  }

  return (
    <div className='space-y-5'>
      <StatCards data={data.data} />
      <TotalOrderChart data={data.data} />
      <MonthlyEarningChart data={data.data} />
    </div>
  );
};

export default Page;