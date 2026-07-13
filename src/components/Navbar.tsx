import React, { useState } from 'react';
import { useGmao } from '../context/GmaoContext';
import { Bell, Search, User, Check, Trash2, Command, HelpCircle } from 'lucide-react';

interface NavbarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onOpenCommandMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentScreen, onNavigate, onOpenCommandMenu }) => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    currentUser 
  } = useGmao();

  const [showNotifications, setShowNotifications] = useState(false);

  const getBreadcrumbs = () => {
    const parts = currentScreen.split('-');
    const mainScreen = parts[0];
    
    const breadcrumbs = [{ label: 'Accueil', action: () => onNavigate('dashboard') }];
    
    switch (mainScreen) {
      case 'dashboard':
        breadcrumbs.push({ label: 'Tableau de Bord', action: () => {} });
        break;
      case 'equipment':
        breadcrumbs.push({ label: 'Équipements', action: () => onNavigate('equipment') });
        if (parts[1]) {
          breadcrumbs.push({ label: `Fiche ${parts[1]}`, action: () => {} });
        }
        break;
      case 'preventive':
        breadcrumbs.push({ label: 'Maintenance Préventive', action: () => {} });
        break;
      case 'corrective':
        breadcrumbs.push({ label: 'Incidents & Kanban', action: () => {} });
        break;
      case 'workorders':
        breadcrumbs.push({ label: 'Ordres de Travail', action: () => onNavigate('workorders') });
        if (parts[1]) {
          breadcrumbs.push({ label: `Détail ${parts[1]}`, action: () => {} });
        }
        break;
      case 'inventory':
        breadcrumbs.push({ label: 'Stock de Pièces', action: () => {} });
        break;
      case 'suppliers':
        breadcrumbs.push({ label: 'Fournisseurs', action: () => {} });
        break;
      case 'reports':
        breadcrumbs.push({ label: 'Rapports & Indicateurs', action: () => {} });
        break;
      case 'admin':
        breadcrumbs.push({ label: 'Administration', action: () => {} });
        break;
      default:
        breadcrumbs.push({ label: currentScreen, action: () => {} });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const unreadNotifs = notifications.filter(n => !n.read);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500';
      case 'warning': return 'bg-amber-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <header className="w-full h-16 glass-panel rounded-custom-lg border border-white/40 dark:border-slate-800/40 px-6 flex justify-between items-center shadow-sm relative z-40 select-none">
      
      {/* Breadcrumb Path */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.label}>
            {idx > 0 && <span className="text-slate-350 dark:text-slate-600">/</span>}
            <button 
              onClick={crumb.action}
              className={`hover:text-primary transition-colors cursor-pointer ${
                idx === breadcrumbs.length - 1 ? 'text-slate-850 dark:text-slate-200 font-bold' : ''
              }`}
            >
              {crumb.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        
        {/* Raycast Trigger Search Input */}
        <div 
          onClick={onOpenCommandMenu}
          className="w-80 h-9.5 rounded-custom-sm bg-white/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700/80 px-3 flex items-center justify-between text-xs text-slate-400 cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Rechercher partout...</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-500">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>

        {/* Notifications Center */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-custom-sm bg-white/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/50 hover:bg-white/60 text-slate-650 dark:text-slate-355 transition relative ${
              showNotifications ? 'bg-white border-primary/50 text-primary' : ''
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </button>

          {/* Notifications Glass Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-panel-heavy rounded-custom-md border border-white/50 dark:border-slate-800/80 shadow-2xl p-2 z-50 animate-[slideUp_0.15s_ease-out]">
              <div className="flex justify-between items-center px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Centre de Notifications ({unreadNotifs.length})
                </span>
                {unreadNotifs.length > 0 && (
                  <button 
                    onClick={markAllNotificationsAsRead}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    Tout effacer
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-72 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Aucune notification active
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          // Perform contextual action based on notification type
                          if (notif.type === 'incident') onNavigate('corrective');
                          if (notif.type === 'workorder') onNavigate('workorders');
                          if (notif.type === 'stock') onNavigate('inventory');
                          setShowNotifications(false);
                        }}
                        className={`p-2 rounded-custom-sm flex items-start gap-2.5 transition-colors cursor-pointer text-xs ${
                          notif.read 
                            ? 'bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/20 text-slate-500' 
                            : 'bg-primary/5 dark:bg-primary/5 hover:bg-primary/10 text-slate-800 dark:text-slate-100 font-medium'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getSeverityColor(notif.severity)}`} />
                        <div className="flex-1 overflow-hidden">
                          <h5 className="font-bold text-[11px] leading-tight">{notif.title}</h5>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{notif.message}</p>
                          <span className="text-[9px] text-slate-350 dark:text-slate-650 mt-1 block">
                            {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!notif.read && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationAsRead(notif.id);
                            }}
                            className="p-1 rounded bg-slate-200/50 dark:bg-slate-800 text-slate-500 hover:text-emerald-500"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile quick status */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800/80">
            <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
              {currentUser.role}
            </span>
          </div>
        )}

      </div>
    </header>
  );
};
