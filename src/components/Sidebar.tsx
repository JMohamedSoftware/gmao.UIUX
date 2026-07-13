import React from 'react';
import { useGmao } from '../context/GmaoContext';
import { usePermissions } from '../hooks/usePermissions';
import { 
  LayoutDashboard, 
  Wrench, 
  CalendarRange, 
  KanbanSquare, 
  FileCheck, 
  Boxes, 
  Truck, 
  BarChart3, 
  Settings2, 
  Smartphone, 
  Moon, 
  Sun,
  LogOut,
  Building2,
  Package,
  CreditCard,
  Activity,
  Layers,
  Settings
} from 'lucide-react';

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onOpenMobileSim: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, onOpenMobileSim }) => {
  const { 
    currentUser, 
    logout, 
    darkMode, 
    toggleDarkMode, 
    selectedCampaign, 
    setSelectedCampaign,
    campaigns,
    workOrders,
    incidents,
    tenants,
    impersonatedTenantId,
    impersonateTenant
  } = useGmao();

  const { canAccess } = usePermissions();

  const isSuperAdmin = currentUser?.role === 'SuperAdmin';
  const isImpersonating = isSuperAdmin && !!impersonatedTenantId;

  const currentTenant = tenants.find(t => t.id === impersonatedTenantId);

  // All CMMS menus — will be filtered by role
  const allMenuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'equipment', label: 'Équipements', icon: Wrench },
    { id: 'preventive', label: 'Préventif', icon: CalendarRange },
    { id: 'corrective', label: 'Incidents', icon: KanbanSquare },
    { id: 'workorders', label: 'OTs', icon: FileCheck },
    { id: 'inventory', label: 'Stock', icon: Boxes },
    { id: 'suppliers', label: 'Fournisseurs', icon: Truck },
    { id: 'reports', label: 'Rapports', icon: BarChart3 },
    { id: 'admin', label: 'Admin', icon: Settings2 }
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => canAccess(item.id));

  // Super Admin global menus
  const superAdminMenuItems = [
    { id: 'saas-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'saas-tenants', label: 'Tenants', icon: Building2 },
    { id: 'saas-plans', label: 'Plans', icon: Package },
    { id: 'saas-billing', label: 'Billing', icon: CreditCard },
    { id: 'saas-monitoring', label: 'Monitoring', icon: Activity },
    { id: 'saas-logs', label: 'Logs', icon: Layers },
    { id: 'saas-settings', label: 'Settings', icon: Settings }
  ];

  // Calculate alerts to display
  const activeAlerts = incidents.filter(i => i.status !== 'Transformé en OT' && i.status !== 'Rejeté').length;
  const pendingOts = workOrders.filter(ot => ot.status === 'En attente' || ot.status === 'En cours').length;

  return (
    <aside className="w-32 lg:w-40 h-[calc(100vh-2rem)] sticky top-4 ml-4 glass-panel rounded-custom-xl border border-white/40 dark:border-slate-800/40 p-3 flex flex-col justify-between shadow-lg select-none z-30 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col items-center">
        {/* Brand / Logo */}
        <div className="flex flex-col items-center gap-2 mb-6 mt-2">
          <div className="w-16 h-16 rounded-full bg-white/20 p-1 flex items-center justify-center shadow-lg border border-white/30 overflow-hidden relative group">
            <img 
              src="/tomate-rouge-juteuse-gouttes-eau_191095-79653.avif" 
              alt="Logo" 
              className="w-full h-full object-cover rounded-full transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="text-center mt-1 hidden sm:block">
            <h1 className="font-black text-sm tracking-tight text-slate-800 dark:text-white leading-none">
              POMODORO
            </h1>
          </div>
        </div>

        {/* Impersonation Banner Alert */}
        {isImpersonating && currentTenant && (
          <div className="mb-4 w-full p-2 bg-amber-500/15 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl text-[9px] font-bold flex flex-col items-center gap-1.5 text-center">
            <span>Sim: {currentTenant.name.substring(0, 8)}..</span>
            <button
              onClick={() => {
                impersonateTenant(null);
                onNavigate('saas-dashboard');
              }}
              className="w-full py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded font-black text-center text-[8px] shadow-sm uppercase"
            >
              Quitter
            </button>
          </div>
        )}

        {/* Campaign selector */}
        {(!isSuperAdmin || isImpersonating) && (
          <div className="w-full bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 rounded-xl p-1.5 mb-4 text-center">
            <select 
              value={selectedCampaign} 
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full bg-transparent border-none text-[9px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer text-center appearance-none"
            >
              {campaigns.map(c => (
                <option key={c.id} value={c.name} className="dark:bg-slate-900 text-center">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation List - Icon Centric */}
        <nav className="flex flex-col gap-2 w-full">
          {/* Render Super Admin main tabs */}
          {isSuperAdmin && !isImpersonating && superAdminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex flex-col items-center justify-center p-3 rounded-2xl gap-2 transition-all ${
                  isActive 
                    ? 'bg-slate-900 text-amber-500 shadow-md shadow-slate-900/30 font-bold scale-[1.02] dark:bg-slate-800' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className="w-8 h-8" />
                <span className="text-[10px] text-center font-bold tracking-wide leading-tight">{item.label}</span>
              </button>
            );
          })}

          {/* Render standard CMMS tabs */}
          {(!isSuperAdmin || isImpersonating) && menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id || currentScreen.startsWith(`${item.id}-`);
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex flex-col items-center justify-center relative p-3 rounded-2xl gap-2 transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/30 font-bold scale-[1.02]' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-8 h-8 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {/* Notification counts as absolute badges on top right of the icon */}
                  {item.id === 'corrective' && activeAlerts > 0 && (
                    <span className="absolute -top-2 -right-3 w-5 h-5 flex items-center justify-center text-[9px] font-black bg-rose-500 text-white rounded-full shadow-sm animate-pulse border-2 border-white dark:border-slate-900">
                      {activeAlerts}
                    </span>
                  )}
                  {item.id === 'workorders' && pendingOts > 0 && (
                    <span className={`absolute -top-2 -right-3 w-5 h-5 flex items-center justify-center text-[9px] font-black rounded-full shadow-sm border-2 border-white dark:border-slate-900 ${isActive ? 'bg-white text-primary' : 'bg-amber-500 text-white'}`}>
                      {pendingOts}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-center font-bold tracking-wide leading-tight mt-1">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Tools & User profile */}
      <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 items-center">
        {/* Toggle Tools */}
        <div className="flex gap-2 w-full">
          <button 
            onClick={toggleDarkMode}
            title="Basculer de thème"
            className="flex-1 py-2 rounded-xl bg-white/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/30 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={onOpenMobileSim}
            title="Ouvrir simulateur mobile"
            className="flex-1 py-2 rounded-xl bg-white/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/30 transition-colors"
          >
            <Smartphone className="w-5 h-5" />
          </button>
        </div>

        {/* User Card - Icon Centric */}
        {currentUser && (
          <div className="flex flex-col items-center justify-center w-full bg-white/30 dark:bg-slate-900/10 p-2 rounded-xl border border-white/50 dark:border-slate-800/50 gap-2 relative group">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-full object-cover border-2 border-white/70 shadow-sm"
            />
            <div className="text-center px-1">
              <h4 className="text-[9px] font-black text-slate-700 dark:text-slate-200 truncate max-w-full">
                {currentUser.name}
              </h4>
            </div>
            {/* Logout button appears on hover */}
            <button 
              onClick={logout} 
              title="Se déconnecter"
              className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-1">
                <LogOut className="w-5 h-5" />
                <span className="text-[8px] font-bold uppercase">Quitter</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

