import React, { createContext, useContext, useState, useEffect } from 'react';

type PageContextType = {
  currentPage: string;
  setCurrentPage: (page: string) => void;
};

const PageContext = createContext<PageContextType | null>(null);

// Check if running in development mode
const isTestEnvironment = __DEV__;

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<string>('home');

  return (
    <PageContext.Provider 
      value={{ 
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used within an PageProvider');
  }
  return context;
}