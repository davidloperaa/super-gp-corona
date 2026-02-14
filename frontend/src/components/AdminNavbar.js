import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Home, LogOut } from 'lucide-react';

export const AdminNavbar = ({ title }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-primary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
              data-testid="btn-back"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-heading text-sm uppercase">Atrás</span>
            </button>
            
            <Link
              to="/admin/dashboard"
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
              data-testid="btn-dashboard"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline font-heading text-sm uppercase">Dashboard</span>
            </Link>
          </div>

          {title && (
            <h1 className="font-heading text-lg font-bold uppercase text-white hidden md:block">
              {title}
            </h1>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-white/70 hover:text-red-500 transition-colors"
            data-testid="btn-logout-navbar"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline font-heading text-sm uppercase">Salir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
