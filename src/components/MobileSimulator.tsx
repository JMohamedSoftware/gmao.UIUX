import React, { useState, useEffect, useRef } from 'react';
import { useGmao, WorkOrder, Equipment } from '../context/GmaoContext';
import { 
  Wifi, 
  Battery, 
  Signal, 
  ScanQrCode, 
  Wrench, 
  AlertTriangle, 
  QrCode, 
  Camera, 
  CheckCircle, 
  MapPin, 
  Clock, 
  ArrowLeft,
  X,
  Plus,
  FileText,
  ServerOff,
  UserCheck,
  Activity,
  Boxes,
  RefreshCw,
  FolderTree,
  Sliders,
  FileCheck,
  Package,
  ChevronDown,
  ChevronRight,
  Info
} from 'lucide-react';

interface MobileSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({ isOpen, onClose }) => {
  const { 
    workOrders, 
    equipments, 
    technicians, 
    updateWorkOrderStatus, 
    addIncident, 
    parts,
    addPartMovement 
  } = useGmao();

  const [activeTab, setActiveTab] = useState<'home' | 'ots' | 'scan' | 'new-incident' | 'stock'>('home');
  const [selectedOtId, setSelectedOtId] = useState<string | null>(null);
  const [selectedPartRef, setSelectedPartRef] = useState<string | null>(null);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  
  // Timer State for active OT
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const timerIntervalRef = useRef<any>(null);

