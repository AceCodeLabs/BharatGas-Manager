import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, Repeat, LogOut, Flame, Settings } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Accounts', path: '/dashboard/accounts' },
  { icon: ShoppingCart, label: 'My Orders', path: '/orders' },
  { icon: Repeat, label: 'Transactions', path: '/transactions' },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
