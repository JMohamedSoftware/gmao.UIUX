import React, { useState, useEffect } from 'react';
import { useGmao, Equipment as EqType, Incident as IncType } from './context/GmaoContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { CommandMenu } from './components/CommandMenu';
import { MobileSimulator } from './components/MobileSimulator';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Equipment } from './pages/Equipment';
import { Preventive } from './pages/Preventive';
import { Corrective } from './pages/Corrective';
import { WorkOrders } from './pages/WorkOrders';
import { Inventory } from './pages/Inventory';
import { Suppliers } from './pages/Suppliers';
import { Reports } from './pages/Reports';
import { Admin } from './pages/Admin';
import { SuperAdmin } from './pages/SuperAdmin';
import { AccessGuard } from './components/AccessGuard';
import { AlertCircle, Wrench, FileCheck, CheckCircle2, X } from 'lucide-react';

function App() {
  const { currentUser, equipments, addIncident, impersonatedTenantId } = useGmao();
  
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const initialScreen = params.get('screen');
    return initialScreen || 'dashboard';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialScreen = params.get('screen');
    if (initialScreen) {
      setCurrentScreen(initialScreen);
      return;
    }
    if (currentUser?.role === 'SuperAdmin') {
      if (impersonatedTenantId) {
        setCurrentScreen('dashboard');
      } else {
        setCurrentScreen('saas-dashboard');
      }
    }
  }, [currentUser, impersonatedTenantId]);

  // Command Menu & Mobile Simulator Visibility
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isMobileSimOpen, setIsMobileSimOpen] = useState(false);

  // Global Quick Incident Modal
  const [isGlobalIncidentOpen, setIsGlobalIncidentOpen] = useState(false);
  const [globalEqId, setGlobalEqId] = useState('');
  const [globalDesc, setGlobalDesc] = useState('');
  const [globalUrgency, setGlobalUrgency] = useState<'Faible' | 'Moyenne' | 'Haute' | 'Critique'>('Moyenne');
  const [globalSuccess, setGlobalSuccess] = useState(false);

  // Inter-page state passes
  const [selectedEqFromDash, setSelectedEqFromDash] = useState<EqType | null>(null);
  const [selectedOtFromUrl, setSelectedOtFromUrl] = useState<string | null>(null);
  const [prefilledIncident, setPrefilledIncident] = useState<IncType | null>(null);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Custom Router navigation resolver
  const handleNavigate = (target: string) => {
    if (target.startsWith('equipment-detail:')) {
      const eqId = target.split(':')[1];
      const eq = equipments.find(e => e.id === eqId);
      if (eq) {
        setSelectedEqFromDash(eq);
        setCurrentScreen('equipment');
      }
    } else if (target.startsWith('workorder-detail:')) {
      const otId = target.split(':')[1];
      setSelectedOtFromUrl(otId);
      setCurrentScreen('workorders');
    } else {
      setCurrentScreen(target);
    }
  };

  const handleGlobalIncidentReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalEqId || !globalDesc) return;

    addIncident({
      equipmentId: globalEqId,
      description: globalDesc,
      reportedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Operateur',
      urgency: globalUrgency
    });

    setGlobalEqId('');
    setGlobalDesc('');
    setGlobalUrgency('Moyenne');
    setGlobalSuccess(true);
    
    setTimeout(() => {
      setGlobalSuccess(false);
      setIsGlobalIncidentOpen(false);
    }, 2000);
  };

  // If not logged in, render the login page
  if (!currentUser) {
    return <Login onLoginSuccess={() => setCurrentScreen('dashboard')} />;
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-100 dark:bg-slate-950 grid-bg relative">
      
      {/* Spotlight design effect */}
      <div className="absolute inset-0 spotlight pointer-events-none opacity-40"></div>

      {/* Main Glassmorphic Sidebar */}
      <Sidebar 
        currentScreen={currentScreen} 
        onNavigate={handleNavigate}
        onOpenMobileSim={() => setIsMobileSimOpen(true)}
      />

      {/* Screen Frame containing Navbar and active Screen */}
      <div className="flex-1 flex flex-col min-h-screen p-4 gap-4 overflow-x-hidden">
        
        {/* Glass Top Navbar */}
        <Navbar 
          currentScreen={currentScreen} 
          onNavigate={handleNavigate} 
          onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
        />

        {/* Dynamic Screen Slot */}
        <main className="flex-1 w-full relative">
          {currentScreen === 'dashboard' && (
            <AccessGuard page="dashboard">
              <Dashboard 
                onNavigate={handleNavigate}
                onSelectEquipment={(eq) => {
                  setSelectedEqFromDash(eq);
                  setCurrentScreen('equipment');
                }}
                onDeclareIncident={() => setIsGlobalIncidentOpen(true)}
              />
            </AccessGuard>
          )}

          {currentScreen === 'equipment' && (
            <AccessGuard page="equipment">
              <Equipment 
                selectedEqFromDash={selectedEqFromDash}
                onClearSelectedEq={() => setSelectedEqFromDash(null)}
                onDeclareIncident={() => setIsGlobalIncidentOpen(true)}
                onNavigate={handleNavigate}
              />
            </AccessGuard>
          )}

          {currentScreen === 'preventive' && (
            <AccessGuard page="preventive">
              <Preventive onNavigate={handleNavigate} />
            </AccessGuard>
          )}

          {currentScreen === 'corrective' && (
            <AccessGuard page="corrective">
              <Corrective 
                onNavigate={handleNavigate}
                onOpenCreateOtWithIncident={(inc) => {
                  setPrefilledIncident(inc);
                  setCurrentScreen('workorders');
                }}
              />
            </AccessGuard>
          )}

          {currentScreen === 'workorders' && (
            <AccessGuard page="workorders">
              <WorkOrders 
                selectedOtFromUrl={selectedOtFromUrl}
                onClearSelectedOt={() => setSelectedOtFromUrl(null)}
                prefilledIncident={prefilledIncident}
                onClearPrefilledIncident={() => setPrefilledIncident(null)}
              />
            </AccessGuard>
          )}

          {currentScreen === 'inventory' && (
            <AccessGuard page="inventory">
              <Inventory onNavigate={setCurrentScreen} />
            </AccessGuard>
          )}

          {currentScreen === 'suppliers' && (
            <AccessGuard page="suppliers">
              <Suppliers />
            </AccessGuard>
          )}

          {currentScreen === 'reports' && (
            <AccessGuard page="reports">
              <Reports />
            </AccessGuard>
          )}

          {currentScreen === 'admin' && (
            <AccessGuard page="admin">
              <Admin />
            </AccessGuard>
          )}

          {currentScreen.startsWith('saas-') && (
            <SuperAdmin activeTab={currentScreen.split('-')[1] as any} />
          )}
        </main>
      </div>

      {/* Floating Raycast Command Overlay */}
      <CommandMenu 
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
        onNavigate={handleNavigate}
        onDeclareIncident={() => setIsGlobalIncidentOpen(true)}
      />

      {/* Interactive Mobile App Mockup Frame */}
      <MobileSimulator 
        isOpen={isMobileSimOpen}
        onClose={() => setIsMobileSimOpen(false)}
      />

      {/* Global Incident declaration popups */}
      {isGlobalIncidentOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel-heavy rounded-custom-lg border border-white/50 dark:border-slate-850 w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-850 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                Signaler une Panne Machine
              </h3>
              <button 
                onClick={() => setIsGlobalIncidentOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {globalSuccess ? (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Panne signalée avec succès</h4>
                <p className="text-xs text-slate-500 leading-snug">
                  L'incident a été envoyé aux planificateurs. Les équipes de maintenance ont été notifiées.
                </p>
              </div>
            ) : (
              <form onSubmit={handleGlobalIncidentReport} className="p-6 flex flex-col gap-4 text-xs">
                
                {/* Equipment field */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Équipement concerné *</label>
                  <select
                    required
                    value={globalEqId}
                    onChange={(e) => setGlobalEqId(e.target.value)}
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
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Symptômes de la panne *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Décrire précisément le défaut constaté (ex: fuite vapeur bride, surchauffe moteur, bruit suspect...)"
                    value={globalDesc}
                    onChange={(e) => setGlobalDesc(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent text-slate-800 dark:text-slate-100 focus:border-primary outline-none resize-none"
                  />
                </div>

                {/* Urgency */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Niveau d'urgence / Criticité panne</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Faible', 'Moyenne', 'Haute', 'Critique'] as const).map(u => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setGlobalUrgency(u)}
                        className={`py-2 rounded font-bold text-[10px] border transition ${
                          globalUrgency === u 
                            ? 'bg-rose-500 border-rose-500 text-white shadow-sm' 
                            : 'bg-transparent border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-150 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setIsGlobalIncidentOpen(false)}
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
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
