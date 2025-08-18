import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Phone, Mail, BookOpen, Calendar, Save } from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  class: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  parent_contact_name: string;
  parent_contact_email: string;
  parent_contact_phone: string;
  branch_id: string;
  profile_photo?: string;
}

interface StudentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  isEditing: boolean;
  onStudentUpdated?: () => void;
}

const StudentDetailsDialog = ({ open, onOpenChange, student, isEditing, onStudentUpdated }: StudentDetailsDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Student>>(student || {});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (student) {
      setFormData(student);
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !isEditing) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'students', student.id), {
        ...formData,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Student information updated successfully.",
      });
      onStudentUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? 'Edit Student' : 'Student Details'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update student information' : 'View student profile and details'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.profile_photo} />
                <AvatarFallback className="text-lg">
                  {formData.full_name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="w-full space-y-2">
                  <Label htmlFor="profile_photo">Profile Photo URL</Label>
                  <Input
                    id="profile_photo"
                    value={formData.profile_photo || ''}
                    onChange={(e) => setFormData({ ...formData, profile_photo: e.target.value })}
                    placeholder="Enter image URL"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admission_number">Admission Number</Label>
                  <Input
                    id="admission_number"
                    value={formData.admission_number || ''}
                    onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    value={formData.class || ''}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth || ''}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  {isEditing ? (
                    <Select 
                      value={formData.gender} 
                      onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center h-10">
                      <Badge variant="outline" className="capitalize">
                        {formData.gender}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              Parent/Guardian Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent_contact_name">Parent/Guardian Name</Label>
                <Input
                  id="parent_contact_name"
                  value={formData.parent_contact_name || ''}
                  onChange={(e) => setFormData({ ...formData, parent_contact_name: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_contact_phone">Parent/Guardian Phone</Label>
                <Input
                  id="parent_contact_phone"
                  value={formData.parent_contact_phone || ''}
                  onChange={(e) => setFormData({ ...formData, parent_contact_phone: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="parent_contact_email">Parent/Guardian Email</Label>
                <Input
                  id="parent_contact_email"
                  type="email"
                  value={formData.parent_contact_email || ''}
                  onChange={(e) => setFormData({ ...formData, parent_contact_email: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isEditing ? 'Cancel' : 'Close'}
            </Button>
            {isEditing && (
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Updating...' : 'Update Student'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsDialog;