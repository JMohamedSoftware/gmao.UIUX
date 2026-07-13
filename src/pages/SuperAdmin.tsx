import React, { useState } from 'react';
import { useGmao, Tenant, Equipment } from '../context/GmaoContext';
import { 
  Building2, 
  Check, 
  X, 
  Users, 
  CreditCard, 
  Activity, 
  AlertCircle, 
  ArrowUpRight, 
  DollarSign, 
  ShieldCheck, 
  UserCheck, 
  ExternalLink,
  Ban,
  TrendingUp,
  Settings,
  Sparkles,
  Ticket,
  ArrowRight,
  ArrowLeft,
  Globe,
  Lock,
  Package,
  Layers,
  Palette,
  CheckCircle2,
  Hourglass,
  LayoutDashboard,
  HardDrive,
  Mail,
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface SuperAdminProps {
  activeTab?: 'dashboard' | 'tenants' | 'plans' | 'billing' | 'monitoring' | 'logs' | 'settings';
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({ activeTab = 'dashboard' }) => {
  const { tenants, approveTenant, suspendTenant, impersonateTenant, registerTenant } = useGmao();


  // Pricing configuration state
  const [plansConfig, setPlansConfig] = useState({
    Basic: 299,
    Premium: 599,
    Enterprise: 1299
  });

  const [showConfigSaved, setShowConfigSaved] = useState(false);

  // Multi-step Creation Wizard state
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [creationLoading, setCreationLoading] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);

  // Step 1: Corporate Registry
  const [companyName, setCompanyName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [industry, setIndustry] = useState('Tomato Processing');
  const [country, setCountry] = useState('Tunisie');
  const [city, setCity] = useState('Nabeul');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  // Step 2: Brand Identity
  const [logoUrl, setLogoUrl] = useState('/assets/default-logo.svg');
  const [primaryColor, setPrimaryColor] = useState('#EF4444');
  const [secondaryColor, setSecondaryColor] = useState('#3B82F6');
  const [accentColor, setAccentColor] = useState('#10B981');
  const [themeMode, setThemeMode] = useState<'Light' | 'Dark'>('Light');

  // Step 3: Workspace
  const [companySlug, setCompanySlug] = useState('');
  const [timezone, setTimezone] = useState('GMT+1');
  const [language, setLanguage] = useState('Français');
  const [currency, setCurrency] = useState('EUR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  // Step 4: Administrator
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Step 5: Subscription
  const [subPlan, setSubPlan] = useState<'Basic' | 'Premium' | 'Enterprise'>('Premium');
  const [storageLimit, setStorageLimit] = useState('50 GB');
  const [maxUsers, setMaxUsers] = useState(20);
  const [maxEquipment, setMaxEquipment] = useState(50);

  // Filter requests vs active tenants
  const pendingRequests = tenants.filter(t => t.status === 'Pending');
  const registeredTenants = tenants.filter(t => t.status !== 'Pending');

  // Compute SaaS Analytics
  const activeCount = registeredTenants.filter(t => t.status === 'Active').length;
  
  const mrr = registeredTenants.reduce((acc, t) => {
    if (t.status === 'Active') {
      const planPrice = plansConfig[t.subscriptionPlan as keyof typeof plansConfig] || 0;
      return acc + planPrice;
    }
    return acc;
  }, 0);

  // Platform simulation chart data
  const revenueHistory = [
    { month: 'Jan', revenue: 1200 },
    { month: 'Fév', revenue: 2400 },
    { month: 'Mar', revenue: 3800 },
    { month: 'Avr', revenue: 4100 },
    { month: 'Mai', revenue: 5400 },
    { month: 'Juin', revenue: 6800 },
    { month: 'Juil', revenue: mrr } // Current MRR
  ];

  const handleSavePlans = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfigSaved(true);
    setTimeout(() => setShowConfigSaved(false), 3000);
  };

  const handleCompanyNameChange = (val: string) => {
    setCompanyName(val);
    setLegalName(val + " S.A.");
    setCompanySlug(val.toLowerCase().replace(/[^a-z0-9]/g, ''));
  };

  const handlePlanChange = (plan: 'Basic' | 'Premium' | 'Enterprise') => {
    setSubPlan(plan);
    if (plan === 'Basic') {
      setStorageLimit('10 GB');
      setMaxUsers(5);
      setMaxEquipment(15);
    } else if (plan === 'Premium') {
      setStorageLimit('50 GB');
      setMaxUsers(20);
      setMaxEquipment(50);
    } else {
      setStorageLimit('500 GB');
      setMaxUsers(100);
      setMaxEquipment(500);
    }
  };

  const handleWizardSubmit = () => {
    setCreationLoading(true);
    setTimeout(() => {
      // 1. Register Tenant (created as pending)
      registerTenant(companyName, `${companySlug}.platform.com`, adminEmail, 300, subPlan);
      
      // Find the newly registered tenant ID to approve it instantly
      // registerTenant appends to the tenants list
      const tempId = `tenant-${companySlug}`;
      // In the context code: const newId = `tenant-${domain.split('.')[0]}-${Date.now().toString().slice(-4)}`;
      // Since it's random/date-based, we'll approve all pending matching this domain to be safe:
      
      setTimeout(() => {
        // Find and approve the tenant that was just added
        approveTenant(`tenant-${companySlug}`);
      }, 0);

      // We simulate immediate approval in the UI for flow continuity
      setCreationLoading(false);
      setCreationSuccess(true);
      
      setTimeout(() => {
        // Reset states & close
        setShowCreateWizard(false);
        setCurrentStep(1);
        setCreationSuccess(false);
        setCompanyName('');
        setLegalName('');
        setAddress('');
        setPhone('');
        setEmail('');
        setTaxNumber('');
        setCompanySlug('');
        setAdminFirstName('');
        setAdminLastName('');
        setAdminEmail('');
        setAdminPassword('');
      }, 1500);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeIn_0.2s_ease-out]">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            SaaS Management Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            Superviseur Global • Gestion des espaces de travail de transformation de tomates
          </p>
        </div>
      </div>

      {/* Content Area */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">

          {/* 1. DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-custom-lg border border-white/50 dark:border-slate-850 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Recurring Revenue</span>
                    <span className="text-xl font-black text-slate-850 dark:text-white block mt-1 font-mono">{mrr.toLocaleString()} TND</span>
                    <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5 mt-0.5"><TrendingUp className="w-3 h-3" /> +15.4% ce mois</span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><DollarSign className="w-5 h-5" /></div>
                </div>

                <div className="glass-panel p-4 rounded-custom-lg border border-white/50 dark:border-slate-850 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Entreprises Actives</span>
                    <span className="text-xl font-black text-slate-850 dark:text-white block mt-1">{activeCount} / {registeredTenants.length}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">100% hébergé en Cloud</span>
                  </div>
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Building2 className="w-5 h-5" /></div>
                </div>

                <div className="glass-panel p-4 rounded-custom-lg border border-white/50 dark:border-slate-850 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Demandes en attente</span>
                    <span className="text-xl font-black text-rose-500 block mt-1">{pendingRequests.length}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Approbation requise</span>
                  </div>
                  <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl"><AlertCircle className="w-5 h-5" /></div>
                </div>

                <div className="glass-panel p-4 rounded-custom-lg border border-white/50 dark:border-slate-850 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Disponibilité Plateforme</span>
                    <span className="text-xl font-black text-emerald-500 block mt-1">99.98 %</span>
                    <span className="text-[9px] text-emerald-500 font-bold block mt-0.5">Opérationnel</span>
                  </div>
                  <div className="p-3 bg-teal-500/10 text-teal-500 rounded-2xl"><Activity className="w-5 h-5" /></div>
                </div>
              </div>

              {/* SaaS Platform Revenue chart */}
              <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4.5 h-4.5 text-primary" />
                    Progression de l'Audience & MRR
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-4">Revenu mensuel récurrent cumulé</p>
                </div>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} />
                      <YAxis stroke="#94A3B8" fontSize={9} />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" name="MRR (TND)" stroke="#2563EB" fill="#2563EB" fillOpacity={0.06} strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* 2. TENANTS */}
          {activeTab === 'tenants' && (
            <div className="flex flex-col gap-6">
              {/* Requests Section */}
              {pendingRequests.length > 0 && (
                <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm border-l-4 border-l-amber-500">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                    <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                    Demandes d'Onboarding à valider ({pendingRequests.length})
                  </h3>
                  <div className="flex flex-col gap-3">
                    {pendingRequests.map(r => (
                      <div key={r.id} className="p-4 bg-white/40 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/40 rounded-custom-md flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold">
                        <div>
                          <h4 className="font-bold text-slate-850 dark:text-slate-200 text-sm">{r.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-1">Domaine: <span className="font-mono">{r.domain}</span> • Admin: <span className="font-mono">{r.adminEmail}</span></p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold">Plan demandé: {r.subscriptionPlan}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => approveTenant(r.id)} className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow cursor-pointer"><Check className="w-4 h-4" /><span>Approuver & Créer</span></button>
                          <button onClick={() => suspendTenant(r.id)} className="flex items-center gap-1 px-4 py-2 bg-slate-205 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer"><X className="w-4 h-4" /><span>Rejeter</span></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tenants Registry */}
              <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Building2 className="w-4.5 h-4.5 text-primary" />
                    Répertoire des Espaces SaaS Actifs
                  </h3>
                  <button onClick={() => setShowCreateWizard(true)} className="bg-primary hover:bg-primary/95 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1.5 shadow cursor-pointer transition hover-lift">
                    <Sparkles className="w-3.5 h-3.5" /> Créer
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {registeredTenants.map(t => (
                    <div key={t.id} className="p-4 bg-white/40 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/40 rounded-custom-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-mono">{t.id}</span>
                        <h4 className="font-bold text-slate-850 dark:text-slate-200 text-sm">{t.name}</h4>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{t.domain} • {t.adminEmail}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center"><span className="text-[9px] text-slate-400 block uppercase font-bold">Plan</span><span className="text-primary font-bold">{t.subscriptionPlan}</span></div>
                        <div className="text-center"><span className="text-[9px] text-slate-400 block uppercase font-bold">Statut</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{t.status === 'Active' ? 'Actif' : 'Suspendu'}</span></div>
                        <div className="flex gap-2">
                          <button onClick={() => impersonateTenant(t.id)} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white font-bold rounded-lg shadow-sm hover:bg-primary/95 text-[10px] cursor-pointer"><ExternalLink className="w-3.5 h-3.5" /><span>Accéder</span></button>
                          <button onClick={() => suspendTenant(t.id)} className={`p-1.5 border rounded-lg shadow-sm cursor-pointer ${t.status === 'Active' ? 'border-slate-200 text-slate-450 hover:bg-rose-50 hover:text-rose-500' : 'border-emerald-200 text-emerald-500 hover:bg-emerald-50'}`} title={t.status === 'Active' ? 'Suspendre' : 'Activer'}><Ban className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. PLANS */}
          {activeTab === 'plans' && (
            <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm max-w-2xl">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-850 pb-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Package className="w-4.5 h-4.5 text-primary" />
                  Configuration des Tarifs SaaS
                </h3>
                {showConfigSaved && <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded animate-pulse">Sauvegardé !</span>}
              </div>
              <form onSubmit={handleSavePlans} className="flex flex-col gap-4 text-xs font-semibold">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-lg">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Basic</h4>
                      <p className="text-[10px] text-slate-500">Jusqu'à 5 utilisateurs, 15 équipements</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" required value={plansConfig.Basic} onChange={(e) => setPlansConfig(prev => ({ ...prev, Basic: Number(e.target.value) }))} className="w-24 p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none font-semibold bg-transparent text-right" />
                      <span className="text-slate-400">TND/mois</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">POPULAIRE</div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Premium</h4>
                      <p className="text-[10px] text-slate-500">Jusqu'à 20 utilisateurs, 50 équipements</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" required value={plansConfig.Premium} onChange={(e) => setPlansConfig(prev => ({ ...prev, Premium: Number(e.target.value) }))} className="w-24 p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none font-semibold bg-transparent text-right" />
                      <span className="text-slate-400">TND/mois</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/50 rounded-lg">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Enterprise</h4>
                      <p className="text-[10px] text-slate-500">Jusqu'à 100 utilisateurs, 500 équipements</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" required value={plansConfig.Enterprise} onChange={(e) => setPlansConfig(prev => ({ ...prev, Enterprise: Number(e.target.value) }))} className="w-24 p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none font-semibold bg-transparent text-right" />
                      <span className="text-slate-400">TND/mois</span>
                    </div>
                  </div>
                </div>
                <button type="submit" className="py-2 px-4 bg-primary text-white hover:bg-primary/95 font-bold rounded-lg shadow self-end hover-lift mt-2 cursor-pointer">
                  Enregistrer les Modifs
                </button>
              </form>
            </div>
          )}

          {/* 4. BILLING */}
          {activeTab === 'billing' && (
            <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                <CreditCard className="w-4.5 h-4.5 text-primary" /> Historique de Facturation & Paiements
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] uppercase text-slate-400">
                      <th className="p-3 font-bold">Date</th>
                      <th className="p-3 font-bold">Client</th>
                      <th className="p-3 font-bold">Plan</th>
                      <th className="p-3 font-bold">Montant</th>
                      <th className="p-3 font-bold">Statut</th>
                      <th className="p-3 font-bold">Facture</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <tr className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-3">01 Juil 2026</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-white">Conserves du Nord S.A.</td>
                      <td className="p-3"><span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">Premium</span></td>
                      <td className="p-3 font-mono">599,00 TND</td>
                      <td className="p-3"><span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3"/> Payé</span></td>
                      <td className="p-3"><button className="text-primary hover:underline font-bold text-[10px]">PDF</button></td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-3">01 Juil 2026</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-white">Tomates du Sud</td>
                      <td className="p-3"><span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-bold">Basic</span></td>
                      <td className="p-3 font-mono">299,00 TND</td>
                      <td className="p-3"><span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3"/> Payé</span></td>
                      <td className="p-3"><button className="text-primary hover:underline font-bold text-[10px]">PDF</button></td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-3">28 Juin 2026</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-white">AgroTech Centre</td>
                      <td className="p-3"><span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-bold">Enterprise</span></td>
                      <td className="p-3 font-mono">1 299,00 TND</td>
                      <td className="p-3"><span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold flex items-center gap-1 w-max"><Hourglass className="w-3 h-3"/> En attente</span></td>
                      <td className="p-3"><button className="text-primary hover:underline font-bold text-[10px]">PDF</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. MONITORING */}
          {activeTab === 'monitoring' && (
            <div className="flex flex-col gap-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-primary" /> Monitoring Serveur & Infrastructure
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* CPU */}
                <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-850 flex flex-col items-center justify-center gap-2 shadow-sm relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 h-1 bg-primary" style={{ width: '45%' }}></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CPU Usage</span>
                  <span className="text-2xl font-black text-slate-850 dark:text-white">45%</span>
                  <span className="text-[9px] text-emerald-500 font-bold">Normal</span>
                </div>
                {/* RAM */}
                <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-850 flex flex-col items-center justify-center gap-2 shadow-sm relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 h-1 bg-amber-500" style={{ width: '62%' }}></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">RAM Allocation</span>
                  <span className="text-2xl font-black text-slate-850 dark:text-white">62%</span>
                  <span className="text-[9px] text-slate-500 font-bold">19.8 GB / 32 GB</span>
                </div>
                {/* Database */}
                <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-850 flex flex-col items-center justify-center gap-2 shadow-sm relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 h-1 bg-primary" style={{ width: '25%' }}></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Database IOPS</span>
                  <span className="text-2xl font-black text-slate-850 dark:text-white">840</span>
                  <span className="text-[9px] text-emerald-500 font-bold">Performant</span>
                </div>
                {/* Storage */}
                <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-850 flex flex-col items-center justify-center gap-2 shadow-sm relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 h-1 bg-rose-500" style={{ width: '78%' }}></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Storage SSD</span>
                  <span className="text-2xl font-black text-slate-850 dark:text-white">78%</span>
                  <span className="text-[9px] text-rose-500 font-bold">Scale up bientôt requis</span>
                </div>
              </div>

              {/* Fake Network Graph */}
              <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm">
                <h4 className="text-[10px] font-bold text-slate-450 uppercase mb-3 flex items-center gap-2"><Globe className="w-3.5 h-3.5"/> Network Traffic (Simulated)</h4>
                <div className="w-full h-32 flex items-end gap-1 px-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  {Array.from({ length: 40 }).map((_, i) => {
                    const height = Math.floor(Math.random() * 80) + 10;
                    return (
                      <div key={i} className={`w-full rounded-t-sm transition-all duration-500 ${height > 70 ? 'bg-amber-400' : 'bg-primary/60'}`} style={{ height: `${height}%` }}></div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 6. LOGS */}
          {activeTab === 'logs' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-primary" /> System Audit Logs
                </h3>
                <div className="flex flex-col gap-1">
                  {[
                    { time: '14:22', msg: 'Admin password reset for Conserves du Midi', type: 'warn' },
                    { time: '11:05', msg: 'Subscription updated (Tomates du Nord -> Premium)', type: 'info' },
                    { time: '09:14', msg: 'Tenant AgroTech Centre created', type: 'success' },
                    { time: '09:14', msg: 'Database schema migration applied', type: 'info' },
                    { time: 'Yesterday', msg: 'Company deleted (TestCorp)', type: 'error' },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-4 items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded text-xs font-semibold">
                      <span className="text-[10px] text-slate-400 font-mono w-12 shrink-0">{log.time}</span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${log.type === 'warn' ? 'bg-amber-500' : log.type === 'success' ? 'bg-emerald-500' : log.type === 'error' ? 'bg-rose-500' : 'bg-primary'}`}></span>
                      <span className="text-slate-700 dark:text-slate-300">{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Backup Status */}
                <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><HardDrive className="w-5 h-5"/></div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Dernier Backup</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">Today 03:00 AM</span>
                    <span className="text-[10px] text-emerald-500 font-bold">Status: Success (24GB)</span>
                  </div>
                </div>

                {/* Email Queue */}
                <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm flex items-center gap-3">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Mail className="w-5 h-5"/></div>
                  <div className="w-full">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Queue (24h)</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">Sent: 1,432</span>
                      <span className="text-[10px] bg-rose-100 text-rose-600 px-2 rounded-full font-bold">Failed: 3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. SETTINGS */}
          {activeTab === 'settings' && (
            <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-850 shadow-sm max-w-2xl">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-850 pb-2">
                <Lock className="w-4.5 h-4.5 text-primary" /> Sécurité globale & Infrastucture
              </h3>
              
              <div className="flex flex-col gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between p-3 border border-slate-200/50 dark:border-slate-800/50 rounded-lg">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Authentification Double Facteur (2FA)</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Imposer le 2FA à tous les comptes administrateurs de l'application.</p>
                  </div>
                  <button className="w-10 h-5 bg-emerald-500 rounded-full relative shadow-inner cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow"></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200/50 dark:border-slate-800/50 rounded-lg">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Certificat SSL (Wildcard)</h4>
                    <p className="text-[10px] text-slate-400 font-medium">*.platform.com (Géré par AWS ACM)</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded font-bold">
                    Valide (Expire dans 243 jours)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-200/50 dark:border-slate-800/50 rounded-lg">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Isolation des bases de données</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Séparation physique par Tenant (Row-Level Security active)</p>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold">
                    Strict Mode
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      {/* ==================================================
          6-STEP PREMIUM CREATE COMPANY WIZARD MODAL 
          ================================================== */}
      {showCreateWizard && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-white/90 dark:bg-slate-900/90 glass-panel rounded-custom-xl border border-white/50 dark:border-slate-800 p-6 flex flex-col gap-5 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-850 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-rose-500 animate-pulse" />
                  Créer une Nouvelle Entreprise (Tenant)
                </h3>
                <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Wizard Onboarding SaaS multi-tenant</span>
              </div>
              <button 
                onClick={() => { setShowCreateWizard(false); setCurrentStep(1); }}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps Progress Indicator */}
            <div className="grid grid-cols-6 gap-2 text-center text-[9px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              {[
                { step: 1, name: 'Infos' },
                { step: 2, name: 'Identité' },
                { step: 3, name: 'Workspace' },
                { step: 4, name: 'Admin' },
                { step: 5, name: 'Offre' },
                { step: 6, name: 'Synthèse' }
              ].map(s => (
                <div key={s.step} className="flex flex-col items-center gap-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    currentStep === s.step 
                      ? 'bg-primary text-white' 
                      : currentStep > s.step 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {currentStep > s.step ? '✓' : s.step}
                  </span>
                  <span className={currentStep === s.step ? 'text-primary font-black' : ''}>{s.name}</span>
                </div>
              ))}
            </div>

            {/* Steps Content Area */}
            <div className="flex-1 min-h-[250px] text-xs font-semibold text-slate-700 dark:text-slate-350">
              
              {/* STEP 1: Corporate Registry */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-3.5 animate-[fadeIn_0.15s_ease-out]">
                  <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Information de l'Entreprise</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Nom de la Conserverie *</label>
                      <input 
                        type="text" 
                        required
                        value={companyName}
                        onChange={(e) => handleCompanyNameChange(e.target.value)}
                        placeholder="Ex: Sicam Tomates"
                        className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Raison Sociale *</label>
                      <input 
                        type="text" 
                        required
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="Ex: Sicam S.A."
                        className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Adresse Physique</label>
                      <input 
                        type="text" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ex: Zone Industrielle, Route de Tunis"
                        className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Matricule Fiscal *</label>
                      <input 
                        type="text" 
                        required
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value)}
                        placeholder="Ex: 1234567/A/M/000"
                        className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Pays</label>
                      <input 
                        type="text" 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Ville</label>
                      <input 
                        type="text" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Téléphone Standard</label>
                      <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: +216 72 100 200"
                        className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Brand Identity Customizer */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-4 animate-[fadeIn_0.15s_ease-out]">
                  <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Identité de Marque & Thème</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Selectors */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">URL du Logo d'Entreprise</label>
                        <input 
                          type="text" 
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="/assets/logo.svg"
                          className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white"
                        />
                      </div>

                      {/* Accent Color picker options */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Couleur Primaire (Accent)</label>
                        <div className="flex gap-2.5 mt-1">
                          {[
                            { hex: '#EF4444', label: 'Tomate Red' },
                            { hex: '#10B981', label: 'Organic Teal' },
                            { hex: '#3B82F6', label: 'Cobalt Blue' },
                            { hex: '#F59E0B', label: 'Lemon Yellow' }
                          ].map(c => (
                            <button
                              key={c.hex}
                              type="button"
                              onClick={() => setPrimaryColor(c.hex)}
                              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                                primaryColor === c.hex ? 'scale-110 border-slate-800 dark:border-white shadow-md' : 'border-transparent'
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={c.label}
                            />
                          ))}
                          <input 
                            type="color" 
                            value={primaryColor} 
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer rounded-full"
                          />
                        </div>
                      </div>

                      {/* Theme mode toggle */}
                      <div className="flex flex-col gap-1 mt-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Thème par défaut</label>
                        <div className="flex gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setThemeMode('Light')}
                            className={`flex-1 py-1.5 rounded-lg border font-bold text-center transition ${
                              themeMode === 'Light' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-450 hover:bg-slate-50'
                            }`}
                          >
                            Mode Clair
                          </button>
                          <button
                            type="button"
                            onClick={() => setThemeMode('Dark')}
                            className={`flex-1 py-1.5 rounded-lg border font-bold text-center transition ${
                              themeMode === 'Dark' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-450 hover:bg-slate-50'
                            }`}
                          >
                            Mode Sombre
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Preview Widget */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 p-4 rounded-2xl flex flex-col gap-3.5 shadow-inner">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Aperçu Espace Client</span>
                      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl p-3.5 flex items-center gap-3 shadow-sm">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-extrabold text-sm"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {companyName ? companyName.slice(0, 2).toUpperCase() : 'CO'}
                        </div>
                        <div className="leading-none flex-1 min-w-0">
                          <h5 className="font-extrabold text-xs text-slate-850 dark:text-white truncate">{companyName || 'Nom Entreprise'}</h5>
                          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{companySlug || 'slug'}.platform.com</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: '70%', backgroundColor: primaryColor }} />
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 3: Workspace Config */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-4 animate-[fadeIn_0.15s_ease-out]">
                  <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Workspace & Configuration Régionale</h4>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Adresse URL de l'Espace (Company Slug) *</label>
                    <div className="flex items-stretch border border-slate-205 dark:border-slate-800 rounded-lg overflow-hidden bg-transparent">
                      <span className="bg-slate-100 dark:bg-slate-800 px-3 py-2 text-slate-450 border-r border-slate-205 dark:border-slate-800 font-mono text-[10px] flex items-center">https://</span>
                      <input 
                        type="text" 
                        required
                        value={companySlug}
                        onChange={(e) => setCompanySlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                        placeholder="nomslug"
                        className="flex-1 p-2 outline-none bg-transparent font-mono dark:text-white"
                      />
                      <span className="bg-slate-100 dark:bg-slate-800 px-3 py-2 text-slate-450 border-l border-slate-205 dark:border-slate-800 font-mono text-[10px] flex items-center">.platform.com</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Langue</label>
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white dark:bg-slate-900"
                      >
                        <option value="Français">Français</option>
                        <option value="English">English</option>
                        <option value="العربية">العربية</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Fuseau Horaire</label>
                      <select 
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white dark:bg-slate-900"
                      >
                        <option value="GMT+1">GMT+1 (Europe/Tunis)</option>
                        <option value="GMT+0">GMT+0 (London/UTC)</option>
                        <option value="GMT+2">GMT+2 (Paris/Cairo)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Devise</label>
                      <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white dark:bg-slate-900"
                      >
                        <option value="EUR">EUR (TND)</option>
                        <option value="TND">TND (DT)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Format Date</label>
                      <select 
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                        className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white dark:bg-slate-900"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Administrator User */}
              {currentStep === 4 && (
                <div className="flex flex-col gap-3.5 animate-[fadeIn_0.15s_ease-out]">
                  <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Administrateur Espace Client</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Prénom *</label>
                      <input 
                        type="text" 
                        required
                        value={adminFirstName}
                        onChange={(e) => setAdminFirstName(e.target.value)}
                        placeholder="Ex: Ahmed"
                        className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Nom *</label>
                      <input 
                        type="text" 
                        required
                        value={adminLastName}
                        onChange={(e) => setAdminLastName(e.target.value)}
                        placeholder="Ex: Bensaid"
                        className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">E-mail de Connexion Admin *</label>
                    <input 
                      type="email" 
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="Ex: admin@sicam.com"
                      className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Mot de Passe par défaut *</label>
                    <input 
                      type="password" 
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="p-2 border border-slate-205 dark:border-slate-800 rounded-lg outline-none bg-transparent dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: Subscription pricing plan */}
              {currentStep === 5 && (
                <div className="flex flex-col gap-3.5 animate-[fadeIn_0.15s_ease-out]">
                  <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Abonnement & Restrictions</h4>
                  
                  {/* Selector cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'Basic', label: 'Starter', price: plansConfig.Basic, features: 'Core CMMS, Mobile Lite' },
                      { key: 'Premium', label: 'Professional', price: plansConfig.Premium, features: 'Advanced Analytics, LOTO' },
                      { key: 'Enterprise', label: 'Enterprise', price: plansConfig.Enterprise, features: 'Multi-site, Custom API, Dedicated VM' }
                    ].map(p => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => handlePlanChange(p.key as any)}
                        className={`p-3 bg-white/50 dark:bg-slate-900 border rounded-xl flex flex-col text-left justify-between h-32 transition hover-lift ${
                          subPlan === p.key ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div>
                          <span className="font-extrabold text-xs block text-slate-800 dark:text-white">{p.label}</span>
                          <span className="text-[10px] text-slate-400 block mt-1 font-semibold leading-snug">{p.features}</span>
                        </div>
                        <span className="font-black text-slate-800 dark:text-white text-sm font-mono mt-auto">{p.price} TND<span className="text-[9px] font-normal">/m</span></span>
                      </button>
                    ))}
                  </div>

                  {/* Limits summary */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl grid grid-cols-3 gap-4 text-center mt-1">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Capacité Stockage</span>
                      <span className="font-extrabold text-slate-800 dark:text-white text-xs block mt-0.5">{storageLimit}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Utilisateurs Max</span>
                      <span className="font-extrabold text-slate-800 dark:text-white text-xs block mt-0.5">{maxUsers} comptes</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Équipements Max</span>
                      <span className="font-extrabold text-slate-800 dark:text-white text-xs block mt-0.5">{maxEquipment} machines</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Review & Success Animation */}
              {currentStep === 6 && (
                <div className="flex flex-col gap-4 animate-[fadeIn_0.15s_ease-out]">
                  {creationSuccess ? (
                    <div className="py-8 text-center flex flex-col items-center gap-3">
                      <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
                      <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Espace Client Provisionné !</h3>
                      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                        Le tenant <strong>{companySlug}</strong> a été créé activement. L'environnement starter de maintenance a été initialisé.
                      </p>
                    </div>
                  ) : creationLoading ? (
                    <div className="py-12 text-center flex flex-col items-center gap-3">
                      <Hourglass className="w-12 h-12 text-primary animate-spin" />
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Initialisation de l'espace...</h4>
                      <p className="text-[10px] text-slate-400">Création des bases, rôles et modèle de chaudière.</p>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Synthèse de Configuration</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Company Card */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Entreprise</span>
                          <h5 className="font-extrabold text-slate-800 dark:text-white text-sm mt-1">{companyName}</h5>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{companySlug}.platform.com</span>
                          <span className="text-[10px] block text-slate-500 mt-1 font-semibold">{city}, {country}</span>
                        </div>

                        {/* Admin Card */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Administrateur</span>
                          <h5 className="font-extrabold text-slate-800 dark:text-white text-sm mt-1">{adminFirstName} {adminLastName}</h5>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{adminEmail}</span>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Password: ••••••••</span>
                        </div>
                      </div>

                      {/* Brand & plan details */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-350">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: primaryColor }} />
                          <span>Accent {primaryColor}</span>
                          <span className="text-slate-300">|</span>
                          <span>Langue: {language}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Forfait Choisi</span>
                          <span className="text-primary font-extrabold uppercase text-xs">{subPlan} Plan</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setShowCreateWizard(false)}
                disabled={creationLoading}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 cursor-pointer disabled:opacity-50"
              >
                Fermer
              </button>

              <div className="flex gap-2">
                {currentStep > 1 && !creationSuccess && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    disabled={creationLoading}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Retour</span>
                  </button>
                )}

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={
                      (currentStep === 1 && (!companyName || !taxNumber)) ||
                      (currentStep === 3 && !companySlug) ||
                      (currentStep === 4 && (!adminFirstName || !adminLastName || !adminEmail || !adminPassword))
                    }
                    className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/95 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <span>Suivant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  !creationSuccess && (
                    <button
                      type="button"
                      onClick={handleWizardSubmit}
                      disabled={creationLoading}
                      className="px-5 py-2 bg-emerald-500 text-white font-bold rounded-xl text-xs hover:bg-emerald-600 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow"
                    >
                      {creationLoading ? 'Création...' : "Créer l'Entreprise"}
                      <Check className="w-4 h-4" />
                    </button>
                  )
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
