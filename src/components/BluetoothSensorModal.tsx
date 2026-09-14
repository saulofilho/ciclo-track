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
    <div className="fixed inset-0 z-50 bg-[#1a1a1a]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#1a1a1a]/10 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f8f7f4] border border-[#1a1a1a]/10 text-[#2c52a1] flex items-center justify-center">
              <Bluetooth className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif-display text-xl font-bold text-[#1a1a1a]">
                Sensor Cardíaco Bluetooth
              </h4>
              <p className="meta text-[10px] text-[#1a1a1a]/50">
                SINCRONIZAÇÃO BLE & TELEMETRIA BPM
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

        {/* Current Connection Status */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#f8f7f4] border border-[#1a1a1a]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart
              className={`w-8 h-8 ${
                sensor.connected ? 'text-rose-600 animate-pulse fill-rose-600' : 'text-[#1a1a1a]/30'
              }`}
            />
            <div>
              <span className="meta text-[10px] text-[#1a1a1a]/50 block">STATUS DE CONEXÃO</span>
              <span className="font-bold text-sm text-[#1a1a1a]">
                {sensor.connected
                  ? `${sensor.deviceName} (${sensor.isSimulated ? 'Simulado' : 'BLE Real'})`
                  : 'Nenhum sensor conectado'}
              </span>
            </div>
          </div>

          {sensor.connected && (
            <div className="text-right">
              <div className="font-mono-numbers text-xl font-bold text-[#1a1a1a]">
                {sensor.bpm} <span className="meta text-[10px] text-[#1a1a1a]/50">BPM</span>
              </div>
              <div className="flex items-center gap-1 meta text-[10px] text-[#1a1a1a]/60 justify-end">
                <Battery className="w-3 h-3 text-[#2c52a1]" />
                <span>{sensor.batteryLevel}%</span>
              </div>
            </div>
          )}
        </div>

        {statusMessage && (
          <p className="meta text-[10px] text-[#2c52a1] bg-blue-50 p-3 rounded-2xl border border-blue-200">
            {statusMessage}
          </p>
        )}

        {/* Real Web Bluetooth Button */}
        <button
          onClick={connectRealBluetooth}
          disabled={isScanning}
          className="w-full py-3 rounded-full bg-[#2c52a1] hover:bg-[#234285] text-white font-mono-numbers uppercase font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <Bluetooth className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Buscando Sensores BLE...' : 'Buscar Sensor Bluetooth (Web BLE)'}
        </button>

        {/* Virtual Simulators Presets */}
        <div className="space-y-2 pt-2 border-t border-[#1a1a1a]/10">
          <span className="meta text-[10px] text-[#1a1a1a]/60 block font-bold">
            OU CONECTAR DISPOSITIVO VIRTUAL / TESTE:
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => connectSimulated('Polar H10 Cinta Peitoral')}
              className="p-3 rounded-2xl bg-[#f8f7f4] hover:bg-[#eae8e3] text-[#1a1a1a] border border-[#1a1a1a]/10 text-xs font-mono-numbers text-left transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Polar H10</span>
              <Radio className="w-3.5 h-3.5 text-[#2c52a1]" />
            </button>
            <button
              onClick={() => connectSimulated('Garmin HRM-Pro Plus')}
              className="p-3 rounded-2xl bg-[#f8f7f4] hover:bg-[#eae8e3] text-[#1a1a1a] border border-[#1a1a1a]/10 text-xs font-mono-numbers text-left transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>Garmin HRM-Pro</span>
              <Radio className="w-3.5 h-3.5 text-[#2c52a1]" />
            </button>
          </div>
        </div>

        {/* Disconnect button */}
        {sensor.connected && (
          <button
            onClick={disconnect}
            className="w-full py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-mono-numbers uppercase text-xs font-bold transition-colors cursor-pointer"
          >
            Desconectar Sensor
          </button>
        )}
      </div>
    </div>
  );
};
