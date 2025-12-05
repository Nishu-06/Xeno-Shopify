import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

export default function OrdersChart({ data }) {
  // Calculate statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const counts = data.map(d => d.count);
    const total = counts.reduce((sum, val) => sum + val, 0);
    const average = total / counts.length;
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    const firstCount = counts[0] || 0;
    const lastCount = counts[data.length - 1] || 0;
    const growth = firstCount > 0 ? ((lastCount - firstCount) / firstCount) * 100 : 0;
    
    // Calculate 7-day moving average
    const movingAvg = data.map((item, index) => {
      const start = Math.max(0, index - 6);
      const slice = counts.slice(start, index + 1);
      const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      return Math.round(avg * 10) / 10;
    });

    // Calculate best and worst days
    const bestDay = data.find(d => d.count === max);
    const worstDay = data.find(d => d.count === min);

    return {
      total,
      average,
      max,
      min,
      growth,
      movingAvg,
      period: data.length,
      bestDay,
      worstDay
    };
  }, [data]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !stats) return null;

    return {
      series: [
        {
          name: 'Orders',
          type: 'area',
          data: data.map(d => d.count)
        },
        {
          name: '7-Day Average',
          type: 'line',
          data: stats.movingAvg
        }
      ],
      options: {
        chart: {
          type: 'area',
          height: 350,
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true
            }
          },
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 1000,
            animateGradually: {
              enabled: true,
              delay: 150
            },
            dynamicAnimation: {
              enabled: true,
              speed: 350
            }
          },
          sparkline: {
            enabled: false
          },
          dropShadow: {
            enabled: true,
            color: '#10b981',
            top: 0,
            left: 0,
            blur: 3,
            opacity: 0.3
          }
        },
        colors: ['#10b981', '#14b8a6'],
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
          width: [3, 2.5],
          dashArray: [0, 5]
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'vertical',
            shadeIntensity: 0.5,
            gradientToColors: ['#059669', '#0d9488'],
            inverseColors: false,
            opacityFrom: 0.6,
            opacityTo: 0.1,
            stops: [0, 50, 100]
          }
        },
        markers: {
          size: [5, 0],
          colors: ['#10b981', '#14b8a6'],
          strokeColors: '#fff',
          strokeWidth: 2,
          hover: {
            size: [7, 0]
          }
        },
        xaxis: {
          type: 'datetime',
          categories: data.map(d => d.date),
          labels: {
            style: {
              colors: '#6b7280',
              fontSize: '11px'
            },
            datetimeFormatter: {
              year: 'yyyy',
              month: 'MMM',
              day: 'MM/dd',
              hour: 'HH:mm'
            }
          },
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          }
        },
        yaxis: [
          {
            labels: {
              style: {
                colors: '#6b7280',
                fontSize: '11px'
              },
              formatter: (value) => Math.round(value).toString()
            }
          }
        ],
        grid: {
          borderColor: '#e5e7eb',
          strokeDashArray: 3,
          opacity: 0.5,
          xaxis: {
            lines: {
              show: false
            }
          },
          yaxis: {
            lines: {
              show: true
            }
          },
          padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        },
        tooltip: {
          shared: true,
          intersect: false,
          theme: 'light',
          style: {
            fontSize: '12px'
          },
          x: {
            format: 'MMM dd, yyyy'
          },
          y: {
            formatter: (value) => `${Math.round(value)} orders`
          },
          marker: {
            show: true
          }
        },
        legend: {
          show: false
        },
        annotations: {
          yaxis: [
            {
              y: stats.average,
              borderColor: '#14b8a6',
              borderWidth: 2,
              borderDashArray: 5,
              label: {
                borderColor: '#14b8a6',
                style: {
                  color: '#fff',
                  background: '#14b8a6',
                  fontSize: '11px'
                },
                text: `Avg: ${stats.average.toFixed(1)}`
              }
            }
          ]
        }
      }
    };
  }, [data, stats]);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-md">
            <span className="text-white text-xl">📦</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Order Count Trend</h3>
            {stats && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {stats.period} days • Avg: {stats.average.toFixed(1)} orders/day
                {stats.growth !== 0 && (
                  <span className={`ml-2 font-semibold ${stats.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.growth > 0 ? '↑' : '↓'} {Math.abs(stats.growth).toFixed(1)}%
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Orders</span>
          </div>
          {stats && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">7-Day Avg</span>
            </div>
          )}
        </div>
      </div>

      {data && data.length > 0 && stats && chartData ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stats.total.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Daily Average</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {stats.average.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Peak Day</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {stats.max} orders
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Growth</p>
              <p className={`text-lg font-bold ${stats.growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.growth >= 0 ? '+' : ''}{stats.growth.toFixed(1)}%
              </p>
            </div>
          </div>

          <Chart
            options={chartData.options}
            series={chartData.series}
            type="line"
            height={350}
          />
        </>
      ) : (
        <div className="h-[350px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">📦</div>
            <p>No order data available for the selected date range</p>
          </div>
        </div>
      )}
    </div>
  );
}
