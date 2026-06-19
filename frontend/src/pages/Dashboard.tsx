import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Clock, Package, TrendingUp } from 'lucide-react';
import type { DashboardStats, Order } from '../../../shared/types';
import { cn } from '@/shared/utils/cn';
import { dashboardApi } from '@/services/dashboardApi';

const initialStats = [
  { label: 'Total Sync Accounts', value: '...', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Active Sessions', value: '...', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  { label: 'Pending Orders', value: '...', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { label: 'Completed', value: '...', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

function mapStats(stats: DashboardStats) {
  return initialStats.map((stat) => {
    const valueByLabel: Record<string, number> = {
      'Total Sync Accounts': stats.totalAccounts,
      'Active Sessions': stats.activeSessions,
      'Pending Orders': stats.pendingOrders,
      Completed: stats.completedOrders,
    };

    return { ...stat, value: String(valueByLabel[stat.label] ?? 0) };
  });
}

export const Dashboard = () => {
  const [stats, setStats] = useState(initialStats);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    void dashboardApi.get().then((data) => {
      setStats(mapStats(data));
      setRecentOrders(data.recentOrders);
    });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0a0a0a]">
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-8">
        <span>Dashboard</span>
        <span className="text-gray-700">/</span>
        <span className="text-gray-200">Overview</span>
      </div>

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Manager Dashboard</h1>
        <p className="text-gray-500 text-sm">Overview of your delivery operations</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#141414] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} border border-white/5`}>
                <stat.icon className={`size-6 ${stat.color}`} />
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">REST</div>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div className="bg-[#141414] rounded-[2rem] border border-white/5 overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-bold text-white uppercase text-xs tracking-widest">Recent Activity</h2>
          </div>
          <div className="p-4 space-y-2">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px]">No recent activity</div>
            ) : recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "size-10 rounded-xl flex items-center justify-center border",
                    order.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  )}>
                    {order.status === 'completed' ? <CheckCircle className="size-5" /> : <Clock className="size-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-200">Order #{order.orderId} {order.status}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Customer: {order.customer}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-600 truncate max-w-[80px]">PTS: {order.points}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#141414] to-black rounded-[2rem] border border-white/5 p-8 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-white uppercase text-xs tracking-widest mb-6">Total Performance</h2>
            <div className="flex items-baseline gap-4 mb-4">
              <h3 className="text-5xl font-black text-white">94%</h3>
              <span className="text-green-500 font-bold text-xs">+2.4% from yesterday</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[94%]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Efficiency</p>
              <p className="text-lg font-bold text-white">High</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Reliability</p>
              <p className="text-lg font-bold text-white">99.2%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
