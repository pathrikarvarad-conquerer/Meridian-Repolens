import React, { createContext, useContext, useState } from 'react';
import { UserMode } from '../types';

interface UserModeContextType {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
  toggleMode: () => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export const UserModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<UserMode>(() => {
    const saved = localStorage.getItem('repolens-mode') as UserMode;
    return saved === 'enterprise' ? 'enterprise' : 'beginner';
  });

  const setMode = (newMode: UserMode) => {
    setModeState(newMode);
    localStorage.setItem('repolens-mode', newMode);
  };

  const toggleMode = () => {
    const next = mode === 'beginner' ? 'enterprise' : 'beginner';
    setMode(next);
  };

  return (
    <UserModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </UserModeContext.Provider>
  );
};

export const useUserMode = () => {
  const context = useContext(UserModeContext);
  if (!context) throw new Error('useUserMode must be used within UserModeProvider');
  return context;
};
