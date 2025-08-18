import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Phone, Mail, BookOpen, Save } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subjects: string[];
  classes: string[];
  branchId: string;
  role: string;
  profile_photo?: string;
}

interface TeacherDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher | null;
  isEditing: boolean;
  onTeacherUpdated?: () => void;
}

const TeacherDetailsDialog = ({ open, onOpenChange, teacher, isEditing, onTeacherUpdated }: TeacherDetailsDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Teacher>>(teacher || {});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (teacher) {
      setFormData(teacher);
    }
  }, [teacher]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher || !isEditing) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'profiles', teacher.id), {
        ...formData,
        subjects: formData.subjects?.join(',').split(',').map(s => s.trim()).filter(s => s),
        classes: formData.classes?.join(',').split(',').map(s => s.trim()).filter(s => s),
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Teacher information updated successfully.",
      });
      onTeacherUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating teacher:', error);
      toast({
        title: "Error",
        description: "Failed to update teacher. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? 'Edit Teacher' : 'Teacher Details'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update teacher information' : 'View teacher profile and details'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.profile_photo} />
                <AvatarFallback className="text-lg">
                  {formData.name?.split(' ').map(n => n[0]).join('')}
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
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <div className="flex items-center h-10">
                    <Badge variant={formData.role === 'headmaster' ? 'default' : 'secondary'} className="capitalize">
                      {formData.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Teaching Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subjects">Subjects (comma-separated)</Label>
                {isEditing ? (
                  <Input
                    id="subjects"
                    value={Array.isArray(formData.subjects) ? formData.subjects.join(', ') : formData.subjects || ''}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="e.g., Mathematics, Science, English"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(formData.subjects) ? formData.subjects : []).map((subject, idx) => (
                      <Badge key={idx} variant="outline">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="classes">Classes (comma-separated)</Label>
                {isEditing ? (
                  <Input
                    id="classes"
                    value={Array.isArray(formData.classes) ? formData.classes.join(', ') : formData.classes || ''}
                    onChange={(e) => setFormData({ ...formData, classes: e.target.value.split(',').map(s => s.trim()) })}
                    placeholder="e.g., Grade 8A, Grade 9B"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(formData.classes) ? formData.classes : []).map((cls, idx) => (
                      <Badge key={idx} variant="outline">
                        {cls}
                      </Badge>
                    ))}
                  </div>
                )}
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
                {loading ? 'Updating...' : 'Update Teacher'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherDetailsDialog;
