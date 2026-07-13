import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppRole, AppModule, DataScope, RoleDefinition, DEFAULT_ROLE_PERMISSIONS } from '../config/permissions';

// ==================================================
// TYPES & INTERFACES
// ==================================================

export interface DocumentInfo {
  name: string;
  type: 'notice' | 'electrical' | 'mechanical' | 'hydraulic' | 'pneumatic';
  size: string;
  url: string;
}

export interface SensorInfo {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  history: number[];
}

export interface Equipment {
  id: string; 
  parentId?: string;
  name: string;
  category: string;
  subFamily: string;
  brand: string;
  model: string;
  serialNumber: string;
  supplierId?: string;
  purchaseDate?: string;
  endOfWarranty?: string;
  inventory?: string;
  responsibility?: string;
  barcode?: string;
  gipPresence?: boolean;
  site?: string;
  building?: string;
  floor?: string;
  room?: string;
  commissionDate: string;
  location: string;
  criticality: 'Faible' | 'Moyenne' | 'Haute' | 'Critique';
  status: 'En service' | 'En panne' | 'En maintenance' | 'Hors service';
  healthIndex: number; 
  lastMaintenance: string;
  nextMaintenance: string;
  hoursCount: number;
  cycleCount: number;
  documents: DocumentInfo[];
  photos: string[];
  sensors: SensorInfo[];
  spareParts: string[]; 
}

export interface PartUsage {
  partRef: string;
  quantity: number;
}

export interface WorkOrder {
  id: string; 
  equipmentId: string;
  title: string;
  description: string;
  type: 'Correctif' | 'Préventif' | 'Curatif' | 'Amélioratif';
  priority: 'Faible' | 'Moyenne' | 'Haute' | 'Critique';
  status: 'Brouillon' | 'En attente' | 'Affecté' | 'En cours' | 'Suspendu' | 'Terminé' | 'Clôturé';
  createdDate: string;
  startDate?: string;
  endDate?: string;
  technicianId?: string;
  assignedBy: string;
  durationMinutes: number;
  diagnostic?: string;
  solution?: string;
  signature?: string; 
  partsUsed: PartUsage[];
  externalCost: number;
  campaign: string;
}

export interface Incident {
  id: string; 
  equipmentId: string;
  description: string;
  reportedBy: string;
  reportedDate: string;
  urgency: 'Faible' | 'Moyenne' | 'Haute' | 'Critique';
  priority?: 'P1' | 'P2' | 'P3' | 'P4';
  technicianId?: string;
  status: 'Nouveau' | 'Validé' | 'Rejeté' | 'Clos' | 'Transformé en OT';
  photo?: string;
  workOrderId?: string;
}

export interface Technician {
  id: string;
  name: string;
  role: 'Électromécanicien' | 'Électricien industriel' | 'Automaticien' | 'Soudeur' | 'Mécanicien';
  qualification: string;
  skills: string[];
  status: 'Disponible' | 'Occupé' | 'Congé';
  hourlyRate: number;
  avatar: string;
}

export interface SparePart {
  ref: string;
  name: string;
  category: string;
  supplierId: string;
  stockCurrent: number;
  stockMin: number;
  stockMax: number;
  unitPrice: number;
  location: string;
  photo?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  contracts: {
    title: string;
    startDate: string;
    endDate: string;
    status: 'Actif' | 'Expiré';
    cost: number;
  }[];
  rating: number; 
}

export interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'En cours' | 'Terminée' | 'Planifiée';
}

export interface Notification {
  id: string;
  type: 'incident' | 'workorder' | 'stock' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface User {
  name: string;
  email: string;
  role: 'SuperAdmin' | 'CompanyAdmin' | 'Responsable Maintenance' | 'Chef d\'équipe' | 'Technicien' | 'Production' | 'Read-Only User';
  avatar: string;
  tenantId?: string;
}

export interface UserAccount {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  status: string;
  avatar: string;
  phone?: string;
  department?: string;
  lastConnection?: string;
  createdAt?: string;
}


// MULTI-TENANT CONTAINER STRUCT
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'Pending' | 'Active' | 'Suspended';
  subscriptionPlan: 'Basic' | 'Premium' | 'Enterprise';
  createdAt: string;
  adminEmail: string;
  capacityTonsPerDay: number;
  
  // Isolated Database
  equipments: Equipment[];
  workOrders: WorkOrder[];
  incidents: Incident[];
  technicians: Technician[];
  parts: SparePart[];
  suppliers: Supplier[];
  campaigns: Campaign[];
  users: UserAccount[];
}

interface GmaoContextType {
  tenants: Tenant[];
  currentTenantId: string | null;
  impersonatedTenantId: string | null;
  equipments: Equipment[];
  workOrders: WorkOrder[];
  incidents: Incident[];
  technicians: Technician[];
  parts: SparePart[];
  suppliers: Supplier[];
  campaigns: Campaign[];
  notifications: Notification[];
  currentUser: User | null;
  darkMode: boolean;
  selectedCampaign: string;
  rolePermissions: Record<AppRole, RoleDefinition>;
  updateRolePermission: (role: AppRole, module: AppModule, action: string, scope: DataScope, isChecked: boolean) => void;
  login: (email: string, password?: string, tenantId?: string, quickRole?: User['role']) => boolean;
  logout: () => void;
  toggleDarkMode: () => void;
  setSelectedCampaign: (camp: string) => void;
  
  // SaaS Admin platform controls
  registerTenant: (name: string, domain: string, adminEmail: string, capacity: number, plan: 'Basic' | 'Premium' | 'Enterprise') => void;
  approveTenant: (id: string) => void;
  suspendTenant: (id: string) => void;
  changeTenantPlan: (id: string, plan: 'Basic' | 'Premium' | 'Enterprise') => void;
  impersonateTenant: (id: string | null) => void;

  // Tenant CRUD actions
  addEquipment: (eq: Omit<Equipment, 'healthIndex' | 'sensors' | 'hoursCount' | 'cycleCount'>) => void;
  updateEquipmentStatus: (id: string, status: Equipment['status'], healthIndex?: number) => void;
  deleteEquipment: (id: string) => void;
  deleteEquipmentsByLocation: (type: string, site?: string, building?: string, floor?: string, room?: string) => void;
  deleteEquipmentsByCategory: (category: string) => void;
  addIncident: (inc: Omit<Incident, 'id' | 'reportedDate' | 'status'>) => Incident;
  updateIncidentStatus: (id: string, status: Incident['status'], workOrderId?: string) => void;
  addWorkOrder: (ot: Omit<WorkOrder, 'id' | 'createdDate' | 'status' | 'partsUsed' | 'durationMinutes' | 'externalCost'>, incidentId?: string) => WorkOrder;
  updateWorkOrderStatus: (id: string, status: WorkOrder['status'], updates?: Partial<WorkOrder>) => void;
  addPartMovement: (ref: string, qty: number, type: 'in' | 'out', otId?: string) => boolean;
  updatePart: (updated: SparePart) => void;
  addSupplier: (sup: Supplier) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addUser: (user: UserAccount) => void;
}

