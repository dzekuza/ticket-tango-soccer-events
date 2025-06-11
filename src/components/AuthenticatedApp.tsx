
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import Dashboard from './Dashboard';

export const AuthenticatedApp: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base truncate">
              <span className="hidden sm:inline">Welcome, </span>
              {user?.email}
            </span>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1 sm:space-x-2 ml-2 flex-shrink-0"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Out</span>
          </Button>
        </div>
      </header>
      <Dashboard />
    </div>
  );
};
