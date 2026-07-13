import React from 'react';
import { ShieldOff, ChevronLeft } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';

interface AccessGuardProps {
  page: string;
  onNavigate?: (screen: string) => void;
  children: React.ReactNode;
}

const roleLabels: Record<string, string> = {
  'CompanyAdmin': 'Administrateur',
  'Responsable Maintenance': 'Responsable Maintenance',
  "Chef d'équipe": "Chef d'équipe",
  'Technicien': 'Technicien',
  'Production': 'Opérateur Production',
  'SuperAdmin': 'Super Admin',
};

/**
 * Wraps a page to conditionally render based on role access.
 * If user doesn't have permission, shows a stylized "Access Denied" screen.
 */
export const AccessGuard: React.FC<AccessGuardProps> = ({ page, onNavigate, children }) => {
  const { canAccess, role } = usePermissions();

  if (!canAccess(page)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-6 max-w-md text-center p-8">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <ShieldOff className="w-10 h-10 text-rose-500" />
          </div>

          {/* Message */}
          <div className="flex flex-col gap-2">
            <h2 className="font-black text-xl text-slate-800 dark:text-white">
              Accès Non Autorisé
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Votre rôle <span className="font-bold text-primary">{roleLabels[role] || role}</span> ne vous autorise pas à accéder à cette section.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Contactez votre administrateur pour obtenir les droits nécessaires.
            </p>
          </div>

          {/* Role Badge */}
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Votre rôle actuel
            </span>
            <div className="font-black text-sm text-slate-800 dark:text-white mt-0.5">
              {roleLabels[role] || role}
            </div>
          </div>

          {/* Back button */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Retourner au Tableau de Bord
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
