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
    <div className="fixed inset-0 z-50 bg-[#1a1a1a]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#1a1a1a]/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f8f7f4] border border-[#1a1a1a]/10 text-[#2c52a1] flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif-display text-xl font-bold text-[#1a1a1a]">
                Gerenciador de Mapas Offline
              </h4>
              <p className="meta text-[10px] text-[#1a1a1a]/50">
                NAVEGAÇÃO VETORIAL SEM SINAL DE CELULAR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#1a1a1a]/40 hover:text-[#1a1a1a] text-lg font-bold p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cache status banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <HardDrive className="w-5 h-5 text-[#2c52a1]" />
            <div>
              <span className="meta text-[10px] text-[#1a1a1a]/60 block">ARMAZENAMENTO EM CACHE</span>
              <span className="font-mono-numbers text-base font-bold text-[#1a1a1a]">
                {totalCachedMb.toFixed(1)} MB gravados
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`meta text-[10px] px-3 py-1 rounded-full font-bold border ${
                offlineReady
                  ? 'bg-blue-50 text-[#2c52a1] border-blue-200'
                  : 'bg-white text-[#1a1a1a]/60 border-[#1a1a1a]/20'
              }`}
            >
              {offlineReady ? '✓ 100% OFFLINE READY' : 'ONLINE'}
            </span>
          </div>
        </div>

        {/* List of Regions */}
        <div className="space-y-3">
          <span className="meta text-[10px] text-[#1a1a1a]/60 block font-bold">
            REGIÕES & ROTAS DETALHADAS:
          </span>

          <div className="space-y-3">
            {regions.map((region) => {
              const isDownloading = downloadingId === region.id;
              return (
                <div
                  key={region.id}
                  className="p-4 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-serif-display font-bold text-[#1a1a1a] text-base">
                        {region.name}
                      </h5>
                      <span className="meta text-[10px] text-[#1a1a1a]/60 flex items-center gap-2 mt-0.5">
                        <span>{region.sizeMb} MB</span>
                        <span>•</span>
                        <span>{region.coverage}</span>
                        <span>•</span>
                        <span>Zoom: {region.zoomLevels}</span>
                      </span>
                    </div>

                    {region.downloaded ? (
                      <span className="meta text-[10px] px-3 py-1 rounded-full bg-blue-50 text-[#2c52a1] border border-blue-200 font-bold flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Baixado
                      </span>
                    ) : (
                      <span className="meta text-[10px] px-3 py-1 rounded-full bg-white text-[#1a1a1a]/60 border border-[#1a1a1a]/20 shrink-0">
                        Disponível
                      </span>
                    )}
                  </div>

                  {isDownloading ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between meta text-[10px] text-[#2c52a1] font-bold">
                        <span>Baixando blocos de mapa e curvas de nível...</span>
                        <span className="font-mono-numbers">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#1a1a1a]/10">
                        <div
                          className="h-full bg-[#2c52a1] rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]/10">
                      <span className="meta text-[10px] text-[#1a1a1a]/40">{region.lastUpdate}</span>
                      {region.downloaded ? (
                        <button
                          onClick={() => removeRegion(region.id)}
                          className="meta text-[10px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Excluir
                        </button>
                      ) : (
                        <button
                          onClick={() => startDownload(region.id)}
                          className="px-4 py-1.5 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white font-mono-numbers uppercase font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
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
          className="w-full py-3 rounded-full bg-[#f8f7f4] hover:bg-[#eae8e3] text-[#1a1a1a] border border-[#1a1a1a]/10 font-mono-numbers uppercase text-xs font-bold transition-colors cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
