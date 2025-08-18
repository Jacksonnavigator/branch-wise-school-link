import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Phone, Users, UserCheck, Edit, Save, X } from 'lucide-react';
import { doc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Branch {
  id: string;
  name: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
}

interface BranchDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
  onBranchUpdated: () => void;
  canEdit: boolean;
}

const BranchDetailsDialog: React.FC<BranchDetailsDialogProps> = ({
  open,
  onOpenChange,
  branch,
  onBranchUpdated,
  canEdit
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({ students: 0, teachers: 0 });
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_email: '',
    contact_phone: '',
  });

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name,
        address: branch.address,
        contact_email: branch.contact_email,
        contact_phone: branch.contact_phone,
      });
      fetchBranchStats();
    }
  }, [branch]);

  const fetchBranchStats = async () => {
    if (!branch) return;
    
    try {
      // Fetch students count
      const studentsQuery = query(
        collection(db, 'students'),
        where('branch_id', '==', branch.id)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      
      // Fetch teachers count
      const teachersQuery = query(
        collection(db, 'profiles'),
        where('role', '==', 'teacher'),
        where('branch_id', '==', branch.id)
      );
      const teachersSnapshot = await getDocs(teachersQuery);
      
      setStats({
        students: studentsSnapshot.size,
        teachers: teachersSnapshot.size,
      });
    } catch (error) {
      console.error('Error fetching branch stats:', error);
    }
  };

  const handleSave = async () => {
    if (!branch) return;
    
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'branches', branch.id), {
        ...formData,
        updated_at: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Branch details updated successfully.",
      });

      setIsEditing(false);
      onBranchUpdated();
    } catch (error) {
      console.error('Error updating branch:', error);
      toast({
        title: "Error",
        description: "Failed to update branch details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (branch) {
      setFormData({
        name: branch.name,
        address: branch.address,
        contact_email: branch.contact_email,
        contact_phone: branch.contact_phone,
      });
    }
    setIsEditing(false);
  };

  if (!branch) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Branch Details</span>
            {canEdit && !isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Branch Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <p className="text-foreground font-medium">{branch.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Badge variant="secondary" className="w-fit">
                Active
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            {isEditing ? (
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
              />
            ) : (
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <p className="text-foreground">{branch.address}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              {isEditing ? (
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{branch.contact_email}</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              {isEditing ? (
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{branch.contact_phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Branch Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold text-foreground">{stats.students}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Teachers</p>
                    <p className="text-2xl font-bold text-foreground">{stats.teachers}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-secondary" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="flex-1 gradient-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BranchDetailsDialog;
