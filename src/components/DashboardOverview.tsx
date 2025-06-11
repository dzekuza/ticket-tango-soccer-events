
import React from 'react';
import { Ticket, DollarSign, Users, CheckCircle } from 'lucide-react';
import { Ticket as TicketType } from './Dashboard';

interface DashboardOverviewProps {
  tickets: TicketType[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ tickets }) => {
  const totalEvents = tickets.length;
  const totalTickets = tickets.reduce((sum, batch) => sum + batch.tickets.length, 0);
  const totalRevenue = tickets.reduce((sum, batch) => sum + (batch.price * batch.quantity), 0);
  const validatedTickets = tickets.reduce((sum, batch) => 
    sum + batch.tickets.filter(ticket => ticket.isUsed).length, 0
  );

  const stats = [
    {
      title: 'Total Events',
      value: totalEvents,
      icon: Ticket,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Tickets',
      value: totalTickets,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      title: 'Validated',
      value: validatedTickets,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Manage your soccer event tickets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Events</h2>
          {tickets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events created yet. Start by creating your first ticket batch!</p>
          ) : (
            <div className="space-y-4">
              {tickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{ticket.eventTitle}</h3>
                    <p className="text-sm text-gray-500">{ticket.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${ticket.price}</p>
                    <p className="text-sm text-gray-500">{ticket.quantity} tickets</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