  // Scan simulation state
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  // Sync animation state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncText, setLastSyncText] = useState("Dernière synchronisation Il y a 1 minute(s)");

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // New incident fields
  const [selectedEqId, setSelectedEqId] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentUrgency, setIncidentUrgency] = useState<'Faible' | 'Moyenne' | 'Haute' | 'Critique'>('Moyenne');

  // Collapsible Main warehouse list state
  const [mainWarehouseOpen, setMainWarehouseOpen] = useState(true);

  // Find current technician (AhmedTECH)
  const currentTech = technicians.find(t => t.id === 'TECH-001') || technicians[0];
  const techOts = workOrders.filter(ot => ot.technicianId === currentTech.id);

  // Track active OT timer
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  if (!isOpen) return null;

  // Format Elapsed Time (MM:SS)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleCompleteOT = (otId: string) => {
    setTimerRunning(false);
    
    let signatureUrl = '';
    const canvas = canvasRef.current;
    if (canvas) {
      signatureUrl = canvas.toDataURL();
    }

    const elapsedMins = Math.max(1, Math.round(timeElapsed / 60));

    updateWorkOrderStatus(otId, 'Terminé', {
      durationMinutes: elapsedMins,
      signature: signatureUrl || 'signed',
      diagnostic: "Clôturé depuis terminal mobile.",
      solution: "Vérification des paramètres opérationnels effectuée. Test de fonctionnement OK."
    });

    setTimeElapsed(0);
    setSelectedOtId(null);
    setActiveTab('ots');
  };

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncText("Dernière synchronisation À l'instant");
    }, 1200);
  };

  const startScan = () => {
    setScanStatus('scanning');
    setScanResult(null);
    
    setTimeout(() => {
      const randomEq = equipments[Math.floor(Math.random() * equipments.length)];
      setScanResult(randomEq.id);
      setScanStatus('success');
    }, 2000);
  };

  const handleMobileReportIncident = () => {
    if (!selectedEqId || !incidentDesc) return;
    addIncident({
      equipmentId: selectedEqId,
      description: incidentDesc,
      reportedBy: `${currentTech.name} (Mobile App)`,
      urgency: incidentUrgency
    });
    setSelectedEqId('');
    setIncidentDesc('');
    setActiveTab('home');
  };

  const selectedOt = workOrders.find(ot => ot.id === selectedOtId);
  const selectedOtEq = selectedOt ? equipments.find(e => e.id === selectedOt.equipmentId) : null;

  // dynamic counts for mobile widgets
  const otsATraiter = techOts.filter(o => o.status === 'En attente' || o.status === 'Affecté').length;
  const otsEnCours = techOts.filter(o => o.status === 'En cours').length;
  const otsRealise = techOts.filter(o => o.status === 'Terminé').length;
  const otsCloture = techOts.filter(o => o.status === 'Clôturé').length;

  // Selected Stock part details
  const selectedPart = parts.find(p => p.ref === selectedPartRef);

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="relative flex flex-col lg:flex-row gap-8 max-w-4xl w-full items-center justify-center">
        
        {/* Physical Phone frame */}
        <div className="relative w-[340px] h-[680px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 ring-12 ring-slate-900/20 overflow-hidden flex flex-col z-10 shrink-0">
          {/* Top Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-2xl z-35 flex items-center justify-between px-3">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
            <div className="w-10 h-1 bg-slate-900 rounded-full"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-900/30"></div>
          </div>

          {/* Phone Status Bar */}
          <div className="w-full h-8 flex justify-between items-center px-6 text-white text-[10px] font-bold z-30">
            <span>09:28</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 rotate-90" />
            </div>
          </div>

          {/* Phone Screen body */}
          <div className="flex-1 bg-slate-900 text-slate-800 rounded-[38px] overflow-hidden flex flex-col relative">
            
            {/* Main scrollable screen slot */}
            <div className="flex-1 overflow-y-auto pb-16 bg-slate-100 flex flex-col">
              
              {/* Home View (Redesigned matching gmao-mx.png phone layout) */}
              {activeTab === 'home' && !selectedOtId && (
                <div className="flex flex-col animate-[fadeIn_0.2s_ease-out]">
                  
                  {/* Dark Blue Greeting Header */}
                  <div className="bg-[#111827] text-white pt-6 pb-20 px-6 rounded-b-[32px] flex flex-col gap-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm tracking-tight text-primary">DM Mobile</span>
                      {offlineMode && (
                        <span className="bg-rose-500/20 text-rose-300 text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <ServerOff className="w-2.5 h-2.5" /> Offline
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-100">Salut Allane,</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Habilitation : {currentTech.role}</p>
                    </div>
                  </div>

                  {/* Overlapping White Panel Container */}
                  <div className="px-3 -mt-16 flex flex-col gap-4">
                    
                    {/* BI Widgets Card */}
                    <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-150">
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                        Mes BI widgets
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        {/* A traiter */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-[10px]">!</span>
                          <div className="text-left leading-none">
                            <span className="font-extrabold text-slate-800 text-sm block">15</span>
                            <span className="text-[9px] text-slate-450 font-bold">A traiter</span>
                          </div>
                        </div>
                        {/* En cours */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px]">⟳</span>
                          <div className="text-left leading-none">
                            <span className="font-extrabold text-slate-800 text-sm block">20</span>
                            <span className="text-[9px] text-slate-450 font-bold">En cours</span>
                          </div>
                        </div>
                        {/* Réalisé */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px]">✓</span>
                          <div className="text-left leading-none">
                            <span className="font-extrabold text-slate-800 text-sm block">38</span>
                            <span className="text-[9px] text-slate-450 font-bold">Réalisé</span>
                          </div>
                        </div>
                        {/* Clôturé */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">✓</span>
                          <div className="text-left leading-none">
                            <span className="font-extrabold text-slate-800 text-sm block">7</span>
                            <span className="text-[9px] text-slate-450 font-bold">Clôturé</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick creation shortcuts */}
                    <div className="flex gap-2">
                      {/* BT + */}
                      <button 
                        onClick={() => {
                          setActiveTab('ots');
                        }}
                        className="flex-1 bg-white hover:bg-slate-50 p-2.5 rounded-xl border border-slate-205 flex items-center justify-between text-xs font-bold shadow-sm"
                      >
                        <div className="flex items-center gap-2 text-slate-700">
                          <Wrench className="w-4 h-4 text-slate-400" />
                          <span>BT</span>
                        </div>
                        <Plus className="w-4 h-4 text-primary" />
                      </button>

                      {/* DI + */}
                      <button 
                        onClick={() => setActiveTab('new-incident')}
                        className="flex-1 bg-white hover:bg-slate-50 p-2.5 rounded-xl border border-slate-205 flex items-center justify-between text-xs font-bold shadow-sm"
                      >
                        <div className="flex items-center gap-2 text-slate-700">
                          <AlertTriangle className="w-4 h-4 text-slate-400" />
                          <span>DI</span>
                        </div>
                        <Plus className="w-4 h-4 text-rose-500" />
                      </button>
                    </div>

                    {/* Main Menu Grid Buttons (6 big buttons) */}
                    <div className="grid grid-cols-2 gap-3 mt-1 pb-4">
                      {/* BT Groupes */}
                      <button 
                        onClick={() => setActiveTab('ots')}
                        className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center gap-2 text-center text-xs font-extrabold text-slate-700 hover-lift animate-[fadeIn_0.2s_ease-out]"
                      >
                        <FileCheck className="w-6 h-6 text-slate-450" />
                        <span>BT GROUPÉS</span>
                      </button>

                      {/* Équipements */}
                      <button 
                        onClick={() => setActiveTab('scan')}
                        className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center gap-2 text-center text-xs font-extrabold text-slate-700 hover-lift"
                      >
                        <FolderTree className="w-6 h-6 text-slate-450" />
                        <span>ÉQUIPEMENTS</span>
                      </button>

                      {/* Relevés */}
                      <button 
                        onClick={() => setActiveTab('scan')}
                        className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center gap-2 text-center text-xs font-extrabold text-slate-700 hover-lift"
                      >
                        <Activity className="w-6 h-6 text-slate-450" />
                        <span>RELEVÉS</span>
                      </button>

                      {/* Inventaires */}
                      <button 
                        onClick={() => { setActiveTab('stock'); setSelectedPartRef(null); }}
                        className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center gap-2 text-center text-xs font-extrabold text-slate-700 hover-lift"
                      >
                        <Boxes className="w-6 h-6 text-slate-450" />
                        <span>INVENTAIRES</span>
                      </button>

                      {/* Mouvements */}
                      <button 
                        onClick={() => { setActiveTab('stock'); setSelectedPartRef(null); }}
                        className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center gap-2 text-center text-xs font-extrabold text-slate-700 hover-lift"
                      >
                        <RefreshCw className="w-6 h-6 text-slate-450" />
                        <span>MOUVEMENTS</span>
                      </button>

                      {/* Stock */}
                      <button 
                        onClick={() => { setActiveTab('stock'); setSelectedPartRef(null); }}
                        className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col items-center justify-center gap-2 text-center text-xs font-extrabold text-slate-700 hover-lift"
                      >
                        <Package className="w-6 h-6 text-slate-450" />
                        <span>STOCK</span>
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* OT List View */}
              {activeTab === 'ots' && !selectedOtId && (
                <div className="flex flex-col gap-3 p-3 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => setActiveTab('home')} className="p-1 rounded-full bg-white border border-slate-200">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm text-slate-800">Bons de Travail Groupés</span>
                  </div>

                  {techOts.map(ot => {
                    const eq = equipments.find(e => e.id === ot.equipmentId);
                    return (
                      <div
                        key={ot.id}
                        onClick={() => setSelectedOtId(ot.id)}
                        className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-200/60 flex flex-col gap-2 hover:border-primary/50 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 font-mono">{ot.id}</span>
                            <h5 className="font-bold text-xs text-slate-750 leading-tight">{ot.title}</h5>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            ot.status === 'En cours' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-550'
                          }`}>
                            {ot.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{eq ? eq.name : ot.equipmentId}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* OT Details Sheet */}
              {selectedOtId && selectedOt && (
                <div className="flex flex-col gap-4 p-3 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setSelectedOtId(null); setActiveTab('ots'); }}
                      className="p-1 rounded-full bg-white border border-slate-200"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm text-slate-800 font-mono">{selectedOt.id}</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                    <div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        Priorité: {selectedOt.priority}
                      </span>
                      <h4 className="font-bold text-xs text-slate-800 mt-2">{selectedOt.title}</h4>
                      <p className="text-[10px] text-slate-450 mt-1">{selectedOt.description}</p>
                    </div>

                    <div className="text-[10px] border-t border-b border-slate-100 py-2 flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Équipement:</span>
                        <span className="font-semibold text-slate-700">{selectedOtEq?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Zone:</span>
                        <span className="font-semibold text-slate-700">{selectedOtEq?.location}</span>
                      </div>
                    </div>

                    {selectedOt.status !== 'Terminé' && selectedOt.status !== 'En cours' && (
                      <button
                        onClick={() => {
                          updateWorkOrderStatus(selectedOt.id, 'En cours');
                          setTimerRunning(true);
                          setTimeElapsed(0);
                        }}
                        className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-xs shadow-md"
                      >
                        Démarrer l'Intervention
                      </button>
                    )}

                    {selectedOt.status === 'En cours' && (
                      <div className="flex flex-col gap-3">
                        <div className="bg-slate-900 text-white rounded-xl p-3 flex justify-between items-center text-xs font-mono">
                          <span className="text-slate-400">Chronomètre:</span>
                          <span className="font-bold text-primary flex items-center gap-1">{formatTime(timeElapsed)}</span>
                        </div>

                        {/* Signature Validation */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Signature Technicien</span>
                            <button onClick={clearCanvas} className="text-[9px] text-primary font-bold">Effacer</button>
                          </div>
                          <div className="border border-slate-200 rounded-lg bg-white h-24 overflow-hidden relative">
                            <canvas
                              ref={canvasRef}
                              width={290}
                              height={90}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={() => setIsDrawing(false)}
                              className="w-full h-full cursor-crosshair"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleCompleteOT(selectedOt.id)}
                          className="w-full bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs"
                        >
                          Valider & Clôturer l'OT
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* QR Code Scanner view */}
              {activeTab === 'scan' && (
                <div className="flex flex-col gap-4 items-center justify-center py-6 px-3 animate-[fadeIn_0.2s_ease-out]">
                  <div className="w-full flex items-center gap-2 mb-2">
                    <button onClick={() => setActiveTab('home')} className="p-1 rounded-full bg-white border border-slate-200">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm text-slate-800">Scan QR Code Équipement</span>
                  </div>

                  {scanStatus === 'idle' && (
                    <div className="flex flex-col items-center gap-4 mt-6">
                      <div className="w-44 h-44 border-2 border-dashed border-primary rounded-3xl flex items-center justify-center bg-white shadow-inner">
                        <QrCode className="w-16 h-16 text-slate-300" />
                      </div>
                      <button
                        onClick={startScan}
                        className="bg-primary text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow animate-[fadeIn_0.2s_ease-out]"
                      >
                        <Camera className="w-4 h-4" />
                        Activer la caméra
                      </button>
                    </div>
                  )}

                  {scanStatus === 'scanning' && (
                    <div className="flex flex-col items-center gap-4 mt-6">
                      <div className="w-44 h-44 border-2 border-primary rounded-3xl overflow-hidden relative shadow-md">
                        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                          <span className="text-emerald-400 text-xs animate-pulse font-bold">Viseur caméra...</span>
                        </div>
                        <div className="absolute left-0 right-0 h-0.5 bg-rose-500 top-1/2 -translate-y-1/2 animate-[scanLine_1.5s_infinite]"></div>
                      </div>
                    </div>
                  )}

                  {scanStatus === 'success' && scanResult && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 w-full shadow-sm">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Équipement détecté</span>
                      <h4 className="font-bold text-xs text-slate-800 mt-1">
                        {equipments.find(e => e.id === scanResult)?.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 block">{scanResult}</span>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('new-incident');
                            setSelectedEqId(scanResult);
                          }}
                          className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-bold"
                        >
                          Rapporter panne
                        </button>
                        <button
                          onClick={() => setScanStatus('idle')}
                          className="bg-slate-150 text-slate-700 py-2 px-3 rounded-lg text-xs font-bold"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* New Incident declaration view */}
              {activeTab === 'new-incident' && (
                <div className="flex flex-col gap-3 p-3 animate-[fadeIn_0.2s_ease-out]">
                  <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => setActiveTab('home')} className="p-1 rounded-full bg-white border border-slate-200">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm text-slate-800">Déclarer un Incident (DI)</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 font-bold">Équipement concerné *</label>
                      <select
                        value={selectedEqId}
                        onChange={(e) => setSelectedEqId(e.target.value)}
                        className="p-2 border border-slate-200 rounded-lg bg-transparent font-medium outline-none"
                      >
                        <option value="">Choisir machine...</option>
                        {equipments.map(e => (
                          <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-400 font-bold">Symptômes de la panne *</label>
                      <textarea
                        rows={3}
                        value={incidentDesc}
                        onChange={(e) => setIncidentDesc(e.target.value)}
                        placeholder="Préciser les détails..."
                        className="p-2 border border-slate-205 rounded-lg bg-transparent outline-none resize-none"
                      />
                    </div>

                    <button
                      onClick={handleMobileReportIncident}
                      disabled={!selectedEqId || !incidentDesc}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-lg disabled:opacity-50 mt-2"
                    >
                      Transmettre DI
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Spare parts list / Details (Aligning with capture image background) */}
              {activeTab === 'stock' && (
                selectedPartRef && selectedPart ? (
                  // HIGH-FIDELITY SPARE PART DETAILS (matching second phone in screenshot)
                  <div className="flex flex-col animate-[fadeIn_0.2s_ease-out] text-slate-700 bg-white min-h-full">
                    
                    {/* Header bar */}
                    <div className="bg-slate-900 text-white p-3 pt-6 flex items-center justify-between border-b border-slate-800">
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <button 
                          onClick={() => setSelectedPartRef(null)} 
                          className="p-1 rounded hover:bg-slate-800 text-slate-350"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <h4 className="font-bold text-xs truncate max-w-[200px]">
                          {selectedPart.ref} - {selectedPart.name}
                        </h4>
                      </div>
                      <span className="text-[9px] font-bold bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded shrink-0">
                        {selectedPart.stockCurrent.toString().padStart(2, '0')} en stock
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-3.5 flex flex-col gap-4 text-xs">
                      
                      {/* Famille selector */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Famille de pièces</span>
                        <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl flex justify-between items-center font-bold text-slate-800">
                          <span>{selectedPart.category}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>

                      {/* Magasins header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider flex items-center gap-1">
                          Magasin(s)
                        </span>
                        <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                      </div>

                      {/* Collapsible main store */}
                      <div className="flex flex-col gap-1.5">
                        <div 
                          onClick={() => setMainWarehouseOpen(!mainWarehouseOpen)}
                          className="flex items-center gap-1.5 font-black text-slate-800 cursor-pointer"
                        >
                          {mainWarehouseOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                          <span>mag.marseille principal</span>
                        </div>

                        {mainWarehouseOpen && (
                          <div className="pl-5 border-l border-slate-150 flex flex-col gap-2 py-1 text-[11px] font-semibold text-slate-500">
                            <div className="flex justify-between">
                              <span>Lieu de stockage :</span>
                              <span className="text-slate-700 font-bold font-mono">{selectedPart.location.split(' - ')[1] || 'Rayon A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Quantité réelle :</span>
                              <span className="text-slate-800 font-bold">{selectedPart.stockCurrent.toFixed(2).replace('.', ',')} Pièce(s)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Quantité disponible :</span>
                              <span className="text-slate-850 font-bold">{selectedPart.stockCurrent.toFixed(2).replace('.', ',')} Pièce(s)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Quantité réservée :</span>
                              <span className="text-slate-700">0,00 Pièce(s)</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Quantité commandée :</span>
                              <span className="text-slate-700">0,00 Pièce(s)</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Other locations (matching picture list) */}
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100">
                        {/* Dublin */}
                        <div className="flex justify-between items-center py-1">
                          <span className="font-bold text-slate-700">Magasin de Dublin</span>
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </div>
                        {/* Londres */}
                        <div className="flex justify-between items-center py-1">
                          <span className="font-bold text-slate-700">Magasin de Londres</span>
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </div>
                        {/* Lyon - Low stock alert in picture */}
                        <div className="flex justify-between items-center py-1 bg-amber-500/5 px-2 rounded-lg border border-amber-500/10">
                          <span className="font-bold text-slate-700">Magasin de Lyon</span>
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        </div>
                        {/* New York */}
                        <div className="flex justify-between items-center py-1">
                          <span className="font-bold text-slate-700">Magasin de New York</span>
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </div>
                        {/* Paris */}
                        <div className="flex justify-between items-center py-1">
                          <span className="font-bold text-slate-700">Magasin de Paris</span>
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </div>
                      </div>

                    </div>

                    {/* Bottom sync status */}
                    <div className="mt-auto border-t border-slate-200/80 bg-slate-50 p-3 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                      <span>{lastSyncText}</span>
                      <button 
                        onClick={handleTriggerSync}
                        disabled={isSyncing}
                        className="p-1 rounded hover:bg-slate-200 text-primary outline-none"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                  </div>
                ) : (
                  // Parts Listing
                  <div className="flex flex-col gap-3 p-3 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex items-center gap-2 mb-1">
                      <button onClick={() => setActiveTab('home')} className="p-1 rounded-full bg-white border border-slate-200">
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-sm text-slate-800">Gestion de Stock mobile</span>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                      {parts.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 font-semibold text-xs">
                          Aucune pièce en stock.
                        </div>
                      ) : (
                        parts.map(p => (
                          <div 
                            key={p.ref} 
                            onClick={() => setSelectedPartRef(p.ref)}
                            className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs shadow-sm cursor-pointer transition-colors"
                          >
                            <div>
                              <h5 className="font-bold text-slate-700 leading-tight">{p.name}</h5>
                              <span className="text-[9px] font-mono text-slate-450 block mt-0.5">{p.ref} • {p.location.split(' - ')[0]}</span>
                            </div>
                            <span className={`font-bold px-2 py-0.5 rounded text-[10px] shrink-0 ${
                              p.stockCurrent <= p.stockMin ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-650'
                            }`}>
                              {p.stockCurrent} u
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              )}

            </div>

            {/* Bottom Nav Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-6 flex justify-between items-center z-20">
              <button 
                onClick={() => { setSelectedOtId(null); setSelectedPartRef(null); setActiveTab('home'); }}
                className={`flex flex-col items-center gap-1 transition ${activeTab === 'home' ? 'text-primary font-bold' : 'text-slate-400'}`}
              >
                <Sliders className="w-5 h-5" />
                <span className="text-[9px]">Accueil</span>
              </button>

              <button 
                onClick={() => { setSelectedOtId(null); setSelectedPartRef(null); setActiveTab('ots'); }}
                className={`flex flex-col items-center gap-1 transition ${activeTab === 'ots' ? 'text-primary font-bold' : 'text-slate-400'}`}
              >
                <Wrench className="w-5 h-5" />
                <span className="text-[9px]">Mes OTs</span>
              </button>

              <button 
                onClick={() => { setSelectedPartRef(null); setActiveTab('scan'); }}
                className={`flex flex-col items-center gap-1 transition ${activeTab === 'scan' ? 'text-primary font-bold' : 'text-slate-400'}`}
              >
                <ScanQrCode className="w-5 h-5" />
                <span className="text-[9px]">Scanner</span>
              </button>
            </div>

            {/* Bottom physical home bar indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-350 rounded-full z-30"></div>
          </div>
        </div>

        {/* REDESIGNED FLOATING MARKETING OVERLAY WIDGETS (Matching gmao-mx.png style overlays) */}
        <div className="flex flex-col gap-5 w-full md:w-72 select-none relative z-10">
          
          {/* Card 1: BI Analytics Dashboard Widgets */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] p-5 shadow-xl border border-slate-200/50 dark:border-slate-800 flex flex-col gap-4">
            <h5 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1.5">
              Analyses BI Plateforme
            </h5>
            
            {/* Mock Line Chart */}
            <div className="relative h-20 w-full flex items-end">
              <svg viewBox="0 0 100 35" className="w-full h-full overflow-visible">
                {/* Grid line */}
                <line x1="0" y1="30" x2="100" y2="30" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeWidth="1" />
                <line x1="0" y1="15" x2="100" y2="15" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeWidth="1" />
                {/* Blue line path */}
                <path 
                  d="M0,28 Q15,10 30,22 T60,5 T90,12 T100,18" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
                <circle cx="30" cy="22" r="2.5" fill="#3b82f6" />
                <circle cx="60" cy="5" r="2.5" fill="#3b82f6" />
                {/* Orange line path */}
                <path 
                  d="M0,32 Q15,18 30,28 T60,12 T90,20 T100,24" 
                  fill="none" 
                  stroke="#f97316" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                />
                <circle cx="30" cy="28" r="2.5" fill="#f97316" />
                <circle cx="60" cy="12" r="2.5" fill="#f97316" />
              </svg>
            </div>

            {/* Mock Doughnut Chart */}
            <div className="flex items-center justify-between mt-1">
              <div className="w-14 h-14 relative flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f1f5f9" strokeWidth="4.2" className="dark:stroke-slate-800" />
                  {/* Segment 1: Blue (40%) */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#1d4ed8" strokeWidth="4.2" strokeDasharray="40 100" strokeDashoffset="0" />
                  {/* Segment 2: Light Blue (25%) */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#0ea5e9" strokeWidth="4.2" strokeDasharray="25 100" strokeDashoffset="-40" />
                  {/* Segment 3: Orange (20%) */}
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f97316" strokeWidth="4.2" strokeDasharray="20 100" strokeDashoffset="-65" />
                </svg>
                <div className="absolute font-black text-[9px] text-slate-800 dark:text-slate-100">BI</div>
              </div>
              
              <div className="flex flex-col gap-1 text-[9px] font-bold text-slate-450 text-right">
                <span className="flex items-center gap-1 justify-end"><span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span>BT Correctifs</span>
                <span className="flex items-center gap-1 justify-end"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>BT Préventifs</span>
                <span className="flex items-center gap-1 justify-end"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>DI Déclarés</span>
              </div>
            </div>
          </div>

          {/* Card 2: Floating Ecrou Card (écrou 453) */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] p-5 shadow-xl border border-slate-200/50 dark:border-slate-800 flex flex-col items-center relative overflow-hidden">
            
            <div className="w-full flex justify-between items-center">
              <div className="text-left">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight">écrou 453</h4>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Quantité 22</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>

            {/* Metallic Hex Nut SVG illustration */}
            <svg viewBox="0 0 100 100" className="w-28 h-28 my-3 overflow-visible filter drop-shadow-md">
              <defs>
                <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="30%" stopColor="#cbd5e1" />
                  <stop offset="60%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="innerGradient" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#f1f5f9" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
              </defs>
              {/* Outer Hexagon */}
              <polygon 
                points="50,6 88,28 88,72 50,94 12,72 12,28" 
                fill="url(#metalGradient)" 
                stroke="#64748b" 
                strokeWidth="1.5" 
              />
              {/* Center cutout */}
              <circle cx="50" cy="50" r="23" fill="#ffffff" className="dark:fill-slate-900" stroke="url(#innerGradient)" strokeWidth="3" />
              {/* Thread detail */}
              <circle cx="50" cy="50" r="19" fill="none" stroke="#94a3b8" strokeWidth="0.85" strokeDasharray="6 3" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="#475569" strokeWidth="0.85" strokeDasharray="4 2" />
            </svg>

            <span className="text-[9px] font-extrabold text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-850">
              Ref: REF-NUT-453 • Filetage M12
            </span>
          </div>

          {/* Close & control bar */}
          <div className="glass-panel p-4 rounded-[20px] border border-white/50 dark:border-slate-800 flex items-center justify-between shadow-sm">
            <span className="text-[10px] text-slate-450 font-bold">POMODORO Simulator</span>
            <button 
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 dark:bg-slate-900 hover:bg-black text-white font-bold rounded-lg text-[10px] shadow"
            >
              Fermer
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
