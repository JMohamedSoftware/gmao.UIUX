import React, { useState, useMemo } from 'react';
import { useGmao, SparePart } from '../context/GmaoContext';
import { 
  Search, 
  Plus, 
  Boxes, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  QrCode, 
  X,
  Package,
  TrendingUp,
  Tag,
  ChevronRight,
  ChevronDown,
  Wrench,
  MapPin,
  User,
  BarChart2,
  ClipboardList,
  FileText,
  Activity,
  ArrowDown,
  ArrowUp,
  ShoppingCart
} from 'lucide-react';

interface InventoryProps {
  onNavigate: (screen: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Roulements':   '🔘',
  'Joints':       '🔗',
  'Courroies':    '〰️',
  'Vannes':       '🚰',
  'Automatisme':  '💻',
  'Garnitures':   '⚙️',
  'Électrique':   '⚡',
  'Pneumatique':  '💨',
  'Hydraulique':  '💧',
  'Visserie':     '🔩',
};

export const Inventory: React.FC<InventoryProps> = ({ onNavigate }) => {
  const { parts, suppliers, addPartMovement, updatePart } = useGmao();

  // 3-column navigation state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPartRef, setSelectedPartRef] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterAlertOnly, setFilterAlertOnly] = useState(false);

  // Stock movement modal
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [movePartRef, setMovePartRef] = useState<string | null>(null);
  const [moveType, setMoveType] = useState<'in' | 'out'>('in');
  const [moveQty, setMoveQty] = useState(1);
  const [moveReason, setMoveReason] = useState('');
  const [moveCategory, setMoveCategory] = useState('Achat');

  const [activeTab, setActiveTab] = useState<'historique'|'ots'|'docs'>('historique');

  // Supplier filter
  const [filterSupplier, setFilterSupplier] = useState('');

  // Accordion state
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // New item modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRef, setNewRef] = useState('');
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<string>('Roulements');
  const [newSupId, setNewSupId] = useState('');
  const [newStock, setNewStock] = useState(10);
  const [newMin, setNewMin] = useState(5);
  const [newMax, setNewMax] = useState(50);
  const [newPrice, setNewPrice] = useState(25.0);
  const [newLoc, setNewLoc] = useState('');

  // Purchase Order modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderPartRef, setOrderPartRef] = useState<string | null>(null);
  const [orderQty, setOrderQty] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Movements log
  const [movementLogs, setMovementLogs] = useState([
    { id: 'MOV-001', partRef: 'REF-BRG-102', qty: 2, type: 'out', reason: 'OT-2026-001 - Remplacement roulement', date: '2026-07-07T09:35:00', category: 'Maintenance Corrective' },
    { id: 'MOV-002', partRef: 'REF-GASK-EVAP', qty: 10, type: 'in', reason: 'Livraison commande SKF', date: '2026-07-06T14:20:00', category: 'Achat' },
    { id: 'MOV-003', partRef: 'REF-VALV-304', qty: 1, type: 'out', reason: 'OT-2026-003 - Rechange vanne', date: '2026-07-05T09:40:00', category: 'Maintenance Préventive' },
    { id: 'MOV-004', partRef: 'REF-BRG-102', qty: 1, type: 'out', reason: 'Pièce endommagée au montage', date: '2026-07-04T10:00:00', category: 'Casse' }
  ]);

  // KPIs
  const lowStockParts = parts.filter(p => p.stockCurrent <= p.stockMin);
  const totalValuation = parts.reduce((acc, p) => acc + (p.stockCurrent * p.unitPrice), 0);

  // Grouped parts, filtered globally
  const categories = Object.keys(CATEGORY_ICONS);
  const groupedParts = useMemo(() => {
    const filtered = parts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.ref.toLowerCase().includes(search.toLowerCase());
      const matchAlert = !filterAlertOnly || (p.stockCurrent <= p.stockMin);
      const matchSup = !filterSupplier || p.supplierId === filterSupplier;
      return matchSearch && matchAlert && matchSup;
    });

    const groups: Record<string, SparePart[]> = {};
    categories.forEach(c => groups[c] = []);
    filtered.forEach(p => {
      if (groups[p.category]) {
        groups[p.category].push(p);
      }
    });
    return groups;
  }, [parts, categories, search, filterAlertOnly, filterSupplier]);

  // Selected part detail
  const activePart = parts.find(p => p.ref === selectedPartRef);
  const moveModalPart = parts.find(p => p.ref === movePartRef);

  const handleOpenMovement = (partRef: string, type: 'in' | 'out', e: React.MouseEvent) => {
    e.stopPropagation();
    setMovePartRef(partRef);
    setMoveType(type);
    setMoveQty(1);
    setMoveReason('');
    setShowMoveModal(true);
  };

  const executeMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movePartRef) return;
    const success = addPartMovement(movePartRef, moveQty, moveType);
    if (success) {
      setMovementLogs(prev => [{
        id: `MOV-${String(Date.now()).slice(-3)}`,
        partRef: movePartRef,
        qty: moveQty,
        type: moveType,
        reason: moveReason || (moveType === 'in' ? 'Approvisionnement manuel' : 'Consommation manuelle'),
        date: new Date().toISOString(),
        category: moveCategory
      }, ...prev]);
      setShowMoveModal(false);
    } else {
      alert("Erreur: Quantité en stock insuffisante pour effectuer cette sortie.");
    }
  };

  const handleAddNewPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRef || !newName || !newSupId) return;
    const newPart: SparePart = {
      ref: newRef.toUpperCase(),
      name: newName,
      category: newCat,
      supplierId: newSupId,
      stockCurrent: newStock,
      stockMin: newMin,
      stockMax: newMax,
      unitPrice: newPrice,
      location: newLoc || 'Étagère Générique'
    };
    updatePart(newPart);
    setNewRef(''); setNewName(''); setNewSupId('');
    setShowAddModal(false);
    setSelectedCategory(newCat);
  };

  const handleOpenOrder = (partRef: string) => {
    setOrderPartRef(partRef);
    const p = parts.find(p => p.ref === partRef);
    setOrderQty(p ? Math.max(1, p.stockMax - p.stockCurrent) : 1);
    setOrderSuccess(false);
    setShowOrderModal(true);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
    setTimeout(() => {
      setShowOrderModal(false);
      setOrderSuccess(false);
    }, 2000);
  };

  const inputCls = "w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-primary";

  return (
    <div className="h-full flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">

      {/* Header */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/40 p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
              Gestion des Stocks & Pièces
            </h1>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Catalogue par famille · {parts.length} références
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-custom-sm shadow-md hover-lift"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Article</span>
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Références</span>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{parts.length}</h3>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl"><Boxes className="w-5 h-5" /></div>
        </div>
        <div className="glass-panel p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider block">Rupture de Stock</span>
            <h3 className="text-2xl font-extrabold text-rose-500 mt-0.5">{lowStockParts.length}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl"><AlertTriangle className="w-5 h-5" /></div>
        </div>
        <div className="glass-panel p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Valeur Stock</span>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">{Math.round(totalValuation).toLocaleString()} €</h3>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">

        {/* Column 1: Filters & Grouped List */}
        <div className="w-[22rem] shrink-0 flex flex-col bg-white/50 dark:bg-slate-900/30 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                className="w-full pl-8 pr-3 py-1.5 rounded bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-xs outline-none placeholder-slate-400 font-semibold"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={filterSupplier} 
                onChange={(e) => setFilterSupplier(e.target.value)} 
                className="flex-1 text-xs p-1.5 rounded bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 outline-none text-slate-600 font-semibold"
              >
                <option value="">Tous les fournisseurs</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={filterAlertOnly}
                onChange={(e) => setFilterAlertOnly(e.target.checked)}
                className="rounded border-slate-300 text-rose-500 focus:ring-rose-500"
              />
              <span className={filterAlertOnly ? 'text-rose-500' : ''}>Rupture de stock uniquement</span>
            </label>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-3">
            {categories.map(cat => {
              const catParts = groupedParts[cat] || [];
              if (catParts.length === 0) return null; // hide empty categories
              const isExpanded = expandedCategories.includes(cat);
              
              return (
                <div key={cat} className="flex flex-col gap-1">
                  {/* Category Header */}
                  <button 
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center justify-between w-full text-left px-2 pt-2 pb-1 border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <h4 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                      <span className="text-base">{CATEGORY_ICONS[cat] || '📦'}</span>
                      {cat} ({catParts.length})
                    </h4>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {/* Parts in Category */}
                  {isExpanded && (
                    <div className="flex flex-col gap-1 mt-1">
                      {catParts.map(part => {
                        const isLow = part.stockCurrent <= part.stockMin;
                        const isActive = selectedPartRef === part.ref;
                        return (
                          <button
                            key={part.ref}
                            onClick={() => setSelectedPartRef(part.ref)}
                            className={`w-full text-left flex items-center gap-3 p-2 rounded-lg transition-all ml-1
                              ${isActive
                                ? 'bg-primary/10 border border-primary/30 shadow-sm'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                              }`}
                          >
                            {/* Thumbnail */}
                            {part.photo ? (
                              <img src={part.photo} alt={part.name} className="w-8 h-8 rounded-md object-cover border border-slate-200/50 dark:border-slate-700 shrink-0" />
                            ) : (
                              <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${isActive ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                <Package className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-[11px] font-bold truncate ${isActive ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>{part.name}</p>
                              <p className="text-[9px] text-slate-400 font-mono truncate">{part.ref}</p>
                              {isLow && (
                                <span className="text-[9px] font-bold text-rose-500 flex items-center gap-0.5 mt-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" /> Rupture
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {Object.values(groupedParts).every(arr => arr.length === 0) && (
              <div className="flex flex-col items-center justify-center text-center p-6 opacity-40">
                <Package className="w-10 h-10 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-500">Aucune pièce trouvée</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Part detail */}
        <div className="flex-1 flex flex-col bg-white/50 dark:bg-slate-900/30 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm overflow-hidden">
          {!activePart ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-30">
              <Package className="w-16 h-16 text-slate-400 mb-3" />
              <p className="text-sm font-bold text-slate-500">Sélectionnez une pièce pour voir sa fiche</p>
            </div>
          ) : (() => {
            const isLow = activePart.stockCurrent <= activePart.stockMin;
            const percent = Math.min(100, Math.round((activePart.stockCurrent / activePart.stockMax) * 100));
            const sup = suppliers.find(s => s.id === activePart.supplierId);
            return (
              <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                {/* Part header with photo */}
                <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex gap-5 items-start bg-slate-50/30 dark:bg-slate-900/20">
                  <div className="shrink-0">
                    {activePart.photo ? (
                      <img src={activePart.photo} alt={activePart.name}
                        className="w-24 h-24 rounded-xl object-cover border-2 border-white dark:border-slate-700 shadow-md" />
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-md flex items-center justify-center">
                        <Package className="w-10 h-10 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 font-mono">{activePart.ref}</p>
                        <h2 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight mt-0.5">{activePart.name}</h2>
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {CATEGORY_ICONS[activePart.category] || '📦'} {activePart.category}
                        </span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg ${isLow ? 'bg-rose-500/10 text-rose-600 border border-rose-200' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-200'}`}>
                        {isLow ? '⚠️ Rupture de stock' : '✅ Stock OK'}
                      </span>
                    </div>

                    {/* Stock bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                        <span>Stock : <strong className="text-slate-800 dark:text-white text-base">{activePart.stockCurrent}</strong> / {activePart.stockMax}</span>
                        <span>Min : {activePart.stockMin} &nbsp; Max : {activePart.stockMax}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-rose-500' : 'bg-primary'}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail grid */}
                <div className="p-5 flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-panel p-3.5 rounded-xl border border-white/40 dark:border-slate-800/40">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <BarChart2 className="w-3 h-3" /> Prix Unitaire
                      </p>
                      <p className="text-xl font-extrabold text-primary">{activePart.unitPrice} €</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Valeur totale : {(activePart.stockCurrent * activePart.unitPrice).toFixed(2)} €</p>
                    </div>
                    <div className="glass-panel p-3.5 rounded-xl border border-white/40 dark:border-slate-800/40">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Localisation Rayon
                      </p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{activePart.location}</p>
                    </div>
                  </div>

                  {sup && (
                    <div className="glass-panel p-3.5 rounded-xl border border-white/40 dark:border-slate-800/40">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <User className="w-3 h-3" /> Fournisseur
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{sup.name}</p>
                      <p className="text-[10px] text-slate-400">{sup.email} · {sup.phone}</p>
                    </div>
                  )}

                  {/* Stock actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={e => handleOpenMovement(activePart.ref, 'in', e)}
                      className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-200 rounded-xl font-bold text-xs hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
                    >
                      <ArrowDown className="w-5 h-5" /> Entrée
                    </button>
                    <button
                      onClick={e => handleOpenMovement(activePart.ref, 'out', e)}
                      className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-rose-500/10 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                    >
                      <ArrowUp className="w-5 h-5" /> Sortie
                    </button>
                    <button
                      className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-amber-500/10 text-amber-600 border border-amber-200 rounded-xl font-bold text-xs hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all"
                    >
                      <ClipboardList className="w-5 h-5" /> Inventaire
                    </button>
                  </div>

                  {/* Commander button */}
                  <button
                    onClick={() => onNavigate('suppliers')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary border border-primary/25 rounded-xl font-bold text-xs hover:bg-primary hover:text-white hover:border-primary transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Commander (Voir Fournisseur)
                  </button>

                  <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-1"></div>

                  {/* Tabs */}
                  <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
                    <button onClick={() => setActiveTab('historique')} className={`pb-2 text-[11px] font-bold uppercase tracking-wider ${activeTab === 'historique' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>Historique</button>
                    <button onClick={() => setActiveTab('ots')} className={`pb-2 text-[11px] font-bold uppercase tracking-wider ${activeTab === 'ots' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>OT liés</button>
                    <button onClick={() => setActiveTab('docs')} className={`pb-2 text-[11px] font-bold uppercase tracking-wider ${activeTab === 'docs' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}>Documents</button>
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[150px]">
                    {activeTab === 'historique' && (
                      <div className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 flex flex-col gap-4 mt-2">
                        {movementLogs.filter(l => l.partRef === activePart.ref).length === 0 ? (
                          <p className="text-[10px] text-slate-400">Aucun mouvement enregistré</p>
                        ) : movementLogs.filter(l => l.partRef === activePart.ref).map(log => (
                          <div key={log.id} className="relative">
                            <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${log.type === 'in' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] text-slate-400 font-mono block">{log.id} · {new Date(log.date).toLocaleDateString()}</span>
                                <span className={`text-[10px] font-bold flex items-center gap-1 mt-0.5 ${log.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {log.type === 'in' ? '⬇' : '⬆'} {log.category || (log.type === 'in' ? 'Achat' : 'Sortie')}
                                </span>
                                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">{log.reason}</p>
                              </div>
                              <span className={`font-black text-sm ${log.type === 'in' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {log.type === 'in' ? '+' : '-'}{log.qty}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'ots' && (
                      <div className="flex flex-col items-center justify-center h-full opacity-40">
                        <Activity className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-[10px] font-bold text-slate-500">Aucun OT lié à cette pièce</p>
                      </div>
                    )}

                    {activeTab === 'docs' && (
                      <div className="flex flex-col items-center justify-center h-full opacity-40">
                        <FileText className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-[10px] font-bold text-slate-500">Aucun document technique</p>
                      </div>
                    )}
                  </div>

                  {/* QR scanner placeholder */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl flex items-center gap-3">
                    <QrCode className="w-10 h-10 text-slate-300 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Scanner Code-barres Pièce</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Compatible douchettes industrielles & terminaux</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Movement modal */}
      {showMoveModal && moveModalPart && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel-heavy rounded-custom-lg border border-white/50 dark:border-slate-850 w-full max-w-sm overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-primary" />
                Mouvement : {moveType === 'in' ? 'Entrée' : 'Sortie'}
              </h3>
              <button onClick={() => setShowMoveModal(false)} className="p-1 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={executeMovement} className="p-6 flex flex-col gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-450 block font-mono">{moveModalPart.ref}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{moveModalPart.name}</span>
                <span className="text-[10px] text-slate-400 block mt-1">En stock : {moveModalPart.stockCurrent}</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Quantité *</label>
                <input type="number" min={1} required value={moveQty} onChange={e => setMoveQty(Number(e.target.value))} className={inputCls} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Type de mouvement *</label>
                <select value={moveCategory} onChange={e => setMoveCategory(e.target.value)} className={inputCls + " dark:bg-slate-800"}>
                  {moveType === 'in' ? (
                    <>
                      <option value="Achat">⬇ Achat</option>
                      <option value="Retour">⬇ Retour</option>
                    </>
                  ) : (
                    <>
                      <option value="Maintenance Corrective">⬆ Maintenance Corrective</option>
                      <option value="Maintenance Préventive">⬆ Maintenance Préventive</option>
                      <option value="Casse">⬆ Casse</option>
                    </>
                  )}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Justificatif / N° OT *</label>
                <input type="text" required placeholder="Ex: OT-2026-001 ou Livraison" value={moveReason} onChange={e => setMoveReason(e.target.value)} className={inputCls} />
              </div>
              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-150 dark:border-slate-800/80">
                <button type="button" onClick={() => setShowMoveModal(false)} className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-100 rounded font-bold">Annuler</button>
                <button type="submit" className={`px-5 py-2 text-white rounded font-bold shadow-md ${moveType === 'in' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>Valider</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add part modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel-heavy rounded-custom-lg border border-white/50 dark:border-slate-850 w-full max-w-lg overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                <Boxes className="w-5 h-5 text-primary" />
                Enregistrer un Article de Rechange
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddNewPart} className="p-6 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Référence unique *</label>
                  <input type="text" required placeholder="Ex: REF-BRG-200" value={newRef} onChange={e => setNewRef(e.target.value.toUpperCase())} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Désignation *</label>
                  <input type="text" required placeholder="Ex: Roulement à billes 6205" value={newName} onChange={e => setNewName(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Famille / Catégorie</label>
                  <select value={newCat} onChange={e => setNewCat(e.target.value)} className={inputCls + " dark:bg-slate-800"}>
                    <option>Roulements</option>
                    <option>Joints</option>
                    <option>Courroies</option>
                    <option>Vannes</option>
                    <option>Automatisme</option>
                    <option>Garnitures</option>
                    <option>Électrique</option>
                    <option>Pneumatique</option>
                    <option>Hydraulique</option>
                    <option>Visserie</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Fournisseur *</label>
                  <select required value={newSupId} onChange={e => setNewSupId(e.target.value)} className={inputCls + " dark:bg-slate-800"}>
                    <option value="">Choisir...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Stock Initial *</label>
                  <input type="number" required min={0} value={newStock} onChange={e => setNewStock(Number(e.target.value))} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Seuil Min *</label>
                  <input type="number" required min={1} value={newMin} onChange={e => setNewMin(Number(e.target.value))} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Stock Max *</label>
                  <input type="number" required min={1} value={newMax} onChange={e => setNewMax(Number(e.target.value))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Prix Unitaire (€) *</label>
                  <input type="number" step="0.01" required min={0} value={newPrice} onChange={e => setNewPrice(Number(e.target.value))} className={inputCls} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Localisation Rayon</label>
                  <input type="text" placeholder="Ex: Aisle A - Étagère 2" value={newLoc} onChange={e => setNewLoc(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-150 dark:border-slate-800/80">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-100 rounded font-bold">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded font-bold shadow-md">Enregistrer l'Article</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Purchase Order Modal */}
      {showOrderModal && orderPartRef && (() => {
        const orderPart = parts.find(p => p.ref === orderPartRef);
        const orderSup = orderPart ? suppliers.find(s => s.id === orderPart.supplierId) : null;
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel-heavy rounded-custom-lg border border-white/50 dark:border-slate-850 w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
              <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Bon de Commande — {orderPart?.name}
                </h3>
                <button onClick={() => setShowOrderModal(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleConfirmOrder} className="p-6 flex flex-col gap-4 text-xs">
                {orderSuccess ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-6">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <ArrowDownLeft className="w-7 h-7 text-emerald-500" />
                    </div>
                    <p className="font-bold text-emerald-600 text-sm">Bon de commande envoyé !</p>
                    <p className="text-slate-400 text-center">Le fournisseur <strong>{orderSup?.name || 'inconnu'}</strong> a été notifié.</p>
                  </div>
                ) : (
                  <>
                    {orderSup && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Fournisseur</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{orderSup.name}</span>
                        <span className="text-[10px] text-slate-400">{orderSup.email} · {orderSup.phone}</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Quantité à commander</label>
                      <input
                        type="number" min={1} required
                        value={orderQty}
                        onChange={e => setOrderQty(Number(e.target.value))}
                        className={inputCls}
                      />
                      {orderPart && (
                        <span className="text-[10px] text-slate-400">
                          Coût estimé : <strong className="text-primary">{(orderQty * orderPart.unitPrice).toFixed(2)} €</strong>
                        </span>
                      )}
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-150 dark:border-slate-800/80">
                      <button type="button" onClick={() => setShowOrderModal(false)} className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-100 rounded font-bold">Annuler</button>
                      <button type="submit" className="px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded font-bold shadow-md">Envoyer Commande</button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
