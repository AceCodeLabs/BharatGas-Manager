import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, Zap, Clock } from 'lucide-react';
import type { Order } from '../../../shared/types';
import { cn } from '@/shared/utils/cn';
import { accountsApi } from '@/services/accountsApi';
import { ordersApi } from '@/services/ordersApi';

interface DeliveryProgressProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  autoProcess?: boolean;
  onCompleted?: () => void;
}

export const DeliveryProgress = ({ isOpen, onClose, accountId, autoProcess, onCompleted }: DeliveryProgressProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPending = async () => {
    if (!accountId) return;
    const data = await accountsApi.orders(accountId, 'pending');
    setOrders(data.orders);
    setIsDone(data.orders.length === 0);
  };

  useEffect(() => {
    if (!isOpen || !accountId) return;
    void loadPending();
  }, [isOpen, accountId]);

  useEffect(() => {
    if (isOpen && orders.length > 0 && !processingId) {
      const nextOrder = orders[0];
      setProcessingId(nextOrder.id);

      const timer = setTimeout(async () => {
        try {
          await ordersApi.confirm(nextOrder.id);
          await loadPending();
          onCompleted?.();
        } finally {
          setProcessingId(null);
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isOpen, orders, processingId]);

  useEffect(() => {
    if (isDone && autoProcess) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isDone, autoProcess, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#141414] border border-white/10 rounded-[2.5rem] shadow-2xl z-[110] overflow-hidden p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="size-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <Zap className="size-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">Auto-Sync Active</h2>
                <p className="text-sm text-gray-500 font-medium">
                  {orders.length} orders pending - <span className="text-green-500 uppercase tracking-tighter font-black text-[10px]">REST Sync</span>
                </p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <CheckCircle2 className="size-6" />
              </button>
            </div>

            <div className="w-full h-2 bg-white/5 rounded-full mb-10 overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: isDone ? '100%' : '50%' }}
                className={cn(
                  "h-full shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all",
                  isDone ? "bg-green-500" : "bg-yellow-500"
                )}
              />
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
              {orders.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle2 className="size-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">All Orders Confirmed</p>
                </div>
              )}
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex items-center justify-between",
                    order.id === processingId ? "bg-yellow-500/5 border-yellow-500/20" : "bg-white/5 border-white/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "size-8 rounded-full flex items-center justify-center border-2",
                      order.id === processingId ? "border-yellow-500 text-yellow-500" : "border-gray-700 text-gray-700"
                    )}>
                      {order.id === processingId ? <Loader2 className="size-4 animate-spin" /> : <Clock className="size-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">#{order.orderId}</p>
                      <p className="text-xs text-gray-500 font-medium">
                        {order.id === processingId ? 'Synchronizing with BharatGas...' : 'Pending Confirmation'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
