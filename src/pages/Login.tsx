import React, { useState, useEffect } from 'react';
import { useGmao, User, Tenant } from '../context/GmaoContext';
import { ShieldAlert, Mail, Lock, ArrowRight, UserCheck, ChevronRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { login, tenants } = useGmao();
  
  // URL routing scoping variables
  const queryParams = new URLSearchParams(window.location.search);
  const tenantParam = queryParams.get('tenant') || queryParams.get('company') || '';
  const autologinParam = queryParams.get('autologin') || '';
  
  const isLockedSuperAdmin = !!tenantParam && (tenantParam.toLowerCase() === 'admin' || tenantParam.toLowerCase() === 'superadmin');
  const isLockedTenant = !!tenantParam && !isLockedSuperAdmin;

  // Locate URL matched tenant
  const activeTenant = tenants.find(t => 
    t.id.toLowerCase() === tenantParam.toLowerCase() || 
    t.domain.toLowerCase().includes(tenantParam.toLowerCase()) ||
    t.name.toLowerCase().replace(/[^a-z0-9]/g, '') === tenantParam.toLowerCase()
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto login helper for headless Chrome print pipelines
  useEffect(() => {
    if (autologinParam) {
      if (autologinParam === 'admin' || autologinParam === 'superadmin') {
        const ok = login('admin@gmao-saas.com', undefined, undefined, 'SuperAdmin');
        if (ok) onLoginSuccess();
      } else if (autologinParam === 'midi') {
        const ok = login('admin@midi.com', undefined, 'tenant-midi', 'CompanyAdmin');
        if (ok) onLoginSuccess();
      } else if (autologinParam === 'nord') {
        const ok = login('admin@nord.com', undefined, 'tenant-nord', 'CompanyAdmin');
        if (ok) onLoginSuccess();
      }
    }
  }, [autologinParam]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Veuillez saisir un e-mail et un mot de passe.');
      return;
    }
    
    if (isLockedSuperAdmin) {
      const success = login(email, password, undefined, 'SuperAdmin');
      if (success) {
        onLoginSuccess();
      } else {
        setErrorMsg('Identifiants invalides.');
      }
    } else {
      const tenantId = activeTenant ? activeTenant.id : 'tenant-midi'; // default for simulation if none provided
      const success = login(email, password, tenantId, 'CompanyAdmin');
      if (success) {
        onLoginSuccess();
      } else {
        setErrorMsg('Identifiants invalides ou espace suspendu.');
      }
    }
  };

  const handleQuickLogin = (role: User['role'], tenantId: string) => {
    const emailMap: Record<string, string> = {
      'tenant-midi:CompanyAdmin': 'admin@midi.com',
      'tenant-midi:Responsable Maintenance': 'k.gherbi@midi.com',
      "tenant-midi:Chef d'équipe": 'j.bricole@midi.com',
      'tenant-midi:Technicien': 'a.bensaid@midi.com',
      'tenant-midi:Production': 'y.mansouri@midi.com',
      
      'tenant-nord:CompanyAdmin': 'admin@nord.com',
      'tenant-nord:Responsable Maintenance': 'j.dupont@nord.com',
      'tenant-nord:Technicien': 'm.martin@nord.com',
      'tenant-nord:Production': 'y.mansouri@nord.com',
      
      'superadmin:SuperAdmin': 'admin@gmao-saas.com'
    };
    
    const key = tenantId === 'superadmin' ? 'superadmin:SuperAdmin' : `${tenantId}:${role}`;
    const emailForRole = emailMap[key] || `user@${tenantId}.com`;
    
    const success = login(emailForRole, undefined, tenantId === 'superadmin' ? undefined : tenantId, role);
    if (success) {
      onLoginSuccess();
    } else {
      setErrorMsg('Échec de la simulation.');
    }
  };

  // Determine dynamic colors for login page theming
  const getThemeColors = () => {
    if (isLockedSuperAdmin) {
      return { primary: '#F59E0B', secondary: '#0F172A', name: 'Super Admin Desk' }; 
    }
    if (activeTenant) {
      if (activeTenant.id === 'tenant-midi') {
        return { primary: '#EF4444', secondary: '#F97316', name: activeTenant.name }; 
      } else if (activeTenant.id === 'tenant-nord') {
        return { primary: '#10B981', secondary: '#3B82F6', name: activeTenant.name }; 
      }
      return { primary: '#2563EB', secondary: '#0EA5E9', name: activeTenant.name };
    }
    return { primary: '#EF4444', secondary: '#F97316', name: 'POMODORO CMMS' }; 
  };

  const themeConfig = getThemeColors();

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-sans relative overflow-hidden bg-slate-900">
      
      {/* Inject custom variables dynamically to override standard Tailwind theme colors */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --color-primary: ${themeConfig.primary} !important;
          --color-secondary: ${themeConfig.secondary} !important;
        }
      ` }} />

      {/* Full Page Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60" 
        style={{ backgroundImage: "url('/tomate.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Center Container */}
      <div className="relative z-10 w-full max-w-lg p-6">
        
        {/* Glassmorphism Card */}
        <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-[2rem] p-8 shadow-2xl overflow-hidden relative">
          
          {/* Subtle gradient glow inside card */}
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center gap-4 mb-8 relative z-10">
            <div className="w-20 h-20 rounded-full bg-white/20 p-1 shadow-lg backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/30">
              <img 
                src="/tomate-rouge-juteuse-gouttes-eau_191095-79653.avif" 
                alt="Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="text-center">
              <h1 className="font-extrabold text-2xl tracking-tight text-white drop-shadow-md">
                {themeConfig.name}
              </h1>
              <p className="text-xs text-slate-300 mt-1 font-medium tracking-wide">
                Portail d'Authentification
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-100 text-xs flex items-center gap-2 backdrop-blur-sm relative z-10">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Unified Login Form */}
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5 relative z-10">
            <div className="flex flex-col gap-1.5">
              <label className="text-white/80 font-bold uppercase tracking-wider text-[10px] ml-1">
                Adresse E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="email"
                  required
                  placeholder="admin@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3.5 pl-11 pr-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-white/40 focus:bg-black/30 transition-all font-semibold text-white placeholder:text-white/30 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-white/80 font-bold uppercase tracking-wider text-[10px] ml-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3.5 pl-11 pr-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-white/40 focus:bg-black/30 transition-all font-semibold text-white placeholder:text-white/30 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-extrabold rounded-2xl shadow-[0_0_20px_rgba(var(--color-primary),0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98] mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Se Connecter</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Comptes de Test - All Actor Accounts */}
          <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
            <span className="text-[10px] text-white/60 font-bold uppercase block mb-3 text-center tracking-widest">
              Comptes de Démonstration
            </span>

            {/* SuperAdmin */}
            <div className="mb-3">
              <span className="text-[9px] font-bold text-amber-400/80 uppercase tracking-widest block mb-1.5 ml-1">🛡 Super Admin</span>
              <button
                onClick={() => handleQuickLogin('SuperAdmin', 'superadmin')}
                className="w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/20 rounded-xl flex justify-between items-center text-white/80 font-semibold text-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white/90 font-bold text-[11px]">Admin Plateforme SaaS</div>
                    <div className="text-white/40 text-[9px] font-mono">admin@gmao-saas.com</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
              </button>
            </div>

            {/* Conserves du Midi */}
            <div className="mb-3">
              <span className="text-[9px] font-bold text-rose-400/80 uppercase tracking-widest block mb-1.5 ml-1">🏭 Conserves du Midi</span>
              <div className="flex flex-col gap-1.5">
                {[
                  { role: 'CompanyAdmin' as const, label: 'Admin Entreprise', icon: <UserCheck className="w-3.5 h-3.5 text-rose-400" />, email: 'admin@midi.com', color: 'rose' },
                  { role: 'Responsable Maintenance' as const, label: 'Resp. Maintenance', icon: <UserCheck className="w-3.5 h-3.5 text-emerald-400" />, email: 'k.gherbi@midi.com', color: 'emerald' },
                  { role: "Chef d'équipe" as User['role'], label: "Chef d'équipe", icon: <UserCheck className="w-3.5 h-3.5 text-orange-400" />, email: 'j.bricole@midi.com', color: 'orange' },
                  { role: 'Technicien' as const, label: 'Technicien', icon: <UserCheck className="w-3.5 h-3.5 text-sky-400" />, email: 'a.bensaid@midi.com', color: 'sky' },
                  { role: 'Production' as const, label: 'Opérateur Production', icon: <UserCheck className="w-3.5 h-3.5 text-violet-400" />, email: 'y.mansouri@midi.com', color: 'violet' },
                ].map(acc => (
                  <button
                    key={acc.role}
                    onClick={() => handleQuickLogin(acc.role, 'tenant-midi')}
                    className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex justify-between items-center text-white/80 font-semibold text-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0`}>
                        {acc.icon}
                      </div>
                      <div className="text-left">
                        <div className="text-white/90 font-bold text-[11px]">{acc.label}</div>
                        <div className="text-white/40 text-[9px] font-mono">{acc.email}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                  </button>
                ))}
              </div>
            </div>


            {/* Tomates du Nord */}
            <div>
              <span className="text-[9px] font-bold text-teal-400/80 uppercase tracking-widest block mb-1.5 ml-1">🏭 Tomates du Nord</span>
              <div className="flex flex-col gap-1.5">
                {[
                  { role: 'CompanyAdmin' as const, label: 'Admin Entreprise', icon: <UserCheck className="w-3.5 h-3.5 text-teal-400" />, email: 'admin@nord.com' },
                  { role: 'Responsable Maintenance' as const, label: 'Resp. Maintenance', icon: <UserCheck className="w-3.5 h-3.5 text-emerald-400" />, email: 'j.dupont@nord.com' },
                  { role: 'Technicien' as const, label: 'Technicien', icon: <UserCheck className="w-3.5 h-3.5 text-sky-400" />, email: 'm.martin@nord.com' },
                  { role: 'Production' as const, label: 'Opérateur Production', icon: <UserCheck className="w-3.5 h-3.5 text-violet-400" />, email: 'y.mansouri@nord.com' },
                ].map(acc => (
                  <button
                    key={acc.role}
                    onClick={() => handleQuickLogin(acc.role, 'tenant-nord')}
                    className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex justify-between items-center text-white/80 font-semibold text-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        {acc.icon}
                      </div>
                      <div className="text-left">
                        <div className="text-white/90 font-bold text-[11px]">{acc.label}</div>
                        <div className="text-white/40 text-[9px] font-mono">{acc.email}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-[10px] text-center text-white/40 font-semibold mt-6 tracking-wide drop-shadow-md">
          POMODORO CMMS v2.1 • Solution certifiée ISO 55001
        </p>

      </div>
    </div>
  );
};
