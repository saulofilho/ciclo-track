import React, { useState } from 'react';
import { OFFLINE_REGIONS } from '../data/mockData';
import {
  Download,
  CheckCircle2,
  Trash2,
  HardDrive,
  Layers,
  X,
  RefreshCw,
  WifiOff,
  Compass
} from 'lucide-react';

interface OfflineMapModalProps {
  onClose: () => void;
  offlineReady: boolean;
  onSetOfflineReady: (ready: boolean) => void;
}

export const OfflineMapModal: React.FC<OfflineMapModalProps> = ({
  onClose,
  offlineReady,
  onSetOfflineReady
}) => {
  const [regions, setRegions] = useState(OFFLINE_REGIONS);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const totalCachedMb = regions
    .filter((r) => r.downloaded)
    .reduce((acc, r) => acc + r.sizeMb, 0);

  const startDownload = (id: string) => {
    setDownloadingId(id);
    setProgress(10);

    const int = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(int);
          setDownloadingId(null);
          setRegions((list) =>
            list.map((r) => (r.id === id ? { ...r, downloaded: true, lastUpdate: 'Agora mesmo' } : r))
          );
          onSetOfflineReady(true);
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  const removeRegion = (id: string) => {
    setRegions((list) =>
      list.map((r) => (r.id === id ? { ...r, downloaded: false, lastUpdate: 'Disponível' } : r))
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-base">
                Gerenciador de Mapas Offline
              </h4>
              <p className="text-[11px] text-slate-400">
                Navegação vetorial e topográfica completa sem sinal de celular
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cache status banner */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="text-xs text-slate-400 block">Armazenamento em Cache</span>
              <span className="font-mono text-sm font-bold text-slate-100">
                {totalCachedMb.toFixed(1)} MB baixados
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                offlineReady
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {offlineReady ? '✓ 100% Offline Ready' : 'Online'}
            </span>
          </div>
        </div>

        {/* List of Regions */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
            Regiões & Rotas Detalhadas:
          </span>

          <div className="space-y-2.5">
            {regions.map((region) => {
              const isDownloading = downloadingId === region.id;
              return (
                <div
                  key={region.id}
                  className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-slate-100 text-xs sm:text-sm">
                        {region.name}
                      </h5>
                      <span className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{region.sizeMb} MB</span>
                        <span>•</span>
                        <span>{region.coverage}</span>
                        <span>•</span>
                        <span>Zoom: {region.zoomLevels}</span>
                      </span>
                    </div>

                    {region.downloaded ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Baixado
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                        Disponível
                      </span>
                    )}
                  </div>

                  {isDownloading ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                        <span>Baixando blocos de mapa e curvas de nível...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500">{region.lastUpdate}</span>
                      {region.downloaded ? (
                        <button
                          onClick={() => removeRegion(region.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="w-3 h-3" /> Excluir
                        </button>
                      ) : (
                        <button
                          onClick={() => startDownload(region.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Download className="w-3 h-3" /> Baixar Região
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
