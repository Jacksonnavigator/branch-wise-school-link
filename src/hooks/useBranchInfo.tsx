import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const useBranchInfo = () => {
  const { profile } = useAuth();
  const [branchName, setBranchName] = useState<string>('');

  useEffect(() => {
    const fetchBranchName = async () => {
      if (!profile?.branch_id) {
        setBranchName('No Branch');
        return;
      }

      try {
        const { data: branch, error } = await supabase
          .from('branches')
          .select('name')
          .eq('id', profile.branch_id)
          .single();

        if (error) throw error;
        
        setBranchName(branch?.name || 'Unknown Branch');
      } catch (error) {
        console.error('Error fetching branch info:', error);
        setBranchName('Error Loading Branch');
      }
    };

    fetchBranchName();
  }, [profile?.branch_id]);

  return branchName;
};

export default useBranchInfo;