import React, { useState } from 'react';
import { useGmao, Equipment, WorkOrder, Incident } from '../context/GmaoContext';
import { usePermissions } from '../hooks/usePermissions';
import { TomatoVisualizer } from '../components/TomatoVisualizer';
import { 
  Plus, 
  Wrench, 
  AlertTriangle, 
  Cpu, 
  Users, 
  FileText, 
  Package, 
  FolderTree,
  ChevronRight,
  ChevronDown,
  Info,
  Calendar,
  CheckCircle,
  Truck,
  Activity,
  FileCheck,
  TrendingUp,
  Sliders,
  ChevronUp,
  X
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';

interface DashboardProps {
  onNavigate: (screen: string) => void;
  onSelectEquipment: (eq: Equipment) => void;
  onDeclareIncident: () => void;
}

// Expandable Tree View Node
const TreeElement: React.FC<{ 
  node: { name: string; eqId?: string; children?: any[] };
  equipments: Equipment[];
  onSelectEquipment: (eq: Equipment) => void;
}> = ({ node, equipments, onSelectEquipment }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  
  const handleNodeClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else if (node.eqId) {
      const eq = equipments.find(e => e.id === node.eqId);
      if (eq) onSelectEquipment(eq);
    }
  };

  return (
    <div className="pl-4 select-none">
      <div 
        onClick={handleNodeClick}
        className="flex items-center gap-1.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:text-primary dark:hover:text-primary cursor-pointer transition-colors"
      >
        {hasChildren ? (
          isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-slate-350 dark:bg-slate-700 ml-1.5 mr-0.5" />
        )}
        <span className={node.eqId ? 'font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200' : ''}>
          {node.name}
        </span>
      </div>
      {isOpen && hasChildren && (
        <div className="border-l border-slate-200/50 dark:border-slate-800 pl-2">
          {node.children!.map((child, idx) => (
            <TreeElement key={idx} node={child} equipments={equipments} onSelectEquipment={onSelectEquipment} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectEquipment, onDeclareIncident }) => {
  const { workOrders, equipments, incidents, technicians, parts, addIncident } = useGmao();

  // Collapsible section for premium graphs
  const [showCharts, setShowCharts] = useState(true);

  // Quick-peek drawer state for arborescence clicks
  const [selectedDashboardEq, setSelectedDashboardEq] = useState<Equipment | null>(null);

  // Form Fields
  const [formEqId, setFormEqId] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formUrgency, setFormUrgency] = useState<Incident['urgency']>('Moyenne');
  const [successSaved, setSuccessSaved] = useState(false);

  // Stats Calculations
  const totalLaborCost = workOrders.reduce((acc, ot) => {
    if (ot.status === 'Terminé' || ot.status === 'Clôturé') {
      const tech = technicians.find(t => t.id === ot.technicianId);
      const rate = tech ? tech.hourlyRate : 35;
      const durationHours = ot.durationMinutes / 60;
      return acc + (durationHours * rate);
    }
    return acc;
  }, 0);

  const totalPartsCost = workOrders.reduce((acc, ot) => {
    if (ot.status === 'Terminé' || ot.status === 'Clôturé') {
      const orderParts = ot.partsUsed.reduce((partAcc, usage) => {
        const part = parts.find(p => p.ref === usage.partRef);
        const price = part ? part.unitPrice : 0;
        return partAcc + (price * usage.quantity);
      }, 0);
      return acc + orderParts;
    }
    return acc;
  }, 0);

  const totalMaintCost = Math.round(totalLaborCost + totalPartsCost);

  // 1. Dimo Maint "Mes infos DI"
  // À traiter: status Nouveau
  const diATraiter = incidents.filter(i => i.status === 'Nouveau').length;
  // En cours: status Validé
  const diEnCours = incidents.filter(i => i.status === 'Validé').length;
  // Réalisé: status Transformé en OT ou Rejeté
  const diRealise = incidents.filter(i => i.status === 'Transformé en OT' || i.status === 'Rejeté').length;

  // 2. Dimo Maint "Les infos BT"
  // À faire: status En attente / Affecté
  const btAFaire = workOrders.filter(o => o.status === 'En attente' || o.status === 'Affecté').length;
  // En cours: status En cours
  const btEnCours = workOrders.filter(o => o.status === 'En cours').length;
  // Fait: status Terminé / Clôturé
  const btFait = workOrders.filter(o => o.status === 'Terminé' || o.status === 'Clôturé').length;

  // 3. Asset Tree structure (Tomato factory)
  const factoryTree = {
    name: '05 - Usine Tomates POMODORO',
    children: [
      {
        name: '1 - Réception & Lavage',
        children: [
          { name: 'EQ-CONV-001 - Convoyeur à bande Réception', eqId: 'EQ-CONV-001' }
        ]
      },
      {
        name: '2 - Concentration',
        children: [
          { name: 'EQ-EVAP-001 - Évaporateur Concentrateur N°1', eqId: 'EQ-EVAP-001' },
          { name: 'EQ-PUMP-001 - Pompe Centrifuge LKH-25', eqId: 'EQ-PUMP-001' }
        ]
      },
      {
        name: '3 - Conditionnement & Stérilisation',
        children: [
          { name: 'EQ-AUTO-001 - Autoclave FMC Steril-Host 4', eqId: 'EQ-AUTO-001' },
          { name: 'EQ-PACK-001 - Remplisseuse Aseptique Krones', eqId: 'EQ-PACK-001' }
        ]
      },
      {
        name: '4 - Énergie & Utilités',
        children: [
          { name: 'EQ-BOIL-001 - Chaudière Thermique Babcock VAP 3000', eqId: 'EQ-BOIL-001' },
          { name: 'EQ-COMP-001 - Compresseur Central Kaeser CSD 125', eqId: 'EQ-COMP-001' },
          { name: 'EQ-STAT-001 - Station Traitement Eau brute Veolia', eqId: 'EQ-STAT-001' }
        ]
      }
    ]
  };

  const { canDo, isTechnicien } = usePermissions();

  const handleInlineIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEqId || !formDesc) return;

    addIncident({
      equipmentId: formEqId,
      description: formDesc,
      reportedBy: 'Youssef Mansouri (Prod)',
      urgency: formUrgency
    });

    setFormEqId('');
    setFormDesc('');
    setFormUrgency('Moyenne');
    setSuccessSaved(true);
    setTimeout(() => setSuccessSaved(false), 2500);
  };

  // Recharts composed dataset
  const monthlyTrendsData = [
    { name: 'Jan', pannes: 4, cost: 4200 },
    { name: 'Fév', pannes: 3, cost: 3800 },
    { name: 'Mar', pannes: 5, cost: 5100 },
    { name: 'Avr', pannes: 2, cost: 2400 },
    { name: 'Mai', pannes: 7, cost: 7200 },
    { name: 'Juin', pannes: 6, cost: 6800 },
    { name: 'Juil', pannes: btEnCours + diATraiter + 3, cost: totalMaintCost || 8900 }
  ];

  // Unassigned Work Orders
  const unassignedOts = workOrders.filter(ot => ot.status === 'En attente' && !ot.technicianId);

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Accueil Supervision
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            Interface d'exploitation connectée • Dimo Maint layout
          </p>
        </div>
      </div>

      {/* Dimo Maint Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ROW 1 LEFT: Mes menus favoris grid (Col-span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-4">
              Mes menus favoris
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-white text-[11px] font-bold">
              {/* Red DI creation */}
              <button 
                onClick={() => {
                  const formEl = document.getElementById('di-form');
                  if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="aspect-video bg-gradient-to-br from-rose-400 to-rose-600 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-rose-200 dark:hover:shadow-rose-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-rose-300/30"
              >
                <AlertTriangle className="w-5 h-5 drop-shadow" />
                <span className="drop-shadow">Création de DI</span>
              </button>

              {/* Orange BT creation */}
              <button 
                onClick={() => onNavigate('workorders')}
                className="aspect-video bg-gradient-to-br from-amber-400 to-orange-500 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-amber-200 dark:hover:shadow-amber-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-amber-300/30"
              >
                <Plus className="w-5 h-5 drop-shadow" />
                <span className="drop-shadow">Création de BT</span>
              </button>

              {/* Emerald Arborescence */}
              <button 
                onClick={() => onNavigate('equipment')}
                className="aspect-video bg-gradient-to-br from-emerald-400 to-teal-600 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-emerald-200 dark:hover:shadow-emerald-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-emerald-300/30"
              >
                <FolderTree className="w-5 h-5 drop-shadow" />
                <span className="drop-shadow">Arborescence</span>
              </button>

              {/* Pink Preventive */}
              <button 
                onClick={() => onNavigate('preventive')}
                className="aspect-video bg-gradient-to-br from-pink-400 to-fuchsia-600 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-pink-200 dark:hover:shadow-pink-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-pink-300/30"
              >
                <Calendar className="w-5 h-5 drop-shadow" />
                <span className="drop-shadow">Prév. Plannings</span>
              </button>

              {/* Indigo Gammes */}
              {canDo('admin', 'voir') && (
              <button 
                onClick={() => onNavigate('admin')}
                className="aspect-video bg-gradient-to-br from-indigo-500 to-slate-700 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-indigo-200 dark:hover:shadow-indigo-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-indigo-400/30"
              >
                <Sliders className="w-5 h-5 drop-shadow" />
                <span className="drop-shadow">Gammes / Roles</span>
              </button>
              )}

              {/* Cyan Pièces */}
              <button 
                onClick={() => onNavigate('inventory')}
                className="aspect-video bg-gradient-to-br from-sky-400 to-cyan-600 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-sky-200 dark:hover:shadow-sky-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-sky-300/30"
              >
                <Package className="w-5 h-5 drop-shadow" />
                <span className="drop-shadow">Pièces Rechange</span>
              </button>

              {/* Violet Partenaires */}
              {canDo('suppliers', 'voir') && (
              <button 
                onClick={() => onNavigate('suppliers')}
                className="aspect-video bg-gradient-to-br from-violet-400 to-purple-700 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-violet-200 dark:hover:shadow-violet-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-violet-300/30"
              >
                <Truck className="w-5 h-5 drop-shadow" />
                <span className="drop-shadow">Partenaires</span>
              </button>
              )}

              {/* Yellow Contrats */}
              {canDo('reports', 'voir') && (
              <button 
                onClick={() => onNavigate('reports')}
                className="aspect-video bg-gradient-to-br from-yellow-300 to-amber-500 text-slate-800 rounded-custom-sm p-3.5 flex flex-col justify-between items-start text-left shadow-md hover:shadow-yellow-200 dark:hover:shadow-yellow-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer border border-yellow-300/30"
              >
                <Activity className="w-5 h-5 drop-shadow" />
                <span className="drop-shadow">Rapports</span>
              </button>
              )}
            </div>
          </div>
        </div>

        {/* ROW 1 RIGHT: DI/BT counters only (Col-span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* DI status grid (Mes infos DI) - clickable */}
          <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-3">
              Mes infos DI (Demandes d'Intervention)
            </h3>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <button onClick={() => onNavigate('corrective')} className="bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 p-2.5 rounded-custom-sm cursor-pointer hover:bg-rose-500/20 transition-colors">
                <span className="text-xl font-black block">{diATraiter}</span>
                <span className="text-[9px] font-bold uppercase tracking-wide">À traiter</span>
              </button>
              <button onClick={() => onNavigate('corrective')} className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-2.5 rounded-custom-sm cursor-pointer hover:bg-amber-500/20 transition-colors">
                <span className="text-xl font-black block">{diEnCours}</span>
                <span className="text-[9px] font-bold uppercase tracking-wide">En cours</span>
              </button>
              <button onClick={() => onNavigate('corrective')} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-custom-sm cursor-pointer hover:bg-emerald-500/20 transition-colors">
                <span className="text-xl font-black block">{diRealise}</span>
                <span className="text-[9px] font-bold uppercase tracking-wide">Réalisé</span>
              </button>
            </div>
          </div>

          {/* BT status grid (Les infos BT) - clickable */}
          <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-3">
              Les infos BT (Bons de Travail)
            </h3>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <button onClick={() => onNavigate('workorders')} className="bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 p-2.5 rounded-custom-sm cursor-pointer hover:bg-rose-500/20 transition-colors">
                <span className="text-xl font-black block">{btAFaire}</span>
                <span className="text-[9px] font-bold uppercase tracking-wide">À faire</span>
              </button>
              <button onClick={() => onNavigate('workorders')} className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-2.5 rounded-custom-sm cursor-pointer hover:bg-amber-500/20 transition-colors">
                <span className="text-xl font-black block">{btEnCours}</span>
                <span className="text-[9px] font-bold uppercase tracking-wide">En cours</span>
              </button>
              <button onClick={() => onNavigate('workorders')} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-custom-sm cursor-pointer hover:bg-emerald-500/20 transition-colors">
                <span className="text-xl font-black block">{btFait}</span>
                <span className="text-[9px] font-bold uppercase tracking-wide">Fait</span>
              </button>
            </div>
          </div>
        </div>

        {/* ROW 2: Arborescence (left 8 cols) + Quick-peek panel (right 4 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-5 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                <FolderTree className="w-4 h-4 text-primary" />
                Arborescence Technique Parc
              </h3>
              {selectedDashboardEq ? (
                <button
                  onClick={() => setSelectedDashboardEq(null)}
                  className="text-[9px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Fermer fiche
                </button>
              ) : (
                <span className="text-[9px] text-slate-400">Cliquez sur un équipement pour sa fiche</span>
              )}
            </div>

            <div className="flex gap-4">
              {/* Tree */}
              <div className="flex-1 p-3 bg-white/40 dark:bg-slate-900/10 rounded-custom-sm border border-slate-150 dark:border-slate-850 max-h-[300px] overflow-y-auto">
                <TreeElement
                  node={factoryTree}
                  equipments={equipments}
                  onSelectEquipment={(eq) => setSelectedDashboardEq(eq)}
                />
              </div>

              {/* Quick-peek panel */}
              {selectedDashboardEq ? (
                <div className="w-64 shrink-0 bg-white/70 dark:bg-slate-900/50 border border-primary/20 rounded-xl p-4 flex flex-col gap-3 text-xs animate-[fadeIn_0.2s_ease-out] overflow-y-auto max-h-[300px]">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[9px] text-slate-400 font-bold block">{selectedDashboardEq.id}</span>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight mt-0.5">{selectedDashboardEq.name}</h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{selectedDashboardEq.category}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      selectedDashboardEq.status === 'En service' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      selectedDashboardEq.status === 'En panne' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>{selectedDashboardEq.status}</span>
                  </div>

                  {/* Health ring */}
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                    <div className="relative w-12 h-12 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#E2E8F0" strokeWidth="3" className="dark:stroke-slate-800" />
                        <circle
                          cx="18" cy="18" r="15" fill="none"
                          stroke={selectedDashboardEq.healthIndex >= 70 ? '#10B981' : selectedDashboardEq.healthIndex >= 40 ? '#F59E0B' : '#EF4444'}
                          strokeWidth="3"
                          strokeDasharray={`${(selectedDashboardEq.healthIndex / 100) * 94.2} 94.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-800 dark:text-white">{selectedDashboardEq.healthIndex}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Indice Santé</span>
                      <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">{selectedDashboardEq.hoursCount.toLocaleString()} h</span>
                      <span className="text-[9px] text-slate-400 block">Heures total machine</span>
                    </div>
                  </div>

                  {/* Key info grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">Criticité</span>
                      <span className={`text-[10px] font-extrabold ${
                        selectedDashboardEq.criticality === 'Critique' ? 'text-rose-600' :
                        selectedDashboardEq.criticality === 'Haute' ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'
                      }`}>{selectedDashboardEq.criticality}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">Localisation</span>
                      <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 truncate block">{selectedDashboardEq.location}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">Dernière MP</span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{selectedDashboardEq.lastMaintenance}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">Prochaine MP</span>
                      <span className="text-[10px] font-bold text-emerald-600">{selectedDashboardEq.nextMaintenance}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => { onSelectEquipment(selectedDashboardEq); onNavigate('equipment'); }}
                      className="flex-1 py-1.5 bg-primary text-white rounded-lg text-[10px] font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      Fiche Complète
                    </button>
                    <button
                      onClick={() => { setFormEqId(selectedDashboardEq.id); const el = document.getElementById('di-form'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                      className="flex-1 py-1.5 bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-lg text-[10px] font-bold hover:bg-rose-500/20 transition-colors cursor-pointer"
                    >
                      Déclarer DI
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-64 shrink-0 flex flex-col items-center justify-center text-center p-6 bg-white/30 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl opacity-60">
                  <Wrench className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Sélectionnez une machine dans l'arborescence pour afficher sa fiche rapide</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2 RIGHT: Demande d'intervention Form & Unassigned OTs (Col-span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Demande d'intervention inline Form */}
          <div 
            id="di-form" 
            className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-5 shadow-sm flex flex-col gap-4 relative"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">
                Déclarer une panne (Demande d'intervention)
              </h3>
              {successSaved && (
                <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow animate-pulse">
                  Envoyé !
                </span>
              )}
            </div>

            <form onSubmit={handleInlineIncidentSubmit} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[9px] uppercase font-bold">Équipement en panne *</label>
                <select
                  required
                  value={formEqId}
                  onChange={(e) => setFormEqId(e.target.value)}
                  className="p-2 bg-white/50 dark:bg-slate-900/15 border border-slate-200 dark:border-slate-800 rounded-lg outline-none font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="" className="dark:bg-slate-900">Sélectionner la machine...</option>
                  {equipments.map(e => (
                    <option key={e.id} value={e.id} className="dark:bg-slate-900">{e.name} ({e.id})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-[9px] uppercase font-bold">Symptômes constatés *</label>
                <textarea
                  required
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Expliquez brièvement le problème..."
                  className="p-2 bg-white/50 dark:bg-slate-900/15 border border-slate-200 dark:border-slate-800 rounded-lg outline-none font-semibold text-slate-800 dark:text-slate-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 text-[9px] uppercase font-bold">Urgence</label>
                  <select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as Incident['urgency'])}
                    className="p-2 bg-white/50 dark:bg-slate-900/15 border border-slate-200 dark:border-slate-800 rounded-lg outline-none font-semibold text-slate-800 dark:text-slate-200 dark:bg-slate-900"
                  >
                    <option value="Faible" className="dark:bg-slate-900">Faible</option>
                    <option value="Moyenne" className="dark:bg-slate-900">Moyenne</option>
                    <option value="Haute" className="dark:bg-slate-900">Haute</option>
                    <option value="Critique" className="dark:bg-slate-900">Critique (Arrêt)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="submit"
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-lg shadow transition hover-lift text-center cursor-pointer"
                  >
                    Transmettre DI
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Interventions non affectées panel */}
          <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-3">
              Interventions non affectées (OT en attente)
            </h3>
            
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
              {unassignedOts.length === 0 ? (
                <div className="text-center py-6 text-[10px] text-slate-400 font-semibold">
                  Toutes les interventions sont affectées !
                </div>
              ) : (
                unassignedOts.map(ot => (
                  <div 
                    key={ot.id}
                    onClick={() => onNavigate(`workorder-detail:${ot.id}`)}
                    className="p-2.5 rounded bg-white/45 dark:bg-slate-900/20 border border-slate-150 dark:border-slate-800/80 flex justify-between items-center hover:border-primary/40 cursor-pointer transition-colors"
                  >
                    <div className="overflow-hidden mr-3">
                      <span className="font-mono text-[9px] font-bold text-slate-400 leading-none">{ot.id}</span>
                      <h4 className="font-bold text-[11px] text-slate-800 dark:text-slate-350 truncate mt-0.5">{ot.title}</h4>
                    </div>
                    <span className="text-[8.5px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                      Affecter
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom section: Collapsible Supervision Visualizer & Performance charts */}
      <div className="glass-panel rounded-custom-lg border border-white/40 dark:border-slate-850 p-5 shadow-sm flex flex-col gap-4">
        <button 
          onClick={() => setShowCharts(!showCharts)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-350 border-b border-slate-100 dark:border-slate-850 pb-2 outline-none cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Activity className="w-4.5 h-4.5 text-primary" />
            Supervision Technique Avancée & Performance Graphiques (Toggle)
          </span>
          {showCharts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showCharts && (
          <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">


            {/* Supervision visualizer */}
            <TomatoVisualizer onSelectEquipment={onSelectEquipment} />

            {/* Performance charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Spark chart */}
              <div className="md:col-span-2 border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-xl">
                <h4 className="text-[10px] font-bold text-slate-450 uppercase mb-3">Tendance Mensuelle Pannes & Coûts</h4>
                <div className="w-full h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrendsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} />
                      <YAxis stroke="#94A3B8" fontSize={9} />
                      <Tooltip />
                      <Area type="monotone" dataKey="pannes" name="Pannes" stroke="#EF4444" fill="#EF4444" fillOpacity={0.05} strokeWidth={2} />
                      <Area type="monotone" dataKey="cost" name="Coûts (€)" stroke="#2563EB" fill="#2563EB" fillOpacity={0.05} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Pie Chart */}
              <div className="border border-slate-200/50 dark:border-slate-800/80 p-4 rounded-xl flex flex-col justify-between items-center text-center">
                <h4 className="text-[10px] font-bold text-slate-450 uppercase w-full text-left mb-2">Taux Résolution OT</h4>
                <div className="w-full h-28 flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Fait', value: btFait, color: '#10B981' },
                          { name: 'En cours', value: btEnCours, color: '#0EA5E9' },
                          { name: 'À faire', value: btAFaire, color: '#F59E0B' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        <Cell fill="#10B981" />
                        <Cell fill="#0EA5E9" />
                        <Cell fill="#F59E0B" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 text-[9px] font-bold text-slate-500 justify-center">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Fait ({btFait})</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>En cours ({btEnCours})</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>À faire ({btAFaire})</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
