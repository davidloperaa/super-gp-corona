import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QrCode, Check, Users, TrendingUp } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { AdminNavbar } from '../../components/AdminNavbar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminAsistencia = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedReg, setScannedReg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchStats(token);
  }, [navigate]);

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10,
      });

      scanner.render(handleScanSuccess, handleScanError);

      return () => {
        scanner.clear();
      };
    }
  }, [scanning]);

  const fetchStats = async (token) => {
    try {
      const response = await axios.get(`${API}/admin/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    try {
      const response = await axios.post(`${API}/qr/scan`, { qr_data: decodedText });
      setScannedReg(response.data);
      setScanning(false);
    } catch (error) {
      alert('QR inválido');
    }
  };

  const handleScanError = (error) => {
    // Ignore errors
  };

  const handleCheckIn = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      await axios.post(
        `${API}/admin/check-in`,
        { registration_id: scannedReg.registration.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Check-in exitoso');
      setScannedReg(null);
      fetchStats(token);
    } catch (error) {
      alert(error.response?.data?.detail || 'Error en check-in');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-5xl font-black uppercase text-glow-red mb-12">ASISTENCIA</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface border border-primary/50 p-6">
            <Users className="w-10 h-10 text-primary mb-3" />
            <p className="text-white/70 text-sm font-heading uppercase mb-1">Total Inscritos</p>
            <p className="font-heading text-4xl font-black text-primary">{stats?.total_registrations}</p>
          </div>

          <div className="bg-surface border border-secondary/50 p-6">
            <Check className="w-10 h-10 text-secondary mb-3" />
            <p className="text-white/70 text-sm font-heading uppercase mb-1">Check-in Realizados</p>
            <p className="font-heading text-4xl font-black text-secondary">{stats?.checked_in}</p>
          </div>

          <div className="bg-surface border border-warning/50 p-6">
            <TrendingUp className="w-10 h-10 text-warning mb-3" />
            <p className="text-white/70 text-sm font-heading uppercase mb-1">Tasa de Asistencia</p>
            <p className="font-heading text-4xl font-black text-warning">{stats?.attendance_rate?.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-surface border border-white/10 p-6">
            <h2 className="font-heading text-2xl font-bold uppercase mb-6">Escanear QR</h2>
            {!scanning ? (
              <button
                onClick={() => setScanning(true)}
                className="w-full bg-primary text-white font-heading font-bold uppercase px-8 py-4 hover:bg-primary/80 transition-colors"
              >
                <QrCode className="w-6 h-6 inline mr-2" />
                Activar Cámara
              </button>
            ) : (
              <div>
                <div id="qr-reader" className="w-full"></div>
                <button
                  onClick={() => setScanning(false)}
                  className="w-full mt-4 bg-surface text-white font-heading font-bold uppercase px-8 py-4 border border-white/20"
                >
                  Cancelar
                </button>
              </div>
            )}

            {scannedReg && (
              <div className="mt-6 p-6 bg-black/50 border border-secondary">
                <h3 className="font-heading text-xl font-bold mb-4">Información del Piloto</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-white/70">Nombre:</span> <strong>{scannedReg.registration.nombre} {scannedReg.registration.apellido}</strong></p>
                  <p><span className="text-white/70">Número:</span> <strong>#{scannedReg.registration.numero_competicion}</strong></p>
                  <p><span className="text-white/70">Categorías:</span> {scannedReg.registration.categorias.length}</p>
                  <p><span className="text-white/70">Pago:</span> <span className={scannedReg.registration.estado_pago === 'completado' ? 'text-secondary' : 'text-primary'}>{scannedReg.registration.estado_pago}</span></p>
                </div>
                {scannedReg.can_check_in ? (
                  <button
                    onClick={handleCheckIn}
                    className="w-full mt-4 bg-secondary text-black font-heading font-bold uppercase px-6 py-3 hover:bg-secondary/80"
                  >
                    Confirmar Check-in
                  </button>
                ) : (
                  <div className="mt-4 p-3 bg-warning/20 border border-warning text-center">
                    <p className="text-warning font-bold">Ya hizo check-in o pago pendiente</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-surface border border-white/10 p-6">
            <h2 className="font-heading text-2xl font-bold uppercase mb-6">Últimos Check-ins</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats?.checked_in_list?.map((reg, idx) => (
                <div key={idx} className="p-4 bg-black/50 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-heading font-bold">{reg.nombre} {reg.apellido}</p>
                      <p className="text-sm text-white/70">#{reg.numero_competicion}</p>
                    </div>
                    <p className="text-xs text-white/50">{new Date(reg.check_in_time).toLocaleTimeString('es-CO')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
