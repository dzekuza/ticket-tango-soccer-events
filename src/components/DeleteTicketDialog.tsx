
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Ticket } from './Dashboard';
import { useTicketDeletion } from '@/hooks/useTicketDeletion';

interface DeleteTicketDialogProps {
  ticket: Ticket;
  onTicketDeleted: () => void;
}

export const DeleteTicketDialog: React.FC<DeleteTicketDialogProps> = ({ 
  ticket, 
  onTicketDeleted 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteTicket } = useTicketDeletion();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteTicket(ticket.id);
      if (success) {
        onTicketDeleted();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const validatedCount = ticket.tickets.filter(t => t.isUsed).length;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          <Trash className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Ticket Batch</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete "{ticket.eventTitle}"? This action cannot be undone.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
              <p className="text-sm font-medium text-yellow-800">This will permanently delete:</p>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                <li>• {ticket.quantity} individual tickets</li>
                <li>• All pricing tier information</li>
                <li>• PDF files and QR codes</li>
                {validatedCount > 0 && (
                  <li className="font-medium">• {validatedCount} already validated tickets</li>
                )}
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete Ticket Batch"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
