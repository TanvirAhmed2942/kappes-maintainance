"use client";

import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const TotalOrderChart = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chartData, setChartData] = useState([]);

  // Available years from API
  const years = data?.yearOrders?.map(year => year._id.toString()) || ['2025'];

  // Month names
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    if (data?.monthEarnings) {
      // Create array with all 12 months initialized to 0
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: monthNames[i],
        orders: 0,
        monthNumber: i + 1
      }));

      // Fill in actual data from API
      data.monthEarnings.forEach(item => {
        if (item._id.year.toString() === selectedYear) {
          const monthIndex = item._id.month - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyData[monthIndex].orders = item.orders || 0;
          }
        }
      });

      setChartData(monthlyData);
    }
  }, [data, selectedYear]);

  const maxValue = Math.max(...chartData.map(d => d.orders), 100);
  const yAxisMax = Math.ceil(maxValue / 200) * 200;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#B01501] text-white px-3 py-1.5 rounded text-sm font-medium">
          {payload[0].value} orders
        </div>
      );
    }
    return null;
  };

  return (
    <div className="">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Total Order</h1>

          {/* Year Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-700 font-medium">{selectedYear}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedYear === year ? 'bg-gray-100 font-medium' : ''
                      }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                stroke="#B01501"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#B01501', fontSize: 14 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#B01501', fontSize: 14 }}
                domain={[0, yAxisMax]}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'transparent' }}
              />
              <Bar
                dataKey="orders"
                fill="#B01501"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill="#B01501"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TotalOrderChart;