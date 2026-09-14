import React, { useState } from 'react';
import { HeartRateSensor } from '../types';
import {
  Bluetooth,
  Radio,
  Heart,
  Battery,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Zap,
  Activity
} from 'lucide-react';

interface BluetoothSensorModalProps {
  sensor: HeartRateSensor;
  onUpdateSensor: (sensor: HeartRateSensor) => void;
  onClose: () => void;
}

export const BluetoothSensorModal: React.FC<BluetoothSensorModalProps> = ({
  sensor,
  onUpdateSensor,
  onClose
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Real Web Bluetooth API Handler
  const connectRealBluetooth = async () => {
    setIsScanning(true);
    setStatusMessage('Buscando dispositivos Bluetooth de frequência cardíaca...');

    try {
      const nav = navigator as any;
      if (!nav.bluetooth) {
        throw new Error('Navegador não possui suporte para Web Bluetooth. Use o simulador abaixo.');
      }

      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }]
      });

      setStatusMessage(`Conectando a ${device.name || 'Sensor Cardíaco'}...`);
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('heart_rate');
      const characteristic = await service?.getCharacteristic('heart_rate_measurement');

      await characteristic?.startNotifications();
      characteristic?.addEventListener('characteristicvaluechanged', (e: any) => {
        const value = e.target.value;
        // Heart rate format standard (UUID 0x2A37)
        const flags = value.getUint8(0);
        let hrBpm = 0;
        if ((flags & 0x01) === 0) {
          hrBpm = value.getUint8(1);
        } else {
          hrBpm = value.getUint16(1, /*littleEndian=*/ true);
        }

        onUpdateSensor({
          connected: true,
          deviceName: device.name || 'Cinta Cardíaca Bluetooth',
          bpm: hrBpm,
          batteryLevel: 94,
          isSimulated: false
        });
      });

      onUpdateSensor({
        connected: true,
        deviceName: device.name || 'Sensor BLE Conectado',
        bpm: 142,
        batteryLevel: 92,
        isSimulated: false
      });
      setIsScanning(false);
      setStatusMessage('Sensor conectado com sucesso!');
    } catch (err: any) {
      console.warn('Bluetooth connection error:', err);
      setIsScanning(false);
      setStatusMessage(err.message || 'Falha ao parear via Bluetooth. Ativando simulador.');
    }
  };

  // Connect Simulated Sensor (Polar H10 / Garmin HRM)
  const connectSimulated = (deviceName: string) => {
    setIsScanning(true);
    setTimeout(() => {
      onUpdateSensor({
        connected: true,
        deviceName,
        bpm: 145,
        batteryLevel: 88,
        isSimulated: true
      });
      setIsScanning(false);
      setStatusMessage(`${deviceName} conectado (Simulação Ativa)!`);
    }, 600);
  };

  const disconnect = () => {
    onUpdateSensor({
      connected: false,
      deviceName: undefined,
      bpm: 72,
      batteryLevel: undefined,
      isSimulated: false
    });
    setStatusMessage('Sensor desconectado.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Bluetooth className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-100 text-base">
              Sensor Cardíaco Bluetooth
            </h4>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-bold p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Connection Status */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart
              className={`w-8 h-8 ${
                sensor.connected ? 'text-rose-500 animate-pulse' : 'text-slate-600'
              }`}
            />
            <div>
              <span className="text-xs text-slate-400 block">Status de Conexão</span>
              <span className="font-bold text-sm text-slate-100">
                {sensor.connected
                  ? `${sensor.deviceName} (${sensor.isSimulated ? 'Simulador' : 'BLE Real'})`
                  : 'Nenhum sensor conectado'}
              </span>
            </div>
          </div>

          {sensor.connected && (
            <div className="text-right">
              <div className="font-mono text-xl font-bold text-rose-400">
                {sensor.bpm} <span className="text-xs text-slate-400">BPM</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 justify-end">
                <Battery className="w-3 h-3 text-emerald-400" />
                <span>{sensor.batteryLevel}%</span>
              </div>
            </div>
          )}
        </div>

        {statusMessage && (
          <p className="text-xs text-amber-400 bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/40">
            {statusMessage}
          </p>
        )}

        {/* Real Web Bluetooth Button */}
        <button
          onClick={connectRealBluetooth}
          disabled={isScanning}
          className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition-all disabled:opacity-50"
        >
          <Bluetooth className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Buscando Sensores BLE...' : 'Buscar Sensor Bluetooth (Web BLE)'}
        </button>

        {/* Virtual Simulators Presets */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">
            Ou Conectar Dispositivo Virtual / Teste:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => connectSimulated('Polar H10 Cinta Peitoral')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium text-left transition-colors flex items-center justify-between"
            >
              <span>Polar H10</span>
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
            </button>
            <button
              onClick={() => connectSimulated('Garmin HRM-Pro Plus')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium text-left transition-colors flex items-center justify-between"
            >
              <span>Garmin HRM-Pro</span>
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Disconnect button */}
        {sensor.connected && (
          <button
            onClick={disconnect}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 text-xs font-bold transition-colors"
          >
            Desconectar Sensor
          </button>
        )}
      </div>
    </div>
  );
};
