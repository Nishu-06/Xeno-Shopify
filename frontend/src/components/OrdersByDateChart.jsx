import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

export default function OrdersByDateChart({ data }) {
  // Calculate statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const counts = data.map(d => d.count);
    const total = counts.reduce((sum, val) => sum + val, 0);
    const average = total / counts.length;
    const max = Math.max(...counts);
    const min = Math.min(...counts);

    return {
      total,
      average,
      max,
      min,
      period: data.length
    };
  }, [data]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0 || !stats) return null;

    return {
      series: [
        {
          name: 'Orders',
          data: data.map(d => d.count)
        }
      ],
      options: {
        chart: {
          type: 'bar',
          height: 380,
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
          dropShadow: {
            enabled: true,
            color: '#3b82f6',
            top: 0,
            left: 0,
            blur: 3,
            opacity: 0.2
          }
        },
        plotOptions: {
          bar: {
            borderRadius: 8,
            borderRadiusApplication: 'end',
            columnWidth: '60%',
            dataLabels: {
              position: 'top'
            },
            distributed: false
          }
        },
        dataLabels: {
          enabled: false
        },
        colors: data.map((entry, index) => {
          const intensity = entry.count / stats.max;
          const hue = 210 + (intensity * 30);
          const saturation = 70 + (intensity * 20);
          const lightness = 50 + (intensity * 15);
          return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }),
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
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
        yaxis: {
          labels: {
            style: {
              colors: '#6b7280',
              fontSize: '11px'
            },
            formatter: (value) => Math.round(value).toString()
          }
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.5,
            gradientToColors: data.map((entry, index) => {
              const intensity = entry.count / stats.max;
              const hue = 210 + (intensity * 30);
              const saturation = 70 + (intensity * 20);
              const lightness = 50 + (intensity * 15);
              return `hsl(${hue}, ${saturation}%, ${lightness + 10}%)`;
            }),
            inverseColors: false,
            opacityFrom: 0.9,
            opacityTo: 0.7,
            stops: [0, 50, 100]
          }
        },
        grid: {
          borderColor: '#e5e7eb',
          strokeDashArray: 3,
          opacity: 0.3,
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
          theme: 'light',
          style: {
            fontSize: '12px'
          },
          x: {
            format: 'MMM dd, yyyy'
          },
          y: {
            formatter: (value, { seriesIndex, dataPointIndex }) => {
              const revenue = data[dataPointIndex]?.revenue || 0;
              return `${value} orders${revenue > 0 ? ` • $${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}`;
            }
          },
          marker: {
            show: true
          }
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
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Orders by Date</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Daily order breakdown</p>
          </div>
        </div>
        {stats && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Daily Avg</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.average.toFixed(1)}</p>
            </div>
          </div>
        )}
      </div>

      {data && data.length > 0 && stats && chartData ? (
        <>
          {/* Summary Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Average Daily</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.average.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Peak Day</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.max} orders</p>
            </div>
          </div>

          <Chart
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={380}
          />

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Orders</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 h-px border-t-2 border-dashed border-purple-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Average</span>
            </div>
          </div>
        </>
      ) : (
        <div className="h-[380px] flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl">
          <div className="text-center">
            <div className="text-5xl mb-3">📅</div>
            <p className="font-medium">No order data available for the selected date range</p>
          </div>
        </div>
      )}
    </div>
  );
}
