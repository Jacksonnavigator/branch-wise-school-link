import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentAdded: () => void;
}

const AddStudentDialog: React.FC<AddStudentDialogProps> = ({
  open,
  onOpenChange,
  onStudentAdded
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    admissionNumber: '',
    class: '',
    dateOfBirth: '',
    gender: '',
    parentContactName: '',
    parentContactEmail: '',
    parentContactPhone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.branch_id) return;
    
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'students'), {
        full_name: formData.fullName,
        admission_number: formData.admissionNumber,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender as 'male' | 'female',
        guardian_name: formData.parentContactName,
        guardian_email: formData.parentContactEmail,
        guardian_phone: formData.parentContactPhone,
        branch_id: profile.branch_id,
        parent_id: null,
        class_id: profile.branch_id, // For now, using branch_id as class_id
        created_at: new Date(),
        updated_at: new Date()
      });

      toast({
        title: "Success",
        description: "Student has been added successfully.",
      });

      setFormData({
        fullName: '',
        admissionNumber: '',
        class: '',
        dateOfBirth: '',
        gender: '',
        parentContactName: '',
        parentContactEmail: '',
        parentContactPhone: '',
      });
      
      onStudentAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter student's full name"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admissionNumber">Admission Number</Label>
              <Input
                id="admissionNumber"
                placeholder="Enter admission number"
                value={formData.admissionNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, admissionNumber: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={formData.class} onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {['Form One', 'Form Two', 'Form Three', 'Form Four'].map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Parent/Guardian Information</h4>
            
            <div className="space-y-2">
              <Label htmlFor="parentContactName">Parent/Guardian Name</Label>
              <Input
                id="parentContactName"
                placeholder="Enter parent/guardian name"
                value={formData.parentContactName}
                onChange={(e) => setFormData(prev => ({ ...prev, parentContactName: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentContactEmail">Email</Label>
                <Input
                  id="parentContactEmail"
                  type="email"
                  placeholder="Enter parent email"
                  value={formData.parentContactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentContactEmail: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentContactPhone">Phone</Label>
                <Input
                  id="parentContactPhone"
                  type="tel"
                  placeholder="Enter parent phone"
                  value={formData.parentContactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, parentContactPhone: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 gradient-primary"
            >
              {isSubmitting ? 'Adding...' : 'Add Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentDialog;