import React, { createContext, useContext, useState, useEffect } from 'react';
import { Note } from '@/interfaces/note';

type NoteContextType = {
  currentNote: string;
  setCurrentNote: React.Dispatch<React.SetStateAction<string>>;
  Notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
};

const NoteContext = createContext<NoteContextType | null>(null);

// Check if running in development mode
const isTestEnvironment = __DEV__;

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [currentNote, setCurrentNote] = useState<string>('home');
  const [Notes, setNotes] = useState<Note[]>([]);

  return (
    <NoteContext.Provider 
      value={{ 
        currentNote,
        setCurrentNote,
        Notes,
        setNotes,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}

export function useNote() {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNote must be used within an NoteProvider');
  }
  return context;
}