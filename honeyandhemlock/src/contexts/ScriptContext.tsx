
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Script {
  id: string;
  title: string;
  uploadedBy: string;
  status: 'pending' | 'assigned' | 'approved' | 'declined';
  assignedJudge?: string;
  dateSubmitted: string;
  feedback?: string;
  paymentStatus: 'pending' | 'paid';
  file?: File;
}

interface ScriptContextType {
  scripts: Script[];
  addScript: (script: Omit<Script, 'id' | 'dateSubmitted'>) => void;
  updateScript: (id: string, updates: Partial<Script>) => void;
  getUserScripts: () => Script[];
  getJudgeScripts: (judgeEmail: string) => Script[];
}

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export const useScripts = () => {
  const context = useContext(ScriptContext);
  if (context === undefined) {
    throw new Error('useScripts must be used within a ScriptProvider');
  }
  return context;
};

export const ScriptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scripts, setScripts] = useState<Script[]>([]);

  useEffect(() => {
    // Load scripts from localStorage
    const savedScripts = localStorage.getItem('scriptPortalScripts');
    if (savedScripts) {
      setScripts(JSON.parse(savedScripts));
    }
  }, []);

  useEffect(() => {
    // Save scripts to localStorage whenever they change
    localStorage.setItem('scriptPortalScripts', JSON.stringify(scripts));
  }, [scripts]);

  const addScript = (script: Omit<Script, 'id' | 'dateSubmitted'>) => {
    const newScript: Script = {
      ...script,
      id: Date.now().toString(),
      dateSubmitted: new Date().toISOString(),
    };
    setScripts(prev => [...prev, newScript]);
  };

  const updateScript = (id: string, updates: Partial<Script>) => {
    setScripts(prev => prev.map(script => 
      script.id === id ? { ...script, ...updates } : script
    ));
  };

  const getUserScripts = () => {
    const browserId = localStorage.getItem('browserId') || 'anonymous';
    return scripts.filter(script => script.uploadedBy === browserId);
  };

  const getJudgeScripts = (judgeEmail: string) => {
    return scripts.filter(script => script.assignedJudge === judgeEmail && script.status === 'assigned');
  };

  return (
    <ScriptContext.Provider value={{
      scripts,
      addScript,
      updateScript,
      getUserScripts,
      getJudgeScripts
    }}>
      {children}
    </ScriptContext.Provider>
  );
};
