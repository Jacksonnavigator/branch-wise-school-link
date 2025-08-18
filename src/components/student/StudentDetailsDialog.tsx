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
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  guardian_name: string;
  guardian_email: string;
  guardian_phone: string;
  branch_id: string;
  class_id: string;
  profile_photo_url?: string;
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
      const studentRef = doc(db, 'students', student.id);
      await updateDoc(studentRef, {
        full_name: formData.full_name,
        admission_number: formData.admission_number,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        guardian_name: formData.guardian_name,
        guardian_email: formData.guardian_email,
        guardian_phone: formData.guardian_phone,
        profile_photo_url: formData.profile_photo_url,
        updated_at: new Date()
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
                <AvatarImage src={formData.profile_photo_url} />
                <AvatarFallback className="text-lg">
                  {formData.full_name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="w-full space-y-2">
                  <Label htmlFor="profile_photo_url">Profile Photo URL</Label>
                  <Input
                    id="profile_photo_url"
                    value={formData.profile_photo_url || ''}
                    onChange={(e) => setFormData({ ...formData, profile_photo_url: e.target.value })}
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
                  <Label htmlFor="class_id">Class ID</Label>
                  <Input
                    id="class_id"
                    value={formData.class_id || ''}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
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
                      onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' | 'other' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                <Label htmlFor="guardian_name">Guardian Name</Label>
                <Input
                  id="guardian_name"
                  value={formData.guardian_name || ''}
                  onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian_phone">Guardian Phone</Label>
                <Input
                  id="guardian_phone"
                  value={formData.guardian_phone || ''}
                  onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="guardian_email">Guardian Email</Label>
                <Input
                  id="guardian_email"
                  type="email"
                  value={formData.guardian_email || ''}
                  onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
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