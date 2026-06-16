import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, Repeat, LogOut, Flame, Settings, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../lib/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Accounts', path: '/accounts' },
  { icon: ShoppingCart, label: 'My Orders', path: '/orders' },
  { icon: Repeat, label: 'Transactions', path: '/transactions' },
];

export const Sidebar = () => {
  const { user, profile } = useAuth();
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <aside className="w-68 h-screen border-r border-white/5 bg-[#0a0a0a] sticky top-0 flex flex-col p-4">
      <div className="px-4 mb-10 flex items-center gap-3">
        <div className="size-8 rounded-lg bg-green-500/20 flex items-center justify-center">
          <Flame className="size-5 text-green-500" />
        </div>
        <div>
          <span className="font-bold text-lg block leading-none">BharatGas</span>
          <span className="text-[10px] text-gray-500 font-medium">Delivery Manager</span>
        </div>
      </div>
      
      <div className="px-2 mb-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Menu</div>
      <nav className="flex-1 px-1 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all",
              isActive 
                ? "bg-green-500 text-black shadow-lg shadow-green-500/10" 
                : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("size-5", isActive ? "text-black" : "text-gray-500")} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="px-2 mt-auto pb-4">
        <div className="bg-gradient-to-br from-[#1c1c1c] to-[#141414] p-5 rounded-[2rem] border border-white/5 mb-6 relative overflow-hidden group shadow-xl">
          <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <Flame className="size-24" />
          </div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Points</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-black text-green-500">{profile?.totalPoints ?? 0}</h3>
            <span className="text-[10px] font-bold text-gray-600 uppercase">pts</span>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                    <div key={i} className="size-5 rounded-full border-2 border-[#141414] bg-gray-800" />
                ))}
            </div>
            <div className="size-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Zap className="size-4 text-green-500 fill-green-500/20" />
            </div>
          </div>
        </div>

        <div className="bg-[#141414] p-4 rounded-2xl border border-white/5 flex items-center justify-between mb-4 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center flex-shrink-0 text-sm font-black text-gray-400">
                    {user?.email?.[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-black truncate text-gray-100">{user?.email?.split('@')[0]}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Premium User</p>
                </div>
            </div>
            <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-500">
                <Settings className="size-4" />
            </button>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 text-xs text-gray-500 font-black uppercase tracking-widest hover:text-red-500 transition-colors group"
        >
          <LogOut className="size-4 group-hover:scale-110 transition-transform" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

