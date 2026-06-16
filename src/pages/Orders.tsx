import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Search, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

interface Order {
  id: string;
  orderId: string;
  customer: string;
  mobile: string;
  status: string;
  points: number;
  completedAt?: any;
}

export const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!user) return;
        
        const q = query(
            collection(db, 'orders'), 
            where('ownerId', '==', user.uid),
            orderBy('orderId', 'desc'),
            limit(50)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ords = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            } as Order));
            setOrders(ords);
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));
        
        return unsubscribe;
    }, [user]);

    const filteredOrders = orders.filter(o => 
        o.orderId.includes(search) || 
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.mobile.includes(search)
    );

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#0a0a0a]">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-8">
                <span>Dashboard</span>
                <span className="text-gray-700">/</span>
                <span className="text-gray-200">Orders</span>
            </div>

            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Order History</h1>
                    <p className="text-gray-500 text-sm">Monitor all deliveries across your operator accounts</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative min-w-[250px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                        <input 
                            type="text" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter by Order ID or Name..." 
                            className="w-full pl-11 pr-4 py-3 bg-[#141414] border border-white/5 rounded-2xl outline-none focus:border-green-500/50 transition-all text-sm"
                        />
                    </div>
                </div>
            </header>

            <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                            <ShoppingCart className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Consolidated Orders</h2>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total {orders.length} Records Found</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black/20 border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Order #</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Customer Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] text-right">Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                        No Orders Synchronized Yet
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order, i) => (
                                    <motion.tr 
                                        key={order.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-gray-500 group-hover:text-gray-300">#{order.orderId}</span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-gray-100">{order.customer}</p>
                                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{order.mobile}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                order.status === 'completed' ? "bg-green-500/5 text-green-500 border-green-500/10" : "bg-yellow-500/5 text-yellow-500 border-yellow-500/10"
                                            )}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg text-xs font-black border",
                                                order.points < 0 ? "bg-red-500/5 text-red-500 border-red-500/10" : "bg-green-500/5 text-green-500 border-green-500/10"
                                            )}>
                                                {order.points}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Showing {filteredOrders.length} orders</p>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all">Export Report</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
