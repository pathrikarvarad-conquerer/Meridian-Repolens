import React, { createContext, useContext, useState } from 'react';
import { Evidence } from '../types';

interface EvidenceDrawerContextType {
  activeEvidence: Evidence | null;
  isOpen: boolean;
  openEvidence: (evidence: Evidence) => void;
  closeEvidence: () => void;
}

const EvidenceDrawerContext = createContext<EvidenceDrawerContextType | undefined>(undefined);

export const EvidenceDrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeEvidence, setActiveEvidence] = useState<Evidence | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openEvidence = (evidence: Evidence) => {
    setActiveEvidence(evidence);
    setIsOpen(true);
  };

  const closeEvidence = () => {
    setIsOpen(false);
  };

  return (
    <EvidenceDrawerContext.Provider value={{ activeEvidence, isOpen, openEvidence, closeEvidence }}>
      {children}
    </EvidenceDrawerContext.Provider>
  );
};

export const useEvidenceDrawer = () => {
  const context = useContext(EvidenceDrawerContext);
  if (!context) throw new Error('useEvidenceDrawer must be used within EvidenceDrawerProvider');
  return context;
};
