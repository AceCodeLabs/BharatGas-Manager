import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Plus, Smartphone, Trash2, Copy } from 'lucide-react';
import type { OperatorAccount } from '../../../shared/types';
import { cn } from '@/shared/utils/cn';
import { AddAccountModal } from '@/components/AddAccountModal';
import { accountsApi } from '@/services/accountsApi';

export const Accounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<OperatorAccount[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const loadAccounts = useCallback(async () => {
    const data = await accountsApi.list();
    setAccounts(data.accounts);
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this account?')) return;
    await accountsApi.remove(id);
    await loadAccounts();
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.mobile.includes(search) ||
    acc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0a0a0a]">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
            <span>Dashboard</span>
            <span className="text-gray-700">/</span>
            <span className="text-gray-200">Accounts</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">BharatGas Accounts</h1>
          <p className="text-gray-500 text-sm">Manage your linked operator accounts {accounts.length === 0 && "(No accounts found)"}</p>
          <p className="text-xs font-medium text-gray-600 mt-2">Active accounts linked to your manager ID</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-500 group-focus-within:text-green-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by number or name..."
              className="w-full pl-11 pr-4 py-3 bg-[#141414] border border-white/5 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500/50 transition-all text-sm"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-green-500/20 active:scale-95"
          >
            <Plus className="size-5" />
            Add Account
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {filteredAccounts.map((acc, i) => (
          <motion.div
            key={acc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#141414] border border-white/5 rounded-[2.5rem] p-8 hover:border-white/10 transition-all hover:shadow-2xl hover:shadow-black/50 group"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="flex gap-5">
                <div className="size-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-green-500 shadow-inner">
                  <Smartphone className="size-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white leading-tight tracking-tight">{acc.mobile}</h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.15em] mt-1.5 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-green-500" />
                    {acc.name}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={cn(
                  "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border",
                  acc.status === 'Active' ? "bg-green-500/5 text-green-500 border-green-500/10" : "bg-red-500/5 text-red-500 border-red-500/10"
                )}>
                  {acc.status}
                </span>
                <span className="text-[10px] font-bold text-gray-600">Operator v2.0</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 px-1">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Device ID</p>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 group/id">
                  <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-3 min-w-0 flex-1">
                    <span className="truncate font-mono">{acc.deviceId || 'NOT_SET'}</span>
                    <button className="text-gray-600 hover:text-white transition-colors flex-shrink-0">
                      <Copy className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Device Model</p>
                <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/5">
                  <p className="text-xs font-bold text-gray-400 truncate">{acc.model || 'Unknown Device'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/accounts/${acc.id}`)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-black py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-green-500/10"
              >
                <span className="text-sm uppercase tracking-tight">Manage Orders</span>
              </button>

              <button
                onClick={() => navigate(`/accounts/${acc.id}?tab=completed`)}
                className="bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest border border-white/5"
              >
                Done
              </button>

              <button
                onClick={(e) => handleDelete(acc.id, e)}
                className="bg-red-500/5 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 p-4 rounded-2xl transition-all border border-red-500/10"
              >
                <Trash2 className="size-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AddAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={loadAccounts} />
    </div>
  );
};
