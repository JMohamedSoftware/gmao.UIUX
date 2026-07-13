import React, { useState } from 'react';
import { useGmao, Supplier } from '../context/GmaoContext';
import { 
  Plus, 
  Search, 
  Truck, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  FileText, 
  DollarSign, 
  Calendar,
  X,
  ShieldCheck,
  CheckCircle,
  User
} from 'lucide-react';

export const Suppliers: React.FC = () => {
  const { suppliers, addSupplier } = useGmao();
  const [search, setSearch] = useState('');

  // Add Supplier Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newContractTitle, setNewContractTitle] = useState('');
  const [newContractCost, setNewContractCost] = useState(15000);
  const [newRating, setNewRating] = useState(4.5);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newContact) return;

    const newSup: Supplier = {
      id: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
      name: newName,
      contact: newContact,
      phone: newPhone,
      email: newEmail,
      address: newAddress,
      contracts: newContractTitle ? [
        {
          title: newContractTitle,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Actif',
          cost: newContractCost
        }
      ] : [],
      rating: newRating
    };

    addSupplier(newSup);

    // Reset
    setNewName('');
    setNewContact('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewContractTitle('');
    setShowAddModal(false);
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />);
      } else if (i - 0.5 === rating) {
        stars.push(<Star key={i} className="w-3.5 h-3.5 fill-amber-400/50 text-amber-400" />);
      } else {
        stars.push(<Star key={i} className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />);
      }
    }
    return stars;
  };

  // Mock KPIs
  const totalContracts = suppliers.reduce((acc, sup) => acc + sup.contracts.length, 0);
  const totalCost = suppliers.reduce((acc, sup) => acc + sup.contracts.reduce((sum, c) => sum + c.cost, 0), 0);
  const avgRating = (suppliers.reduce((acc, sup) => acc + sup.rating, 0) / suppliers.length).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Fournisseurs & Prestataires
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            Base contractuelle des prestataires et fabricants d'équipements agroalimentaires
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-custom-sm shadow-md hover-lift"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Fournisseur</span>
        </button>
      </div>

      {/* === KPI Section === */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-custom-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Fournisseurs</span>
            <Truck className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xl font-black text-slate-700 dark:text-slate-200">{suppliers.length}</span>
          <p className="text-[10px] text-slate-400 mt-auto">Partenaires actifs</p>
        </div>

        <div className="glass-panel p-4 rounded-custom-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Contrats Actifs</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl font-black text-slate-700 dark:text-slate-200">{totalContracts}</span>
          <p className="text-[10px] text-slate-400 mt-auto">En cours de validité</p>
        </div>

        <div className="glass-panel p-4 rounded-custom-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Dépenses Globales</span>
            <DollarSign className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xl font-black text-slate-700 dark:text-slate-200">{totalCost.toLocaleString()} €</span>
          <p className="text-[10px] text-slate-400 mt-auto">Volume des contrats</p>
        </div>

        <div className="glass-panel p-4 rounded-custom-md border border-amber-500/20 bg-amber-500/5 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Note Globale</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400">{avgRating} / 5</span>
          <p className="text-[10px] text-slate-400 mt-auto">Évaluation moyenne</p>
        </div>
      </div>

      {/* Filter Options */}
      <div className="glass-panel p-4 rounded-custom-md border border-white/40 dark:border-slate-800/40 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 rounded-custom-sm bg-white/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-primary"
            placeholder="Rechercher par raison sociale, contact, e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <select className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 outline-none focus:border-primary">
            <option>Toutes spécialités</option>
            <option>Mécanique</option>
            <option>Électrique</option>
            <option>Logiciel</option>
          </select>
          <select className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 outline-none focus:border-primary">
            <option>Tous statuts</option>
            <option>Avec contrat actif</option>
            <option>Sans contrat</option>
          </select>
          <select className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 outline-none focus:border-primary">
            <option>Évaluation (Toutes)</option>
            <option>&gt; 4 Étoiles</option>
            <option>&lt; 3 Étoiles</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSuppliers.map(sup => (
          <div 
            key={sup.id}
            className="p-5 rounded-custom-md border border-white/50 dark:border-slate-850/40 bg-white/60 dark:bg-slate-900/20 shadow-sm neumorphic-card flex flex-col justify-between gap-5 hover-lift"
          >
            <div>
              {/* Card Title */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-custom-sm text-slate-650 dark:text-slate-350">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-150">
                      {sup.name}
                    </h3>
                    <span className="text-[9px] font-mono text-slate-400">{sup.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-slate-900/40 px-2.5 py-1 rounded-full border border-slate-200/40">
                  <div className="flex gap-0.5">{getRatingStars(sup.rating)}</div>
                  <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-350">{sup.rating}</span>
                </div>
              </div>

              {/* Contacts info details */}
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex flex-col gap-2 bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-xl border border-slate-100 dark:border-slate-850/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Responsable: <span className="font-bold text-slate-800 dark:text-slate-200">{sup.contact}</span></span>
                  </div>
                  {/* Mock Stats metric */}
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-bold">
                    {Math.floor(Math.random() * 40) + 5} OTs Sous-traités
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`tel:${sup.phone}`} className="hover:text-primary transition-colors">{sup.phone}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`mailto:${sup.email}`} className="hover:text-primary transition-colors">{sup.email}</a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{sup.address}</span>
                </div>
              </div>
            </div>

            {/* Active Contracts block */}
            <div className="border-t border-slate-150 dark:border-slate-850 pt-3">
              <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">
                Contrats de Maintenance Actifs
              </h4>
              
              {sup.contracts.length === 0 ? (
                <div className="text-[10px] text-slate-400 py-1.5">Aucun contrat de maintenance en cours</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {sup.contracts.map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2 overflow-hidden mr-3">
                        <FileText className="w-4.5 h-4.5 text-primary shrink-0" />
                        <div className="overflow-hidden">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block truncate">{c.title}</span>
                          <span className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Échéance: {c.endDate}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 block">
                          {c.cost.toLocaleString()} €
                        </span>
                        <span className="text-[9px] font-bold text-emerald-500">{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel-heavy rounded-custom-lg border border-white/50 dark:border-slate-850 w-full max-w-lg overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/10 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                <Truck className="w-5 h-5 text-primary" />
                Ajouter un Partenaire Fournisseur
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-6 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Raison Sociale *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alfa Laval S.A."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent focus:border-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Contact Référent *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jean-Marc Dupont"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Téléphone direct</label>
                  <input
                    type="text"
                    placeholder="+33 1 02 03 04 05"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent focus:border-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Adresse E-mail</label>
                  <input
                    type="email"
                    placeholder="nom@fournisseur.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Adresse Siège Social</label>
                <input
                  type="text"
                  placeholder="204 Rue des Usines, Paris"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent focus:border-primary outline-none"
                />
              </div>

              <div className="border-t border-slate-150 dark:border-slate-800/80 pt-3">
                <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-3">
                  Contrat de maintenance initial (Facultatif)
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Intitulé Contrat</label>
                    <input
                      type="text"
                      placeholder="Contrat support technique CIP"
                      value={newContractTitle}
                      onChange={(e) => setNewContractTitle(e.target.value)}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent focus:border-primary outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Coût Annuel (€)</label>
                    <input
                      type="number"
                      value={newContractCost}
                      onChange={(e) => setNewContractCost(Number(e.target.value))}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-transparent focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-150 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-100 rounded font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded font-bold shadow-md shadow-primary/10"
                >
                  Enregistrer Partenaire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
