import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    logo_url: null,
    primary_color: '#FF0000',
    secondary_color: '#00CED1',
    accent_color: '#E6007E',
    background_color: '#050505',
    hero_image_url: 'https://images.unsplash.com/photo-1760979191911-70a8c01ed015?crop=entropy&cs=srgb&fm=jpg&q=85',
    event_start_date: '20 de Febrero 2026',
    event_end_date: '22 de Febrero 2026',
    event_location: 'Corona Club XP, Popayán',
    hero_title: 'CAMPEONATO INTERLIGAS',
    hero_subtitle: 'SUPER GP',
    hero_description: 'Vive la emoción del motociclismo extremo. 28 categorías, 3 días de competencia, adrenalina sin límites.',
    footer_text: '© 2026 Corona Club XP. Todos los derechos reservados.',
    footer_email: 'contacto@coronaclubxp.com',
    footer_phone: '+57 300 123 4567',
    footer_address: 'Avenida Panamericana, Km 9 El Cofre',
    instagram_url: 'https://instagram.com/coronaclubxp',
    facebook_url: 'https://facebook.com/coronaclubxp',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      if (response.data.settings) {
        setSettings((prev) => ({ ...prev, ...response.data.settings }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    fetchSettings();
  };

  useEffect(() => {
    if (!loading) {
      document.documentElement.style.setProperty('--color-primary', settings.primary_color);
      document.documentElement.style.setProperty('--color-secondary', settings.secondary_color);
      document.documentElement.style.setProperty('--color-accent', settings.accent_color);
      document.documentElement.style.setProperty('--color-background', settings.background_color);
    }
  }, [settings, loading]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
