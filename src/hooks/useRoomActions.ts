import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRoomActions = () => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteRoom = async (roomId: string, onSuccess?: () => void) => {
    setIsDeleting(true);
    try {
      // Check if room is occupied
      const { data: room } = await supabase
        .from('rooms')
        .select('status')
        .eq('id', roomId)
        .single();

      if (room?.status === 'occupied') {
        toast({
          title: 'Cannot delete',
          description: 'Room is currently occupied. Please remove the tenant first',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Room deleted successfully',
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete room',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteRoom, isDeleting };
};
