import React, { useState } from 'react';
import { useGmao, User, UserAccount } from '../context/GmaoContext';
import { usePermissions } from '../hooks/usePermissions';
import { AppRole, AppModule, DataScope } from '../config/permissions';
import { 
  Users, 
  ShieldAlert, 
  Settings, 
  Globe, 
  Mail, 
  Bell, 
  Save, 
  Check, 
  ShieldCheck, 
  CheckCircle2,
  Trash2,
  UserPlus,
  X,
  UserCheck,
  UserMinus,
  Phone,
  Calendar,
  Briefcase,
  Edit2,
  Clock
} from 'lucide-react';

export const Admin: React.FC = () => {
  const { technicians, currentUser, darkMode, toggleDarkMode, tenants, currentTenantId, addUser, rolePermissions, updateRolePermission } = useGmao();
  const { canDo } = usePermissions();
  
  const [successSaved, setSuccessSaved] = useState(false);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [emailAlerts, setEmailAlerts] = useState(true);
  
  const [selectedRole, setSelectedRole] = useState<AppRole>('Technicien');

  // Active users registry list
  const activeTenant = tenants.find(t => t.id === currentTenantId);
  const users = activeTenant?.users || [];

  // Roles permissions matrices
  const [permissions, setPermissions] = useState({
    'Administrateur': { creerDi: true, validerDi: true, creerOt: true, modifierOt: true, executerOt: true, cloturerOt: true, preventif: true, equipements: true, stock: true, fournisseurs: true, rapports: true, administration: true },
    'Responsable Maintenance': { creerDi: true, validerDi: true, creerOt: true, modifierOt: true, executerOt: true, cloturerOt: true, preventif: true, equipements: true, stock: true, fournisseurs: true, rapports: true, administration: false },
    'Chef d\'équipe': { creerDi: true, validerDi: true, creerOt: true, modifierOt: true, executerOt: true, cloturerOt: true, preventif: true, equipements: true, stock: false, fournisseurs: false, rapports: true, administration: false },
    'Technicien': { creerDi: false, validerDi: false, creerOt: false, modifierOt: false, executerOt: true, cloturerOt: false, preventif: true, equipements: true, stock: false, fournisseurs: false, rapports: false, administration: false },
    'Production': { creerDi: true, validerDi: false, creerOt: false, modifierOt: false, executerOt: false, cloturerOt: false, preventif: false, equipements: false, stock: false, fournisseurs: false, rapports: false, administration: false }
  });

  const handleTogglePermission = (role: string, field: string) => {
    setPermissions(prev => {
      const rolePerms: any = { ...prev[role as keyof typeof prev] };
      rolePerms[field] = !rolePerms[field];
      return { ...prev, [role]: rolePerms };
    });
  };


  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessSaved(true);
    setTimeout(() => setSuccessSaved(false), 2500);
  };

  // Appearance color selectors
  // Add user modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Technicien', phone: '', department: '', status: 'Actif', avatar: '' });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({ 
      ...newUser, 
      status: newUser.status, 
      avatar: newUser.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString().split('T')[0]
    });
    setIsAddUserOpen(false);
    setNewUser({ name: '', email: '', password: '', role: 'Technicien', phone: '', department: '', status: 'Actif', avatar: '' });
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation would update the user context
    setIsEditUserOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Administration du Système
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            Gestion des habilitations, profils utilisateurs, langues et préférences graphiques
          </p>
        </div>
        
        {successSaved && (
          <div className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Paramètres enregistrés !</span>
          </div>
        )}
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Utilisateurs</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">{users.length}</p>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Actifs</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">{users.filter(u => u.status === 'Actif').length}</p>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
            <UserMinus className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Inactifs</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">{users.filter(u => u.status === 'Inactif').length}</p>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Administrateurs</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">{users.filter(u => u.role === 'Administrateur').length || 1}</p>
          </div>
        </div>
      </div>

      {/* Users directory & Permission grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: User Directory */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-primary" />
                Répertoire des Utilisateurs
              </h3>
              {canDo('admin', 'gerer_utilisateurs') && (
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="text-[10px] flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Ajouter
              </button>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              {users.map((u, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-white/40 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/40 rounded-custom-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold hover:border-primary/20"
                >
                  <div className="flex items-center gap-3 w-1/3">
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-white shadow-sm" />
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{u.name}</h4>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{u.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-1/3 text-[10px] text-slate-500">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5"><Phone className="w-3 h-3"/> {u.phone || '-'}</div>
                      <div className="flex items-center gap-1.5"><Briefcase className="w-3 h-3"/> {u.department || '-'}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Créé: {u.createdAt || '-'}</div>
                      <div className="flex items-center gap-1.5"><Clock className="w-3 h-3"/> Connexion: {u.lastConnection || '-'}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 w-1/3">
                    <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                      {u.role}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${u.status === 'Actif' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                      {u.status}
                    </span>
                    <button 
                      onClick={() => { setEditingUser(u); setIsEditUserOpen(true); }}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Habilitation matrix */}
          <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-secondary" />
                Matrice de Droits & Habilitations
              </h3>
              

            </div>

            {/* Custom checkboxes table -> Now RBAC Matrix */}
            <div className="flex flex-col md:flex-row gap-6 mt-4">
              {/* Left Column: Roles List */}
              <div className="w-full md:w-1/4 flex flex-col gap-2">
                <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-wider">Sélectionner un rôle</p>
                {(Object.keys(rolePermissions) as AppRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`text-left px-4 py-3 rounded-xl font-bold text-sm transition-all border ${selectedRole === role ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary/40'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {/* Right Column: Details for selectedRole */}
              <div className="w-full md:w-3/4 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    Privilèges pour: <span className="text-primary text-xs ml-1">{selectedRole}</span>
                  </p>
                </div>
                
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-500">
                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Module</th>
                        <th className="p-3 border-b border-slate-200 dark:border-slate-800">Actions Permises</th>
                        <th className="p-3 border-b border-slate-200 dark:border-slate-800 text-right">Périmètre (Scope)</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-700 dark:text-slate-300">
                      {(() => {
                        const def = rolePermissions[selectedRole];
                        if (!def) return (<tr><td colSpan={3} className="p-4 text-center">Aucune donnée</td></tr>);
                        
                        const modules = Object.keys(def) as AppModule[];
                        const moduleAvailableActions: Record<AppModule, string[]> = {
                          dashboard: ['voir'],
                          equipment: ['voir', 'creer', 'modifier', 'supprimer', 'importer', 'exporter'],
                          preventive: ['voir', 'creer', 'modifier', 'supprimer', 'lancer', 'suspendre', 'approuver', 'executer'],
                          corrective: ['voir', 'creer', 'modifier', 'supprimer', 'valider', 'rejeter', 'planifier', 'creer_ot'],
                          workorders: ['voir', 'creer', 'modifier', 'supprimer', 'assigner', 'demarrer', 'suspendre', 'terminer', 'cloturer', 'exporter'],
                          inventory: ['voir', 'creer', 'modifier', 'supprimer', 'entree', 'sortie', 'inventaire'],
                          suppliers: ['voir', 'creer', 'modifier', 'supprimer'],
                          reports: ['voir', 'exporter_pdf', 'exporter_excel', 'creer_rapport'],
                          admin: ['voir', 'gerer_utilisateurs', 'gerer_roles', 'parametres']
                        };

                        return modules.map((mod) => {
                          const perms = def[mod];
                          if (!perms) return null;
                          return (
                            <tr key={mod} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                              <td className="p-3 font-bold capitalize align-top w-32">{mod}</td>
                              <td className="p-3 align-top">
                                <div className="flex flex-wrap gap-3">
                                  {moduleAvailableActions[mod]?.map((act) => {
                                    const hasAction = perms.actions.includes(act);
                                    return (
                                      <label key={act} className="flex items-center gap-1.5 cursor-pointer">
                                        <input 
                                          type="checkbox" 
                                          checked={hasAction}
                                          onChange={(e) => updateRolePermission(selectedRole, mod, act, perms.scope, e.target.checked)}
                                          className="rounded text-primary focus:ring-primary w-3.5 h-3.5 border-slate-300 dark:border-slate-600 dark:bg-slate-800" 
                                        />
                                        <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">{act}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="p-3 align-top w-40 text-right">
                                <select 
                                  value={perms.scope}
                                  onChange={(e) => updateRolePermission(selectedRole, mod, perms.actions[0] || 'voir', e.target.value as DataScope, true)}
                                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-bold py-1.5 px-2 focus:ring-primary focus:border-primary w-full outline-none"
                                >
                                  <option value="mes_donnees">Mes Données</option>
                                  <option value="mon_equipe">Mon Équipe</option>
                                  <option value="toute_usine">Toute l'usine</option>
                                </select>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: System Settings & Preference Appearance */}
        <div className="flex flex-col gap-6">
          {/* General Preferences */}
          <div className="glass-panel p-5 rounded-custom-lg border border-white/40 dark:border-slate-800/40 shadow-sm">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Settings className="w-4.5 h-4.5 text-amber-500" />
              Préférences Système
            </h3>

            <form onSubmit={handleSaveSettings} className="flex flex-col gap-4 text-xs font-semibold">
              {/* Language */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  Langue Interface
                </label>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setLanguage('fr')}
                    className={`flex-1 py-2 rounded-lg font-bold border transition ${
                      language === 'fr' 
                        ? 'bg-primary border-primary text-white' 
                        : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-650'
                    }`}
                  >
                    Français (FR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`flex-1 py-2 rounded-lg font-bold border transition ${
                      language === 'en' 
                        ? 'bg-primary border-primary text-white' 
                        : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-650'
                    }`}
                  >
                    English (EN)
                  </button>
                </div>
              </div>

              {/* Alert notifications routes */}
              <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1 mb-1">
                  <Bell className="w-3.5 h-3.5" />
                  Canaux d'Alerte Automatiques
                </label>
                
                <label className="flex items-center justify-between cursor-pointer py-1.5 border-b border-slate-50 dark:border-slate-905">
                  <span className="text-slate-650 dark:text-slate-350">Notifications E-mail</span>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={!canDo('admin', 'gerer_utilisateurs')}
                className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg shadow flex items-center justify-center gap-1.5 hover-lift mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </form>
          </div>


        </div>

      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-slate-900 rounded-custom-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4.5 h-4.5 text-primary" />
                Ajouter un Utilisateur
              </h3>
              <button 
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-5 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Nom Complet *</label>
                  <input type="text" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary" placeholder="Jean Dupont" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Adresse E-mail *</label>
                  <input type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary" placeholder="jean.dupont@entreprise.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Téléphone</label>
                  <input type="text" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary" placeholder="+216 XX XXX XXX" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Département</label>
                  <input type="text" value={newUser.department} onChange={(e) => setNewUser({...newUser, department: e.target.value})} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary" placeholder="Ex: Maintenance" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Mot de Passe *</label>
                  <input type="password" required value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary" placeholder="••••••••" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Confirmer *</label>
                  <input type="password" required className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary" placeholder="••••••••" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Rôle *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary cursor-pointer font-semibold"
                  >
                    {Object.keys(permissions).map(roleOption => (
                      <option key={roleOption} value={roleOption}>{roleOption}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Statut</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary cursor-pointer font-semibold"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500 dark:text-slate-400">Photo URL (Optionnel)</label>
                <input type="text" value={newUser.avatar} onChange={(e) => setNewUser({...newUser, avatar: e.target.value})} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary" placeholder="https://..." />
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirmer l'ajout
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditUserOpen && editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white dark:bg-slate-900 rounded-custom-xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4.5 h-4.5 text-primary" />
                Modifier l'Utilisateur
              </h3>
              <button 
                onClick={() => setIsEditUserOpen(false)}
                className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditUser} className="p-5 flex flex-col gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center gap-3">
                <img src={editingUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{editingUser.name}</div>
                  <div className="text-[10px] text-slate-500">{editingUser.email}</div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500 dark:text-slate-400">Rôle</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary cursor-pointer font-semibold"
                >
                  {Object.keys(permissions).map(roleOption => (
                    <option key={roleOption} value={roleOption}>{roleOption}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-500 dark:text-slate-400">Statut</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary cursor-pointer font-semibold"
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="font-bold text-slate-500 dark:text-slate-400">Nouveau Mot de Passe (optionnel)</label>
                <input 
                  type="password" 
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-primary"
                  placeholder="Laisser vide pour ne pas changer"
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
