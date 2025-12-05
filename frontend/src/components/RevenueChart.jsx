import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

export default function RevenueChart({ data }) {
  // Calculate statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const revenues = data.map(d => d.revenue);
    const total = revenues.reduce((sum, val) => sum + val, 0);
    const average = total / revenues.length;
    const max = Math.max(...revenues);
    const min = Math.min(...revenues);
    const firstRevenue = revenues[0];
    const lastRevenue = revenues[revenues.length - 1];
    const growth = ((lastRevenue - firstRevenue) / firstRevenue) * 100;
    
    // Calculate 7-day moving average
    const movingAvg = data.map((item, index) => {
      const start = Math.max(0, index - 6);
      const slice = revenues.slice(start, index + 1);
      const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      return avg;
    });

    return {
      total,
      average,
      max,
      min,
      growth,
      movingAvg,
      period: data.length
    };
  }, [data]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !stats) return null;

    return {
      series: [
        {
          name: 'Revenue',
          type: 'area',
          data: data.map(d => d.revenue)
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
            color: '#3b82f6',
            top: 0,
            left: 0,
            blur: 3,
            opacity: 0.3
          }
        },
        colors: ['#3b82f6', '#a855f7'],
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
            gradientToColors: ['#6366f1', '#c084fc'],
            inverseColors: false,
            opacityFrom: 0.6,
            opacityTo: 0.1,
            stops: [0, 50, 100]
          }
        },
        markers: {
          size: [5, 0],
          colors: ['#3b82f6', '#a855f7'],
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
              formatter: (value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
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
            formatter: (value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
              borderColor: '#a855f7',
              borderWidth: 2,
              borderDashArray: 5,
              label: {
                borderColor: '#a855f7',
                style: {
                  color: '#fff',
                  background: '#a855f7',
                  fontSize: '11px'
                },
                text: `Avg: $${stats.average.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
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
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md">
            <span className="text-white text-xl">💰</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Revenue Trend</h3>
            {stats && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {stats.period} days • Avg: ${stats.average.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Revenue</span>
          </div>
          {stats && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">7-Day Avg</span>
            </div>
          )}
        </div>
      </div>

      {data && data.length > 0 && stats && chartData ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                ${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Average Daily</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                ${stats.average.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Peak Day</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                ${stats.max.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            <div className="text-4xl mb-2">📊</div>
            <p>No revenue data available for the selected date range</p>
          </div>
        </div>
      )}
    </div>
  );
}
