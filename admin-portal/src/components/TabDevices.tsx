import React, { useState } from 'react';
import { Shield, Tablet, Key, Clock, Award, CheckCircle, XCircle } from 'lucide-react';

interface Device {
  id: string;
  deviceFingerprintHash: string;
  publicKey: string;
  phoneHash: string | null;
  createdAt: string;
  lastSeenAt: string | null;
}

interface Capsule {
  id: string;
  episodeId: string;
  helperDeviceId: string;
  signedTokenHash: string;
  status: string; // issued/redeemed/expired/revoked
  blindedGridCell: string | null;
  issuedAt: string;
  expiresAt: string;
  redeemedAt: string | null;
}

interface TabDevicesProps {
  devices: Device[];
  capsules: Capsule[];
}

export default function TabDevices({ devices, capsules }: TabDevicesProps) {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const getStatusChip = (status: string) => {
    switch (status.toLowerCase()) {
      case 'redeemed':
        return 'text-emerald-800 bg-emerald-100 border border-emerald-500/40';
      case 'issued':
        return 'text-[#0051c6] bg-[#dae2ff] border border-[#0051c6]/30';
      case 'expired':
        return 'text-[#5f3f3a] bg-[#eeeeee] border border-[#1b1b1b]/20';
      default:
        return 'text-[#ba1a1a] bg-[#ffdad6] border border-[#ba1a1a]/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'redeemed':
        return <CheckCircle className="h-3 w-3 text-emerald-400" />;
      case 'issued':
        return <Clock className="h-3 w-3 text-blue-400 animate-pulse" />;
      default:
        return <XCircle className="h-3 w-3 text-slate-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* Devices Section (Claymorphism `clay-card`) */}
      <div className="col-span-12 lg:col-span-7 clay-card p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1b1b1b]/20 pb-3">
          <div>
            <h2 className="text-xs font-bold font-mono tracking-wider text-[#1b1b1b] uppercase flex items-center gap-2">
              <Tablet className="h-4 w-4 text-[#b60100] animate-pulse" />
              Verified Hardware Device Registry
              <span className="text-[9px] font-mono px-2 py-0.5 rounded clay-badge text-[#1b1b1b]">3D HARDWARE</span>
            </h2>
            <p className="text-[10px] text-[#5f3f3a] mt-0.5">Authorized devices permitted to instantiate trust protocols</p>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1b1b1b]/20 text-[#5f3f3a] text-[10px] font-mono uppercase tracking-wider">
                <th className="py-3 px-3.5">Device ID</th>
                <th className="py-3 px-3.5">Fingerprint Hash</th>
                <th className="py-3 px-3.5">Phone Hash</th>
                <th className="py-3 px-3.5">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1b1b]/10 font-mono text-[11px]">
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-[#5f3f3a] font-mono text-xs">
                    No hardware devices registered.
                  </td>
                </tr>
              ) : (
                devices.map((dev) => (
                  <tr
                    key={dev.id}
                    onClick={() => setSelectedDevice(dev)}
                    className={`transition-all group cursor-pointer ${
                      selectedDevice?.id === dev.id
                        ? 'clay-box !bg-[#dae2ff] font-bold shadow-md'
                        : 'hover:bg-[#1b1b1b]/5'
                    }`}
                  >
                    <td className="py-3.5 px-3.5 text-[#1b1b1b] font-bold select-all">
                      {dev.id.substring(0, 8)}...
                    </td>
                    <td className="py-3.5 px-3.5 text-[#0051c6] select-all font-mono font-bold" title={dev.deviceFingerprintHash}>
                      <code className="bg-[#e2e2e2] px-2 py-1 rounded text-[10px]">{dev.deviceFingerprintHash.substring(0, 12)}...</code>
                    </td>
                    <td className="py-3.5 px-3.5 text-[#1b1b1b]">
                      {dev.phoneHash ? <code className="bg-[#e2e2e2] px-2 py-0.5 rounded font-bold">{dev.phoneHash.substring(0, 8)}...</code> : <span className="text-[#5f3f3a]">NULL</span>}
                    </td>
                    <td className="py-3.5 px-3.5 text-[#5f3f3a]">
                      {new Date(dev.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Inspector Detail Panel (Neomorphism `neuo-card` & `neuo-inset`) */}
      <div className="col-span-12 lg:col-span-5 neuo-card p-6 flex flex-col gap-4 shadow-xl">
        <div className="border-b border-[#1b1b1b]/20 pb-3">
          <h2 className="text-xs font-bold font-mono tracking-wider text-[#0051c6] uppercase flex items-center gap-2">
            <Key className="h-4 w-4 text-[#0051c6] animate-bounce" />
            Hardware Credentials Auditor
            <span className="text-[8px] bg-[#dae2ff] text-[#0051c6] px-2 py-0.5 rounded border border-[#0051c6]/30 font-bold">ED25519</span>
          </h2>
          <p className="text-[10px] text-[#5f3f3a] mt-0.5">Inspect device key vectors and timestamps</p>
        </div>

        {selectedDevice ? (
          <div className="space-y-4 font-mono text-[11px] text-[#1b1b1b] animate-fade-in">
            <div className="neuo-inset p-3.5 rounded-xl border border-[#1b1b1b]/10">
              <span className="text-[#0051c6] block uppercase font-bold text-[9px] mb-1">Device Entity Identifier</span>
              <span className="text-[#1b1b1b] select-all text-xs font-bold font-mono">{selectedDevice.id}</span>
            </div>
            <div className="neuo-inset p-3.5 rounded-xl border border-[#1b1b1b]/10">
              <span className="text-[#0051c6] block uppercase font-bold text-[9px] mb-1">Fingerprint SHA-256 Vector</span>
              <span className="text-[#1b1b1b] break-all select-all font-mono text-[10px] font-bold">{selectedDevice.deviceFingerprintHash}</span>
            </div>
            <div className="neuo-inset p-3.5 rounded-xl border border-[#1b1b1b]/10">
              <span className="text-[#0051c6] block uppercase font-bold text-[9px] mb-1">Hardware Ed25519 Public Key</span>
              <div className="bg-[#e2e2e2] border border-[#1b1b1b]/10 p-3 rounded-lg text-[9px] text-emerald-800 font-bold break-all select-all font-mono shadow-inner">
                {selectedDevice.publicKey}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1b1b1b]/15 text-[10px]">
              <div className="neuo-outset p-3 rounded-xl">
                <span className="text-[#5f3f3a] block uppercase font-bold text-[8px] mb-0.5">First Registered</span>
                <span className="text-[#1b1b1b] font-mono font-bold">{new Date(selectedDevice.createdAt).toLocaleString()}</span>
              </div>
              <div className="neuo-outset p-3 rounded-xl">
                <span className="text-[#5f3f3a] block uppercase font-bold text-[8px] mb-0.5">Network Activity Ping</span>
                <span className="text-emerald-700 font-bold font-mono">
                  {selectedDevice.lastSeenAt ? new Date(selectedDevice.lastSeenAt).toLocaleString() : 'STANDBY'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center neuo-inset rounded-xl py-14 text-[#5f3f3a] text-center font-mono text-xs p-6 border border-dashed border-[#1b1b1b]/20">
            Select a verified hardware row to audit cryptographic credentials
          </div>
        )}
      </div>

      {/* Trust Capsules Log Section (Claymorphism `clay-card`) */}
      <div className="col-span-12 clay-card p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1b1b1b]/20 pb-3">
          <div>
            <h2 className="text-xs font-bold font-mono tracking-wider text-[#1b1b1b] uppercase flex items-center gap-2">
              <Award className="h-4 w-4 text-[#0051c6]" />
              Active Cryptographic Trust Capsules Monitor
              <span className="text-[8px] px-2 py-0.5 rounded clay-badge text-[#1b1b1b] font-bold">ZERO-KNOWLEDGE</span>
            </h2>
            <p className="text-[10px] text-[#5f3f3a] mt-0.5">One-Time location trust keys generated, redeemed or expired</p>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1b1b1b]/20 text-[#5f3f3a] text-[10px] font-mono uppercase tracking-wider">
                <th className="py-3 px-3.5">Capsule ID</th>
                <th className="py-3 px-3.5">Session Episode</th>
                <th className="py-3 px-3.5">Helper ID</th>
                <th className="py-3 px-3.5">Blinded Location Hash</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Issued Timestamp</th>
                <th className="py-3 px-3.5">Expires Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1b1b]/10 font-mono text-[11px]">
              {capsules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#5f3f3a] font-mono text-xs">
                    No active trust capsules generated on key-rotation loops.
                  </td>
                </tr>
              ) : (
                capsules.map((cap) => (
                  <tr key={cap.id} className="hover:bg-[#1b1b1b]/5 transition-all group">
                    <td className="py-3.5 px-3.5 text-[#1b1b1b] font-bold select-all">
                      {cap.id.substring(0, 8)}...
                    </td>
                    <td className="py-3.5 px-3.5 text-[#0051c6] select-all font-mono font-bold">
                      <code className="bg-[#e2e2e2] px-2 py-1 rounded text-[10px]">{cap.episodeId.substring(0, 8)}...</code>
                    </td>
                    <td className="py-3.5 px-3.5 text-[#1b1b1b] select-all font-mono">
                      <code className="bg-[#e2e2e2] px-2 py-1 rounded text-[10px]">{cap.helperDeviceId.substring(0, 8)}...</code>
                    </td>
                    <td className="py-3.5 px-3.5 text-[#5f3f3a] truncate max-w-[140px] font-mono" title={cap.blindedGridCell || ''}>
                      {cap.blindedGridCell ? <code className="bg-[#e2e2e2] px-2 py-0.5 rounded text-[10px] font-bold">{cap.blindedGridCell.substring(0, 16)}...</code> : <span className="text-[#5f3f3a]">NULL</span>}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] px-3 py-1 rounded-full font-bold shadow-sm ${getStatusChip(cap.status)}`}>
                        {getStatusIcon(cap.status)}
                        {cap.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 text-[#5f3f3a]">
                      {new Date(cap.issuedAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-3.5 text-[#5f3f3a]">
                      {new Date(cap.expiresAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
