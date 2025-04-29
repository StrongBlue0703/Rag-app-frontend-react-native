import React, { createContext, useState, useContext, ReactNode } from 'react';

interface FileUploadContextType {
  uploadProgress: number;
  isUploading: boolean;
  setUploadProgress: (progress: number) => void;
  setIsUploading: (uploading: boolean) => void;
}

const FileUploadProgressContext = createContext<FileUploadContextType | undefined>(undefined);

export const FileUploadProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  return (
    <FileUploadProgressContext.Provider 
      value={{ 
        uploadProgress, 
        isUploading, 
        setUploadProgress, 
        setIsUploading 
      }}
    >
      {children}
    </FileUploadProgressContext.Provider>
  );
};

export const useFileUpload = () => {
  const context = useContext(FileUploadProgressContext);
  if (context === undefined) {
    throw new Error('useFileUpload must be used within a FileUploadProvider');
  }
  return context;
};
