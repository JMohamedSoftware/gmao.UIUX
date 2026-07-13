import React, { useState, useEffect } from 'react';
import { useGmao } from '../context/GmaoContext';
import { User } from '../context/GmaoContext';
import { UserCircle2, KeyRound, ArrowRight, ShieldCheck, Bug } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { login } = useGmao();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isHovering, setIsHovering] = useState(false);

  // Auto login helper for headless Chrome print pipelines
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const autologinParam = queryParams.get('autologin') || '';
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
  }, [login, onLoginSuccess]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email === 'admin@gmao-saas.com') {
      const success = login(email, password, undefined, 'SuperAdmin');
      if (success) {
        onLoginSuccess();
      } else {
        setError("Mot de passe incorrect.");
      }
    } else {
      const success = login(email, password, 'tenant-midi', 'CompanyAdmin');
      if (success) {
        onLoginSuccess();
      } else {
        setError("Identifiant ou mot de passe incorrect.");
      }
    }
  };

  const handleQuickLogin = (role: User['role'], emailForRole: string, isSuperAdmin = false) => {
    const success = login(emailForRole, undefined, isSuperAdmin ? undefined : 'tenant-midi', role);
    if (success) onLoginSuccess();
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-slate-900 font-sans">
      
      {/* Background Image - Left Side Full Bleed */}
      <div 
        className="absolute inset-0 w-[60%] lg:w-[65%] h-full bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-105" 
        style={{ backgroundImage: "url('/tomate.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      </div>

      {/* The Organic Blob Split (Right Side) */}
      <div 
        className="absolute top-0 bottom-0 right-0 w-full lg:w-[50%] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center p-8 lg:p-16 transition-all duration-1000"
        style={{
          // Creates an organic, wavy separation instead of a straight line
          clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%, 8% 50%)"
        }}
      >
        {/* Decorative elements behind the form */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-rose-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-32 left-0 w-80 h-80 bg-amber-500/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 flex flex-col gap-8 ml-[10%]">
          
          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-red-700 p-1 shadow-lg shadow-rose-500/30">
                <img 
                  src="/tomate-rouge-juteuse-gouttes-eau_191095-79653.avif" 
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-full border-2 border-white/50"
                />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">POMODORO</h1>
                <p className="text-rose-600 dark:text-rose-400 font-bold tracking-widest uppercase text-xs">Portail Industriel</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-200 mt-4 leading-tight">
              Bienvenue sur <br/><span className="text-rose-500">votre espace</span>
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6 mt-4">
            
            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-500/50 text-rose-600 dark:text-rose-400 p-4 rounded-2xl flex items-center gap-3 animate-[shake_0.5s_ease-in-out]">
                <ShieldCheck className="w-6 h-6 flex-shrink-0" />
                <span className="font-bold">{error}</span>
              </div>
            )}

            {/* Email Field with Giant Icon */}
            <div className="group relative">
              <div className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-l-[2rem] border-y border-l border-slate-200 dark:border-slate-700 group-focus-within:bg-rose-50 dark:group-focus-within:bg-rose-500/10 group-focus-within:border-rose-500 transition-colors z-10">
                <UserCircle2 className="w-8 h-8 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
              </div>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre identifiant"
                className="w-full h-16 pl-20 pr-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-lg text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 transition-all shadow-sm relative z-0"
              />
            </div>

            {/* Password Field with Giant Icon */}
            <div className="group relative">
              <div className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-l-[2rem] border-y border-l border-slate-200 dark:border-slate-700 group-focus-within:bg-rose-50 dark:group-focus-within:bg-rose-500/10 group-focus-within:border-rose-500 transition-colors z-10">
                <KeyRound className="w-8 h-8 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
              </div>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full h-16 pl-20 pr-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-lg text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 transition-all shadow-sm font-mono tracking-widest relative z-0"
              />
            </div>

            {/* Giant Submit Button */}
            <button
              type="submit"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="mt-4 w-full h-16 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white rounded-[2rem] text-xl font-black flex items-center justify-between px-8 shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>Accéder</span>
              <div className={`w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm transition-transform duration-300 ${isHovering ? 'translate-x-2' : ''}`}>
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </button>
          </form>

          {/* Dev Quick Logins (Subtle) */}
          <div className="mt-12 pt-6 border-t border-slate-200/50 dark:border-slate-800 flex flex-wrap justify-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
            <span className="w-full text-center text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 flex items-center justify-center gap-1">
              <Bug className="w-3 h-3" /> Mode Développeur
            </span>
            <button onClick={() => handleQuickLogin('SuperAdmin', 'admin@gmao-saas.com', true)} className="px-3 py-1 bg-rose-100 dark:bg-rose-900/40 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-200 transition-colors">SuperAdmin</button>
            <button onClick={() => handleQuickLogin('CompanyAdmin', 'admin@midi.com')} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 transition-colors">CompanyAdmin</button>
            <button onClick={() => handleQuickLogin('Production', 'prod@midi.com')} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 transition-colors">Production</button>
            <button onClick={() => handleQuickLogin('Responsable Maintenance', 'resp@midi.com')} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 transition-colors">Responsable</button>
            <button onClick={() => handleQuickLogin("Chef d'équipe", 'chef@midi.com')} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 transition-colors">Chef d'équipe</button>
            <button onClick={() => handleQuickLogin('Technicien', 'tech@midi.com')} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 transition-colors">Technicien</button>
          </div>

        </div>
      </div>

    </div>
  );
};