const GmaoContext = createContext<GmaoContextType | undefined>(undefined);

// ==================================================
// INITIAL MOCK DATA TEMPLATES
// ==================================================

const initialSuppliers: Supplier[] = [
  { id: 'SUP-001', name: 'SKF France', contact: 'Jean-Pierre Lemoine', phone: '+33 1 41 88 30 00', email: 'jp.lemoine@skf.com', address: '204 Boulevard de Verdun, Courbevoie', contracts: [{ title: 'Contrat Maintenance Roulements', startDate: '2026-01-01', endDate: '2026-12-31', status: 'Actif', cost: 12000 }], rating: 4.8 },
  { id: 'SUP-002', name: 'Siemens Industrial Solutions', contact: 'Sophie Martin', phone: '+33 821 20 00 21', email: 'sophie.martin@siemens.com', address: '40 Avenue des Fruitiers, Saint-Denis', contracts: [{ title: 'Support Automates PLC Ligne 1 & 2', startDate: '2025-06-01', endDate: '2027-06-01', status: 'Actif', cost: 24000 }], rating: 4.5 },
  { id: 'SUP-003', name: 'Alfa Laval S.A.', contact: 'Marc Dubois', phone: '+33 1 69 59 70 00', email: 'marc.dubois@alfalaval.com', address: 'Espace Lumière, 5 Ruelle des Bouleaux, Saint-Denis', contracts: [{ title: 'Contrat Evaporateurs', startDate: '2026-03-01', endDate: '2027-03-01', status: 'Actif', cost: 35000 }], rating: 4.9 }
];

