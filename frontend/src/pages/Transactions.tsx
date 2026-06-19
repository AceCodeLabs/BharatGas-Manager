import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Repeat, ArrowUpRight, ArrowDownLeft, Flame } from 'lucide-react';
import type { Transaction } from '../../../shared/types';
import { cn } from '@/shared/utils/cn';
import { formatDateTime } from '@/shared/utils/format';
import { transactionsApi } from '@/services/transactionsApi';

export const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    void transactionsApi.list().then((data) => setTransactions(data.transactions));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0a0a0a]">
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-8">
        <span>Dashboard</span>
        <span className="text-gray-700">/</span>
        <span className="text-gray-200">Transactions</span>
      </div>

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
        <p className="text-gray-500 text-sm">History of account adjustments</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-black/10">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Usage History</h2>
              <Repeat className="size-4 text-gray-600" />
            </div>
            <div className="p-2 space-y-1">
              {transactions.length === 0 ? (
                <div className="p-12 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px]">No Transactions Found</div>
              ) : transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-6 bg-black/20 rounded-3xl border border-white/5 hover:border-white/10 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "size-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110",
                      tx.type === 'debit' ? "bg-red-500/5 border-red-500/10 text-red-500" : "bg-green-500/5 border-green-500/10 text-green-500"
                    )}>
                      {tx.type === 'debit' ? <ArrowUpRight className="size-6" /> : <ArrowDownLeft className="size-6" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-gray-200">{tx.reason}</p>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{formatDateTime(tx.createdAt)}</p>
                        {tx.account && (
                          <>
                            <span className="size-1 rounded-full bg-gray-700" />
                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Acc: {tx.account}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-lg font-black tracking-tight", tx.type === 'debit' ? "text-red-500" : "text-green-500")}>
                      {tx.type === 'debit' ? '-' : '+'}{tx.amount}
                    </p>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Amount</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#141414] to-black border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Spending Analysis</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase mb-2">
                  <span>Delivery Fees</span>
                  <span className="text-red-500">82%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[82%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase mb-2">
                  <span>Account Sync</span>
                  <span className="text-green-500">12%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[12%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#141414] border border-green-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform">
              <Flame className="size-24 text-green-500" />
            </div>
            <h3 className="text-xs font-black text-green-500 uppercase tracking-widest mb-2">Premium Status</h3>
            <p className="text-sm font-bold text-gray-300 leading-relaxed mb-6">You're currently a VIP Manager for delivery operations.</p>
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <span>Active Since:</span>
              <span className="text-gray-300">Jan 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
