import React, { useState } from 'react';
import { useGmao, Equipment, WorkOrder } from '../context/GmaoContext';
import { usePermissions } from '../hooks/usePermissions';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  Settings2, 
  User, 
  Wrench, 
  RefreshCw, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock3,
  X,
  Info,
  Filter
} from 'lucide-react';

interface PreventiveProps {
  onNavigate: (screen: string) => void;
}

interface PreventiveRule {
  id: string;
  equipmentId: string;
  title: string;
  frequency: 'Quotidienne' | 'Hebdomadaire' | 'Mensuelle' | 'Trimestrielle' | 'Semestrielle' | 'Annuelle';
  triggerType: 'Temps' | 'Compteur';
  thresholdValue: string; // e.g. "Chaque 1er du mois" or "500 heures"
  lastTriggered: string;
  nextTrigger: string;
  technicianId: string;
  priority: 'Faible' | 'Moyenne' | 'Haute' | 'Critique';
}

export const Preventive: React.FC<PreventiveProps> = ({ onNavigate }) => {
  const { equipments, technicians, workOrders, addWorkOrder } = useGmao();
  const { canDo, isTechnicien } = usePermissions();
  
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1)); // Juillet 2026
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [selectedPlanDetails, setSelectedPlanDetails] = useState<PreventiveRule | null>(null);

  // Filters
  const [filterEq, setFilterEq] = useState('');
  const [filterFam, setFilterFam] = useState('');
  const [filterTech, setFilterTech] = useState('');
  const [filterPrio, setFilterPrio] = useState('');

  // Initial mock preventive rules
  const [rules, setRules] = useState<PreventiveRule[]>([
    {
      id: 'PRV-001',
      equipmentId: 'EQ-BOIL-001',
      title: 'Contrôle Mensuel Réglementaire Pression Vapeur',
      frequency: 'Mensuelle',
      triggerType: 'Temps',
      thresholdValue: 'Tous les 30 jours',
      lastTriggered: '2026-06-06',
      nextTrigger: '2026-07-06', // Overdue
      technicianId: 'TECH-002',
      priority: 'Critique'
    },
    {
      id: 'PRV-002',
      equipmentId: 'EQ-PUMP-001',
      title: 'Contrôle Roulements & Vibration',
      frequency: 'Trimestrielle',
      triggerType: 'Compteur',
      thresholdValue: 'Toutes les 500 heures',
      lastTriggered: '2026-05-15',
      nextTrigger: '2026-08-15',
      technicianId: 'TECH-001',
      priority: 'Moyenne'
    },
    {
      id: 'PRV-003',
      equipmentId: 'EQ-AUTO-001',
      title: 'Test d\'étanchéité des Soupapes Autoclave',
      frequency: 'Hebdomadaire',
      triggerType: 'Temps',
      thresholdValue: 'Chaque dimanche',
      lastTriggered: '2026-06-29',
      nextTrigger: '2026-07-05', // Completed
      technicianId: 'TECH-003',
      priority: 'Haute'
    },
    {
      id: 'PRV-004',
      equipmentId: 'EQ-CONV-001',
      title: 'Inspection Tension Bande & Alignement Rouleaux',
      frequency: 'Hebdomadaire',
      triggerType: 'Temps',
      thresholdValue: 'Chaque mercredi',
      lastTriggered: '2026-07-01',
      nextTrigger: '2026-07-08', // Due soon
      technicianId: 'TECH-001',
      priority: 'Haute'
    },
    {
      id: 'PRV-005',
      equipmentId: 'EQ-PACK-001',
      title: 'Remplacement Préventif Buses de Remplissage',
      frequency: 'Semestrielle',
      triggerType: 'Compteur',
      thresholdValue: 'Tous les 10,000 cycles',
      lastTriggered: '2026-02-12',
      nextTrigger: '2026-08-12',
      technicianId: 'TECH-005',
      priority: 'Haute'
    }
  ]);

  // Handle manual trigger (Generating an OT immediately)
  const handleTriggerPlan = (rule: PreventiveRule) => {
    addWorkOrder({
      equipmentId: rule.equipmentId,
      title: rule.title,
      description: `Ordre de travail automatique généré à partir du plan préventif ${rule.id}. Action requise: ${rule.thresholdValue}.`,
      type: 'Préventif',
      priority: rule.priority,
      technicianId: rule.technicianId,
      assignedBy: 'POMODORO Scheduler',
      campaign: 'Campagne 2026'
    });

    // Update rule nextTrigger date
    setRules(prev =>
      prev.map(r => {
        if (r.id === rule.id) {
          const nextDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          return { ...r, lastTriggered: new Date().toISOString().split('T')[0], nextTrigger: nextDate };
        }
        return r;
      })
    );
  };

  // Build Calendar Days dynamically based on currentMonth
  const buildCalendarCells = () => {
    const cells = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday = 0, ... Sunday = 6 (ISO week)
    let startDay = new Date(year, month, 1).getDay(); // 0=Sun...6=Sat
    startDay = startDay === 0 ? 6 : startDay - 1; // Convert to Mon=0

    for (let i = 0; i < startDay; i++) {
      cells.push({ dateStr: '', dayNum: 0 });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ dateStr, dayNum: day });
    }
    return cells;
  };

  const calendarCells = buildCalendarCells();


  const getEventsForDay = (dateStr: string) => {
    if (!dateStr) return [];
    // Check in active OTs of type "Préventif"
    const ots = workOrders.filter(ot => 
      ot.type === 'Préventif' && 
      ot.createdDate.split('T')[0] === dateStr
    );
    // Filter scheduled rules based on the new filters
    const filteredRules = rules.filter(r => {
      const eq = equipments.find(e => e.id === r.equipmentId);
      if (filterEq && eq?.id !== filterEq) return false;
      if (filterFam && eq?.category !== filterFam) return false;
      if (filterTech && r.technicianId !== filterTech) return false;
      if (filterPrio && r.priority !== filterPrio) return false;
      return true;
    });

    const scheduledRules = filteredRules.filter(r => r.nextTrigger === dateStr);
    return [
      ...ots.map(o => ({ id: o.id, title: o.title, status: o.status, type: 'ot', priority: o.priority })),
      ...scheduledRules.map(r => ({ id: r.id, title: r.title, status: 'Planifié', type: 'rule', priority: r.priority }))
    ];
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critique': return 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400';
      case 'Haute': return 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400';
      case 'Moyenne': return 'border-primary bg-primary/10 text-primary';
      default: return 'border-slate-300 bg-slate-100 text-slate-650';
    }
  };

  // Simulated drag-and-drop: Change date of a plan by clicking day
  const [activePlanToDrag, setActivePlanToDrag] = useState<PreventiveRule | null>(null);

  const handleSelectPlanToDrag = (rule: PreventiveRule) => {
    setActivePlanToDrag(rule);
    setSelectedPlanDetails(rule);
  };

  const handleDropOnDay = (dateStr: string) => {
    if (!activePlanToDrag || !dateStr) return;
    
    setRules(prev =>
      prev.map(r => r.id === activePlanToDrag.id ? { ...r, nextTrigger: dateStr } : r)
    );
    setActivePlanToDrag(null);
  };

  // Month navigation helpers
  const todayDateStr = new Date().toISOString().split('T')[0];
  const monthLabel = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const capitalizedMonthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const goToPrevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const goToToday = () => setCurrentMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title & Coverage */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Calendrier Maintenance Préventive
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            Planification périodique des contrôles réglementaires et gammes de maintenance
          </p>
        </div>

        {/* Taux de couverture */}
        <div className="glass-panel p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm min-w-[250px]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Couverture Mois</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">85%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
          </div>
          <p className="text-[9px] text-slate-400 mt-1.5">34 / 40 préventifs réalisés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Rule Engine / Plan Queue */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="glass-panel p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-center group relative cursor-help">
              <h3 className="text-[11px] font-bold text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                Planification (Drag/Click) <Info className="w-3.5 h-3.5 text-slate-400" />
              </h3>
              <div className="absolute hidden group-hover:block top-6 left-0 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg z-10 w-48">
                Glissez un plan vers une date du calendrier pour le planifier manuellement.
              </div>
              <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
                GMAO Engine
              </span>
            </div>
            
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal border-b border-slate-100 dark:border-slate-800 pb-2 mb-1">
              {activePlanToDrag 
                ? "Cliquez sur une date pour déposer le plan." 
                : "Sélectionnez un plan préventif pour le déplacer ou voir ses détails."
              }
            </p>

            <div className="flex flex-col gap-3 mt-1">
              {rules.map(rule => {
                const isSelected = activePlanToDrag?.id === rule.id;
                const eq = equipments.find(e => e.id === rule.equipmentId);
                const isOverdue = new Date(rule.nextTrigger) < new Date('2026-07-07');
                
                return (
                  <div 
                    key={rule.id}
                    onClick={() => handleSelectPlanToDrag(rule)}
                    className={`p-3 rounded-custom-md border cursor-pointer hover-lift flex flex-col gap-2 relative transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-[0_4px_12px_rgba(37,99,235,0.1)] scale-[1.02]' 
                        : 'border-white/50 dark:border-slate-850/40 bg-white/60 dark:bg-slate-900/20 neumorphic-card hover:bg-white/80'
                    }`}
                  >
                    {isOverdue && (
                      <span className="absolute top-2 right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}

                    <div className="flex justify-between items-start pr-3">
                      <span className="text-[9px] font-bold text-slate-400 font-mono leading-none bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{rule.id}</span>
                      <div className="flex gap-1">
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${rule.triggerType === 'Temps' ? 'bg-sky-500/10 text-sky-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                          {rule.triggerType}
                        </span>
                        {rule.priority === 'Critique' && (
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider bg-rose-500/10 text-rose-600">
                            Critique
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-xs text-slate-750 dark:text-slate-200 leading-tight">
                      {rule.title}
                    </h4>
                    
                    <div className="text-[9px] text-slate-500 font-semibold mb-1 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/40 px-2 py-1 rounded">
                      <Settings2 className="w-3 h-3 text-slate-400" />
                      {rule.triggerType === 'Temps' ? (
                        <span>Fréquence : <span className="text-primary">{rule.frequency}</span></span>
                      ) : (
                        <span>Seuil : <span className="text-primary">{rule.thresholdValue}</span></span>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-450 flex items-center justify-between mt-1 pt-2 border-t border-slate-150 dark:border-slate-800/80">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3 text-slate-400" />
                        <strong>{rule.nextTrigger}</strong>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerPlan(rule);
                        }}
                        className="bg-primary hover:bg-primary/95 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-custom-sm shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        OT
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Calendar Grid */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Top Filters Bar */}
          <div className="glass-panel p-3 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-slate-400">
              <Filter className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Filtres</span>
            </div>
            
            <select value={filterEq} onChange={(e) => setFilterEq(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1.5 rounded outline-none font-semibold">
              <option value="">Équipement (Tous)</option>
              {equipments.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            
            <select value={filterFam} onChange={(e) => setFilterFam(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1.5 rounded outline-none font-semibold">
              <option value="">Famille (Toutes)</option>
              {Array.from(new Set(equipments.map(e => e.category))).map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={filterTech} onChange={(e) => setFilterTech(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1.5 rounded outline-none font-semibold">
              <option value="">Technicien (Tous)</option>
              {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            <select value={filterPrio} onChange={(e) => setFilterPrio(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1.5 rounded outline-none font-semibold">
              <option value="">Priorité (Toutes)</option>
              <option value="Faible">Faible</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Haute">Haute</option>
              <option value="Critique">Critique</option>
            </select>

            <div className="flex-1"></div>

            {canDo('preventive', 'creer') && (
            <button className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all">
              <Plus className="w-4 h-4" />
              Nouveau Plan Préventif
            </button>
            )}
          </div>

          <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col justify-between flex-1">
            <div>
              {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                  {capitalizedMonthLabel}
                </h3>
              </div>
              
              <div className="flex gap-1.5 border border-slate-200/50 dark:border-slate-800/50 rounded-lg overflow-hidden bg-white/40 dark:bg-slate-900/10 p-0.5">
                <button onClick={goToPrevMonth} className="p-1 text-slate-500 hover:bg-slate-150 rounded cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={goToToday} className="text-[10px] font-bold text-slate-550 px-2.5 hover:bg-slate-150 rounded cursor-pointer">
                  Aujourd'hui
                </button>
                <button onClick={goToNextMonth} className="p-1 text-slate-500 hover:bg-slate-150 rounded cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mer</span>
              <span>Jeu</span>
              <span>Ven</span>
              <span>Sam</span>
              <span>Dim</span>
            </div>

            {/* Month grid cells */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell, idx) => {
                const hasEvents = cell.dayNum > 0;
                const events = getEventsForDay(cell.dateStr);
                const isToday = cell.dateStr === todayDateStr;

                return (
                  <div
                    key={idx}
                    onClick={() => hasEvents && handleDropOnDay(cell.dateStr)}
                    className={`min-h-[90px] border rounded-custom-sm p-1.5 flex flex-col gap-1.5 transition-all select-none ${
                      cell.dayNum === 0 
                        ? 'bg-transparent border-transparent cursor-default' 
                        : isToday
                          ? 'border-primary bg-primary/5 shadow-[inset_0_0_10px_rgba(37,99,235,0.05)]'
                          : 'border-slate-200/50 dark:border-slate-850 bg-white/40 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-800'
                    } ${activePlanToDrag && cell.dayNum > 0 ? 'ring-2 ring-primary/20 cursor-pointer border-dashed border-primary/50' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-extrabold ${
                        isToday 
                          ? 'text-white bg-primary px-1.5 py-0.5 rounded-full' 
                          : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {cell.dayNum > 0 ? cell.dayNum : ''}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[60px] scrollbar-thin">
                      {events.map((ev, eIdx) => (
                        <div
                          key={eIdx}
                          title={ev.title}
                          className={`text-[8px] font-bold px-1 py-0.5 rounded border truncate leading-none ${getPriorityColor(ev.priority)}`}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend indicator bar */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 border-t-2 border-rose-500" />
              <span>Priorité Critique</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 border-t-2 border-amber-500" />
              <span>Priorité Haute</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 border-t-2 border-primary" />
              <span>Priorité Moyenne</span>
            </div>
          </div>
        </div>
        </div>

      </div>

      {/* Drawer: Detailed Preventive Plan */}
      {selectedPlanDetails && (
        <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col transform transition-transform duration-300">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              {selectedPlanDetails.id}
            </h2>
            <button 
              onClick={() => { setSelectedPlanDetails(null); setActivePlanToDrag(null); }} 
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-6 text-sm">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white mb-2">{selectedPlanDetails.title}</h3>
              <p className="text-[11px] text-slate-500 font-medium">Contrôle planifié automatiquement pour assurer la conformité et la sécurité.</p>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
              <div>
                <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Équipement</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {equipments.find(e => e.id === selectedPlanDetails.equipmentId)?.name || selectedPlanDetails.equipmentId}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Famille</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {equipments.find(e => e.id === selectedPlanDetails.equipmentId)?.category || '-'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Déclenchement</span>
                <span className={`inline-block px-2 py-0.5 rounded font-bold ${selectedPlanDetails.triggerType === 'Temps' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {selectedPlanDetails.triggerType}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Fréquence</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedPlanDetails.frequency}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Intervalle</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedPlanDetails.thresholdValue}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Priorité</span>
                <span className={`font-semibold ${
                  selectedPlanDetails.priority === 'Critique' ? 'text-rose-600' :
                  selectedPlanDetails.priority === 'Haute' ? 'text-amber-600' : 'text-primary'
                }`}>{selectedPlanDetails.priority}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Dernière inter.</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedPlanDetails.lastTriggered}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Prochaine</span>
                <span className="font-semibold text-rose-500">{selectedPlanDetails.nextTrigger}</span>
              </div>
            </div>

            {/* Checklist mock */}
            <div>
              <span className="block text-[10px] uppercase text-slate-400 font-bold mb-3 border-b border-slate-100 dark:border-slate-800 pb-1">Tâches (Checklist)</span>
              <ul className="flex flex-col gap-2">
                <li className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Vérifier les paramètres de pression et températures
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Nettoyer le filtre principal et vérifier colmatage
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Graisser les roulements (Graisse SKF LGFP2)
                </li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 bg-slate-50 dark:bg-slate-800/50">
             {canDo('preventive', 'modifier') && (
               <button className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 py-2.5 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">
                 Modifier
               </button>
             )}
             {canDo('preventive', 'lancer') && (
               <button 
                  onClick={() => {
                    handleTriggerPlan(selectedPlanDetails);
                    setSelectedPlanDetails(null);
                    setActivePlanToDrag(null);
                  }}
                  className="flex-1 bg-primary text-white py-2.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
                >
                 Générer OT
               </button>
             )}
          </div>
        </div>
      )}

    </div>
  );
};
