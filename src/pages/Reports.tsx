import React, { useState } from 'react';
import { useGmao } from '../context/GmaoContext';
import { usePermissions } from '../hooks/usePermissions';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import domtoimage from 'dom-to-image';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Filter, 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  Clock,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export const Reports: React.FC = () => {
  const { selectedCampaign, workOrders, equipments, incidents } = useGmao();
  const { isChefEquipe, getScope, currentUser } = usePermissions();
  
  const [exporting, setExporting] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  
  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(format);
    
    try {
      if (format === 'excel') {
        const wb = XLSX.utils.book_new();
        
        // Feuille 1: KPIs
        const kpiData = [
          { Metrique: 'MTBF (Heures)', Valeur: mtbfH.toFixed(2) },
          { Metrique: 'MTTR (Minutes)', Valeur: avgMTTR.toFixed(2) },
          { Metrique: 'Disponibilité (%)', Valeur: disponibilite.toFixed(2) },
          { Metrique: 'Coût Total (TND)', Valeur: totalCost.toFixed(3) },
          { Metrique: 'Total OTs Terminés', Valeur: completedOTs.length },
        ];
        const wsKPI = XLSX.utils.json_to_sheet(kpiData);
        XLSX.utils.book_append_sheet(wb, wsKPI, 'KPIs');

        // Feuille 2: Work Orders
        const woData = filteredWorkOrders.map(ot => ({
          ID: ot.id,
          Titre: ot.title,
          Type: ot.type,
          Statut: ot.status,
          Equipement: ot.equipmentId,
          Assigné_A: ot.assignedTo,
          Date_Creation: ot.createdAt,
          Date_Debut: ot.actualStartDate || '',
          Date_Fin: ot.actualEndDate || '',
          Duree_Minutes: ot.durationMinutes
        }));
        const wsWO = XLSX.utils.json_to_sheet(woData);
        XLSX.utils.book_append_sheet(wb, wsWO, 'Bons de Travail');

        XLSX.writeFile(wb, `Rapport_GMAO_${selectedCampaign}_${new Date().toISOString().split('T')[0]}.xlsx`);
        
      } else if (format === 'pdf') {
        const element = document.getElementById('report-content');
        if (element) {
          const imgData = await domtoimage.toPng(element, { bgcolor: '#ffffff' });
          
          const img = new Image();
          img.src = imgData;
          await new Promise((resolve) => { img.onload = resolve; });

          const pdf = new jsPDF('l', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (img.height * pdfWidth) / img.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`Rapport_GMAO_${selectedCampaign}_${new Date().toISOString().split('T')[0]}.pdf`);
        }
      }

      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (error) {
      console.error('Erreur lors de lexport', error);
      alert("Une erreur est survenue lors de l'exportation.");
    } finally {
      setExporting(null);
    }
  };


  // New KPIs Data
  const mainGraphData = [
    { period: 'Jan', arret: 45, nbOt: 120, cout: 15000, dispo: 98.2 },
    { period: 'Fév', arret: 38, nbOt: 105, cout: 12400, dispo: 98.5 },
    { period: 'Mar', arret: 60, nbOt: 150, cout: 21000, dispo: 97.1 },
    { period: 'Avr', arret: 25, nbOt: 80, cout: 9500, dispo: 99.1 },
    { period: 'Mai', arret: 30, nbOt: 95, cout: 11200, dispo: 98.8 },
    { period: 'Juin', arret: 20, nbOt: 70, cout: 8000, dispo: 99.4 }
  ];

  

  

  




  
  const scope = getScope('reports');
  
  // Filter WorkOrders based on scope
  const filteredWorkOrders = workOrders.filter(ot => {
    if (scope === 'toute_usine') return true;
    if (scope === 'mon_equipe') {
      // Pour l'instant, on suppose que l'équipe est liée à la campagne ou on affiche tout ce qui n'est pas strictement personnel
      // Pour une vraie implémentation, on filtrerait par les membres de l'équipe du chef.
      return true; 
    }
    // mes_donnees
    return ot.assignedTo === currentUser?.name;
  });

  // Filter Incidents
  const filteredIncidents = incidents.filter(inc => {
    if (scope === 'toute_usine') return true;
    if (scope === 'mon_equipe') return true;
    return inc.reportedBy === currentUser?.name;
  });

  // --- Dynamic Data Computation ---

  // Top Equipments en Panne
  const eqPanneCount = {};
  filteredIncidents.forEach(inc => {
    eqPanneCount[inc.equipmentId] = (eqPanneCount[inc.equipmentId] || 0) + 1;
  });
  const topEquipmentsData = Object.entries(eqPanneCount)
    .map(([id, count]) => {
      const eq = equipments.find(e => e.id === id);
      return { name: eq ? eq.name : id, pannes: count };
    })
    .sort((a, b) => b.pannes - a.pannes)
    .slice(0, 5);

  if (topEquipmentsData.length === 0) {
    topEquipmentsData.push({ name: 'Aucune panne', pannes: 0 });
  }

  // Failure comparisons
  const campaignCompareData = [
    { id: 'EQ-EVAP-001', name: 'Évaporateur Concentrateur 1', pannes25: 8, pannes26: topEquipmentsData[0]?.pannes || 4, cost25: 18500, cost26: 8000 },
    { id: 'EQ-BOIL-001', name: 'Chaudière Thermique 1', pannes25: 3, pannes26: topEquipmentsData[1]?.pannes || 1, cost25: 6400, cost26: 2200 }
  ];

  // Top Techniciens
  const techCount = {};
  filteredWorkOrders.filter(ot => ot.status === 'Terminé' || ot.status === 'Clôturé').forEach(ot => {
    if (ot.assignedTo) {
      techCount[ot.assignedTo] = (techCount[ot.assignedTo] || 0) + 1;
    }
  });
  const topTechniciansData = Object.entries(techCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (topTechniciansData.length === 0) {
    topTechniciansData.push({ name: 'Aucun', count: 0 });
  }

  // Top Types de Pannes
  const typePanneCount = {};
  filteredWorkOrders.filter(ot => ot.type === 'Correctif').forEach(ot => {
    // on utilise un mot clé de la description si pas de type précis
    const typeStr = ot.description.split(' ')[0] || 'Autre';
    typePanneCount[typeStr] = (typePanneCount[typeStr] || 0) + 1;
  });
  const topPannesData = Object.entries(typePanneCount)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (topPannesData.length === 0) {
    topPannesData.push({ type: 'Aucune', count: 0 });
  }

  // Compute real KPIs from workOrders data
  const completedOTs = filteredWorkOrders.filter(ot => ot.status === 'Terminé' || ot.status === 'Clôturé');
  const delayedOTs = filteredWorkOrders.filter(ot => ot.status === 'En attente' || ot.status === 'Affecté');
  const cancelledOTs = filteredWorkOrders.filter(ot => false); // no 'Annulé' in WorkOrder schema
  const prevOTs = filteredWorkOrders.filter(ot => ot.type === 'Préventif');
  const corrOTs = filteredWorkOrders.filter(ot => ot.type === 'Correctif');

  const avgMTTR = completedOTs.length > 0
    ? completedOTs.reduce((acc, ot) => acc + ot.durationMinutes, 0) / completedOTs.length
    : 0;

  const totalFailures = corrOTs.length;
  const totalDowntimeH = completedOTs.reduce((acc, ot) => acc + (ot.durationMinutes / 60), 0);
  const operatingHoursPerDay = 16;
  const campaignDays = 90; // 3 month campaign
  const totalOperatingH = campaignDays * operatingHoursPerDay;
  const mtbfH = totalFailures > 0 ? ((totalOperatingH - totalDowntimeH) / totalFailures) : totalOperatingH;
  const disponibilite = totalOperatingH > 0 ? ((totalOperatingH - totalDowntimeH) / totalOperatingH * 100) : 100;
  
  const totalCost = completedOTs.reduce((acc, ot) => acc + (ot.estimatedCost || 150), 0);
  const stockCritique = 15; // Mock critical stock items

  // Filter state
  const [filters, setFilters] = useState({
    campagne: selectedCampaign,
    usine: 'Toutes',
    famille: 'Toutes',
    equipement: 'Tous',
    technicien: 'Tous',
    periode: 'Ce mois'
  });

  return (
    <div className="flex flex-col gap-6" id="report-content">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Analyses & Rapports Avancés
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            Performance industrielle de la {selectedCampaign} et rentabilité
          </p>
        </div>

        {/* Export options */}
        <div className="flex gap-2 relative">
          {showSuccessAlert && (
            <div className="absolute top-[-40px] right-0 bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 animate-bounce">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Rapport généré & téléchargé !</span>
            </div>
          )}

          <button
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 dark:bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-custom-sm shadow disabled:opacity-40"
          >
            {exporting === 'pdf' ? (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => handleExport('excel')}
            disabled={!!exporting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-white rounded-custom-sm shadow disabled:opacity-40"
          >
            {exporting === 'excel' ? (
              <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            )}
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* === KPI Section === */}
      <div className={`grid grid-cols-2 md:grid-cols-4 ${!isChefEquipe ? 'lg:grid-cols-6' : 'lg:grid-cols-4'} gap-4`}>
        {/* MTBF */}
        <div className="glass-panel p-4 rounded-custom-md border border-emerald-500/20 bg-emerald-500/5 shadow-sm flex flex-col gap-2 relative group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">MTBF</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-300">
            {mtbfH.toFixed(0)}<span className="text-xs font-semibold ml-1">h</span>
          </span>
          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-[-30px] left-0 bg-slate-800 text-white text-[10px] p-2 rounded z-10 whitespace-nowrap pointer-events-none shadow-lg">
            Mean Time Between Failures
          </div>
        </div>

        {/* MTTR */}
        <div className="glass-panel p-4 rounded-custom-md border border-amber-500/20 bg-amber-500/5 shadow-sm flex flex-col gap-2 relative group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">MTTR</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl font-black text-amber-600 dark:text-amber-300">
            {avgMTTR.toFixed(0)}<span className="text-xs font-semibold ml-1">min</span>
          </span>
          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-[-30px] left-0 bg-slate-800 text-white text-[10px] p-2 rounded z-10 whitespace-nowrap pointer-events-none shadow-lg">
            Mean Time To Repair
          </div>
        </div>

        {/* Disponibilité */}
        <div className="glass-panel p-4 rounded-custom-md border border-primary/20 bg-primary/5 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Dispo</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xl font-black text-primary">
            {disponibilite.toFixed(1)}<span className="text-xs font-semibold ml-0.5">%</span>
          </span>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-auto">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, disponibilite)}%` }} />
          </div>
        </div>

        {/* OTs Clôturés */}
        <div className="glass-panel p-4 rounded-custom-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total OTs</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xl font-black text-slate-700 dark:text-slate-200">
            {workOrders.length}
          </span>
          <p className="text-[10px] text-slate-400 mt-auto">Total des ordres</p>
        </div>

        {/* Coût Total (Hidden for Chef d'équipe) */}
        {!isChefEquipe && (
        <div className="glass-panel p-4 rounded-custom-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Coût</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xl font-black text-slate-700 dark:text-slate-200">
            {totalCost.toLocaleString()} <span className="text-xs">TND</span>
          </span>
          <p className="text-[10px] text-slate-400 mt-auto">Dépenses globales</p>
        </div>
        )}

        {/* Stock Critique */}
        <div className="glass-panel p-4 rounded-custom-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Stock Min</span>
            <BarChart3 className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl font-black text-slate-700 dark:text-slate-200">
            {stockCritique}
          </span>
          <p className="text-[10px] text-slate-400 mt-auto">Pièces sous alerte</p>
        </div>
      </div>

      {/* Breakdown OTs Card */}
      <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-wrap gap-4 items-center justify-around text-xs font-bold text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Réalisés: {completedOTs.length}</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> En retard: {delayedOTs.length}</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Annulés: {cancelledOTs.length}</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Préventifs: {prevOTs.length} ({Math.round((prevOTs.length / workOrders.length) * 100 || 0)}%)</div>
        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Correctifs: {corrOTs.length} ({Math.round((corrOTs.length / workOrders.length) * 100 || 0)}%)</div>
      </div>

      {/* === Filters === */}
      <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-primary shrink-0" />
        <select value={filters.campagne} onChange={(e) => setFilters({...filters, campagne: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-primary outline-none">
          <option>Campagne 2026</option>
          <option>Campagne 2025</option>
        </select>
        <select value={filters.usine} onChange={(e) => setFilters({...filters, usine: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-primary outline-none">
          <option>Toutes (Usines)</option>
          <option>Usine Nord</option>
          <option>Usine Sud</option>
        </select>
        <select value={filters.famille} onChange={(e) => setFilters({...filters, famille: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-primary outline-none">
          <option>Toutes (Familles)</option>
          <option>Pompes</option>
          <option>Chaudières</option>
        </select>
        <select value={filters.equipement} onChange={(e) => setFilters({...filters, equipement: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-primary outline-none">
          <option>Tous (Équipements)</option>
          {equipments.slice(0, 3).map(eq => <option key={eq.id}>{eq.name}</option>)}
        </select>
        <select value={filters.technicien} onChange={(e) => setFilters({...filters, technicien: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-primary outline-none">
          <option>Tous (Techniciens)</option>
          <option>Ahmed M.</option>
          <option>Mohamed T.</option>
        </select>
        <select value={filters.periode} onChange={(e) => setFilters({...filters, periode: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-primary outline-none">
          <option>Ce mois</option>
          <option>Ce trimestre</option>
          <option>Cette année</option>
        </select>
      </div>

      {/* === Graphiques === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Évolution Maintenance Chart */}
        <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-primary" />
              Évolution des Indicateurs de Maintenance
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4">
              Analyse mensuelle (Temps d'arrêt, {isChefEquipe ? '' : 'Coût, '}Interventions)
            </p>
          </div>
          
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mainGraphData} margin={{ top: 10, right: -10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="period" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="#EF4444" fontSize={10} tickLine={false} label={{ value: 'Arrêt (h)', angle: -90, position: 'insideLeft', offset: 10, fill: '#EF4444', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" fontSize={10} tickLine={false} label={{ value: 'Coût (TND)', angle: 90, position: 'insideRight', offset: 10, fill: '#F59E0B', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: 'none', 
                    borderRadius: '12px', 
                    fontSize: '11px' 
                  }} 
                />
                <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                <Bar yAxisId="left" dataKey="arret" name="Temps d'arrêt (h)" fill="#EF4444" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                {!isChefEquipe && (
                  <Line yAxisId="right" type="monotone" dataKey="cout" name="Coût (TND)" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B' }} />
                )}
                <Line yAxisId="left" type="monotone" dataKey="nbOt" name="Nombre d'OT" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disponibilité Mensuelle */}
        <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-secondary" />
              Taux de Disponibilité Mensuel
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4">
              Suivi de la disponibilité opérationnelle sur la campagne
            </p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mainGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis dataKey="period" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis domain={[90, 100]} stroke="#0EA5E9" fontSize={10} tickLine={false} label={{ value: 'Disponibilité (%)', angle: -90, position: 'insideLeft', offset: 15, fill: '#0EA5E9', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: 'none', 
                    borderRadius: '12px', 
                    fontSize: '11px' 
                  }} 
                />
                <Bar dataKey="dispo" name="Disponibilité (%)" fill="#0EA5E9" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="dispo" name="Tendance" stroke="#0284C7" strokeWidth={2} dot={{ fill: '#0284C7' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* === Top 10 Équipements Critiques === */}
      <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingDown className="w-4.5 h-4.5 text-rose-500" />
            Top 10 Équipements Critiques (Plus grand nombre de pannes)
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          {topEquipmentsData.map((eq, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/40 rounded-lg">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {idx + 1}. {eq.name}
              </span>
              <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded">
                {eq.pannes} pannes
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Comparisons Bad actors card list */}
      <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Comparatif d'Historique des Pannes : Campagne 2025 vs 2026
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Suivi de l'évolution du taux de défaillance suite à l'introduction du CMMS
            </p>
          </div>
          {!isChefEquipe && (
          <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
            Budget global en baisse de 15%
          </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {campaignCompareData.map(row => {
            const isReduced = row.pannes26 < row.pannes25;
            const costSavings = Math.round(row.cost25 - row.cost26);

            return (
              <div 
                key={row.id}
                className="bg-white/40 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/40 p-4 rounded-custom-md flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold"
              >
                <div>
                  <span className="text-[9px] font-bold font-mono text-slate-400 block mb-0.5">{row.id}</span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{row.name}</h4>
                </div>

                <div className="flex items-center gap-6">
                  {/* Pannes compare */}
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 block uppercase">Pannes (25 vs 26)</span>
                    <span className="text-slate-700 dark:text-slate-350">
                      {row.pannes25} <span className="text-slate-300 dark:text-slate-700">➔</span> <span className={isReduced ? 'text-emerald-500' : 'text-rose-500 font-bold'}>{row.pannes26}</span>
                    </span>
                  </div>

                  {/* Budget compare (Hidden for Chef d'équipe) */}
                  {!isChefEquipe && (
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 block uppercase">Coût Maintenance</span>
                    <span className="text-slate-700 dark:text-slate-350 font-mono">
                      {row.cost25.toLocaleString()} TND <span className="text-slate-300 dark:text-slate-700">➔</span> {row.cost26.toLocaleString()} TND
                    </span>
                  </div>
                  )}

                  {/* Savings indicator (Hidden for Chef d'équipe) */}
                  {!isChefEquipe && (
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block uppercase">Économies</span>
                    {costSavings > 0 ? (
                      <span className="text-emerald-500 flex items-center gap-0.5 justify-end">
                        <TrendingDown className="w-3.5 h-3.5" />
                        +{costSavings.toLocaleString()} TND
                      </span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-0.5 justify-end">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {costSavings.toLocaleString()} TND
                      </span>
                    )}
                  </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* === Historique: Top Pannes & Top Techniciens === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Pannes */}
        <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <BarChart3 className="w-4.5 h-4.5 text-amber-500" />
            Top Pannes Fréquentes
          </div>
          <div className="flex flex-col gap-2">
            {topPannesData.map((panne, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/40 rounded-lg">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {idx + 1}. {panne.type}
                </span>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                  {panne.count} fois
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Techniciens */}
        <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
            Top Techniciens (OT Réalisés)
          </div>
          <div className="flex flex-col gap-2">
            {topTechniciansData.map((tech, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/40 rounded-lg">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {idx + 1}. {tech.name}
                </span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                  {tech.count} OT
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
