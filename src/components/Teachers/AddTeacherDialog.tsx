import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AddTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeacherAdded: () => void;
}

const AddTeacherDialog: React.FC<AddTeacherDialogProps> = ({
  open,
  onOpenChange,
  onTeacherAdded
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subjects: '',
    qualification: '',
    experience: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.branch_id) return;
    
    setIsSubmitting(true);

    try {
      // Create teacher account with temporary password
      const tempPassword = 'teacher123'; // They'll need to reset this
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, tempPassword);
      
      if (userCredential.user) {
        // Create teacher profile
        await addDoc(collection(db, 'users'), {
          user_id: userCredential.user.uid,
          email: formData.email,
          full_name: formData.name,
          role: 'teacher',
          branch_id: profile.branch_id,
          phone: formData.phone,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      toast({
        title: "Success",
        description: `Teacher account created. Default password: ${tempPassword}`,
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        subjects: '',
        qualification: '',
        experience: '',
      });
      
      onTeacherAdded();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding teacher:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add teacher. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter teacher's full name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjects">Subjects (comma-separated)</Label>
            <Input
              id="subjects"
              placeholder="e.g., Mathematics, Physics, Chemistry"
              value={formData.subjects}
              onChange={(e) => setFormData(prev => ({ ...prev, subjects: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualification">Qualification</Label>
            <Input
              id="qualification"
              placeholder="e.g., M.Sc. Mathematics, B.Ed."
              value={formData.qualification}
              onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Textarea
              id="experience"
              placeholder="Brief description of teaching experience"
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> A teacher account will be created with temporary password "teacher123". 
              The teacher should change this password on first login.
            </p>
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
              {isSubmitting ? 'Adding...' : 'Add Teacher'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeacherDialog;
