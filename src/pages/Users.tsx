import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, User, Plus, Search, Shield, UserCheck, Calendar } from 'lucide-react';
import { collection, getDocs, orderBy, query, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserDetailsDialog } from '@/components/Users/UserDetailsDialog';

interface UserProfile {
  id: string;
  name: string;
  user_id: string;
  role: 'admin' | 'headmaster' | 'teacher' | 'parent';
  branch_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UserWithBranch extends UserProfile {
  branchName: string;
}

const UserManagement = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserWithBranch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(
          collection(db, 'profiles'),
          orderBy('created_at', 'desc')
        );
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserProfile[];
        
        // Fetch branch names for each user
        const usersWithBranches = await Promise.all(
          usersData.map(async (user) => {
            let branchName = 'No Branch Assigned';
            if (user.branch_id) {
              try {
                const branchDoc = await getDoc(doc(db, 'branches', user.branch_id));
                if (branchDoc.exists()) {
                  branchName = branchDoc.data().name;
                } else {
                  branchName = 'Branch Not Found';
                }
              } catch (error) {
                console.error('Error fetching branch:', error);
                branchName = 'Error Loading Branch';
              }
            }
            return { ...user, branchName };
          })
        );
        
        setUsers(usersWithBranches);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'headmaster': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'teacher': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'parent': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-3 w-3" />;
      case 'headmaster': return <UserCheck className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  const handleViewProfile = (user: UserProfile) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            User Management
          </h2>
          <p className="text-muted-foreground mt-2">Manage system users and roles</p>
        </div>
        <Button className="gradient-primary hover:scale-105 transition-all duration-200 shadow-soft">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card className="glass shadow-elegant border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5" />
            System Users
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Create and manage user accounts across all branches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 transition-all focus:scale-[1.02]"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="grid gap-4">
              {filteredUsers.map((user, index) => (
                <Card 
                  key={user.id} 
                  className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-fade-in border-border"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-semibold text-lg">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {user.name}
                            </h3>
                            <Badge className={`capitalize border ${getRoleColor(user.role)} flex items-center gap-1`}>
                              {getRoleIcon(user.role)}
                              {user.role}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              ID: {user.user_id.slice(-8)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                           <div className="text-sm text-muted-foreground">
                             Branch: {user.branchName}
                           </div>
                        </div>
                      </div>
                      
                       <div className="flex items-center space-x-2">
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="hover:scale-105 transition-all"
                           onClick={() => handleViewProfile(user)}
                         >
                           <User className="h-4 w-4 mr-1" />
                           View Profile
                         </Button>
                         <Button 
                           size="sm" 
                           className="gradient-primary hover:scale-105 transition-all"
                           disabled={user.role === 'admin' && profile?.role !== 'admin'}
                         >
                           Edit
                         </Button>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <div className="relative mb-6">
                <Users className="h-20 w-20 text-muted-foreground mx-auto animate-float" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-full blur-xl"></div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No Users Found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? "No users match your search criteria. Try adjusting your search terms."
                  : "Start building your user base by adding users to the system."
                }
              </p>
              {!searchTerm && (
                <Button className="gradient-primary hover:scale-105 transition-all duration-200 shadow-soft">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First User
                </Button>
              )}
            </div>
          )}
         </CardContent>
       </Card>

       <UserDetailsDialog 
         user={selectedUser}
         open={userDetailsOpen}
         onOpenChange={setUserDetailsOpen}
       />
     </div>
   );
 };
 
 export default UserManagement;