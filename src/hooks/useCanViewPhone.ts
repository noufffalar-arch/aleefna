import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCanViewPhone = () => {
  const { user, profile } = useAuth();
  const [canViewPhone, setCanViewPhone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      if (!user) {
        setCanViewPhone(false);
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data: isAdmin } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      // Check if user is shelter (association)
      const isShelter = profile?.role === 'shelter';

      setCanViewPhone(isAdmin === true || isShelter);
      setLoading(false);
    };

    checkPermission();
  }, [user, profile]);

  return { canViewPhone, loading };
};
