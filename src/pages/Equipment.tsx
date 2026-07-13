import React, { useState, useMemo } from 'react';
import { useGmao, Equipment as EquipmentType } from '../context/GmaoContext';
import { usePermissions } from '../hooks/usePermissions';
import { 
  Search, Plus, X, Wrench, Settings2, Folder, FolderOpen, 
  PlusSquare, MinusSquare, Edit, Save, MapPin, Package, PlusCircle, Trash2,
  FileText, History, Calendar, Link, ClipboardList, Info
} from 'lucide-react';

interface EquipmentProps {
  selectedEqFromDash: EquipmentType | null;
  onClearSelectedEq: () => void;
  onDeclareIncident: () => void;
  onNavigate: (screen: string) => void;
}

// Tree Nodes
type GeoNode = {
  id: string;
  name: string;
  type: 'site' | 'building' | 'floor' | 'room';
  children: GeoNode[];
  isCustom?: boolean;
};

type EqNode = {
  id: string;
  name: string;
  type: 'category' | 'equipment';
  children: EqNode[];
  equipmentRef?: EquipmentType;
  isCustom?: boolean;
};

export const Equipment: React.FC<EquipmentProps> = ({ 
  selectedEqFromDash, 
}) => {
  const { equipments, suppliers, deleteEquipment, deleteEquipmentsByLocation, deleteEquipmentsByCategory } = useGmao();
  const { canDo, isTechnicien } = usePermissions();
  
  const [search, setSearch] = useState('');
  
  // Custom added nodes via prompt (to satisfy "adds normally")
  const [customGeoNodes, setCustomGeoNodes] = useState<{id: string, name: string, type: string, parentId?: string}[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [filterCriticality, setFilterCriticality] = useState<string>('Toutes');
  const [filterStatus, setFilterStatus] = useState<string>('Tous');

  // Left Panel (Geo) State
  const [geoExpanded, setGeoExpanded] = useState<Set<string>>(new Set(['USINE DE LINO', 'USINE DE LINO-BATIMENT SUD']));
  const [selectedGeoNode, setSelectedGeoNode] = useState<GeoNode | null>(null);

  // Middle Panel (Eq) State
  const [eqExpanded, setEqExpanded] = useState<Set<string>>(new Set());
  const [selectedEqId, setSelectedEqId] = useState<string | null>(selectedEqFromDash?.id || null);

  // Right Panel (Form) State
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<EquipmentType>>({});
  const [activeTab, setActiveTab] = useState<'info'|'historique'|'preventifs'|'pieces'|'documents'|'ot'>('info');

  // 1. Build Geographical Tree (Left Panel)
  const geoTree = useMemo(() => {
    const root: GeoNode[] = [];
    const sites = Array.from(new Set(equipments.map(e => e.site).filter(Boolean))) as string[];
    // Add custom sites
    customGeoNodes.filter(n => n.type === 'site').forEach(n => {
        if (!sites.includes(n.name)) sites.push(n.name);
    });

    sites.forEach(site => {
      const isCustomSite = customGeoNodes.some(n => n.type === 'site' && n.name === site);
      const siteNode: GeoNode = { id: site, name: site, type: 'site', children: [], isCustom: isCustomSite };
      const siteEqs = equipments.filter(e => e.site === site);
      
      const buildings = Array.from(new Set(siteEqs.map(e => e.building).filter(Boolean))) as string[];
      // Add custom buildings
      customGeoNodes.filter(n => n.type === 'building' && n.parentId === siteNode.id).forEach(n => {
          if (!buildings.includes(n.name)) buildings.push(n.name);
      });

      buildings.forEach(building => {
        const isCustomBuilding = customGeoNodes.some(n => n.type === 'building' && n.name === building && n.parentId === siteNode.id);
        const buildNode: GeoNode = { id: `${site}-${building}`, name: building, type: 'building', children: [], isCustom: isCustomBuilding };
        const buildEqs = siteEqs.filter(e => e.building === building);
        
        const floors = Array.from(new Set(buildEqs.map(e => e.floor).filter(Boolean))) as string[];
        // Add custom floors
        customGeoNodes.filter(n => n.type === 'floor' && n.parentId === buildNode.id).forEach(n => {
            if (!floors.includes(n.name)) {
                floors.push(n.name);
            }
        });

        floors.forEach(floor => {
          const isCustomFloor = customGeoNodes.some(n => n.type === 'floor' && n.name === floor && n.parentId === buildNode.id);
          const floorNode: GeoNode = { id: `${site}-${building}-${floor}`, name: floor, type: 'floor', children: [], isCustom: isCustomFloor };
          const floorEqs = buildEqs.filter(e => e.floor === floor);
          
          const rooms = Array.from(new Set(floorEqs.map(e => e.room).filter(Boolean))) as string[];
          // Add custom rooms
          customGeoNodes.filter(n => n.type === 'room' && n.parentId === floorNode.id).forEach(n => {
              if (!rooms.includes(n.name)) rooms.push(n.name);
          });

          rooms.forEach(room => {
            const isCustomRoom = customGeoNodes.some(n => n.type === 'room' && n.name === room && n.parentId === floorNode.id);
            const roomNode: GeoNode = { id: `${site}-${building}-${floor}-${room}`, name: room, type: 'room', children: [], isCustom: isCustomRoom };
            floorNode.children.push(roomNode);
          });
          buildNode.children.push(floorNode);
        });
        siteNode.children.push(buildNode);
      });
      root.push(siteNode);
    });
    return root;
  }, [equipments, customGeoNodes]);

  // 2. Build Equipment Tree for the selected Geo Node (Middle Panel)
  const eqTree = useMemo(() => {
    if (!selectedGeoNode) return [];
    
    // Filter equipments by selected geo node
    let filtered = equipments.filter(e => {
      if (selectedGeoNode.type === 'site') return e.site === selectedGeoNode.name;
      if (selectedGeoNode.type === 'building') return e.building === selectedGeoNode.name;
      if (selectedGeoNode.type === 'floor') return e.floor === selectedGeoNode.name;
      if (selectedGeoNode.type === 'room') return e.room === selectedGeoNode.name;
      return false;
    });

    if (search) {
      filtered = filtered.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()));
    }
    
    if (filterCriticality !== 'Toutes') {
      filtered = filtered.filter(e => e.criticality === filterCriticality);
    }
    if (filterStatus !== 'Tous') {
      filtered = filtered.filter(e => e.status === filterStatus);
    }

    // Build the Family -> Equipment -> SubEquipment tree
    const root: EqNode[] = [];
    const categories = Array.from(new Set(filtered.map(e => e.category).filter(Boolean)));
    
    // Add custom categories
    customCategories.forEach(c => {
        if (!categories.includes(c)) categories.push(c);
    });

    categories.forEach(category => {
      const isCustomCat = customCategories.includes(category);
      const catNode: EqNode = { id: `cat-${category}`, name: category, type: 'category', children: [], isCustom: isCustomCat };
      
      // Top-level equipments in this category
      const topEqs = filtered.filter(e => e.category === category && !e.parentId);
      
      const buildEqHierarchy = (eq: EquipmentType): EqNode => {
        const node: EqNode = { id: eq.id, name: eq.name, type: 'equipment', children: [], equipmentRef: eq };
        const children = equipments.filter(e => e.parentId === eq.id);
        children.forEach(child => {
          node.children.push(buildEqHierarchy(child));
        });
        return node;
      };

      topEqs.forEach(eq => {
        catNode.children.push(buildEqHierarchy(eq));
      });

      root.push(catNode);
    });

    // Auto-expand categories if it's a small list
    if (categories.length > 0) {
      setEqExpanded(prev => {
        const newSet = new Set(prev);
        categories.forEach(c => newSet.add(`cat-${c}`));
        return newSet;
      });
    }

    return root;
  }, [selectedGeoNode, equipments, search]);

  // Sync selectedEqFromDash
  React.useEffect(() => {
    if (selectedEqFromDash) {
      setSelectedEqId(selectedEqFromDash.id);
      
      // Auto-select geo node
      const eq = selectedEqFromDash;
      if (eq.room) {
        setSelectedGeoNode({ id: `${eq.site}-${eq.building}-${eq.floor}-${eq.room}`, name: eq.room, type: 'room', children: [] });
      } else if (eq.site) {
        setSelectedGeoNode({ id: eq.site, name: eq.site, type: 'site', children: [] });
      }
    }
  }, [selectedEqFromDash]);

  const toggleGeoNode = (id: string) => {
    setGeoExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleEqNode = (id: string) => {
    setEqExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const activeEquipment = equipments.find(e => e.id === selectedEqId);

  const handleSave = () => {
    setIsAdding(false);
    setIsEditing(false);
  };

  const handleAddGeo = () => {
      let node = selectedGeoNode;
      if (!node) {
          const firstSite = geoTree[0];
          if (firstSite) {
              node = firstSite;
          } else {
              const name = window.prompt("Nom du nouveau Site / Usine :");
              if (name && name.trim() !== '') {
                  setCustomGeoNodes(prev => [...prev, {
                      id: `site-${name}`,
                      name: name,
                      type: 'site',
                      isCustom: true
                  }]);
              }
              return;
          }
      }
      
      const typeNames: Record<string, string> = {
          'site': 'Bâtiment',
          'building': 'Étage / Niveau',
          'floor': 'Local / Ligne',
          'room': 'Sous-local'
      };
      const nextType = typeNames[node.type];
      if (nextType) {
          const name = window.prompt(`Nom du nouveau ${nextType} dans ${node.name} :`);
          if (name && name.trim() !== '') {
              let nextTypeKey = 'building';
              if (node.type === 'building') nextTypeKey = 'floor';
              if (node.type === 'floor') nextTypeKey = 'room';
              if (node.type === 'room') nextTypeKey = 'subroom';

              setCustomGeoNodes(prev => [...prev, {
                  id: `${node.id}-${name}`,
                  name: name,
                  type: nextTypeKey,
                  parentId: node.id,
                  isCustom: true
              }]);
              
              setGeoExpanded(prev => new Set(prev).add(node!.id));
          }
      }
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setSelectedEqId(null);
    setFormData({
      id: `EQ-NEW-${Math.floor(Math.random() * 1000)}`,
      name: '',
      category: '',
      status: 'En service',
      criticality: 'Moyenne',
      site: selectedGeoNode?.type === 'site' ? selectedGeoNode.name : selectedGeoNode?.id.split('-')[0] || '',
      building: selectedGeoNode?.type === 'building' ? selectedGeoNode.name : selectedGeoNode?.id.split('-')[1] || '',
      floor: selectedGeoNode?.type === 'floor' ? selectedGeoNode.name : selectedGeoNode?.id.split('-')[2] || '',
      room: selectedGeoNode?.type === 'room' ? selectedGeoNode.name : selectedGeoNode?.id.split('-')[3] || '',
      photos: []
    });
  };

  const handleAddNewFromGeo = (node: GeoNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const typeNames: Record<string, string> = {
        'site': 'Bâtiment',
        'building': 'Étage / Niveau',
        'floor': 'Local / Ligne',
        'room': 'Sous-local'
    };
    const nextType = typeNames[node.type];
    if (nextType) {
        const name = window.prompt(`Nom du nouveau ${nextType} dans ${node.name} :`);
        if (name && name.trim() !== '') {
            let nextTypeKey = 'building';
            if (node.type === 'building') nextTypeKey = 'floor';
            if (node.type === 'floor') nextTypeKey = 'room';
            if (node.type === 'room') nextTypeKey = 'subroom';

            setCustomGeoNodes(prev => [...prev, {
                id: `${node.id}-${name}`,
                name: name,
                type: nextTypeKey,
                parentId: node.id
            }]);
            
            setGeoExpanded(prev => new Set(prev).add(node.id));
        }
    }
  };

  const handleAddNewCategory = () => {
    const name = window.prompt("Nom de la nouvelle Famille :");
    if (name && name.trim() !== '') {
        setCustomCategories(prev => [...prev, name]);
    }
  };

  const handleAddNewFromEq = (node: EqNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    setSelectedEqId(null);
    
    const newEq: Partial<EquipmentType> = {
      id: `EQ-NEW-${Math.floor(Math.random() * 1000)}`,
      status: 'En service',
      criticality: 'Moyenne',
      photos: [],
    };
    
    if (selectedGeoNode) {
        if (selectedGeoNode.type === 'site') newEq.site = selectedGeoNode.name;
        if (selectedGeoNode.type === 'building') { newEq.site = selectedGeoNode.id.split('-')[0]; newEq.building = selectedGeoNode.name; }
        if (selectedGeoNode.type === 'floor') { newEq.site = selectedGeoNode.id.split('-')[0]; newEq.building = selectedGeoNode.id.split('-')[1]; newEq.floor = selectedGeoNode.name; }
        if (selectedGeoNode.type === 'room') { newEq.site = selectedGeoNode.id.split('-')[0]; newEq.building = selectedGeoNode.id.split('-')[1]; newEq.floor = selectedGeoNode.id.split('-')[2]; newEq.room = selectedGeoNode.name; }
    } else {
        newEq.site = '';
        newEq.building = '';
        newEq.floor = '';
        newEq.room = '';
    }

    if (node.type === 'category') {
      newEq.category = node.name;
    } else if (node.type === 'equipment' && node.equipmentRef) {
      newEq.category = node.equipmentRef.category;
      newEq.parentId = node.equipmentRef.id;
    }

    setFormData(newEq);
  };

  const handleDeleteGeoNode = (node: GeoNode, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${node.name} et tout son contenu ?`)) {
          if (node.isCustom) {
              setCustomGeoNodes(prev => prev.filter(n => n.id !== node.id));
          } else {
              const parts = node.id.split('-');
              deleteEquipmentsByLocation(node.type, parts[0], parts[1], parts[2], parts[3]);
          }
          if (selectedGeoNode?.id === node.id) setSelectedGeoNode(null);
      }
  };

  const handleDeleteEqNode = (node: EqNode, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${node.name} et tout son contenu ?`)) {
          if (node.type === 'category') {
              if (node.isCustom) {
                  setCustomCategories(prev => prev.filter(c => c !== node.name));
              } else {
                  deleteEquipmentsByCategory(node.name);
              }
          } else if (node.type === 'equipment' && node.equipmentRef) {
              deleteEquipment(node.equipmentRef.id);
              if (selectedEqId === node.equipmentRef.id) setSelectedEqId(null);
          }
      }
  };

  const renderGeoTree = (nodes: GeoNode[], level = 0) => {
    return nodes.map(node => {
      const isExpanded = geoExpanded.has(node.id);
      const isSelected = selectedGeoNode?.id === node.id;
      const hasChildren = node.children.length > 0;
      
      return (
        <div key={node.id}>
          <div 
            className={`group flex items-center justify-between py-1.5 pr-2 rounded cursor-pointer text-xs ${isSelected ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => setSelectedGeoNode(node)}
          >
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div onClick={(e) => { e.stopPropagation(); toggleGeoNode(node.id); }} className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                {hasChildren ? (
                  isExpanded ? <MinusSquare className="w-3.5 h-3.5 text-slate-500" /> : <PlusSquare className="w-3.5 h-3.5 text-slate-500" />
                ) : <div className="w-3.5 h-3.5" />}
              </div>
              
              {isExpanded ? <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary' : 'text-amber-400'}`} /> : <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary' : 'text-amber-400'}`} />}
              
              <span className="truncate uppercase">{node.name}</span>
            </div>
            
            <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                {canDo('equipment', 'creer') && node.type !== 'room' && (
                    <button 
                    onClick={(e) => handleAddNewFromGeo(node, e)}
                    className={`p-1 rounded ${isSelected ? 'text-primary hover:bg-primary/20' : 'text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-primary shadow-sm'} shrink-0`}
                    title="Ajouter un sous-dossier"
                    >
                    <PlusCircle className="w-3 h-3" />
                    </button>
                )}
                {canDo('equipment', 'supprimer') && (
                <button 
                onClick={(e) => handleDeleteGeoNode(node, e)}
                className={`p-1 rounded ${isSelected ? 'text-rose-500 hover:bg-rose-500/20' : 'text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-rose-500 shadow-sm'} shrink-0`}
                title="Supprimer"
                >
                <Trash2 className="w-3 h-3" />
                </button>
                )}
            </div>
          </div>
          {isExpanded && hasChildren && (
            <div>
              {renderGeoTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const renderEqTree = (nodes: EqNode[], level = 0) => {
    return nodes.map(node => {
      const isExpanded = eqExpanded.has(node.id);
      const isSelected = selectedEqId === node.equipmentRef?.id;
      const hasChildren = node.children.length > 0;
      
      return (
        <div key={node.id}>
          <div 
            className={`group flex items-center justify-between py-1.5 pr-2 rounded cursor-pointer text-xs border border-transparent ${isSelected ? 'bg-primary text-white font-bold shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => {
              if (node.type === 'equipment' && node.equipmentRef) {
                setSelectedEqId(node.equipmentRef.id);
                setIsAdding(false);
                setIsEditing(false);
              } else {
                toggleEqNode(node.id);
              }
            }}
          >
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div onClick={(e) => { e.stopPropagation(); toggleEqNode(node.id); }} className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                {hasChildren ? (
                  isExpanded ? <MinusSquare className="w-3.5 h-3.5 text-slate-500" /> : <PlusSquare className="w-3.5 h-3.5 text-slate-500" />
                ) : <div className="w-3.5 h-3.5" />}
              </div>
              
              {node.type === 'category' ? (
                <Package className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
              ) : (
                <Settings2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
              )}
              
              <span className="truncate">{node.type === 'category' ? `Famille : ${node.name}` : node.name}</span>
            </div>

            <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                {canDo('equipment', 'creer') && (
                <button 
                onClick={(e) => handleAddNewFromEq(node, e)}
                className={`p-1 rounded ${isSelected ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-primary shadow-sm'} shrink-0`}
                title={node.type === 'category' ? "Ajouter un équipement dans cette famille" : "Ajouter un sous-équipement"}
                >
                <PlusCircle className="w-3 h-3" />
                </button>
                )}
                {canDo('equipment', 'supprimer') && (
                <button 
                onClick={(e) => handleDeleteEqNode(node, e)}
                className={`p-1 rounded ${isSelected ? 'text-white hover:bg-rose-500/80' : 'text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-rose-500 shadow-sm'} shrink-0`}
                title="Supprimer"
                >
                <Trash2 className="w-3 h-3" />
                </button>
                )}
            </div>
          </div>
          {isExpanded && hasChildren && (
            <div className="relative">
              <div className="absolute left-[14px] top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" style={{ left: `${level * 16 + 14}px` }} />
              {renderEqTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/40 p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">
              Gestion des Équipements
            </h1>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Vue géographique et technique
            </p>
          </div>
        </div>
        {canDo('equipment', 'creer') && (
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-custom-sm shadow-md hover-lift"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau</span>
        </button>
        )}
      </div>

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        
        <div className="w-64 flex flex-col bg-white/50 dark:bg-slate-900/30 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm overflow-hidden shrink-0">
          <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Localisations
            </h3>
            <button 
                onClick={handleAddGeo}
                className="p-1 rounded bg-primary text-white hover:bg-primary/90 shadow-sm transition-transform hover:scale-105 active:scale-95"
                title="Ajouter une localisation"
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
            {renderGeoTree(geoTree)}
          </div>
        </div>

        <div className="w-72 flex flex-col bg-white/50 dark:bg-slate-900/30 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm overflow-hidden shrink-0">
          <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                Équipements
              </h3>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterCriticality}
                onChange={(e) => setFilterCriticality(e.target.value)}
                className="flex-1 py-1 px-2 text-[10px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-primary text-slate-700 dark:text-slate-300"
              >
                <option value="Toutes">Criticité (Toutes)</option>
                <option value="Faible">Faible</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Haute">Haute</option>
                <option value="Critique">Critique</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 py-1 px-2 text-[10px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-primary text-slate-700 dark:text-slate-300"
              >
                <option value="Tous">Statut (Tous)</option>
                <option value="En service">En service</option>
                <option value="En panne">En panne</option>
                <option value="En maintenance">En maintenance</option>
                <option value="Hors service">Hors service</option>
              </select>
            </div>
          </div>
          <div className="p-2 overflow-y-auto flex-1 custom-scrollbar">
            {!selectedGeoNode ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs italic text-center px-4">
                Sélectionnez une localisation à gauche
              </div>
            ) : eqTree.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs italic text-center px-4">
                Aucun équipement trouvé
              </div>
            ) : (
              renderEqTree(eqTree)
            )}
          </div>
        </div>

        {/* Column 3: Details / Form */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-custom-md border border-slate-200/50 dark:border-slate-800/50 shadow-md overflow-hidden relative">
          
          {!activeEquipment && !isAdding ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Settings2 className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold text-sm">Sélectionnez un équipement dans l'arborescence centrale</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              {/* Toolbar */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary" />
                  {isAdding ? 'Nouvel Équipement' : 'Fiche Technique'}
                </h2>
                <div className="flex items-center gap-2">
                  {(isEditing || isAdding) ? (
                    <button onClick={handleSave} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded flex items-center gap-1.5 hover:bg-primary/90">
                      <Save className="w-3.5 h-3.5" /> Enregistrer
                    </button>
                  ) : (
                    canDo('equipment', 'modifier') && (
                    <button onClick={() => { setIsEditing(true); setFormData(activeEquipment || {}); }} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold rounded flex items-center gap-1.5 hover:bg-slate-300">
                      <Edit className="w-3.5 h-3.5" /> Modifier
                    </button>
                    )
                  )}
                </div>
              </div>

              {/* Form / Details Content */}
              <div className="p-5 flex flex-col gap-6">
                
                {/* Photo & Main Identity */}
                <div className="flex flex-col xl:flex-row gap-6">
                  {/* Image */}
                  <div className="w-full xl:w-64 shrink-0">
                    <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative group">
                      {(isEditing || isAdding) ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="px-3 py-1.5 bg-white text-slate-800 rounded text-xs font-bold">Changer l'image</button>
                        </div>
                      ) : null}
                      {((isEditing ? formData.photos : activeEquipment?.photos) || [])[0] ? (
                        <img src={((isEditing || isAdding) ? formData.photos : activeEquipment?.photos)?.[0]} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Plus className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* En-tête (Identity) */}
                  <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="col-span-2">
                      <h3 className="text-xs font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">En-tête</h3>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Réf. équipement (Code)</label>
                      <input type="text" readOnly={!isAdding} value={(isEditing || isAdding) ? formData.id : activeEquipment?.id} onChange={e => setFormData({...formData, id: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-transparent border-transparent font-bold'} outline-none`} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Désignation (Nom) <span className="text-rose-500">*</span></label>
                      <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.name : activeEquipment?.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-transparent border-transparent font-bold text-primary'} outline-none`} placeholder="Ex: Pompe P-102" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Famille <span className="text-rose-500">*</span></label>
                      <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.category : activeEquipment?.category} onChange={e => setFormData({...formData, category: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-transparent border-transparent'} outline-none`} placeholder="Ex: Pompes" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Sous-famille</label>
                      <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.subFamily : activeEquipment?.subFamily || ''} onChange={e => setFormData({...formData, subFamily: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-transparent border-transparent'} outline-none`} placeholder="Ex: Centrifuges" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">État équipement</label>
                      <select disabled={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.status : activeEquipment?.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-transparent border-transparent font-bold'} ${activeEquipment?.status === 'En panne' ? 'text-rose-500' : 'text-emerald-500'} outline-none appearance-none`}>
                        <option value="En service">En service</option>
                        <option value="En maintenance">En maintenance</option>
                        <option value="En panne">En panne</option>
                        <option value="Hors service">Hors service</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Criticité</label>
                      <select disabled={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.criticality : activeEquipment?.criticality} onChange={e => setFormData({...formData, criticality: e.target.value as any})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-transparent border-transparent'} outline-none appearance-none`}>
                        <option value="Faible">Faible</option>
                        <option value="Moyenne">Moyenne</option>
                        <option value="Haute">Haute</option>
                        <option value="Critique">Critique</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Localisation */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-4">
                    <h3 className="text-xs font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">
                      Localisation Géographique (Requise)
                    </h3>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Site / Usine <span className="text-rose-500">*</span></label>
                    <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.site : activeEquipment?.site || ''} onChange={e => setFormData({...formData, site: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} placeholder="Ex: USINE DE LINO" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Bâtiment</label>
                    <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.building : activeEquipment?.building || ''} onChange={e => setFormData({...formData, building: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} placeholder="Ex: BATIMENT NORD" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Étage / Niveau</label>
                    <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.floor : activeEquipment?.floor || ''} onChange={e => setFormData({...formData, floor: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} placeholder="Ex: RDC" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Local / Ligne</label>
                    <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.room : activeEquipment?.room || ''} onChange={e => setFormData({...formData, room: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} placeholder="Ex: Ligne 1" />
                  </div>
                </div>

                {/* Tabs for details */}
                <div className="mt-4">
                  <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700 mb-4 overflow-x-auto custom-scrollbar pb-1">
                    <button onClick={() => setActiveTab('info')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                      <Info className="w-4 h-4" /> Informations
                    </button>
                    <button onClick={() => setActiveTab('historique')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'historique' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                      <History className="w-4 h-4" /> Historique
                    </button>
                    <button onClick={() => setActiveTab('preventifs')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'preventifs' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                      <Calendar className="w-4 h-4" /> Préventifs
                    </button>
                    <button onClick={() => setActiveTab('pieces')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'pieces' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                      <Link className="w-4 h-4" /> Pièces
                    </button>
                    <button onClick={() => setActiveTab('documents')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                      <FileText className="w-4 h-4" /> Documents
                    </button>
                    <button onClick={() => setActiveTab('ot')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'ot' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                      <ClipboardList className="w-4 h-4" /> OT
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div>
                    {activeTab === 'info' && (
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Marque</label>
                          <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.brand : activeEquipment?.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Modèle</label>
                          <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.model : activeEquipment?.model} onChange={e => setFormData({...formData, model: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">N° Série</label>
                          <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.serialNumber : activeEquipment?.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Date de mise en service</label>
                          <input type="date" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.commissionDate : activeEquipment?.commissionDate || ''} onChange={e => setFormData({...formData, commissionDate: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Garantie</label>
                          <input type="date" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.endOfWarranty : activeEquipment?.endOfWarranty || ''} onChange={e => setFormData({...formData, endOfWarranty: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Fournisseur</label>
                          {isEditing || isAdding ? (
                            <select value={formData.supplierId || ''} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="w-full text-xs p-1.5 rounded border bg-white dark:bg-slate-800 border-slate-300 outline-none">
                              <option value="">Sélectionner...</option>
                              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          ) : (
                            <input type="text" readOnly value={suppliers.find(s => s.id === activeEquipment?.supplierId)?.name || ''} className="w-full text-xs p-1.5 rounded border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 outline-none" />
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Inventaire</label>
                          <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.inventory : activeEquipment?.inventory || ''} onChange={e => setFormData({...formData, inventory: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Responsabilité</label>
                          <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.responsibility : activeEquipment?.responsibility || ''} onChange={e => setFormData({...formData, responsibility: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none`} />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Code barre</label>
                          <input type="text" readOnly={!isEditing && !isAdding} value={(isEditing || isAdding) ? formData.barcode : activeEquipment?.barcode || ''} onChange={e => setFormData({...formData, barcode: e.target.value})} className={`w-full text-xs p-1.5 rounded border ${isEditing || isAdding ? 'bg-white dark:bg-slate-800 border-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'} outline-none font-mono tracking-tight`} />
                        </div>
                        <div className="col-span-3">
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 mt-2 cursor-pointer w-fit">
                            <input type="checkbox" disabled={!isEditing && !isAdding} checked={!!((isEditing || isAdding) ? formData.gipPresence : activeEquipment?.gipPresence)} onChange={e => setFormData({...formData, gipPresence: e.target.checked})} className="rounded text-primary focus:ring-primary w-4 h-4" />
                            Présence GIP
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'historique' && (
                      <div className="flex flex-col items-center justify-center p-8 opacity-50">
                        <History className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-sm font-bold text-slate-600">Aucun historique d'intervention</p>
                      </div>
                    )}

                    {activeTab === 'preventifs' && (
                      <div className="flex flex-col items-center justify-center p-8 opacity-50">
                        <Calendar className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-sm font-bold text-slate-600">Aucun plan préventif associé</p>
                      </div>
                    )}

                    {activeTab === 'pieces' && (
                      <div className="flex flex-col items-center justify-center p-8 opacity-50">
                        <Link className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-sm font-bold text-slate-600">Aucune pièce de rechange associée</p>
                        <p className="text-xs text-slate-500 mt-1">Ex: Roulements, Joints, Courroies</p>
                      </div>
                    )}

                    {activeTab === 'documents' && (
                      <div className="flex flex-col items-center justify-center p-8 opacity-50">
                        <FileText className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-sm font-bold text-slate-600">Aucun document technique</p>
                        <p className="text-xs text-slate-500 mt-1">Notice constructeur, schémas électriques, plans...</p>
                      </div>
                    )}

                    {activeTab === 'ot' && (
                      <div className="flex flex-col items-center justify-center p-8 opacity-50">
                        <ClipboardList className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-sm font-bold text-slate-600">Aucun Ordre de Travail en cours</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
