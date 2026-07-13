import React, { useState } from 'react';
import { useGmao, Incident, Equipment } from '../context/GmaoContext';
import { usePermissions } from '../hooks/usePermissions';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  User, 
  ArrowRight, 
  Check, 
  X, 
  FileText,
  AlertCircle,
  Camera,
  Video,
  Mic
} from 'lucide-react';

interface CorrectiveProps {
  onNavigate: (screen: string) => void;
  onOpenCreateOtWithIncident: (inc: Incident) => void;
}

export const Corrective: React.FC<CorrectiveProps> = ({ onNavigate, onOpenCreateOtWithIncident }) => {
  const { incidents, equipments, currentUser, addIncident, updateIncidentStatus } = useGmao();
  const { canDo, isProduction, isTechnicien } = usePermissions();
  const [search, setSearch] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<string>('Toutes');
  
  // Incident Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEqId, setSelectedEqId] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Incident['urgency']>('Moyenne');
  const [photo, setPhoto] = useState('');

  // Filter incidents based on search query and role
  const filteredIncidents = incidents.filter(inc => {
    // Production/Technicien see only their own DIs
    if (isProduction || isTechnicien) {
      if (currentUser && !inc.reportedBy.includes(currentUser.name)) return false;
    }

    const eq = equipments.find(e => e.id === inc.equipmentId);
    const matchesSearch = inc.description.toLowerCase().includes(search.toLowerCase()) ||
                          inc.id.toLowerCase().includes(search.toLowerCase()) ||
                          inc.reportedBy.toLowerCase().includes(search.toLowerCase()) ||
                          (eq && eq.name.toLowerCase().includes(search.toLowerCase()));
    
    const matchesUrgency = filterUrgency === 'Toutes' || inc.urgency === filterUrgency;

    return matchesSearch && matchesUrgency;
  });

  const getUrgencyColor = (urg: Incident['urgency']) => {
    switch (urg) {
      case 'Critique': return 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
      case 'Haute': return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'Moyenne': return 'text-primary bg-primary/5 border-primary/10';
      default: return 'text-slate-500 bg-slate-50 border-slate-205';
    }
  };

  const getColumnIncidents = (status: Incident['status']) => {
    return filteredIncidents.filter(inc => inc.status === status);
  };

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqId || !description) return;

    addIncident({
      equipmentId: selectedEqId,
      description,
      reportedBy: 'Youssef Mansouri (Prod)',
      urgency,
      photo: photo || undefined
    });

    // Reset
    setSelectedEqId('');
    setDescription('');
    setUrgency('Moyenne');
    setPhoto('');
    setShowAddModal(false);
  };

  const columns: { id: Incident['status']; label: string; color: string }[] = [
    { id: 'Nouveau', label: 'Nouveau / Déclaré', color: 'bg-rose-500' },
    { id: 'Validé', label: 'Validé / À Planifier', color: 'bg-amber-500' },
    { id: 'Transformé en OT', label: 'En Cours d\'OT', color: 'bg-primary' },
    { id: 'Rejeté', label: 'Rejeté', color: 'bg-slate-400' },
    { id: 'Clos', label: 'Clos', color: 'bg-emerald-500' }
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {isProduction ? 'Mes Demandes d\'Intervention' : 'Tableau des Pannes & Incidents (Correctif)'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            {isProduction
              ? 'Suivez vos demandes et déclarez une nouvelle panne'
              : 'Déclaration rapide des pannes par la production et workflow de validation'
            }
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-custom-sm shadow-md hover-lift"
          >
            <Plus className="w-4 h-4" />
            <span>Déclarer Panne</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="glass-panel p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 rounded-custom-sm bg-white/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
            placeholder="Rechercher un incident..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="px-3 py-2 text-xs rounded border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/10 outline-none focus:border-primary text-slate-700 dark:text-slate-300 font-semibold"
          >
            <option value="Toutes">Toutes les urgences</option>
            <option value="Faible">Faible</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Haute">Haute</option>
            <option value="Critique">Critique</option>
          </select>
          <div className="text-xs font-semibold text-slate-400 border-l border-slate-200/50 dark:border-slate-800/50 pl-4">
            Total : {filteredIncidents.length} alertes actives
          </div>
        </div>
      </div>

      {/* Kanban Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {columns.map(column => {
          const colIncidents = getColumnIncidents(column.id);
          
          return (
            <div key={column.id} className="flex flex-col gap-4">
              {/* Column Header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {column.label}
                  </span>
                </div>
                <span className="text-[10px] bg-slate-200/60 dark:bg-slate-800 font-bold px-2 py-0.5 rounded text-slate-500">
                  {colIncidents.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 flex flex-col gap-3 min-h-[450px] p-2 bg-slate-200/20 dark:bg-slate-900/10 rounded-custom-lg border border-slate-200/40 dark:border-slate-800/40">
                {colIncidents.length === 0 ? (
                  <div className="text-center py-12 text-[10px] text-slate-400 font-medium">
                    Aucune panne
                  </div>
                ) : (
                  colIncidents.map(inc => {
                    const eq = equipments.find(e => e.id === inc.equipmentId);
                    
                    // Calcul du temps écoulé fictif
                    const diffMs = Date.now() - new Date(inc.reportedDate).getTime();
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const timeElapsedStr = diffDays > 0 
                      ? `Il y a ${diffDays} j` 
                      : (diffHours > 0 ? `Il y a ${diffHours} h` : 'À l\'instant');

                    // Avatar aléatoire basé sur l'ID
                    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(inc.reportedBy.split(' ')[0])}&background=random&color=fff&size=64`;
                    
                    const affectedTechName = inc.technicianId 
                      ? 'Ahmed Bensaid' // Hardcoded for demo, normally from context
                      : 'Non affecté';

                    return (
                      <div 
                        key={inc.id}
                        className="p-4 rounded-custom-md border border-white/50 dark:border-slate-850/40 bg-white/60 dark:bg-slate-900/20 neumorphic-card hover-lift flex flex-col gap-3 group relative overflow-hidden"
                      >
                        {/* Hover effect gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="flex justify-between items-start z-10 mb-1">
                          <span className="text-[9px] font-bold text-slate-400 font-mono leading-none flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3 text-rose-400" />
                            {inc.id}
                          </span>
                        </div>

                        <div className="z-10">
                          <h4 className="font-bold text-xs text-slate-750 dark:text-slate-250 leading-tight">
                            {eq ? eq.name : inc.equipmentId}
                          </h4>
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">{inc.equipmentId}</span>
                          
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${getUrgencyColor(inc.urgency)}`}>
                              Urgence: {inc.urgency}
                            </span>
                            {inc.priority && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-purple-200 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:border-purple-900/30 dark:text-purple-400">
                                Priorité: {inc.priority}
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            {inc.description}
                          </p>
                        </div>

                        {inc.photo && (
                          <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 z-10 relative group-hover:shadow-md transition-shadow">
                            <img src={inc.photo} alt="Panne" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          </div>
                        )}

                        <div className="flex flex-col gap-2 mt-1 pt-2 border-t border-slate-150 dark:border-slate-850 z-10">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className={`text-[10px] font-semibold ${inc.technicianId ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 italic'}`}>
                              Tech: {affectedTechName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[10px] text-slate-500 font-semibold">
                              Déclaré: {timeElapsedStr}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <img src={avatarUrl} alt="Avatar" className="w-4 h-4 rounded-full ring-1 ring-slate-200 dark:ring-slate-700" />
                            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 leading-none">
                              Par: {inc.reportedBy.split(' ')[0]}
                            </span>
                          </div>
                        </div>

                        {/* Interactive transitions block inside card */}
                        <div className="flex gap-1.5 mt-1 z-10">
                          {canDo('corrective', 'valider') && inc.status === 'Nouveau' && (
                            <>
                              <button
                                title="Valider cet incident"
                                onClick={() => updateIncidentStatus(inc.id, 'Validé')}
                                className="flex-1 py-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition text-[9px] font-bold border border-emerald-500/20 flex items-center justify-center gap-0.5"
                              >
                                <Check className="w-3 h-3" />
                                <span>Valider</span>
                              </button>
                              <button
                                title="Rejeter cet incident"
                                onClick={() => updateIncidentStatus(inc.id, 'Rejeté')}
                                className="p-1 rounded bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition text-[9px] font-bold border border-rose-500/20"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          )}

                          {canDo('corrective', 'valider') && inc.status === 'Validé' && (
                            <button
                              onClick={() => onOpenCreateOtWithIncident(inc)}
                              className="w-full py-1 rounded bg-primary text-white hover:bg-primary/95 transition text-[9px] font-bold flex items-center justify-center gap-1 shadow-sm"
                            >
                              <ArrowRight className="w-3 h-3" />
                              <span>Planifier l'OT</span>
                            </button>
                          )}

                          {/* Production/Technicien: see status only */}
                          {!canDo('corrective', 'valider') && (isProduction || isTechnicien) && (
                            <div className={`w-full py-1 rounded text-[9px] font-bold text-center border ${
                              inc.status === 'Nouveau' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:border-rose-900/30' :
                              inc.status === 'Validé' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              inc.status === 'Transformé en OT' ? 'bg-primary/10 text-primary border-primary/20' :
                              inc.status === 'Clos' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                              'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                              {inc.status === 'Nouveau' ? '⏳ En attente de validation' :
                               inc.status === 'Validé' ? '✅ Validée — Planification en cours' :
                               inc.status === 'Transformé en OT' ? '🔧 OT créé — Technicien affecté' :
                               inc.status === 'Clos' ? '✅ Résolu' :
                               inc.status}
                            </div>
                          )}

                          {inc.status === 'Transformé en OT' && (
                            <button
                              onClick={() => inc.workOrderId && onNavigate(`workorder-detail:${inc.workOrderId}`)}
                              className="w-full py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700 transition text-[9px] font-bold flex items-center justify-center gap-1 border border-slate-200/50 dark:border-slate-800"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Voir OT ({inc.workOrderId})</span>
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Incident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel-heavy rounded-custom-lg border border-white/50 dark:border-slate-850 w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                Signaler une Panne Machine
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportIncident} className="p-6 flex flex-col gap-4 text-xs">
              
              {/* Equipment field */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Équipement concerné *</label>
                <select
                  required
                  value={selectedEqId}
                  onChange={(e) => setSelectedEqId(e.target.value)}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none dark:bg-slate-900"
                >
                  <option value="">Choisir la machine...</option>
                  {equipments.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.id}) • {e.location}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Symptômes constatés *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Exemple: Bruit de frottement métallique au niveau du convoyeur, odeur de chaud..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:border-rose-500 outline-none resize-none shadow-inner"
                />
                <div className="flex gap-2 mt-2">
                  <button type="button" className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 hover:bg-slate-200">Fuite</button>
                  <button type="button" className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 hover:bg-slate-200">Bruit anormal</button>
                  <button type="button" className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 hover:bg-slate-200">Arrêt machine</button>
                </div>
              </div>

              {/* Impact Production */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Impact sur la Production</label>
                <select className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 focus:border-rose-500 outline-none shadow-inner">
                  <option>Aucun impact (machine en marche)</option>
                  <option>Marche dégradée (cadence réduite)</option>
                  <option>Arrêt total de la ligne</option>
                </select>
              </div>

              {/* Localisation (Auto-filled) */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Localisation</label>
                <div className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {selectedEqId ? equipments.find(e => e.id === selectedEqId)?.location : 'Sélectionnez un équipement d\'abord'}
                  </span>
                </div>
              </div>

              {/* Attachments / Upload */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Pièces jointes</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <button type="button" className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300">
                    <Camera className="w-4 h-4" />
                    <span>Photo</span>
                  </button>
                  <button type="button" className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300">
                    <Video className="w-4 h-4" />
                    <span>Vidéo</span>
                  </button>
                  <button type="button" className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300">
                    <FileText className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                  <button type="button" className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300">
                    <Mic className="w-4 h-4" />
                    <span>Audio</span>
                  </button>
                </div>
              </div>

              {/* Urgency */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Niveau d'urgence / Criticité panne</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Faible', 'Moyenne', 'Haute', 'Critique'] as const).map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUrgency(u)}
                      className={`py-2 rounded font-bold text-[10px] border transition ${
                        urgency === u 
                          ? 'bg-rose-500 border-rose-500 text-white shadow-sm' 
                          : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hidden Photo Link Simulation for Mockup */}
              <input
                type="hidden"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
              />

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-150 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-100 rounded font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded font-bold shadow-md shadow-rose-500/10"
                >
                  Signaler l'Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
