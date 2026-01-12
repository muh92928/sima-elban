"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

export interface LayoutContextType {
  isComplaintVisible: boolean;
  setIsComplaintVisible: Dispatch<SetStateAction<boolean>>;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [isComplaintVisible, setIsComplaintVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <LayoutContext.Provider value={{ isComplaintVisible, setIsComplaintVisible, isModalOpen, setIsModalOpen }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
