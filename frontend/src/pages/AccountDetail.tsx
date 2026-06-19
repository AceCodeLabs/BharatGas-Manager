import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RefreshCw, Copy, Users, Clock, Play, ExternalLink } from 'lucide-react';
import type { OperatorAccount, Order } from '../../../shared/types';
import { cn } from '@/shared/utils/cn';
import { formatDateTime } from '@/shared/utils/format';
import { DeliveryProgress } from '@/components/DeliveryProgress';
import { OperatorLoginModal } from '@/components/OperatorLoginModal';
import { accountsApi } from '@/services/accountsApi';

export const AccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'pending';
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncingData, setIsSyncingData] = useState(false);
  const [account, setAccount] = useState<OperatorAccount | null>(null);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [isAutoMode, setIsAutoMode] = useState(false);

  const loadDetails = useCallback(async () => {
    if (!id) return;
    const [accountData, completedData, pendingData] = await Promise.all([
      accountsApi.get(id),
      accountsApi.orders(id, 'completed'),
      accountsApi.orders(id, 'pending'),
    ]);
    setAccount(accountData.account);
    setCompletedOrders(completedData.orders);
    setPendingOrders(pendingData.orders);
  }, [id]);

  const handleManualSync = async () => {
    if (!id) return;
    setIsSyncingData(true);
    try {
      await accountsApi.syncOrders(id);
      await loadDetails();
    } finally {
      setIsSyncingData(false);
    }
  };

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  useEffect(() => {
    if (isAutoMode && pendingOrders.length > 0 && !isProcessing) {
      setIsProcessing(true);
    }
  }, [isAutoMode, pendingOrders, isProcessing]);

  if (!account) return <div className="p-8 text-gray-500 font-bold uppercase tracking-widest text-[10px] text-center">Loading Account Details...</div>;

  const pendingAreas = Array.from(new Set(pendingOrders.map(o => o.area || 'Unknown Area')))
    .map(area => ({
      title: area,
      count: pendingOrders.filter(o => (o.area || 'Unknown Area') === area).length
    }));

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0a0a0a]">
      <DeliveryProgress
        isOpen={isProcessing}
        onClose={() => setIsProcessing(false)}
        accountId={id || ''}
        autoProcess={isAutoMode}
        onCompleted={loadDetails}
      />
      <OperatorLoginModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        mobileNumber={account.mobile}
        onSuccess={() => alert('Account synced successfully!')}
      />

      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-8">
        <span>Dashboard</span>
        <span className="text-gray-700">/</span>
        <span className="text-gray-200">Accounts</span>
        <span className="text-gray-700">/</span>
        <span className="text-gray-200 truncate max-w-[100px]">{id}</span>
      </div>

      <button onClick={() => navigate('/dashboard/accounts')} className="flex items-center gap-2 text-green-500 text-sm font-bold mb-4 hover:opacity-80">
        <ArrowLeft className="size-4" />
        Back to Accounts
      </button>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white leading-tight">{account.mobile}</h1>
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-green-500/10 text-green-500 border border-green-500/20">
              {account.status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
            <span>{account.name}</span>
            <span className="text-gray-800">-</span>
            <span>{account.model}</span>
            <span className="text-gray-800">-</span>
            <div className="bg-white/5 border border-white/5 px-2 py-0.5 rounded flex items-center gap-2 group cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-[10px]">{account.deviceId}</span>
              <Copy className="size-2.5 opacity-40 group-hover:opacity-100" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleManualSync} disabled={isSyncingData} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-sm font-bold text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50">
            <RefreshCw className={cn("size-4", isSyncingData && "animate-spin")} />
            {isSyncingData ? 'Syncing...' : 'Sync with BharatGas'}
          </button>
          <button onClick={() => setIsSyncModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-sm font-bold text-gray-300 hover:bg-white/10 transition-colors">
            <Users className="size-4" />
            Sync Operator
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-sm font-bold text-gray-300 hover:bg-white/10 transition-colors">
            <ExternalLink className="size-4" />
            Refresh Session
          </button>
        </div>
      </header>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchParams({ tab: 'pending' })}
            className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", currentTab === 'pending' ? "bg-green-500 text-black shadow-lg shadow-green-500/10" : "bg-white/5 text-gray-500 hover:text-gray-300")}
          >
            Pending Orders
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'completed' })}
            className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", currentTab === 'completed' ? "bg-green-500 text-black shadow-lg shadow-green-500/10" : "bg-white/5 text-gray-500 hover:text-gray-300")}
          >
            Completed Orders
          </button>
        </div>

        <button
          onClick={() => setIsAutoMode(!isAutoMode)}
          className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95", isAutoMode ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-green-500 text-black hover:bg-green-600 shadow-green-500/20")}
        >
          {isAutoMode ? (
            <>
              <RefreshCw className="size-4 animate-spin" />
              Stop Auto-Confirmation
            </>
          ) : (
            <>
              <Play className="size-4 fill-current" />
              Start Auto-Confirmation
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {currentTab === 'completed' ? (
          <motion.div key="completed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#141414] border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Completed Orders ({completedOrders.length})</h2>
              <div className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">Already completed</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#050505] border-b border-white/5">
                  <tr className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
                    <th className="px-8 py-5">Order #</th>
                    <th className="px-6 py-5">Customer Name</th>
                    <th className="px-6 py-5">Mobile</th>
                    <th className="px-6 py-5">LPG Subscription</th>
                    <th className="px-6 py-5">Completed At</th>
                    <th className="px-8 py-5 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {completedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-8 py-6 text-sm font-black text-gray-500 group-hover:text-gray-300">#{order.orderId}</td>
                      <td className="px-6 py-6 font-bold text-gray-100 text-sm">{order.customer}</td>
                      <td className="px-6 py-6 text-xs font-black text-gray-500">{order.mobile}</td>
                      <td className="px-6 py-6 text-xs font-mono text-gray-400">{order.lpgId || '-'}</td>
                      <td className="px-6 py-6 text-xs font-bold text-gray-500 uppercase">{formatDateTime(order.completedAt)}</td>
                      <td className="px-8 py-6 text-right">
                        <span className="px-3 py-1 bg-red-500/5 text-red-500 rounded-lg text-xs font-black border border-red-500/10 shadow-sm">{order.points}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div key="pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Areas & Orders</h2>
              <div className="flex flex-wrap gap-3">
                {pendingAreas.length === 0 ? (
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">No active areas</p>
                ) : pendingAreas.map((area) => (
                  <div key={area.title} className="px-4 py-2.5 bg-[#141414] border border-white/5 rounded-2xl flex items-center gap-4 hover:border-white/10 cursor-pointer transition-colors shadow-sm">
                    <span className="text-xs font-bold text-gray-300 tracking-wide uppercase">{area.title}</span>
                    <span className="px-2 py-0.5 bg-black/40 border border-white/10 rounded-lg text-[10px] font-bold text-gray-500">{area.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#141414] border border-white/5 h-80 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8">
              <div className="size-20 rounded-full bg-white/[0.02] flex items-center justify-center mb-6 border border-white/5">
                <Clock className="size-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-400">{pendingOrders.length ? `${pendingOrders.length} Pending Orders` : 'No Orders in Areas'}</h3>
              <p className="text-sm text-gray-600 mt-2 max-w-xs mx-auto leading-relaxed">Sync orders from BharatGas, then use auto-confirmation to process pending deliveries.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
