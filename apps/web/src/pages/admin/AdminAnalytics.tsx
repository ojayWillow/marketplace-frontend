import { useState, useEffect } from 'react';
import { apiClient } from '@marketplace/shared';

// Simple chart components (no external library needed)
interface DataPoint {
  label: string;
  value: number;
}

// Line Chart Component
const LineChart = ({ data, color = '#3b82f6', height = 200 }: { data: DataPoint[]; color?: string; height?: number }) => {
  if (data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minValue) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.3" />
        ))}
        
        {/* Area fill */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={`${color}20`}
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - ((d.value - minValue) / range) * 80 - 10;
          return (
            <circle key={i} cx={x} cy={y} r="1.5" fill={color} />
          );
        })}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-8">
        <span>{maxValue}</span>
        <span>{Math.round((maxValue + minValue) / 2)}</span>
        <span>{minValue}</span>
      </div>
    </div>
  );
};

// Bar Chart Component
const BarChart = ({ data, colors }: { data: DataPoint[]; colors?: string[] }) => {
  if (data.length === 0) return <p className="text-gray-400 text-sm">No data available</p>;
  const maxValue = Math.max(...data.map(d => d.value));
  const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">{d.label}</span>
            <span className="font-medium">{d.value}</span>
          </div>
          <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${maxValue > 0 ? (d.value / maxValue) * 100 : 0}%`,
                backgroundColor: colors?.[i] || defaultColors[i % defaultColors.length]
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Donut Chart Component
const DonutChart = ({ data, colors, size = 160 }: { data: DataPoint[]; colors?: string[]; size?: number }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <p className="text-gray-400 text-sm">No data available</p>;
  const defaultColors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];
  
  let currentAngle = -90;
  const segments = data.filter(d => d.value > 0).map((d, i) => {
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;
    
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    return {
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: colors?.[i] || defaultColors[i % defaultColors.length],
      label: d.label,
      value: d.value,
      percentage: ((d.value / total) * 100).toFixed(1)
    };
  });

  return (
    <div className="flex items-center gap-6">
      <div style={{ width: size, height: size }} className="relative">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {segments.map((seg, i) => (
            <path key={i} d={seg.path} fill={seg.color} className="hover:opacity-80 transition-opacity" />
          ))}
          {/* Center hole */}
          <circle cx="50" cy="50" r="25" fill="white" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-gray-600">{seg.label}</span>
            <span className="font-medium">{seg.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Analytics Component
const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Analytics data state
  const [userGrowth, setUserGrowth] = useState<DataPoint[]>([]);
  const [jobsByCategory, setJobsByCategory] = useState<DataPoint[]>([]);
  const [completionData, setCompletionData] = useState<DataPoint[]>([]);
  const [topLocations, setTopLocations] = useState<DataPoint[]>([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalJobs: 0,
    completionRate: 0,
    avgJobBudget: 0,
    totalVolume: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/admin/analytics', {
        params: { range: timeRange }
      });
      setUserGrowth(response.data.userGrowth || []);
      setJobsByCategory(response.data.jobsByCategory || []);
      setCompletionData(response.data.completionData || []);
      setTopLocations(response.data.topLocations || []);
      setMetrics(response.data.metrics || {
        totalUsers: 0,
        newUsers: 0,
        totalJobs: 0,
        completionRate: 0,
        avgJobBudget: 0,
        totalVolume: 0,
      });
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, subtitle, icon }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-2">⚠️</div>
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => fetchAnalytics()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Platform performance and insights</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
          {([
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' },
            { value: '1y', label: '1 Year' },
          ] as const).map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          subtitle={`+${metrics.newUsers} new`}
          icon="👥"
        />
        <MetricCard
          title="Total Jobs"
          value={metrics.totalJobs.toLocaleString()}
          icon="📋"
        />
        <MetricCard
          title="Completion Rate"
          value={`${metrics.completionRate}%`}
          icon="✅"
        />
        <MetricCard
          title="Total Volume"
          value={`€${metrics.totalVolume.toLocaleString()}`}
          subtitle={`Avg €${metrics.avgJobBudget}/job`}
          icon="💰"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900">User Growth</h2>
              <p className="text-sm text-gray-500">Cumulative users over time</p>
            </div>
            <span className="text-2xl">📈</span>
          </div>
          <div className="pl-10">
            {userGrowth.length > 0 ? (
              <LineChart data={userGrowth} color="#3b82f6" height={220} />
            ) : (
              <p className="text-gray-400 text-sm text-center py-10">No growth data for this period</p>
            )}
          </div>
        </div>

        {/* Jobs by Category */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900">Jobs by Category</h2>
              <p className="text-sm text-gray-500">Most popular categories</p>
            </div>
            <span className="text-2xl">📊</span>
          </div>
          <BarChart data={jobsByCategory} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate Donut */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900">Job Status</h2>
              <p className="text-sm text-gray-500">Completion breakdown</p>
            </div>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="flex justify-center">
            <DonutChart 
              data={completionData} 
              colors={['#10b981', '#f59e0b', '#ef4444']}
            />
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900">Top Locations</h2>
              <p className="text-sm text-gray-500">Most active areas</p>
            </div>
            <span className="text-2xl">📍</span>
          </div>
          {topLocations.length > 0 ? (
            <div className="space-y-4">
              {topLocations.map((location, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{location.label}</span>
                      <span className="text-sm text-gray-500">{location.value} jobs</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(location.value / topLocations[0].value) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No location data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
