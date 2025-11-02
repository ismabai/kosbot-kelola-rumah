import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePropertyActions = () => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteProperty = async (propertyId: string, onSuccess?: () => void) => {
    setIsDeleting(true);
    try {
      // First check if there are rooms
      const { data: rooms } = await supabase
        .from('rooms')
        .select('id')
        .eq('property_id', propertyId);

      if (rooms && rooms.length > 0) {
        toast({
          title: 'Cannot delete',
          description: 'Please remove all rooms from this property first',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Property deleted successfully',
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete property',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteProperty, isDeleting };
};
