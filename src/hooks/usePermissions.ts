import { useGmao } from '../context/GmaoContext';
import { AppRole, AppModule, DataScope } from '../config/permissions';

export function usePermissions() {
  const { currentUser, rolePermissions } = useGmao();
  
  // Provide a safe fallback if currentUser or role is undefined
  const rawRole = currentUser?.role ?? 'Technicien';
  
  // If user is SuperAdmin, they get a full pass. But SuperAdmin is not in rolePermissions.
  // We'll treat SuperAdmin as having full access here.
  const role = rawRole as AppRole | 'SuperAdmin' | 'Read-Only User';
  
  // Get the dynamic role definition from context, or fallback to an empty object
  const roleDef = rolePermissions[role as AppRole] || {};

  /**
   * Can the current user access this module?
   */
  const canAccess = (moduleName: string): boolean => {
    if (role === 'SuperAdmin') return true;
    return !!(roleDef as any)[moduleName];
  };

  /**
   * Can the current user perform a specific action in a module?
   * Usage: canDo('workorders', 'creer')
   */
  const canDo = (moduleName: AppModule, action: string): boolean => {
    if (role === 'SuperAdmin') return true;
    const mod = (roleDef as any)[moduleName];
    if (!mod) return false;
    return mod.actions.includes(action);
  };

  /**
   * Get the data scope for a module
   */
  const getScope = (moduleName: AppModule): DataScope => {
    if (role === 'SuperAdmin') return 'toute_usine';
    const mod = (roleDef as any)[moduleName];
    return mod ? mod.scope : 'mes_donnees';
  };

  /**
   * Role checkers — convenience shortcuts
   */
  const isAdmin = role === 'CompanyAdmin' || role === 'SuperAdmin';
  const isResponsable = role === 'Responsable Maintenance';
  const isChefEquipe = role === "Chef d'équipe";
  const isTechnicien = role === 'Technicien';
  const isProduction = role === 'Production';
  
  /** Admins + Responsable only */
  const isManagerLevel = isAdmin || isResponsable;
  
  /** Can supervise: Admin, Responsable, Chef d'équipe */
  const canSupervise = isAdmin || isResponsable || isChefEquipe;

  return {
    role,
    canAccess,
    canDo,
    getScope,
    isAdmin,
    isResponsable,
    isChefEquipe,
    isTechnicien,
    isProduction,
    isManagerLevel,
    canSupervise,
  };
}
