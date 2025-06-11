// This component has been replaced by AppSidebar.tsx
// Keeping this file temporarily to avoid breaking imports
// TODO: Remove this file after confirming everything works

import React from 'react';
import { Ticket, QrCode, BarChart3, Scan } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  // Deprecated - use AppSidebar instead
  return null;
};
