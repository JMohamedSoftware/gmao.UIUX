import React from 'react';
import { useGmao, Equipment } from '../context/GmaoContext';
import { 
  Flame, 
  RefreshCw, 
  Activity, 
  Droplet, 
  Wind, 
  Container, 
  Layers, 
  Package, 
  Cpu, 
  Thermometer 
} from 'lucide-react';

interface VisualizerProps {
  onSelectEquipment: (eq: Equipment) => void;
}

export const TomatoVisualizer: React.FC<VisualizerProps> = ({ onSelectEquipment }) => {
  const { equipments } = useGmao();

  // Helper to find equipment status & health index
  const getEqInfo = (id: string) => {
    const eq = equipments.find(e => e.id === id);
    return {
      exists: !!eq,
      eq: eq,
      status: eq ? eq.status : 'En service',
      health: eq ? eq.healthIndex : 100
    };
  };

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'En service': return 'bg-emerald-500 text-emerald-50';
      case 'En maintenance': return 'bg-amber-500 text-amber-50';
      case 'En panne': return 'bg-rose-500 text-rose-50 animate-pulse';
      default: return 'bg-slate-400';
    }
  };

  const getBorderColor = (status: Equipment['status']) => {
    switch (status) {
      case 'En service': return 'border-emerald-500/30 dark:border-emerald-500/20';
      case 'En maintenance': return 'border-amber-500/30 dark:border-amber-500/20';
      case 'En panne': return 'border-rose-500/40 dark:border-rose-500/20';
      default: return 'border-slate-300';
    }
  };

  const getGlowEffect = (status: Equipment['status']) => {
    switch (status) {
      case 'En service': return 'shadow-[0_0_15px_rgba(16,185,129,0.15)]';
      case 'En maintenance': return 'shadow-[0_0_15px_rgba(245,158,11,0.15)]';
      case 'En panne': return 'shadow-[0_0_20px_rgba(239,68,68,0.3)]';
      default: return '';
    }
  };

  const stages = [
    {
      title: "1. Réception & Lavage",
      id: "EQ-CONV-001",
      icon: RefreshCw,
      description: "Convoyeurs & jets d'eau pressurisés"
    },
    {
      title: "2. Broyage & Concentration",
      id: "EQ-EVAP-001",
      icon: Layers,
      description: "Évaporateurs triple-effet"
    },
    {
      title: "3. Pasteurisation",
      id: "EQ-BOIL-001",
      icon: Flame,
      description: "Chaudière vapeur gaz haute pression"
    },
    {
      title: "4. Stérilisation",
      id: "EQ-AUTO-001",
      icon: Cpu,
      description: "Autoclaves à chaleur humide"
    },
    {
      title: "5. Conditionnement",
      id: "EQ-PACK-001",
      icon: Package,
      description: "Remplissage & ensachage stérile"
    }
  ];

  return (
    <div className="w-full relative py-8 px-6 glass-panel rounded-custom-lg overflow-hidden border border-white/40 dark:border-slate-800/40">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
            Supervision Technique en Temps Réel
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Flux de transformation de tomate & statut d'alerte des équipements critiques
          </p>
        </div>
        <div className="flex items-center gap-4 mt-3 md:mt-0 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 dark:text-slate-300">En Service</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-slate-600 dark:text-slate-300">En Maintenance</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-rose-500">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>En Panne (Arrêt)</span>
          </div>
        </div>
      </div>

      {/* SVG Pipeline Animation Layer */}
      <div className="relative w-full flex flex-col lg:flex-row items-stretch justify-between gap-6 lg:gap-4 z-10">
        
        {/* Animated Connector Line for Desktop */}
        <div className="absolute top-1/2 left-4 right-4 h-1 border-t-2 border-dashed border-slate-300 dark:border-slate-700 -translate-y-1/2 hidden lg:block -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 bg-[length:20px_100%] animate-[dash_2s_linear_infinite]" style={{
            backgroundImage: 'linear-gradient(to right, transparent 50%, #2563EB 50%)',
            backgroundSize: '20px 100%'
          }}></div>
        </div>

        {stages.map((stage, idx) => {
          const { eq, status, health } = getEqInfo(stage.id);
          const Icon = stage.icon;

          return (
            <div 
              key={stage.id} 
              className={`flex-1 flex flex-col justify-between p-5 rounded-custom-md border neumorphic-card hover-lift cursor-pointer ${getBorderColor(status)} ${getGlowEffect(status)}`}
              onClick={() => eq && onSelectEquipment(eq)}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {stage.title}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-custom-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm ${status === 'En panne' ? 'text-rose-500 animate-bounce' : 'text-primary'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {eq ? eq.name : "Machine"}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {stage.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center text-xs">
                <div className="text-right">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider block">
                    Santé
                  </span>
                  <span className={`font-bold ${health > 80 ? 'text-emerald-500' : health > 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {health}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>


    </div>
  );
};
