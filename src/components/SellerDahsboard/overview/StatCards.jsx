import { Package, TrendingUp } from 'lucide-react';

const StatCards = ({ data }) => {
  const stats = [
    {
      title: 'Total Order',
      value: data?.totalOrders || 0,
      icon: Package,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-500'
    },
    {
      title: 'Total Earning',
      value: `€${data?.totalEarnings?.toFixed(2) || 0}`,
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500'
    }
  ];

  return (
    <div className="">
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white w-full rounded-2xl shadow-sm p-6 flex items-center gap-6 hover:shadow-md transition-shadow"
            >
              {/* Icon Container */}
              <div className={`${stat.bgColor} rounded-2xl p-5 flex items-center justify-center`}>
                <stat.icon className={`w-10 h-10 ${stat.iconColor}`} strokeWidth={2} />
              </div>

              {/* Content */}
              <div className="flex flex-col">
                <span className="text-gray-500 text-base font-medium mb-1">
                  {stat.title}
                </span>
                <span className="text-gray-900 text-4xl font-bold">
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatCards;