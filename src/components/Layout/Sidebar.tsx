
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import useBranchInfo from '@/hooks/useBranchInfo';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  User, 
  FileText, 
  Calendar,
  Bell,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const { user, profile } = useAuth();
  const branchName = useBranchInfo();

  if (!user) return null;

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home }
    ];

    switch (profile?.role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'Users', href: '/users', icon: Users },
          { name: 'Branches', href: '/branches', icon: FileText },
          { name: 'Analytics', href: '/analytics', icon: Calendar },
          { name: 'Settings', href: '/settings', icon: Settings }
        ];
      
      case 'headmaster':
        return [
          ...baseItems,
          { name: 'Students', href: '/students', icon: Users },
          { name: 'Teachers', href: '/teachers', icon: User },
          { name: 'Reports', href: '/reports', icon: FileText },
          { name: 'Settings', href: '/settings', icon: Settings }
        ];
      
      case 'teacher':
        return [
          ...baseItems,
          { name: 'My Students', href: '/my-students', icon: Users },
          { name: 'Results', href: '/results', icon: FileText },
          { name: 'Attendance', href: '/attendance', icon: Calendar },
          { name: 'Settings', href: '/settings', icon: Settings }
        ];
      
      case 'parent':
        return [
          ...baseItems,
          { name: 'My Children', href: '/children', icon: Users },
          { name: 'Reports', href: '/reports', icon: FileText },
          { name: 'Fees', href: '/fees', icon: Calendar },
          { name: 'Settings', href: '/settings', icon: Settings }
        ];
      
      default:
        return [...baseItems, { name: 'Settings', href: '/settings', icon: Settings }];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="bg-sidebar text-sidebar-foreground w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-sidebar-primary">EduManager</h2>
        <p className="text-sm text-sidebar-foreground/70">
          {branchName || 'Loading...'}
        </p>
      </div>
      
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 p-4 bg-sidebar-accent rounded-lg">
        <p className="text-sm text-sidebar-foreground/70 mb-2">Current Branch</p>
        <p className="font-medium text-sidebar-foreground">
          {profile?.role === 'admin' ? 'All Branches' : branchName}
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
