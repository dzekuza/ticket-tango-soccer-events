
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Ticket } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const ResponsiveHeader: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        {!isMobile && <SidebarTrigger className="mr-4" />}
        
        {isMobile && (
          <div className="flex items-center space-x-2">
            <Ticket className="w-6 h-6 text-green-600" />
            <div>
              <h1 className="text-lg font-bold text-foreground">TicketManager</h1>
            </div>
          </div>
        )}
        
        <div className="flex-1" />
        
        {/* Add any header actions here in the future */}
      </div>
    </header>
  );
};
