export type AppRole =
  | 'SuperAdmin'
  | 'CompanyAdmin'
  | 'Responsable Maintenance'
  | "Chef d'équipe"
  | 'Technicien'
  | 'Production';

export type DataScope = 'mes_donnees' | 'mon_equipe' | 'toute_usine';

export type AppModule = 
  | 'dashboard' 
  | 'equipment' 
  | 'preventive' 
  | 'corrective' 
  | 'workorders' 
  | 'inventory' 
  | 'suppliers' 
  | 'reports' 
  | 'admin';

export interface ModulePermissions {
  actions: string[];
  scope: DataScope;
}

export type RoleDefinition = Partial<Record<AppModule, ModulePermissions>>;

export const DEFAULT_ROLE_PERMISSIONS: Partial<Record<AppRole, RoleDefinition>> = {
  'Responsable Maintenance': {
    dashboard: { actions: ['voir'], scope: 'toute_usine' },
    equipment: { actions: ['voir', 'creer', 'modifier', 'importer', 'exporter'], scope: 'toute_usine' },
    preventive: { actions: ['voir', 'creer', 'modifier', 'lancer', 'suspendre', 'approuver'], scope: 'toute_usine' },
    corrective: { actions: ['voir', 'creer', 'modifier', 'valider', 'rejeter', 'planifier', 'creer_ot'], scope: 'toute_usine' },
    workorders: { actions: ['voir', 'creer', 'modifier', 'assigner', 'demarrer', 'suspendre', 'terminer', 'cloturer', 'exporter'], scope: 'toute_usine' },
    inventory: { actions: ['voir', 'creer', 'modifier', 'entree', 'sortie', 'inventaire'], scope: 'toute_usine' },
    suppliers: { actions: ['voir', 'creer', 'modifier'], scope: 'toute_usine' },
    reports: { actions: ['voir', 'exporter_pdf', 'exporter_excel', 'creer_rapport'], scope: 'toute_usine' }
  },
  "Chef d'équipe": {
    dashboard: { actions: ['voir'], scope: 'mon_equipe' },
    equipment: { actions: ['voir', 'modifier'], scope: 'toute_usine' },
    preventive: { actions: ['voir', 'creer', 'modifier', 'lancer', 'suspendre'], scope: 'mon_equipe' },
    corrective: { actions: ['voir', 'creer', 'valider', 'creer_ot'], scope: 'mon_equipe' },
    workorders: { actions: ['voir', 'creer', 'modifier', 'assigner', 'cloturer'], scope: 'mon_equipe' },
    inventory: { actions: ['voir', 'entree', 'sortie'], scope: 'toute_usine' },
    reports: { actions: ['voir', 'exporter_pdf', 'exporter_excel'], scope: 'mon_equipe' }
  },
  'Technicien': {
    dashboard: { actions: ['voir'], scope: 'mes_donnees' },
    equipment: { actions: ['voir'], scope: 'toute_usine' },
    preventive: { actions: ['voir', 'executer'], scope: 'mes_donnees' },
    corrective: { actions: ['voir', 'creer'], scope: 'mes_donnees' },
    workorders: { actions: ['voir', 'demarrer', 'suspendre', 'terminer'], scope: 'mes_donnees' },
    inventory: { actions: ['voir'], scope: 'toute_usine' }
  },
  'Production': {
    dashboard: { actions: ['voir'], scope: 'mes_donnees' },
    corrective: { actions: ['voir', 'creer'], scope: 'mes_donnees' }
  }
};