const initialParts: SparePart[] = [
  { ref: 'REF-BRG-102', name: 'Roulement à billes SKF 6306-2RS', category: 'Roulements', supplierId: 'SUP-001', stockCurrent: 8, stockMin: 15, stockMax: 100, unitPrice: 35.5, location: 'Magasin A - Allée 2', photo: 'https://images.unsplash.com/photo-1634149688402-23f46f497405?w=200&auto=format&fit=crop&q=60' },
  { ref: 'REF-VALV-304', name: 'Vanne d\'arrêt Inox DN50', category: 'Vannes', supplierId: 'SUP-003', stockCurrent: 3, stockMin: 5, stockMax: 20, unitPrice: 185.0, location: 'Magasin B - Allée 1', photo: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=200&auto=format&fit=crop&q=60' },
  { ref: 'REF-PLC-S7', name: 'Module E/S Automate Siemens S7-1500', category: 'Automatisme', supplierId: 'SUP-002', stockCurrent: 1, stockMin: 4, stockMax: 8, unitPrice: 650.0, location: 'Armoire Élec - Box 3', photo: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=200&auto=format&fit=crop&q=60' },
  { ref: 'REF-GASK-EVAP', name: 'Joint EPDM Évaporateur Ø250', category: 'Joints', supplierId: 'SUP-003', stockCurrent: 12, stockMin: 8, stockMax: 40, unitPrice: 28.0, location: 'Magasin A - Allée 4', photo: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&auto=format&fit=crop&q=60' },
  { ref: 'REF-PUMP-SEAL', name: 'Garniture mécanique pompe centrifuge', category: 'Garnitures', supplierId: 'SUP-001', stockCurrent: 2, stockMin: 6, stockMax: 15, unitPrice: 120.0, location: 'Magasin B - Allée 3', photo: 'https://images.unsplash.com/photo-1611078709540-5eafb9b65287?w=200&auto=format&fit=crop&q=60' },
  { ref: 'REF-BELT-COV', name: 'Courroie trapézoïdale convoyeur B-85', category: 'Courroies', supplierId: 'SUP-001', stockCurrent: 6, stockMin: 4, stockMax: 20, unitPrice: 18.5, location: 'Magasin A - Allée 1', photo: 'https://images.unsplash.com/photo-1590487532357-19cb90729352?w=200&auto=format&fit=crop&q=60' },
  { ref: 'REF-FUSE-63A', name: 'Fusible NH 63A Classe gG', category: 'Électrique', supplierId: 'SUP-002', stockCurrent: 20, stockMin: 10, stockMax: 50, unitPrice: 4.2, location: 'Armoire Élec - Box 1', photo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=60' },
  { ref: 'REF-PNEU-CYL', name: 'Vérin pneumatique ISO 15552 Ø63x200', category: 'Pneumatique', supplierId: 'SUP-003', stockCurrent: 2, stockMin: 3, stockMax: 10, unitPrice: 95.0, location: 'Magasin B - Allée 5', photo: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=200&auto=format&fit=crop&q=60' }
];

const initialTechnicians: Technician[] = [
  { id: 'TECH-001', name: 'Ahmed Bensaid', role: 'Électromécanicien', qualification: 'Niveau III', skills: ['Pannes moteur', 'Câblage triphasé', 'Soudure TIG'], status: 'Occupé', hourlyRate: 42, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'TECH-002', name: 'Karim Bricole', role: 'Automaticien', qualification: 'Ingénieur', skills: ['Programmation PLC', 'Scada', 'Boucles PID'], status: 'Occupé', hourlyRate: 55, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'TECH-003', name: 'Sami Trabelsi', role: 'Mécanicien', qualification: 'Niveau II', skills: ['Pompes', 'Convoyeurs', 'Graissage'], status: 'Disponible', hourlyRate: 36, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
  { id: 'TECH-004', name: 'Nour Belhadj', role: 'Électricien industriel', qualification: 'Niveau II', skills: ['Armoires électriques', 'VFD', 'Éclairage'], status: 'Disponible', hourlyRate: 38, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80' }
];

const initialUsers: UserAccount[] = [
  { id: 'USR-01', name: 'Karim Gherbi', email: 'k.gherbi@tomate-industrie.com', role: 'Responsable Maintenance', status: 'Actif', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', phone: '+216 22 123 456', department: 'Maintenance', lastConnection: 'Aujourd\'hui', createdAt: '2025-01-15' },
  { id: 'USR-02', name: 'Jérôme Bricole', email: 'j.bricole@midi.com', role: "Chef d'équipe", status: 'Actif', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', phone: '+216 55 987 654', department: 'Maintenance', lastConnection: 'Hier', createdAt: '2025-02-20' },
  { id: 'USR-03', name: 'Ahmed Bensaid', email: 'a.bensaid@midi.com', role: 'Technicien', status: 'Actif', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', phone: '+216 98 111 222', department: 'Intervention', lastConnection: 'Aujourd\'hui', createdAt: '2025-03-10' },
  { id: 'USR-04', name: 'Youssef Mansouri', email: 'y.mansouri@midi.com', role: 'Production', status: 'Inactif', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', phone: '+216 23 444 555', department: 'Production', lastConnection: 'Il y a 3 jours', createdAt: '2025-06-05' }
];

const initialEquipments: Equipment[] = [
  {
    id: 'LIGNE-1',
    name: 'Ligne Principale de Production',
    category: 'Ligne',
    subFamily: 'Ligne de Tri et Lavage',
    brand: 'FMC Technologies',
    model: 'Line-2000',
    serialNumber: 'LIG-2022-001',
    site: 'USINE DE LINO',
    building: 'BATIMENT NORD',
    floor: 'RDC',
    room: 'Atelier Principal',
    responsibility: 'PRODUCTION',
    gipPresence: true,
    purchaseDate: '2022-01-10',
    endOfWarranty: '2027-01-10',
    barcode: '1234567890123',
    inventory: 'INV-2022-10',
    commissionDate: '2022-04-15',
    location: 'Lavage',
    criticality: 'Critique',
    status: 'En service',
    healthIndex: 94,
    lastMaintenance: '2026-05-10',
    nextMaintenance: '2026-08-10',
    hoursCount: 14250,
    cycleCount: 320,
    documents: [
      { name: 'Plan global Ligne 1.pdf', type: 'notice', size: '4.2 MB', url: '#' },
    ],
    photos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80'],
    sensors: [],
    spareParts: []
  },
  {
    id: 'EQ-BOIL-001',
    parentId: 'LIGNE-1',
    name: 'Chaudière Thermique Babcock VAP 3000',
    category: 'Boilers',
    subFamily: 'Chaudière vapeur gaz',
    brand: 'Babcock Wanson',
    model: 'VAP-3000-G',
    serialNumber: 'BW-2022-8947',
    supplierId: 'SUP-002',
    site: 'USINE DE LINO',
    building: 'BATIMENT NORD',
    floor: 'RDC',
    room: 'Local Technique',
    responsibility: 'TECHNIQUE',
    gipPresence: true,
    purchaseDate: '2022-02-15',
    endOfWarranty: '2026-02-15',
    barcode: '4567891230123',
    inventory: 'INV-2022-11',
    commissionDate: '2022-04-15',
    location: 'Utilités',
    criticality: 'Critique',
    status: 'En service',
    healthIndex: 94,
    lastMaintenance: '2026-05-10',
    nextMaintenance: '2026-08-10',
    hoursCount: 14250,
    cycleCount: 320,
    documents: [
      { name: 'Manuel Exploitation VAP3000.pdf', type: 'notice', size: '4.2 MB', url: '#' },
      { name: 'Schéma Électrique VAP_E03.dwg', type: 'electrical', size: '1.8 MB', url: '#' }
    ],
    photos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80'],
    sensors: [
      { name: 'Pression Vapeur', value: 8.5, unit: 'bar', status: 'normal', history: [8.2, 8.4, 8.5, 8.5, 8.6, 8.5] },
      { name: 'Température Fumées', value: 165.2, unit: '°C', status: 'normal', history: [162.0, 164.5, 165.0, 165.2, 165.8] }
    ],
    spareParts: ['REF-VALV-304', 'REF-SENS-TEMP']
  },
  {
    id: 'EQ-EVAP-001',
    parentId: 'LIGNE-1',
    name: 'Évaporateur Concentrateur AlfaLaval N°1',
    category: 'Evaporators',
    subFamily: 'Concentrateur triple effet',
    brand: 'Alfa Laval',
    model: 'Evap-Tomato-3E',
    serialNumber: 'AL-2021-0021',
    supplierId: 'SUP-003',
    site: 'USINE DE LINO',
    building: 'BATIMENT NORD',
    floor: 'RDC',
    room: 'Atelier Concentration',
    responsibility: 'PRODUCTION',
    purchaseDate: '2021-05-20',
    barcode: '9876543210123',
    commissionDate: '2021-06-20',
    location: 'Concentration',
    criticality: 'Critique',
    status: 'En service',
    healthIndex: 88,
    lastMaintenance: '2026-06-01',
    nextMaintenance: '2026-09-01',
    hoursCount: 18400,
    cycleCount: 185,
    documents: [{ name: 'AlfaLaval Notice Evap.pdf', type: 'notice', size: '6.8 MB', url: '#' }],
    photos: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80'],
    sensors: [
      { name: 'Débit d\'Alimentation', value: 45.0, unit: 't/h', status: 'normal', history: [44.8, 45.0, 45.1, 45.0, 45.0] },
      { name: 'Taux Concentration', value: 28.5, unit: '°Brix', status: 'normal', history: [28.2, 28.4, 28.5, 28.5, 28.6] }
    ],
    spareParts: ['REF-GASK-EVAP', 'REF-VALV-304']
  },
  {
    id: 'EQ-PUMP-104',
    parentId: 'EQ-EVAP-001',
    name: 'Pompe de transfert concentré P-104',
    category: 'Pumps',
    subFamily: 'Pompe centrifuge Inox',
    brand: 'Grundfos',
    model: 'CRN-45',
    serialNumber: 'GR-8899-741',
    site: 'USINE DE LINO',
    building: 'BATIMENT NORD',
    floor: 'RDC',
    room: 'Atelier Concentration',
    responsibility: 'TECHNIQUE',
    gipPresence: false,
    commissionDate: '2021-06-25',
    location: 'Concentration',
    criticality: 'Moyenne',
    status: 'En panne',
    healthIndex: 45,
    lastMaintenance: '2026-04-18',
    nextMaintenance: '2026-07-18',
    hoursCount: 6850,
    cycleCount: 1240,
    documents: [],
    photos: [],
    sensors: [
      { name: 'Vibrations Palier', value: 1.8, unit: 'mm/s', status: 'normal', history: [1.5, 1.7, 1.8, 1.8, 1.9, 1.8] },
      { name: 'Température Enroulement', value: 58.4, unit: '°C', status: 'normal', history: [56.2, 57.8, 58.1, 58.4, 58.4] }
    ],
    spareParts: ['REF-BRG-102']
  },
  {
    id: 'EQ-CONV-201',
    name: 'Convoyeur d\'inspection visuelle',
    category: 'Conveyors',
    subFamily: 'Bande transporteuse',
    brand: 'Intralox',
    model: 'S800-OpenHinge',
    serialNumber: 'IX-2023-055',
    site: 'USINE DE LINO',
    building: 'BATIMENT SUD',
    floor: 'Usine',
    room: 'Réception',
    responsibility: 'PRODUCTION',
    gipPresence: false,
    commissionDate: '2023-02-10',
    location: 'Tri',
    criticality: 'Haute',
    status: 'En service',
    healthIndex: 98,
    lastMaintenance: '2026-06-12',
    nextMaintenance: '2026-07-12',
    hoursCount: 22400,
    cycleCount: 4500,
    documents: [],
    photos: [],
    sensors: [
      { name: 'Vitesse Tapis', value: 1.2, unit: 'm/s', status: 'normal', history: [1.2, 1.2, 1.2, 1.2, 1.2] },
      { name: 'Intensité Moteur', value: 14.2, unit: 'A', status: 'warning', history: [12.0, 13.5, 14.1, 14.2, 14.5] }
    ],
    spareParts: ['REF-BELT-COV', 'REF-BRG-102']
  },
  {
    id: 'EQ-AUTO-001',
    name: 'Autoclave de Stérilisation Ligne 1',
    category: 'Autoclaves',
    subFamily: 'Autoclave à jet d\'eau surchauffée',
    brand: 'FMC Technologies',
    model: 'Steril-Host-4',
    serialNumber: 'FMC-AC-2021-04',
    site: 'USINE DE LINO',
    building: 'BATIMENT SUD',
    floor: 'Usine',
    room: 'Concentration - Ligne 1',
    responsibility: 'PRODUCTION',
    commissionDate: '2021-09-12',
    location: 'Conditionnement',
    criticality: 'Critique',
    status: 'En service',
    healthIndex: 96,
    lastMaintenance: '2026-05-25',
    nextMaintenance: '2026-08-25',
    hoursCount: 8900,
    cycleCount: 2100,
    documents: [],
    photos: [],
    sensors: [
      { name: 'Température Autoclave', value: 121.5, unit: '°C', status: 'normal', history: [120.0, 121.2, 121.5, 121.5, 121.6] },
      { name: 'Pression Interne', value: 2.1, unit: 'bar', status: 'normal', history: [2.0, 2.1, 2.1, 2.1, 2.2] }
    ],
    spareParts: ['REF-VALV-304']
  },
  {
    id: 'EQ-PACK-001',
    name: 'Remplisseuse Aseptique Conditionnement',
    category: 'Packaging lines',
    subFamily: 'Remplisseuse Bag-in-Box',
    brand: 'Krones',
    model: 'AseptFill-200',
    serialNumber: 'KR-2024-88',
    site: 'USINE DE LINO',
    building: 'BATIMENT SUD',
    floor: 'Usine',
    room: 'Conditionnement',
    responsibility: 'PRODUCTION',
    commissionDate: '2024-01-15',
    location: 'Conditionnement',
    criticality: 'Critique',
    status: 'En service',
    healthIndex: 92,
    lastMaintenance: '2026-05-28',
    nextMaintenance: '2026-08-28',
    hoursCount: 7420,
    cycleCount: 14520,
    documents: [],
    photos: [],
    sensors: [
      { name: 'Pression Tête Aseptique', value: 5.2, unit: 'bar', status: 'normal', history: [5.0, 5.1, 5.2, 5.2, 5.2] },
      { name: 'Débit Remplissage', value: 8.4, unit: 'l/s', status: 'normal', history: [8.2, 8.4, 8.4, 8.4, 8.5] }
    ],
    spareParts: ['REF-PNEU-CYL', 'REF-GASK-EVAP']
  }
];

const initialIncidents: Incident[] = [
  { id: 'DI-2026-001', equipmentId: 'EQ-CONV-201', description: 'Bruit suspect au niveau du palier moteur et échauffement anormal. Odeur de brûlé signalée.', reportedBy: 'Youssef Mansouri (Prod)', reportedDate: '2026-07-06T10:14:00Z', urgency: 'Haute', priority: 'P2', technicianId: 'TECH-001', status: 'Validé' },
  { id: 'DI-2026-002', equipmentId: 'EQ-PUMP-104', description: 'Fuite au niveau de la garniture mécanique pendant la phase de NEP. Débit de fuite estimé à 5 L/h.', reportedBy: 'Karim Gherbi (Resp)', reportedDate: '2026-07-07T08:30:00Z', urgency: 'Critique', priority: 'P1', technicianId: 'TECH-003', status: 'Transformé en OT', workOrderId: 'OT-2026-004' },
  { id: 'DI-2026-003', equipmentId: 'EQ-AUTO-001', description: 'Alarme pression différentielle déclenchée. Filtre colmatage possible sur le circuit vapeur.', reportedBy: 'Ahmed Bensaid (Tech)', reportedDate: '2026-07-07T11:05:00Z', urgency: 'Haute', priority: 'P2', status: 'Nouveau' },
  { id: 'DI-2026-004', equipmentId: 'EQ-BOIL-001', description: 'Voyant défaut brûleur allumé intermittent. L\'équipement fonctionne mais le technicien doit vérifier.', reportedBy: 'Youssef Mansouri (Prod)', reportedDate: '2026-07-08T07:00:00Z', urgency: 'Moyenne', priority: 'P3', technicianId: 'TECH-004', status: 'Nouveau' },
  { id: 'DI-2026-005', equipmentId: 'EQ-EVAP-001', description: 'Chute du taux de concentration Brix observée sur le 3ème effet. Perte de vacuum.', reportedBy: 'Karim Gherbi (Resp)', reportedDate: '2026-07-08T09:45:00Z', urgency: 'Critique', priority: 'P1', status: 'Validé' },
  { id: 'DI-2026-006', equipmentId: 'EQ-PACK-001', description: 'Blocage répété du poussoir d\'ensachage. Arrêt ligne 3 fois en 2h.', reportedBy: 'Youssef Mansouri (Prod)', reportedDate: '2026-07-09T13:20:00Z', urgency: 'Haute', priority: 'P3', status: 'Rejeté' },
  { id: 'DI-2026-007', equipmentId: 'EQ-CONV-201', description: 'Déclenchement disjoncteur moteur M3 sans raison apparente. Réarmement effectué manuellement.', reportedBy: 'Nour Belhadj (Tech)', reportedDate: '2026-07-10T06:55:00Z', urgency: 'Moyenne', priority: 'P3', technicianId: 'TECH-002', status: 'Nouveau' },
  { id: 'DI-2026-008', equipmentId: 'EQ-PACK-001', description: 'Fuite d\'air comprimé mineure sur vérin V2.', reportedBy: 'Ahmed Bensaid (Tech)', reportedDate: '2026-07-05T08:00:00Z', urgency: 'Faible', priority: 'P4', status: 'Clos' }
];

const initialWorkOrders: WorkOrder[] = [
  {
    id: 'OT-2026-001', equipmentId: 'EQ-BOIL-001',
    title: 'Inspection de sécurité brûleur chaudière',
    description: 'Visite réglementaire trimestrielle. Contrôle d\'étanchéité des vannes gaz et test des sécurités pressostats.',
    type: 'Préventif', priority: 'Haute', status: 'Terminé',
    createdDate: '2026-06-15T08:00:00Z', startDate: '2026-06-20T08:00:00Z', endDate: '2026-06-20T12:00:00Z',
    technicianId: 'TECH-001', assignedBy: 'Karim Gherbi',
    durationMinutes: 240, partsUsed: [{ partRef: 'REF-VALV-304', quantity: 1 }], externalCost: 0,
    campaign: 'Campagne 2026',
    diagnostic: 'Brûleur en bon état. Étanchéité vérifiée. Remplacement vanne gaz DN50 préventif.',
    solution: 'Remplacement vanne + test étanchéité au détecteur gaz. Remis en service.',
    signature: 'signed'
  },
  {
    id: 'OT-2026-002', equipmentId: 'EQ-EVAP-001',
    title: 'Remplacement des joints d\'étanchéité porte évaporateur',
    description: 'Remplacement suite à perte d\'efficacité du vide au 3ème effet. Remplacer les joints alimentaires.',
    type: 'Correctif', priority: 'Haute', status: 'En cours',
    createdDate: '2026-07-05T09:12:00Z', startDate: '2026-07-05T14:00:00Z',
    technicianId: 'TECH-002', assignedBy: 'Karim Gherbi',
    durationMinutes: 0, partsUsed: [{ partRef: 'REF-GASK-EVAP', quantity: 4 }], externalCost: 0,
    campaign: 'Campagne 2026'
  },
  {
    id: 'OT-2026-003', equipmentId: 'EQ-PACK-001',
    title: 'Révision trimestrielle remplisseuse aseptique',
    description: 'Contrôle de toutes les têtes de remplissage, nettoyage des buses, vérification des joints toriques.',
    type: 'Préventif', priority: 'Moyenne', status: 'Affecté',
    createdDate: '2026-07-08T07:30:00Z',
    technicianId: 'TECH-003', assignedBy: 'Karim Gherbi',
    durationMinutes: 0, partsUsed: [], externalCost: 0,
    campaign: 'Campagne 2026'
  },
  {
    id: 'OT-2026-004', equipmentId: 'EQ-PUMP-104',
    title: 'Remplacement garniture mécanique pompe P-104',
    description: 'Fuite détectée sur garniture lors phase NEP. Pompe à isoler et remplacer la garniture mécanique.',
    type: 'Correctif', priority: 'Critique', status: 'En cours',
    createdDate: '2026-07-07T09:00:00Z', startDate: '2026-07-07T14:00:00Z',
    technicianId: 'TECH-001', assignedBy: 'Karim Gherbi',
    durationMinutes: 0, partsUsed: [{ partRef: 'REF-PUMP-SEAL', quantity: 1 }], externalCost: 0,
    campaign: 'Campagne 2026'
  },
  {
    id: 'OT-2026-005', equipmentId: 'EQ-CONV-201',
    title: 'Remplacement courroie convoyeur tri visuel',
    description: 'Courroie présentant des craquèlements et une élongation anormale. Remplacement préventif.',
    type: 'Préventif', priority: 'Moyenne', status: 'En attente',
    createdDate: '2026-07-09T10:00:00Z',
    assignedBy: 'Karim Gherbi',
    durationMinutes: 0, partsUsed: [], externalCost: 0,
    campaign: 'Campagne 2026'
  },
  {
    id: 'OT-2026-006', equipmentId: 'EQ-AUTO-001',
    title: 'Contrôle alarme pression différentielle autoclave',
    description: 'Vérification filtre vapeur et calibrage pressostat différentiel suite à alarme répétée.',
    type: 'Correctif', priority: 'Haute', status: 'Affecté',
    createdDate: '2026-07-10T08:00:00Z',
    technicianId: 'TECH-004', assignedBy: 'Karim Gherbi',
    durationMinutes: 0, partsUsed: [], externalCost: 0,
    campaign: 'Campagne 2026'
  },
  {
    id: 'OT-2026-007', equipmentId: 'EQ-BOIL-001',
    title: 'Nettoyage tubes chaudière – curage préventif',
    description: 'Détartrage chimique des tubes chaudière en préparation de la haute saison.',
    type: 'Préventif', priority: 'Faible', status: 'Terminé',
    createdDate: '2026-06-01T07:00:00Z', startDate: '2026-06-03T07:00:00Z', endDate: '2026-06-03T15:00:00Z',
    technicianId: 'TECH-003', assignedBy: 'Karim Gherbi',
    durationMinutes: 480, partsUsed: [], externalCost: 320,
    campaign: 'Campagne 2026',
    diagnostic: 'Dépôts tartreux importants dans les tubes. Curage nécessaire.',
    solution: 'Curage à l\'acide citrique dilué + rinçage eau déminéralisée. Résultat conforme.',
    signature: 'signed'
  },
  {
    id: 'OT-2026-008', equipmentId: 'EQ-EVAP-001',
    title: 'Réglage boucle PID concentration Brix',
    description: 'Dérive du Brix en sortie évaporateur. Recalage des paramètres PID automate.',
    type: 'Curatif', priority: 'Haute', status: 'En attente',
    createdDate: '2026-07-10T11:30:00Z',
    assignedBy: 'Karim Gherbi',
    durationMinutes: 0, partsUsed: [], externalCost: 0,
    campaign: 'Campagne 2026'
  }
];

const initialCampaigns: Campaign[] = [
  { id: 'CAMP-2025', name: 'Campagne Tomates 2025', startDate: '2025-07-01', endDate: '2025-10-15', status: 'Terminée' },
  { id: 'CAMP-2026', name: 'Campagne Tomates 2026', startDate: '2026-07-01', endDate: '2026-10-15', status: 'En cours' }
];

// ==================================================
// PROVIDER IMPLEMENTATION
// ==================================================

export const GmaoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    // Clean up any old versioned data to force fresh load
    ['gmao_tenants_v1', 'gmao_tenants_v2', 'gmao_tenants_v3', 'gmao_tenants_v4', 'gmao_tenants_v5', 'gmao_tenants_v6', 'gmao_tenants_v7'].forEach(k => localStorage.removeItem(k));
    
    const saved = localStorage.getItem('gmao_tenants_v8');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tenants from local storage', e);
      }
    }
    
    // Return two initial tenants: Conserves du Midi (T1) and Tomates du Nord (T2)
    return [
      {
        id: 'tenant-midi',
        name: 'Conserverie du Midi S.A.',
        domain: 'midi.com',
        status: 'Active',
        subscriptionPlan: 'Enterprise',
        createdAt: '2026-01-10T12:00:00Z',
        adminEmail: 'admin@midi.com',
        capacityTonsPerDay: 450,
        equipments: initialEquipments,
        workOrders: initialWorkOrders,
        incidents: initialIncidents,
        technicians: initialTechnicians,
        parts: initialParts,
        suppliers: initialSuppliers,
        campaigns: initialCampaigns,
        users: initialUsers
      },
      {
        id: 'tenant-nord',
        name: 'Tomates Industrielles du Nord',
        domain: 'nord.com',
        status: 'Active',
        subscriptionPlan: 'Premium',
        createdAt: '2026-03-15T09:30:00Z',
        adminEmail: 'admin@nord.com',
        capacityTonsPerDay: 280,
        equipments: [
          {
            id: 'EQ-BOIL-002',
            name: 'Chaudière Nord Vapor 1200',
            category: 'Boilers',
            subFamily: 'Chaudière eau surchauffée',
            brand: 'Babcock',
            model: 'NV-1200',
            serialNumber: 'NV-90832',
            commissionDate: '2023-08-10',
            location: 'Utilités',
            criticality: 'Critique',
            status: 'En service',
            healthIndex: 98,
            lastMaintenance: '2026-04-12',
            nextMaintenance: '2026-07-12',
            hoursCount: 5200,
            cycleCount: 140,
            documents: [],
            photos: [],
            sensors: [
              { name: 'Pression Vapeur', value: 6.2, unit: 'bar', status: 'normal', history: [6.0, 6.2, 6.2] }
            ],
            spareParts: []
          },
          {
            id: 'EQ-CONV-002',
            name: 'Convoyeur d\'Alimentation Ligne A',
            category: 'Conveyors',
            subFamily: 'Convoyeur à bande rouleaux',
            brand: 'Nectra',
            model: 'COV-600',
            serialNumber: 'NS-948',
            commissionDate: '2022-09-18',
            location: 'Réception',
            criticality: 'Moyenne',
            status: 'En service',
            healthIndex: 85,
            lastMaintenance: '2026-05-18',
            nextMaintenance: '2026-08-18',
            hoursCount: 9400,
            cycleCount: 1250,
            documents: [],
            photos: [],
            sensors: [
              { name: 'Vitesse Tapis', value: 1.0, unit: 'm/s', status: 'normal', history: [1.0, 1.0] }
            ],
            spareParts: []
          }
        ],
        workOrders: [
          { id: 'OT-2026-801', equipmentId: 'EQ-BOIL-002', title: 'Vidange et détartrage chaudière', description: 'Nettoyage annuel préventif des tubes d\'eau.', type: 'Préventif', priority: 'Haute', status: 'En cours', createdDate: '2026-07-02T10:00:00Z', technicianId: 'TECH-901', assignedBy: 'Jean Dupont', durationMinutes: 0, partsUsed: [], externalCost: 0, campaign: 'Campagne 2026' }
        ],
        incidents: [],
        technicians: [
          { id: 'TECH-901', name: 'Jean Dupont', role: 'Électromécanicien', qualification: 'Niveau II', skills: ['Câblage', 'Mécanique générale'], status: 'Occupé', hourlyRate: 38, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' }
        ],
        parts: [],
        suppliers: [],
        campaigns: [
          { id: 'CAMP-2026', name: 'Campagne 2026 Nord', startDate: '2026-07-01', endDate: '2026-10-15', status: 'En cours' }
        ],
        users: []
      }
    ];
  });

  // Current session values
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('gmao_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentTenantId, setCurrentTenantId] = useState<string | null>(() => {
    const saved = localStorage.getItem('gmao_current_tenant_id');
    return saved ? saved : 'tenant-midi';
  });

  const [impersonatedTenantId, setImpersonatedTenantId] = useState<string | null>(() => {
    return localStorage.getItem('gmao_impersonated_tenant_id');
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('gmao_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  const [selectedCampaign, setSelectedCampaign] = useState<string>('Campagne 2026');

  const [rolePermissions, setRolePermissions] = useState<Record<AppRole, RoleDefinition>>(DEFAULT_ROLE_PERMISSIONS);

  const updateRolePermission = (role: AppRole, moduleName: AppModule, action: string, scope: DataScope, isChecked: boolean) => {
    setRolePermissions(prev => {
      const newPerms = { ...prev };
      if (!newPerms[role]) newPerms[role] = {};
      const roleDef = newPerms[role] as any;
      if (!roleDef[moduleName]) roleDef[moduleName] = { actions: [], scope: 'mes_donnees' };
      
      const mod = roleDef[moduleName];
      mod.scope = scope;
      
      const hasAction = mod.actions.includes(action);
      if (isChecked && !hasAction) {
        mod.actions = [...mod.actions, action];
      } else if (!isChecked && hasAction) {
        mod.actions = mod.actions.filter((a: string) => a !== action);
      }
      
      return newPerms;
    });
  };

  // Shared platform notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('gmao_tenants_v8', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('gmao_current_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('gmao_current_tenant_id', currentTenantId || '');
  }, [currentTenantId]);

  useEffect(() => {
    localStorage.setItem('gmao_impersonated_tenant_id', impersonatedTenantId || '');
  }, [impersonatedTenantId]);

  useEffect(() => {
    localStorage.setItem('gmao_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sensor Telemetry simulation hook
  useEffect(() => {
    const interval = setInterval(() => {
      setTenants(prevTenants => {
        return prevTenants.map(t => {
          if (t.status !== 'Active') return t;
          
          const updatedEqs = t.equipments.map(eq => {
            if (eq.status !== 'En service') return eq;
            
            const updatedSensors = eq.sensors.map(sensor => {
              const delta = (Math.random() - 0.5) * 0.4;
              const nextVal = Math.round((sensor.value + delta) * 10) / 10;
              const nextHistory = [...sensor.history.slice(1), nextVal];
              
              return {
                ...sensor,
                value: nextVal,
                history: nextHistory
              };
            });
            return { ...eq, sensors: updatedSensors };
          });
          return { ...t, equipments: updatedEqs };
        });
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic getters matching current tenant ID
  const activeTenant = tenants.find(t => t.id === currentTenantId);

  const equipments = activeTenant ? activeTenant.equipments : [];
  const workOrders = activeTenant ? activeTenant.workOrders : [];
  const incidents = activeTenant ? activeTenant.incidents : [];
  const technicians = activeTenant ? activeTenant.technicians : [];
  const parts = activeTenant ? activeTenant.parts : [];
  const suppliers = activeTenant ? activeTenant.suppliers : [];
  const campaigns = activeTenant ? activeTenant.campaigns : [];

  // Authentication login
  const login = (email: string, password?: string, tenantId?: string, quickRole?: User['role']) => {
    // 1. Super Admin login check
    if (email.toLowerCase() === 'admin@gmao-saas.com') {
      if (password && password !== 'admin') return false;
      setCurrentUser({
        name: 'Alexandre Legrand',
        email: email,
        role: 'SuperAdmin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
      setCurrentTenantId(null); // Platform level by default
      setImpersonatedTenantId(null);
      return true;
    }

    // 2. Company level logins
    const selectedTid = tenantId || 'tenant-midi';
    const tenant = tenants.find(t => t.id === selectedTid);
    if (!tenant) return false;

    if (tenant.status !== 'Active') {
      alert(`La souscription de ${tenant.name} est suspendue ou en attente d'approbation.`);
      return false;
    }

    // Check users array
    if (tenant.users) {
      const user = tenant.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
         if (password && user.password && user.password !== password) return false;
         setCurrentUser({
           name: user.name,
           email: user.email,
           role: user.role as any,
           avatar: user.avatar,
           tenantId: selectedTid
         });
         setCurrentTenantId(selectedTid);
         setImpersonatedTenantId(null);
         return true;
      }
    }

    let role = quickRole || 'CompanyAdmin';
    let name = 'Utilisateur';
    let avatar = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80';

    if (role === 'Responsable Maintenance') {
      name = selectedTid === 'tenant-midi' ? 'Karim Gherbi' : 'Jean Dupont';
    } else if (role === 'Technicien') {
      name = selectedTid === 'tenant-midi' ? 'Ahmed Bensaid' : 'Michel Martin';
      avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';
    } else if (role === "Chef d'équipe") {
      name = selectedTid === 'tenant-midi' ? 'Jérôme Bricole' : 'Pierre Faure';
      avatar = 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80';
    } else if (role === 'Production') {
      name = 'Youssef Mansouri';
    }

    setCurrentUser({
      name,
      email,
      role: role as any,
      avatar,
      tenantId: selectedTid
    });
    setCurrentTenantId(selectedTid);
    setImpersonatedTenantId(null);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentTenantId('tenant-midi');
    setImpersonatedTenantId(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // ==================================================
  // SAAS SUPER ADMIN ACTIONS
  // ==================================================

  const registerTenant = (name: string, domain: string, adminEmail: string, capacity: number, plan: 'Basic' | 'Premium' | 'Enterprise') => {
    const newId = `tenant-${domain.split('.')[0]}-${Date.now().toString().slice(-4)}`;
    const newTenant: Tenant = {
      id: newId,
      name,
      domain,
      status: 'Pending',
      subscriptionPlan: plan,
      createdAt: new Date().toISOString(),
      adminEmail,
      capacityTonsPerDay: capacity,
      equipments: [],
      workOrders: [],
      incidents: [],
      technicians: [
        { id: 'TECH-101', name: 'Technicien Starter', role: 'Électromécanicien', qualification: 'Niveau I', skills: ['Mécanique'], status: 'Disponible', hourlyRate: 30, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' }
      ],
      parts: [],
      suppliers: [],
      campaigns: [
        { id: 'CAMP-2026', name: 'Campagne Initiale 2026', startDate: '2026-07-01', endDate: '2026-10-15', status: 'En cours' }
      ],
      users: []
    };

    setTenants(prev => [...prev, newTenant]);
    
    // Add alert notification
    addNotification({
      type: 'system',
      severity: 'warning',
      title: 'Nouvelle entreprise inscrite',
      message: `La société ${name} demande la création d'un espace de travail.`
    });
  };

  const approveTenant = (id: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id !== id) return t;
      
      // Auto populate approved tenant with a starter set of equipments to avoid blank screens
      const starterEquipments: Equipment[] = [
        {
          id: 'EQ-BOIL-STARTER',
          name: 'Chaudière Thermique Starter',
          category: 'Boilers',
          subFamily: 'Chaudière Vapeur',
          brand: 'Babcock',
          model: 'VAP-STARTER',
          serialNumber: 'SN-VAP',
          commissionDate: new Date().toISOString().split('T')[0],
          location: 'Utilités',
          criticality: 'Haute',
          status: 'En service',
          healthIndex: 100,
          lastMaintenance: '',
          nextMaintenance: '',
          hoursCount: 0,
          cycleCount: 0,
          documents: [],
          photos: [],
          sensors: [
            { name: 'Pression Vapeur', value: 5.0, unit: 'bar', status: 'normal', history: [5.0] }
          ],
          spareParts: []
        }
      ];

      return {
        ...t,
        status: 'Active',
        equipments: starterEquipments
      };
    }));
  };

  const suspendTenant = (id: string) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'Active' ? 'Suspended' : 'Active' } : t));
  };

  const changeTenantPlan = (id: string, plan: 'Basic' | 'Premium' | 'Enterprise') => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, subscriptionPlan: plan } : t));
  };

  const impersonateTenant = (id: string | null) => {
    if (id === null) {
      // Exit impersonation mode
      setCurrentTenantId(null);
      setImpersonatedTenantId(null);
    } else {
      // Enter impersonation mode
      setCurrentTenantId(id);
      setImpersonatedTenantId(id);
    }
  };

  // ==================================================
  // TENANT WORKSPACE ACTIONS
  // ==================================================

  const addEquipment = (eq: Omit<Equipment, 'healthIndex' | 'sensors' | 'hoursCount' | 'cycleCount'>) => {
    if (!currentTenantId) return;
    const newEq: Equipment = {
      ...eq,
      healthIndex: 100,
      hoursCount: 0,
      cycleCount: 0,
      sensors: [
        { name: 'Température', value: 20.0, unit: '°C', status: 'normal', history: [20.0] },
        { name: 'Vibration', value: 0.5, unit: 'mm/s', status: 'normal', history: [0.5] }
      ]
    };

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return {
          ...t,
          equipments: [...t.equipments, newEq]
        };
      }
      return t;
    }));

    addNotification({
      type: 'system',
      severity: 'info',
      title: 'Équipement Enregistré',
      message: `L'équipement ${eq.name} (${eq.id}) a été ajouté.`
    });
  };

  const updateEquipmentStatus = (id: string, status: Equipment['status'], healthIndex?: number) => {
    if (!currentTenantId) return;
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updated = t.equipments.map(eq => {
          if (eq.id === id) {
            return {
              ...eq,
              status,
              healthIndex: healthIndex !== undefined ? healthIndex : eq.healthIndex
            };
          }
          return eq;
        });
        return { ...t, equipments: updated };
      }
      return t;
    }));
  };

  const deleteEquipment = (id: string) => {
    if (!currentTenantId) return;
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        // Also remove children equipments
        const removeIds = new Set([id]);
        let changed = true;
        // Keep finding children of children to delete them all
        while (changed) {
            changed = false;
            t.equipments.forEach(e => {
                if (e.parentId && removeIds.has(e.parentId) && !removeIds.has(e.id)) {
                    removeIds.add(e.id);
                    changed = true;
                }
            });
        }
        const updatedEqs = t.equipments.filter(e => !removeIds.has(e.id));
        return { ...t, equipments: updatedEqs };
      }
      return t;
    }));
  };

  const deleteEquipmentsByLocation = (type: string, site?: string, building?: string, floor?: string, room?: string) => {
    if (!currentTenantId) return;
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedEqs = t.equipments.filter(e => {
            if (type === 'site' && e.site === site) return false;
            if (type === 'building' && e.site === site && e.building === building) return false;
            if (type === 'floor' && e.site === site && e.building === building && e.floor === floor) return false;
            if (type === 'room' && e.site === site && e.building === building && e.floor === floor && e.room === room) return false;
            return true;
        });
        return { ...t, equipments: updatedEqs };
      }
      return t;
    }));
  };

  const deleteEquipmentsByCategory = (category: string) => {
    if (!currentTenantId) return;
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedEqs = t.equipments.filter(e => e.category !== category);
        return { ...t, equipments: updatedEqs };
      }
      return t;
    }));
  };

  const addIncident = (inc: Omit<Incident, 'id' | 'reportedDate' | 'status'>) => {
    if (!currentTenantId) throw new Error("No active tenant");
    
    const activeIncidents = activeTenant ? activeTenant.incidents : [];
    const newId = `DI-2026-${String(activeIncidents.length + 1).padStart(3, '0')}`;
    const newInc: Incident = {
      ...inc,
      id: newId,
      reportedDate: new Date().toISOString(),
      status: 'Nouveau'
    };

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return {
          ...t,
          incidents: [newInc, ...t.incidents]
        };
      }
      return t;
    }));

    addNotification({
      type: 'incident',
      severity: inc.urgency === 'Critique' || inc.urgency === 'Haute' ? 'critical' : 'warning',
      title: `Nouvelle panne signalée (${inc.urgency})`,
      message: `${newId} - ${inc.description.slice(0, 55)}`
    });

    if (inc.urgency === 'Critique' || inc.urgency === 'Haute') {
      updateEquipmentStatus(inc.equipmentId, 'En panne', 30);
    }

    return newInc;
  };

  const updateIncidentStatus = (id: string, status: Incident['status'], workOrderId?: string) => {
    if (!currentTenantId) return;
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updated = t.incidents.map(inc => {
          if (inc.id === id) {
            return { ...inc, status, workOrderId: workOrderId || inc.workOrderId };
          }
          return inc;
        });
        return { ...t, incidents: updated };
      }
      return t;
    }));
  };

  const addWorkOrder = (ot: Omit<WorkOrder, 'id' | 'createdDate' | 'status' | 'partsUsed' | 'durationMinutes' | 'externalCost'>, incidentId?: string) => {
    if (!currentTenantId) throw new Error("No active tenant");

    const activeOrders = activeTenant ? activeTenant.workOrders : [];
    const newId = `OT-2026-${String(activeOrders.length + 1).padStart(3, '0')}`;
    const newOt: WorkOrder = {
      ...ot,
      id: newId,
      status: 'En attente',
      createdDate: new Date().toISOString(),
      partsUsed: [],
      durationMinutes: 0,
      externalCost: 0
    };

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        // Free/Occupied technician updates
        let updatedTechs = [...t.technicians];
        if (ot.technicianId) {
          updatedTechs = updatedTechs.map(tech => tech.id === ot.technicianId ? { ...tech, status: 'Occupé' } : tech);
        }
        
        return {
          ...t,
          workOrders: [newOt, ...t.workOrders],
          technicians: updatedTechs
        };
      }
      return t;
    }));

    addNotification({
      type: 'workorder',
      severity: 'info',
      title: 'Ordre de Travail Créé',
      message: `${newId} assigné à ${ot.technicianId || 'non-affecté'}.`
    });

    // If an explicit incidentId is provided, use it; otherwise fallback to equipment match
    if (incidentId) {
      updateIncidentStatus(incidentId, 'Transformé en OT', newId);
    } else {
      const relatedInc = incidents.find(i => i.equipmentId === ot.equipmentId && i.status !== 'Transformé en OT');
      if (relatedInc) {
        updateIncidentStatus(relatedInc.id, 'Transformé en OT', newId);
      }
    }

    return newOt;
  };

  const updateWorkOrderStatus = (id: string, status: WorkOrder['status'], updates?: Partial<WorkOrder>) => {
    if (!currentTenantId) return;

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedOrders = t.workOrders.map(ot => {
          if (ot.id !== id) return ot;
          
          const finalOt = { ...ot, status, ...updates };

          if (status === 'En cours' && !ot.startDate) {
            finalOt.startDate = new Date().toISOString();
            setTimeout(() => updateEquipmentStatus(ot.equipmentId, 'En maintenance'), 0);
          } else if (status === 'Terminé' && !ot.endDate) {
            finalOt.endDate = new Date().toISOString();
            setTimeout(() => updateEquipmentStatus(ot.equipmentId, 'En service', 95), 0);
            
            // Consume parts
            finalOt.partsUsed.forEach(usage => {
              addPartMovement(usage.partRef, usage.quantity, 'out', id);
            });
          }
          return finalOt;
        });

        // Toggle technician status
        const targetOt = t.workOrders.find(o => o.id === id);
        let updatedTechs = [...t.technicians];
        if (targetOt && targetOt.technicianId) {
          const isReleased = status === 'Terminé' || status === 'Clôturé';
          updatedTechs = updatedTechs.map(tech => 
            tech.id === targetOt.technicianId ? { ...tech, status: isReleased ? 'Disponible' : 'Occupé' } : tech
          );
        }

        return { 
          ...t, 
          workOrders: updatedOrders,
          technicians: updatedTechs 
        };
      }
      return t;
    }));

    addNotification({
      type: 'workorder',
      severity: 'info',
      title: `Statut OT mis à jour`,
      message: `L'ordre ${id} est maintenant: ${status}.`
    });
  };

  const addPartMovement = (ref: string, qty: number, type: 'in' | 'out', otId?: string) => {
    if (!currentTenantId) return false;
    let success = false;

    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedParts = t.parts.map(part => {
          if (part.ref !== ref) return part;
          
          let newStock = part.stockCurrent;
          if (type === 'in') {
            newStock += qty;
            success = true;
          } else {
            if (part.stockCurrent >= qty) {
              newStock -= qty;
              success = true;
            } else {
              success = false;
              return part;
            }
          }

          if (newStock < part.stockMin) {
            setTimeout(() => {
              addNotification({
                type: 'stock',
                severity: newStock === 0 ? 'critical' : 'warning',
                title: `Seuil critique stock`,
                message: `La pièce ${part.name} est à un niveau critique: ${newStock}/${part.stockMin}.`
              });
            }, 0);
          }

          return { ...part, stockCurrent: newStock };
        });

        return { ...t, parts: updatedParts };
      }
      return t;
    }));

    return success;
  };

  const updatePart = (updated: SparePart) => {
    if (!currentTenantId) return;
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        const updatedParts = t.parts.map(p => p.ref === updated.ref ? updated : p);
        return { ...t, parts: updatedParts };
      }
      return t;
    }));
  };

  const addSupplier = (sup: Supplier) => {
    if (!currentTenantId) return;
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return { ...t, suppliers: [...t.suppliers, sup] };
      }
      return t;
    }));
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `NOT-${String(Date.now())}`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addUser = (user: UserAccount) => {
    if (!currentTenantId) return;
    setTenants(prev => prev.map(t => {
      if (t.id === currentTenantId) {
        return { ...t, users: [...(t.users || []), user] };
      }
      return t;
    }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <GmaoContext.Provider
      value={{
        tenants,
        currentTenantId,
        impersonatedTenantId,
        equipments,
        workOrders,
        incidents,
        technicians,
        parts,
        suppliers,
        campaigns,
        notifications,
        currentUser,
        darkMode,
        selectedCampaign,
      rolePermissions,
      updateRolePermission,
        login,
        logout,
        toggleDarkMode,
        setSelectedCampaign,
        registerTenant,
        approveTenant,
        suspendTenant,
        changeTenantPlan,
        impersonateTenant,
        addEquipment,
        updateEquipmentStatus,
        deleteEquipment,
        deleteEquipmentsByLocation,
        deleteEquipmentsByCategory,
        addIncident,
        updateIncidentStatus,
        addWorkOrder,
        updateWorkOrderStatus,
        addPartMovement,
        updatePart,
        addSupplier,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addUser
      }}
    >
      {children}
    </GmaoContext.Provider>
  );
};

export const useGmao = () => {
  const context = useContext(GmaoContext);
  if (context === undefined) {
    throw new Error('useGmao must be used within a GmaoProvider');
  }
  return context;
};
