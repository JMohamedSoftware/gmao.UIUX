import React, { useState, useEffect, useRef } from 'react';
import { useGmao } from '../context/GmaoContext';
import { Search, Settings, Wrench, AlertTriangle, Cpu, Users, FileText, Package, ArrowRight, ShieldCheck, Moon, Sun } from 'lucide-react';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  onDeclareIncident: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose, onNavigate, onDeclareIncident }) => {
  const { equipments, workOrders, darkMode, toggleDarkMode } = useGmao();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const navigationItems = [
    { name: 'Dashboard Principal', screen: 'dashboard', icon: Cpu, category: 'Navigation' },
    { name: 'Registre des Équipements', screen: 'equipment', icon: Wrench, category: 'Navigation' },
    { name: 'Maintenance Préventive (Calendrier)', screen: 'preventive', icon: FileText, category: 'Navigation' },
    { name: 'Kanban des Incidents (Correctif)', screen: 'corrective', icon: AlertTriangle, category: 'Navigation' },
    { name: 'Bons de Travail (OT)', screen: 'workorders', icon: Settings, category: 'Navigation' },
    { name: 'Gestion des Stocks', screen: 'inventory', icon: Package, category: 'Navigation' },
    { name: 'Registre des Fournisseurs', screen: 'suppliers', icon: Users, category: 'Navigation' },
    { name: 'Statistiques & Rapports', screen: 'reports', icon: FileText, category: 'Navigation' },
    { name: 'Administration & Rôles', screen: 'admin', icon: ShieldCheck, category: 'Navigation' },
  ];

  const actionItems = [
    { name: 'Déclarer une panne machine (Incident)', action: () => { onClose(); onDeclareIncident(); }, icon: AlertTriangle, category: 'Actions Rapides' },
    { name: darkMode ? 'Basculer en Mode Clair' : 'Basculer en Mode Sombre', action: () => { toggleDarkMode(); }, icon: darkMode ? Sun : Moon, category: 'Actions Rapides' },
  ];

  // Search filter
  const filteredNav = navigationItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredActions = actionItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEquip = equipments.filter(eq => 
    eq.name.toLowerCase().includes(search.toLowerCase()) || 
    eq.id.toLowerCase().includes(search.toLowerCase()) ||
    eq.location.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 3).map(eq => ({
    name: `Fiche: ${eq.name} (${eq.id})`,
    screen: `equipment-detail:${eq.id}`,
    icon: Wrench,
    category: 'Équipements'
  }));

  const filteredOTs = workOrders.filter(ot => 
    ot.id.toLowerCase().includes(search.toLowerCase()) || 
    ot.title.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 3).map(ot => ({
    name: `Ordre de Travail: ${ot.id} - ${ot.title}`,
    screen: `workorder-detail:${ot.id}`,
    icon: Settings,
    category: 'Ordres de Travail (OT)'
  }));

  // Combine items
  const allItems: any[] = [];
  
  if (filteredNav.length > 0) allItems.push(...filteredNav);
  if (filteredActions.length > 0) allItems.push(...filteredActions);
  if (filteredEquip.length > 0) allItems.push(...filteredEquip);
  if (filteredOTs.length > 0) allItems.push(...filteredOTs);

  const handleSelect = (item: any) => {
    if (item.screen) {
      onNavigate(item.screen);
      onClose();
    } else if (item.action) {
      item.action();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % allItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleSelect(allItems[selectedIndex]);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md z-50 flex items-start justify-center pt-[15vh]">
      <div 
        ref={menuRef}
        className="w-full max-w-2xl glass-panel-heavy rounded-custom-lg border border-white/50 dark:border-slate-800/80 shadow-2xl overflow-hidden animate-[slideUp_0.2s_ease-out]"
        onKeyDown={handleKeyDown}
      >
        {/* Search header */}
        <div className="flex items-center px-4 border-b border-slate-200/50 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/10">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            className="w-full py-4 px-3 bg-transparent text-slate-800 dark:text-slate-100 border-none outline-none placeholder-slate-400 text-base"
            placeholder="Rechercher partout (Ex: Évaporateur, OT-001, préventif, panne...)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <span className="text-[10px] bg-slate-200/70 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 font-mono">
            ESC
          </span>
        </div>

        {/* Search List */}
        <div className="max-h-[350px] overflow-y-auto p-2">
          {allItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">Aucun résultat trouvé pour "{search}"</p>
              <p className="text-xs text-slate-500 mt-1">Veuillez ajuster votre recherche.</p>
            </div>
          ) : (
            <div>
              {/* Grouped Rendering */}
              {['Navigation', 'Actions Rapides', 'Équipements', 'Ordres de Travail (OT)'].map(category => {
                const categoryItems = allItems.filter(item => item.category === category);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category} className="mb-2">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-1">
                      {category}
                    </div>
                    {categoryItems.map((item) => {
                      const absoluteIndex = allItems.indexOf(item);
                      const isSelected = absoluteIndex === selectedIndex;
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.name}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-custom-sm cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-primary text-white dark:bg-primary' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                          }`}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-1 text-[11px] font-mono text-white/80">
                              <span>Ouvrir</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-200/50 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40 text-[10px] text-slate-400 dark:text-slate-500">
          <div className="flex gap-2.5">
            <span>↑↓ Naviguer</span>
            <span>↵ Sélectionner</span>
          </div>
          <div>POMODORO Command Menu</div>
        </div>
      </div>
    </div>
  );
};
