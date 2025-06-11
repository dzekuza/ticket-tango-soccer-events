
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { IndividualTicket } from './Dashboard';

interface ScanResultProps {
  ticket: IndividualTicket;
}

export const ScanResult: React.FC<ScanResultProps> = ({ ticket }) => {
  return (
    <Card className={`${ticket.isUsed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{ticket.eventTitle || 'Event'}</h3>
            <p className="text-sm text-gray-600">Price: ${ticket.price}</p>
            <p className="text-sm text-gray-600">Ticket ID: {ticket.id}</p>
          </div>
          <Badge 
            variant={ticket.isUsed ? "default" : "destructive"}
            className="flex items-center space-x-1"
          >
            {ticket.isUsed ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            <span>{ticket.isUsed ? 'Valid' : 'Already Used'}</span>
          </Badge>
        </div>
        {ticket.validatedAt && (
          <p className="text-xs text-gray-500 mt-2">
            Validated: {new Date(ticket.validatedAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
