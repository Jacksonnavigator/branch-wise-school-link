
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

      case 'accountant':
        return [
          ...baseItems,
          { name: 'Fees', href: '/fees', icon: Calendar },
          { name: 'Reports', href: '/reports', icon: FileText },
          { name: 'Settings', href: '/settings', icon: Settings }
        ];
      
      default:
        return [...baseItems, { name: 'Settings', href: '/settings', icon: Settings }];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="bg-sidebar border-r border-sidebar-border w-64 min-h-screen shadow-soft flex flex-col">
      <div className="p-6 border-b border-sidebar-border/50">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-sidebar-primary to-primary-glow bg-clip-text text-transparent">
          EduManager
        </h2>
        <p className="text-sm text-sidebar-foreground/70 mt-1 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          {branchName || 'Loading...'}
        </p>
      </div>
      
      <nav className="p-4 space-y-1 flex-1">
        {navigationItems.map((item, index) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden',
                'hover:transform hover:scale-[1.02]',
                isActive
                  ? 'bg-primary/90 text-white shadow-glow border border-primary/30 font-semibold'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground hover:shadow-soft'
              )
            }
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="relative z-10 flex items-center space-x-3">
              <item.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              <span className="font-medium">{item.name}</span>
            </div>
            {/* Hover effect background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-glow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border/30">
        <div className="p-3 glass rounded-xl border border-sidebar-border/30">
          <p className="text-xs text-sidebar-foreground/60 mb-1 font-medium uppercase tracking-wide">Current Branch</p>
          <p className="font-semibold text-sidebar-foreground text-sm">
            {profile?.role === 'admin' ? '🌍 All Branches' : `🏫 ${branchName}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
