
import React from 'react';
import { Ticket, QrCode, BarChart3, Scan } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'create', label: 'Create Tickets', icon: Ticket },
    { id: 'manage', label: 'Manage Tickets', icon: QrCode },
    { id: 'scanner', label: 'Scanner', icon: Scan },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Ticket className="w-8 h-8 text-green-600" />
          <h1 className="text-xl font-bold text-gray-900">TicketManager</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Soccer Event Tickets</p>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
