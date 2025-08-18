import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
        const branchDoc = await getDoc(doc(db, 'branches', profile.branch_id));
        if (branchDoc.exists()) {
          setBranchName(branchDoc.data()?.name || 'Unknown Branch');
        } else {
          setBranchName('Unknown Branch');
        }
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