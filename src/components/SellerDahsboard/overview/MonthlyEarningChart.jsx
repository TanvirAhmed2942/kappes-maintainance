"use client";

import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const MonthlyEarningChart = ({ data }) => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Available years from API
  const years = data?.yearEarnings?.map(year => year._id.toString()) || ['2025'];

  // Month names
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    if (data?.monthEarnings) {
      // Create array with all 12 months initialized to 0
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: monthNames[i],
        earning: 0,
        monthNumber: i + 1
      }));

      // Fill in actual data from API
      data.monthEarnings.forEach(item => {
        if (item._id.year.toString() === selectedYear) {
          const monthIndex = item._id.month - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyData[monthIndex].earning = item.earnings || 0;
          }
        }
      });

      setChartData(monthlyData);
    }
  }, [data, selectedYear]);

  const maxValue = Math.max(...chartData.map(d => d.earning), 1000);
  const yAxisMax = Math.ceil(maxValue / 1000) * 1000;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-base">
          €{payload[0].value.toFixed(2)}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props) => {
    const { cx, cy, index } = props;
    if (activeIndex === index) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#991b1b"
          stroke="#fff"
          strokeWidth={2}
        />
      );
    }
    return null;
  };

  const handleMouseMove = (state) => {
    if (state && state.activeTooltipIndex !== undefined) {
      setActiveIndex(state.activeTooltipIndex);
    }
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Monthly Earning</h1>

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
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="colorEarning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="0"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 14 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 14 }}
                domain={[0, yAxisMax]}
                tickFormatter={(value) => `€${value / 1000}K`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: '#991b1b',
                  strokeWidth: 2,
                  strokeDasharray: '5 5'
                }}
              />
              {activeIndex !== null && (
                <ReferenceLine
                  y={chartData[activeIndex]?.earning}
                  stroke="#991b1b"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              )}
              <Area
                type="monotone"
                dataKey="earning"
                stroke="#991b1b"
                strokeWidth={3}
                fill="url(#colorEarning)"
                dot={<CustomDot />}
                activeDot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlyEarningChart;