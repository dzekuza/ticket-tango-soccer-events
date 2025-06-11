
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Scan, CheckCircle, XCircle } from 'lucide-react';
import { Ticket } from './Dashboard';

interface ValidationStatsProps {
  tickets: Ticket[];
}

export const ValidationStats: React.FC<ValidationStatsProps> = ({ tickets }) => {
  const getValidationStats = () => {
    const totalTickets = tickets.reduce((sum, batch) => sum + batch.tickets.length, 0);
    const validatedTickets = tickets.reduce((sum, batch) => 
      sum + batch.tickets.filter(ticket => ticket.isUsed).length, 0
    );
    return { total: totalTickets, validated: validatedTickets };
  };

  const stats = getValidationStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Scan className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Total Tickets</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-600">Validated</p>
          <p className="text-2xl font-bold text-gray-900">{stats.validated}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-sm text-gray-600">Remaining</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total - stats.validated}</p>
        </CardContent>
      </Card>
    </div>
  );
};
